"""
TC-08: Goal Creation & Conflict Detection

Test Case Description:
  Verify that creating multiple competing financial goals triggers capital conflict detection,
  returning HTTP 201 for both and creating a GoalConflict record with resolution_status = PENDING.

Input / Steps:
  1. POST /goals with:
     {'goalName': 'Emergency Fund', 'targetAmount': 200000, 'targetDate': '2027-03-31', 'priority': 1}
  2. POST /goals with second goal:
     {'goalName': 'Vacation', 'targetAmount': 150000, 'targetDate': '2027-01-31', 'priority': 2}

Expected Output:
  - HTTP 201 Created for both goals.
  - Capital conflict detected between competing milestones.
  - GoalConflict record created with resolution_status = 'PENDING'.

Result:
  Pass
"""

import sys
import os
import requests

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from test_config import get_base_url, get_user_token, print_header, print_step, print_verify, print_summary

def test_tc08_goal_creation_conflict_detection():
    tc_id = "TC-08"
    name = "Goal Creation & Conflict Detection"
    print_header(tc_id, name)

    base_url = get_base_url()
    token = get_user_token()
    if not token:
        print("[ERROR] Failed to obtain authentication token.")
        return False

    endpoint = f"{base_url}/goals"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    all_passed = True

    # 1. First Goal: Emergency Fund
    goal1_payload = {
        "goalName": "Emergency Fund",
        "goal_name": "Emergency Fund",
        "targetAmount": 200000,
        "target_amount": 200000,
        "targetDate": "2027-03-31",
        "target_date": "2027-03-31",
        "priority": 1
    }
    print_step(1, f"POST {endpoint} (Goal 1: Emergency Fund, Rs.2,00,000, Priority 1)")
    res1 = requests.post(endpoint, json=goal1_payload, headers=headers)
    status1 = res1.status_code
    data1 = res1.json() if res1.content else {}

    v1 = (status1 == 201)
    print_verify(v1, "Goal 1 creation returns HTTP 201 Created", f"Status: {status1}")
    all_passed = all_passed and v1

    # 2. Second Goal: Vacation (competing timeline & capital)
    goal2_payload = {
        "goalName": "Vacation",
        "goal_name": "Vacation",
        "targetAmount": 150000,
        "target_amount": 150000,
        "targetDate": "2027-01-31",
        "target_date": "2027-01-31",
        "priority": 2
    }
    print_step(2, f"POST {endpoint} (Goal 2: Vacation, Rs.1,50,000, Priority 2)")
    res2 = requests.post(endpoint, json=goal2_payload, headers=headers)
    status2 = res2.status_code
    data2 = res2.json() if res2.content else {}

    v2 = (status2 == 201)
    print_verify(v2, "Goal 2 creation returns HTTP 201 Created", f"Status: {status2}")
    all_passed = all_passed and v2

    # 3. Capital Conflict Detected
    print_step(3, "Checking for Capital Conflict Detection...")
    conflict_detected = (
        data2.get("capitalConflictDetected") is True or
        data2.get("conflict") is not None or
        data2.get("conflicts") is not None
    )
    print_verify(conflict_detected, "Capital conflict detected between competing goals", f"Conflict detected: {conflict_detected}")
    all_passed = all_passed and conflict_detected

    # 4. GoalConflict record created with resolution_status = PENDING
    conflict = data2.get("conflict", {})
    status_pending = (conflict.get("resolution_status") == "PENDING" or conflict.get("resolutionStatus") == "PENDING")
    print_verify(status_pending, "GoalConflict record created with resolution_status = 'PENDING'", f"Conflict Record: {conflict}")
    all_passed = all_passed and status_pending

    print_summary(tc_id, name, all_passed)
    return all_passed

if __name__ == "__main__":
    success = test_tc08_goal_creation_conflict_detection()
    sys.exit(0 if success else 1)
