"""
Shared Test Configuration and Helper Library
Supports standalone execution of each test case.
Automatically verifies or boots the local test server in the background.
ASCII safe for Windows console / PowerShell.
"""

import sys
import os
import time
import threading
import requests

# Ensure console handles output safely on Windows
try:
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    if hasattr(sys.stderr, 'reconfigure'):
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
except Exception:
    pass

DEFAULT_PORTS = [5050, 3100, 3000]
_server_started = False
_active_base_url = None

def _run_server_thread(port):
    import logging
    # Suppress verbose Flask logs in test runs
    log = logging.getLogger('werkzeug')
    log.setLevel(logging.ERROR)
    from test_server import app
    app.run(host="127.0.0.1", port=port, debug=False, use_reloader=False)

def get_base_url():
    global _server_started, _active_base_url
    if _active_base_url:
        return _active_base_url

    # Check if a server is already alive on one of the default ports
    for port in DEFAULT_PORTS:
        url = f"http://127.0.0.1:{port}"
        try:
            res = requests.get(f"{url}/health", timeout=0.8)
            if res.status_code == 200:
                _active_base_url = url
                return _active_base_url
        except Exception:
            continue

    # Otherwise, spin up our embedded test server on port 5050
    port = 5050
    t = threading.Thread(target=_run_server_thread, args=(port,), daemon=True)
    t.start()
    _server_started = True

    # Wait for server to come online
    target_url = f"http://127.0.0.1:{port}"
    for _ in range(30):
        try:
            res = requests.get(f"{target_url}/health", timeout=0.5)
            if res.status_code == 200:
                _active_base_url = target_url
                return _active_base_url
        except Exception:
            time.sleep(0.1)

    raise RuntimeError("Failed to connect to or start the WealthWise test server.")

def print_header(tc_id, name):
    print("=" * 75)
    print(f" TEST CASE: {tc_id} - {name}")
    print("=" * 75)

def print_step(step_num, description):
    print(f"\n[Step {step_num}] {description}")

def print_verify(passed, description, details=None):
    mark = "[PASS] [OK]" if passed else "[FAIL] [X]"
    print(f"  {mark} {description}")
    if details:
        print(f"        Details: {details}")

def print_summary(tc_id, name, passed):
    status_str = "PASS" if passed else "FAIL"
    print("\n" + "-" * 75)
    print(f"FINAL RESULT FOR {tc_id} ({name}): >>> {status_str} <<<")
    print("-" * 75 + "\n")
    return passed

def get_user_token(email="user@wealthwise.demo", password="WealthWise@123"):
    base_url = get_base_url()
    res = requests.post(f"{base_url}/auth/login", json={"email": email, "password": password})
    if res.status_code == 200:
        return res.json().get("token")
    return None

def get_admin_token(email="admin@wealthwise.demo", password="WealthWise@123"):
    base_url = get_base_url()
    res = requests.post(f"{base_url}/auth/login", json={"email": email, "password": password})
    if res.status_code == 200:
        return res.json().get("token")
    return None
