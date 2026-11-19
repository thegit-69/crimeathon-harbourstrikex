package server

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"harborstrike-x/attack-cli/pkg/models"
)

func TestLabServerEndpoints(t *testing.T) {
	srv := NewLabServer(0)

	// Test 1: GET /v2/me with key-tb-07
	req := httptest.NewRequest(http.MethodGet, "/v2/me", nil)
	req.Header.Set("X-API-Key", "key-tb-07")
	w := httptest.NewRecorder()
	srv.handleLedgerMe(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200 OK from /v2/me, got %d", w.Code)
	}

	var meResp map[string]interface{}
	json.NewDecoder(w.Body).Decode(&meResp)
	if meResp["key_id"] != "key-tb-07" {
		t.Fatalf("expected key-tb-07, got %v", meResp["key_id"])
	}

	// Test 2: PATCH /v2/vendors/V-0412/bank-details (Phase 6 Tamper)
	patchBody := models.VendorBankPatchRequest{
		BankAccount: "HDFC0001842-9083",
		BankRouting: "HDFC0001842",
		ApprovalRef: "", // Empty!
	}
	bodyBytes, _ := json.Marshal(patchBody)
	reqPatch := httptest.NewRequest(http.MethodPatch, "/v2/vendors/V-0412/bank-details", bytes.NewReader(bodyBytes))
	reqPatch.Header.Set("X-API-Key", "key-tb-07")
	wPatch := httptest.NewRecorder()
	srv.handleVendorDetailAndBank(wPatch, reqPatch)

	if wPatch.Code != http.StatusOK {
		t.Fatalf("expected 200 OK from patch bank-details, got %d", wPatch.Code)
	}

	// Test 3: GET /v2/payments/scheduled - verify that payment reflects tampered account
	reqSched := httptest.NewRequest(http.MethodGet, "/v2/payments/scheduled", nil)
	wSched := httptest.NewRecorder()
	srv.handlePaymentScheduled(wSched, reqSched)

	if wSched.Code != http.StatusOK {
		t.Fatalf("expected 200 OK from /v2/payments/scheduled, got %d", wSched.Code)
	}

	var schedResp struct {
		Payments []models.ScheduledPayment `json:"payments"`
	}
	if err := json.NewDecoder(wSched.Body).Decode(&schedResp); err != nil {
		t.Fatalf("failed to decode scheduled payments response: %v", err)
	}

	var found bool
	for _, p := range schedResp.Payments {
		if p.VendorID == "V-0412" && p.BankAccount == "HDFC0001842-9083" {
			found = true
			break
		}
	}
	if !found {
		t.Fatalf("tampered bank account was not reflected in scheduled payments queue")
	}

	// Test 4: HelpDeskr Bulk Export & Leak Verification
	reqExport := httptest.NewRequest(http.MethodPost, "/api/v1/exports/bulk", nil)
	wExport := httptest.NewRecorder()
	srv.handleHelpDeskrBulkExport(wExport, reqExport)

	if wExport.Code != http.StatusCreated {
		t.Fatalf("expected 201 Created from bulk export, got %d", wExport.Code)
	}

	// Test 5: SSO Login for Terminated Employee
	ssoPayload := map[string]string{"username": "r.menon", "device_id": "dev-81546"}
	ssoBytes, _ := json.Marshal(ssoPayload)
	reqSSO := httptest.NewRequest(http.MethodPost, "/sso/login", bytes.NewReader(ssoBytes))
	wSSO := httptest.NewRecorder()
	srv.handleSSOLogin(wSSO, reqSSO)

	if wSSO.Code != http.StatusOK {
		t.Fatalf("expected 200 OK from SSO login, got %d", wSSO.Code)
	}
}
