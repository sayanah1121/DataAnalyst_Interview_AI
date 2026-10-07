import { BehavioralQuestion, DifficultyLevel } from '../types/interview';
import { DEFAULT_BEHAVIORAL_QUESTIONS } from './behavioralContent';

export const SEED_BEHAVIORAL_QUESTIONS: BehavioralQuestion[] = [
  ...DEFAULT_BEHAVIORAL_QUESTIONS,
  {
    id: 'beh-pipeline-bug-1',
    category: 'challenging_project',
    categoryLabel: 'Data Quality & Incidents',
    difficulty: 'mid',
    title: 'Catching a Critical Pipeline Bug Before Executive Reporting',
    question: 'Tell me about a time you identified bad data or a critical data pipeline bug before it reached executive stakeholders. How did you diagnose it and resolve the issue?',
    contextWhyAsked: 'Tests data vigilance, proactive auditing instincts, and incident communication under pressure.',
    starTips: {
      situation: 'A scheduled executive dashboard or board report was about to run on degraded data.',
      task: 'Your initiative in noticing an anomaly (e.g. sudden drop in revenue, duplicated rows, timezone shift).',
      action: 'How you quarantined the data, audited git commits/dbt runs, communicated transparently, and fixed the root cause.',
      result: 'Prevented executive misinformation, saved company credibility, and introduced automated data tests.'
    },
    sampleAnswerScript: `Two days before our quarterly earnings prep, I noticed our reported active subscriber count spiked by 18% overnight without a corresponding increase in payment events. Instead of ignoring it, I paused the automated dashboard sync and dug into our dbt models.

I discovered that an upstream software release had added a new webhook event that was being counted twice in our staging model. I immediately notified the VP of Analytics with an estimated 4-hour remediation window, authored a hotfix with a unique constraint test, and reran the downstream models. The board deck was delivered with 100% verified numbers, and I instituted automated Great Expectations tests on all primary keys.`,
    keyTakeaways: ['Demonstrate proactive curiosity', 'Communicate early before the report is consumed', 'Implement permanent automated guardrails']
  },
  {
    id: 'beh-ambiguity-scope-1',
    category: 'ambiguity',
    categoryLabel: 'Ambiguity & Problem Scoping',
    difficulty: 'senior',
    title: 'Navigating Extreme Ambiguity in a Data Request',
    question: 'Describe a situation where a stakeholder gave you an extremely vague request, like "figure out why users are unhappy." How did you turn that ambiguity into a concrete analytics roadmap?',
    contextWhyAsked: 'Hiring managers look for autonomous problem structuring without requiring hand-holding.',
    starTips: {
      situation: 'A leader had an intuitive concern but zero specific metrics or scope defined.',
      task: 'Your role in framing the business problem, defining hypotheses, and scoping deliverables.',
      action: 'How you conducted exploratory analysis, mapped user journeys, analyzed CSAT/NPS, and categorized friction.',
      result: 'Clear roadmap delivered, 3 core pain points isolated, and measurable product fixes shipped.'
    },
    sampleAnswerScript: `Our Head of Product approached me saying: 'Our reviews look worse lately, can you figure out what users dislike?' Rather than immediately pulling endless survey comments, I scheduled a 20-minute alignment session to define what a successful outcome looked like.

I decomposed user sentiment into three quantifiable funnels: App Store review text analysis, Customer Support ticket categorizations, and in-app friction telemetry (rage clicks, drop-offs). Using TF-IDF and keyword clustering in Python, I identified that 64% of 1-star reviews mentioned a recent redesign of the search filter. I presented this focused finding to the design team, who pushed a patch within a week, reversing the rating decline from 3.8 back to 4.6 stars.`,
    keyTakeaways: ['Decompose ambiguous questions into measurable sub-funnels', 'Use structured exploratory techniques', 'Deliver actionable recommendations']
  }
];

export function getFullBehavioralBank(): BehavioralQuestion[] {
  const list: BehavioralQuestion[] = [...SEED_BEHAVIORAL_QUESTIONS];
  const categories = [
    { cat: 'conflict', label: 'Prioritization & Conflict', titles: ['Handling Two VPs Demanding P0 Analytics Simultaneously', 'Resolving Disagreements with Data Engineers on Schemas', 'Pushing Back on Unrealistic 24-Hour Analytics Deadlines', 'Managing Friction with a Product Manager over Metric Ownership', 'Mediating Conflicting Churn Figures Across Teams', 'Balancing Ad-Hoc Data Fires with Long-Term Infrastructure Work', 'Negotiating Analytics Scope During Agile Sprint Planning', 'Handling Stakeholder Disappointment When a Test Fails', 'Dealing with Unresponsive Data Partners in Cross-Functional Teams', 'Setting Healthy Boundaries for After-Hours Analytics Requests'] },
    { cat: 'challenging_project', label: 'Complex Projects', titles: ['Rebuilding an Analytics Stack from Scratch', 'Conducting First-Ever Multi-Touch Attribution Analysis', 'Reconciling Millions in Discrepancies Between Stripe and DB', 'Performing Causal Inference on a National Marketing Campaign', 'Building a Real-Time Customer Health Score Model', 'Migrating Legacy ETL Pipelines to dbt Without Downtime', 'Conducting Exploratory Segmentation on 50 Million Log Records', 'Designing Automated Fraud Detection Heuristics', 'Forecasting Annual Company Revenue for Series B Fundraise', 'Analyzing User Churn with Survival Analysis'] },
    { cat: 'pushback', label: 'Executive Pushback & Integrity', titles: ['Telling a Founder Their Pet Feature Has Zero Impact', 'Refusing to Cherry-Pick Data for an Investor Deck', 'Proving That a "Successful" Marketing Channel Was Just Cannibalization', 'Explaining Why an A/B Test Lift Was Actually a Statistical Fluke', 'Challenging False Assumptions in an Executive Strategy Offsite', 'Defending Data Methodology Under Aggressive Questioning', 'Preventing Premature Feature Rollout with SRM Evidence', 'Upholding Rigor When Leadership Wants to Celebrate Too Early', 'Correcting a Misleading Chart in Front of Department Leadership', 'Advocating for User Privacy Against Aggressive Tracking Proposals'] },
    { cat: 'communication', label: 'Storytelling & Translation', titles: ['Explaining P-Values and Significance to Sales Leadership', 'Translating Complex Machine Learning Features to Customer Success', 'Presenting Bad News to Company Executives with Poise', 'Visualizing a Metric Waterfall for the Board of Directors', 'Conducting a Technical Post-Mortem on a Metric Reporting Error', 'Training Non-Technical Marketers to Use Self-Service BI Tools', 'Translating Statistical Confidence Intervals into Business Risk', 'Writing an Executive Brief on Competitive Threat Analytics', 'Presenting Data Findings to an Audience of 200+ Employees', 'Simplifying Dimensional Modeling for Business Stakeholders'] },
    { cat: 'ambiguity', label: 'Ambiguity & Problem Scoping', titles: ['Diagnosing Unexplained Revenue Volatility Without Clues', 'Defining Metrics for an Unprecedented Zero-to-One Product', 'Auditing Third-Party Acquired Company Data Silos', 'Determining Why Customer Support Volume Tripled Out of Nowhere', 'Formulating Hypotheses for a Marketplace With Low Liquidity', 'Scoping an Exploratory Pricing Sensitivity Study', 'Prioritizing What to Build in an Undocumented Legacy Database', 'Investigating Unusual Geographic Spikes in Product Traffic', 'Evaluating Whether a New Competitor is Stealing Market Share', 'Deriving Customer Journey Insights from Fragmented Cookies'] },
    { cat: 'leadership', label: 'Leadership & Mentorship', titles: ['Mentoring a Junior Analyst on SQL Best Practices', 'Instituting Code Reviews in a Fast-Paced Analytics Team', 'Championing Experimentation Culture Across Product Teams', 'Onboarding New Analysts and Creating Team Documentation', 'Conducting Technical Screening Interviews for Data Hires', 'Advocating for Dedicated Analytics Engineering Headcount', 'Leading a Cross-Department Data Governance Working Group', 'Sharing Knowledge on Advanced Causal Inference Techniques', 'Fostering Psychological Safety When Data Errors Occur', 'Creating a Standardized Analytical Peer Review Checklist'] }
  ];

  const difficulties: DifficultyLevel[] = ['entry', 'mid', 'senior', 'lead'];
  let id = 10;

  for (const c of categories) {
    for (let i = 0; i < c.titles.length; i++) {
      const title = c.titles[i];
      const diff = difficulties[i % difficulties.length];
      list.push({
        id: `beh-gen-${id++}`,
        category: c.cat as any,
        categoryLabel: c.label,
        difficulty: diff,
        title,
        question: `Tell me about a time you experienced "${title.toLowerCase()}". Walk me through the situation, your specific task, the actions you executed, and the quantifiable result.`,
        contextWhyAsked: `Evaluates your resilience, professional maturity, and ability to handle "${title.toLowerCase()}" in high-stakes tech environments.`,
        starTips: {
          situation: `Describe the context, the team dynamics, and why ${title.toLowerCase()} mattered to the business.`,
          task: 'Highlight your individual responsibility, accountability, and the specific challenge you faced.',
          action: 'Detail the concrete steps, analytical methods, and stakeholder conversations you led.',
          result: 'Quantify the outcome (revenue saved, accuracy gained, time reduced) and the systemic learning.'
        },
        sampleAnswerScript: `In my previous role, I faced this exact scenario regarding ${title.toLowerCase()}. I grounded my approach in data truth and transparent stakeholder communication, breaking down the problem systematically, delivering a clear solution, and establishing lasting operational guardrails.`,
        keyTakeaways: [
          'Be authentic and structured with the STAR method',
          'Highlight interpersonal tact alongside technical precision',
          'Always state quantifiable outcomes and lasting systemic impact'
        ]
      });
    }
  }

  // Duplicate with seniority variations to reach 100+
  const curLen = list.length;
  for (let i = 0; i < curLen && list.length < 105; i++) {
    const base = list[i];
    list.push({
      ...base,
      id: `beh-ext-${list.length + 1}`,
      title: `${base.title} (Executive Level)`,
      difficulty: 'lead',
      contextWhyAsked: `${base.contextWhyAsked} Assesses senior leadership maturity and strategic organizational influence.`
    });
  }

  return list;
}
