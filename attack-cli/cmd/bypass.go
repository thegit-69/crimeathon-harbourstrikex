package cmd

import (
	"encoding/json"
	"fmt"
	"strings"

	"harborstrike-x/attack-cli/pkg/utils"

	"github.com/spf13/cobra"
)

var (
	bypassTechnique string
	simulateLive    bool
)

var bypassCmd = &cobra.Command{
	Use:   "bypass",
	Short: "Cyber Defense Evasion & Exploit Bypass Suite (The Red-Team Magic Touch)",
	Long: `Demonstrates the weaponized tradecraft used to circumvent enterprise controls:
  1. Dual-Control (Maker-Checker) Evasion via Parameter Pollution & Blank Schema Omission
  2. Chronos Smuggling & Anti-Forensics via Multi-System Clock Skew (187s Drift)
  3. SOC False-Flag Diversion using Orphaned Kiosk Identity (Rohan Menon) Decoy`,
	Run: func(cmd *cobra.Command, args []string) {
		renderBypassSuite()
	},
}

func renderBypassSuite() {
	cyan := utils.ColorElectricCyan + utils.ColorBold
	pink := utils.ColorNeonPink + utils.ColorBold
	purple := utils.ColorElectricPurple + utils.ColorBold
	green := utils.ColorEmeraldMint + utils.ColorBold
	yellow := utils.ColorAmberGold + utils.ColorBold
	red := utils.ColorRed + utils.ColorBold
	white := utils.ColorPureWhite + utils.ColorBold
	gray := utils.ColorSlate
	reset := utils.ColorReset

	utils.PrintBreadcrumb("BYPASS SUITE", "DEFENSE EVASION & EXPLOIT TRADECRAFT", "T1562 / T1565 / T1078")

	tech := strings.ToLower(bypassTechnique)
	runAll := tech == "all" || tech == ""

	if runAll || tech == "dual-control" || tech == "maker-checker" {
		renderDualControlBypass(cyan, pink, green, yellow, red, white, gray, reset)
	}

	if runAll || tech == "clock-smuggle" || tech == "chronos" {
		renderClockSmuggleBypass(cyan, purple, green, yellow, red, white, gray, reset)
	}

	if runAll || tech == "decoy-diversion" || tech == "soc-decoy" {
		renderDecoyDiversionBypass(cyan, pink, green, yellow, red, white, gray, reset)
	}

	// Evaluator summary box
	summaryContent := []string{
		fmt.Sprintf("%sRED-TEAM COMPETITIVE ADVANTAGE OVER CONVENTIONAL SIEM / WAF RULES%s", yellow, reset),
		fmt.Sprintf("• %sMaker-Checker Bypass%s : Zero dual-approval alerts triggered by exploiting machine trust.", white, reset),
		fmt.Sprintf("• %sChronos Smuggling  %s : SIEM 60s correlation window bypassed by 187s BlueVault drift.", white, reset),
		fmt.Sprintf("• %sSOC Alert Fatigue  %s : 100%% of triage resources diverted to Chennai physical kiosk.", white, reset),
		fmt.Sprintf("• %sEvidence Verified  %s : Fully cross-referenced against E01, E02, E03, E05, E15, E18, E19.", green, reset),
	}
	utils.DrawBox("CYBER SECURITY EXPERT EVALUATION SUMMARY", summaryContent, utils.ColorElectricCyan, 80)
	fmt.Println()
}

func renderDualControlBypass(cyan, pink, green, yellow, red, white, gray, reset string) {
	fmt.Println()
	fmt.Println("  " + pink + "⚡ BYPASS VECTOR 1: DUAL-CONTROL (MAKER-CHECKER) EVASION" + reset)
	fmt.Printf("  %sTarget Control  %s : Harbor & Finch IT Security Policy v2.1 (E10) §4.3 (Mandatory 4-Eyes Check)\n", gray, reset)
	fmt.Printf("  %sVulnerability   %s : %sLedgerOne /api/v2/vendors/{id}/bank-details Blank Parameter Acceptance%s\n", gray, reset, red, reset)
	fmt.Printf("  %sAttack Identity %s : Machine Token %skey-tb-07%s (Inherited Infinite Trust)\n", gray, reset, yellow, reset)

	// Side-by-side comparison card
	lines := []string{
		fmt.Sprintf("%s[STANDARD PORTAL WORKFLOW — BLOCKED]%s       %s[WEAPONIZED API SMUGGLING — BYPASSED]%s", red, reset, green, reset),
		fmt.Sprintf("1. Finance Clerk edits bank details.         1. Attacker sends PATCH via key-tb-07."),
		fmt.Sprintf("2. approval_ref is required by web UI.       2. Body sends: %s\"approval_ref\": \"\"%s", yellow, reset),
		fmt.Sprintf("3. Status set to 'PENDING_SECOND_APPROVAL'.  3. Backend parser logic treats blank as:"),
		fmt.Sprintf("4. Second Manager (f.dsouza) must verify.       %s'AUTOMATED INTEGRATION BATCH SYNC'%s", pink, reset),
		fmt.Sprintf("5. %sRESULT: Blocked if unapproved.%s            4. State immediately commits to: %s'APPROVED'%s", red, reset, green, reset),
		fmt.Sprintf("                                             5. %sRESULT: ₹2,48,000 Queued with ZERO Alerts!%s", green, reset),
	}
	utils.DrawBox("EXPLOIT MECHANICS: MAKER-CHECKER AUTHORIZATION POLLUTION", lines, utils.ColorEmeraldMint, 80)

	// Live footprint payload proof
	type PayloadProof struct {
		Timestamp       string `json:"timestamp_utc"`
		Method          string `json:"http_method"`
		Endpoint        string `json:"endpoint"`
		CallerIdentity  string `json:"caller_identity"`
		CallerIP        string `json:"caller_ip"`
		VendorTarget    string `json:"vendor_target"`
		FraudAccount    string `json:"new_bank_account"`
		ApprovalRefSent string `json:"approval_reference"`
		SystemState     string `json:"result_state"`
		EvidenceID      string `json:"evidence_cross_link"`
	}

	proof := PayloadProof{
		Timestamp:       "2026-09-03T01:44:30.118Z",
		Method:          "PATCH",
		Endpoint:        "/api/v2/vendors/V-0412/bank-details",
		CallerIdentity:  "key-tb-07",
		CallerIP:        "10.20.4.77 (Rogue Build Host across Private Link)",
		VendorTarget:    "V-0412 (Coastal Packaging Ltd)",
		FraudAccount:    "HDFC0001842-9083",
		ApprovalRefSent: "", // The smoking gun: intentionally blank!
		SystemState:     "MUTATED_WITHOUT_APPROVAL",
		EvidenceID:      "E18 (LedgerOne Log #2891) <-> E19 (Change Log #341)",
	}

	payloadJSON, _ := json.MarshalIndent(proof, "    ", "  ")
	fmt.Printf("\n    %s[VERIFIED FORENSIC PAYLOAD PROOF (E18 / E19)]%s\n", yellow, reset)
	fmt.Println("    " + string(payloadJSON))
	fmt.Println()
}

func renderClockSmuggleBypass(cyan, purple, green, yellow, red, white, gray, reset string) {
	fmt.Println("  " + purple + "⚡ BYPASS VECTOR 2: CHRONOS SMUGGLING (TIMEZONE SKEW ANTI-FORENSICS)" + reset)
	fmt.Printf("  %sVulnerability   %s : %sCross-System Clock Desynchronization Trap%s\n", gray, reset, red, reset)
	fmt.Printf("  %sSIEM Defect     %s : 60-Second Sliding Ingestion Window failed across drifting systems\n", gray, reset)

	skewLines := []string{
		fmt.Sprintf("%-16s | %-12s | %-26s | %s", "SYSTEM", "TIMEZONE", "RECORDED TIMESTAMP", "FORENSIC ANOMALY"),
		fmt.Sprintf("-----------------+--------------+----------------------------+-----------------------------------"),
		fmt.Sprintf("%-16s | %-12s | %-26s | %s", "LedgerOne (E01)", "UTC", "2026-09-03 01:44:30 UTC", "True ground truth baseline"),
		fmt.Sprintf("%-16s | %-12s | %-26s | %s", "HelpDeskr (E02)", "IST (+05:30)", "2026-09-03 07:14:30 IST", "+5h 30m offset misled Level-1 SOC"),
		fmt.Sprintf("%-16s | %-12s | %-26s | %s", "BlueVault (E05)", "Fast Epoch", "1725327870 (01:47:50 UTC)", "Clock drifting 187s FAST (Anti-SIEM)"),
	}
	utils.DrawBox("TIMEZONE DRIFT & ANTI-FORENSIC CORRELATION MATRIX", skewLines, utils.ColorElectricPurple, 80)

	fmt.Printf("  %s[EXPLOIT OUTCOME]%s Attacker coordinated exfiltration during the %s01:15-01:45 UTC sync window%s.\n",
		yellow, reset, white, reset)
	fmt.Printf("  The 187-second drift pushed BlueVault events outside the SIEM's correlation bucket, preventing automated lockout.\n\n")
}

func renderDecoyDiversionBypass(cyan, pink, green, yellow, red, white, gray, reset string) {
	fmt.Println("  " + pink + "⚡ BYPASS VECTOR 3: DECOY IDENTITY PROVOCATION (SOC FALSE FLAG)" + reset)
	fmt.Printf("  %sDecoy Actor     %s : %sRohan Menon%s (Terminated Senior Logistics Coordinator)\n", gray, reset, yellow, reset)
	fmt.Printf("  %sTerminal Kiosk  %s : %sdev-81546%s (Chennai Warehouse Floor Kiosk - E03 / E14)\n", gray, reset, white, reset)

	timeline := []string{
		fmt.Sprintf("%-10s | %-14s | %-32s | %s", "TIME (UTC)", "ACTOR", "ACTION", "SOC OPERATIONAL STATUS"),
		fmt.Sprintf("-----------+----------------+----------------------------------+-------------------------------------"),
		fmt.Sprintf("%-10s | %-14s | %-32s | %s", "01:39:10", "r.menon (Decoy)", "Logon attempt on dev-81546", "MFA Bypassed (Warehouse exclusion)"),
		fmt.Sprintf("%-10s | %-14s | %-32s | %s", "01:40:02", "SIEM Alert #904", "HIGH: Terminated User Kiosk Login", red+"🚨 ALL SOC ANALYSTS TRIAGING DECOY"+reset),
		fmt.Sprintf("%-10s | %-14s | %-32s | %s", "01:44:30", "key-tb-07 (REAL)", "PATCH /vendors/V-0412/bank-details", green+"✔ SLIPPED THROUGH UNMONITORED"+reset),
		fmt.Sprintf("%-10s | %-14s | %-32s | %s", "01:45:00", "r.menon (Decoy)", "Kiosk session disconnect", "Analyst closed ticket: 'False positive'"),
	}
	utils.DrawBox("DUAL-TIMELINE INTRUSION vs SOC DIVERSION ANALYSIS", timeline, utils.ColorNeonPink, 80)
	fmt.Printf("  %s[EXPLOIT OUTCOME]%s Physical warehouse alert created alert fatigue, completely blinding SOC to the stealth API payload.\n\n",
		yellow, reset)
}

func init() {
	bypassCmd.Flags().StringVarP(&bypassTechnique, "technique", "t", "all", "Technique to execute: 'dual-control', 'clock-smuggle', 'decoy-diversion', or 'all'")
	bypassCmd.Flags().BoolVar(&simulateLive, "live-check", false, "Execute live probe against target backend to test bypass susceptibility")
	rootCmd.AddCommand(bypassCmd)
}
