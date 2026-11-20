package cmd

import (
	"encoding/json"
	"fmt"

	"harborstrike-x/attack-cli/pkg/utils"

	"github.com/spf13/cobra"
)

var vendorExfilCmd = &cobra.Command{
	Use:   "vendor-exfil",
	Short: "Phase 4: Bulk Financial Vendor Master Catalog Exfiltration",
	Long: `Phase 4: Bulk Financial Vendor Master Catalog Exfiltration
Calls GET /api/v2/vendors/export on LedgerOne with machine key key-tb-07.
Downloads the live vendor master records, mapping vendor codes, bank accounts, and payment terms.`,
	Run: func(cmd *cobra.Command, args []string) {
		utils.PrintBreadcrumb("HARBORSTRIKE-X", "PHASE 4", "FINANCIAL VENDOR MASTER EXFILTRATION")
		utils.PrintHeader("Phase 4: Vendor Master Catalog Exfiltration")
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

		utils.PrintInfo("Target System   : LedgerOne Production (/api/v2/vendors/export)")
		utils.PrintInfo("Key Weaponized  : %s (TallyBridge Sync Machine Key)", apiKey)
		utils.PrintInfo("Origin Ingress  : 198.18.7.58 (External Attacker Ingress via E01)")
		fmt.Println()

		data, err := cli.ExfilVendors()
		if err != nil {
			utils.PrintError("Vendor exfiltration failed: %v", err)
			return
		}

		utils.PrintSuccess("EXFIL COMPLETED: Dumped live vendor master records; prime target Coastal Packaging Ltd identified!")

		// Pro Cyber HUD Card
		cardLines := []string{
			fmt.Sprintf(" Export Job ID     : %s%v%s  %s[DUMP COMPLETE - %v ROWS]%s", white, data["export_id"], reset, green, data["total_records"], reset),
			fmt.Sprintf(" Target Identified : %s%v%s", yellow, data["target_vendor"], reset),
			fmt.Sprintf(" Genuine Account   : %s%v%s  %s[BASELINE HDFC COORDINATES]%s", cyan, data["legitimate_acc"], reset, green, reset),
			fmt.Sprintf(" Scheduled Payout  : %s%v%s", red, data["scheduled_payout"], reset),
			fmt.Sprintf(" Anti-Forensics    : %sDELETE /v2/exports/9931 called to erase job record%s", gray, reset),
			fmt.Sprintf(" Exploit Verdict   : %s[✔ EXPLOITED: PRIME TARGET & DISBURSEMENT PINPOINTED]%s", green, reset),
		}
		utils.DrawBox("📋 VENDOR MASTER CATALOG EXFILTRATION PROFILE", cardLines, cyan, 80)

		// Forensic Correlation & Next Phase
		evidenceLines := []string{
			fmt.Sprintf(" Case Evidence : %sE01 (req-c35c2ccaff on 12 Aug), E18 (API Log), E19 (Record Log)%s", white, reset),
			fmt.Sprintf(" MITRE ATT&CK  : %sT1119 (Automated Collection) │ T1567 (Web Exfiltration)%s", pink, reset),
			fmt.Sprintf(" Baseline      : %sFarah Dsouza legitimate audit on 22 July (req-6247db07f1)%s", yellow, reset),
		}
		utils.DrawBox("🔍 FORENSIC EVIDENCE & MITRE ATT&CK CORRELATION", evidenceLines, purple, 80)

		fmt.Printf("  %s▶ NEXT STEP:%s Run %s%shso pivot%s to simulate the rogue build server tunnel route.\n\n",
			yellow, reset, green, utils.ColorUnderline, reset)

		_ = gray
		if verbose {
			fmt.Println("  Raw Vendor Exfil Data:")
			formatted, _ := json.MarshalIndent(data, "  ", "  ")
			fmt.Println(string(formatted))
		}
	},
}

func init() {
	rootCmd.AddCommand(vendorExfilCmd)
}
