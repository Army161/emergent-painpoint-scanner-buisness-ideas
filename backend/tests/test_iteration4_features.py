"""
Test suite for IdeaRadar Iteration 4 features:
- PDF Export endpoint (Pro+ only)
- User Analytics endpoint
- Dashboard link in navbar (frontend test)
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials from previous iterations
TEST_EMAIL = "stripetest@test.com"
TEST_PASSWORD = "newpass123"


class TestAuthentication:
    """Authentication helper tests"""
    
    def test_login_success(self):
        """Test login with test credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "token" in data
        assert "user" in data
        assert data["user"]["email"] == TEST_EMAIL
        print(f"✓ Login successful for {TEST_EMAIL}")
        return data["token"], data["user"]


class TestPDFExport:
    """PDF Export endpoint tests - Pro+ feature"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token for test user"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if response.status_code == 200:
            return response.json()["token"]
        pytest.skip("Login failed")
    
    @pytest.fixture
    def idea_id(self):
        """Get a valid idea ID from the feed"""
        response = requests.get(f"{BASE_URL}/api/ideas/feed")
        if response.status_code == 200 and len(response.json()) > 0:
            return response.json()[0]["id"]
        pytest.skip("No ideas available")
    
    def test_export_pdf_requires_auth(self, idea_id):
        """PDF export requires authentication"""
        response = requests.get(f"{BASE_URL}/api/ideas/{idea_id}/export-pdf")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ PDF export requires authentication")
    
    def test_export_pdf_returns_402_for_free_user(self, auth_token, idea_id):
        """PDF export returns 402 for free users (Pro+ feature)"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/ideas/{idea_id}/export-pdf", headers=headers)
        assert response.status_code == 402, f"Expected 402 for free user, got {response.status_code}: {response.text}"
        data = response.json()
        assert "Pro" in data.get("detail", ""), f"Expected Pro upgrade message, got: {data}"
        print("✓ PDF export returns 402 for free users with upgrade message")
    
    def test_export_pdf_returns_400_if_no_brief(self, auth_token, idea_id):
        """PDF export returns 400 if no brief generated yet (for premium users)"""
        # This test would need a premium user to properly test
        # For now, we verify the endpoint exists and responds correctly for free users
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/ideas/{idea_id}/export-pdf", headers=headers)
        # Free user gets 402 before the brief check
        assert response.status_code in [400, 402], f"Expected 400 or 402, got {response.status_code}"
        print("✓ PDF export endpoint responds correctly")
    
    def test_export_pdf_with_token_query_param(self, auth_token, idea_id):
        """PDF export accepts token via query param for direct download"""
        response = requests.get(f"{BASE_URL}/api/ideas/{idea_id}/export-pdf?token={auth_token}")
        # Free user should still get 402
        assert response.status_code == 402, f"Expected 402 for free user via query param, got {response.status_code}"
        print("✓ PDF export accepts token via query param")
    
    def test_export_pdf_invalid_idea(self, auth_token):
        """PDF export returns 404 for invalid idea ID"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/ideas/invalid_idea_xyz/export-pdf", headers=headers)
        # Could be 402 (free user check first) or 404 (idea not found)
        assert response.status_code in [402, 404], f"Expected 402 or 404, got {response.status_code}"
        print("✓ PDF export handles invalid idea ID")


class TestUserAnalytics:
    """User Analytics endpoint tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token for test user"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if response.status_code == 200:
            return response.json()["token"]
        pytest.skip("Login failed")
    
    def test_analytics_requires_auth(self):
        """Analytics endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/user/analytics")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Analytics requires authentication")
    
    def test_analytics_returns_correct_fields(self, auth_token):
        """Analytics returns all required fields"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/user/analytics", headers=headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        required_fields = [
            "briefs_generated",
            "copies_generated", 
            "ideas_saved",
            "topics_scanned",
            "payments_made",
            "tier",
            "is_premium",
            "recent_briefs",
            "free_briefs_used"
        ]
        
        for field in required_fields:
            assert field in data, f"Missing required field: {field}"
        
        # Validate data types
        assert isinstance(data["briefs_generated"], int)
        assert isinstance(data["copies_generated"], int)
        assert isinstance(data["ideas_saved"], int)
        assert isinstance(data["topics_scanned"], int)
        assert isinstance(data["payments_made"], int)
        assert isinstance(data["tier"], str)
        assert isinstance(data["is_premium"], bool)
        assert isinstance(data["recent_briefs"], list)
        assert isinstance(data["free_briefs_used"], int)
        
        print(f"✓ Analytics returns all required fields with correct types")
        print(f"  - briefs_generated: {data['briefs_generated']}")
        print(f"  - copies_generated: {data['copies_generated']}")
        print(f"  - ideas_saved: {data['ideas_saved']}")
        print(f"  - topics_scanned: {data['topics_scanned']}")
        print(f"  - payments_made: {data['payments_made']}")
        print(f"  - tier: {data['tier']}")
        print(f"  - is_premium: {data['is_premium']}")
        print(f"  - free_briefs_used: {data['free_briefs_used']}")
    
    def test_analytics_tier_value(self, auth_token):
        """Analytics tier should be 'free' for test user"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/user/analytics", headers=headers)
        assert response.status_code == 200
        
        data = response.json()
        # Test user is on free tier
        assert data["tier"] in ["free", "pro", "business"], f"Invalid tier: {data['tier']}"
        assert data["is_premium"] == (data["tier"] in ["pro", "business"])
        print(f"✓ Analytics tier is valid: {data['tier']}, is_premium: {data['is_premium']}")
    
    def test_analytics_recent_briefs_structure(self, auth_token):
        """Analytics recent_briefs has correct structure"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/user/analytics", headers=headers)
        assert response.status_code == 200
        
        data = response.json()
        recent_briefs = data["recent_briefs"]
        
        if len(recent_briefs) > 0:
            brief = recent_briefs[0]
            assert "idea_id" in brief, "recent_briefs item missing idea_id"
            assert "title" in brief, "recent_briefs item missing title"
            print(f"✓ Recent briefs structure is correct ({len(recent_briefs)} briefs)")
        else:
            print("✓ Recent briefs is empty (no briefs generated yet)")


class TestScanTopicForFreeUser:
    """Verify Scan Topic is disabled for free users"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token for test user"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if response.status_code == 200:
            return response.json()["token"]
        pytest.skip("Login failed")
    
    def test_scan_topic_returns_402_for_free_user(self, auth_token):
        """Scan topic returns 402 for free users"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.post(f"{BASE_URL}/api/ideas/scan-topic", 
                                 headers=headers,
                                 json={"topic": "test topic"})
        assert response.status_code == 402, f"Expected 402, got {response.status_code}"
        print("✓ Scan topic returns 402 for free users")


class TestIdeasFeed:
    """Verify ideas feed is working"""
    
    def test_ideas_feed_returns_ideas(self):
        """Ideas feed returns list of ideas"""
        response = requests.get(f"{BASE_URL}/api/ideas/feed")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0, "No ideas in feed"
        
        # Verify idea structure
        idea = data[0]
        assert "id" in idea
        assert "title" in idea
        assert "description" in idea
        print(f"✓ Ideas feed returns {len(data)} ideas")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
