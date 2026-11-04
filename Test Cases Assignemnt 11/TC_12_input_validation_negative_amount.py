"""
TC-12: Input Validation - Negative Amount

Test Case Description:
  Verify that the financial records API validates input and rejects negative amounts with
  HTTP 422 Unprocessable Entity, returning 'amount must be a positive number' and ensuring
  the invalid record is NOT persisted to the database.

Input / Steps:
  1. Login and get valid JWT token.
  2. POST /finances/records with amount = -5000:
     {'type': 'income', 'source': 'Bonus', 'amount': -5000, 'frequency': 'MONTHLY'}

Expected Output:
  - HTTP 422 Unprocessable Entity.
  - Error: 'amount must be a positive number'.
  - Record NOT persisted to database.

Result:
  Pass
"""

import sys
import os
import requests

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from test_config import get_base_url, get_user_token, print_header, print_step, print_verify, print_summary

def test_tc12_input_validation_negative_amount():
    tc_id = "TC-12"
    name = "Input Validation - Negative Amount"
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
        "source": "Bonus",
        "amount": -5000,
        "frequency": "MONTHLY"
    }

    print_step(1, f"POST {endpoint}")
    print(f"       Invalid Payload with negative amount: {payload}")

    response = requests.post(endpoint, json=payload, headers=headers)
    status_code = response.status_code
    data = response.json() if response.content else {}

    print_step(2, f"Received HTTP response with Status Code: {status_code}")
    print(f"       Response Body: {data}")

    all_passed = True

    # 1. Status Code Check (HTTP 422 Unprocessable Entity)
    v1 = (status_code == 422)
    print_verify(v1, "POST /finances/records returns HTTP 422 Unprocessable Entity", f"Received {status_code}")
    all_passed = all_passed and v1

    # 2. Error message: 'amount must be a positive number'
    error_msg = str(data.get("error", {}).get("message", "")).lower()
    v2 = ("amount must be a positive number" in error_msg or "positive" in error_msg)
    print_verify(v2, "Error message contains 'amount must be a positive number'", f"Error message: {error_msg}")
    all_passed = all_passed and v2

    # 3. Record NOT persisted
    record_persisted = ("record" in data and data.get("record") is not None)
    v3 = not record_persisted
    print_verify(v3, "Record was rejected and NOT persisted to the database", f"Record field present: {record_persisted}")
    all_passed = all_passed and v3

    print_summary(tc_id, name, all_passed)
    return all_passed

if __name__ == "__main__":
    success = test_tc12_input_validation_negative_amount()
    sys.exit(0 if success else 1)
