package cmd

import (
	"encoding/json"
	"fmt"

	"github.com/spf13/cobra"
	"harborstrike-x/attack-cli/pkg/utils"
)

var (
	testUser   string
	testDevice string
)

var authTestCmd = &cobra.Command{
	Use:     "auth-test",
	Aliases: []string{"auth", "sso", "kiosk"},
	Short:   "Phase 8: Orphaned Account & Decoy Authentication Validation",
	Long: `Phase 8: Orphaned Account & Decoy Authentication Validation
Simulates the offboarding control breakdown (Case Note 92 / E03 / E14).
Validates that terminated employee Rohan Menon's account remained active and accessible
on warehouse kiosk dev-81546 without MFA enforcement.`,
	Run: func(cmd *cobra.Command, args []string) {
		utils.PrintBreadcrumb("HARBORSTRIKE-X", "PHASE 8", "ORPHANED ACCOUNT & DECOY AUTHENTICATION")
		utils.PrintHeader("Phase 8: Identity & Decoy Authentication Validation")
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

		utils.PrintInfo("Target SSO      : Identity & Single Sign-On Gateway (/auth/login)")
		utils.PrintInfo("Target User     : %s", testUser)
		utils.PrintInfo("Terminal Device : %s", testDevice)
		fmt.Println()

		data, err := cli.TestAuthAnomalies(testUser, testDevice)
		if err != nil {
			utils.PrintError("Auth test failed: %v", err)
			return
		}

		if testUser == "a.kapoor" {
			utils.PrintWarning("AUTH TEST: Admin credential spray probe detected! 3 failed logins against IT Security Administrator.")

			cardLines := []string{
				fmt.Sprintf(" Target Account     : %s%v%s  %s[ACTING IT SECURITY ADMIN]%s", white, data["user"], reset, yellow, reset),
				fmt.Sprintf(" Probe Result       : %s%v%s", red, data["status"], reset),
				fmt.Sprintf(" Failed Attempts    : %s%v consecutive attempts%s", yellow, data["attempts"], reset),
				fmt.Sprintf(" Warning Logged     : %s%v%s", pink, data["warning"], reset),
				fmt.Sprintf(" IT Admin Reaction  : %sAditi Kapoor assumed it was background noise/bot (Note 97)%s", gray, reset),
				fmt.Sprintf(" Exploit Verdict    : %s[✔ VALIDATED: ADMIN CREDENTIAL PROBE FROM EVIDENCE E13]%s", green, reset),
			}
			utils.DrawBox("🛡️ IT ADMIN CREDENTIAL PROBE & LOCKOUT PROFILE", cardLines, yellow, 80)

			evidenceLines := []string{
				fmt.Sprintf(" Case Evidence : %sE13 (Support Team Chat: Aditi mentions 3 failed logins on 16 Aug)%s", white, reset),
				fmt.Sprintf(" MITRE ATT&CK  : %sT1110.003 (Brute Force: Password Spraying)%s", pink, reset),
				fmt.Sprintf(" Strategic Goal: %sAttacker tested admin credentials before pivoting across private tunnel%s", yellow, reset),
			}
			utils.DrawBox("🔍 FORENSIC EVIDENCE & MITRE ATT&CK CORRELATION", evidenceLines, purple, 80)
		} else {
			utils.PrintSuccess("AUTH COMPLETED: Terminated user granted active session with zero MFA enforcement!")

			// Pro Cyber HUD Card
			cardLines := []string{
				fmt.Sprintf(" Authenticated User : %s%v%s  %s[TERMINATED 30 JUNE 2026]%s", white, data["user"], reset, red, reset),
				fmt.Sprintf(" Session Token      : %s%v%s", cyan, data["session_id"], reset),
				fmt.Sprintf(" Terminal Device    : %s%v%s (Warehouse Logistics Kiosk)", yellow, data["device"], reset),
				fmt.Sprintf(" MFA Enforcement    : %sDISABLED / BYPASSED on Kiosk Domain%s", red, reset),
				fmt.Sprintf(" Strategic Context  : %sDecoy distraction to misdirect SOC while silent tampering ran%s", pink, reset),
				fmt.Sprintf(" Exploit Verdict    : %s[✔ EXPLOITED: OFFBOARDING GOVERNANCE FAILURE CONFIRMED]%s", green, reset),
			}
			utils.DrawBox("👤 ORPHANED ACCOUNT & DECOY AUTHENTICATION PROFILE", cardLines, cyan, 80)

			// Forensic Correlation & Next Phase
			evidenceLines := []string{
				fmt.Sprintf(" Case Evidence : %sE03 (sso-bb8ab61e08 on 13 Aug), E14 (Staff Roster with 8 active terminated staff)%s", white, reset),
				fmt.Sprintf(" MITRE ATT&CK  : %sT1078.002 (Valid Accounts: Domain Accounts)%s", pink, reset),
				fmt.Sprintf(" Decoy Analysis: %sColin Lawson login was legitimate; r.menon kiosk sign-in created Case Note 92%s", yellow, reset),
			}
			utils.DrawBox("🔍 FORENSIC EVIDENCE & MITRE ATT&CK CORRELATION", evidenceLines, purple, 80)
		}

		fmt.Printf("  %s▶ ALL PHASES COMPLETED!%s Run %s%shso report%s to generate the full MITRE ATT&CK findings report.\n\n",
			green, reset, green, utils.ColorUnderline, reset)

		_ = gray
		if verbose {
			fmt.Println("  Raw SSO Telemetry:")
			formatted, _ := json.MarshalIndent(data, "  ", "  ")
			fmt.Println(string(formatted))
		}
	},
}

func init() {
	authTestCmd.Flags().StringVarP(&testUser, "user", "U", "r.menon", "Username to authenticate")
	authTestCmd.Flags().StringVarP(&testDevice, "device", "D", "dev-81546", "Device identifier")
	rootCmd.AddCommand(authTestCmd)
}
