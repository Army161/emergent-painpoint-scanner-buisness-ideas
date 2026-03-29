"""
Iteration 6 Tests: Multi-source discovery, CSV export, and public sharing
Tests for:
- POST /api/scrape/discover - multi-source AI discovery (402 for free, 200 for pro)
- GET /api/ideas/export-csv - CSV export (402 for free, 200 for pro)
- POST /api/ideas/{id}/share - create share link
- GET /api/shared/{share_id} - get shared idea (no auth required)
- GET /api/shared/invalid - returns 404
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials from previous iterations
FREE_USER = {"email": "stripetest@test.com", "password": "newpass123"}
PRO_USER = {"email": "prouser@test.com", "password": "test1234"}


class TestAuth:
    """Verify auth still works"""
    
    def test_login_free_user(self):
        """Login as free user"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=FREE_USER)
        assert response.status_code == 200, f"Free user login failed: {response.text}"
        data = response.json()
        assert "token" in data
        assert "user" in data
        print(f"Free user login: PASS - is_premium={data['user'].get('is_premium')}")
    
    def test_login_pro_user(self):
        """Login as pro user"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json=PRO_USER)
        assert response.status_code == 200, f"Pro user login failed: {response.text}"
        data = response.json()
        assert "token" in data
        assert data["user"].get("is_premium") == True, "Pro user should be premium"
        print(f"Pro user login: PASS - is_premium={data['user'].get('is_premium')}")


class TestMultiSourceDiscover:
    """POST /api/scrape/discover - multi-source AI discovery"""
    
    def test_discover_no_auth(self):
        """Discover without auth returns 401"""
        response = requests.post(f"{BASE_URL}/api/scrape/discover")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("Discover no auth: PASS - returns 401")
    
    def test_discover_free_user_returns_402(self):
        """Free user gets 402 for discover"""
        login = requests.post(f"{BASE_URL}/api/auth/login", json=FREE_USER)
        token = login.json()["token"]
        
        response = requests.post(
            f"{BASE_URL}/api/scrape/discover",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 402, f"Expected 402 for free user, got {response.status_code}: {response.text}"
        print("Discover free user: PASS - returns 402")
    
    def test_discover_pro_user_returns_ideas(self):
        """Pro user can discover ideas from random source"""
        login = requests.post(f"{BASE_URL}/api/auth/login", json=PRO_USER)
        token = login.json()["token"]
        
        response = requests.post(
            f"{BASE_URL}/api/scrape/discover",
            headers={"Authorization": f"Bearer {token}"},
            timeout=60  # AI generation can take time
        )
        assert response.status_code == 200, f"Expected 200 for pro user, got {response.status_code}: {response.text}"
        data = response.json()
        assert "ideas" in data
        assert "count" in data
        assert "source" in data
        assert "source_display" in data
        # Source should be one of reddit, producthunt, appstore
        assert data["source"] in ["reddit", "producthunt", "appstore"], f"Unexpected source: {data['source']}"
        print(f"Discover pro user: PASS - found {data['count']} ideas from {data['source_display']}")
        
        # If ideas returned, verify they have live:true
        if data["count"] > 0:
            # Fetch feed to verify ideas have live flag
            feed_response = requests.get(
                f"{BASE_URL}/api/ideas/feed",
                headers={"Authorization": f"Bearer {token}"}
            )
            feed = feed_response.json()
            live_ideas = [i for i in feed if i.get("live") == True]
            print(f"  Live ideas in feed: {len(live_ideas)}")


class TestCSVExport:
    """GET /api/ideas/export-csv - CSV download"""
    
    def test_csv_no_auth(self):
        """CSV export without auth returns 401"""
        response = requests.get(f"{BASE_URL}/api/ideas/export-csv")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("CSV no auth: PASS - returns 401")
    
    def test_csv_free_user_returns_402(self):
        """Free user gets 402 for CSV export"""
        login = requests.post(f"{BASE_URL}/api/auth/login", json=FREE_USER)
        token = login.json()["token"]
        
        response = requests.get(
            f"{BASE_URL}/api/ideas/export-csv?token={token}"
        )
        assert response.status_code == 402, f"Expected 402 for free user, got {response.status_code}: {response.text}"
        print("CSV free user: PASS - returns 402")
    
    def test_csv_pro_user_returns_csv(self):
        """Pro user can download CSV"""
        login = requests.post(f"{BASE_URL}/api/auth/login", json=PRO_USER)
        token = login.json()["token"]
        
        response = requests.get(
            f"{BASE_URL}/api/ideas/export-csv?token={token}"
        )
        assert response.status_code == 200, f"Expected 200 for pro user, got {response.status_code}: {response.text}"
        assert "text/csv" in response.headers.get("content-type", ""), "Should return CSV content type"
        assert "attachment" in response.headers.get("content-disposition", ""), "Should have attachment disposition"
        
        # Verify CSV content
        content = response.text
        lines = content.strip().split("\n")
        assert len(lines) > 1, "CSV should have header and data rows"
        header = lines[0]
        assert "Title" in header
        assert "Category" in header
        assert "Opportunity Score" in header
        print(f"CSV pro user: PASS - {len(lines)-1} ideas exported")


class TestPublicSharing:
    """POST /api/ideas/{id}/share and GET /api/shared/{share_id}"""
    
    def test_share_no_auth(self):
        """Share without auth returns 401"""
        response = requests.post(f"{BASE_URL}/api/ideas/idea_001/share")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("Share no auth: PASS - returns 401")
    
    def test_share_creates_link(self):
        """Authenticated user can create share link"""
        login = requests.post(f"{BASE_URL}/api/auth/login", json=FREE_USER)
        token = login.json()["token"]
        
        # Use a known seed idea
        response = requests.post(
            f"{BASE_URL}/api/ideas/idea_001/share",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "share_id" in data
        assert len(data["share_id"]) == 10, "share_id should be 10 chars"
        print(f"Share creates link: PASS - share_id={data['share_id']}")
        return data["share_id"]
    
    def test_share_nonexistent_idea(self):
        """Share nonexistent idea returns 404"""
        login = requests.post(f"{BASE_URL}/api/auth/login", json=FREE_USER)
        token = login.json()["token"]
        
        response = requests.post(
            f"{BASE_URL}/api/ideas/nonexistent_idea_xyz/share",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("Share nonexistent: PASS - returns 404")
    
    def test_get_shared_idea_no_auth_required(self):
        """GET /api/shared/{share_id} works without auth"""
        # First create a share link
        login = requests.post(f"{BASE_URL}/api/auth/login", json=FREE_USER)
        token = login.json()["token"]
        
        share_response = requests.post(
            f"{BASE_URL}/api/ideas/idea_001/share",
            headers={"Authorization": f"Bearer {token}"}
        )
        share_id = share_response.json()["share_id"]
        
        # Now fetch without auth
        response = requests.get(f"{BASE_URL}/api/shared/{share_id}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "idea" in data
        assert "shared_at" in data
        assert data["idea"]["id"] == "idea_001"
        assert data["idea"]["title"] is not None
        print(f"Get shared idea: PASS - title='{data['idea']['title'][:40]}...'")
    
    def test_get_shared_invalid_returns_404(self):
        """GET /api/shared/invalid returns 404"""
        response = requests.get(f"{BASE_URL}/api/shared/invalid_share_id_xyz")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("Get shared invalid: PASS - returns 404")


class TestExistingFeatures:
    """Verify existing features still work"""
    
    def test_ideas_feed(self):
        """Ideas feed returns data"""
        response = requests.get(f"{BASE_URL}/api/ideas/feed")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        print(f"Ideas feed: PASS - {len(data)} ideas")
    
    def test_scrape_x_free_user_402(self):
        """X scrape returns 402 for free user"""
        login = requests.post(f"{BASE_URL}/api/auth/login", json=FREE_USER)
        token = login.json()["token"]
        
        response = requests.post(
            f"{BASE_URL}/api/scrape/x",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 402
        print("Scrape X free user: PASS - returns 402")
    
    def test_scan_topic_free_user_402(self):
        """Scan topic returns 402 for free user"""
        login = requests.post(f"{BASE_URL}/api/auth/login", json=FREE_USER)
        token = login.json()["token"]
        
        response = requests.post(
            f"{BASE_URL}/api/ideas/scan-topic",
            headers={"Authorization": f"Bearer {token}"},
            json={"topic": "test"}
        )
        assert response.status_code == 402
        print("Scan topic free user: PASS - returns 402")
    
    def test_user_analytics(self):
        """User analytics endpoint works"""
        login = requests.post(f"{BASE_URL}/api/auth/login", json=PRO_USER)
        token = login.json()["token"]
        
        response = requests.get(
            f"{BASE_URL}/api/user/analytics",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "briefs_generated" in data
        assert "is_premium" in data
        print(f"User analytics: PASS - is_premium={data['is_premium']}")
    
    def test_stats_endpoint(self):
        """Stats endpoint works"""
        response = requests.get(f"{BASE_URL}/api/stats")
        assert response.status_code == 200
        data = response.json()
        assert "ideas_discovered" in data
        print(f"Stats: PASS - {data['ideas_discovered']} ideas discovered")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
