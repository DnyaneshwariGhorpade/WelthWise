# SEML Testing Assignment — Live Demo & Test Execution Guide

This guide provides step-by-step instructions to re-run all unit, functional, usability, responsiveness, performance, and security tests on the **WealthWise** project live for your viva evaluation.

---

## 📋 Environment Prerequisites
Make sure Python 3.10+ and Node.js v18+ are available.

```powershell
# Verify runtimes
node -v
npm -v
python --version
```

Install test dependencies (PyTest, Coverage, Selenium, WebDriver Manager):
```powershell
python -m pip install pytest pytest-cov selenium webdriver-manager requests matplotlib python-docx
```

---

## 🚀 Step 1: Start the Application Services

### Terminal 1: Backend API Server
```powershell
cd backend
node src/server.js
```
*Expected Console Output:*
```
Database connection verified.
WealthWise API listening on port 3100
```

### Terminal 2: Frontend Vite Server
```powershell
cd frontend
npm run dev
```
*Expected Console Output:*
```
  VITE v5.4.21  ready in 1376 ms
  ➜  Local:   http://localhost:5173/
```

---

## 🧪 Step 2: Run Part (i) Unit Tests with Code Coverage

### Run PyTest Suite (32 Tests, 98% Code Coverage)
Open **Terminal 3** in the project root directory:
```powershell
python -m pytest tests/unit/test_core_methods.py -v --cov=tests.unit.core_logic --cov-report=term-missing
```
*Expected Output:*
```
============================= 32 passed in 0.18s ==============================
Name                       Stmts   Miss  Cover   Missing
--------------------------------------------------------
tests\unit\core_logic.py     173      3    98%   60-61, 148
--------------------------------------------------------
TOTAL                        173      3    98%
```

### Run Native Node.js Unit Tests (8 Tests)
```powershell
node --test tests/unit/test_native_node.js
```
*Expected Output:*
```
✔ Financial Utilities - clamp01 boundary and normal values
✔ Financial Utilities - round to 2 decimal places
✔ Financial Utilities - fmt Indian number formatting
✔ Financial Utilities - FREQ_MULTIPLIER mapping
✔ Wealth Score Engine - Healthy balanced profile
✔ Wealth Score Engine - Stressed financial profile
✔ Wealth Score Engine - Edge Case: No income, no assets
✔ Auth Service - passwordStrengthCheck validation cases
ℹ pass 8
ℹ fail 0
```

---

## 🌐 Step 3: Run Part (ii) Functional, Responsiveness, Performance & Security Suite
Run the automated end-to-end suite using Selenium and Requests:
```powershell
python tests/functional_and_nonfunctional_suite.py
```
*What this automated suite does:*
1. **Security & RBAC**: Verifies unauthorized requests are rejected (401), invalid tokens blocked (401), and regular users are forbidden from admin routes (403).
2. **Functional User Flows**: Tests Login, Dashboard summary, Finances records, Wealth score calculation, Stress-test scenario execution, and Goal decision feasibility.
3. **Responsiveness**: Captures screenshots and verifies horizontal scroll = False across Desktop (1366px), Tablet (768px), and Mobile (375px).
4. **Performance**: Profiles endpoint response times (average, p95, max over 25 calls), measures full page load time, and runs a 100-request concurrency load test at 20 concurrent threads.
5. **Artifacts Output**:
   - Screenshots saved to: `docs/screenshots/`
   - Performance chart saved to: `docs/screenshots/performance_chart.png`
   - Real metrics saved to: `metrics.json`

---

## 📄 Step 4: Re-Generate the Word Assignment Document
To rebuild the final deliverable Word document with updated live metrics:
```powershell
python build_assignment_doc.py
```
*Generates:* `SEML_Testing_Assignment.docx` (Complete formatted assignment report with all tables, charts, embedded screenshots, and explanations).

---

## 🔑 Demo Credentials for Viva
- **Demo User Account:**
  - Email: `user@wealthwise.demo`
  - Password: `WealthWise@123`
  - Role: `USER`
- **Platform Admin Account:**
  - Email: `admin@wealthwise.demo`
  - Password: `WealthWise@123`
  - Role: `ADMIN`
