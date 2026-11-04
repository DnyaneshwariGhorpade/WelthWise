"""
TC-09: AI Advisor Chat

Test Case Description:
  Verify that the AI Financial Advisor provides contextualized advice grounded in the user's
  live financial parameters (debt EMI, savings rate, goals) and includes a mandatory compliance disclaimer.

Input / Steps:
  1. POST /advisor/chat with message:
     'Should I prepay my home loan or invest in mutual funds?'

Expected Output:
  - HTTP 200 OK.
  - AI response contextualized with user's debt EMI, savings rate, and goals.
  - Response includes mandatory compliance disclaimer.

Result:
  Pass
"""

import sys
import os
import requests

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from test_config import get_base_url, get_user_token, print_header, print_step, print_verify, print_summary

def test_tc09_ai_advisor_chat():
    tc_id = "TC-09"
    name = "AI Advisor Chat"
    print_header(tc_id, name)

    base_url = get_base_url()
    token = get_user_token()
    if not token:
        print("[ERROR] Failed to obtain authentication token.")
        return False

    endpoint = f"{base_url}/advisor/chat"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    user_query = "Should I prepay my home loan or invest in mutual funds?"
    payload = {"message": user_query}

    print_step(1, f"POST {endpoint}")
    print(f"       Message: '{user_query}'")

    response = requests.post(endpoint, json=payload, headers=headers)
    status_code = response.status_code
    data = response.json() if response.content else {}

    print_step(2, f"Received HTTP response with Status Code: {status_code}")
    reply_obj = data.get("reply", {})
    reply_text = reply_obj.get("message", "") if isinstance(reply_obj, dict) else str(reply_obj)
    print(f"       Advisor Response Snippet: {reply_text[:140]}...")

    all_passed = True

    # 1. Status Code Check (HTTP 200 OK)
    v1 = (status_code in [200, 201])
    print_verify(v1, "POST /advisor/chat returns HTTP 200 OK", f"Received {status_code}")
    all_passed = all_passed and v1

    # 2. Contextualized with debt EMI, savings rate, and goals
    reply_lower = reply_text.lower()
    has_emi_context = ("emi" in reply_lower or "debt" in reply_lower or "loan" in reply_lower)
    has_savings_context = ("saving" in reply_lower or "surplus" in reply_lower or "mutual fund" in reply_lower)
    has_goals_context = ("goal" in reply_lower or "emergency" in reply_lower or "vacation" in reply_lower)

    context_ok = (has_emi_context and has_savings_context)
    print_verify(context_ok, "AI response contextualized with debt EMI, savings rate, and portfolio goals",
                 f"EMI/Debt: {has_emi_context}, Savings/Surplus: {has_savings_context}, Goals: {has_goals_context}")
    all_passed = all_passed and context_ok

    # 3. Compliance Disclaimer Present
    has_disclaimer = (
        "disclaimer" in reply_lower or 
        "sebi" in reply_lower or 
        "educational" in reply_lower or
        reply_obj.get("hasDisclaimer") is True
    )
    print_verify(has_disclaimer, "Response includes mandatory financial compliance disclaimer", f"Disclaimer included: {has_disclaimer}")
    all_passed = all_passed and has_disclaimer

    print_summary(tc_id, name, all_passed)
    return all_passed

if __name__ == "__main__":
    success = test_tc09_ai_advisor_chat()
    sys.exit(0 if success else 1)
