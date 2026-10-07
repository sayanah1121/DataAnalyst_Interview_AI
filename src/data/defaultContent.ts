import { DifficultyConfig, InterviewQuestion, CodingChallenge } from '../types/interview';

export const DIFFICULTY_CONFIGS: Record<string, DifficultyConfig> = {
  entry: {
    id: 'entry',
    label: 'Entry / Junior',
    years: '0 - 2 Years',
    description: 'Foundations of SQL (JOINs, GROUP BY, aggregations), basic metric definitions, descriptive stats, and clear data communication.',
    color: 'emerald',
    badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    borderColor: 'border-emerald-500',
    criteria: [
      'Accurate SQL joins & aggregation logic',
      'Understanding of standard KPIs (MAU, CTR, churn)',
      'Basic descriptive statistics & distributions',
      'Clear, jargon-free verbal explanation'
    ]
  },
  mid: {
    id: 'mid',
    label: 'Mid-Level',
    years: '2 - 5 Years',
    description: 'Complex SQL (Window functions, CTEs), A/B testing methodology, cohort analysis, metric trees, and diagnosing business anomalies.',
    color: 'blue',
    badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    borderColor: 'border-blue-500',
    criteria: [
      'Window functions (ROW_NUMBER, DENSE_RANK, LEAD/LAG)',
      'Root-cause analysis for metric drops',
      'Hypothesis testing & p-value interpretation',
      'Translating ambiguous business asks into specs'
    ]
  },
  senior: {
    id: 'senior',
    label: 'Senior Analyst',
    years: '5 - 8 Years',
    description: 'Data modeling & warehouse design, complex causal inference, product strategy, managing stakeholder pushback, and trade-offs.',
    color: 'violet',
    badgeBg: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    borderColor: 'border-violet-500',
    criteria: [
      'Data architecture & star/snowflake dimensional models',
      'Causal inference & quasi-experimentation (Diff-in-Diff)',
      'Executive communication & prioritization pushback',
      'Identifying confounding variables & selection bias'
    ]
  },
  lead: {
    id: 'lead',
    label: 'Lead / Principal',
    years: '8+ Years',
    description: 'Enterprise data strategy, team mentoring, metric governance, company-wide north star metrics, and cross-functional alignment.',
    color: 'amber',
    badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    borderColor: 'border-amber-500',
    criteria: [
      'North Star metric definition & counter-metric balance',
      'Company-wide experimentation culture & governance',
      'Translating high-level board goals into analytical roadmaps',
      'Mentorship & coaching senior data teams'
    ]
  }
};

export const DEFAULT_QUESTIONS: InterviewQuestion[] = [
  {
    id: 'q-entry-metrics-1',
    category: 'metrics',
    categoryLabel: 'Product & Business Metrics',
    difficulty: 'entry',
    title: 'Diagnosing a Sudden DAU Drop',
    scenario: 'You are an analyst at a mobile food delivery app. On Monday morning, the Product Manager rushes over to you in a panic: "Our Daily Active Users (DAU) dropped by 18% over the weekend compared to last weekend!"',
    question: 'Walk me through your step-by-step framework to investigate why DAU dropped and determine if this is an actual product emergency or a data anomaly.',
    interviewerTip: 'Interviewer wants to see if you jump to conclusions or systematically triage: 1) Verify data pipeline integrity, 2) Segment users by platform/geography, 3) Check seasonality and external events.',
    expectedKeyPoints: [
      'Data pipeline check: ETL job failures, logging gaps, tracking schema changes',
      'Internal vs External factors: App release updates, server downtime, holidays, competitor campaigns',
      'Segmentation: By OS (iOS vs Android), Geography, New vs Returning users, App version',
      'Funnel comparison: Was it app opens, logins, or checkout failures that dropped?',
      'Actionable communication: Keep PM updated on ETA before crying wolf'
    ],
    sampleFollowUps: [
      'What if iOS dropped 35% but Android remained flat? What would you inspect next?',
      'How would you define an active user in the first place?'
    ]
  },
  {
    id: 'q-mid-sql-1',
    category: 'sql',
    categoryLabel: 'SQL & Data Modeling',
    difficulty: 'mid',
    title: 'Cumulative 7-Day Rolling Revenue & Churn Analysis',
    scenario: 'A B2B SaaS startup needs to report rolling 7-day revenue metrics and identify customers who have gone 30+ days without any subscription activity.',
    question: 'In SQL, how would you calculate a 7-day rolling revenue average for every calendar day, and what window function clauses (PARTITION BY, ORDER BY, ROWS/RANGE BETWEEN) are required? How do you ensure days with zero transactions are not skipped?',
    interviewerTip: 'Looking for mastery of Window Functions (AVG() OVER (ORDER BY date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)) and calendar scaffolding using GENERATE_SERIES / date spine table to avoid zero-day gaps.',
    expectedKeyPoints: [
      'Date spine / calendar table: Essential to join against so dates with zero sales are filled with 0',
      'Window syntax: AVG(revenue) OVER (ORDER BY date_day ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)',
      'Difference between ROWS BETWEEN and RANGE BETWEEN when duplicate dates exist',
      'Performance considerations: Window functions over date-indexed tables vs self-joins'
    ],
    sampleFollowUps: [
      'What is the difference between ROW_NUMBER(), RANK(), and DENSE_RANK() in customer ranking?',
      'When would you prefer a CTE over a temporary table in Redshift or Snowflake?'
    ]
  },
  {
    id: 'q-mid-stats-1',
    category: 'stats',
    categoryLabel: 'Statistics & Experimentation',
    difficulty: 'mid',
    title: 'A/B Test Novelty Effect & Sample Ratio Mismatch',
    scenario: 'Your e-commerce team rolled out a new simplified 1-page checkout variant (B) against the traditional 3-step checkout (A). After 3 days, the PM observes variant B has a 25% higher conversion rate with a p-value of 0.01 and wants to ship it to 100% of users immediately.',
    question: 'Why is it dangerous to stop this test early? What statistical pitfalls (peeking problem, novelty effect, sample size calculations) must you warn the PM about, and how would you verify Sample Ratio Mismatch (SRM)?',
    interviewerTip: 'Checks statistical rigor: stopping early inflates Type I error rate (false positive), novelty effect wears off, and test needs to run for full business cycle (e.g. 14 days) to capture weekend behavior.',
    expectedKeyPoints: [
      'Peeking problem: Repeated significance checks drastically inflate alpha (false positive rate)',
      'Novelty effect: Existing users click out of curiosity, which decays over time',
      'Full business cycles: Day-of-week seasonality (weekdays vs weekends) requires minimum 1-2 full weeks',
      'Sample Ratio Mismatch (SRM): Using a Chi-Square goodness-of-fit test to verify traffic split wasn\'t biased by redirection bugs',
      'Pre-determined sample size based on Minimum Detectable Effect (MDE), statistical power (80%), and significance level (5%)'
    ],
    sampleFollowUps: [
      'If your Chi-square test gives p < 0.001 for the 50/50 allocation, what is your next course of action?',
      'How would you explain statistical power to a non-technical product manager?'
    ]
  },
  {
    id: 'q-senior-stakeholder-1',
    category: 'stakeholder',
    categoryLabel: 'Stakeholder & Communication',
    difficulty: 'senior',
    title: 'Pushing Back Against Confirmatory Executive Bias',
    scenario: 'The VP of Marketing recently launched an expensive $500,000 influencer campaign. They present a slide to the C-suite claiming the campaign drove a 40% lift in monthly signups. However, your incrementality analysis shows that 85% of these signups were cannibalized from existing organic search traffic and the true incremental lift is negligible.',
    question: 'How do you handle this sensitive finding? Walk me through how you communicate this to the VP prior to the company-wide executive review without making them defensive, while still protecting data truth.',
    interviewerTip: 'Evaluates executive presence, tact, and diplomatic data storytelling. Strong seniors don\'t ambushed executives in public; they align 1:1, present data objectively with empathy, and suggest constructive forward-looking pivots.',
    expectedKeyPoints: [
      'Private 1-on-1 alignment before any public C-suite presentation (never blindside an executive)',
      'Focus on methodology & incremental customer journeys rather than accusatory phrasing',
      'Acknowledge the positive signals (e.g., brand awareness, high impression volume, specific creator successes)',
      'Frame the insight as optimization: "How we can reallocate the next $500k to genuinely incremental channels with high ROAS"',
      'Offer a co-authored narrative so marketing maintains leadership credibility while reporting accurate numbers'
    ],
    sampleFollowUps: [
      'What if the VP insists on presenting their unverified 40% number despite your warnings?',
      'How do you design a geo-matched holdout test to prove incrementality unequivocally?'
    ]
  },
  {
    id: 'q-lead-metrics-1',
    category: 'metrics',
    categoryLabel: 'Product & Business Metrics',
    difficulty: 'lead',
    title: 'Architecting a Company-Wide North Star Metric Tree',
    scenario: 'You are hired as the Lead Analyst for an emerging subscription streaming platform (similar to Spotify or Netflix). The CEO asks you to define the company North Star Metric and design an interconnected metric tree that aligns Product, Content Acquisition, and Growth Marketing.',
    question: 'What metric would you propose as the North Star? How do you guard against unintended gamification with counter-metrics, and how do you decompose this top-level metric into input metrics for individual squads?',
    interviewerTip: 'Tests leadership-level strategic depth: selecting a metric that captures both value delivered to users and captured business value (e.g. Monthly Active Listening Hours), plus guardrails (churn, gross margin, content licensing cost).',
    expectedKeyPoints: [
      'North Star definition: Must reflect genuine user value and long-term retention (e.g. "Monthly Engaged Streaming Hours with 3+ sessions")',
      'Input levers: Activation rate (D1-D7 retention), Content breadth discovered, Daily repeat frequency',
      'Counter-metrics / Guardrails: Customer acquisition cost (CAC), Subscription churn, Licensing cost per hour',
      'Organizational alignment: How Growth owns Activation/Top-of-funnel, Product owns Depth-of-session, Content owns Catalog utilization',
      'Review cadence and governance to avoid vanity metric inflation'
    ],
    sampleFollowUps: [
      'Why would raw Subscriber Count be a flawed North Star metric for this business?',
      'How do you handle a squad that hits their local KPI while harming the global North Star?'
    ]
  }
];

export const DEFAULT_CODING_CHALLENGES: CodingChallenge[] = [
  {
    id: 'sql-challenge-1',
    difficulty: 'mid',
    category: 'sql',
    title: 'Identify Month-over-Month User Retention Cohorts',
    businessContext: 'Our executive team wants to monitor customer retention by monthly registration cohort to assess whether recent product updates improved long-term engagement.',
    description: 'Write a SQL query that calculates the retention rate for each user signup cohort. For each cohort month, calculate the cohort size (total users registered) and the percentage of those users who placed at least one order in Month 1 (the following calendar month).',
    schemaDetails: 'Tables:\n1. users(user_id INT, signup_date DATE, country VARCHAR)\n2. orders(order_id INT, user_id INT, order_date DATE, order_amount DECIMAL)',
    sampleTables: [
      {
        tableName: 'users',
        columns: ['user_id', 'signup_date', 'country'],
        rows: [
          [101, '2024-01-05', 'US'],
          [102, '2024-01-12', 'CA'],
          [103, '2024-01-20', 'US'],
          [104, '2024-02-02', 'US'],
          [105, '2024-02-15', 'UK'],
          [106, '2024-03-01', 'US']
        ]
      },
      {
        tableName: 'orders',
        columns: ['order_id', 'user_id', 'order_date', 'order_amount'],
        rows: [
          [1, 101, '2024-01-10', 45.00],
          [2, 101, '2024-02-14', 80.00],
          [3, 102, '2024-02-18', 65.00],
          [4, 103, '2024-01-25', 30.00],
          [5, 104, '2024-03-10', 120.00],
          [6, 105, '2024-02-20', 50.00]
        ]
      }
    ],
    starterCode: `-- Write your SQL query here
-- Goal: Calculate cohort month, total users, and Month 1 retention %

WITH user_cohorts AS (
    SELECT 
        user_id,
        DATE_TRUNC('month', signup_date) AS cohort_month
    FROM users
)
SELECT 
    cohort_month,
    COUNT(DISTINCT user_id) AS cohort_size
    -- complete query
FROM user_cohorts
GROUP BY cohort_month;`,
    hints: [
      'Use DATE_TRUNC(\'month\', signup_date) to bucket users into cohorts.',
      'Join orders table and compare DATE_TRUNC(\'month\', order_date) to (cohort_month + INTERVAL \'1 month\').',
      'Retention rate = ROUND(COUNT(DISTINCT retained_users) * 100.0 / cohort_size, 2).'
    ],
    expectedOutputDescription: 'Columns: cohort_month | cohort_size | m1_retained_users | m1_retention_rate_pct',
    modelSolution: `WITH cohorts AS (
    SELECT 
        user_id,
        DATE_TRUNC('month', signup_date) AS cohort_month
    FROM users
),
m1_orders AS (
    SELECT DISTINCT
        c.user_id,
        c.cohort_month
    FROM cohorts c
    JOIN orders o ON c.user_id = o.user_id
    WHERE DATE_TRUNC('month', o.order_date) = c.cohort_month + INTERVAL '1 month'
)
SELECT 
    c.cohort_month,
    COUNT(DISTINCT c.user_id) AS cohort_size,
    COUNT(DISTINCT m1.user_id) AS m1_retained_users,
    ROUND(COUNT(DISTINCT m1.user_id) * 100.0 / COUNT(DISTINCT c.user_id), 2) AS m1_retention_rate_pct
FROM cohorts c
LEFT JOIN m1_orders m1 ON c.user_id = m1.user_id
GROUP BY c.cohort_month
ORDER BY c.cohort_month;`,
    modelExplanation: 'This query uses a clean 2-step CTE pattern. First, it identifies the cohort month for each user. Second, it performs an inner join on orders filtered specifically for Month 1 (exactly one calendar month after signup). Finally, it uses a LEFT JOIN to ensure cohorts with 0 active users in Month 1 are still displayed.'
  },
  {
    id: 'sql-challenge-2',
    difficulty: 'senior',
    category: 'sql',
    title: 'Top 3 Spending Customers per Category with Dense Rank',
    businessContext: 'Marketing wants to reward our highest-value loyalty VIPs in every product category with personalized offers.',
    description: 'Find the top 3 customers who generated the highest total order amount in each product category. If multiple customers tie for total spend, they should receive the same rank without skipping rank numbers (e.g., 1, 2, 2, 3).',
    schemaDetails: 'Tables:\n1. orders(order_id INT, customer_id INT, category VARCHAR, amount DECIMAL, order_date DATE)',
    sampleTables: [
      {
        tableName: 'orders',
        columns: ['order_id', 'customer_id', 'category', 'amount'],
        rows: [
          [1, 501, 'Electronics', 1200.00],
          [2, 502, 'Electronics', 900.00],
          [3, 501, 'Electronics', 400.00],
          [4, 503, 'Electronics', 1500.00],
          [5, 504, 'Electronics', 900.00],
          [6, 505, 'Fashion', 350.00],
          [7, 506, 'Fashion', 600.00],
          [8, 507, 'Fashion', 600.00],
          [9, 508, 'Fashion', 200.00]
        ]
      }
    ],
    starterCode: `-- Find top 3 spenders per category with DENSE_RANK()
WITH customer_category_spend AS (
    SELECT 
        customer_id,
        category,
        SUM(amount) AS total_spent
    FROM orders
    GROUP BY customer_id, category
)
SELECT *
FROM (
    -- Apply your window function here
    SELECT 
        customer_id,
        category,
        total_spent
    FROM customer_category_spend
) ranked
WHERE 1 = 1;`,
    hints: [
      'Aggregate customer spend per category first using GROUP BY customer_id, category.',
      'Use DENSE_RANK() OVER (PARTITION BY category ORDER BY total_spent DESC) to handle ties correctly without skipping numbers.',
      'Filter where dense_rank <= 3 in an outer query.'
    ],
    expectedOutputDescription: 'Columns: category | customer_id | total_spent | rank_in_category (Rank <= 3)',
    modelSolution: `WITH customer_spend AS (
    SELECT 
        category,
        customer_id,
        SUM(amount) AS total_spent
    FROM orders
    GROUP BY category, customer_id
),
ranked_customers AS (
    SELECT 
        category,
        customer_id,
        total_spent,
        DENSE_RANK() OVER (
            PARTITION BY category 
            ORDER BY total_spent DESC
        ) AS rank_in_category
    FROM customer_spend
)
SELECT 
    category,
    customer_id,
    total_spent,
    rank_in_category
FROM ranked_customers
WHERE rank_in_category <= 3
ORDER BY category, rank_in_category, total_spent DESC;`,
    modelExplanation: 'DENSE_RANK() is crucial here because the prompt explicitly mandates that ties do not skip rank numbers. Unlike RANK() (which would jump from 2 to 4 on a tie), DENSE_RANK() numbers consecutive ranks 1, 2, 2, 3. We compute the aggregate per customer first, then window rank over categories.'
  },
  {
    id: 'python-challenge-1',
    difficulty: 'mid',
    category: 'python',
    title: 'Pandas Data Cleansing & Anomaly IQR Outlier Detection',
    businessContext: 'Our data pipeline ingested transaction records containing missing values, erroneous negative prices, and extreme outliers due to bot activity.',
    description: 'Write a Python / Pandas function `clean_and_flag_outliers(df)` that:\n1. Replaces missing values in `user_age` with the median age.\n2. Drops rows where `price` is less than or equal to 0.\n3. Calculates IQR (Interquartile Range) on `transaction_amount` and creates a boolean column `is_outlier` (True if value > Q3 + 1.5*IQR or value < Q1 - 1.5*IQR).',
    schemaDetails: 'Input DataFrame columns: `transaction_id`, `user_age`, `price`, `transaction_amount`',
    starterCode: `import pandas as pd
import numpy as np

def clean_and_flag_outliers(df: pd.DataFrame) -> pd.DataFrame:
    # 1. Impute missing user_age with median
    # 2. Filter price > 0
    # 3. Calculate Q1, Q3, IQR and flag is_outlier
    
    clean_df = df.copy()
    
    # Write your code here
    
    return clean_df`,
    hints: [
      'Use df[\'user_age\'].fillna(df[\'user_age\'].median())',
      'Filter with clean_df = clean_df[clean_df[\'price\'] > 0]',
      'Calculate Q1 = clean_df[\'transaction_amount\'].quantile(0.25) and Q3 = clean_df[\'transaction_amount\'].quantile(0.75)'
    ],
    expectedOutputDescription: 'Cleaned DataFrame with imputed user_age, non-positive prices removed, and is_outlier boolean column added.',
    modelSolution: `import pandas as pd
import numpy as np

def clean_and_flag_outliers(df: pd.DataFrame) -> pd.DataFrame:
    # Make an explicit copy to prevent SettingWithCopyWarning
    clean_df = df.copy()
    
    # 1. Median imputation for user_age
    median_age = clean_df['user_age'].median()
    clean_df['user_age'] = clean_df['user_age'].fillna(median_age)
    
    # 2. Filter out non-positive prices
    clean_df = clean_df[clean_df['price'] > 0].copy()
    
    # 3. Compute Tukey's IQR boundaries for transaction_amount
    q1 = clean_df['transaction_amount'].quantile(0.25)
    q3 = clean_df['transaction_amount'].quantile(0.75)
    iqr = q3 - q1
    
    lower_bound = q1 - 1.5 * iqr
    upper_bound = q3 + 1.5 * iqr
    
    clean_df['is_outlier'] = (clean_df['transaction_amount'] < lower_bound) | (clean_df['transaction_amount'] > upper_bound)
    
    return clean_df`,
    modelExplanation: 'Using Tukey\'s 1.5 * IQR method is the industry standard for non-parametric outlier detection in retail transactions because it does not assume a normal Gaussian distribution. Creating an explicit `.copy()` avoids chained assignment warnings in Pandas.'
  }
];
