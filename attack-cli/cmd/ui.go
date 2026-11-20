package cmd

import (
	"fmt"

	"github.com/spf13/cobra"
	"harborstrike-x/attack-cli/pkg/utils"
)

var uiCmd = &cobra.Command{
	Use:     "ui",
	Aliases: []string{"studio", "dashboard"},
	Short:   "Launch the Posting-inspired terminal interface and attack workbench",
	Long: `Launch the Posting-inspired terminal interface and attack workbench.
Displays an interactive multi-pane workspace modeling target endpoints,
headers, live payloads, JSON inspectors, response panels, and tree navigation.`,
	Run: func(cmd *cobra.Command, args []string) {
		renderPostingUI()
	},
}

func renderPostingUI() {
	pink := utils.ColorNeonPink + utils.ColorBold
	purple := utils.ColorNeonPurple + utils.ColorBold
	cyan := utils.ColorNeonCyan
	teal := utils.ColorNeonTeal
	green := utils.ColorNeonGreen + utils.ColorBold
	amber := utils.ColorNeonAmber
	coral := utils.ColorNeonCoral
	white := utils.ColorPureWhite + utils.ColorBold
	slate := utils.ColorSlate
	dim := utils.ColorMuted
	reset := utils.ColorReset

	// 1. Top Header Bar
	fmt.Println()
	fmt.Printf("  %sHarborStrike%s 2.6.0 %s%sdarrenburns@tempest │ security@harbor-finch [CR-26-047]%s\n",
		pink, white, reset,
		dim, reset)
	fmt.Println()

	// 2. URL & Execution Bar
	fmt.Printf("  %s %s %s %shttps://ledgerone.internal/v2/vendors/V-0412/bank-details%s  %s  %s%s Send %s\n",
		utils.BgMethodPatch, "PATCH ▼", reset,
		white, reset,
		utils.ProgressMeter(7, 8),
		utils.BgPillPink, utils.ColorBold, reset)
	fmt.Println()

	// 3. Multi-Pane Container (Pixel-Perfect Cyberpunk TUI Layout)
	bLeft := cyan + utils.ColorBold
	bRight := purple + utils.ColorBold
	bResp := green + utils.ColorBold

	fmt.Printf("  %s╭─── 📁 Collections (CR-26-047) ──────╮%s  %s╭─── ⚡ Request Workbench ─────────────────────────────────────────╮%s\n",
		bLeft, reset, bRight, reset)

	fmt.Printf("  %s│%s %s %s│%s  %s│%s %s %s│%s\n",
		bLeft, reset, utils.PadRight(fmt.Sprintf("%sGET%s  /v2/me", purple, reset), 34), bLeft, reset,
		bRight, reset, utils.PadRight(fmt.Sprintf("%sHeaders•%s  %sBody  Query  Auth  Info  Scripts  Options%s", white, reset, dim, reset), 66), bRight, reset)

	fmt.Printf("  %s│%s %s %s│%s  %s├──────────────────────────────────────────────────────────────────┤%s\n",
		bLeft, reset, utils.PadRight(fmt.Sprintf("%sGET%s  /v2/schema", purple, reset), 34), bLeft, reset,
		bRight, reset)

	fmt.Printf("  %s│%s %s %s│%s  %s│%s %s %s│%s\n",
		bLeft, reset, utils.PadRight(fmt.Sprintf("%s▼ LedgerOne/ Financials%s", cyan+utils.ColorBold, reset), 34), bLeft, reset,
		bRight, reset, utils.PadRight(fmt.Sprintf(" %s✔%s %sContent-Type%s   application/json", green, reset, purple, reset), 66), bRight, reset)

	fmt.Printf("  %s│%s %s %s│%s  %s│%s %s %s│%s\n",
		bLeft, reset, utils.PadRight(fmt.Sprintf("  %sPOS%s /v2/vendors/export", teal, reset), 34), bLeft, reset,
		bRight, reset, utils.PadRight(fmt.Sprintf(" %s✔%s %sX-API-Key%s      key-tb-07 (TallyBridge Sync Token)", green, reset, purple, reset), 66), bRight, reset)

	fmt.Printf("  %s│%s %s %s│%s  %s│%s %s %s│%s\n",
		bLeft, reset, utils.PadRight(fmt.Sprintf("  %s /v2/vendors/V-0412", utils.BgPillPink+" >PATCH "+reset), 34), bLeft, reset,
		bRight, reset, utils.PadRight(fmt.Sprintf(" %s✔%s %sX-Forwarded-For%s 10.20.4.77 (tb-build-02 Rogue Host)", green, reset, purple, reset), 66), bRight, reset)

	fmt.Printf("  %s│%s %s %s│%s  %s│%s %s %s│%s\n",
		bLeft, reset, utils.PadRight(fmt.Sprintf("  %sGET%s /v2/payments/scheduled", purple, reset), 34), bLeft, reset,
		bRight, reset, utils.PadRight(fmt.Sprintf(" %s✔%s %sAuthorization%s  Bearer eyJhbGciOiJIUzI1Ni...", green, reset, purple, reset), 66), bRight, reset)

	fmt.Printf("  %s│%s %s %s│%s  %s│%s %s %s│%s\n",
		bLeft, reset, utils.PadRight(fmt.Sprintf("%s▼ HelpDeskr/ Support%s", cyan+utils.ColorBold, reset), 34), bLeft, reset,
		bRight, reset, utils.PadRight("", 66), bRight, reset)

	fmt.Printf("  %s│%s %s %s│%s  %s│%s %s %s│%s\n",
		bLeft, reset, utils.PadRight(fmt.Sprintf("  %sPOS%s bulk-export (EXP-5412)", teal, reset), 34), bLeft, reset,
		bRight, reset, utils.PadRight(fmt.Sprintf(" %sPayload (JSON):%s", amber, reset), 66), bRight, reset)

	fmt.Printf("  %s│%s %s %s│%s  %s│%s %s %s│%s\n",
		bLeft, reset, utils.PadRight(fmt.Sprintf("  %sGET%s /tickets/TKT-48213 (Leak)", purple, reset), 34), bLeft, reset,
		bRight, reset, utils.PadRight(fmt.Sprintf(" %s1%s  {", dim, reset), 66), bRight, reset)

	fmt.Printf("  %s│%s %s %s│%s  %s│%s %s %s│%s\n",
		bLeft, reset, utils.PadRight(fmt.Sprintf("  %sDEL%s delete job EXP-5419", coral, reset), 34), bLeft, reset,
		bRight, reset, utils.PadRight(fmt.Sprintf(" %s2%s    %s\"vendor_id\"%s: %s\"V-0412\"%s,", dim, reset, cyan, reset, white, reset), 66), bRight, reset)

	fmt.Printf("  %s│%s %s %s│%s  %s│%s %s %s│%s\n",
		bLeft, reset, utils.PadRight(fmt.Sprintf("%s▼ BlueVault/ Storage%s", cyan+utils.ColorBold, reset), 34), bLeft, reset,
		bRight, reset, utils.PadRight(fmt.Sprintf(" %s3%s    %s\"bank_account\"%s: %s,", dim, reset, cyan, reset, utils.BgPillPink+" \"HDFC0001842-9083\" "+reset), 66), bRight, reset)

	fmt.Printf("  %s│%s %s %s│%s  %s│%s %s %s│%s\n",
		bLeft, reset, utils.PadRight(fmt.Sprintf("  %sGET%s /finance/bank-details", purple, reset), 34), bLeft, reset,
		bRight, reset, utils.PadRight(fmt.Sprintf(" %s4%s    %s\"approval_ref\"%s: %snull%s", dim, reset, cyan, reset, coral, reset), 66), bRight, reset)

	fmt.Printf("  %s│%s %s %s│%s  %s│%s %s %s│%s\n",
		bLeft, reset, utils.PadRight(fmt.Sprintf("%s▼ SSO/ Identity Kiosk%s", cyan+utils.ColorBold, reset), 34), bLeft, reset,
		bRight, reset, utils.PadRight(fmt.Sprintf(" %s5%s  }", dim, reset), 66), bRight, reset)

	fmt.Printf("  %s│%s %s %s│%s  %s╰──────────────────────────────────────────────────────────────────╯%s\n",
		bLeft, reset, utils.PadRight(fmt.Sprintf("  %sPOS%s /sso/login (r.menon)", teal, reset), 34), bLeft, reset,
		bRight, reset)

	fmt.Printf("  %s│%s %s %s│%s  %s╭─── 📡 Response ───────────────────────────────── %s ──╮%s\n",
		bLeft, reset, utils.PadRight("Target: Coastal Packaging Ltd", 34), bLeft, reset,
		bResp, utils.StatusBadge(200, "OK"), reset)

	fmt.Printf("  %s│%s %s %s│%s  %s│%s %s %s│%s\n",
		bLeft, reset, utils.PadRight("Pivoted via 10.20.4.77", 34), bLeft, reset,
		bResp, reset, utils.PadRight(fmt.Sprintf(" %sBody%s  Headers  Cookies  Trace                   %s4.21KB in 82.4ms%s", white, reset, dim, reset), 66), bResp, reset)

	fmt.Printf("  %s│%s %s %s│%s  %s│%s %s %s│%s\n",
		bLeft, reset, utils.PadRight("Payment Due: 08 Sept 2026", 34), bLeft, reset,
		bResp, reset, utils.PadRight(fmt.Sprintf(" %s1%s  {", dim, reset), 66), bResp, reset)

	fmt.Printf("  %s│%s %s %s│%s  %s│%s %s %s│%s\n",
		bLeft, reset, utils.PadRight(fmt.Sprintf("At Risk: %sINR 248,000%s", coral, reset), 34), bLeft, reset,
		bResp, reset, utils.PadRight(fmt.Sprintf(" %s2%s    %s\"status\"%s: %s\"SUCCESS\"%s,", dim, reset, cyan, reset, green, reset), 66), bResp, reset)

	fmt.Printf("  %s│%s %s %s│%s  %s│%s %s %s│%s\n",
		bLeft, reset, utils.PadRight(fmt.Sprintf("%sMULE LOCKED IN%s", pink, reset), 34), bLeft, reset,
		bResp, reset, utils.PadRight(fmt.Sprintf(" %s3%s    %s\"change_id\"%s: %s\"chg-8b9888c39b\"%s,", dim, reset, cyan, reset, white, reset), 66), bResp, reset)

	fmt.Printf("  %s│%s %s %s│%s  %s│%s %s %s│%s\n",
		bLeft, reset, utils.PadRight("Case File: CR-26-047", 34), bLeft, reset,
		bResp, reset, utils.PadRight(fmt.Sprintf(" %s4%s    %s\"request_id\"%s: %s\"req-5f61b0de8\"%s,", dim, reset, cyan, reset, white, reset), 66), bResp, reset)

	fmt.Printf("  %s│%s %s %s│%s  %s│%s %s %s│%s\n",
		bLeft, reset, utils.PadRight("Track: OFFENSE", 34), bLeft, reset,
		bResp, reset, utils.PadRight(fmt.Sprintf(" %s5%s    %s\"exploit_verdict\"%s: %s\"MULE ACCOUNT LOCKED IN\"%s,", dim, reset, cyan, reset, coral, reset), 66), bResp, reset)

	fmt.Printf("  %s│%s %s %s│%s  %s│%s %s %s│%s\n",
		bLeft, reset, utils.PadRight("Chennai Hub SIMATS", 34), bLeft, reset,
		bResp, reset, utils.PadRight(fmt.Sprintf(" %s6%s    %s\"funds_diverted\"%s: %s\"INR 248,000 on Sept 8\"%s", dim, reset, cyan, reset, amber, reset), 66), bResp, reset)

	fmt.Printf("  %s│%s %s %s│%s  %s│%s %s %s│%s\n",
		bLeft, reset, utils.PadRight("", 34), bLeft, reset,
		bResp, reset, utils.PadRight(fmt.Sprintf(" %s7%s  }", dim, reset), 66), bResp, reset)

	fmt.Printf("  %s╰──────────────────────────────────────╯%s  %s╰──────────────────────────────────────────────────────────────────╯%s\n",
		bLeft, reset, bResp, reset)

	// 4. Status Badges & Pill Footer (Matching Image Bottom Line)
	fmt.Println()
	fmt.Printf("  %s Visual %s  %s read-only %s  %s JSON ▼ %s  %s Wrap X %s  %s23.74KB in 100.49ms%s\n",
		utils.BgPillPink, reset,
		utils.BgPillAmber, reset,
		utils.BgPillPurple, reset,
		utils.BgPillDark, reset,
		dim, reset)

	// 5. Hotkey Footer Bar (Matching Image Bottom Line)
	fmt.Printf("  %s^c%s Quit   %s^j%s Send   %s^t%s Method   %s^s%s Save   %s^n%s New   %s^p%s Search requests   %s^o%s Jump   %sf1%s Help\n\n",
		pink, slate,
		pink, slate,
		pink, slate,
		pink, slate,
		pink, slate,
		pink, slate,
		pink, slate,
		pink, slate)
}

func init() {
	rootCmd.AddCommand(uiCmd)
}
