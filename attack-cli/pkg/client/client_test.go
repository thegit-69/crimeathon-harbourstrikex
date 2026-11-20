package client

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestCheckLabStatusUsesDockerHealthEndpoint(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/health" {
			t.Fatalf("expected /health, got %s", r.URL.Path)
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"healthy"}`))
	}))
	defer server.Close()

	attackClient := NewAttackClient(TargetConfig{
		BaseURL: server.URL,
		Mode:    "live",
	})

	result, err := attackClient.CheckLabStatus()
	if err != nil {
		t.Fatalf("CheckLabStatus failed: %v", err)
	}
	if result["status"] != "healthy" {
		t.Fatalf("unexpected health response: %#v", result)
	}
}

func TestProbeReconUsesFastAPIRoutes(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		switch r.URL.Path {
		case "/api/v2/me":
			if r.Header.Get("X-API-Key") != "key-tb-07" {
				t.Fatalf("missing API key header")
			}
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(`{"key_id":"key-tb-07","type":"api_key","scope":"read:all write:vendors"}`))
		case "/api/v2/schema":
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(`{"version":"v2","endpoints":["/api/v2/vendors"]}`))
		default:
			http.NotFound(w, r)
		}
	}))
	defer server.Close()

	attackClient := NewAttackClient(TargetConfig{
		BaseURL: server.URL,
		APIKey:  "key-tb-07",
		Mode:    "live",
	})

	result, err := attackClient.ProbeRecon()
	if err != nil {
		t.Fatalf("ProbeRecon failed: %v", err)
	}
	if result["key_id"] != "key-tb-07" {
		t.Fatalf("unexpected recon response: %#v", result)
	}
}

func TestLiveProbeReturnsErrorOnHTTPFailure(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
	}))
	defer server.Close()

	attackClient := NewAttackClient(TargetConfig{
		BaseURL: server.URL,
		APIKey:  "invalid-key",
		Mode:    "live",
	})

	if _, err := attackClient.ProbeRecon(); err == nil {
		t.Fatal("expected live probe to return an HTTP error")
	}
}

func TestHarvestTicketsUsesHelpDeskrContracts(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		switch {
		case r.Method == http.MethodPost && r.URL.Path == "/api/v1/support/exports":
			var payload map[string]interface{}
			if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
				t.Fatalf("invalid export payload: %v", err)
			}
			if payload["target"] != "All tickets" {
				t.Fatalf("unexpected export target: %#v", payload)
			}
			w.WriteHeader(http.StatusCreated)
			w.Write([]byte(`{"id":"EXP-5412","actor":"tb-sync-svc","target":"All tickets","status":"Completed"}`))
		case r.Method == http.MethodGet && r.URL.Path == "/api/v1/support/tickets":
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(`[
				{"id":"TKT-48213","subject":"BlueVault storage key issue","requester":"Sunita Iyer"},
				{"id":"TKT-48214","subject":"Invoice question","requester":"User"}
			]`))
		default:
			http.NotFound(w, r)
		}
	}))
	defer server.Close()

	attackClient := NewAttackClient(TargetConfig{
		BaseURL:     server.URL,
		TicketToken: "tb-sync-svc",
		SourceIP:    "198.18.7.41",
		Mode:        "live",
	})

	result, err := attackClient.HarvestTickets()
	if err != nil {
		t.Fatalf("HarvestTickets failed: %v", err)
	}
	if result["export_id"] != "EXP-5412" {
		t.Fatalf("unexpected export id: %#v", result)
	}
	if result["records"] != 2 {
		t.Fatalf("unexpected ticket count: %#v", result)
	}
	if result["leaked_token"] != "bvk-7f3a" {
		t.Fatalf("expected leaked storage key, got %#v", result)
	}
}

func TestAccessStorageUsesBlueVaultListAndRead(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		if r.Header.Get("X-API-Key") != "bvk-7f3a" {
			t.Fatalf("missing BlueVault key header")
		}
		switch r.URL.Path {
		case "/api/storage/list":
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(`{"path":"/","folders":[],"files":["vendor-bank-details-2026.xlsx","stmt-2026-01.pdf"]}`))
		case "/api/storage/read":
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(`{"path":"` + r.URL.Query().Get("path") + `","content":"simulated","note":"Access logged"}`))
		default:
			http.NotFound(w, r)
		}
	}))
	defer server.Close()

	attackClient := NewAttackClient(TargetConfig{
		BaseURL:    server.URL,
		StorageKey: "bvk-7f3a",
		Mode:       "live",
	})

	result, err := attackClient.AccessStorage()
	if err != nil {
		t.Fatalf("AccessStorage failed: %v", err)
	}
	if result["files_stolen"] != 2 {
		t.Fatalf("unexpected live file count: %#v", result)
	}
}

func TestExfilVendorsUsesLedgerOneGetExport(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			t.Fatalf("expected GET, got %s", r.Method)
		}
		if r.URL.Path != "/api/v2/vendors/export" {
			t.Fatalf("unexpected export path: %s", r.URL.Path)
		}
		if r.Header.Get("X-API-Key") != "key-tb-07" {
			t.Fatalf("missing LedgerOne API key")
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"export_id":"EXP-9931","records":300,"data":[{"id":"V-0412","name":"Coastal Packaging Ltd.","bank_account":"•••• 9083"}]}`))
	}))
	defer server.Close()

	attackClient := NewAttackClient(TargetConfig{
		BaseURL: server.URL,
		APIKey:  "key-tb-07",
		Mode:    "live",
	})

	result, err := attackClient.ExfilVendors()
	if err != nil {
		t.Fatalf("ExfilVendors failed: %v", err)
	}
	if result["total_records"] != float64(300) {
		t.Fatalf("unexpected live record count: %#v", result)
	}
}

func TestPivotTunnelUsesPaymentAndNetworkFlowRoutes(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		switch r.URL.Path {
		case "/api/v2/payments/search":
			if r.URL.Query().Get("vendor_id") != "V-0412" {
				t.Fatalf("unexpected vendor filter: %s", r.URL.RawQuery)
			}
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(`{"records":1,"data":[{"id":"PAY-V0412-0908","vendor":"Coastal Packaging Ltd.","amount":"248000","pay_date":"2026-09-08"}]}`))
		case "/api/integration/network-flows":
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(`[{"id":"flow-005","src_ip":"10.20.4.77","host_label":"tb-build-02","bytes_sent":"0.01MB","verdict":"Allowed"}]`))
		default:
			http.NotFound(w, r)
		}
	}))
	defer server.Close()

	attackClient := NewAttackClient(TargetConfig{
		BaseURL: server.URL,
		APIKey:  "key-tb-07",
		Mode:    "live",
	})

	result, err := attackClient.PivotTunnel()
	if err != nil {
		t.Fatalf("PivotTunnel failed: %v", err)
	}
	if result["network_flow_count"] != 1 {
		t.Fatalf("unexpected network flow count: %#v", result)
	}
}

func TestTamperVendorBankUsesNewAccountPayload(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		if r.URL.Path != "/api/v2/vendors/V-0412/bank-details" {
			t.Fatalf("unexpected tamper path: %s", r.URL.Path)
		}
		switch r.Method {
		case http.MethodGet:
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(`{"vendor_id":"V-0412","bank_account":"•••• 4417"}`))
		case http.MethodPatch:
			var payload map[string]interface{}
			if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
				t.Fatalf("invalid tamper payload: %v", err)
			}
			if payload["new_account"] != "HDFC0001842-9083" {
				t.Fatalf("backend payload did not use new_account: %#v", payload)
			}
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(`{"change_id":"chg-test","request_id":"req-test","vendor_id":"V-0412","new_account":"HDFC0001842-9083","approval_ref":null,"warning":"No approval reference recorded"}`))
		default:
			http.NotFound(w, r)
		}
	}))
	defer server.Close()

	attackClient := NewAttackClient(TargetConfig{
		BaseURL: server.URL,
		APIKey:  "key-tb-07",
		Mode:    "live",
	})

	result, err := attackClient.TamperVendorBank("V-0412", "HDFC0001842-9083", "HDFC0001842")
	if err != nil {
		t.Fatalf("TamperVendorBank failed: %v", err)
	}
	if result["new_bank_account"] != "HDFC0001842-9083" {
		t.Fatalf("unexpected tamper result: %#v", result)
	}
}

func TestVerifyScheduledRunUsesLivePaymentAndBankRoutes(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		switch r.URL.Path {
		case "/api/v2/payments/scheduled":
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(`[{"id":"PAY-V0412-0908","vendor_id":"V-0412","vendor":"Coastal Packaging Ltd.","amount":"248000","pay_date":"2026-09-08","status":"Scheduled"}]`))
		case "/api/v2/vendors/V-0412/bank-details":
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(`{"vendor_id":"V-0412","bank_account":"HDFC0001842-9083"}`))
		default:
			http.NotFound(w, r)
		}
	}))
	defer server.Close()

	attackClient := NewAttackClient(TargetConfig{
		BaseURL: server.URL,
		APIKey:  "key-tb-07",
		Mode:    "live",
	})

	result, err := attackClient.VerifyScheduledRun()
	if err != nil {
		t.Fatalf("VerifyScheduledRun failed: %v", err)
	}
	target, ok := result["target_entry"].(map[string]interface{})
	if !ok {
		t.Fatalf("missing target entry: %#v", result)
	}
	if target["bank_account"] != "HDFC0001842-9083" {
		t.Fatalf("unexpected live bank account: %#v", target)
	}
}

func TestAuthAnomaliesUsesFastAPILoginContract(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost || r.URL.Path != "/auth/login" {
			t.Fatalf("unexpected login request: %s %s", r.Method, r.URL.Path)
		}
		var payload map[string]string
		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
			t.Fatalf("invalid login payload: %v", err)
		}
		if payload["username"] != "r.menon" || payload["password"] != "user123" {
			t.Fatalf("unexpected login payload: %#v", payload)
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"access_token":"test-token","token_type":"bearer"}`))
	}))
	defer server.Close()

	attackClient := NewAttackClient(TargetConfig{
		BaseURL: server.URL,
		Mode:    "live",
	})

	result, err := attackClient.TestAuthAnomalies("r.menon", "dev-81546")
	if err != nil {
		t.Fatalf("TestAuthAnomalies failed: %v", err)
	}
	if result["status"] != "AUTHENTICATED" {
		t.Fatalf("unexpected auth result: %#v", result)
	}
}
