package models

import "time"

// Vendor represents a vendor record in LedgerOne
type Vendor struct {
	ID             string    `json:"id"`
	Name           string    `json:"name"`
	Category       string    `json:"category"`
	ContactEmail   string    `json:"contact_email"`
	Status         string    `json:"status"`
	BankAccount    string    `json:"bank_account"`
	BankRouting    string    `json:"bank_routing"`
	BankName       string    `json:"bank_name"`
	LastModified   time.Time `json:"last_modified"`
	ModifiedBy     string    `json:"modified_by"`
	ApprovalRef    string    `json:"approval_ref,omitempty"`
}

// VendorBankPatchRequest represents the payload to tamper vendor bank details
type VendorBankPatchRequest struct {
	BankAccount string `json:"bank_account"`
	BankRouting string `json:"bank_routing"`
	BankName    string `json:"bank_name,omitempty"`
	Reason      string `json:"reason,omitempty"`
	ApprovalRef string `json:"approval_ref,omitempty"`
}

// ScheduledPayment represents an upcoming disbursement in LedgerOne
type ScheduledPayment struct {
	PaymentID      string    `json:"payment_id"`
	VendorID       string    `json:"vendor_id"`
	VendorName     string    `json:"vendor_name"`
	AmountINR      float64   `json:"amount_inr"`
	ScheduledDate  string    `json:"scheduled_date"`
	BankAccount    string    `json:"bank_account"`
	BankRouting    string    `json:"bank_routing"`
	Status         string    `json:"status"`
	InvoiceRef     string    `json:"invoice_ref"`
}

// Ticket represents a HelpDeskr support ticket
type Ticket struct {
	TicketID    string    `json:"ticket_id"`
	Customer    string    `json:"customer"`
	CreatedDate string    `json:"created_date"`
	Subject     string    `json:"subject"`
	Content     string    `json:"content"`
	LeakedData  string    `json:"leaked_data,omitempty"`
}

// BulkExportJob represents a HelpDeskr export task
type BulkExportJob struct {
	JobID       string    `json:"job_id"`
	CreatedBy   string    `json:"created_by"`
	CreatedAt   time.Time `json:"created_at"`
	Status      string    `json:"status"`
	RecordCount int       `json:"record_count"`
	TargetFile  string    `json:"target_file"`
	SourceCIDR  string    `json:"source_cidr"`
}

// StorageFile represents a document in BlueVault
type StorageFile struct {
	Path        string `json:"path"`
	SizeKB      int    `json:"size_kb"`
	Sensitivity string `json:"sensitivity"`
	LastUpdated string `json:"last_updated"`
	HashSHA256  string `json:"hash_sha256"`
}

// APIKeyProfile represents metadata of an integration credential from Software Register
type APIKeyProfile struct {
	KeyID            string   `json:"key_id"`
	System           string   `json:"system"`
	Owner            string   `json:"owner"`
	Scopes           []string `json:"scopes"`
	Lifetime         string   `json:"lifetime"`
	IPRestrictions   []string `json:"ip_restrictions"`
	LastRotated      string   `json:"last_rotated"`
	ComplianceStatus string   `json:"compliance_status"`
}

// AttackStepResult records the outcome of an attack validation phase
type AttackStepResult struct {
	Phase          int       `json:"phase"`
	Name           string    `json:"name"`
	TargetSystem   string    `json:"target_system"`
	Endpoint       string    `json:"endpoint"`
	ActorIdentity  string    `json:"actor_identity"`
	SourceIP       string    `json:"source_ip"`
	TimestampUTC   time.Time `json:"timestamp_utc"`
	Status         string    `json:"status"` // SUCCESS, BLOCKED, ANOMALOUS
	EvidenceRef    string    `json:"evidence_ref"`
	MITRETechnique string    `json:"mitre_technique"`
	Details        string    `json:"details"`
	PayloadSummary string    `json:"payload_summary,omitempty"`
}

// CampaignSummary aggregates results from all phases
type CampaignSummary struct {
	TargetBaseURL  string             `json:"target_base_url"`
	ExecutionMode  string             `json:"execution_mode"`
	StartTimeUTC   time.Time          `json:"start_time_utc"`
	EndTimeUTC     time.Time          `json:"end_time_utc"`
	TotalPhases    int                `json:"total_phases"`
	Successful     int                `json:"successful"`
	Blocked        int                `json:"blocked"`
	OverallVerdict string             `json:"overall_verdict"`
	Steps          []AttackStepResult `json:"steps"`
}
