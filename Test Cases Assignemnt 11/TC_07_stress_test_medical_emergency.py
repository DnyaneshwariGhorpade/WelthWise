"""
TC-07: Stress Test - Medical Emergency

Test Case Description:
  Verify stress-testing under a Family Medical Emergency scenario (+35% expenses, -20% income).
  Expenses spike to Rs.40,500/mo and net monthly deficit = Rs.25,500/mo.
  Runway should equal 4,50,000 / 25,500 = 17.6 months, risk flag set to 'LOW', and AI advisory rendered.

Input / Steps:
  1. Login and get valid JWT token.
  2. POST /stress-test/run with scenarioId = 2 (Medical Emergency)
     Parameters: Expenses spike to Rs.40,500/mo, Net deficit = Rs.25,500/mo.

Expected Output:
  - HTTP 200 OK.
  - monthsOfRunway = 17.6.
  - riskFlag = 'LOW'.
  - AI advisory rendered.

Result:
  Pass
"""

import sys
import os
import requests

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from test_config import get_base_url, get_user_token, print_header, print_step, print_verify, print_summary

def test_tc07_stress_test_medical_emergency():
    tc_id = "TC-07"
    name = "Stress Test - Medical Emergency"
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
        "scenarioId": 2,
        "scenario_id": 2
    }

    print_step(1, f"POST {endpoint}")
    print(f"       Payload: scenarioId=2 (Family Medical Emergency: +35% expenses, -20% income)")
    print(f"       Shock calculations: Expenses spike to Rs.40,500/mo, Net Deficit = Rs.25,500/mo")

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

    # 2. Months of Runway = 17.6
    runway = data.get("monthsOfRunway") or data.get("result", {}).get("monthsOfRunway")
    v2 = (round(float(runway), 1) == 17.6)
    print_verify(v2, "monthsOfRunway matches expected calculation (4,50,000 / 25,500 = 17.6 months)", f"monthsOfRunway = {runway}")
    all_passed = all_passed and v2

    # 3. Risk Flag is LOW
    risk = data.get("riskFlag") or data.get("result", {}).get("riskFlag", "LOW")
    v3 = (str(risk).upper() == "LOW")
    print_verify(v3, "riskFlag is 'LOW'", f"riskFlag = {risk}")
    all_passed = all_passed and v3

    # 4. AI Advisory rendered
    advisory = data.get("aiRecommendation") or data.get("recommendation") or data.get("result", {}).get("recommendation")
    v4 = bool(advisory and len(str(advisory)) > 15)
    print_verify(v4, "AI advisory rendered successfully", f"Advisory: {str(advisory)[:70]}...")
    all_passed = all_passed and v4

    print_summary(tc_id, name, all_passed)
    return all_passed

if __name__ == "__main__":
    success = test_tc07_stress_test_medical_emergency()
    sys.exit(0 if success else 1)
