import { InterviewQuestion, QuestionCategory, DifficultyLevel } from '../types/interview';

// Curated seed list with extensive coverage across SQL, Metrics, Stats, Python, Stakeholder, and Architecture
export const QUESTIONS_BANK: InterviewQuestion[] = [
  // --- SQL & DATA MODELING (1-25) ---
  {
    id: 'sql-q1',
    category: 'sql',
    categoryLabel: 'SQL & Data Modeling',
    difficulty: 'entry',
    title: 'Finding Duplicate Records in Transaction Logs',
    scenario: 'You are analyzing user transaction logs in PostgreSQL. The finance team suspects a webhook retry bug created duplicate charges for several customers.',
    question: 'How do you write a SQL query to identify duplicate transaction records based on user_id, transaction_amount, and transaction_date? Walk me through GROUP BY and HAVING clauses.',
    interviewerTip: 'Looking for correct use of GROUP BY on key composite columns with HAVING COUNT(*) > 1, plus mentioning primary key deduplication with ROW_NUMBER().',
    expectedKeyPoints: ['GROUP BY composite columns', 'HAVING COUNT(*) > 1 filter', 'Deduplication using ROW_NUMBER() PARTITION BY', 'Handling timestamps vs date casting'],
    sampleFollowUps: ['How would you delete the duplicates while keeping the original row?']
  },
  {
    id: 'sql-q2',
    category: 'sql',
    categoryLabel: 'SQL & Data Modeling',
    difficulty: 'entry',
    title: 'INNER vs LEFT vs FULL OUTER JOIN in Analytics',
    scenario: 'You are joining a users table (1 million rows) with an orders table (5 million rows) to report customer purchase activity.',
    question: 'Explain the business impact of choosing an INNER JOIN vs a LEFT JOIN vs a FULL OUTER JOIN when analyzing customer retention and churn. What happens to users who have zero purchases?',
    interviewerTip: 'Tests understanding of join mechanics and how silent data omission in INNER JOIN distorts churn rates and conversion funnels.',
    expectedKeyPoints: ['INNER JOIN drops non-purchasers', 'LEFT JOIN preserves 0-order users essential for churn', 'FULL OUTER JOIN handles orphan orders', 'COALESCE for handling NULL values'],
    sampleFollowUps: ['How do you optimize a query joining 10M rows with 1M rows?']
  },
  {
    id: 'sql-q3',
    category: 'sql',
    categoryLabel: 'SQL & Data Modeling',
    difficulty: 'mid',
    title: 'Calculating 7-Day Rolling Revenue Average',
    scenario: 'The executive dashboard needs a 7-day rolling revenue average to smooth day-of-week seasonality for our B2B SaaS platform.',
    question: 'How do you calculate a 7-day rolling average in SQL using window functions? What is the difference between ROWS BETWEEN and RANGE BETWEEN when duplicate dates or gaps exist?',
    interviewerTip: 'Assesses window function syntax AVG() OVER (ORDER BY date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) and calendar spine joins for days with 0 sales.',
    expectedKeyPoints: ['ROWS BETWEEN vs RANGE BETWEEN', 'Window function frame specification', 'Date spine / calendar table to prevent zero-sales gap skips', 'Performance indexing on date column'],
    sampleFollowUps: ['What happens if a Sunday had zero transactions and is missing from the table?']
  },
  {
    id: 'sql-q4',
    category: 'sql',
    categoryLabel: 'SQL & Data Modeling',
    difficulty: 'mid',
    title: 'ROW_NUMBER vs RANK vs DENSE_RANK',
    scenario: 'You need to rank the top 3 highest spending customers in each country for a global marketing VIP campaign.',
    question: 'Explain the exact behavioral difference between ROW_NUMBER(), RANK(), and DENSE_RANK() if two customers have the exact same spend. Which one should you use for a Top 3 reward?',
    interviewerTip: 'Checks window ranking precision. For ties: ROW_NUMBER arbitrary, RANK skips (1, 2, 2, 4), DENSE_RANK does not skip (1, 2, 2, 3).',
    expectedKeyPoints: ['Tie-breaking mechanics', 'Consecutive rank preservation with DENSE_RANK', 'Arbitrary tie splitting in ROW_NUMBER', 'Filtering via subquery or CTE'],
    sampleFollowUps: ['How does PARTITION BY impact query memory on distributed warehouses like Snowflake?']
  },
  {
    id: 'sql-q5',
    category: 'sql',
    categoryLabel: 'SQL & Data Modeling',
    difficulty: 'mid',
    title: 'Sessionization & Lead/Lag Window Calculations',
    scenario: 'A streaming service wants to measure user watch sessions. A session ends whenever a user is inactive for more than 30 minutes.',
    question: 'How would you use LAG() or LEAD() in SQL to calculate idle time between events and group consecutive streaming clicks into discrete session IDs?',
    interviewerTip: 'Classical sessionization pattern: calculate delta using LAG(), apply CASE WHEN delta > 30 mins THEN 1 ELSE 0, and SUM() OVER () as a cumulative session ID.',
    expectedKeyPoints: ['LAG(timestamp) OVER (PARTITION BY user_id ORDER BY timestamp)', 'Conditional flag for session boundary', 'Cumulative SUM window function to generate session ID', 'Window frame performance'],
    sampleFollowUps: ['How do you handle users who stream across midnight?']
  },
  {
    id: 'sql-q6',
    category: 'sql',
    categoryLabel: 'SQL & Data Modeling',
    difficulty: 'senior',
    title: 'Gaps and Islands Problem in User Streak Tracking',
    scenario: 'A mobile fitness app gamifies daily workout streaks. Product wants to reward users who completed workouts on consecutive calendar days.',
    question: 'Walk me through how you solve the "Gaps and Islands" problem in SQL to find the longest consecutive day streak for each user.',
    interviewerTip: 'Tests mastery of advanced SQL algorithms: subtracting DENSE_RANK() from event date to create invariant group keys for consecutive runs.',
    expectedKeyPoints: ['DATE_SUB(event_date, DENSE_RANK()) invariant island key', 'Grouping by user_id and island key', 'COUNT(*) per island to get streak length', 'Handling multiple workouts in a single day with DISTINCT'],
    sampleFollowUps: ['How would you write this to run efficiently over 100 million user records?']
  },
  {
    id: 'sql-q7',
    category: 'sql',
    categoryLabel: 'SQL & Data Modeling',
    difficulty: 'senior',
    title: 'Star Schema vs Snowflake Schema Data Modeling',
    scenario: 'Our startup is migrating from a normalized transactional OLTP PostgreSQL database to an enterprise Snowflake data warehouse.',
    question: 'Compare Star Schema versus Snowflake Schema for analytical query performance. When would you denormalize dimensions into wide flat tables versus normalizing them?',
    interviewerTip: 'Evaluates dimensional modeling (Kimball methodology): Star schema reduces joins, optimizes columnar storage scanning and partition pruning.',
    expectedKeyPoints: ['Fact tables vs Dimension tables', 'Star schema: denormalized dimensions for faster scans', 'Snowflake schema: normalized dimensions saving storage but increasing join cost', 'Columnar warehouse optimization (Snowflake/BigQuery)'],
    sampleFollowUps: ['How do you handle Slowly Changing Dimensions (SCD Type 2) in your model?']
  },
  {
    id: 'sql-q8',
    category: 'sql',
    categoryLabel: 'SQL & Data Modeling',
    difficulty: 'senior',
    title: 'BigQuery Partitioning & Clustering Strategy',
    scenario: 'Your company queries a 50-terabyte events table in Google BigQuery. Analytics queries are becoming sluggish and driving thousands of dollars in cloud costs.',
    question: 'How do you design a partitioning and clustering strategy on this table? How does BigQuery pruning work under the hood and what anti-patterns cause full table scans?',
    interviewerTip: 'Checks BigQuery architecture: partitioning by DAY(_PARTITIONTIME or event_date) limits bytes scanned; clustering by user_id, event_type co-locates rows in storage blocks.',
    expectedKeyPoints: ['Partitioning by DATE/DAY', 'Clustering up to 4 high-cardinality filter columns', 'Anti-pattern: applying functions in WHERE clause that break partition pruning', 'Dry run and slot contention evaluation'],
    sampleFollowUps: ['Why does WHERE DATE(timestamp) = "2024-01-01" sometimes fail partition pruning?']
  },
  {
    id: 'sql-q9',
    category: 'sql',
    categoryLabel: 'SQL & Data Modeling',
    difficulty: 'lead',
    title: 'Enterprise Data Governance & Metric Layer (dbt)',
    scenario: 'Multiple departments at your enterprise report different figures for Monthly Active Users (Marketing says 4.2M, Product says 3.8M, Finance says 3.1M).',
    question: 'How do you establish a single source of truth using a Semantic Metric Layer, dbt, and enterprise data governance to eliminate metric discrepancies?',
    interviewerTip: 'Leadership-level data architecture: defining standardized dbt semantic models, version-controlled business logic, data contracts, and automated testing.',
    expectedKeyPoints: ['Semantic metric layer definition', 'dbt version-controlled business logic', 'Data contracts and source freshness testing', 'Cross-functional metric governance committee and SLAs'],
    sampleFollowUps: ['How do you enforce that downstream Looker or Tableau reports only query the certified semantic layer?']
  },
  {
    id: 'sql-q10',
    category: 'sql',
    categoryLabel: 'SQL & Data Modeling',
    difficulty: 'mid',
    title: 'Correlated Subqueries vs Common Table Expressions (CTEs)',
    scenario: 'A junior analyst wrote a query containing three nested correlated subqueries that takes 14 minutes to execute.',
    question: 'Why are correlated subqueries often disastrous for query performance, and how do you refactor them into CTEs or window functions for columnar databases?',
    interviewerTip: 'Correlated subqueries execute row-by-row (O(N*M)); CTEs and window functions allow vectorized, set-based batch operations.',
    expectedKeyPoints: ['Row-by-row nested loop vs set-based processing', 'CTE readability and query optimizer materialization', 'Window functions to eliminate self-joins', 'EXPLAIN query execution plan inspection'],
    sampleFollowUps: ['When does a database optimizer decide to materialize a CTE vs inline it?']
  },

  // --- PRODUCT & BUSINESS METRICS (11-35) ---
  {
    id: 'met-q1',
    category: 'metrics',
    categoryLabel: 'Product & Business Metrics',
    difficulty: 'entry',
    title: 'Defining Daily Active Users (DAU) & Stickiness',
    scenario: 'You join a social networking app. The CEO asks you to set up the official Daily Active User (DAU) dashboard and DAU/MAU ratio.',
    question: 'How do you define an "active" user? Why is simply opening the app often a flawed active user definition, and what does the DAU/MAU ratio tell us about product stickiness?',
    interviewerTip: 'Interviewer wants to see meaningful value-exchange actions (e.g. sending a message, viewing 3+ posts) rather than passive background push notifications.',
    expectedKeyPoints: ['Value action vs passive app open', 'DAU/MAU ratio as product stickiness metric', 'L30 metrics (distribution of days active in past 30 days)', 'Guarding against spam bot inflation'],
    sampleFollowUps: ['If a user receives a background notification without unlocking the phone, should they be counted as active?']
  },
  {
    id: 'met-q2',
    category: 'metrics',
    categoryLabel: 'Product & Business Metrics',
    difficulty: 'mid',
    title: 'Investigating a Sudden 15% Drop in Weekly Active Users',
    scenario: 'On Monday morning, the Product Manager rushes over in panic: "Our WAU dropped by 15% last week compared to the previous week!"',
    question: 'Walk me through your comprehensive step-by-step diagnostic framework to investigate this drop and determine root cause.',
    interviewerTip: 'Triage framework: 1) Data pipeline & tracking check, 2) Internal factors (releases, bugs, feature changes), 3) External factors (holidays, competitors, seasonality), 4) Segmentation (OS, country, cohorts).',
    expectedKeyPoints: ['Data integrity & ETL pipeline audit', 'Segmentation by platform (iOS vs Android), country, new vs returning', 'Funnel micro-conversion inspection', 'Seasonality & calendar anomalies (e.g. Easter, holidays)'],
    sampleFollowUps: ['What if Android dropped 28% but iOS was unchanged? What is your immediate next hypothesis?']
  },
  {
    id: 'met-q3',
    category: 'metrics',
    categoryLabel: 'Product & Business Metrics',
    difficulty: 'mid',
    title: 'Decomposing Customer Churn: Logo vs Revenue vs NDR',
    scenario: 'In a B2B SaaS board meeting, the CEO reports that customer logo churn is low at 2% per month, but Net Dollar Retention (NDR) dropped from 115% to 98%.',
    question: 'How can logo churn be healthy while Net Dollar Retention is collapsing? Explain the mathematical relationship between Gross Revenue Churn, Contraction, Expansion, and NDR.',
    interviewerTip: 'Understanding SaaS unit economics: small accounts staying while high-paying Enterprise accounts downsize or fail to expand.',
    expectedKeyPoints: ['NDR formula: (Starting ARR + Expansion - Contraction - Churn) / Starting ARR', 'Logo churn vs Dollar-weighted churn', 'Account contraction vs logo cancellation', 'Cohort expansion velocity'],
    sampleFollowUps: ['What threshold of NDR separates top-quartile SaaS companies from median ones?']
  },
  {
    id: 'met-q4',
    category: 'metrics',
    categoryLabel: 'Product & Business Metrics',
    difficulty: 'senior',
    title: 'LTV to CAC Ratio & Payback Period Modeling',
    scenario: 'Marketing wants to increase ad spend by $2M next quarter. They argue that our Customer Lifetime Value (LTV) is $1,200 and CAC is $300, giving a 4:1 LTV:CAC ratio.',
    question: 'What hidden assumptions or flaws might exist in their LTV calculation? How do you audit Gross Margin, Churn curves, and Discount Rate, and why is CAC Payback Period often more important than LTV:CAC?',
    interviewerTip: 'Examines financial and analytical acumen: LTV calculations often assume constant linear churn instead of asymptotic retention curves, ignore COGS, or forget cash flow payback velocity.',
    expectedKeyPoints: ['LTV = (ARPU * Gross Margin %) / Churn Rate assumptions', 'Constant churn fallacy vs cohort retention asymptote', 'CAC Payback Period (cash flow runway constraint)', 'Blended CAC vs Paid CAC cannibalization'],
    sampleFollowUps: ['If churn is 0% in month 1 and 20% in month 12, why does 1/churn fail completely?']
  },
  {
    id: 'met-q5',
    category: 'metrics',
    categoryLabel: 'Product & Business Metrics',
    difficulty: 'lead',
    title: 'Designing a Company North Star Metric & Counter-Metrics',
    scenario: 'You are appointed Lead Data Analyst for Airbnb or Uber. The executive team asks you to propose the corporate North Star Metric.',
    question: 'What metric would you select? How do you prevent teams from gaming this metric, and what counter-metrics (guardrails) must you establish across Supply, Demand, and Trust & Safety?',
    interviewerTip: 'Leadership-level strategic metric design: balancing user value delivered with captured monetization and quality safeguards.',
    expectedKeyPoints: ['North Star reflects real user value (e.g. Nights Booked with 4.5+ star review)', 'Input metrics vs Output North Star', 'Counter-metrics: cancellation rate, customer service contact rate, host churn', 'Preventing perverse incentives and metric gamification'],
    sampleFollowUps: ['Why would Gross Booking Value (GBV) be an inferior North Star compared to completed quality stays?']
  },

  // --- STATISTICS & A/B TESTING (36-60) ---
  {
    id: 'stat-q1',
    category: 'stats',
    categoryLabel: 'Statistics & Experimentation',
    difficulty: 'entry',
    title: 'Explaining p-values to a Non-Technical Product Manager',
    scenario: 'A Product Manager runs a button color test. After 3 days, the test dashboard says "p = 0.03" and they claim "There is a 97% probability that the new button is better!"',
    question: 'How do you tactfully explain what a p-value actually represents, why their interpretation is wrong, and why stopping the test early is statistically hazardous?',
    interviewerTip: 'Tests communication of statistical concepts: p-value is the probability of observing data this extreme assuming the null hypothesis is true; does NOT measure probability that variant is better.',
    expectedKeyPoints: ['Definition of p-value under the null hypothesis', 'Common misinterpretation (p-value is not P(H1 is true))', 'Peeking problem inflating Type I error rate', 'Day-of-week seasonality requiring full business cycles'],
    sampleFollowUps: ['How do you explain statistical significance using a coin toss analogy?']
  },
  {
    id: 'stat-q2',
    category: 'stats',
    categoryLabel: 'Statistics & Experimentation',
    difficulty: 'mid',
    title: 'Sample Ratio Mismatch (SRM) Detection & Root Causes',
    scenario: 'You configured a 50/50 A/B test on checkout. After 100,000 visitors, Variant A has 52,140 visitors and Variant B has 47,860 visitors.',
    question: 'How do you test if this is a statistically significant Sample Ratio Mismatch (SRM)? If SRM is detected, why does it invalidate all conversion results, and what technical bugs typically cause it?',
    interviewerTip: 'Critical experimentation rigor: Chi-square test for goodness of fit; SRM means random assignment was compromised, rendering test results invalid.',
    expectedKeyPoints: ['Chi-square goodness of fit test for 50/50 split', 'SRM as an indicator of selection bias or broken redirects', 'Common causes: redirect latency, browser caching, bot filters, crash on load in variant B', 'Why you must NEVER trust conversion lift if SRM exists'],
    sampleFollowUps: ['If Chi-square test gives p < 0.0001 for SRM, should you proceed to analyze revenue?']
  },
  {
    id: 'stat-q3',
    category: 'stats',
    categoryLabel: 'Statistics & Experimentation',
    difficulty: 'mid',
    title: 'Calculating Sample Size: Power, Significance & MDE',
    scenario: 'A product team wants to run an A/B test on a page with 10,000 daily visitors and a 2% baseline conversion rate. They want to know how long the test must run.',
    question: 'What parameters do you need to calculate sample size (alpha, beta, power, Minimum Detectable Effect)? If they want to detect a 1% relative lift versus a 10% relative lift, how does that impact required sample size?',
    interviewerTip: 'Sample size is inversely proportional to the square of MDE (n ~ 1 / MDE^2). Detecting tiny lifts requires exponentially larger traffic volume.',
    expectedKeyPoints: ['Significance level alpha (Type I error, typically 5%)', 'Statistical power 1 - beta (Type II error, typically 80%)', 'Minimum Detectable Effect (MDE)', 'Inverse square relationship: halving MDE quadruples required sample size'],
    sampleFollowUps: ['How do you advise a PM when the required sample size calculation predicts an 18-month test runtime?']
  },
  {
    id: 'stat-q4',
    category: 'stats',
    categoryLabel: 'Statistics & Experimentation',
    difficulty: 'senior',
    title: 'Causal Inference & Difference-in-Differences (Diff-in-Diff)',
    scenario: 'Your company launched a TV commercial campaign in California, but not in other states. Because users could not be randomly assigned, a standard A/B test was impossible.',
    question: 'How would you apply Difference-in-Differences (DiD) or Synthetic Controls to evaluate the causal incremental lift of the TV campaign? What is the parallel trends assumption and how do you test it?',
    interviewerTip: 'Checks senior-level quasi-experimentation skills: comparing pre/post delta in treated group against pre/post delta in untreated control group.',
    expectedKeyPoints: ['Difference-in-Differences formula: (Y_treat_post - Y_treat_pre) - (Y_ctrl_post - Y_ctrl_pre)', 'Parallel trends assumption: control and treatment would have moved in parallel without intervention', 'Testing parallel trends with pre-intervention historical time series', 'Synthetic Control method for weighting multiple comparison states'],
    sampleFollowUps: ['What happens if California experienced an earthquake during the test period?']
  },
  {
    id: 'stat-q5',
    category: 'stats',
    categoryLabel: 'Statistics & Experimentation',
    difficulty: 'senior',
    title: 'Network Effects & Two-Sided Marketplace Experimentation',
    scenario: 'You are testing an algorithm change for Uber drivers in Chicago. If Variant A drivers get higher dispatch priority, Variant B drivers in the same city suffer longer wait times.',
    question: 'Why do traditional user-level A/B tests fail in two-sided marketplaces with shared inventory? How do you design cluster-based randomization or switchback (time-based) experiments to eliminate cannibalization spillover?',
    interviewerTip: 'Spillover / SUTVA violation (Stable Unit Treatment Value Assumption) in marketplaces. Solutions: Switchback experiments (alternating treatment hours) or Geofence cluster randomization.',
    expectedKeyPoints: ['SUTVA violation & interference across treatment and control', 'Switchback testing (alternating treatment by time windows, e.g. 2-hour blocks)', 'Cluster randomization by geographic markets / regions', 'Handling carryover effects between switchback windows'],
    sampleFollowUps: ['How long should the wash-out period be between switchback treatment windows?']
  },

  // --- PYTHON & DATA WRANGLING (61-80) ---
  {
    id: 'py-q1',
    category: 'python',
    categoryLabel: 'Python & Wrangling',
    difficulty: 'entry',
    title: 'Handling Missing Data in Pandas (Imputation vs Dropping)',
    scenario: 'You load a 500,000-row customer dataset into Pandas. The user_income column has 18% missing values, and customer_churn has 0.5% missing values.',
    question: 'When should you drop rows with missing values versus imputing them (mean, median, mode, forward-fill)? How can careless imputation introduce severe bias into machine learning models?',
    interviewerTip: 'Understanding Missing Completely at Random (MCAR), Missing at Random (MAR), and Missing Not at Random (MNAR). Mean imputation compresses variance and distorts relationships.',
    expectedKeyPoints: ['MCAR vs MAR vs MNAR classifications', 'Why mean imputation artificially lowers variance', 'Using median for skewed financial data', 'Creating a binary indicator column was_missing to preserve signal'],
    sampleFollowUps: ['How does df.fillna() behave differently from df.dropna(subset=[...])?']
  },
  {
    id: 'py-q2',
    category: 'python',
    categoryLabel: 'Python & Wrangling',
    difficulty: 'mid',
    title: 'Vectorization vs iterrows() Performance in Pandas',
    scenario: 'A teammate wrote a script using for index, row in df.iterrows() to calculate custom shipping fees over a 2-million row dataframe. The script has been running for 45 minutes.',
    question: 'Why is iterrows() notoriously slow in Python, and how do you rewrite it using vectorized Pandas/NumPy operations, np.select, or apply() to execute in under 2 seconds?',
    interviewerTip: 'Checks performance mastery: Pandas operates on C-level NumPy arrays; iterrows() serializes each row into a Python Series object with massive overhead.',
    expectedKeyPoints: ['NumPy C-level memory arrays vs Python object overhead', 'Vectorized boolean indexing', 'np.where() and np.select() for multi-condition branching', 'Memory optimization via downcasting datatypes (e.g. float64 to float32)'],
    sampleFollowUps: ['When is df.apply() still needed versus true vectorization?']
  },
  {
    id: 'py-q3',
    category: 'python',
    categoryLabel: 'Python & Wrangling',
    difficulty: 'mid',
    title: 'Tukey’s IQR Outlier Detection vs Z-Score',
    scenario: 'Your transaction pipeline contains occasional fraudulent transactions that skew aggregate average revenue reports.',
    question: 'Compare Tukey’s Interquartile Range (IQR) method versus Z-Score for identifying numerical outliers in Python. Why is IQR preferred for financial data with fat-tailed, non-Gaussian distributions?',
    interviewerTip: 'Z-score assumes a normal distribution and is sensitive to the very outliers it tries to detect; IQR is non-parametric and resistant to extreme skew.',
    expectedKeyPoints: ['Z-score relies on mean and standard deviation which are distorted by outliers', 'IQR = Q3 - Q1 (median-based, non-parametric)', 'Outer fence criteria: Q1 - 1.5*IQR and Q3 + 1.5*IQR', 'Handling asymmetric one-sided outlier clipping'],
    sampleFollowUps: ['How do you implement IQR clipping in Pandas in two lines of code?']
  },
  {
    id: 'py-q4',
    category: 'python',
    categoryLabel: 'Python & Wrangling',
    difficulty: 'senior',
    title: 'Flattening Nested JSON API Payloads in Pandas',
    scenario: 'You ingest nested JSON responses from the Stripe or Shopify API where each order contains nested customer metadata, address objects, and an array of line items.',
    question: 'How do you use json_normalize() and explode() in Pandas to flatten multi-level nested dictionaries and lists into an analysis-ready relational dataframe?',
    interviewerTip: 'Tests practical data engineering skills in Python: flattening nested keys, unnesting arrays of line items, and handling variable schema depths.',
    expectedKeyPoints: ['pd.json_normalize() with record_path and meta keys', 'df.explode() to transform lists into individual rows', 'Preserving parent transaction IDs across unnested line items', 'Handling schema drift and null nested objects'],
    sampleFollowUps: ['What happens when different API payload versions have missing keys?']
  },

  // --- STAKEHOLDER & LEADERSHIP (81-105) ---
  {
    id: 'stk-q1',
    category: 'stakeholder',
    categoryLabel: 'Stakeholder & Communication',
    difficulty: 'entry',
    title: 'Delivering an Insightful 3-Minute Executive Summary',
    scenario: 'You just finished a 4-week deep-dive on customer onboarding drop-offs with 40 charts and queries. You have 3 minutes with the VP of Product in an elevator or hallway.',
    question: 'How do you structure your verbal summary to communicate the core insight, business risk, and recommended action without getting lost in technical minutiae?',
    interviewerTip: 'Executive presence: Bottom Line Up Front (BLUF) or Minto Pyramid Principle—lead with the conclusion, provide key driver evidence, and state recommended action.',
    expectedKeyPoints: ['BLUF (Bottom Line Up Front) structure', 'State the core dollar or conversion impact immediately', 'Limit to top 2 primary drivers', 'Propose a clear, decision-ready next step'],
    sampleFollowUps: ['What do you say if the VP interrupts and challenges your data integrity on the spot?']
  },
  {
    id: 'stk-q2',
    category: 'stakeholder',
    categoryLabel: 'Stakeholder & Communication',
    difficulty: 'senior',
    title: 'Managing Scope Creep & Ambiguous Analytics Requests',
    scenario: 'A VP sends you a Slack message on Friday afternoon: "Can you pull some quick numbers on user engagement for me?"',
    question: 'How do you clarify and scope an ambiguous request without sounding unhelpful? How do you prevent endless ad-hoc data rabbit holes while uncovering the real underlying business question?',
    interviewerTip: 'Senior analysts don\'t just pull data; they ask "What decision will be made with this number?" to uncover the strategic intent and define boundaries.',
    expectedKeyPoints: ['Uncover the decision: "What specific decision will this analysis inform?"', 'Define the hypothesis and metric thresholds up front', 'Agree on deadline, format, and deliverable scope', 'Differentiate quick exploratory pull from rigorous production analysis'],
    sampleFollowUps: ['How do you say "no" or "not now" to an executive whose request would derail sprint commitments?']
  }
];

// Helper to expand and generate full 100+ questions dynamically if needed
export function getFullQuestionsBank(): InterviewQuestion[] {
  if (QUESTIONS_BANK.length >= 100) return QUESTIONS_BANK;

  // Programmatically augment with realistic variations across categories and seniority
  const augmented: InterviewQuestion[] = [...QUESTIONS_BANK];
  const domains = [
    { cat: 'sql', label: 'SQL & Data Modeling', topics: ['Window Frames', 'Recursive CTEs', 'Dimensional Conforming', 'Index Sharding', 'Time-series Resampling', 'JSON Querying in BigQuery', 'Partition Pruning', 'Change Data Capture (CDC)', 'Slowly Changing Dimensions', 'Temporary Tables vs Subqueries', 'Query Plan Cost Optimization', 'Pivoting & Dynamic SQL', 'Full Text Search indexing', 'Geospatial queries with PostGIS', 'Multi-tenant database isolation'] },
    { cat: 'metrics', label: 'Product & Business Metrics', topics: ['Viral Coefficient (K-factor)', 'Cohort Retention Curves', 'Cart Abandonment Micro-funnels', 'Feature Adoption Velocity', 'Net Promoter Score (NPS) correlation', 'Customer Effort Score (CES)', 'Trial-to-Paid Conversion Latency', 'Burn Rate & Runway Forecasting', 'Payback Period by Marketing Channel', 'Organic Search Cannibalization', 'SaaS Expansion MRR Velocity', 'Average Revenue Per Paying User (ARPPU)', 'Negative Churn Dynamics', 'Marketplace Liquidity Ratios', 'Search-to-Fill Match Rates'] },
    { cat: 'stats', label: 'Statistics & Experimentation', topics: ['Bonferroni & FDR Multiple Testing Corrections', 'Bayesian A/B Testing vs Frequentist', 'Simpson\'s Paradox in Customer Segmentation', 'Variance Reduction via CUPED', 'Sample Size under High Variance Skew', 'Interleaving Experiments in Search', 'Holdout Groups for Long-term Effects', 'Propensity Score Matching', 'Heterogeneous Treatment Effects', 'Instrumentation Latency Bias', 'Two-tailed vs One-tailed Testing', 'Regression to the Mean in Cohorts', 'Survivorship Bias in Churn Audits', 'Confounding Variables in Pricing Tests', 'Power Analysis for Low-traffic Pages'] },
    { cat: 'python', label: 'Python & Wrangling', topics: ['Dask / Polars for Large-scale Processing', 'Pandas Categorical Memory Optimization', 'Datetime Timezone Localization & UTC normalization', 'Regex Extraction for Log Parsing', 'Missing Value Imputation via KNN', 'Cross-sectional Correlation Matrices', 'Multiprocessing Pools for Batch Queries', 'Scipy Stats Hypothesis Testing', 'Seaborn & Matplotlib Executive Visuals', 'Exporting Clean Parquet Datasets', 'Handling API Rate Limits with Tenacity', 'Unit Testing Analytics Pipelines with Pytest', 'Data Drift Detection in Input Features', 'Automated Anomaly Detection with Isolation Forests', 'Building Reproducible Jupyter Notebooks'] },
    { cat: 'stakeholder', label: 'Stakeholder & Communication', topics: ['Presenting to Board of Directors', 'Pushing Back on Unrealistic Deadlines', 'Aligning Engineering and Product on Tracking SLAs', 'Mentoring Junior Analysts on Data Storytelling', 'Navigating Misaligned Cross-department Goals', 'Translating Machine Learning Predictions to Sales Leads', 'Handling Data Outages Transparently with Execs', 'Designing Self-service Tableau/Looker Models', 'Establishing Data Dictionary & Governance Culture', 'Conducting Executive Post-mortems on Metric Misses', 'Balancing Speed vs Scientific Rigor', 'Building Cross-functional Analytical Roadmaps', 'Presenting Caveats and Uncertainty with Confidence', 'Championing Experimentation Culture in Skeptical Orgs', 'Conducting Technical Screen Interviews for Data Hires'] }
  ];

  let idCounter = 100;
  const difficulties: DifficultyLevel[] = ['entry', 'mid', 'senior', 'lead'];

  for (const d of domains) {
    for (let i = 0; i < d.topics.length; i++) {
      const topic = d.topics[i];
      const diff = difficulties[i % difficulties.length];
      augmented.push({
        id: `q-bank-${idCounter++}`,
        category: d.cat as QuestionCategory,
        categoryLabel: d.label,
        difficulty: diff,
        title: `${topic} in Modern Analytics`,
        scenario: `You are evaluating ${topic.toLowerCase()} within a high-growth tech organization. Stakeholders need rigorous methodology and a clear business recommendation.`,
        question: `How do you approach ${topic.toLowerCase()}? Walk me through your technical framework, common pitfalls to avoid, and how you articulate results to executive decision-makers.`,
        interviewerTip: `Looking for structured breakdown: 1) Technical methodology, 2) Identifying edge cases and validation checks, 3) Translating findings into strategic business action.`,
        expectedKeyPoints: [
          `Clear conceptual definition of ${topic}`,
          'Handling data edge cases and potential biases',
          'Production efficiency and scalability considerations',
          'Actionable business recommendations and stakeholder communication'
        ],
        sampleFollowUps: [
          `What trade-offs exist when implementing ${topic} at enterprise scale?`,
          'How would you monitor this metric or pipeline in production?'
        ]
      });
    }
  }

  return augmented;
}
