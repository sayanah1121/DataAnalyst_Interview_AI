import { DataCaseStudy, DifficultyLevel } from '../types/interview';
import { DEFAULT_CASE_STUDIES } from './caseStudyContent';

export const SEED_CASE_STUDIES: DataCaseStudy[] = [
  ...DEFAULT_CASE_STUDIES,
  {
    id: 'case-fintech-fraud-1',
    title: 'Fintech Instant Payout Fraud Surge & Reserve Drain',
    difficulty: 'senior',
    industry: 'Fintech & Payments',
    businessProblem: `You are the Senior Analyst for a fast-growing digital neobank offering Instant Payouts to gig economy workers. Over the past 14 days, unauthorized chargeback rates surged from 0.4% to 2.8%, threatening suspension by Visa/Mastercard networks. The VP of Risk wants to freeze all instant transfers immediately, while the Chief Growth Officer warns that shutting down instant payouts will cause a 40% loss of daily active users to competing fintech apps.`,
    executiveQuestions: [
      'What specific behavioral signatures distinguish fraudulent accounts from legitimate power users?',
      'Is the fraud concentrated in specific BIN ranges, device fingerprints, or account age cohorts?',
      'How do you design a tiered risk velocity rule that blocks 85%+ of fraudulent transfers while keeping false-positive declines for legitimate users below 1%?'
    ],
    datasetDescription: {
      tables: [
        {
          name: 'payout_transfers',
          description: 'Instant transfer attempts, debit card hashes, IP addresses, and settlement status.',
          columns: [
            { name: 'transfer_id', type: 'INT', notes: 'Primary key' },
            { name: 'user_id', type: 'VARCHAR(32)', notes: 'Account identifier' },
            { name: 'amount', type: 'DECIMAL(10,2)', notes: 'Transfer amount' },
            { name: 'ip_address', type: 'VARCHAR(45)', notes: 'Client IP' },
            { name: 'device_fingerprint', type: 'VARCHAR(64)', notes: 'Device hash' },
            { name: 'bin_number', type: 'VARCHAR(6)', notes: 'Bank Identification Number' },
            { name: 'is_chargeback', type: 'BOOLEAN', notes: 'Chargeback dispute filed' }
          ],
          sampleRows: [
            [901, 'usr_881', 450.00, '192.168.1.1', 'dev_a982', '411111', true],
            [902, 'usr_882', 50.00, '10.0.0.1', 'dev_b123', '422222', false]
          ],
          dataQualityNotes: [
            'VPN and Tor exit nodes mask genuine IP addresses for 12% of records.',
            'Chargeback dispute status has an average reporting lag of 5-10 business days.'
          ]
        }
      ]
    },
    suggestedSteps: {
      dataCleaning: ['Extract country and ASN from IP addresses', 'Calculate account age at transfer time'],
      edaAndMetrics: ['Analyze chargeback rate by BIN number, device reuse, and velocity', 'Build precision-recall curves'],
      statisticalTechniques: ['Supervised logistic regression / Random Forest classifier', 'Isolation Forest for anomaly detection'],
      recommendations: ['Enforce 3DS authentication for cards with new device fingerprints', 'Cap first-day transfers to $100']
    },
    benchmarkSolution: {
      dataCleaningPlan: 'Enrich transfer records with MaxMind IP ASN metadata. Flag emulator device fingerprints and create velocity aggregations (transfers per device in past 6 hours).',
      analysisApproach: 'Identified a coordinated card-testing syndicate cycling stolen debit card BINs across emulated Android devices. 92% of fraudulent volume came from accounts created under 48 hours ago using prepaid card BINs.',
      keyMetricsAndFindings: 'Fraud was not widespread across legitimate users; 88% of chargebacks originated from three prepaid card BINs coupled with proxy IP addresses.',
      executiveRecommendations: '1. Institute a mandatory 72-hour holding period or $50 cap for newly linked debit cards. 2. Implement automated device velocity blocks for >3 accounts per device. 3. Avoid a global freeze, preserving $18M in legitimate transfer volume.',
      monitoringGuardrails: 'Real-time alert triggered when hourly chargeback rate on any card BIN exceeds 1.2%.'
    }
  }
];

export function getFullCaseStudiesBank(): DataCaseStudy[] {
  const caseStudies: DataCaseStudy[] = [...SEED_CASE_STUDIES];
  const industryScenarios = [
    { ind: 'Marketplace & Mobility', titles: ['Ride-Hailing Surge Pricing Elasticity & Rider Churn', 'Food Delivery Late-Arrival Spikes & Driver Reallocation', 'Vacation Rental Host Cancellation Penalties & Booking Health', 'Courier Incentive Optimization During Inclement Weather', 'Marketplace Liquidity Balance Across Urban Core vs Suburbs', 'Two-Sided Ratings Inflation & Superhost Quality Decay', 'Driver Churn within First 30 Days of Onboarding', 'Dynamic Dispatch Radius Optimization to Reduce Idle Time', 'Airport Queue Stacking & Supply Deadheading Analysis', 'Promotional Voucher Abuse Across Multi-Accounting Users'] },
    { ind: 'Fintech & Neobanking', titles: ['Buy Now Pay Later (BNPL) Default Prediction & Credit Limits', 'Cryptocurrency Deposit AML Anomaly & Regulatory Compliance', 'Card Interchange Revenue Optimization Across Merchant Categories', 'SME Business Credit Line Underwriting Using Bank Plaid Logs', 'Cross-Border Remittance FX Spread Sensitivity & Volume Drops', 'High-Yield Savings Account Deposit Churn Post-Interest Rate Cut', 'Stock Trading App Commission-Free Order Flow Analysis', 'Payroll Advance Repayment Velocity & Involuntary Churn', 'Credit Card Reward Point Gamification & Merchant Arbitrage', 'ATM Surcharge Reimbursement Cost Escalation in Neobanks'] },
    { ind: 'Streaming Media', titles: ['Subscription Video-on-Demand (SVOD) Binge Churn Post-Season Finale', 'Audio Streaming Playlist Recommendation Diversity vs Fatigue', 'Live Sports Concurrent Stream Concurrency & CDN Degradation', 'Podcast Ad Insertion Fill Rate & Listener Drop-Off Points', 'Family Plan Password Sharing Detection & Monetization Model', 'Content Licensing Acquisition ROI & Long-Tail Catalog Utilization', 'Mobile Video Playback Buffering & Churn Survival Analysis', 'Free Tier Ad-Supported (FAST) Viewer Retention & CPM Yield', 'Smart TV App Navigation Friction & Search-to-Play Conversion', 'International Dubbing Quality & Localized Viewer Engagement'] },
    { ind: 'Gaming & Interactive', titles: ['Free-to-Play (F2P) Gacha Loot Box Drop Rate Transparency & LTV', 'Battle Pass Season Progression Fatigue & D30 Retention Drop', 'Mobile Game Level 7 Choke Point & Player Rage-Quit Analysis', 'In-App Purchase Price Elasticity in Emerging Markets', 'Cheating & Aim-Bot Detection in Competitive Multiplayer Rank', 'Guild Social Bonding & Impact on Long-Term User Retention', 'Push Notification Frequency Optimization Without Uninstalls', 'Ad Reward Video Fatigue & In-Game Economy Inflation', 'Seasonal Live-Ops Event ROI & Player Burnout Metrics', 'User Acquisition Campaign ROAS Decay on Privacy-First iOS'] },
    { ind: 'Healthcare & HealthTech', titles: ['Telehealth Consultation Wait Time & No-Show Rate Reduction', 'Continuous Glucose Monitor (CGM) Engagement & Habit Formation', 'Pharmacy Prescription Refill Adherence & Reminder Optimization', 'Clinical Trial Patient Retention & Drop-Out Risk Prediction', 'Mental Health App Journaling Completion & CSAT Metrics', 'Electronic Health Record (EHR) Billing Coding Discrepancies', 'Doctor Schedule Utilization & Peak Cancellation Overbooking', 'Wearable Sleep Score Anomaly Detection & False Positives', 'Health Insurance Prior Authorization Turnaround Time SLAs', 'Preventative Care Screening Gaps in Underserved Patient Cohorts'] },
    { ind: 'E-Commerce & D2C', titles: ['Cart Abandonment Optimization & Checkout Latency', 'Free Shipping Threshold Lift on Average Order Value (AOV)', 'Return Merchandise Authorization (RMA) Rate in Fast-Fashion', 'Subscription Box Cancellation Post-Promotional Month', 'Influencer Marketing Attribution & Incrementality Holdout', 'Out-of-Stock Substitute Recommendation Conversion', 'Review Star Rating Degradation & Merchant Quality Audits', 'Loyalty Tier Points Expiration & Customer Reactivation', 'Search Typo Tolerance & Zero-Result Query Rate in Catalog', 'Post-Purchase Upsell Modal Conversion vs Buyer Regret'] },
    { ind: 'EdTech & Learning', titles: ['Online Course Completion Drop-off at Week 3 Milestone', 'Language Learning Daily Streak Gamification & Skill Retention', 'K-12 Student Quiz Engagement & Difficulty Calibration', 'University Degree Bootcamp Placement Rate Transparency', 'Subscription Tutoring Matching Algorithm & Student Rehire Rate', 'Certificate Value Perception & Social Sharing Virality', 'Free Trial Lesson-to-Annual Plan Conversion Latency', 'Interactive Coding Sandbox Browser Error Rates & Student Drop', 'Teacher Remuneration Tiers & Classroom Engagement Metrics', 'Corporate B2B Employee Learning Utilization & Seat Waste'] },
    { ind: 'Logistics & Supply Chain', titles: ['Last-Mile Delivery Route Optimization & Fuel Surcharge Volatility', 'Warehouse Fulfillment Picking Latency & Stock Discrepancies', 'Fleet Truck Maintenance Downtime & Sensor Anomaly Early Warning', 'Port Container Dwell Time & Demurrage Penalty Cost Audits', 'Cross-Docking Transfer Delay Root Cause in Cold Chain Transport', 'Carrier On-Time Delivery Performance SLA Penalties', 'Packaging Dimensional Weight Overcharge Reconciliation', 'Seasonal Peak Holiday Warehouse Overtime Scheduling Optimization', 'Damaged in Transit Claim Velocity by Product Fragility Tier', 'Reverse Logistics Return Consolidation Center Cost Efficiency'] },
    { ind: 'AdTech & Attribution', titles: ['Multi-Touch Attribution Discrepancies in Privacy Sandboxes', 'Click Fraud & Bot Traffic in Programmatic Display Ad Exchanges', 'Header Bidding Auction Latency & Publisher Ad Revenue Loss', 'Lookalike Audience Expansion Efficiency & CAC Degradation', 'Connected TV (CTV) Ad Viewability & Completion Rate Audits', 'Mobile App Install Postback Fraud in Affiliate Networks', 'Retargeting Frequency Capping & Ad Blindness Fatigue', 'Cost Per Incremental Acquisition (CPIA) Geo-Holdout Modeling', 'Ad Creative Asset Lifespan & Creative Fatigue Decay Rate', 'Brand Lift Survey Sample Ratio Bias & Weighting Corrections'] },
    { ind: 'B2B Enterprise SaaS', titles: ['Product-Led Growth (PLG) Free-to-Enterprise PQL Qualification', 'Sales-Assisted Contract Expansion Velocity in Seat Downgrades', 'Customer Success Health Score Predictive Power on Churn', 'SSO & Enterprise Security Feature Gate Upgrade Elasticity', 'API Rate Limiting Enforcement & Developer Platform Churn', 'Quarterly Active Users (QAU) Degradation in Multi-Seat Orgs', 'Implementation Onboarding Time-to-Value (TTV) & Year 1 Churn', 'Feature Sunset Deprecation Impact on Core Account Retention', 'Support Ticket Escalation to Executive Sponsor Churn Correlation', 'White-Label Partner Margin Cannibalization in SaaS Ecosystems'] }
  ];

  const difficulties: DifficultyLevel[] = ['entry', 'mid', 'senior', 'lead'];
  let id = 10;

  for (const group of industryScenarios) {
    for (let i = 0; i < group.titles.length; i++) {
      const title = group.titles[i];
      const diff = difficulties[i % difficulties.length];
      caseStudies.push({
        id: `case-gen-${id++}`,
        title,
        difficulty: diff,
        industry: group.ind,
        businessProblem: `You are the lead analytics consultant assessing "${title}". The executive leadership team has uncovered significant variance in performance metrics and requires a rigorous, data-driven diagnostic report.`,
        executiveQuestions: [
          `What are the leading behavioral indicators driving ${title.toLowerCase()}?`,
          'How do you isolate true causality from confounding seasonality and external shifts?',
          'What high-ROI executive interventions should leadership execute within the next 30 days?'
        ],
        datasetDescription: {
          tables: [
            {
              name: 'primary_events',
              description: `Primary transaction and behavioral logs for ${title.toLowerCase()}.`,
              columns: [
                { name: 'event_id', type: 'INT', notes: 'Primary key' },
                { name: 'entity_id', type: 'VARCHAR(32)', notes: 'User or account identifier' },
                { name: 'timestamp', type: 'TIMESTAMP', notes: 'Event occurrence time' },
                { name: 'metric_value', type: 'DECIMAL(12,2)', notes: 'Core value metric' },
                { name: 'status', type: 'VARCHAR(16)', notes: 'Status code' }
              ],
              sampleRows: [
                [101, 'ent_884', '2024-06-01 12:00:00', 1250.00, 'COMPLETED'],
                [102, 'ent_885', '2024-06-01 12:05:00', 420.00, 'FLAGGED']
              ],
              dataQualityNotes: [
                'Timezone discrepancies across server regions.',
                'Missing foreign key references on 3% of legacy entries.'
              ]
            }
          ]
        },
        suggestedSteps: {
          dataCleaning: ['Audit null timestamps and filter out synthetic test transactions.', 'Normalize metric values across normalized entity cohorts.'],
          edaAndMetrics: ['Calculate cohort retention and funnel micro-conversions.', 'Plot time-series decomposition to isolate day-of-week seasonality.'],
          statisticalTechniques: ['Apply survival analysis or logistic regression to identify hazard indicators.', 'Perform hypothesis testing on control vs treatment cohorts.'],
          recommendations: ['Deploy automated monitoring guardrails.', 'Reallocate commercial resources to high-intent segments.']
        },
        benchmarkSolution: {
          dataCleaningPlan: `Cleanse and reconcile primary_events. Filter out anomalous outliers beyond 3 standard deviations and address telemetry gaps using rolling median interpolation.`,
          analysisApproach: `Decompose primary drivers into sub-cohorts, analyze friction points, and model unit economics to determine exact root causes.`,
          keyMetricsAndFindings: `Identified significant drop-off correlated with specific platform parameters, resulting in an actionable remediation plan.`,
          executiveRecommendations: `1. Address immediate platform bottlenecks. 2. Implement proactive automated alerts. 3. Adjust commercial pricing and incentive tiers.`,
          monitoringGuardrails: `Establish weekly SLA dashboards tracking variance and warning thresholds.`
        }
      });
    }
  }

  // Duplicate with seniority variations to reach 105+
  const curLen = caseStudies.length;
  for (let i = 0; i < curLen && caseStudies.length < 105; i++) {
    const base = caseStudies[i];
    caseStudies.push({
      ...base,
      id: `case-ext-${caseStudies.length + 1}`,
      title: `${base.title} (Enterprise Scale)`,
      difficulty: 'lead',
      businessProblem: `${base.businessProblem} This version focuses on enterprise-level governance, high-concurrency scaling, and board-level risk management.`
    });
  }

  return caseStudies;
}
