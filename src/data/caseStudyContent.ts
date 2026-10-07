import { DataCaseStudy } from '../types/interview';

export const DEFAULT_CASE_STUDIES: DataCaseStudy[] = [
  {
    id: 'case-saas-churn-1',
    title: 'B2B SaaS Net Dollar Retention (NDR) & Churn Crisis',
    difficulty: 'senior',
    industry: 'B2B Cloud SaaS',
    businessProblem: `You are the Lead Data Analyst at CloudMetrics, a B2B SaaS analytics platform ($45M ARR). 
During Q3 board preparations, the CFO notes that Net Dollar Retention (NDR) dropped from 118% to 103% over the past 9 months, despite steady new logo acquisition. 
The VP of Customer Success insists churn is concentrated in small business accounts (SMB) due to macroeconomic headwinds. 
However, the Head of Product suspects recent UI changes in May increased feature friction for Enterprise seats. 
The CEO has commissioned you to conduct an independent, end-to-end investigation before the board meeting in two weeks.`,
    executiveQuestions: [
      'Is the NDR decline driven by gross logo churn, account contraction (seat downgrades), or an expansion slowdown in existing accounts?',
      'Which tier (SMB, Mid-Market, Enterprise) is actually eroding revenue, and what are the leading behavioral indicators 60-90 days prior to churn?',
      'What concrete actions should Product and Customer Success take to restore NDR to 115%+ by next quarter?'
    ],
    datasetDescription: {
      tables: [
        {
          name: 'subscriptions',
          description: 'Historical MRR, plan tiers, and contract renewals per customer account.',
          columns: [
            { name: 'subscription_id', type: 'INT', notes: 'Primary key' },
            { name: 'account_id', type: 'VARCHAR(32)', notes: 'Company account ID' },
            { name: 'tier', type: 'VARCHAR(16)', notes: 'SMB ($500/mo), Mid-Market ($2.5k/mo), Enterprise ($10k+/mo)' },
            { name: 'mrr_amount', type: 'DECIMAL(10,2)', notes: 'Monthly recurring revenue' },
            { name: 'seats_contracted', type: 'INT', notes: 'Purchased user licenses' },
            { name: 'start_date', type: 'DATE', notes: 'Contract start' },
            { name: 'churn_date', type: 'DATE', notes: 'NULL if active account' }
          ],
          sampleRows: [
            [1001, 'acc_acme_corp', 'Enterprise', 12500.00, 150, '2023-01-15', null],
            [1002, 'acc_startup_ai', 'SMB', 500.00, 5, '2023-06-01', '2024-02-15'],
            [1003, 'acc_global_logistics', 'Enterprise', 24000.00, 300, '2022-11-01', '2024-05-30'],
            [1004, 'acc_fintech_hub', 'Mid-Market', 3200.00, 35, '2023-04-10', null]
          ],
          dataQualityNotes: [
            'Noticeable timezone discrepancies between contract start and renewal timestamp.',
            'Several mid-contract plan upgrades logged as new rows rather than delta changes.',
            '5% of accounts have active subscriptions with null churn_date but $0 MRR.'
          ]
        },
        {
          name: 'product_usage_events',
          description: 'Aggregated daily event telemetry per account and feature module.',
          columns: [
            { name: 'event_date', type: 'DATE', notes: 'Daily aggregate date' },
            { name: 'account_id', type: 'VARCHAR(32)', notes: 'Foreign key to account' },
            { name: 'active_daily_seats', type: 'INT', notes: 'Unique active users per day' },
            { name: 'dashboard_queries_run', type: 'INT', notes: 'Core value action' },
            { name: 'export_events_count', type: 'INT', notes: 'CSV/API data export actions' },
            { name: 'api_latency_p95_ms', type: 'INT', notes: 'System performance metric' }
          ],
          sampleRows: [
            ['2024-05-01', 'acc_acme_corp', 112, 1450, 42, 380],
            ['2024-05-01', 'acc_global_logistics', 45, 120, 3, 1420],
            ['2024-05-02', 'acc_fintech_hub', 28, 410, 18, 310]
          ],
          dataQualityNotes: [
            'Logging gap between May 12 and May 14 due to telemetry pipeline upgrade.',
            'Bot scraping activity artificially inflated dashboard_queries_run on certain trial accounts.'
          ]
        },
        {
          name: 'zendesk_tickets',
          description: 'Support and feature complaint tickets categorized by issue tag.',
          columns: [
            { name: 'ticket_id', type: 'INT', notes: 'Primary key' },
            { name: 'account_id', type: 'VARCHAR(32)', notes: 'Foreign key' },
            { name: 'created_at', type: 'TIMESTAMP', notes: 'Submission time' },
            { name: 'category', type: 'VARCHAR(32)', notes: 'UI_Bug, Billing, Slow_Query, Feature_Request' },
            { name: 'csat_score', type: 'INT', notes: '1 to 5 rating' }
          ],
          sampleRows: [
            [5001, 'acc_global_logistics', '2024-04-20 14:22:00', 'Slow_Query', 2],
            [5002, 'acc_acme_corp', '2024-05-15 09:10:00', 'Feature_Request', 4],
            [5003, 'acc_fintech_hub', '2024-06-01 11:45:00', 'UI_Bug', 3]
          ],
          dataQualityNotes: [
            'CSAT score is null for 40% of resolved tickets.',
            'Multiple merged duplicate tickets exist for major system outages.'
          ]
        }
      ]
    },
    suggestedSteps: {
      dataCleaning: [
        'Audit active subscription records with $0 MRR or missing churn timestamps.',
        'Impute or interpolate missing usage telemetry for the May 12-14 outage using rolling 7-day median.',
        'Normalize ticket volumes by account seat count to evaluate per-seat friction.'
      ],
      edaAndMetrics: [
        'Decompose Net Dollar Retention: Starting MRR + Expansion - Contraction - Gross Churn.',
        'Segment retention curves across SMB, Mid-Market, and Enterprise cohorts.',
        'Calculate Seat Utilization Rate (active_daily_seats / seats_contracted) over time.'
      ],
      statisticalTechniques: [
        'Logistic Regression / Survival Analysis (Kaplan-Meier curves) to identify churn risk hazard rates.',
        'Feature Importance ranking (Random Forest or XGBoost) on pre-churn behavioral variables.',
        'Diff-in-Diff analysis on accounts exposed to the May UI release vs unmigrated legacy UI users.'
      ],
      recommendations: [
        'Establish an Early Warning Health Score alerting Customer Success when Seat Utilization drops below 60%.',
        'Address p95 API query latency SLAs for large datasets in Enterprise accounts.',
        'Reprice or bundle high-value automated export capabilities to drive expansion revenue.'
      ]
    },
    benchmarkSolution: {
      dataCleaningPlan: `1. Reconcile Subscription Ledger: Filter out anomalous $0 MRR active records. Flatten plan upgrades by creating a clean continuous date-spine table with daily effective MRR per account.
2. Handle Telemetry Gaps: For the May 12-14 pipeline outage, forward-fill missing usage with a 14-day rolling average per account. Strip out bot traffic by filtering out IP addresses generating >10,000 queries/hour.
3. Support Ticket Deduplication: Aggregate support tickets by parent incident ID and compute an Account Distress Index based on Slow_Query and UI_Bug frequencies.`,
      analysisApproach: `1. MRR Waterfall Decomposition: Separated Gross Revenue Churn from Expansion and Contraction. Revealed that while SMB logo churn remained steady at 2.1%/mo, Enterprise Contraction had spiked by 140% since March.
2. Cohort Survival Analysis: Plotted Kaplan-Meier curves comparing pre-May and post-May customer cohorts. Post-May cohorts exhibited a 35% higher hazard rate around Month 6 renewals.
3. Feature Engagement & Latency Correlation: Analyzed product_usage_events against ticket categories. Identified that Enterprise accounts with >100 seats experienced a 4x increase in p95 query latency (>1,200ms) following the May architecture migration.`,
      keyMetricsAndFindings: `• NDR Erosion Driver: Enterprise accounts downgrading contracted seat counts (-$3.2M ARR contraction), not SMB logo churn.
• Leading Indicator: When Seat Utilization Rate dropped below 55% for 3 consecutive weeks, 78% of accounts downsized their license tier at renewal.
• Root Cause: The May UI redesign introduced heavy client-side rendering which bottlenecked Enterprise accounts querying >500k rows, prompting engineering frustration and ticket escalation.`,
      executiveRecommendations: `1. Immediate Engineering Priority: Roll back heavy client-side analytics rendering for Enterprise users and establish a dedicated backend cache for high-volume queries (<400ms SLA).
2. Customer Success Playbook: Launch automated Slack alerts to CSMs whenever an Enterprise account's weekly seat utilization declines by >15% over a 14-day window.
3. Commercial Packaging: Shift contract renewals from strict per-seat models to a hybrid platform fee + active seat tier to eliminate penalty for underutilized seats during seasonal downturns.`,
      monitoringGuardrails: `Monitor weekly Seat Utilization Rate, p95 Query Latency per tenant, and Net Expansion vs Contraction Ratio in the executive dashboard.`
    }
  },
  {
    id: 'case-ecommerce-anomaly-1',
    title: 'E-Commerce Black Friday Conversion Anomaly',
    difficulty: 'mid',
    industry: 'Consumer E-Commerce / Retail',
    businessProblem: `During Cyber Weekend (the company's largest revenue period of the year), overall site traffic reached an all-time high of 2.4 million daily visitors (+35% YoY). 
However, checkout conversion rate plummeted from 3.6% to 1.9%, causing a projected $4.2M revenue shortfall against forecast. 
The VP of Marketing blames the checkout engineering team for a broken payment gateway. 
The VP of Engineering blames marketing for driving low-intent bot traffic from cheap TikTok and affiliate campaigns.
You must analyze the web traffic, cart logs, and payment records to deliver a conclusive post-mortem.`,
    executiveQuestions: [
      'Did the conversion drop stem from low-quality marketing traffic, inventory stock-outs, or frontend checkout technical errors?',
      'Which funnel step (Product Detail Page → Add to Cart → Shipping Details → Payment Confirmation) saw the steepest drop-off?',
      'What immediate remediations should be executed before the upcoming Holiday Shipping Deadline?'
    ],
    datasetDescription: {
      tables: [
        {
          name: 'web_sessions',
          description: 'Visitor sessions, marketing UTM parameters, device info, and page views.',
          columns: [
            { name: 'session_id', type: 'VARCHAR(64)', notes: 'Unique session identifier' },
            { name: 'timestamp', type: 'TIMESTAMP', notes: 'Session arrival time' },
            { name: 'utm_source', type: 'VARCHAR(32)', notes: 'Google, TikTok, Email, Affiliate, Organic' },
            { name: 'device_type', type: 'VARCHAR(16)', notes: 'iOS_App, Mobile_Web, Desktop' },
            { name: 'cart_created', type: 'BOOLEAN', notes: 'Did user add at least 1 item to cart' },
            { name: 'checkout_started', type: 'BOOLEAN', notes: 'Reached payment input step' },
            { name: 'order_completed', type: 'BOOLEAN', notes: 'Payment successful' }
          ],
          sampleRows: [
            ['sess_99182', '2024-11-29 08:12:00', 'TikTok', 'Mobile_Web', true, true, false],
            ['sess_99183', '2024-11-29 08:12:15', 'Email', 'Desktop', true, true, true],
            ['sess_99184', '2024-11-29 08:13:00', 'Affiliate', 'Mobile_Web', true, false, false]
          ],
          dataQualityNotes: [
            'Missing UTM tags on 8% of direct redirect links.',
            'Duplicate session cookies on mobile browsers with strict privacy blocking.'
          ]
        },
        {
          name: 'checkout_errors',
          description: 'Error logs emitted during the checkout payment step.',
          columns: [
            { name: 'error_id', type: 'INT', notes: 'Primary key' },
            { name: 'session_id', type: 'VARCHAR(64)', notes: 'Foreign key to session' },
            { name: 'error_code', type: 'VARCHAR(32)', notes: 'CARD_DECLINED, 3DS_TIMEOUT, OUT_OF_STOCK, ADDRESS_INVALID' },
            { name: 'payment_gateway', type: 'VARCHAR(16)', notes: 'Stripe, ApplePay, Klarna, PayPal' }
          ],
          sampleRows: [
            [8001, 'sess_99182', '3DS_TIMEOUT', 'ApplePay'],
            [8002, 'sess_99184', 'OUT_OF_STOCK', 'Stripe']
          ],
          dataQualityNotes: [
            'Logs only record when an API error response is returned; network timeouts may not log cleanly.'
          ]
        }
      ]
    },
    suggestedSteps: {
      dataCleaning: [
        'Filter out bot sessions by examining session duration (<3 seconds with 0 clicks).',
        'Map undefined UTM sources into clean buckets using referrer domain analysis.'
      ],
      edaAndMetrics: [
        'Calculate step-by-step conversion drop rates for each funnel stage across device and channel.',
        'Compare Black Friday conversion metrics by payment gateway and device type against prior 30-day baseline.'
      ],
      statisticalTechniques: [
        'Two-proportion Z-test comparing checkout completion rates per payment gateway.',
        'Chi-square test of independence between error codes and mobile browsers.'
      ],
      recommendations: [
        'Resolve ApplePay 3DS verification timeout on iOS Safari.',
        'Implement real-time inventory reservation upon Add to Cart to prevent out-of-stock drop-offs at checkout.'
      ]
    },
    benchmarkSolution: {
      dataCleaningPlan: `1. Filter synthetic and non-human traffic: Filter sessions with single-page hits <1s duration and known crawler user-agents.
2. Standardize attribution: Bucket null UTM sessions using HTTP referrer headers into Organic, Direct, and Paid Social.
3. Join session logs to error logs with a LEFT JOIN on session_id to identify clean conversion vs interrupted sessions.`,
      analysisApproach: `1. Funnel Micro-Conversion Comparison: Cart Creation Rate was healthy (18.2% vs 17.8% baseline). The drop occurred exclusively between 'Checkout Started' and 'Order Completed' (from 68% down to 34%).
2. Multi-Dimensional Segmentation: Segmented by device and gateway. Desktop Stripe conversion was normal (78%). Mobile Safari with ApplePay experienced an unprecedented failure rate of 62%.
3. Root Cause Investigation: Correlated checkout_errors with timestamp. Discovered a surge in '3DS_TIMEOUT' errors starting Friday at 6:00 AM specifically for ApplePay transactions on iOS 17+.`,
      keyMetricsAndFindings: `• Neither party was fully right: Marketing traffic was high intent (cart creation was actually up 12%), but Engineering's payment gateway suffered a critical iOS Safari authentication timeout bug.
• Technical Failure Impact: $3.1M in lost revenue was directly attributable to ApplePay timeouts. An additional $800k was lost to out-of-stock errors on top 10 apparel SKUs.`,
      executiveRecommendations: `1. Hotfix Release: Immediately disable mandatory 3DS step-up on ApplePay transactions under $100 and route failed attempts automatically to standard credit card inputs.
2. Cart Reservation: Reserve inventory for 15 minutes when a user enters checkout to prevent customers from entering card details for items sold out seconds earlier.
3. Win-Back Campaign: Trigger immediate email and SMS recovery messages with a 1-click cart recovery link and a 10% apology discount to all 48,000 users who encountered the payment timeout error.`,
      monitoringGuardrails: `Set up automated Slack alerts triggered whenever payment gateway failure rate exceeds 2.5% in any 15-minute rolling window.`
    }
  }
];
