
import requests

BASE_URL = "http://localhost:3100/api/v1"

# Demo credentials
EMAIL = "user@wealthwise.demo"
PASSWORD = "WealthWise@123"


def get_token():
    """Log in and return the actual token provided by the API."""
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json={"email": EMAIL, "password": PASSWORD}
    )
    assert response.status_code == 200, (
        f"Login failed: {response.status_code} - {response.text}"
    )
    return response.json()["token"]


# TC-01: User Registration
def test_register():
    data = {
        "full_name": "Rahul Sharma",
        "email": "rahul_test_new@test.com",
        "password": "Test@1234"
    }

    response = requests.post(f"{BASE_URL}/auth/register", json=data)
    assert response.status_code in [201, 409], response.text


# TC-02: Valid Login
def test_login():
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json={"email": EMAIL, "password": PASSWORD}
    )
    assert response.status_code == 200, response.text
    assert "token" in response.json()


# TC-03: Invalid Password
def test_invalid_login():
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json={"email": EMAIL, "password": "WrongPassword123"}
    )
    assert response.status_code == 401, response.text


# TC-04: Add Income
def test_add_income():
    token = get_token()
    response = requests.post(
        f"{BASE_URL}/finances/records",
        json={
            "type": "income",
            "source": "Salary",
            "amount": 75000,
            "frequency": "MONTHLY"
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 201, response.text


# TC-05: Wealth Score
def test_wealth_score():
    token = get_token()
    response = requests.get(
        f"{BASE_URL}/wealth-score",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200, response.text


# TC-06: Job Loss Stress Test
def test_job_loss():
    token = get_token()
    response = requests.post(
        f"{BASE_URL}/stress-test/run",
        json={"scenario_id": 1},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 201, response.text

# TC-07: Medical Emergency Stress Test
def test_medical_emergency():
    token = get_token()
    response = requests.post(
        f"{BASE_URL}/stress-test/run",
        json={"scenario_id": 2},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 201, response.text



# TC-08: Create Goal
def test_create_goal():
    token = get_token()
    response = requests.post(
        f"{BASE_URL}/goals",
        json={
            "goal_name": "Emergency Fund Test",
            "target_amount": 200000,
            "target_date": "2027-03-31",
            "priority": 1
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 201, response.text


# TC-09: AI Advisor Chat
def test_advisor_chat():
    token = get_token()
    response = requests.post(
        f"{BASE_URL}/advisor/chat",
        json={"message": "Should I prepay my home loan or invest?"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 201, response.text


# TC-10: Logout
def test_logout():
    token = get_token()
    response = requests.post(
        f"{BASE_URL}/auth/logout",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200, response.text


