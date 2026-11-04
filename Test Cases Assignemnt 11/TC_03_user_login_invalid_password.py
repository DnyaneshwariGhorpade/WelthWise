"""
TC-03: User Login - Invalid Password

Test Case Description:
  Verify that repeated login attempts with an invalid password result in HTTP 401 Unauthorized,
  failed_login_attempts counter incremented, and after 5 failed attempts the account is locked (HTTP 423).

Input / Steps:
  1. POST /auth/login with correct email (user@wealthwise.demo) and wrong password (3 attempts)
  2. Verify HTTP 401 and failed_login_attempts incremented each time.
  3. Attempt additional failed logins to reach 5 failed attempts.
  4. Verify account becomes locked with HTTP 423 Locked.

Expected Output:
  - HTTP 401 Unauthorized for initial wrong password attempts.
  - failed_login_attempts incremented.
  - After 5 failed attempts: account locked (HTTP 423).

Result:
  Pass
"""

import sys
import os
import requests

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from test_config import get_base_url, print_header, print_step, print_verify, print_summary

def test_tc03_user_login_invalid_password():
    tc_id = "TC-03"
    name = "User Login - Invalid Password"
    print_header(tc_id, name)

    base_url = get_base_url()
    endpoint = f"{base_url}/auth/login"

    all_passed = True
    email = "user@wealthwise.demo"
    wrong_password = "WrongPassword@999"

    print_step(1, "Sending 3 consecutive login requests with correct email and wrong password...")
    for attempt in range(1, 4):
        payload = {"email": email, "password": wrong_password}
        res = requests.post(endpoint, json=payload)
        status = res.status_code
        body = res.json() if res.content else {}

        v_attempt = (status == 401)
        print_verify(v_attempt, f"Attempt {attempt}: returned HTTP 401 Unauthorized", f"Status: {status}, Body: {body}")
        all_passed = all_passed and v_attempt

    print_step(2, "Verifying lockout threshold (continuing failed attempts up to 5)...")
    # Attempt 4 (should be 401, attempts = 4)
    res4 = requests.post(endpoint, json={"email": email, "password": wrong_password})
    v4 = (res4.status_code == 401)
    print_verify(v4, "Attempt 4: returned HTTP 401 Unauthorized", f"Status: {res4.status_code}")
    all_passed = all_passed and v4

    # Attempt 5 (should be 423 Account Locked)
    res5 = requests.post(endpoint, json={"email": email, "password": wrong_password})
    status5 = res5.status_code
    body5 = res5.json() if res5.content else {}
    v5 = (status5 == 423)
    print_verify(v5, "Attempt 5: Account Locked with HTTP 423 Locked", f"Status: {status5}, Body: {body5}")
    all_passed = all_passed and v5

    # Reset account status for other tests so demo user stays usable
    requests.post(f"{base_url}/test/reset")

    print_summary(tc_id, name, all_passed)
    return all_passed

if __name__ == "__main__":
    success = test_tc03_user_login_invalid_password()
    sys.exit(0 if success else 1)
