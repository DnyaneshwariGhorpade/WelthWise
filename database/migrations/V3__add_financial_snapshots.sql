-- ==================================================================
-- WealthWise — V3: Monthly financial snapshots (dashboard trend charts)
-- ==================================================================

CREATE TABLE financial_snapshots (
  snapshot_id    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id        BIGINT        NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  monthly_income DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  monthly_expense DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  net_worth      DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  taken_at       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_financial_snapshots_user ON financial_snapshots(user_id, taken_at DESC);