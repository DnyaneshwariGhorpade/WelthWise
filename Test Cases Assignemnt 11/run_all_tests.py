"""
Master Test Suite Runner for Assignment 11
Executes all 12 test cases in sequence and generates a comprehensive test execution report.
"""

import sys
import os
import time

# Ensure current directory is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from TC_01_user_registration import test_tc01_user_registration
from TC_02_user_login import test_tc02_user_login
from TC_03_user_login_invalid_password import test_tc03_user_login_invalid_password
from TC_04_add_income_record import test_tc04_add_income_record
from TC_05_wealth_score_calculation import test_tc05_wealth_score_calculation
from TC_06_stress_test_job_loss import test_tc06_stress_test_job_loss
from TC_07_stress_test_medical_emergency import test_tc07_stress_test_medical_emergency
from TC_08_goal_creation_conflict_detection import test_tc08_goal_creation_conflict_detection
from TC_09_ai_advisor_chat import test_tc09_ai_advisor_chat
from TC_10_jwt_token_revocation import test_tc10_jwt_token_revocation
from TC_11_admin_switch_ai_provider import test_tc11_admin_switch_ai_provider
from TC_12_input_validation_negative_amount import test_tc12_input_validation_negative_amount

TEST_CASES = [
    ("TC-01", "User Registration - Valid Data", "POST /auth/register returns HTTP 201. User created. JWT returned.", test_tc01_user_registration),
    ("TC-02", "User Login - Valid Credentials", "HTTP 200. JWT access token returned with role=USER.", test_tc02_user_login),
    ("TC-03", "User Login - Invalid Password", "HTTP 401. failed_attempts incremented. After 5: locked (HTTP 423).", test_tc03_user_login_invalid_password),
    ("TC-04", "Add Income Record", "HTTP 201. Record persisted to DB. Wealth Score marked stale.", test_tc04_add_income_record),
    ("TC-05", "Wealth Score Calculation", "HTTP 200. overallScore in range 60-75. Pillars breakdown calculated.", test_tc05_wealth_score_calculation),
    ("TC-06", "Stress Test - Job Loss Scenario", "HTTP 200. monthsOfRunway=15. riskFlag='MODERATE'. AI advisory returned.", test_tc06_stress_test_job_loss),
    ("TC-07", "Stress Test - Medical Emergency", "HTTP 200. monthsOfRunway=17.6. riskFlag='LOW'. AI advisory rendered.", test_tc07_stress_test_medical_emergency),
    ("TC-08", "Goal Creation & Conflict Detection", "HTTP 201 for both. Capital conflict detected. GoalConflict PENDING.", test_tc08_goal_creation_conflict_detection),
    ("TC-09", "AI Advisor Chat", "HTTP 200. AI response contextualized with debt/savings/goals + disclaimer.", test_tc09_ai_advisor_chat),
    ("TC-10", "JWT Token Revocation on Logout", "Logout: HTTP 200. Subsequent request: HTTP 401 Unauthorized.", test_tc10_jwt_token_revocation),
    ("TC-11", "Admin - Switch AI Provider", "HTTP 200. AI provider switched. Audit log entry written.", test_tc11_admin_switch_ai_provider),
    ("TC-12", "Input Validation - Negative Amount", "HTTP 422 Unprocessable Entity. Error message. Record NOT persisted.", test_tc12_input_validation_negative_amount),
]

def main():
    print("\n" + "#" * 80)
    print("   WEALTHWISE AUTOMATED TEST EXECUTION SUITE - ASSIGNMENT 11")
    print("#" * 80 + "\n")

    results = []
    start_time = time.time()

    for tc_id, name, expected, test_func in TEST_CASES:
        try:
            passed = test_func()
        except Exception as e:
            print(f"[ERROR] Exception during {tc_id}: {e}")
            passed = False
        results.append((tc_id, name, expected, passed))
        time.sleep(0.05)

    duration = time.time() - start_time

    # Print Summary Table matching Assignment 11 format
    print("\n" + "=" * 90)
    print("                    ASSIGNMENT 11: TEST CASE RESULTS SUMMARY TABLE")
    print("=" * 90)
    header = f"{'TC ID':<8} | {'Test Case':<36} | {'Expected Output':<32} | {'Result':<6}"
    print(header)
    print("-" * 90)

    total_passed = 0
    for tc_id, name, expected, passed in results:
        res_str = "Pass" if passed else "Fail"
        if passed:
            total_passed += 1
        # Truncate expected if needed for clean formatting
        exp_short = (expected[:29] + "...") if len(expected) > 32 else expected
        print(f"{tc_id:<8} | {name:<36} | {exp_short:<32} | {res_str:<6}")

    print("-" * 90)
    total_tests = len(results)
    pass_pct = (total_passed / total_tests) * 100
    print(f"Total Test Cases: {total_tests} | Passed: {total_passed} | Failed: {total_tests - total_passed} | Pass Rate: {pass_pct:.1f}%")
    print(f"Total Execution Time: {duration:.2f} seconds")
    print("=" * 90 + "\n")

    return 0 if total_passed == total_tests else 1

if __name__ == "__main__":
    sys.exit(main())
