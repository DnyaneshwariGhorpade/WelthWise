# WealthWise — Test Cases Assignment 11

Automated test suite implemented in Python for the 12 core test cases of the **WealthWise AI-Powered Personal Wealth Planner** system.

---

## 📋 Test Case Mapping & Specification

| TC ID | Test Case | Input / Steps | Expected Output | Result |
| :--- | :--- | :--- | :--- | :---: |
| **TC-01** | User Registration – Valid Data | Navigate to `/register`. Enter: `Name=Rahul Sharma`, `Email=rahul@test.com`, `Password=Test@1234` | `POST /auth/register` returns HTTP 201. User record created in DB. JWT token returned. | **Pass** |
| **TC-02** | User Login – Valid Credentials | `POST /auth/login` with `email=user@wealthwise.demo`, `password=WealthWise@123` | HTTP 200. JWT access token returned with `role=USER`. | **Pass** |
| **TC-03** | User Login – Invalid Password | `POST /auth/login` with correct email, wrong password (3 attempts) | HTTP 401 Unauthorized. `failed_login_attempts` incremented. After 5 failed: account locked (HTTP 423). | **Pass** |
| **TC-04** | Add Income Record | `POST /finances/records` with Authorization header, body: `{'type':'income', 'source':'Salary', 'amount':75000, 'frequency':'MONTHLY'}` | HTTP 201. Record persisted to DB. Wealth Score marked stale. | **Pass** |
| **TC-05** | Wealth Score Calculation | `GET /wealth-score` with valid JWT. User has: `Income=₹75,000/mo`, `Liquid Assets=₹4,50,000`, `Debt EMI=₹10,000/mo` | HTTP 200. `overallScore` in range 60–75. Pillars: liquidity=20, debt=22, savings=18, netWorth=15 (approx). | **Pass** |
| **TC-06** | Stress Test – Job Loss Scenario | `POST /stress-test/run` with `scenarioId=1` (IT Sector Layoff: 100% income drop). User has liquid assets=₹4,50,000, monthly expenses=₹30,000. | HTTP 200. `monthsOfRunway=15`. `riskFlag='MODERATE'`. AI recommendation returned. | **Pass** |
| **TC-07** | Stress Test – Medical Emergency | `POST /stress-test/run` with `scenarioId=2` (Medical: +35% expenses, -20% income). Expenses spike to ₹40,500/mo. Net deficit=₹25,500/mo. | HTTP 200. `monthsOfRunway=17.6`. `riskFlag='LOW'`. AI advisory rendered. | **Pass** |
| **TC-08** | Goal Creation & Conflict Detection | `POST /goals` with: `{'goalName':'Emergency Fund', 'targetAmount':200000, 'targetDate':'2027-03-31', 'priority':1}`. Then POST second goal: `{'goalName':'Vacation', 'targetAmount':150000, 'targetDate':'2027-01-31', 'priority':2}` | HTTP 201 for both. Capital conflict detected. `GoalConflict` record created with `resolution_status=PENDING`. | **Pass** |
| **TC-09** | AI Advisor Chat | `POST /advisor/chat` with message: `'Should I prepay my home loan or invest in mutual funds?'` | HTTP 200. AI response contextualized with user's debt EMI, savings rate, and goals. Response includes compliance disclaimer. | **Pass** |
| **TC-10** | JWT Token Revocation on Logout | `POST /auth/logout` with valid JWT. Then attempt `GET /wealth-score` with the same token. | Logout: HTTP 200. Subsequent request: HTTP 401 Unauthorized (token blacklisted in Redis). | **Pass** |
| **TC-11** | Admin – Switch AI Provider | `PUT /admin/ai-config` with body: `{'provider':'openai', 'model':'gpt-4o', 'temperature':0.7}`. Login as `admin@wealthwise.demo`. | HTTP 200. AI provider switched. Next advisor chat uses OpenAI. Audit log entry written. | **Pass** |
| **TC-12** | Input Validation – Negative Amount | `POST /finances/records` with `amount=-5000` | HTTP 422 Unprocessable Entity. Error: 'amount must be a positive number'. Record NOT persisted. | **Pass** |

---

## 📂 Directory Structure

```text
Test Cases Assignemnt 11/
├── TC_01_user_registration.py               # TC-01: Valid user registration test
├── TC_02_user_login.py                      # TC-02: Valid user login test
├── TC_03_user_login_invalid_password.py     # TC-03: Invalid password & lockout test
├── TC_04_add_income_record.py               # TC-04: Add income record test
├── TC_05_wealth_score_calculation.py        # TC-05: Wealth score calculation test
├── TC_06_stress_test_job_loss.py            # TC-06: IT layoff stress test
├── TC_07_stress_test_medical_emergency.py   # TC-07: Medical emergency stress test
├── TC_08_goal_creation_conflict_detection.py# TC-08: Dual goal conflict detection test
├── TC_09_ai_advisor_chat.py                 # TC-09: Contextual AI advisor chat test
├── TC_10_jwt_token_revocation.py            # TC-10: Token blacklist revocation on logout
├── TC_11_admin_switch_ai_provider.py        # TC-11: Admin AI provider switch & audit log
├── TC_12_input_validation_negative_amount.py# TC-12: Input validation for negative amounts
├── test_config.py                           # Shared test helpers & auto server bootstrap
├── test_server.py                           # WealthWise REST API test server simulator
├── run_all_tests.py                         # Master test suite runner & report generator
└── README.md                                # Documentation and instructions
```

---

## 🚀 How to Run the Tests

### Option 1: Run All 12 Test Cases (Recommended)

Run the master test runner to execute all 12 test cases in sequence and output the full formatted summary table:

```bash
python "Test Cases Assignemnt 11/run_all_tests.py"
```

### Option 2: Run Any Individual Test Case

Each test file is completely standalone and automatically handles server connectivity:

```bash
# Example: Run TC-01
python "Test Cases Assignemnt 11/TC_01_user_registration.py"

# Example: Run TC-02
python "Test Cases Assignemnt 11/TC_02_user_login.py"

# Example: Run TC-05
python "Test Cases Assignemnt 11/TC_05_wealth_score_calculation.py"

# Example: Run TC-08
python "Test Cases Assignemnt 11/TC_08_goal_creation_conflict_detection.py"

# Example: Run TC-11
python "Test Cases Assignemnt 11/TC_11_admin_switch_ai_provider.py"
```

---

## ⚙️ Architecture & Features

1. **Standalone & Self-Contained**: If an external WealthWise backend isn't already running, `test_config.py` automatically initializes an in-memory test API server (`test_server.py`) in a background daemon thread.
2. **Real Network I/O**: Every test script issues real HTTP requests (`POST`, `GET`, `PUT`) using the Python `requests` library.
3. **Cross-Platform & Console-Safe**: Handles character encodings safely across Windows PowerShell, CMD, Linux, and macOS.
4. **Comprehensive Validations**: Validates status codes, payload structures, database persistence flags, JWT authentication headers, audit logs, and business rules.
