"""
TC-10: JWT Token Revocation on Logout

Test Case Description:
  Verify that when an authenticated user logs out, their JWT token is added to the revocation blacklist
  (in Redis/cache), causing any subsequent request with the same token to be rejected with HTTP 401 Unauthorized.

Input / Steps:
  1. Login and get valid JWT token.
  2. POST /auth/logout with Authorization header: Bearer <token>.
  3. Attempt GET /wealth-score with the revoked token.

Expected Output:
  - Logout returns HTTP 200 OK.
  - Subsequent request returns HTTP 401 Unauthorized (token blacklisted).

Result:
  Pass
"""

import sys
import os
import requests

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from test_config import get_base_url, get_user_token, print_header, print_step, print_verify, print_summary

def test_tc10_jwt_token_revocation():
    tc_id = "TC-10"
    name = "JWT Token Revocation on Logout"
    print_header(tc_id, name)

    base_url = get_base_url()

    # Step 1: Obtain a fresh token specifically for logout testing
    print_step(1, "Authenticating user to receive active JWT token...")
    token = get_user_token()
    if not token:
        print("[ERROR] Failed to obtain authentication token.")
        return False
    print(f"       Active Token: {token[:22]}...")

    headers = {"Authorization": f"Bearer {token}"}
    logout_endpoint = f"{base_url}/auth/logout"
    resource_endpoint = f"{base_url}/wealth-score"

    # Step 2: Perform Logout
    print_step(2, f"POST {logout_endpoint} with Bearer token")
    logout_res = requests.post(logout_endpoint, headers=headers)
    logout_status = logout_res.status_code
    logout_body = logout_res.json() if logout_res.content else {}

    all_passed = True
    v1 = (logout_status == 200)
    print_verify(v1, "POST /auth/logout returns HTTP 200 OK", f"Status: {logout_status}, Body: {logout_body}")
    all_passed = all_passed and v1

    # Step 3: Attempt protected access using the now revoked token
    print_step(3, f"Attempt GET {resource_endpoint} using the revoked token...")
    subsequent_res = requests.get(resource_endpoint, headers=headers)
    subsequent_status = subsequent_res.status_code
    subsequent_body = subsequent_res.json() if subsequent_res.content else {}

    v2 = (subsequent_status == 401)
    print_verify(v2, "Subsequent request returns HTTP 401 Unauthorized (token blacklisted in Redis)",
                 f"Status: {subsequent_status}, Body: {subsequent_body}")
    all_passed = all_passed and v2

    print_summary(tc_id, name, all_passed)
    return all_passed

if __name__ == "__main__":
    success = test_tc10_jwt_token_revocation()
    sys.exit(0 if success else 1)
