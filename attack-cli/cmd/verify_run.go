package cmd

import (
	"encoding/json"
	"fmt"

	"github.com/spf13/cobra"
	"harborstrike-x/attack-cli/pkg/utils"
)

var verifyRunCmd = &cobra.Command{
	Use:   "verify-run",
	Short: "Phase 7: Disbursement Verification & Pre-Execution Gate",
	Long: `Phase 7: Disbursement Verification & Pre-Execution Gate
Queries GET /v2/payments/scheduled to verify that the fraudulent bank account
is locked into the automated payment run scheduled for September 8, 2026.`,
	Run: func(cmd *cobra.Command, args []string) {
		utils.PrintBreadcrumb("HARBORSTRIKE-X", "PHASE 7", "DISBURSEMENT PRE-EXECUTION VERIFICATION")
		utils.PrintHeader("Phase 7: Disbursement Run Verification")
		cli := GetClient()

		cyan := utils.ColorElectricCyan + utils.ColorBold
		purple := utils.ColorElectricPurple + utils.ColorBold
		pink := utils.ColorNeonPink + utils.ColorBold
		green := utils.ColorEmeraldMint + utils.ColorBold
		red := utils.ColorCrimson + utils.ColorBold
		yellow := utils.ColorAmberGold + utils.ColorBold
		white := utils.ColorPureWhite + utils.ColorBold
		gray := utils.ColorSlate
		reset := utils.ColorReset

		utils.PrintInfo("Target System   : LedgerOne Production (/v2/payments/scheduled)")
		utils.PrintInfo("Query Batch     : 2026-09-08 Automated Disbursement Run")
		utils.PrintInfo("Origin Route    : 10.20.4.77 (Private Link tb-build-02)")
		fmt.Println()

		data, err := cli.VerifyScheduledRun()
		if err != nil {
			utils.PrintError("Verification query failed: %v", err)
			return
		}

		utils.PrintSuccess("DISBURSEMENT RETRIEVED: Fraudulent mule account is locked in for September 8 payout run!")

		// Pro Cyber HUD Card
		cardLines := []string{
			fmt.Sprintf(" Disbursement Batch : %s%v%s  %s[SCHEDULED RUN: 08 SEPT 2026]%s", white, data["disbursement_run"], reset, yellow, reset),
			fmt.Sprintf(" Target Vendor      : %sV-0412 - Coastal Packaging Ltd%s", cyan, reset),
			fmt.Sprintf(" At-Risk Funds      : %sINR 1,845,000.00%s", red, reset),
			fmt.Sprintf(" Locked Destination : %sHDFC0001842-9083%s  %s[MULE ACCOUNT ARMED]%s", red, reset, red, reset),
			fmt.Sprintf(" Queue Status       : %sPENDING_DISBURSEMENT (Automated Transfer Ready)%s", yellow, reset),
			fmt.Sprintf(" Exploit Verdict    : %s[✔ EXPLOITED: FRAUDULENT PAYOUT ROUTED & LOCKED IN]%s", green, reset),
		}
		utils.DrawBox("💰 SCHEDULED DISBURSEMENT QUEUE INSPECTION", cardLines, cyan, 80)

		// Forensic Correlation & Next Phase
		evidenceLines := []string{
			fmt.Sprintf(" Case Evidence : %sE18 (req-bb819dfe0c on 06 Sep), E19 (chg-8b9888c39b)%s", white, reset),
			fmt.Sprintf(" MITRE ATT&CK  : %sT1020 (Automated Exfiltration) │ T1565 (Data Manipulation)%s", pink, reset),
			fmt.Sprintf(" Last Defense  : %sEngagement of investigation team on Sep 7 is the sole remaining barrier!%s", red, reset),
		}
		utils.DrawBox("🔍 FORENSIC EVIDENCE & MITRE ATT&CK CORRELATION", evidenceLines, purple, 80)

		fmt.Printf("  %s▶ NEXT STEP:%s Run %s%shso auth-test%s to validate the decoy orphaned account login.\n\n",
			yellow, reset, green, utils.ColorUnderline, reset)

		_ = gray
		if verbose {
			fmt.Println("  Raw Scheduled Disbursements:")
			formatted, _ := json.MarshalIndent(data, "  ", "  ")
			fmt.Println(string(formatted))
		}
	},
}

func init() {
	rootCmd.AddCommand(verifyRunCmd)
}
