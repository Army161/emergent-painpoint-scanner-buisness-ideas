"""IdeaRadar Backend API Tests"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "test@idearadar.com"
TEST_PASSWORD = "test1234"

@pytest.fixture(scope="module")
def auth_token():
    resp = requests.post(f"{BASE_URL}/api/auth/login", json={"email": TEST_EMAIL, "password": TEST_PASSWORD})
    if resp.status_code == 200:
        return resp.json()["token"]
    pytest.skip("Login failed")

@pytest.fixture(scope="module")
def auth_headers(auth_token):
    return {"Authorization": f"Bearer {auth_token}"}


# Auth tests
class TestAuth:
    """Authentication endpoint tests"""

    def test_login_success(self):
        resp = requests.post(f"{BASE_URL}/api/auth/login", json={"email": TEST_EMAIL, "password": TEST_PASSWORD})
        assert resp.status_code == 200
        data = resp.json()
        assert "token" in data
        assert "user" in data
        assert data["user"]["email"] == TEST_EMAIL

    def test_login_invalid(self):
        resp = requests.post(f"{BASE_URL}/api/auth/login", json={"email": "wrong@test.com", "password": "bad"})
        assert resp.status_code == 401

    def test_register_duplicate(self):
        resp = requests.post(f"{BASE_URL}/api/auth/register", json={"email": TEST_EMAIL, "name": "Test", "password": TEST_PASSWORD})
        assert resp.status_code == 400

    def test_register_new_user(self):
        import uuid
        unique_email = f"TEST_{uuid.uuid4().hex[:8]}@test.com"
        resp = requests.post(f"{BASE_URL}/api/auth/register", json={"email": unique_email, "name": "Test User", "password": "test1234"})
        assert resp.status_code == 200
        data = resp.json()
        assert "token" in data
        assert data["user"]["email"] == unique_email.lower()
        assert data["user"]["is_premium"] == False
        assert data["user"]["free_briefs_used"] == 0

    def test_me_endpoint(self, auth_headers):
        resp = requests.get(f"{BASE_URL}/api/auth/me", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["email"] == TEST_EMAIL
        assert "password_hash" not in data
        assert "_id" not in data

    def test_me_unauthorized(self):
        resp = requests.get(f"{BASE_URL}/api/auth/me")
        assert resp.status_code == 401


# Ideas tests
class TestIdeas:
    """Ideas feed and detail tests"""

    def test_feed_returns_ideas(self):
        resp = requests.get(f"{BASE_URL}/api/ideas/feed")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        assert len(data) == 15

    def test_feed_source_filter(self):
        resp = requests.get(f"{BASE_URL}/api/ideas/feed?source=reddit")
        assert resp.status_code == 200
        data = resp.json()
        assert all(idea["source"] == "reddit" for idea in data)

    def test_feed_sort_newest(self):
        resp = requests.get(f"{BASE_URL}/api/ideas/feed?sort=newest")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) > 0

    def test_feed_sort_score(self):
        resp = requests.get(f"{BASE_URL}/api/ideas/feed?sort=score")
        assert resp.status_code == 200
        data = resp.json()
        # Verify sorted by opportunity_score descending
        scores = [i["opportunity_score"] for i in data]
        assert scores == sorted(scores, reverse=True)

    def test_trending(self):
        resp = requests.get(f"{BASE_URL}/api/ideas/trending")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        assert len(data) > 0
        assert all(idea["trending"] == True for idea in data)

    def test_idea_detail(self):
        resp = requests.get(f"{BASE_URL}/api/ideas/idea_001")
        assert resp.status_code == 200
        data = resp.json()
        assert data["id"] == "idea_001"
        assert "opportunity_score" in data
        assert "_id" not in data

    def test_idea_not_found(self):
        resp = requests.get(f"{BASE_URL}/api/ideas/nonexistent_id")
        assert resp.status_code == 404


# Save/unsave tests
class TestSaveIdea:
    """Save idea toggle tests"""

    def test_save_idea(self, auth_headers):
        resp = requests.post(f"{BASE_URL}/api/ideas/idea_001/save", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert "saved" in data

    def test_toggle_save(self, auth_headers):
        # Save
        resp1 = requests.post(f"{BASE_URL}/api/ideas/idea_002/save", headers=auth_headers)
        assert resp1.status_code == 200
        saved_state = resp1.json()["saved"]

        # Toggle
        resp2 = requests.post(f"{BASE_URL}/api/ideas/idea_002/save", headers=auth_headers)
        assert resp2.status_code == 200
        assert resp2.json()["saved"] != saved_state

    def test_get_saved_ideas(self, auth_headers):
        resp = requests.get(f"{BASE_URL}/api/ideas/user/saved", headers=auth_headers)
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_save_requires_auth(self):
        resp = requests.post(f"{BASE_URL}/api/ideas/idea_001/save")
        assert resp.status_code == 401


# Subscription tests
class TestSubscription:
    """Subscription upgrade test (mocked)"""

    def test_upgrade_to_premium(self, auth_headers):
        resp = requests.post(f"{BASE_URL}/api/subscription/upgrade", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["success"] == True

    def test_upgrade_requires_auth(self):
        resp = requests.post(f"{BASE_URL}/api/subscription/upgrade")
        assert resp.status_code == 401


# Stats test
class TestStats:
    def test_stats(self):
        resp = requests.get(f"{BASE_URL}/api/stats")
        assert resp.status_code == 200
        data = resp.json()
        assert "ideas_discovered" in data
        assert data["ideas_discovered"] == 15
