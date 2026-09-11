-- ==================================================================
-- WealthWise — Dev seed data
-- Sample stress-test scenarios + demo user (password: WealthWise@123
-- hashed with bcrypt, cost 10) and a demo goal for a demo user.
-- ==================================================================

INSERT INTO stress_test_scenarios (name, description, income_impact_pct, expense_impact_pct) VALUES
  ('Job Loss',            'Primary income stops for up to 6 months.',          100.00,  0.00),
  ('Medical Emergency',   'Unexpected medical costs and reduced income.',       20.00, 30.00),
  ('Income Drop',         'Income falls by half for a sustained period.',       50.00,  0.00);

-- Demo user: user@wealthwise.demo / WealthWise@123
INSERT INTO users (full_name, email, password_hash, role) VALUES
  ('Demo User', 'user@wealthwise.demo', '$2a$10$./a0/xIHdVBpn8Tz.xNx0eyxMTJETV0f6Ih61MRWOeoUy7gg9ioVm', 'USER'),
  ('Admin', 'admin@wealthwise.demo', '$2a$10$OpcjlCFPPb1CnIbC1dk7/uGTc3L6xdawrwooGWT8AxDuIja83WkjO', 'ADMIN');

-- Demo financial data (user_id = 1)
INSERT INTO incomes (user_id, source, amount, frequency) VALUES
  (1, 'Salary', 4500.00, 'MONTHLY'),
  (1, 'Freelance', 800.00, 'MONTHLY');

INSERT INTO expenses (user_id, category, amount, frequency) VALUES
  (1, 'Rent', 1400.00, 'MONTHLY'),
  (1, 'Groceries', 500.00, 'MONTHLY'),
  (1, 'Insurance', 250.00, 'MONTHLY');

INSERT INTO assets (user_id, asset_type, current_value, liquidity_level) VALUES
  (1, 'Savings Account', 12000.00, 'HIGH'),
  (1, 'Vehicle', 15000.00, 'LOW');

INSERT INTO liabilities (user_id, liability_type, outstanding_amount, interest_rate) VALUES
  (1, 'Credit Card', 3400.00, 24.00);

INSERT INTO investments (user_id, investment_type, amount_invested, risk_level) VALUES
  (1, 'Mutual Fund', 8000.00, 'MEDIUM'),
  (1, 'Fixed Deposit', 10000.00, 'LOW');

INSERT INTO financial_goals (user_id, goal_name, target_amount, current_amount, target_date, priority, status) VALUES
  (1, 'Emergency Fund', 18000.00, 12000.00, '2026-12-31', 1, 'ACTIVE'),
  (1, 'Down Payment', 60000.00, 8000.00, '2028-06-30', 3, 'ACTIVE');