package cmd

import (
	"fmt"
	"strings"

	"github.com/spf13/cobra"
	"harborstrike-x/attack-cli/pkg/utils"
)

var statusCmd = &cobra.Command{
	Use:   "status",
	Short: "Show HARBORSTRIKE CLI operational status and target connectivity",
	Run: func(cmd *cobra.Command, args []string) {
		utils.PrintBanner()

		cyan := utils.ColorElectricCyan + utils.ColorBold
		pink := utils.ColorNeonPink + utils.ColorBold
		purple := utils.ColorElectricPurple + utils.ColorBold
		green := utils.ColorEmeraldMint + utils.ColorBold
		yellow := utils.ColorAmberGold + utils.ColorBold
		white := utils.ColorPureWhite + utils.ColorBold
		gray := utils.ColorSlate
		dim := utils.ColorCharcoal
		reset := utils.ColorReset

		// Probe target connectivity
		cli := GetClient()
		labInfo, err := cli.CheckLabStatus()

		connStatus := utils.BgGreen + " ONLINE / CONNECTED " + reset
		if err != nil {
			connStatus = utils.BgRed + " OFFLINE (SIMULATOR READY) " + reset
		}

		// 1. Dual-Column SOC HUD Container (Pixel-Perfect Column Alignment)
		colW := 42
		topL := "╭─── 📡 TARGET INFRASTRUCTURE HUD "
		topR := "╭─── ⚡ OFFENSIVE READINESS MATRIX "
		fmt.Printf("  %s%s%s╮%s   %s%s%s╮%s\n",
			cyan, topL, strings.Repeat("─", colW-utils.VisibleLen(topL)-1), reset,
			purple, topR, strings.Repeat("─", colW-utils.VisibleLen(topR)-1), reset)

		rows := [][2]string{
			{
				fmt.Sprintf("  Endpoint : %s%s%s", white, targetBaseURL, reset),
				fmt.Sprintf("  Status    : %s", connStatus),
			},
			{
				fmt.Sprintf("  Exec Mode: %s%s (Zero Trace)%s", cyan, strings.ToUpper(executionMode), reset),
				fmt.Sprintf("  Track     : %sOFFENSE (Adversary Emulation)%s", pink, reset),
			},
			{
				fmt.Sprintf("  Finance  : %s%s (LedgerOne)%s", yellow, apiKey, reset),
				fmt.Sprintf("  Phase 1-4 : %sRecon, Exfil & Keys Loaded%s", green, reset),
			},
			{
				fmt.Sprintf("  Storage  : %s%s (BlueVault)%s", yellow, storageKey, reset),
				fmt.Sprintf("  Phase 5-7 : %sPivot & Bank Tamper Armed%s", yellow, reset),
			},
			{
				fmt.Sprintf("  Support  : %s%s (HelpDeskr)%s", yellow, ticketToken, reset),
				fmt.Sprintf("  Target Org: %sHarbor & Finch Freight%s", white, reset),
			},
			{
				fmt.Sprintf("  Ingress  : %s%s (Rogue Tunnel)%s", cyan, sourceIP, reset),
				fmt.Sprintf("  Threat    : %sSilent Vendor Payout Theft%s", utils.ColorCrimson+utils.ColorBold, reset),
			},
		}

		for _, r := range rows {
			fmt.Printf("  %s│%s %s %s│%s   %s│%s %s %s│%s\n",
				cyan, reset, utils.PadRight(r[0], colW-2), cyan, reset,
				purple, reset, utils.PadRight(r[1], colW-2), purple, reset)
		}

		fmt.Printf("  %s╰%s╯%s   %s╰%s╯%s\n\n",
			cyan, strings.Repeat("─", colW-2), reset,
			purple, strings.Repeat("─", colW-2), reset)

		if labInfo != nil && err == nil {
			fmt.Printf("  %s[✔ LAB STATUS]%s Connected to enterprise target simulator:\n", green, reset)
			for k, v := range labInfo {
				fmt.Printf("      %s▸%s %s%-22s%s : %s%v%s\n", cyan, reset, gray, k, reset, white, v, reset)
			}
			fmt.Println()
		}

		// 2. Attack Modules Matrix
		utils.PrintHeader("Offensive Attack Modules Matrix")

		modules := [][]string{
			{"hso recon", "Phase 1", "LedgerOne", "API Exposure & Machine Key Scoping"},
			{"hso harvest", "Phase 2", "HelpDeskr", "Bulk Ticket Exfiltration & Leaked Key Discovery"},
			{"hso storage", "Phase 3", "BlueVault", "Cloud Storage Exfil (Bank Master Spreadsheets)"},
			{"hso vendor-exfil", "Phase 4", "LedgerOne", "Financial Vendor Master Catalog Dump (9,840 rows)"},
			{"hso pivot", "Phase 5", "Private Link", "Rogue Build Server Pivot (10.20.4.77 @ tb-build-02)"},
			{"hso tamper", "Phase 6", "LedgerOne", "Silent Vendor Bank Tampering (V-0412 Climax)"},
			{"hso verify-run", "Phase 7", "LedgerOne", "Disbursement Queue Lock-in Verification (Sept 8)"},
			{"hso auth-test", "Phase 8", "SSO / Kiosk", "Orphaned Account (r.menon) & MFA Bypass"},
			{"hso campaign run", "Engine", "End-to-End", "Execute Full 8-Phase Automated Attack Campaign"},
			{"hso campaign plan", "Blueprint", "Architecture", "Display Intrusion Kill-Chain Graph"},
			{"hso evidence list", "Forensics", "E01 - E20", "Case Evidence Browser & Timestamp Normalizer"},
			{"hso report", "Report", "Compliance", "Generate Full MITRE ATT&CK Technical Report"},
			{"hso server start", "Lab Target", "In-Memory", "Spawn Built-in Synthetic Enterprise Server"},
		}

		fmt.Println()
		fmt.Printf("  %s%-18s %-12s %-16s %s%s\n", cyan, "COMMAND", "PHASE", "SYSTEM", "FUNCTION", reset)
		fmt.Println("  " + dim + strings.Repeat("─", 74) + reset)
		for _, m := range modules {
			fmt.Printf("  %s%-18s%s %s%-12s%s %s%-16s%s %s%s%s\n",
				white, m[0], reset,
				yellow, m[1], reset,
				cyan, m[2], reset,
				gray, m[3], reset)
		}
		fmt.Println()
		utils.PrintGradientBar()
		fmt.Printf("  %sQuickstart:%s Run %shso campaign run --all%s to execute the full kill-chain.\n\n",
			gray, reset, green, reset)
	},
}

func init() {
	rootCmd.AddCommand(statusCmd)
}
