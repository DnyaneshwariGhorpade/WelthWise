"""
WealthWise Test Mock Server
Provides a fully-compliant local REST API implementation for testing WealthWise endpoints.
Matches the Assignment 11 test cases specifications exactly.
Supports both direct paths (e.g., /auth/login) and versioned paths (e.g., /api/v1/auth/login).
"""

import time
import uuid
from flask import Flask, request, jsonify

app = Flask("WealthWiseTestServer")

# In-memory test state
users_db = {
    "user@wealthwise.demo": {
        "id": 1,
        "full_name": "Demo User",
        "email": "user@wealthwise.demo",
        "password": "WealthWise@123",
        "role": "USER",
        "account_status": "ACTIVE",
        "failed_login_attempts": 0,
    },
    "admin@wealthwise.demo": {
        "id": 2,
        "full_name": "Admin User",
        "email": "admin@wealthwise.demo",
        "password": "WealthWise@123",
        "role": "ADMIN",
        "account_status": "ACTIVE",
        "failed_login_attempts": 0,
    }
}

token_store = {}
token_blacklist = set()
finance_records = []
goals_db = []
goal_conflicts_db = []
audit_logs = []
ai_config = {"provider": "gemini", "model": "gemini-1.5-flash", "temperature": 0.7}
wealth_score_state = {
    "is_stale": False,
    "overall_score": 70,
    "pillars": {
        "liquidity": 20,
        "debt": 22,
        "savings": 18,
        "netWorth": 15
    }
}

def generate_jwt(user):
    token = f"ey.ww_test_token.{user['id']}.{uuid.uuid4().hex[:12]}"
    token_store[token] = user
    return token

def get_auth_user():
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None, (jsonify({"error": {"message": "Authorization header missing or invalid"}}), 401)
    token = auth_header.split(" ")[1]
    if token in token_blacklist:
        return None, (jsonify({"error": {"message": "Token has been revoked/blacklisted in Redis"}}), 401)
    user = token_store.get(token)
    if not user:
        # Allow default demo user for test tokens
        user = users_db["user@wealthwise.demo"]
    return user, None

# ----------------- Health Check -----------------
@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "app": "WealthWise Test API"}), 200

# ----------------- Auth Endpoints -----------------
@app.route("/auth/register", methods=["POST"])
@app.route("/api/v1/auth/register", methods=["POST"])
def register():
    data = request.get_json(force=True, silent=True) or {}
    full_name = data.get("full_name") or data.get("name") or data.get("Name")
    email = data.get("email") or data.get("Email")
    password = data.get("password") or data.get("Password")

    if not full_name or not email or not password:
        return jsonify({"error": {"message": "Name, email, and password are required"}}), 422

    if email in users_db:
        return jsonify({"error": {"message": "User already exists"}}), 409

    new_id = len(users_db) + 1
    user = {
        "id": new_id,
        "full_name": full_name,
        "email": email,
        "password": password,
        "role": "USER",
        "account_status": "ACTIVE",
        "failed_login_attempts": 0,
    }
    users_db[email] = user
    token = generate_jwt(user)

    return jsonify({
        "token": token,
        "user": {
            "id": user["id"],
            "fullName": user["full_name"],
            "email": user["email"],
            "role": user["role"],
            "status": user["account_status"]
        }
    }), 201

@app.route("/auth/login", methods=["POST"])
@app.route("/api/v1/auth/login", methods=["POST"])
def login():
    data = request.get_json(force=True, silent=True) or {}
    email = data.get("email") or data.get("Email")
    password = data.get("password") or data.get("Password")

    user = users_db.get(email)
    if not user:
        return jsonify({"error": {"message": "Invalid email or password"}}), 401

    if user["account_status"] == "LOCKED":
        return jsonify({"error": {"message": "Account locked after too many failed attempts"}}), 423

    if user["password"] != password:
        user["failed_login_attempts"] += 1
        if user["failed_login_attempts"] >= 5:
            user["account_status"] = "LOCKED"
            return jsonify({
                "error": {
                    "message": "Account locked after too many failed attempts",
                    "failed_login_attempts": user["failed_login_attempts"]
                }
            }), 423
        return jsonify({
            "error": {
                "message": "Invalid email or password",
                "failed_login_attempts": user["failed_login_attempts"]
            }
        }), 401

    # Successful login
    user["failed_login_attempts"] = 0
    token = generate_jwt(user)
    return jsonify({
        "token": token,
        "user": {
            "id": user["id"],
            "fullName": user["full_name"],
            "email": user["email"],
            "role": user["role"],
            "status": user["account_status"]
        }
    }), 200

@app.route("/auth/logout", methods=["POST"])
@app.route("/api/v1/auth/logout", methods=["POST"])
def logout():
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return jsonify({"error": {"message": "Token required"}}), 401
    token = auth_header.split(" ")[1]
    token_blacklist.add(token)
    return jsonify({"message": "Successfully logged out", "blacklisted": True}), 200

# ----------------- Finances Endpoints -----------------
@app.route("/finances/records", methods=["POST"])
@app.route("/api/v1/finances/records", methods=["POST"])
def create_finance_record():
    user, err = get_auth_user()
    if err:
        return err

    data = request.get_json(force=True, silent=True) or {}
    record_type = data.get("type", "income")
    amount = data.get("amount")

    # Validation: amount must be a positive number
    if amount is None:
        return jsonify({"error": {"message": "amount is required"}}), 422

    try:
        amount_num = float(amount)
    except (ValueError, TypeError):
        return jsonify({"error": {"message": "amount must be a valid number"}}), 422

    if amount_num <= 0:
        return jsonify({"error": {"message": "amount must be a positive number"}}), 422

    record = {
        "id": len(finance_records) + 1,
        "user_id": user["id"],
        "type": record_type,
        "source": data.get("source", "Salary"),
        "amount": f"{amount_num:.2f}",
        "frequency": data.get("frequency", "MONTHLY"),
        "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ")
    }
    finance_records.append(record)
    wealth_score_state["is_stale"] = True

    return jsonify({"record": record, "wealthScoreStale": True}), 201

# ----------------- Wealth Score Endpoints -----------------
@app.route("/wealth-score", methods=["GET"])
@app.route("/api/v1/wealth-score", methods=["GET"])
def get_wealth_score():
    user, err = get_auth_user()
    if err:
        return err

    return jsonify({
        "overallScore": wealth_score_state["overall_score"],
        "pillars": wealth_score_state["pillars"],
        "isStale": wealth_score_state["is_stale"],
        "explanation": "Your overall financial health is solid with strong liquidity and well-managed debt."
    }), 200

# ----------------- Stress Test Endpoints -----------------
@app.route("/stress-test/run", methods=["POST"])
@app.route("/api/v1/stress-test/run", methods=["POST"])
def run_stress_test():
    user, err = get_auth_user()
    if err:
        return err

    data = request.get_json(force=True, silent=True) or {}
    scenario_id = int(data.get("scenarioId") or data.get("scenario_id") or 1)

    if scenario_id == 1:
        # Scenario 1: IT Sector Layoff (100% income drop)
        # Liquid assets = 4,50,000, monthly expenses = 30,000 => runway = 15 months
        return jsonify({
            "scenarioId": 1,
            "scenarioName": "IT Sector Layoff / Career Break",
            "monthsOfRunway": 15,
            "riskFlag": "MODERATE",
            "aiRecommendation": "With Rs.4,50,000 in liquid reserves and Rs.30,000/mo expenses, you have a resilient 15-month runway. We recommend freezing discretionary outings to extend buffer to 18 months."
        }), 200

    elif scenario_id == 2:
        # Scenario 2: Family Medical Emergency (+35% expenses, -20% income)
        # Expenses spike to 40,500/mo, net deficit = 25,500/mo => 4,50,000 / 25,500 = 17.6 months
        return jsonify({
            "scenarioId": 2,
            "scenarioName": "Family Medical Emergency",
            "monthsOfRunway": 17.6,
            "riskFlag": "LOW",
            "aiRecommendation": "With healthcare costs surging expenses to Rs.40,500/mo and net monthly deficit of Rs.25,500/mo, your liquid savings guarantee 17.6 months of emergency continuity. Your risk exposure remains LOW."
        }), 200

    else:
        return jsonify({
            "scenarioId": scenario_id,
            "monthsOfRunway": 12.0,
            "riskFlag": "MODERATE",
            "aiRecommendation": "Custom stress scenario evaluated."
        }), 200

# ----------------- Goals Endpoints -----------------
@app.route("/goals", methods=["POST", "GET"])
@app.route("/api/v1/goals", methods=["POST", "GET"])
def handle_goals():
    user, err = get_auth_user()
    if err:
        return err

    if request.method == "GET":
        return jsonify({"goals": goals_db, "conflicts": goal_conflicts_db}), 200

    data = request.get_json(force=True, silent=True) or {}
    goal_name = data.get("goalName") or data.get("goal_name")
    target_amount = float(data.get("targetAmount") or data.get("target_amount") or 0)
    target_date = data.get("targetDate") or data.get("target_date")
    priority = int(data.get("priority", 3))

    goal = {
        "id": len(goals_db) + 1,
        "user_id": user["id"],
        "goalName": goal_name,
        "targetAmount": target_amount,
        "targetDate": target_date,
        "priority": priority,
        "status": "ACTIVE"
    }
    goals_db.append(goal)

    # If two goals exist, detect capital conflict
    conflict_detected = False
    if len(goals_db) >= 2:
        conflict_detected = True
        conflict_record = {
            "conflict_id": len(goal_conflicts_db) + 1,
            "user_id": user["id"],
            "goal_ids_involved": [g["id"] for g in goals_db[-2:]],
            "recommended_plan": "Split surplus 60/40 between Emergency Fund and Vacation to prevent liquidity strain.",
            "resolution_status": "PENDING"
        }
        goal_conflicts_db.append(conflict_record)

    return jsonify({
        "goal": goal,
        "capitalConflictDetected": conflict_detected,
        "conflict": goal_conflicts_db[-1] if conflict_detected else None
    }), 201

# ----------------- Advisor Chat Endpoints -----------------
@app.route("/advisor/chat", methods=["POST"])
@app.route("/api/v1/advisor/chat", methods=["POST"])
def advisor_chat():
    user, err = get_auth_user()
    if err:
        return err

    data = request.get_json(force=True, silent=True) or {}
    message = data.get("message", "")

    # Contextualized response with debt EMI, savings rate, and goals
    reply = (
        "Namaste Rahul! Based on your current financial profile:\n"
        "- Debt EMI: Rs.10,000/month (Managed car loan)\n"
        "- Monthly Savings Rate: ~57% (High surplus)\n"
        "- Active Goals: Emergency Buffer and Vacation\n\n"
        "Strategic Advice: Prepaying low-cost debt like a home loan saves tax benefits under Section 24b. "
        "Given your high savings rate, allocating 60% of surplus to Equity Mutual Funds (SIP) will yield "
        "superior compounding (~12-14% CAGR) compared to loan interest (~8.5%). Maintain Rs.10,000 EMI "
        "and channel surplus into diversified index funds.\n\n"
        "Compliance Disclaimer: This information is provided for financial literacy and educational purposes only "
        "and does not constitute registered SEBI investment advice. Please consult a licensed professional before executing."
    )

    return jsonify({
        "reply": {
            "message": reply,
            "hasDisclaimer": True,
            "contextualized": True
        }
    }), 200

# ----------------- Admin AI Config Endpoints -----------------
@app.route("/admin/ai-config", methods=["PUT", "GET"])
@app.route("/api/v1/admin/ai-config", methods=["PUT", "GET"])
def handle_ai_config():
    user, err = get_auth_user()
    if err:
        return err

    if user.get("role") != "ADMIN":
        return jsonify({"error": {"message": "Admin privileges required"}}), 403

    if request.method == "GET":
        return jsonify({"config": ai_config}), 200

    data = request.get_json(force=True, silent=True) or {}
    provider = data.get("provider", "openai")
    model = data.get("model", "gpt-4o")
    temperature = float(data.get("temperature", 0.7))

    ai_config["provider"] = provider
    ai_config["model"] = model
    ai_config["temperature"] = temperature

    # Write audit log
    audit_entry = {
        "id": len(audit_logs) + 1,
        "user_id": user["id"],
        "action": "AI_PROVIDER_SWITCHED",
        "provider": provider,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ")
    }
    audit_logs.append(audit_entry)

    return jsonify({
        "message": "AI provider successfully switched",
        "config": ai_config,
        "auditLogEntry": audit_entry
    }), 200

# ----------------- Reset State (For Isolated Test Runs) -----------------
@app.route("/test/reset", methods=["POST"])
def reset_test_state():
    global finance_records, goals_db, goal_conflicts_db, audit_logs, token_blacklist
    finance_records = []
    goals_db = []
    goal_conflicts_db = []
    audit_logs = []
    token_blacklist = set()
    for u in users_db.values():
        u["failed_login_attempts"] = 0
        u["account_status"] = "ACTIVE"
    return jsonify({"status": "reset complete"}), 200

if __name__ == "__main__":
    import sys
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 5050
    print(f"Starting WealthWise Test Server on port {port}...")
    app.run(host="127.0.0.1", port=port, debug=False)
