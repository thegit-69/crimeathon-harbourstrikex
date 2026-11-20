import pytest
from httpx import AsyncClient, ASGITransport
from main import app


@pytest.mark.asyncio
async def test_health():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/health")
        assert response.status_code == 200
        assert response.json() == {"status": "healthy"}


@pytest.mark.asyncio
async def test_root():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/")
        assert response.status_code == 200
        assert response.json()["service"] == "HarbourStrikeX API"


@pytest.mark.asyncio
async def test_dashboard_endpoints():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Status
        status_res = await client.get("/api/dashboard/status")
        assert status_res.status_code == 200
        statuses = status_res.json()
        assert len(statuses) == 5

        # Stats
        stats_res = await client.get("/api/dashboard/stats")
        assert stats_res.status_code == 200
        stats = stats_res.json()
        assert stats["active_vendors"] >= 1
        assert stats["open_tickets"] >= 1

        # Activity
        act_res = await client.get("/api/dashboard/activity")
        assert act_res.status_code == 200
        assert isinstance(act_res.json(), list)


@pytest.mark.asyncio
async def test_jwt_auth_workflow():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Invalid login
        bad_login = await client.post("/auth/login", json={"username": "a.kapoor", "password": "wrongpassword"})
        assert bad_login.status_code == 401

        # Valid login (admin123 for a.kapoor)
        login_res = await client.post("/auth/login", json={"username": "a.kapoor", "password": "admin123"})
        assert login_res.status_code == 200
        token_data = login_res.json()
        token = token_data["access_token"]
        assert token

        # Call protected endpoint using Bearer token
        headers = {"Authorization": f"Bearer {token}"}
        me_res = await client.get("/auth/me", headers=headers)
        assert me_res.status_code == 200
        assert me_res.json()["username"] == "a.kapoor"
        assert me_res.json()["role"] == "it_admin"

        # Token refresh
        refresh_res = await client.post("/auth/refresh", headers=headers)
        assert refresh_res.status_code == 200
        assert "access_token" in refresh_res.json()


@pytest.mark.asyncio
async def test_ledgerone_api_key_and_tamper():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        headers = {"X-Api-Key": "key-tb-07"}

        # Recon: /me and /schema
        me = await client.get("/api/v2/me", headers=headers)
        assert me.status_code == 200
        assert me.json()["key_id"] == "key-tb-07"

        schema = await client.get("/api/v2/schema", headers=headers)
        assert schema.status_code == 200

        # List vendors
        vendors_res = await client.get("/api/v2/vendors", headers=headers)
        assert vendors_res.status_code == 200
        vendors = vendors_res.json()
        assert any(v["id"] == "V-0412" for v in vendors)

        # Bulk export vendors
        export_res = await client.get("/api/v2/vendors/export", headers=headers)
        assert export_res.status_code == 200
        assert export_res.json()["records"] >= 3

        # Tamper bank details without approval_ref (the offensive exploit)
        patch_res = await client.patch(
            "/api/v2/vendors/V-0412/bank-details",
            headers=headers,
            json={
                "new_account": "•••• 9083",
                "caller_ip": "10.20.4.77",
                "user_agent": "TallyBridge-Sync/3.6.0",
            },
        )
        assert patch_res.status_code == 200
        patch_data = patch_res.json()
        assert patch_data["new_account"] == "•••• 9083"
        assert patch_data["approval_ref"] is None
        assert "warning" in patch_data

        # Verify audit record in change-history
        hist_res = await client.get("/api/v2/vendors/change-history", headers=headers)
        assert hist_res.status_code == 200
        assert len(hist_res.json()) > 0

        # Invoices and payments
        inv_res = await client.get("/api/v2/invoices", headers=headers)
        assert inv_res.status_code == 200
        assert len(inv_res.json()) >= 3

        sched_res = await client.get("/api/v2/payments/scheduled", headers=headers)
        assert sched_res.status_code == 200
        assert len(sched_res.json()) >= 3

        search_res = await client.get("/api/v2/payments/search?vendor_id=V-0412", headers=headers)
        assert search_res.status_code == 200

        logs_res = await client.get("/api/v2/logs", headers=headers)
        assert logs_res.status_code == 200
        assert len(logs_res.json()) > 0


@pytest.mark.asyncio
async def test_helpdeskr_operations():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        headers = {"X-Api-Key": "tb-sync-svc"}

        # List & search tickets
        tickets_res = await client.get("/api/v1/support/tickets?search=access", headers=headers)
        assert tickets_res.status_code == 200
        assert len(tickets_res.json()) >= 1

        # Create ticket
        new_ticket = await client.post(
            "/api/v1/support/tickets",
            headers=headers,
            json={"subject": "Discrepancy in dispatch logs", "requester": "Dev Raghavan", "priority": "High"},
        )
        assert new_ticket.status_code == 201
        t_id = new_ticket.json()["id"]

        # Update ticket status
        update_res = await client.patch(
            f"/api/v1/support/tickets/{t_id}",
            headers=headers,
            json={"status": "In progress"},
        )
        assert update_res.status_code == 200
        assert update_res.json()["status"] == "In progress"

        # Bulk export & delete job
        create_exp = await client.post(
            "/api/v1/support/exports",
            headers=headers,
            json={"target": "Customer ticket history", "caller_ip": "198.18.7.41"},
        )
        assert create_exp.status_code == 201
        exp_id = create_exp.json()["id"]

        del_exp = await client.delete(f"/api/v1/support/exports/{exp_id}", headers=headers)
        assert del_exp.status_code == 204

        # Audit log
        audit_res = await client.get("/api/v1/support/audit", headers=headers)
        assert audit_res.status_code == 200
        assert len(audit_res.json()) > 0


@pytest.mark.asyncio
async def test_bluevault_storage():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        headers = {"X-Api-Key": "key-tb-07"}

        # Documents
        docs_res = await client.get("/api/storage/documents", headers=headers)
        assert docs_res.status_code == 200
        assert len(docs_res.json()) >= 5

        # Directory listing simulation
        list_res = await client.get("/api/storage/list?path=/finance", headers=headers)
        assert list_res.status_code == 200
        assert "folders" in list_res.json()

        # Read file simulation
        read_res = await client.get("/api/storage/read?path=/finance/bank-instructions/vendor-bank-details-2026.xlsx", headers=headers)
        assert read_res.status_code == 200
        assert "content" in read_res.json()

        # Access logs
        access_res = await client.get("/api/storage/access-logs", headers=headers)
        assert access_res.status_code == 200
        assert len(access_res.json()) > 0


@pytest.mark.asyncio
async def test_tallybridge_integration():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        headers = {"X-Api-Key": "key-tb-07"}

        # Keys
        keys_res = await client.get("/api/integration/keys", headers=headers)
        assert keys_res.status_code == 200
        assert len(keys_res.json()) >= 3

        # Service accounts & connected apps
        svc_res = await client.get("/api/integration/service-accounts", headers=headers)
        assert svc_res.status_code == 200

        apps_res = await client.get("/api/integration/connected-apps", headers=headers)
        assert apps_res.status_code == 200

        # Permissions analysis (checks for over-privileged keys)
        perm_res = await client.get("/api/integration/permissions", headers=headers)
        assert perm_res.status_code == 200
        perms = perm_res.json()
        assert any(p["risk"] == "Over-privileged" for p in perms)

        # Sync jobs & trigger
        sync_res = await client.get("/api/integration/sync-jobs", headers=headers)
        assert sync_res.status_code == 200

        trigger_res = await client.post(
            "/api/integration/sync-jobs",
            headers=headers,
            json={"name": "Nightly batch synchronization", "target": "LedgerOne"},
        )
        assert trigger_res.status_code == 201

        # Network flows
        flows_res = await client.get("/api/integration/network-flows?host=tb-build-02", headers=headers)
        assert flows_res.status_code == 200
        assert len(flows_res.json()) > 0

        # API activity aggregation
        act_res = await client.get("/api/integration/api-activity", headers=headers)
        assert act_res.status_code == 200
        assert len(act_res.json()) > 0
