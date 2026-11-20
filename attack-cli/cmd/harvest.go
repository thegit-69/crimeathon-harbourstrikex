package cmd

import (
	"encoding/json"
	"fmt"

	"github.com/spf13/cobra"
	"harborstrike-x/attack-cli/pkg/utils"
)

var harvestCmd = &cobra.Command{
	Use:   "harvest",
	Short: "Phase 2: Support Ticket Exfiltration & Secret Discovery",
	Long: `Phase 2: Support Ticket Exfiltration & Secret Discovery
Abuses integration service credentials (tb-sync-svc) to launch bulk export jobs against HelpDeskr,
harvests ticket streams, and scans for leaked credentials (uncovering BlueVault key bvk-7f3a in TKT-48213).`,
	Run: func(cmd *cobra.Command, args []string) {
		utils.PrintBreadcrumb("HARBORSTRIKE-X", "PHASE 2", "SUPPORT TICKET HARVESTING & LEAK SCAN")
		utils.PrintHeader("Phase 2: HelpDeskr Support Ticket Exfiltration")
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

		utils.PrintInfo("Target Service  : HelpDeskr Support SaaS (/api/v1/support/exports)")
		utils.PrintInfo("Sync Token Used : %s (HelpDeskr Integration Principal)", ticketToken)
		utils.PrintInfo("Origin Ingress  : %s (Adversary Staging Proxy)", sourceIP)
		fmt.Println()

		data, err := cli.HarvestTickets()
		if err != nil {
			utils.PrintError("Harvesting routine failed: %v", err)
			return
		}

		utils.PrintSuccess("HARVEST COMPLETED: HelpDeskr export created and live ticket records scanned.")

		// Pro Cyber HUD Card
		cardLines := []string{
			fmt.Sprintf(" Export Batch ID   : %s%v%s  %s[COMPLETED - %v TICKET RECORDS]%s", white, data["export_id"], reset, green, data["records"], reset),
			fmt.Sprintf(" Leaked Credential : %s%v%s  %s[CRITICAL SECRET DISCLOSED]%s", red, data["leaked_token"], reset, yellow, reset),
			fmt.Sprintf(" Leaked In Ticket  : %s%v%s (Sunita Iyer pasted key into support chat)", cyan, data["leak_ticket"], reset),
			fmt.Sprintf(" Financial Anomaly : %sInvoice INV-HD-2026-0831 flagged INR 22,500 overage%s", yellow, reset),
			fmt.Sprintf(" Anti-Forensics    : %sDELETE /exports timeout preserved proof (evt-3fe76f60c4)%s", gray, reset),
			fmt.Sprintf(" Exploit Verdict   : %s[✔ EXPLOITED: CLOUD STORAGE CREDENTIAL CAPTURED]%s", green, reset),
		}
		utils.DrawBox("🎫 TICKET EXFILTRATION & CREDENTIAL HARVESTER", cardLines, cyan, 80)

		// Forensic Correlation & Next Phase
		evidenceLines := []string{
			fmt.Sprintf(" Case Evidence : %sE02 (Export Logs), E06 (Invoice Overage), E13 (Support Chat)%s", white, reset),
			fmt.Sprintf(" MITRE ATT&CK  : %sT1567 (Exfil Over Web Service) │ T1552 (Unsecured Credentials)%s", pink, reset),
			fmt.Sprintf(" Blindspot     : %sFinance Manager Madhavi Sundar dismissed overage as accrual (Note 91)%s", yellow, reset),
		}
		utils.DrawBox("🔍 FORENSIC EVIDENCE & MITRE ATT&CK CORRELATION", evidenceLines, purple, 80)

		fmt.Printf("  %s▶ NEXT STEP:%s Run %s%shso storage%s to weaponize key bvk-7f3a against BlueVault.\n\n",
			yellow, reset, green, utils.ColorUnderline, reset)

		if verbose {
			fmt.Println("  Raw Harvest Telemetry:")
			formatted, _ := json.MarshalIndent(data, "  ", "  ")
			fmt.Println(string(formatted))
		}
	},
}

func init() {
	rootCmd.AddCommand(harvestCmd)
}
