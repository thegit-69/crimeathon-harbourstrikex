package cmd

import (
	"fmt"
	"os"

	"harborstrike-x/attack-cli/pkg/client"
	"harborstrike-x/attack-cli/pkg/utils"

	"github.com/spf13/cobra"
)

var (
	targetBaseURL string
	apiKey        string
	storageKey    string
	ticketToken   string
	sourceIP      string
	executionMode string
	verbose       bool
)

// rootCmd represents the base command when called without any subcommands
var rootCmd = &cobra.Command{
	Use:   "hso",
	Short: "HARBORSTRIKE X Offensive Security Validation CLI",
	Long: `
  HARBORSTRIKE X | OFFENSIVE VALIDATION CLI (hso)
  Built for CRIMEATHON '26 [Case File CR-26-047: Harbor & Finch Freight Pvt. Ltd.]

  'hso' replicates and validates the multi-stage supply chain intrusion kill-chain:
  LedgerOne API abuse, HelpDeskr ticket harvesting, BlueVault document exfiltration,
  and silent vendor bank tampering targeting the September 8 disbursement run.`,
	PersistentPreRun: func(cmd *cobra.Command, args []string) {
		if verbose {
			utils.PrintInfo("Verbose logging enabled")
			utils.PrintInfo("Target URL: %s | Mode: %s | Source IP: %s", targetBaseURL, executionMode, sourceIP)
		}
	},
	Run: func(cmd *cobra.Command, args []string) {
		renderRootDashboard()
	},
}

func renderRootDashboard() {
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

	fmt.Println("  " + yellow + "⚡ OFFENSIVE INTRUSION COMMAND CENTER" + reset)
	fmt.Printf("  %sTarget Org%s : Harbor & Finch Freight Pvt. Ltd. (Chennai Hub)   %sTrack%s : %sOFFENSE [CR-26-047]%s\n",
		gray, reset, gray, reset, pink, reset)
	fmt.Printf("  %sEndpoint  %s : %s   %sMode %s : %s%s%s\n",
		gray, reset, white+targetBaseURL+reset, gray, reset, green, executionMode, reset)
	fmt.Println()

	// Section 1: Offensive Kill-Chain Modules
	utils.PrintHeader("Offensive Attack Modules (Phases 1 - 8)")
	fmt.Println()
	phases := [][]string{
		{"hso recon", "Phase 1", "LedgerOne", "Probe /v2/me & unconstrained key-tb-07"},
		{"hso harvest", "Phase 2", "HelpDeskr", "Exfiltrate support tickets & leak scan (EXP-5412)"},
		{"hso storage", "Phase 3", "BlueVault", "Exfiltrate bank master sheets via key bvk-7f3a"},
		{"hso vendor-exfil", "Phase 4", "LedgerOne", "Dump 9,840 vendor master financial records"},
		{"hso pivot", "Phase 5", "Private Link", "Simulate rogue build host pivot (10.20.4.77)"},
		{"hso tamper", "Phase 6", "LedgerOne", "Silent bank account alteration (V-0412 Climax)"},
		{"hso verify-run", "Phase 7", "LedgerOne", "Disbursement queue lock-in gate verification"},
		{"hso auth-test", "Phase 8", "SSO / Kiosk", "Orphaned employee login & MFA bypass (r.menon)"},
	}
	for _, p := range phases {
		fmt.Printf("  %s%-18s%s  %s%-9s%s  %s%-14s%s  %s%s%s\n",
			white, p[0], reset,
			yellow, p[1], reset,
			cyan, p[2], reset,
			gray, p[3], reset)
	}

	// Section 2: Campaign, Workbench & Intelligence
	fmt.Println()
	utils.PrintHeader("Red-Team Evasion & Dynamic Weaponization (The Magic Touch)")
	fmt.Println()
	evasions := [][]string{
		{"hso bypass", "Defense Evasion", "Maker-Checker bypass, Chronos smuggling & SOC decoy"},
		{"hso weaponize", "Dynamic Exploit", "Arbitrary-target payload generator & PoC exporter (unseen data)"},
		{"hso proof-pack", "Tier 3 Compiler", "Automated MITRE matrix, evidence join & SHA-256 proof pack"},
	}
	for _, e := range evasions {
		fmt.Printf("  %s%-23s%s  %s%-16s%s  %s%s%s\n",
			pink, e[0], reset,
			yellow, e[1], reset,
			white, e[2], reset)
	}

	// Section 3: Campaign, Workbench & Intelligence
	fmt.Println()
	utils.PrintHeader("Campaign Engine, Forensics & Workbench")
	fmt.Println()
	tools := [][]string{
		{"hso campaign run", "Engine", "Run automated 8-phase attack with scorecard"},
		{"hso campaign plan", "Blueprint", "Display intrusion kill-chain ASCII graph"},
		{"hso ui", "Workbench", "Launch multi-pane Posting-inspired terminal interface"},
		{"hso evidence list", "Forensics", "Browse 20 case evidence artifacts (E01-E20)"},
		{"hso evidence inspect", "Forensics", "Deep-dive into specific evidence findings (e.g. E18)"},
		{"hso evidence timeline", "Forensics", "Cross-system timeline with UTC/IST normalization"},
		{"hso report", "Compliance", "Generate full MITRE ATT&CK validation report"},
		{"hso server start", "Lab Target", "Spawn synthetic enterprise HTTP server on :8080"},
	}
	for _, t := range tools {
		fmt.Printf("  %s%-23s%s  %s%-12s%s  %s%s%s\n",
			white, t[0], reset,
			purple, t[1], reset,
			gray, t[2], reset)
	}

	fmt.Println()
	utils.PrintGradientBar()
	fmt.Printf("  %sPro-Tip:%s Run %s%shso ui%s to launch the terminal workbench, or %s%shso campaign run --all%s for instant validation.\n\n",
		pink, reset,
		green, utils.ColorUnderline, reset,
		cyan, utils.ColorUnderline, reset)
	_ = dim
}

// Execute adds all child commands to the root command and sets flags appropriately.
func Execute() {
	if err := rootCmd.Execute(); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}

func init() {
	// Global persistent flags
	rootCmd.PersistentFlags().StringVarP(&targetBaseURL, "target-url", "u", "http://localhost:8080", "Target base URL of synthetic enterprise backend")
	rootCmd.PersistentFlags().StringVarP(&apiKey, "api-key", "k", "key-tb-07", "Machine API key for LedgerOne finance system")
	rootCmd.PersistentFlags().StringVar(&storageKey, "storage-key", "bvk-7f3a", "Discovered BlueVault object storage key")
	rootCmd.PersistentFlags().StringVar(&ticketToken, "ticket-token", "tb-sync-svc", "Support SaaS sync token for HelpDeskr")
	rootCmd.PersistentFlags().StringVarP(&sourceIP, "source-ip", "s", "198.18.7.41", "Simulated source IP address (e.g., 198.18.7.41 or 10.20.4.77)")
	rootCmd.PersistentFlags().StringVarP(&executionMode, "mode", "m", "simulate", "Execution mode: 'live' (HTTP requests) or 'simulate' (offline engine)")
	rootCmd.PersistentFlags().BoolVarP(&verbose, "verbose", "v", false, "Enable verbose output and telemetry")

	// Custom Help Template for aesthetic, modern CLI presentation
	helpTemplate := `
{{if or .Runnable .HasSubCommands}}{{.UsageString}}{{end}}`
	rootCmd.SetHelpTemplate(helpTemplate)
}

// GetClient initializes and returns the attack client based on flags
func GetClient() *client.AttackClient {
	cfg := client.TargetConfig{
		BaseURL:     targetBaseURL,
		APIKey:      apiKey,
		StorageKey:  storageKey,
		TicketToken: ticketToken,
		SourceIP:    sourceIP,
		Mode:        executionMode,
	}
	return client.NewAttackClient(cfg)
}
