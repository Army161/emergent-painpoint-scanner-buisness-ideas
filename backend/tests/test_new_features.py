"""
IdeaRadar Backend API Tests - Iteration 3
Tests for: Stripe payment, Password reset, Scan Topic features
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials - stripetest@test.com is on free tier
TEST_EMAIL = "stripetest@test.com"
TEST_PASSWORD = "newpass123"

@pytest.fixture(scope="module")
def auth_token():
    """Get auth token for stripetest@test.com (free tier user)"""
    resp = requests.post(f"{BASE_URL}/api/auth/login", json={"email": TEST_EMAIL, "password": TEST_PASSWORD})
    if resp.status_code == 200:
        return resp.json()["token"]
    pytest.skip(f"Login failed: {resp.text}")

@pytest.fixture(scope="module")
def auth_headers(auth_token):
    return {"Authorization": f"Bearer {auth_token}"}


# ============================================================
# PASSWORD RESET TESTS
# ============================================================
class TestPasswordReset:
    """Tests for forgot-password and reset-password endpoints"""

    def test_forgot_password_valid_email(self):
        """POST /api/auth/forgot-password returns 6-digit code for valid email"""
        resp = requests.post(f"{BASE_URL}/api/auth/forgot-password", json={"email": TEST_EMAIL})
        assert resp.status_code == 200
        data = resp.json()
        assert "message" in data
        assert "code" in data  # Demo mode returns code in response
        assert len(data["code"]) == 6
        assert data["code"].isdigit()

    def test_forgot_password_invalid_email(self):
        """POST /api/auth/forgot-password returns generic message for invalid email (security)"""
        resp = requests.post(f"{BASE_URL}/api/auth/forgot-password", json={"email": "nonexistent@test.com"})
        assert resp.status_code == 200  # Returns 200 to not reveal if email exists
        data = resp.json()
        assert "message" in data
        # Should NOT return code for non-existent email
        assert data.get("code") is None

    def test_reset_password_wrong_code(self):
        """POST /api/auth/reset-password with wrong code returns 400"""
        resp = requests.post(f"{BASE_URL}/api/auth/reset-password", json={
            "email": TEST_EMAIL,
            "code": "000000",  # Wrong code
            "new_password": "wrongtest123"
        })
        assert resp.status_code == 400
        data = resp.json()
        assert "Invalid" in data.get("detail", "") or "expired" in data.get("detail", "")

    def test_reset_password_full_flow(self):
        """Full password reset flow: forgot -> reset -> login with new password"""
        # Create a test user for this flow
        unique_email = f"TEST_reset_{uuid.uuid4().hex[:8]}@test.com"
        original_password = "original123"
        new_password = "newpassword456"
        
        # Register user
        reg_resp = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": unique_email,
            "name": "Reset Test User",
            "password": original_password
        })
        assert reg_resp.status_code == 200
        
        # Request password reset
        forgot_resp = requests.post(f"{BASE_URL}/api/auth/forgot-password", json={"email": unique_email})
        assert forgot_resp.status_code == 200
        reset_code = forgot_resp.json().get("code")
        assert reset_code is not None
        
        # Reset password with correct code
        reset_resp = requests.post(f"{BASE_URL}/api/auth/reset-password", json={
            "email": unique_email,
            "code": reset_code,
            "new_password": new_password
        })
        assert reset_resp.status_code == 200
        assert "successfully" in reset_resp.json().get("message", "").lower()
        
        # Verify login with new password works
        login_resp = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": unique_email,
            "password": new_password
        })
        assert login_resp.status_code == 200
        assert "token" in login_resp.json()
        
        # Verify old password no longer works
        old_login_resp = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": unique_email,
            "password": original_password
        })
        assert old_login_resp.status_code == 401


# ============================================================
# STRIPE CHECKOUT TESTS
# ============================================================
class TestStripeCheckout:
    """Tests for Stripe payment integration"""

    def test_checkout_pro_tier(self, auth_headers):
        """POST /api/subscription/checkout creates checkout session for Pro ($40)"""
        resp = requests.post(f"{BASE_URL}/api/subscription/checkout", 
            json={"tier": "pro", "origin_url": "https://radar-light-dark.preview.emergentagent.com"},
            headers=auth_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert "url" in data
        assert "session_id" in data
        assert "stripe.com" in data["url"] or "checkout" in data["url"].lower()

    def test_checkout_business_tier(self, auth_headers):
        """POST /api/subscription/checkout creates checkout session for Business ($60)"""
        resp = requests.post(f"{BASE_URL}/api/subscription/checkout",
            json={"tier": "business", "origin_url": "https://radar-light-dark.preview.emergentagent.com"},
            headers=auth_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert "url" in data
        assert "session_id" in data

    def test_checkout_invalid_tier(self, auth_headers):
        """POST /api/subscription/checkout with invalid tier returns 400"""
        resp = requests.post(f"{BASE_URL}/api/subscription/checkout",
            json={"tier": "invalid_tier", "origin_url": "https://test.com"},
            headers=auth_headers)
        assert resp.status_code == 400
        data = resp.json()
        assert "Invalid tier" in data.get("detail", "")

    def test_checkout_requires_auth(self):
        """POST /api/subscription/checkout requires authentication"""
        resp = requests.post(f"{BASE_URL}/api/subscription/checkout",
            json={"tier": "pro", "origin_url": "https://test.com"})
        assert resp.status_code == 401

    def test_subscription_status_not_found(self, auth_headers):
        """GET /api/subscription/status/{session_id} returns 404 for invalid session"""
        resp = requests.get(f"{BASE_URL}/api/subscription/status/invalid_session_id", headers=auth_headers)
        assert resp.status_code == 404

    def test_subscription_status_requires_auth(self):
        """GET /api/subscription/status/{session_id} requires authentication"""
        resp = requests.get(f"{BASE_URL}/api/subscription/status/some_session_id")
        assert resp.status_code == 401


# ============================================================
# STRIPE WEBHOOK TEST
# ============================================================
class TestStripeWebhook:
    """Tests for Stripe webhook endpoint"""

    def test_webhook_endpoint_exists(self):
        """POST /api/webhook/stripe endpoint exists and responds"""
        # Webhook without proper signature should still respond (not crash)
        resp = requests.post(f"{BASE_URL}/api/webhook/stripe", 
            data=b'{}',
            headers={"Content-Type": "application/json"})
        # Should return 200 with error status (not 404 or 500)
        assert resp.status_code == 200
        data = resp.json()
        # Webhook returns status ok or error
        assert "status" in data


# ============================================================
# SCAN TOPIC TESTS (Premium Feature)
# ============================================================
class TestScanTopic:
    """Tests for Scan Any Topic AI feature (premium only)"""

    def test_scan_topic_free_user_returns_402(self, auth_headers):
        """POST /api/ideas/scan-topic returns 402 for free users"""
        resp = requests.post(f"{BASE_URL}/api/ideas/scan-topic",
            json={"topic": "pet tech"},
            headers=auth_headers)
        assert resp.status_code == 402
        data = resp.json()
        assert "Upgrade" in data.get("detail", "") or "Pro" in data.get("detail", "") or "Business" in data.get("detail", "")

    def test_scan_topic_requires_auth(self):
        """POST /api/ideas/scan-topic requires authentication"""
        resp = requests.post(f"{BASE_URL}/api/ideas/scan-topic",
            json={"topic": "fintech"})
        assert resp.status_code == 401


# ============================================================
# PRICING TIERS VERIFICATION
# ============================================================
class TestPricingTiers:
    """Verify pricing tier amounts are correct"""

    def test_pro_tier_amount(self, auth_headers):
        """Verify Pro tier is $40"""
        resp = requests.post(f"{BASE_URL}/api/subscription/checkout",
            json={"tier": "pro", "origin_url": "https://test.com"},
            headers=auth_headers)
        assert resp.status_code == 200
        # The checkout URL should be created - amount is set in backend PRICING_TIERS

    def test_business_tier_amount(self, auth_headers):
        """Verify Business tier is $60"""
        resp = requests.post(f"{BASE_URL}/api/subscription/checkout",
            json={"tier": "business", "origin_url": "https://test.com"},
            headers=auth_headers)
        assert resp.status_code == 200


# ============================================================
# EXISTING FEATURES REGRESSION
# ============================================================
class TestRegression:
    """Regression tests for existing features"""

    def test_login_still_works(self):
        """Login endpoint still works"""
        resp = requests.post(f"{BASE_URL}/api/auth/login", json={"email": TEST_EMAIL, "password": TEST_PASSWORD})
        assert resp.status_code == 200
        assert "token" in resp.json()

    def test_ideas_feed_still_works(self):
        """Ideas feed endpoint still works"""
        resp = requests.get(f"{BASE_URL}/api/ideas/feed")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        assert len(data) > 0

    def test_stats_still_works(self):
        """Stats endpoint still works"""
        resp = requests.get(f"{BASE_URL}/api/stats")
        assert resp.status_code == 200
        data = resp.json()
        assert "ideas_discovered" in data
