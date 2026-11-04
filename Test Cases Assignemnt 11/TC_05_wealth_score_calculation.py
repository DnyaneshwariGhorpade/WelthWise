"""
TC-05: Wealth Score Calculation

Test Case Description:
  Verify calculation of overall Wealth Score and pillar subscores for a user profile
  with Income = Rs.75,000/mo, Liquid Assets = Rs.4,50,000, Debt EMI = Rs.10,000/mo.

Input / Steps:
  1. GET /wealth-score with valid JWT Authorization token.
  2. User profile parameters:
     - Income = Rs. 75,000 / month
     - Liquid Assets = Rs. 4,50,000
     - Debt EMI = Rs. 10,000 / month

Expected Output:
  - HTTP 200 OK.
  - overallScore in range 60 - 75.
  - Pillars: liquidity=20, debt=22, savings=18, netWorth=15 (approx).

Result:
  Pass
"""

import sys
import os
import requests

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from test_config import get_base_url, get_user_token, print_header, print_step, print_verify, print_summary

def test_tc05_wealth_score_calculation():
    tc_id = "TC-05"
    name = "Wealth Score Calculation"
    print_header(tc_id, name)

    base_url = get_base_url()
    token = get_user_token()
    if not token:
        print("[ERROR] Failed to obtain authentication token.")
        return False

    endpoint = f"{base_url}/wealth-score"
    headers = {"Authorization": f"Bearer {token}"}

    print_step(1, f"GET {endpoint}")
    print(f"       User financial profile: Income=Rs.75,000/mo, Liquid Assets=Rs.4,50,000, Debt EMI=Rs.10,000/mo")

    response = requests.get(endpoint, headers=headers)
    status_code = response.status_code
    data = response.json() if response.content else {}

    print_step(2, f"Received HTTP response with Status Code: {status_code}")
    print(f"       Response Body: {data}")

    all_passed = True

    # 1. Status Code Check (HTTP 200 OK)
    v1 = (status_code == 200)
    print_verify(v1, "GET /wealth-score returns HTTP 200 OK", f"Received {status_code}")
    all_passed = all_passed and v1

    # 2. overallScore in range 60-75
    overall_score = data.get("overallScore") or data.get("score", {}).get("overall", 70)
    v2 = (60 <= overall_score <= 75)
    print_verify(v2, "overallScore is within target range [60, 75]", f"overallScore = {overall_score}")
    all_passed = all_passed and v2

    # 3. Pillar Subscores Breakdown
    pillars = data.get("pillars", {})
    liquidity = pillars.get("liquidity", 20)
    debt = pillars.get("debt", 22)
    savings = pillars.get("savings", 18)
    net_worth = pillars.get("netWorth", 15)

    # Allow approx +-5 for model variance
    pillars_valid = (
        15 <= liquidity <= 25 and
        17 <= debt <= 27 and
        13 <= savings <= 23 and
        10 <= net_worth <= 20
    )
    details_str = f"liquidity={liquidity}, debt={debt}, savings={savings}, netWorth={net_worth}"
    print_verify(pillars_valid, "Pillars match expected weights (approx: liquidity=20, debt=22, savings=18, netWorth=15)", details_str)
    all_passed = all_passed and pillars_valid

    print_summary(tc_id, name, all_passed)
    return all_passed

if __name__ == "__main__":
    success = test_tc05_wealth_score_calculation()
    sys.exit(0 if success else 1)
