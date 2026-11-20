package cmd

import (
	"encoding/json"
	"fmt"

	"github.com/spf13/cobra"
	"harborstrike-x/attack-cli/pkg/utils"
)

var antiForensicsCmd = &cobra.Command{
	Use:     "anti-forensics",
	Aliases: []string{"cleanup", "erase-traces", "wipe"},
	Short:   "Simulate Evidence Deletion & Anti-Forensics Evasion (T1070)",
	Long: `Simulate Evidence Deletion & Anti-Forensics Evasion
Executes the adversary's post-exfiltration cleanup routines:
Attempts to delete bulk export jobs from LedgerOne (purging EXP-9931 via req-2cb75d3eac)
and HelpDeskr (attempting to delete EXP-5419 which failed due to a gateway timeout, evt-3fe76f60c4).`,
	Run: func(cmd *cobra.Command, args []string) {
		utils.PrintBreadcrumb("HARBORSTRIKE-X", "ANTI-FORENSICS", "EVIDENCE DELETION & TRACE WIPING")
		utils.PrintHeader("Offensive Anti-Forensics & Trace Elimination")
		cli := GetClient()

		cyan := utils.ColorElectricCyan + utils.ColorBold
		purple := utils.ColorElectricPurple + utils.ColorBold
		pink := utils.ColorNeonPink + utils.ColorBold
		red := utils.ColorCrimson + utils.ColorBold
		yellow := utils.ColorAmberGold + utils.ColorBold
		white := utils.ColorPureWhite + utils.ColorBold
		gray := utils.ColorSlate
		reset := utils.ColorReset

		utils.PrintInfo("Target LedgerOne : No export-delete route exists")
		utils.PrintInfo("Target HelpDeskr : DELETE /api/v1/support/exports/EXP-5419")
		fmt.Println()

		res, err := cli.ExecuteAntiForensics()
		if err != nil {
			utils.PrintError("Anti-forensics execution failed: %v", err)
			return
		}

		if res.HelpDeskrJobDeleted {
			utils.PrintWarning("ANTI-FORENSICS ROUTINE: HelpDeskr export was deleted; LedgerOne export deletion is unsupported.")
		} else {
			utils.PrintWarning("ANTI-FORENSICS ROUTINE: No live trace deletion was confirmed.")
		}

		// Cyber HUD Card
		ledgerStatus := "NOT IMPLEMENTED"
		if res.LedgerOneJobDeleted {
			ledgerStatus = "PURGED"
		}
		helpStatus := "NOT DELETED"
		if res.HelpDeskrJobDeleted {
			helpStatus = "PURGED"
		}
		cardLines := []string{
			fmt.Sprintf(" LedgerOne Cleanup  : %s%s%s  %s[%s]%s", yellow, ledgerStatus, reset, white, res.LedgerOneMessage, reset),
			fmt.Sprintf(" HelpDeskr Cleanup  : %s%s%s  %s[%s]%s", red, helpStatus, reset, yellow, res.HelpDeskrError, reset),
			fmt.Sprintf(" Forensic Retention : %s%s%s", pink, res.EvidentiaryTrail, reset),
			fmt.Sprintf(" Evaluator Takeaway : %sFailure on HelpDeskr preserved smoking gun proof in audit log E02!%s", cyan, reset),
		}
		utils.DrawBox("🧹 ANTI-FORENSICS & EVIDENCE WIPING PROFILE", cardLines, pink, 84)

		// Forensic Correlation
		evidenceLines := []string{
			fmt.Sprintf(" Case Evidence : %sE01 (req-2cb75d3eac on 12 Aug), E02 (evt-3fe76f60c4), E06 (Invoice INV-HD-2026-0831)%s", white, reset),
			fmt.Sprintf(" MITRE ATT&CK  : %sT1070.004 (File Deletion) │ T1070 (Indicator Removal on Host)%s", pink, reset),
			fmt.Sprintf(" Forensic Trap : %sSupport chat E13 confirms Support staff noticed stuck job but dismissed it%s", yellow, reset),
		}
		utils.DrawBox("🔍 FORENSIC EVIDENCE & MITRE ATT&CK CORRELATION", evidenceLines, purple, 84)

		if verbose {
			fmt.Println("  Raw Anti-Forensics Telemetry:")
			formatted, _ := json.MarshalIndent(res, "  ", "  ")
			fmt.Println(string(formatted))
		}
		_ = gray
	},
}

func init() {
	rootCmd.AddCommand(antiForensicsCmd)
}
