package cmd

import (
	"fmt"
	"strconv"
	"strings"

	"github.com/spf13/cobra"
	"harborstrike-x/attack-cli/pkg/engine"
	"harborstrike-x/attack-cli/pkg/utils"
)

var (
	campaignPhases string
	runAllPhases   bool
)

func resolveCampaignPhases(allFlagChanged bool, allFlag bool, selection string) []int {
	if (allFlagChanged && allFlag) || selection == "all" {
		return []int{1, 2, 3, 4, 5, 6, 7, 8}
	}
	if selection == "" {
		return []int{1, 2, 3, 4, 5, 6, 7, 8}
	}

	phases := make([]int, 0)
	for _, value := range strings.Split(selection, ",") {
		value = strings.TrimSpace(value)
		if phase, err := strconv.Atoi(value); err == nil && phase >= 1 && phase <= 8 {
			phases = append(phases, phase)
		}
	}
	return phases
}

var campaignCmd = &cobra.Command{
	Use:   "campaign",
	Short: "Orchestrate multi-phase offensive security validation campaigns",
	Long: `Orchestrate multi-phase offensive security validation campaigns against target infrastructure.
Execute the full 8-phase kill-chain or targeted sub-phases to test detection and prevention controls.`,
}

var campaignRunCmd = &cobra.Command{
	Use:   "run",
	Short: "Run automated multi-phase offensive attack campaign",
	Run: func(cmd *cobra.Command, args []string) {
		cli := GetClient()
		eng := engine.NewCampaignEngine(cli)

		phasesToRun := resolveCampaignPhases(
			cmd.Flags().Changed("all"),
			runAllPhases,
			campaignPhases,
		)

		summary, err := eng.RunCampaign(phasesToRun)
		if err != nil {
			utils.PrintError("Campaign execution failed: %v", err)
			return
		}

		cyan := utils.ColorElectricCyan + utils.ColorBold
		purple := utils.ColorElectricPurple + utils.ColorBold
		pink := utils.ColorNeonPink + utils.ColorBold
		green := utils.ColorEmeraldMint + utils.ColorBold
		red := utils.ColorCrimson + utils.ColorBold
		yellow := utils.ColorAmberGold + utils.ColorBold
		white := utils.ColorPureWhite + utils.ColorBold
		gray := utils.ColorSlate
		dim := utils.ColorCharcoal
		reset := utils.ColorReset

		// Progress Bar Display
		fmt.Println()
		fmt.Printf("  %sAttack Kill-Chain Progress:%s %s\n\n", cyan, reset, utils.ProgressMeter(summary.Successful, summary.TotalPhases))

		// Linux / Cyberpunk Pro Scorecard Table
		scoreWidth := 87
		topScore := "╭─── ⚡ CAMPAIGN SCORECARD & MITRE ATT&CK VALIDATION MATRIX "
		fmt.Printf("  %s%s%s╮%s\n", purple, topScore, strings.Repeat("─", scoreWidth-utils.VisibleLen(topScore)-1), reset)
		headerRow := fmt.Sprintf("  %-7s  %-40s  %-16s  %-14s", "PHASE", "ATTACK VECTOR", "RESULT", "MITRE ATT&CK")
		fmt.Printf("  %s│%s %s %s│%s\n", purple, reset, utils.PadRight(headerRow, scoreWidth-2), purple, reset)
		divScore := "├───" + strings.Repeat("─", scoreWidth-6) + "───┤"
		fmt.Printf("  %s%s%s\n", purple, divScore, reset)

		for _, step := range summary.Steps {
			badge := utils.BgGreen + " [✔ EXPLOITED] " + reset
			if step.Status != "EXPLOITED" && step.Status != "SUCCESS" {
				badge = utils.BgRed + " [✖ BLOCKED]   " + reset
			}
			rowStr := fmt.Sprintf("  [%d/8]    %s  %s  %s%-14s%s",
				step.Phase,
				utils.PadRight(white+step.Name+reset, 40),
				badge,
				cyan, step.MITRETechnique, reset)
			fmt.Printf("  %s│%s %s %s│%s\n", purple, reset, utils.PadRight(rowStr, scoreWidth-2), purple, reset)
		}

		fmt.Printf("  %s%s%s\n", purple, divScore, reset)
		statStr := fmt.Sprintf("  Phases Tested: %s%d%s  │  Exploited: %s%d%s  │  Blocked: %d  │  Duration: %s%v%s",
			cyan, summary.TotalPhases, reset,
			green, summary.Successful, reset,
			summary.Blocked,
			yellow, summary.EndTimeUTC.Sub(summary.StartTimeUTC), reset)
		fmt.Printf("  %s│%s %s %s│%s\n", purple, reset, utils.PadRight(statStr, scoreWidth-2), purple, reset)
		fmt.Printf("  %s╰%s╯%s\n\n", purple, strings.Repeat("─", scoreWidth-2), reset)

		// Critical Impact Alert Card
		threatLines := []string{
			fmt.Sprintf(" Target Organization : %sHarbor & Finch Freight Pvt. Ltd. (Case CR-26-047)%s", white, reset),
			fmt.Sprintf(" Root Vulnerability  : %sUnrestricted, infinite-lifetime machine keys (key-tb-07)%s", yellow, reset),
			fmt.Sprintf(" Direct Compromise   : %sSilent bank modification of Coastal Packaging Ltd (V-0412)%s", pink, reset),
			fmt.Sprintf(" Imminent Fraud Loss : %sINR 248,000.00%s %s(Invoice INV-9081 queued for September 8, 2026)%s", red+white, reset, gray, reset),
			fmt.Sprintf(" Audit Defect        : %sAll 7 internal audit findings (IA-2025-09) left 100%% OPEN!%s", gray, reset),
		}
		utils.DrawBox("🚨 FORENSIC THREAT ASSESSMENT", threatLines, red, scoreWidth)

		utils.PrintGradientBar()
		_ = dim
	},
}

var campaignPlanCmd = &cobra.Command{
	Use:   "plan",
	Short: "Display the offensive validation execution plan and MITRE ATT&CK mapping",
	Run: func(cmd *cobra.Command, args []string) {
		utils.PrintBanner()
		utils.DrawAttackGraph()

		cyan := utils.ColorElectricCyan + utils.ColorBold
		pink := utils.ColorNeonPink + utils.ColorBold
		green := utils.ColorEmeraldMint + utils.ColorBold
		yellow := utils.ColorAmberGold + utils.ColorBold
		white := utils.ColorPureWhite + utils.ColorBold
		gray := utils.ColorSlate
		reset := utils.ColorReset

		fmt.Println("  " + yellow + "=== MITRE ATT&CK MATRIX & TACTICS BREAKDOWN ===" + reset)
		fmt.Println()

		tactics := [][]string{
			{"Phase 1", "API Reconnaissance", "T1592 / T1078", "LedgerOne", "Probe /v2/me & /v2/schema via unconstrained key-tb-07"},
			{"Phase 2", "Support Ticket Exfil", "T1567 / T1552", "HelpDeskr", "10 bulk exports (EXP-5412); harvest key bvk-7f3a in TKT-48213"},
			{"Phase 3", "Cloud Storage Exfil", "T1530 / T1567", "BlueVault", "Weaponize bvk-7f3a to exfiltrate vendor-bank-details-2026.xlsx"},
			{"Phase 4", "Vendor Master Dump", "T1119 / T1567", "LedgerOne", "Dump 9,840 vendor master records via /v2/vendors/export"},
			{"Phase 5", "Tunnel Host Pivot", "T1199 / T1046", "Private Link", "Rogue host 10.20.4.77 (tb-build-02) queries 22.2MB payment data"},
			{"Phase 6", "Bank Tamper (Climax)", "T1565.001", "LedgerOne", "PATCH /v2/vendors/V-0412 bank account to ****9083 (Approval: BLANK)"},
			{"Phase 7", "Disbursement Verify", "T1020", "LedgerOne", "Verify fraudulent account locked in for September 8 payout run"},
			{"Phase 8", "Orphaned Account", "T1078.002", "SSO / Kiosk", "Terminated clerk Rohan Menon signs in on kiosk dev-81546 without MFA"},
		}

		fmt.Printf("  %s%-9s %-24s %-16s %-14s %s%s\n", cyan, "PHASE", "ATTACK MODULE", "MITRE ID", "SYSTEM", "TACTIC GOAL", reset)
		fmt.Println("  " + gray + strings.Repeat("─", 78) + reset)
		for _, t := range tactics {
			fmt.Printf("  %s%-9s%s %s%-24s%s %s%-16s%s %s%-14s%s %s%s%s\n",
				yellow, t[0], reset,
				white, t[1], reset,
				pink, t[2], reset,
				green, t[3], reset,
				gray, t[4], reset)
		}
		fmt.Println()
		utils.PrintGradientBar()
	},
}

func init() {
	campaignRunCmd.Flags().StringVarP(&campaignPhases, "phases", "p", "", "Comma-separated phases to run (e.g. '1,2,6' or 'all')")
	campaignRunCmd.Flags().BoolVarP(&runAllPhases, "all", "a", false, "Execute all 8 kill-chain phases")
	campaignCmd.AddCommand(campaignRunCmd)
	campaignCmd.AddCommand(campaignPlanCmd)
	rootCmd.AddCommand(campaignCmd)
}
