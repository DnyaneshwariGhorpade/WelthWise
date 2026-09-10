-- ==================================================================
-- WealthWise — V1: Initial schema (Supabase / PostgreSQL)
-- Mirrors WealthWise_Database_Schema_and_System_Architecture.docx,
-- adapted from MySQL 8 to PostgreSQL 15 for Supabase.
-- ==================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Modules 1 & 7: Identity, account & enums -------------------------
CREATE TYPE user_role AS ENUM ('USER', 'ADMIN');
CREATE TYPE account_status AS ENUM ('ACTIVE', 'LOCKED', 'DEACTIVATED');
CREATE TYPE frequency AS ENUM ('MONTHLY', 'QUARTERLY', 'YEARLY');
CREATE TYPE liquidity_level AS ENUM ('HIGH', 'MEDIUM', 'LOW');
CREATE TYPE risk_level AS ENUM ('LOW', 'MEDIUM', 'HIGH');
CREATE TYPE insight_type AS ENUM ('SCORE_CHANGE', 'GOAL_CONFLICT', 'STRESS_ALERT', 'GENERAL');
CREATE TYPE chat_sender AS ENUM ('USER', 'AI');
CREATE TYPE goal_status AS ENUM ('ACTIVE', 'COMPLETED', 'ARCHIVED');
CREATE TYPE conflict_status AS ENUM ('PENDING', 'ACCEPTED', 'MODIFIED', 'DISMISSED');
CREATE TYPE verdict AS ENUM ('ADVISABLE', 'CAUTION', 'NOT_ADVISABLE');

-- Table: users ---------------------------------------------------
CREATE TABLE users (
  user_id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  full_name          VARCHAR(150)  NOT NULL,
  email              VARCHAR(255)  NOT NULL UNIQUE,
  password_hash      VARCHAR(255)  NOT NULL,
  role               user_role     NOT NULL DEFAULT 'USER',
  account_status     account_status NOT NULL DEFAULT 'ACTIVE',
  failed_login_attempts SMALLINT     NOT NULL DEFAULT 0 CHECK (failed_login_attempts BETWEEN 0 AND 255),
  last_login_at      TIMESTAMP,
  created_at         TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Module 2: Financial Data Management ----------------------------
CREATE TABLE incomes (
  income_id   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id     BIGINT        NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  source      VARCHAR(120)  NOT NULL,
  amount      DECIMAL(14,2) NOT NULL DEFAULT 0.00 CHECK (amount >= 0),
  frequency   frequency     NOT NULL DEFAULT 'MONTHLY',
  created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE expenses (
  expense_id  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id     BIGINT        NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  category    VARCHAR(100)  NOT NULL,
  amount      DECIMAL(14,2) NOT NULL DEFAULT 0.00 CHECK (amount >= 0),
  frequency   frequency     NOT NULL DEFAULT 'MONTHLY',
  created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE assets (
  asset_id       BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id        BIGINT          NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  asset_type     VARCHAR(100)    NOT NULL,
  current_value  DECIMAL(14,2)   NOT NULL DEFAULT 0.00 CHECK (current_value >= 0),
  liquidity_level liquidity_level NOT NULL DEFAULT 'MEDIUM',
  updated_at     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE liabilities (
  liability_id       BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id            BIGINT        NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  liability_type     VARCHAR(100)  NOT NULL,
  outstanding_amount DECIMAL(14,2) NOT NULL DEFAULT 0.00 CHECK (outstanding_amount >= 0),
  interest_rate      DECIMAL(5,2),
  updated_at         TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE investments (
  investment_id   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id         BIGINT        NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  investment_type VARCHAR(100)  NOT NULL,
  amount_invested DECIMAL(14,2) NOT NULL DEFAULT 0.00 CHECK (amount_invested >= 0),
  risk_level      risk_level    NOT NULL DEFAULT 'MEDIUM',
  created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Module 3: Wealth Scoring Engine --------------------------------
CREATE TABLE wealth_scores (
  score_id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id           BIGINT   NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  overall_score     SMALLINT NOT NULL CHECK (overall_score BETWEEN 0 AND 100),
  savings_subscore  SMALLINT CHECK (savings_subscore BETWEEN 0 AND 100),
  debt_subscore     SMALLINT CHECK (debt_subscore BETWEEN 0 AND 100),
  liquidity_subscore SMALLINT CHECK (liquidity_subscore BETWEEN 0 AND 100),
  growth_subscore   SMALLINT CHECK (growth_subscore BETWEEN 0 AND 100),
  ai_explanation    TEXT,
  calculated_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Module 4: Financial Stress Testing -----------------------------
CREATE TABLE stress_test_scenarios (
  scenario_id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name                VARCHAR(100)  NOT NULL,
  description         TEXT,
  income_impact_pct   DECIMAL(5,2)  NOT NULL DEFAULT 0.00,
  expense_impact_pct  DECIMAL(5,2)  NOT NULL DEFAULT 0.00
);

CREATE TABLE stress_test_results (
  result_id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id           BIGINT         NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  scenario_id       BIGINT         NOT NULL REFERENCES stress_test_scenarios(scenario_id),
  months_of_runway  DECIMAL(5,1)   NOT NULL,
  weakest_point     VARCHAR(150),
  ai_recommendation TEXT,
  is_stale          BOOLEAN        NOT NULL DEFAULT FALSE,
  run_at            TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Module 5: Goal Conflict & Decision Advisor ----------------------
CREATE TABLE financial_goals (
  goal_id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id         BIGINT        NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  goal_name       VARCHAR(150)  NOT NULL,
  target_amount   DECIMAL(14,2) NOT NULL CHECK (target_amount >= 0),
  current_amount  DECIMAL(14,2) NOT NULL DEFAULT 0.00 CHECK (current_amount >= 0),
  target_date     DATE,
  priority        SMALLINT      NOT NULL DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
  status          goal_status   NOT NULL DEFAULT 'ACTIVE',
  created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE goal_conflicts (
  conflict_id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id             BIGINT          NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  goal_ids_involved   JSONB           NOT NULL,
  recommended_plan    JSONB,
  resolution_status   conflict_status NOT NULL DEFAULT 'PENDING',
  detected_at         TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE decision_evaluations (
  evaluation_id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id               BIGINT   NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  decision_description  TEXT     NOT NULL,
  ai_verdict            verdict  NOT NULL,
  ai_reasoning          TEXT     NOT NULL,
  source_data_snapshot  JSONB    NOT NULL,
  evaluated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Module 6: Dashboard & AI Advisor -------------------------------
CREATE TABLE ai_insights (
  insight_id    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id       BIGINT        NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  insight_type  insight_type  NOT NULL DEFAULT 'GENERAL',
  message       TEXT          NOT NULL,
  is_read       BOOLEAN       NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE advisor_chat_messages (
  message_id    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id       BIGINT       NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  sender        chat_sender  NOT NULL,
  message_text  TEXT         NOT NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Module 7: Security & Audit --------------------------------------
CREATE TABLE audit_logs (
  log_id        BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id       BIGINT REFERENCES users(user_id) ON DELETE SET NULL,
  action        VARCHAR(150) NOT NULL,
  resource_type VARCHAR(100),
  resource_id   BIGINT,
  ip_address    VARCHAR(45),
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexing Strategy ------------------------------------------------
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE INDEX idx_finance_user ON incomes(user_id);
CREATE INDEX idx_finance_user ON expenses(user_id);
CREATE INDEX idx_finance_user ON assets(user_id);
CREATE INDEX idx_finance_user ON liabilities(user_id);
CREATE INDEX idx_finance_user ON investments(user_id);
CREATE INDEX idx_wealth_scores_trend ON wealth_scores(user_id, calculated_at DESC);
CREATE INDEX idx_stress_results_latest ON stress_test_results(user_id, run_at DESC);
CREATE INDEX idx_goals_user_status ON financial_goals(user_id, status);
CREATE INDEX idx_conflicts_status ON goal_conflicts(user_id, resolution_status);
CREATE INDEX idx_audit_action_date ON audit_logs(action, created_at DESC);