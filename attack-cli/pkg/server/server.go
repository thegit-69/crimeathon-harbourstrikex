package server

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"sync"
	"time"

	"harborstrike-x/attack-cli/pkg/models"
)

// LabServer represents the synthetic enterprise target
type LabServer struct {
	mu                 sync.RWMutex
	port               int
	httpServer         *http.Server
	vendors            map[string]*models.Vendor
	scheduledPayments  []models.ScheduledPayment
	tickets            []models.Ticket
	exportJobs         map[string]*models.BulkExportJob
	storageFiles       []models.StorageFile
	accessLogs         []string
	vulnerableToTamper bool
}

// NewLabServer initializes target with synthetic Case File CR-26-047 state
func NewLabServer(port int) *LabServer {
	s := &LabServer{
		port:               port,
		vendors:            make(map[string]*models.Vendor),
		exportJobs:         make(map[string]*models.BulkExportJob),
		vulnerableToTamper: true,
	}
	s.seedInitialData()
	return s
}

func (s *LabServer) seedInitialData() {
	s.mu.Lock()
	defer s.mu.Unlock()

	// Seed Coastal Packaging Ltd (Target Vendor V-0412 from E18/E19)
	s.vendors["V-0412"] = &models.Vendor{
		ID:           "V-0412",
		Name:         "Coastal Packaging Ltd",
		Category:     "Packaging & Corrugated Containers",
		ContactEmail: "finance@coastalpackaging.example",
		Status:       "active",
		BankAccount:  "HDFC0001842-4417",
		BankRouting:  "HDFC0001842",
		BankName:     "HDFC Bank - Harbour Branch",
		LastModified: time.Date(2026, 6, 12, 10, 0, 0, 0, time.UTC),
		ModifiedBy:   "f.dsouza",
		ApprovalRef:  "APR-2026-0612",
	}

	// Seed secondary vendors
	s.vendors["V-0108"] = &models.Vendor{
		ID:           "V-0108",
		Name:         "Coromandel Fuel Services Pvt Ltd",
		Category:     "Fuel & Lubricants",
		ContactEmail: "billing@coromandelfuel.example",
		Status:       "active",
		BankAccount:  "ICIC0000921-8821",
		BankRouting:  "ICIC0000921",
		BankName:     "ICICI Bank Chennai",
		LastModified: time.Date(2026, 7, 22, 9, 30, 0, 0, time.UTC),
		ModifiedBy:   "f.dsouza",
	}

	s.vendors["V-0331"] = &models.Vendor{
		ID:           "V-0331",
		Name:         "Madurai Express Hauliers",
		Category:     "Logistics & Fleet",
		ContactEmail: "ops@maduraiexpress.example",
		Status:       "active",
		BankAccount:  "SBIN0004510-1129",
		BankRouting:  "SBIN0004510",
		BankName:     "State Bank of India",
		LastModified: time.Date(2026, 8, 1, 11, 15, 0, 0, time.UTC),
		ModifiedBy:   "f.dsouza",
	}

	// Scheduled payments for Sept 8 payment run
	s.scheduledPayments = []models.ScheduledPayment{
		{
			PaymentID:     "PAY-2026-0908-01",
			VendorID:      "V-0412",
			VendorName:    "Coastal Packaging Ltd",
			AmountINR:     1845000.00,
			ScheduledDate: "2026-09-08",
			BankAccount:   "HDFC0001842-4417",
			BankRouting:   "HDFC0001842",
			Status:        "PENDING_DISBURSEMENT",
			InvoiceRef:    "INV-CP-2026-789",
		},
		{
			PaymentID:     "PAY-2026-0908-02",
			VendorID:      "V-0108",
			VendorName:    "Coromandel Fuel Services Pvt Ltd",
			AmountINR:     3200000.00,
			ScheduledDate: "2026-09-08",
			BankAccount:   "ICIC0000921-8821",
			BankRouting:   "ICIC0000921",
			Status:        "PENDING_DISBURSEMENT",
			InvoiceRef:    "INV-CF-2026-441",
		},
	}

	// Support Tickets with leaked BlueVault Key in TKT-48213 (from E13)
	s.tickets = []models.Ticket{
		{
			TicketID:    "TKT-48210",
			Customer:    "Sundaram Auto Components",
			CreatedDate: "2026-06-23",
			Subject:     "Freight delivery delay Coimbatore hub",
			Content:     "Consignment tracking #88127 stuck at checkpost. Need urgent clearance.",
		},
		{
			TicketID:    "TKT-48213",
			Customer:    "TallyBridge Systems Integration",
			CreatedDate: "2026-06-25",
			Subject:     "Automated LedgerSync Object Store Connection Configuration",
			Content:     "Per Support Lead Sunita Iyer request: pasting object store storage credentials: storage_key=bvk-7f3a bucket=harborfinch-finance-vault read_scope=all-folders",
			LeakedData:  "bvk-7f3a",
		},
		{
			TicketID:    "TKT-48218",
			Customer:    "Southern Warehousing Corp",
			CreatedDate: "2026-07-02",
			Subject:     "Invoice billing reconciliation July 2026",
			Content:     "Please re-send signed shipping manifest copy for consignment 4491.",
		},
	}

	// BlueVault files
	s.storageFiles = []models.StorageFile{
		{
			Path:        "/finance/vendor-bank-details-2026.xlsx",
			SizeKB:      4280,
			Sensitivity: "CONFIDENTIAL / PII / BANKING",
			LastUpdated: "2026-06-01",
			HashSHA256:  "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
		},
		{
			Path:        "/finance/statements/stmt-2026-01.pdf",
			SizeKB:      1150,
			Sensitivity: "CONFIDENTIAL / FINANCIAL",
			LastUpdated: "2026-02-01",
			HashSHA256:  "4a5a54b39b56f8f4a13f77341e98d9e24f4699a6d0c0369804b4d6e90d0b2841",
		},
		{
			Path:        "/finance/statements/stmt-2026-05.pdf",
			SizeKB:      1420,
			Sensitivity: "CONFIDENTIAL / FINANCIAL",
			LastUpdated: "2026-06-01",
			HashSHA256:  "9f83c07e0c45585b12ef024d9c490616b23023e1e9389f464d5098ff99c43d26",
		},
	}
}

// Start runs the mock enterprise API server
func (s *LabServer) Start() error {
	mux := http.NewServeMux()

	// LedgerOne API Endpoints
	mux.HandleFunc("/v2/me", s.handleLedgerMe)
	mux.HandleFunc("/v2/schema", s.handleLedgerSchema)
	mux.HandleFunc("/v2/vendors", s.handleVendors)
	mux.HandleFunc("/v2/vendors/export", s.handleVendorExport)
	mux.HandleFunc("/v2/vendors/", s.handleVendorDetailAndBank)
	mux.HandleFunc("/v2/payments/search", s.handlePaymentSearch)
	mux.HandleFunc("/v2/payments/scheduled", s.handlePaymentScheduled)
	mux.HandleFunc("/v2/payments/export", s.handlePaymentExport)

	// HelpDeskr API Endpoints
	mux.HandleFunc("/api/v1/auth/verify", s.handleHelpDeskrAuth)
	mux.HandleFunc("/api/v1/tickets", s.handleHelpDeskrTickets)
	mux.HandleFunc("/api/v1/exports/bulk", s.handleHelpDeskrBulkExport)
	mux.HandleFunc("/api/v1/exports/", s.handleHelpDeskrExportAction)

	// BlueVault Storage Endpoints
	mux.HandleFunc("/storage/files", s.handleBlueVaultFiles)
	mux.HandleFunc("/storage/download", s.handleBlueVaultDownload)

	// SSO / Identity Endpoints
	mux.HandleFunc("/sso/login", s.handleSSOLogin)

	// Lab status endpoint
	mux.HandleFunc("/lab/status", s.handleLabStatus)

	s.httpServer = &http.Server{
		Addr:    fmt.Sprintf(":%d", s.port),
		Handler: s.loggingMiddleware(mux),
	}

	log.Printf("[LabServer] Synthetic enterprise target listening on http://localhost:%d\n", s.port)
	return s.httpServer.ListenAndServe()
}

// Stop gracefully shuts down server
func (s *LabServer) Stop() error {
	if s.httpServer != nil {
		return s.httpServer.Close()
	}
	return nil
}

func (s *LabServer) loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		next.ServeHTTP(w, r)
		clientIP := r.RemoteAddr
		if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
			clientIP = xff
		}
		entry := fmt.Sprintf("[%s] %s %s from %s in %v", time.Now().UTC().Format(time.RFC3339), r.Method, r.URL.Path, clientIP, time.Since(start))
		s.mu.Lock()
		s.accessLogs = append(s.accessLogs, entry)
		s.mu.Unlock()
	})
}

func (s *LabServer) handleLabStatus(w http.ResponseWriter, r *http.Request) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"system":               "HARBOR & FINCH FREIGHT SYNTHETIC LAB",
		"case_ref":             "CR-26-047",
		"status":               "RUNNING",
		"vendors_loaded":       len(s.vendors),
		"scheduled_disbursals": len(s.scheduledPayments),
		"tickets_loaded":       len(s.tickets),
		"storage_files":        len(s.storageFiles),
		"vulnerable_to_tamper": s.vulnerableToTamper,
	})
}

func (s *LabServer) handleLedgerMe(w http.ResponseWriter, r *http.Request) {
	apiKey := r.Header.Get("X-API-Key")
	if apiKey == "" {
		apiKey = r.Header.Get("Authorization")
	}

	w.Header().Set("Content-Type", "application/json")
	if apiKey == "key-tb-07" || strings.Contains(apiKey, "key-tb-07") {
		json.NewEncoder(w).Encode(map[string]interface{}{
			"identity":        "tallybridge-integration-service",
			"key_id":          "key-tb-07",
			"tier":            "enterprise-sync",
			"permissions":     []string{"read:all", "write:vendors", "write:payments", "export:full"},
			"ip_restrictions": []string{}, // Flaw: empty IP restrictions!
			"expires_at":      nil,        // Flaw: infinite lifetime!
			"system":          "LedgerOne Financials v2.4",
		})
		return
	}

	w.WriteHeader(http.StatusUnauthorized)
	json.NewEncoder(w).Encode(map[string]string{"error": "invalid or missing API key"})
}

func (s *LabServer) handleLedgerSchema(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"api_version": "v2.4",
		"endpoints": []map[string]string{
			{"path": "/v2/me", "method": "GET", "desc": "Current API identity profile"},
			{"path": "/v2/vendors", "method": "GET", "desc": "Query vendor master list"},
			{"path": "/v2/vendors/export", "method": "POST", "desc": "Bulk asynchronous vendor download"},
			{"path": "/v2/vendors/{id}/bank-details", "method": "PATCH", "desc": "Update vendor banking disbursement coordinates"},
			{"path": "/v2/payments/search", "method": "GET", "desc": "Search active payment accounts"},
			{"path": "/v2/payments/scheduled", "method": "GET", "desc": "List pending disbursement batches"},
		},
		"auth": "Header: X-API-Key or Bearer token",
	})
}

func (s *LabServer) handleVendors(w http.ResponseWriter, r *http.Request) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	list := make([]models.Vendor, 0, len(s.vendors))
	for _, v := range s.vendors {
		list = append(list, *v)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"total_count": len(list),
		"vendors":     list,
	})
}

func (s *LabServer) handleVendorExport(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusAccepted)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"export_id":      "EXP-9931",
		"status":         "COMPLETED",
		"total_records":  9840,
		"download_url":   "/v2/exports/9931/download",
		"format":         "csv",
		"execution_time": "1.42s",
	})
}

func (s *LabServer) handleVendorDetailAndBank(w http.ResponseWriter, r *http.Request) {
	path := strings.TrimPrefix(r.URL.Path, "/v2/vendors/")
	parts := strings.Split(path, "/")
	vendorID := parts[0]

	s.mu.Lock()
	defer s.mu.Unlock()

	vendor, exists := s.vendors[vendorID]
	if !exists {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "vendor not found"})
		return
	}

	// PATCH /v2/vendors/{id}/bank-details (Attack Phase 6)
	if len(parts) >= 2 && parts[1] == "bank-details" && r.Method == http.MethodPatch {
		var req models.VendorBankPatchRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{"error": "invalid payload"})
			return
		}

		oldAccount := vendor.BankAccount
		vendor.BankAccount = req.BankAccount
		if req.BankRouting != "" {
			vendor.BankRouting = req.BankRouting
		}
		if req.BankName != "" {
			vendor.BankName = req.BankName
		}
		vendor.LastModified = time.Now().UTC()
		vendor.ModifiedBy = "key-tb-07"
		vendor.ApprovalRef = req.ApprovalRef // Missing in attack!

		// Also update the scheduled payments queue for this vendor!
		for i := range s.scheduledPayments {
			if s.scheduledPayments[i].VendorID == vendorID {
				s.scheduledPayments[i].BankAccount = req.BankAccount
				if req.BankRouting != "" {
					s.scheduledPayments[i].BankRouting = req.BankRouting
				}
			}
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status":            "SUCCESS",
			"change_id":         "chg-8b9888c39b",
			"request_id":        "req-5f61b0de8",
			"vendor_id":         vendorID,
			"vendor_name":       vendor.Name,
			"old_bank_account":  oldAccount,
			"new_bank_account":  vendor.BankAccount,
			"routing":           vendor.BankRouting,
			"modified_by":       vendor.ModifiedBy,
			"approval_ref":      vendor.ApprovalRef,
			"timestamp_utc":     vendor.LastModified.Format(time.RFC3339),
			"vulnerability_note": "CRITICAL: Bank details modified via integration API key without dual approval requirement!",
		})
		return
	}

	// GET /v2/vendors/{id} or /v2/vendors/{id}/bank-details
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(vendor)
}

func (s *LabServer) handlePaymentSearch(w http.ResponseWriter, r *http.Request) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"query":         r.URL.Query().Get("q"),
		"total_matches": 1040,
		"records":       s.scheduledPayments,
	})
}

func (s *LabServer) handlePaymentScheduled(w http.ResponseWriter, r *http.Request) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"disbursement_run": "2026-09-08",
		"total_count":      len(s.scheduledPayments),
		"payments":         s.scheduledPayments,
	})
}

func (s *LabServer) handlePaymentExport(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"export_id":   "EXP-9955",
		"records":     4210,
		"file_size":   "9.6MB",
		"status":      "COMPLETED",
		"source_host": "10.20.4.77 (tb-build-02)",
	})
}

func (s *LabServer) handleHelpDeskrAuth(w http.ResponseWriter, r *http.Request) {
	token := r.Header.Get("X-Support-Token")
	if token == "" {
		token = r.Header.Get("Authorization")
	}

	w.Header().Set("Content-Type", "application/json")
	if token == "tb-sync-svc" || strings.Contains(token, "tb-sync-svc") {
		json.NewEncoder(w).Encode(map[string]interface{}{
			"service_name": "TallyBridge Integration Service Sync Account",
			"token_id":     "tb-sync-svc",
			"scopes":       []string{"tickets:read", "exports:create", "exports:delete"},
			"rate_limit":   "unlimited",
		})
		return
	}

	w.WriteHeader(http.StatusUnauthorized)
	json.NewEncoder(w).Encode(map[string]string{"error": "unauthorized support token"})
}

func (s *LabServer) handleHelpDeskrTickets(w http.ResponseWriter, r *http.Request) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"total_tickets": len(s.tickets),
		"tickets":       s.tickets,
	})
}

func (s *LabServer) handleHelpDeskrBulkExport(w http.ResponseWriter, r *http.Request) {
	s.mu.Lock()
	defer s.mu.Unlock()

	jobID := fmt.Sprintf("EXP-%d", 5410+len(s.exportJobs))
	job := &models.BulkExportJob{
		JobID:       jobID,
		CreatedBy:   "tb-sync-svc",
		CreatedAt:   time.Now().UTC(),
		Status:      "COMPLETED",
		RecordCount: 15400,
		TargetFile:  fmt.Sprintf("/var/exports/%s_tickets.json.gz", jobID),
		SourceCIDR:  "198.18.7.41/32",
	}
	s.exportJobs[jobID] = job

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":   "Bulk export generated successfully",
		"job":       job,
		"downloads": s.tickets, // includes TKT-48213 with leaked bvk-7f3a
	})
}

func (s *LabServer) handleHelpDeskrExportAction(w http.ResponseWriter, r *http.Request) {
	jobID := strings.TrimPrefix(r.URL.Path, "/api/v1/exports/")
	s.mu.Lock()
	defer s.mu.Unlock()

	if r.Method == http.MethodDelete {
		delete(s.exportJobs, jobID)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{
			"status":  "DELETED",
			"job_id":  jobID,
			"comment": "Anti-forensics cleanup request completed",
		})
		return
	}

	w.WriteHeader(http.StatusMethodNotAllowed)
}

func (s *LabServer) handleBlueVaultFiles(w http.ResponseWriter, r *http.Request) {
	key := r.Header.Get("X-Storage-Key")
	w.Header().Set("Content-Type", "application/json")

	if key != "bvk-7f3a" && !strings.Contains(key, "bvk-7f3a") {
		w.WriteHeader(http.StatusForbidden)
		json.NewEncoder(w).Encode(map[string]string{"error": "forbidden: invalid storage key"})
		return
	}

	s.mu.RLock()
	defer s.mu.RUnlock()

	json.NewEncoder(w).Encode(map[string]interface{}{
		"bucket":      "harborfinch-finance-vault",
		"key_id":      "bvk-7f3a",
		"permissions": "read:all-folders",
		"total_files": len(s.storageFiles),
		"files":       s.storageFiles,
	})
}

func (s *LabServer) handleBlueVaultDownload(w http.ResponseWriter, r *http.Request) {
	key := r.Header.Get("X-Storage-Key")
	if key != "bvk-7f3a" && !strings.Contains(key, "bvk-7f3a") {
		w.WriteHeader(http.StatusForbidden)
		json.NewEncoder(w).Encode(map[string]string{"error": "forbidden: invalid storage key"})
		return
	}

	filePath := r.URL.Query().Get("path")
	w.Header().Set("Content-Type", "application/octet-stream")
	w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=%s", filePath))
	fmt.Fprintf(w, "[MOCK_BINARY_DATA_FOR_%s_DOWNLOADED_SUCCESSFULLY]", filePath)
}

func (s *LabServer) handleSSOLogin(w http.ResponseWriter, r *http.Request) {
	var payload struct {
		Username string `json:"username"`
		DeviceID string `json:"device_id"`
	}
	json.NewDecoder(r.Body).Decode(&payload)

	w.Header().Set("Content-Type", "application/json")
	if payload.Username == "r.menon" && payload.DeviceID == "dev-81546" {
		// Orphaned employee login without MFA (Case Note 92 / E03 / E14)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status":            "AUTHENTICATED",
			"session_id":        "sso-bb8ab61e08",
			"user":              "r.menon",
			"mfa_enforced":      false,
			"device":            "dev-81546 (Warehouse Kiosk)",
			"vulnerability":    "CRITICAL: Terminated employee account left active; MFA bypassed on kiosk device",
		})
		return
	}

	if payload.Username == "a.kapoor" {
		// Admin brute force / lockout test
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status":   "FAILED",
			"user":     "a.kapoor",
			"attempts": 3,
			"warning":  "Potential credential attack observed against IT Admin",
		})
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"status": "OK"})
}
