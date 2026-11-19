package cmd

import (
	"encoding/json"
	"fmt"
	"os"

	"github.com/spf13/cobra"
	"harborstrike-x/attack-cli/pkg/utils"
)

var (
	reportFormat string
	reportOutput string
)

var reportCmd = &cobra.Command{
	Use:   "report",
	Short: "Generate offensive security validation and MITRE ATT&CK findings report",
	Long: `Generate offensive security validation and MITRE ATT&CK findings report.
Outputs complete forensic analysis, exploit verification results, control gaps,
and actionable remediation recommendations in Markdown, JSON, or Terminal format.`,
	Run: func(cmd *cobra.Command, args []string) {
		switch reportFormat {
		case "json":
			generateJSONReport()
		case "markdown", "md":
			generateMarkdownReport()
		default:
			generateTextReport()
		}
	},
}

func generateTextReport() {
	utils.PrintBanner()

	cyan := utils.ColorElectricCyan + utils.ColorBold
	pink := utils.ColorNeonPink + utils.ColorBold
	green := utils.ColorEmeraldMint + utils.ColorBold
	red := utils.ColorCrimson + utils.ColorBold
	yellow := utils.ColorAmberGold + utils.ColorBold
	white := utils.ColorPureWhite + utils.ColorBold
	gray := utils.ColorSlate
	reset := utils.ColorReset

	reportLines := []string{
		"",
		fmt.Sprintf(" %s1. EXECUTIVE SUMMARY%s", yellow, reset),
		fmt.Sprintf("    • Organization  : %sHarbor & Finch Freight Pvt. Ltd. (Chennai Hub)%s", white, reset),
		fmt.Sprintf("    • Incident Type : %sSupply-Chain Integration Abuse & Silent Payment Fraud%s", pink, reset),
		fmt.Sprintf("    • Direct Target : %sCoastal Packaging Ltd (Vendor V-0412)%s", cyan, reset),
		fmt.Sprintf("    • At-Risk Funds : %sINR 1,845,000.00%s %s(Scheduled Run: 08 Sep 2026)%s", red, reset, gray, reset),
		"",
		fmt.Sprintf(" %s2. TESTED KILL-CHAIN & MITRE ATT&CK VALIDATION%s", yellow, reset),
		fmt.Sprintf("    • %sT1199%s Trusted Relationship  : %sRogue host 10.20.4.77 on private tunnel%s", cyan, reset, green, reset),
		fmt.Sprintf("    • %sT1078%s Valid Accounts        : %sInfinite machine key (key-tb-07) & orphan user%s", cyan, reset, green, reset),
		fmt.Sprintf("    • %sT1567%s Web Exfiltration      : %s10 bulk exports (EXP-5412) via HelpDeskr%s", cyan, reset, green, reset),
		fmt.Sprintf("    • %sT1530%s Cloud Storage Theft   : %sMaster bank spreadsheet exfil via bvk-7f3a%s", cyan, reset, green, reset),
		fmt.Sprintf("    • %sT1565%s Data Manipulation     : %sPATCH vendor bank account to mule (****9083)%s", cyan, reset, red, reset),
		"",
		fmt.Sprintf(" %s3. GOVERNANCE BREAKDOWN (E07, E08, E10, E11, E14)%s", yellow, reset),
		fmt.Sprintf("    • Due Diligence : SOC 2 explicitly carved out credential vault (E07)"),
		fmt.Sprintf("    • Contract Trap : MSA Clause 14.3 shields vendor from loss liability (E08)"),
		fmt.Sprintf("    • Audit Ignored : All 7 findings from IA-2025-09 left 100%% OPEN (E11)"),
		fmt.Sprintf("    • Offboarding   : 8 terminated employees active in SSO roster (E14)"),
		"",
		fmt.Sprintf(" %s4. IMMEDIATE REMEDIATION (P0 ACTIONS)%s", green, reset),
		fmt.Sprintf("    1. Freeze payment run PAY-2026-0908-01 for vendor V-0412 immediately."),
		fmt.Sprintf("    2. Revoke machine identities: key-tb-07, tb-sync-svc, bvk-7f3a."),
		fmt.Sprintf("    3. Sever network routing for rogue vendor host 10.20.4.77."),
		fmt.Sprintf("    4. Enforce mandatory dual-authorization gate for vendor banking details."),
		"",
	}

	utils.DrawBox("📋 OFFENSIVE VALIDATION EXECUTIVE REPORT (CR-26-047)", reportLines, pink, 84)
	utils.PrintGradientBar()
}

func generateMarkdownReport() {
	md := `# HARBORSTRIKE X — Offensive Security Validation Report
**Case File:** CR-26-047 | **Target:** Harbor & Finch Freight Pvt. Ltd.  
**Track:** OFFENSE (Control Gap Exploitation, Attack Simulation & Footprint Reconstruction)  
**Date:** 20 November 2026

---

## 1. Executive Summary
Offensive validation against synthetic enterprise infrastructure confirmed a critical, multi-stage supply chain compromise resulting in unauthorized vendor payment tampering right before the September 8, 2026 payment run.

The threat actor leveraged over-privileged, unrotated machine identities (key-tb-07, tb-sync-svc, bvk-7f3a) to move laterally across Support, Cloud Storage, and Finance systems without raising a single security alarm.

---

## 2. Tested Attack Lifecycle & Exploit Verifications

| Phase | Vector / Endpoint | Identity Used | Source IP | Exploit Verdict |
| :---: | :--- | :--- | :--- | :---: |
| **1** | Recon: GET /v2/me | key-tb-07 | 198.18.7.41 | **VULNERABLE** |
| **2** | Ticket Theft: POST /api/v1/exports/bulk | tb-sync-svc | 198.18.7.41 | **VULNERABLE** |
| **3** | Storage Exfil: GET /storage/files | bvk-7f3a | 198.18.7.23 | **VULNERABLE** |
| **4** | Vendor Catalog Exfil: POST /v2/vendors/export | key-tb-07 | 198.18.7.58 | **VULNERABLE** |
| **5** | Tunnel Pivot: GET /v2/payments/search | tb-build-02 | 10.20.4.77 | **VULNERABLE** |
| **6** | Bank Tampering: PATCH /v2/vendors/V-0412 | key-tb-07 | 10.20.4.77 | **CRITICAL EXPLOIT** |
| **7** | Lock-In Verification: GET /v2/payments/scheduled | key-tb-07 | 10.20.4.77 | **CONFIRMED** |
| **8** | Orphaned SSO Login: POST /sso/login | r.menon | dev-81546 | **VULNERABLE** |

---

## 3. The Fraudulent Bank Account Modification (Phase 6)
On **03 September 2026 at 01:44:30 UTC (07:14:30 IST)**:
- **Vendor:** Coastal Packaging Ltd (V-0412)
- **Original Bank Account:** HDFC0001842-4417
- **Tampered Bank Account:** HDFC0001842-9083 (Attacker Mule Account)
- **Approval Reference:** BLANK (Zero dual-approval or human review enforced)
- **Imminent Financial Loss:** INR 1,845,000 scheduled for disbursement on September 8!
`
	if reportOutput != "" {
		if err := os.WriteFile(reportOutput, []byte(md), 0644); err != nil {
			utils.PrintError("Failed to write report to %s: %v", reportOutput, err)
			return
		}
		utils.PrintSuccess("Offensive validation report written to %s", reportOutput)
	} else {
		fmt.Println(md)
	}
}

func generateJSONReport() {
	data := map[string]interface{}{
		"case_id":        "CR-26-047",
		"target_company": "Harbor & Finch Freight Pvt. Ltd.",
		"overall_status": "VULNERABLE",
		"kill_chain_steps_tested": 8,
		"successful_exploits":     8,
		"critical_exploit": map[string]interface{}{
			"phase":           6,
			"target_vendor":   "V-0412 (Coastal Packaging Ltd)",
			"tampered_field":  "bank_account",
			"original_value":  "HDFC0001842-4417",
			"tampered_value":  "HDFC0001842-9083",
			"financial_risk":  "INR 1,845,000.00",
			"disbursement_dt": "2026-09-08",
		},
	}
	formatted, _ := json.MarshalIndent(data, "", "  ")
	if reportOutput != "" {
		os.WriteFile(reportOutput, formatted, 0644)
		utils.PrintSuccess("JSON report saved to %s", reportOutput)
	} else {
		fmt.Println(string(formatted))
	}
}

func init() {
	reportCmd.Flags().StringVarP(&reportFormat, "format", "f", "text", "Report format: text, markdown, json")
	reportCmd.Flags().StringVarP(&reportOutput, "output", "o", "", "Output file path (optional)")
	rootCmd.AddCommand(reportCmd)
}
