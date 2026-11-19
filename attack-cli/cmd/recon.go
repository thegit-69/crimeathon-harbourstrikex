package cmd

import (
	"encoding/json"
	"fmt"

	"github.com/spf13/cobra"
	"harborstrike-x/attack-cli/pkg/utils"
)

var reconCmd = &cobra.Command{
	Use:   "recon",
	Short: "Phase 1: API Reconnaissance & Key Exposure Profiling",
	Long: `Phase 1: API Reconnaissance & Key Exposure Profiling
Simulates and validates reconnaissance routines against LedgerOne endpoints (/v2/me, /v2/schema).
Audits key lifetime, permissions over-scoping, and the absence of IP/CIDR restrictions.`,
	Run: func(cmd *cobra.Command, args []string) {
		utils.PrintBreadcrumb("HARBORSTRIKE-X", "PHASE 1", "API RECONNAISSANCE & MACHINE IDENTITY SCOPING")
		utils.PrintHeader("Phase 1: API Reconnaissance & Key Exposure Profiling")
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

		utils.PrintInfo("Target Endpoint : %s/v2/me", targetBaseURL)
		utils.PrintInfo("Credential Used : %s (TallyBridge Sync Machine Key)", apiKey)
		utils.PrintInfo("Origin IP       : %s (Simulated Internet Staging Ingress)", sourceIP)
		fmt.Println()

		data, err := cli.ProbeRecon()
		if err != nil {
			utils.PrintError("Recon probe failed: %v", err)
			return
		}

		utils.PrintSuccess("RECON COMPLETED: Machine identity disclosed over-privileged scopes with ZERO restrictions!")

		// Pro Cyber HUD Card
		cardLines := []string{
			fmt.Sprintf(" Service Principal : %s%v%s", white, data["identity"], reset),
			fmt.Sprintf(" Machine Key ID    : %s%v%s  %s[ACTIVE / VALID]%s", yellow, data["key_id"], reset, green, reset),
			fmt.Sprintf(" Key Permissions   : %s%v%s", cyan, data["permissions"], reset),
			fmt.Sprintf(" IP Restrictions   : %sNONE (0.0.0.0/0 - Open to the Internet!)%s", red, reset),
			fmt.Sprintf(" Token Expiration  : %sNULL / NEVER (Infinite Lifetime - Policy Violation)%s", red, reset),
			fmt.Sprintf(" Target Subsystem  : %s%v%s", white, data["system"], reset),
			fmt.Sprintf(" Exploit Verdict   : %s[✔ EXPLOITED: MACHINE IDENTITY COMPROMISED]%s", green, reset),
		}
		utils.DrawBox("📡 MACHINE IDENTITY & RECONNAISSANCE PROFILE", cardLines, cyan, 80)

		// Forensic Correlation & Next Phase
		evidenceLines := []string{
			fmt.Sprintf(" Case Evidence : %sE01 (req-c28d87e49d), E04 (Software Register), E10 (Policy)%s", white, reset),
			fmt.Sprintf(" MITRE ATT&CK  : %sT1592 (Gather Victim Host Info) │ T1078 (Valid Accounts)%s", pink, reset),
			fmt.Sprintf(" Root Cause    : %sVendor approved without pen-test; risk R-031 accepted as LOW%s", yellow, reset),
		}
		utils.DrawBox("🔍 FORENSIC EVIDENCE & MITRE ATT&CK CORRELATION", evidenceLines, purple, 80)

		fmt.Printf("  %s▶ NEXT STEP:%s Run %s%shso harvest%s to exfiltrate support tickets & uncover leaked credentials.\n\n",
			yellow, reset, green, utils.ColorUnderline, reset)

		_ = gray

		if verbose {
			fmt.Println("  Raw Identity Response:")
			formatted, _ := json.MarshalIndent(data, "  ", "  ")
			fmt.Println(string(formatted))
		}
	},
}

func init() {
	rootCmd.AddCommand(reconCmd)
}
