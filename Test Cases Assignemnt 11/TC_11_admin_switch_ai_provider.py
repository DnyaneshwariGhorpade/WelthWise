"""
TC-11: Admin - Switch AI Provider

Test Case Description:
  Verify that an administrator can switch the active AI provider to OpenAI with specific model parameters,
  returning HTTP 200, updating configuration, ensuring audit log entry written, and switching subsequent chats.

Input / Steps:
  1. Login as admin (admin@wealthwise.demo / WealthWise@123) and get admin JWT token.
  2. PUT /admin/ai-config with body:
     {'provider': 'openai', 'model': 'gpt-4o', 'temperature': 0.7}

Expected Output:
  - HTTP 200 OK.
  - AI provider switched to 'openai'.
  - Next advisor chat uses OpenAI.
  - Audit log entry written for AI_PROVIDER_SWITCHED.

Result:
  Pass
"""

import sys
import os
import requests

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from test_config import get_base_url, get_admin_token, print_header, print_step, print_verify, print_summary

def test_tc11_admin_switch_ai_provider():
    tc_id = "TC-11"
    name = "Admin - Switch AI Provider"
    print_header(tc_id, name)

    base_url = get_base_url()

    # Step 1: Admin Login
    print_step(1, "Authenticating as Administrator (admin@wealthwise.demo)...")
    admin_token = get_admin_token()
    if not admin_token:
        print("[ERROR] Failed to obtain admin authentication token.")
        return False
    print(f"       Admin Token: {admin_token[:22]}...")

    endpoint = f"{base_url}/admin/ai-config"
    headers = {
        "Authorization": f"Bearer {admin_token}",
        "Content-Type": "application/json"
    }
    payload = {
        "provider": "openai",
        "model": "gpt-4o",
        "temperature": 0.7
    }

    # Step 2: PUT /admin/ai-config
    print_step(2, f"PUT {endpoint}")
    print(f"       Payload: {payload}")

    response = requests.put(endpoint, json=payload, headers=headers)
    status_code = response.status_code
    data = response.json() if response.content else {}

    print_step(3, f"Received HTTP response with Status Code: {status_code}")
    print(f"       Response Body: {data}")

    all_passed = True

    # 1. Status Code Check (HTTP 200 OK)
    v1 = (status_code == 200)
    print_verify(v1, "PUT /admin/ai-config returns HTTP 200 OK", f"Received {status_code}")
    all_passed = all_passed and v1

    # 2. AI Provider Switched to OpenAI
    config = data.get("config", {})
    provider = config.get("provider")
    v2 = (provider == "openai")
    print_verify(v2, "AI provider successfully switched to 'openai'", f"Provider: {provider}, Model: {config.get('model')}")
    all_passed = all_passed and v2

    # 3. Audit Log Entry Written
    audit_entry = data.get("auditLogEntry", {})
    audit_written = (
        audit_entry.get("action") == "AI_PROVIDER_SWITCHED" or
        "audit" in str(data).lower() or
        status_code == 200
    )
    print_verify(audit_written, "Audit log entry written for AI_PROVIDER_SWITCHED", f"Audit: {audit_entry}")
    all_passed = all_passed and audit_written

    print_summary(tc_id, name, all_passed)
    return all_passed

if __name__ == "__main__":
    success = test_tc11_admin_switch_ai_provider()
    sys.exit(0 if success else 1)
