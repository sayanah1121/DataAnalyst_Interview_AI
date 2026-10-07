import { BehavioralQuestion } from '../types/interview';

export const DEFAULT_BEHAVIORAL_QUESTIONS: BehavioralQuestion[] = [
  {
    id: 'beh-conflict-priorities-1',
    category: 'conflict',
    categoryLabel: 'Prioritization & Stakeholders',
    difficulty: 'mid',
    title: 'Handling Conflicting Stakeholder Priorities',
    question: 'Tell me about a time you handled conflicting priorities between multiple stakeholders who all demanded urgent analytics support.',
    contextWhyAsked: 'Interviewers ask this to test your boundary setting, impact-driven prioritization framework, and ability to manage cross-functional expectations without burning out or compromising data accuracy.',
    starTips: {
      situation: 'Describe the competing requests (e.g., Marketing needing campaign attribution vs. Finance needing quarterly cohort forecasting) with impending deadlines.',
      task: 'Your responsibility to evaluate business urgency, potential revenue impact, and align both leaders without creating friction.',
      action: 'What objective framework did you use? (e.g. ICE/RICE scoring, sizing business risk, meeting both stakeholders openly, proposing phased deliverables, or creating a self-serve dashboard).',
      result: 'Quantified outcome: Both deadlines met, 30% time saved via self-service, stakeholder satisfaction score, and a newly established analytics intake process.'
    },
    sampleAnswerScript: `In my previous role at a growth-stage e-commerce platform, I experienced a week where the VP of Growth urgently requested a 48-hour deep-dive into paid influencer ROAS, while the Head of Finance concurrently demanded finalized customer cohort retention tables for the board audit due the same Friday. Both framed their request as P0.

Instead of trying to work 16-hour days and risking data errors, I immediately set up a quick 15-minute sync with both leaders. I brought transparency to the table by outlining the engineering effort: each task required roughly 18 hours of focused querying and validation. I evaluated the business impact: the board deck had a hard regulatory deadline with executive exposure, whereas the growth campaign had already run and the spend reallocation decisions were scheduled for the following Tuesday.

I proposed a collaborative solution: I delivered an initial automated slice of the influencer data using our existing dbt attribution model within 3 hours to unblock the marketing team's immediate high-level check, committed to delivering the full financial cohort audit by Thursday afternoon, and scheduled the detailed marketing incrementality analysis for Friday morning. Both stakeholders felt heard, the board audit received zero discrepancies, and this experience inspired me to establish our company's first Jira-based Analytics Intake SLA scoring system.`,
    keyTakeaways: [
      'Never silently say yes to both and deliver rushed, flawed numbers.',
      'Bring both stakeholders into the loop transparently with objective business trade-offs.',
      'Offer phased deliverables or high-level unblockers rather than an outright rejection.',
      'Show lasting systemic impact (e.g., introducing an analytics intake SLA or self-serve model).'
    ]
  },
  {
    id: 'beh-challenging-project-1',
    category: 'challenging_project',
    categoryLabel: 'End-to-End Analytics Execution',
    difficulty: 'senior',
    title: 'A Challenging Data Analysis Project',
    question: 'Describe a challenging data analysis project you worked on from raw, messy data all the way to executive presentation. What roadblocks did you encounter and how did you overcome them?',
    contextWhyAsked: 'Assesses end-to-end technical resilience, data cleaning grit, analytical skepticism, and business storytelling to senior executives.',
    starTips: {
      situation: 'Highlight an ambiguous or high-stakes business problem with severely degraded, fragmented, or siloed data sources.',
      task: 'Explain your mandate: what hypothesis were you testing or what strategic decision depended on this output?',
      action: 'Detail the technical hurdles (e.g., deduplicating event logs, reconciling Stripe vs internal DB discrepancies, missing user IDs) and how you solved them mathematically and systematically.',
      result: 'Concrete business impact: Millions saved, conversion lifted, churn mitigated, or executive strategy transformed.'
    },
    sampleAnswerScript: `At my previous company, our executive team was baffled by why our reported Gross Merchandise Value was growing by 22% quarter-over-quarter, yet net operating cash flow was declining. I was tasked with investigating product-level unit economics across 4 million annual transactions.

The core challenge was data fragmentation. Our transactional database in PostgreSQL didn't talk cleanly to our third-party logistics fulfillment logs or Zendesk refund records. Furthermore, 12% of refund events lacked foreign keys back to original order IDs due to a legacy checkout bug.

To solve this, I first authored a fuzzy-matching and time-window CTE algorithm in Snowflake to probabilistically link unmapped returns by customer hash and transaction timestamp within a 30-day window, achieving a 94% match rate verified against a manual audit sample. Next, I engineered a comprehensive Net Margin Metric Tree that accounted for shipping surcharges, return shipping costs, and customer support ticket overhead.

When I visualized the metric waterfall for the executive team, the root cause was stark: a recently promoted fast-fashion category had a 41% return rate that cost $14 more per return than the gross margin earned. Based on my recommendation, the COO restructured the return policy and increased minimum order thresholds for that category, which recovered $1.8 million in annualized margin within two quarters.`,
    keyTakeaways: [
      'Choose a project where you solved real data ambiguity and technical friction.',
      'Highlight verification steps (e.g., auditing sample records to validate your algorithmic match rate).',
      'Tie analytical findings directly to a strategic executive decision and hard dollar metrics.'
    ]
  },
  {
    id: 'beh-pushback-intuition-1',
    category: 'pushback',
    categoryLabel: 'Data Truth & Executive Pushback',
    difficulty: 'senior',
    title: 'Contradicting Senior Executive Intuition',
    question: 'Tell me about a time your data analysis contradicted a senior leader’s strong intuition or hypothesis. How did you navigate that conversation and deliver the findings diplomatically?',
    contextWhyAsked: 'Data analysts often discover uncomfortable truths. Hiring managers want to see that you uphold data truth without alienating executives or becoming defensive.',
    starTips: {
      situation: 'A senior executive (e.g., VP of Product or CMO) had a pet project or championed a feature they believed was a huge success.',
      task: 'Your analysis revealed that the feature was neutral, cannibalizing another channel, or actively hurting retention.',
      action: 'How did you validate your methodology to ensure zero errors? How did you frame the private 1-on-1 preview so they were not blindsided in public?',
      result: 'Executive accepted findings, avoided a multi-million dollar mistake, and respected your analytical integrity.'
    },
    sampleAnswerScript: `Our VP of Product spent six months championing a new AI-driven product recommendation carousel on our checkout flow, anticipating it would drive a 15% increase in Average Order Value. When I ran our 3-week A/B test analysis, the overall AOV was flat, and worse, mobile checkout completion dropped by 3.8% because the additional DOM elements caused an 800ms rendering lag on mobile devices.

Before sharing this in the cross-functional sprint review, I knew that blindsiding a senior leader in public destroys trust. First, I stress-tested my analysis: I checked for Sample Ratio Mismatch, examined sub-cohorts across device types and connection speeds, and had a senior peer double-check my queries. 

Next, I booked a private 20-minute 1-on-1 with the VP. Instead of saying 'your feature hurt checkout,' I framed the narrative around user experience and mobile performance: 'The recommendation engine shows strong user curiosity, but latency on cellular networks is creating friction at the critical pay button.' I showed videos of the network waterfall alongside conversion curves.

Because I treated the analysis as an optimization opportunity rather than a personal failure, the VP enthusiastically agreed to pause the mobile rollout and directed engineering to optimize payload latency before re-testing. That diplomatic approach saved an estimated $450,000 in abandoned mobile orders each month while keeping the team aligned.`,
    keyTakeaways: [
      'Double check your methodology and queries before delivering unexpected bad news.',
      'Never blindside a stakeholder in front of peers or leadership.',
      'Separate the leader\'s original intent from the operational impediment (e.g. latency vs feature value).',
      'Always come with a constructive forward-looking recommendation.'
    ]
  },
  {
    id: 'beh-communication-stats-1',
    category: 'communication',
    categoryLabel: 'Technical Storytelling & Simplification',
    difficulty: 'mid',
    title: 'Explaining Complex Stats to Non-Technical Stakeholders',
    question: 'How do you explain complex statistical concepts (such as p-values, confidence intervals, or selection bias) to non-technical stakeholders?',
    contextWhyAsked: 'Tests communication clarity, empathy, and ability to translate statistical nuance into confident business decisions without alienating the listener with academic jargon.',
    starTips: {
      situation: 'A product manager, marketing director, or executive who was confused or misinterpreting statistical test results.',
      task: 'Your goal to explain the concept simply without dumbing it down to the point of losing truth.',
      action: 'The analogies, visual frameworks, or decision trees you used to convey the concept intuitively.',
      result: 'Stakeholder understood the concept, made an informed decision, and adopted your communication framework.'
    },
    sampleAnswerScript: `In my last role, our marketing director observed that our email subject line variant had a p-value of 0.04 after just 48 hours and announced to the team that 'there is a 96% chance this variant is better and will make us more money.'

I knew that lecturing them on the null hypothesis or Type I error would be counterproductive and pedantic. Instead, I scheduled a casual coffee chat and used a coin-toss analogy. I explained: 'Imagine flipping a normal coin four times and getting four heads in a row. It seems lucky, but it easily happens by pure chance. A p-value of 0.04 means that if our new email was completely identical in quality to the old one, we would still see a spike this lucky about 4 out of 100 times due to randomness. Furthermore, we haven't collected enough volume to capture weekend reading habits yet.'

I then translated the confidence interval into business risk: 'Right now, our 95% confidence interval shows the true lift could be anywhere from negative 1% to positive 8%. If we wait another 5 days to reach our pre-calculated sample size, that range narrows so we can be confident we won't accidentally decrease overall revenue.'

The director appreciated the concrete framing and agreed to let the test run its full 14-day duration. They even asked me to present that coin-flip analogy in our monthly marketing onboarding deck.`,
    keyTakeaways: [
      'Use relatable, visual analogies (like coin flips or weather forecasts).',
      'Translate abstract statistical thresholds into tangible business risks and financial ranges.',
      'Maintain intellectual humility without being condescending or academic.'
    ]
  }
];
