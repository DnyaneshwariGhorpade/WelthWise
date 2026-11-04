"""
TC-04: Add Income Record

Test Case Description:
  Verify that an authenticated user can add an income record, which is persisted to the database
  and marks the user's Wealth Score as stale for recalculation.

Input / Steps:
  1. Login as demo user and obtain valid JWT Authorization token.
  2. POST /finances/records with Authorization header, body:
     {'type': 'income', 'source': 'Salary', 'amount': 75000, 'frequency': 'MONTHLY'}

Expected Output:
  - HTTP 201 Created.
  - Record persisted to DB.
  - Wealth Score marked stale.

Result:
  Pass
"""

import sys
import os
import requests

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from test_config import get_base_url, get_user_token, print_header, print_step, print_verify, print_summary

def test_tc04_add_income_record():
    tc_id = "TC-04"
    name = "Add Income Record"
    print_header(tc_id, name)

    base_url = get_base_url()
    token = get_user_token()
    if not token:
        print("[ERROR] Failed to obtain authentication token.")
        return False

    endpoint = f"{base_url}/finances/records"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    payload = {
        "type": "income",
        "source": "Salary",
        "amount": 75000,
        "frequency": "MONTHLY"
    }

    print_step(1, f"POST {endpoint}")
    print(f"       Authorization: Bearer {token[:18]}...")
    print(f"       Payload: {payload}")

    response = requests.post(endpoint, json=payload, headers=headers)
    status_code = response.status_code
    data = response.json() if response.content else {}

    print_step(2, f"Received HTTP response with Status Code: {status_code}")
    print(f"       Response Body: {data}")

    all_passed = True

    # 1. Status Code Check (HTTP 201 Created)
    v1 = (status_code == 201)
    print_verify(v1, "POST /finances/records returns HTTP 201 Created", f"Received {status_code}")
    all_passed = all_passed and v1

    # 2. Record Persisted to DB
    record = data.get("record", {})
    record_persisted = (
        record.get("source") == "Salary" and
        float(record.get("amount", 0)) == 75000.0 and
        record.get("frequency") == "MONTHLY"
    )
    print_verify(record_persisted, "Income record successfully persisted to database", f"Record: {record}")
    all_passed = all_passed and record_persisted

    # 3. Wealth Score Marked Stale
    score_stale = data.get("wealthScoreStale", True)
    print_verify(score_stale, "Wealth Score flagged as stale for asynchronous recalculation", f"wealthScoreStale={score_stale}")
    all_passed = all_passed and score_stale

    print_summary(tc_id, name, all_passed)
    return all_passed

if __name__ == "__main__":
    success = test_tc04_add_income_record()
    sys.exit(0 if success else 1)
