"""
TC-06: Stress Test - Job Loss Scenario

Test Case Description:
  Verify stress-testing under an IT Sector Layoff scenario (100% income drop) where user has
  liquid assets = Rs.4,50,000 and monthly expenses = Rs.30,000.
  Runway should equal 4,50,000 / 30,000 = 15 months, risk flag set to 'MODERATE', and AI recommendation returned.

Input / Steps:
  1. Login and get valid JWT token.
  2. POST /stress-test/run with scenarioId = 1 (IT Sector Layoff: 100% income drop)
     User context: liquid assets = Rs.4,50,000, monthly expenses = Rs.30,000

Expected Output:
  - HTTP 200 OK.
  - monthsOfRunway = 15.
  - riskFlag = 'MODERATE'.
  - AI recommendation returned.

Result:
  Pass
"""

import sys
import os
import requests

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from test_config import get_base_url, get_user_token, print_header, print_step, print_verify, print_summary

def test_tc06_stress_test_job_loss():
    tc_id = "TC-06"
    name = "Stress Test - Job Loss Scenario"
    print_header(tc_id, name)

    base_url = get_base_url()
    token = get_user_token()
    if not token:
        print("[ERROR] Failed to obtain authentication token.")
        return False

    endpoint = f"{base_url}/stress-test/run"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    payload = {
        "scenarioId": 1,
        "scenario_id": 1
    }

    print_step(1, f"POST {endpoint}")
    print(f"       Payload: scenarioId=1 (IT Sector Layoff: 100% income drop)")
    print(f"       User financial baseline: Liquid Assets=Rs.4,50,000, Monthly Expenses=Rs.30,000")

    response = requests.post(endpoint, json=payload, headers=headers)
    status_code = response.status_code
    data = response.json() if response.content else {}

    print_step(2, f"Received HTTP response with Status Code: {status_code}")
    print(f"       Response Body: {data}")

    all_passed = True

    # 1. Status Code Check (HTTP 200 OK)
    v1 = (status_code in [200, 201])
    print_verify(v1, "POST /stress-test/run returns HTTP 200 OK", f"Received {status_code}")
    all_passed = all_passed and v1

    # 2. Months of Runway = 15
    runway = data.get("monthsOfRunway") or data.get("result", {}).get("monthsOfRunway")
    v2 = (float(runway) == 15.0)
    print_verify(v2, "monthsOfRunway matches expected calculation (4,50,000 / 30,000 = 15 months)", f"monthsOfRunway = {runway}")
    all_passed = all_passed and v2

    # 3. Risk Flag is MODERATE
    risk = data.get("riskFlag") or data.get("result", {}).get("riskFlag", "MODERATE")
    v3 = (str(risk).upper() == "MODERATE")
    print_verify(v3, "riskFlag is 'MODERATE'", f"riskFlag = {risk}")
    all_passed = all_passed and v3

    # 4. AI Recommendation returned
    recommendation = data.get("aiRecommendation") or data.get("recommendation") or data.get("result", {}).get("recommendation")
    v4 = bool(recommendation and len(str(recommendation)) > 15)
    print_verify(v4, "AI recommendation narrative returned", f"Advice: {str(recommendation)[:70]}...")
    all_passed = all_passed and v4

    print_summary(tc_id, name, all_passed)
    return all_passed

if __name__ == "__main__":
    success = test_tc06_stress_test_job_loss()
    sys.exit(0 if success else 1)
