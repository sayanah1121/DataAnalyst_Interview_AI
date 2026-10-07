/**
 * Voice utilities: Web Speech Recognition, Audio Level Visualizer, and Text-to-Speech
 */

export interface SpeechRecognitionHook {
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

// Window type augmentation for Webkit Speech Recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export class VoiceRecorderManager {
  private recognition: any = null;
  private isListening = false;
  private onTranscriptUpdate: ((transcript: string, isFinal: boolean) => void) | null = null;
  private onErrorCallback: ((error: string) => void) | null = null;
  private onStateChange: ((listening: boolean) => void) | null = null;

  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private analyser: AnalyserNode | null = null;
  private animFrameId: number | null = null;
  private onVolumeChange: ((volume: number) => void) | null = null;

  constructor() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onstart = () => {
          this.isListening = true;
          this.onStateChange?.(true);
        };

        this.recognition.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const piece = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += piece;
            } else {
              interimTranscript += piece;
            }
          }

          if (this.onTranscriptUpdate) {
            const combined = finalTranscript || interimTranscript;
            this.onTranscriptUpdate(combined, Boolean(finalTranscript));
          }
        };

        this.recognition.onerror = (event: any) => {
          console.warn('Speech recognition event error:', event.error);
          if (event.error !== 'no-speech') {
            this.onErrorCallback?.(`Microphone error: ${event.error}`);
          }
        };

        this.recognition.onend = () => {
          this.isListening = false;
          this.onStateChange?.(false);
          this.stopAudioAnalysis();
        };
      } catch (e) {
        console.warn('SpeechRecognition initialization error:', e);
      }
    }
  }

  public isSupported(): boolean {
    return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  public async start(
    onTranscript: (text: string, isFinal: boolean) => void,
    onError: (err: string) => void,
    onState: (listening: boolean) => void,
    onVolume?: (volume: number) => void
  ) {
    this.onTranscriptUpdate = onTranscript;
    this.onErrorCallback = onError;
    this.onStateChange = onState;
    this.onVolumeChange = onVolume || null;

    if (!this.recognition) {
      onError('Speech Recognition is not supported in this browser. You can still type your answers.');
      return;
    }

    try {
      this.recognition.start();
      // Also start volume meter
      await this.startAudioAnalysis();
    } catch (err: any) {
      console.warn('Failed to start speech recognition:', err);
      // Already running?
      if (err.message && err.message.includes('already started')) {
        this.isListening = true;
        onState(true);
      } else {
        onError(err.message || 'Could not start microphone');
      }
    }
  }

  public stop() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.warn('Error stopping recognition:', e);
      }
    }
    this.isListening = false;
    this.onStateChange?.(false);
    this.stopAudioAnalysis();
  }

  private async startAudioAnalysis() {
    try {
      if (!navigator.mediaDevices?.getUserMedia) return;
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 64;
      source.connect(this.analyser);

      const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      const updateVolume = () => {
        if (!this.analyser || !this.isListening) return;
        this.analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const normalized = Math.min(100, Math.round((avg / 128) * 100));
        this.onVolumeChange?.(normalized);
        this.animFrameId = requestAnimationFrame(updateVolume);
      };
      updateVolume();
    } catch (e) {
      // Audio meter optional
      console.warn('Could not initialize audio visualizer stream:', e);
    }
  }

  private stopAudioAnalysis() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        this.audioContext.close();
      } catch (e) {
        // ignore
      }
      this.audioContext = null;
    }
    this.onVolumeChange?.(0);
  }
}

// Global Text-to-Speech player
let currentAudioElement: HTMLAudioElement | null = null;

export async function speakText(
  text: string,
  options?: {
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: any) => void;
  }
): Promise<() => void> {
  // Cancel any running speech
  stopSpeech();

  // Try Gemini TTS first via backend
  try {
    const res = await fetch('/api/interview/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text.slice(0, 1000) }) // safety limit
    });

    if (res.ok) {
      const data = await res.json();
      if (data.audioBase64) {
        const audio = new Audio(`data:audio/wav;base64,${data.audioBase64}`);
        currentAudioElement = audio;

        audio.onplay = () => options?.onStart?.();
        audio.onended = () => {
          currentAudioElement = null;
          options?.onEnd?.();
        };
        audio.onerror = () => {
          fallbackSpeechSynthesis(text, options);
        };

        await audio.play();
        return () => stopSpeech();
      }
    }
  } catch (e) {
    console.warn('Backend TTS failed, falling back to Web Speech API:', e);
  }

  // Fallback to browser SpeechSynthesis
  return fallbackSpeechSynthesis(text, options);
}

function fallbackSpeechSynthesis(
  text: string,
  options?: {
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: any) => void;
  }
): () => void {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    options?.onError?.(new Error('Speech Synthesis not supported'));
    return () => {};
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 1.0;
  utterance.pitch = 1.0;

  // Pick a natural English voice if available
  const voices = window.speechSynthesis.getVoices();
  const preferredVoice = voices.find(
    v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Daniel'))
  );
  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  utterance.onstart = () => options?.onStart?.();
  utterance.onend = () => options?.onEnd?.();
  utterance.onerror = (e) => options?.onError?.(e);

  window.speechSynthesis.speak(utterance);

  return () => {
    window.speechSynthesis.cancel();
  };
}

export function stopSpeech() {
  if (currentAudioElement) {
    try {
      currentAudioElement.pause();
      currentAudioElement.currentTime = 0;
    } catch (e) {}
    currentAudioElement = null;
  }
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}
