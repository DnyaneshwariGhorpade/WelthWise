"""
TC-02: User Login - Valid Credentials

Test Case Description:
  Verify that an existing user can log in with valid credentials and receive a JWT token with role=USER.

Input / Steps:
  1. POST /auth/login with:
     email = user@wealthwise.demo
     password = WealthWise@123

Expected Output:
  - HTTP 200 OK.
  - JWT access token returned with role=USER.

Result:
  Pass
"""

import sys
import os
import requests

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from test_config import get_base_url, print_header, print_step, print_verify, print_summary

def test_tc02_user_login():
    tc_id = "TC-02"
    name = "User Login - Valid Credentials"
    print_header(tc_id, name)

    base_url = get_base_url()
    endpoint = f"{base_url}/auth/login"

    payload = {
        "email": "user@wealthwise.demo",
        "password": "WealthWise@123"
    }

    print_step(1, f"POST {endpoint}")
    print(f"       Payload: email={payload['email']}, password={payload['password']}")

    response = requests.post(endpoint, json=payload)
    status_code = response.status_code
    data = response.json() if response.content else {}

    print_step(2, f"Received HTTP response with Status Code: {status_code}")
    print(f"       Response Body: {data}")

    all_passed = True

    # 1. Status Code Check (HTTP 200)
    v1 = (status_code == 200)
    print_verify(v1, "POST /auth/login returns HTTP 200 OK", f"Received {status_code}")
    all_passed = all_passed and v1

    # 2. JWT Access Token Returned
    token = data.get("token")
    v2 = bool(token and isinstance(token, str) and len(token) > 10)
    print_verify(v2, "JWT access token returned", f"Token: {token[:20]}..." if token else "None")
    all_passed = all_passed and v2

    # 3. User Role is USER
    user = data.get("user", {})
    role = user.get("role")
    v3 = (role == "USER")
    print_verify(v3, "User authenticated with role=USER", f"Role: {role}")
    all_passed = all_passed and v3

    print_summary(tc_id, name, all_passed)
    return all_passed

if __name__ == "__main__":
    success = test_tc02_user_login()
    sys.exit(0 if success else 1)
