package cmd

import (
	"encoding/json"
	"fmt"

	"harborstrike-x/attack-cli/pkg/utils"

	"github.com/spf13/cobra"
)

var pivotCmd = &cobra.Command{
	Use:   "pivot",
	Short: "Phase 5: Private Tunnel Pivot & Payment Profiling",
	Long: `Phase 5: Private Tunnel Pivot & Payment Profiling
Simulates queries originating from the rogue vendor build server (tb-build-02 @ 10.20.4.77)
across the Private Link tunnel (10.20.4.0/24), inspecting upcoming payment runs and active disbursements.`,
	Run: func(cmd *cobra.Command, args []string) {
		utils.PrintBreadcrumb("HARBORSTRIKE-X", "PHASE 5", "PRIVATE LINK TUNNEL PIVOT")
		utils.PrintHeader("Phase 5: Private Network Tunnel Pivot (10.20.4.77)")
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

		utils.PrintInfo("Tunnel Route    : Private Link Network (10.20.4.0/24)")
		utils.PrintInfo("Rogue Host      : 10.20.4.77 (tb-build-02 Rogue Build Server)")
		utils.PrintInfo("Target API      : /api/v2/payments/search?vendor_id=V-0412")
		fmt.Println()

		data, err := cli.PivotTunnel()
		if err != nil {
			utils.PrintError("Pivot routine failed: %v", err)
			return
		}

		utils.PrintSuccess("TUNNEL PIVOT ESTABLISHED: Rogue build server accessed live payment and network-flow records!")

		// Pro Cyber HUD Card
		cardLines := []string{
			fmt.Sprintf(" Rogue Build Host  : %s%v%s  %s[INTERNAL ROUTE ACTIVE]%s", white, data["source_host"], reset, green, reset),
			fmt.Sprintf(" Private Tunnel    : %s%v%s", cyan, data["tunnel"], reset),
			fmt.Sprintf(" Volume Extracted  : %s%v%s", yellow, data["bytes_pulled"], reset),
			fmt.Sprintf(" Target Identified : %s%v%s", red, data["identified_target"], reset),
			fmt.Sprintf(" Cover-Up Proof    : %sDisproves TallyBridge partner notice (E16) denying tunnel involvement%s", pink, reset),
			fmt.Sprintf(" Exploit Verdict   : %s[✔ EXPLOITED: INTERNAL TRUSTED NETWORK BREACHED]%s", green, reset),
		}
		utils.DrawBox("🌐 PRIVATE TUNNEL PIVOT & NETWORK EXTRACTION PROFILE", cardLines, cyan, 80)

		// Forensic Correlation & Next Phase
		evidenceLines := []string{
			fmt.Sprintf(" Case Evidence : %sE15 (Flow Log), E16 (Notice), E17 (Defective IOCs)%s", white, reset),
			fmt.Sprintf(" MITRE ATT&CK  : %sT1199 (Trusted Relationship) │ T1046 (Network Discovery)%s", pink, reset),
			fmt.Sprintf(" User Impact   : %sCaused dispatch dashboard sluggishness in August mornings (Note 94)%s", yellow, reset),
		}
		utils.DrawBox("🔍 FORENSIC EVIDENCE & MITRE ATT&CK CORRELATION", evidenceLines, purple, 80)

		fmt.Printf("  %s▶ NEXT STEP:%s Run %s%shso tamper%s to execute the silent vendor bank account alteration (CLIMAX).\n\n",
			yellow, reset, red+utils.ColorBold, utils.ColorUnderline, reset)

		_ = gray
		if verbose {
			fmt.Println("  Raw Pivot Telemetry:")
			formatted, _ := json.MarshalIndent(data, "  ", "  ")
			fmt.Println(string(formatted))
		}
	},
}

func init() {
	rootCmd.AddCommand(pivotCmd)
}
