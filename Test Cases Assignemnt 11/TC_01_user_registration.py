"""
TC-01: User Registration - Valid Data

Test Case Description:
  Verify that a new user can register successfully with valid details.

Input / Steps:
  1. Navigate to /register
  2. Enter: Name=Rahul Sharma, Email=rahul@test.com, Password=Test@1234
  3. Submit registration form (POST /auth/register)

Expected Output:
  - POST /auth/register returns HTTP 201 Created.
  - User record created in DB.
  - JWT token returned.

Result:
  Pass
"""

import sys
import os
import requests

# Add current directory to path for test_config import
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from test_config import get_base_url, print_header, print_step, print_verify, print_summary

def test_tc01_user_registration():
    tc_id = "TC-01"
    name = "User Registration - Valid Data"
    print_header(tc_id, name)
    
    base_url = get_base_url()
    endpoint = f"{base_url}/auth/register"

    payload = {
        "full_name": "Rahul Sharma",
        "email": "rahul@test.com",
        "password": "Test@1234"
    }

    print_step(1, f"Navigate to /register and POST {endpoint}")
    print(f"       Payload: Name={payload['full_name']}, Email={payload['email']}, Password=******")

    response = requests.post(endpoint, json=payload)
    status_code = response.status_code
    data = response.json() if response.content else {}

    print_step(2, f"Received HTTP response with Status Code: {status_code}")
    print(f"       Response Body: {data}")

    # Verifications
    all_passed = True

    # 1. Status Code Check (HTTP 201)
    v1 = (status_code == 201)
    print_verify(v1, "POST /auth/register returns HTTP 201 Created", f"Received {status_code}")
    all_passed = all_passed and v1

    # 2. JWT Token Returned
    token = data.get("token")
    v2 = bool(token and isinstance(token, str) and len(token) > 10)
    print_verify(v2, "JWT access token returned in response", f"Token: {token[:20]}..." if token else "None")
    all_passed = all_passed and v2

    # 3. User record created in DB with correct data
    user = data.get("user", {})
    user_created = (
        user.get("fullName") == "Rahul Sharma" and 
        user.get("email") == "rahul@test.com" and 
        user.get("role") == "USER"
    )
    print_verify(user_created, "User record created with valid data", f"User: {user}")
    all_passed = all_passed and user_created

    # Summary
    print_summary(tc_id, name, all_passed)
    return all_passed

if __name__ == "__main__":
    success = test_tc01_user_registration()
    sys.exit(0 if success else 1)
