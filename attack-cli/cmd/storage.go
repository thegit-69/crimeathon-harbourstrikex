package cmd

import (
	"encoding/json"
	"fmt"

	"github.com/spf13/cobra"
	"harborstrike-x/attack-cli/pkg/utils"
)

var storageCmd = &cobra.Command{
	Use:   "storage",
	Short: "Phase 3: Cloud File Storage Exfiltration via Leaked Key",
	Long: `Phase 3: Cloud File Storage Exfiltration via Leaked Key
Weaponizes the discovered BlueVault storage key (bvk-7f3a) to access cloud buckets,
enumerate documents in /finance, and exfiltrate master bank details and financial statements.`,
	Run: func(cmd *cobra.Command, args []string) {
		utils.PrintBreadcrumb("HARBORSTRIKE-X", "PHASE 3", "CLOUD STORAGE EXFILTRATION")
		utils.PrintHeader("Phase 3: Cloud Storage Exfiltration (BlueVault)")
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

		utils.PrintInfo("Target Storage  : BlueVault Object Storage (/storage/files)")
		utils.PrintInfo("Key Weaponized  : %s (Harvested from TKT-48213)", storageKey)
		utils.PrintInfo("Origin Ingress  : 198.18.7.23 (Adversary Staging Host)",)
		fmt.Println()

		data, err := cli.AccessStorage()
		if err != nil {
			utils.PrintError("Storage access failed: %v", err)
			return
		}

		utils.PrintSuccess("STORAGE BREACHED: Leaked credential granted full read access to confidential financial documents!")

		// Pro Cyber HUD Card
		cardLines := []string{
			fmt.Sprintf(" Storage Vault     : %s%v%s  %s[ACCESS GRANTED]%s", white, data["bucket"], reset, green, reset),
			fmt.Sprintf(" Weaponized Key    : %s%v%s (Unrotated since 2024 - Risk R-029)", yellow, data["key_id"], reset),
			fmt.Sprintf(" Stolen Master File: %svendor-bank-details-2026.xlsx (4.28 MB, 300 Vendors)%s", red, reset),
			fmt.Sprintf(" Exfiltrated Docs  : %s40 financial statement records (stmt-2026-01 to 05.pdf)%s", cyan, reset),
			fmt.Sprintf(" Ingress Route     : %s198.18.7.23 (External Adversary Infrastructure via E20)%s", yellow, reset),
			fmt.Sprintf(" Exploit Verdict   : %s[✔ EXPLOITED: ALL 300 VENDOR BANK COORDINATES COMPROMISED]%s", green, reset),
		}
		utils.DrawBox("🗄️ CLOUD OBJECT STORAGE EXFILTRATION PROFILE", cardLines, cyan, 80)

		// Forensic Correlation & Next Phase
		evidenceLines := []string{
			fmt.Sprintf(" Case Evidence : %sE05 (BlueVault Access Log), E09 (Risk Register), E20 (OSINT)%s", white, reset),
			fmt.Sprintf(" MITRE ATT&CK  : %sT1530 (Data from Cloud Storage) │ T1567 (Web Exfiltration)%s", pink, reset),
			fmt.Sprintf(" Key Impact    : %sProvided adversary baseline bank details for all 300 freight vendors%s", yellow, reset),
		}
		utils.DrawBox("🔍 FORENSIC EVIDENCE & MITRE ATT&CK CORRELATION", evidenceLines, purple, 80)

		fmt.Printf("  %s▶ NEXT STEP:%s Run %s%shso vendor-exfil%s to dump the live vendor master catalog from LedgerOne.\n\n",
			yellow, reset, green, utils.ColorUnderline, reset)

		_ = gray
		if verbose {
			fmt.Println("  Raw Storage Metadata:")
			formatted, _ := json.MarshalIndent(data, "  ", "  ")
			fmt.Println(string(formatted))
		}
	},
}

func init() {
	rootCmd.AddCommand(storageCmd)
}
