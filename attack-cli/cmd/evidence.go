package cmd

import (
	"fmt"
	"strings"
	"time"

	"github.com/spf13/cobra"
	"harborstrike-x/attack-cli/pkg/utils"
)

type EvidenceItem struct {
	ID          string
	Description string
	Format      string
	Source      string
	Phase       string
	KeyFinding  string
}

var evidenceCatalog = []EvidenceItem{
	{"E01", "LedgerOne API Access Log (Jun-Aug)", "CSV", "Finance", "Recon & Exfil", "Recon on 09 Aug (req-c28d87e49d); vendor exfil on 12 Aug (req-c35c2ccaff); rogue IP bank queries 17-19 Aug"},
	{"E02", "HelpDeskr Support Audit Log", "CSV", "Support", "Ticket Exfil", "10 bulk exports (EXP-5410-5419) by tb-sync-svc; timeout on delete preserves proof (evt-3fe76f60c4)"},
	{"E03", "SSO Sign-in Log", "CSV", "IT / SSO", "Decoy / Orphan", "Terminated clerk Rohan Menon logged in on kiosk 13 Aug (sso-bb8ab61e08); Colin Lawson legitimate"},
	{"E04", "Connected Software Register", "JSON", "IT Security", "Root Flaw", "key-tb-07, tb-sync-svc, bvk-7f3a have NO IP restrictions, infinite lifetime, excessive write scopes"},
	{"E05", "BlueVault Cloud Access Log", "CSV", "Storage", "Bank File Theft", "Storage key bvk-7f3a abused from 198.18.7.x on 14-16 Aug to exfiltrate vendor-bank-details-2026.xlsx"},
	{"E06", "HelpDeskr Billing Alert & Invoice", "PDF", "Finance", "Corroboration", "14 exports billed (4 normal + 10 attacker) on Invoice INV-HD-2026-0831 (INR 22,500 overage); dismissed as accrual"},
	{"E07", "Onboarding Due Diligence Review", "PDF", "IT Admin", "Governance", "Vendor approved despite SOC 2 excluding credential vault; pen test unrequested; annual review skipped"},
	{"E08", "Contract Excerpt (MSA TB-HF-2024-017)", "PDF", "Legal", "Liability Trap", "Clause 14.3 legally indemnifies TallyBridge because customer failed to restrict API keys under Clause 5.3"},
	{"E09", "Risk Register Extract", "XLSX", "Finance / IT", "Accepted Risk", "Risk R-031 accepted as LOW by Finance Manager; Risk R-029 (bvk-7f3a rotation) marked 'Not done'"},
	{"E10", "IT Security Policy v2.1 (TPS-POL-02)", "PDF", "IT Security", "Governance", "90-day rotation, IP limits, export alerts mandatory; grace period expired Jan 2026 (ignored)"},
	{"E11", "Internal Audit Report IA-2025-09", "PDF", "Audit", "Ignored Warning", "Documented all 7 vulnerabilities 1 year prior; management left 100% of technical findings OPEN"},
	{"E12", "Partner Breach Notice (21 Aug)", "PDF", "TallyBridge", "Misrouted Alert", "Vague breach notice sent to billing contact (accounts@), completely bypassing IT Security"},
	{"E13", "Support Team Chat Export", "JSON", "Support", "Credential Leak", "Key bvk-7f3a leaked into ticket TKT-48213; export deletion errors and admin login attacks dismissed"},
	{"E14", "HR Staff Roster", "CSV", "HR", "Offboarding Flaw", "All 8 terminated staff still marked 'status: active'; inactive employee count across firm is 0"},
	{"E15", "Private-Link Network Flow Log", "CSV", "Network", "Rogue Build Host", "Rogue build server tb-build-02 (10.20.4.77) pulled 22.2 MB from LedgerOne production"},
	{"E16", "Follow-up Partner Notice (28 Aug)", "PDF", "TallyBridge", "Cover-up", "TallyBridge falsely claims no finance data accessed and private link uninvolved (disproven by E01 & E15)"},
	{"E17", "Indicator of Compromise (IOC) List", "CSV", "TallyBridge", "Defective IOCs", "Conceals 10.20.4.77 and BlueVault attack IPs (198.18.7.23/.24/.77)"},
	{"E18", "LedgerOne API Log (1-7 Sep)", "CSV", "Finance", "Execution", "req-5f61b0de8 on 03 Sep patches bank account for V-0412; verified locked in on 06 Sep (req-bb819dfe0c)"},
	{"E19", "Vendor Master Record Change Log", "CSV", "Finance", "Fraud Climax", "367 changes: chg-8b9888c39b alters Coastal Packaging bank account to ****9083 with BLANK approval ref!"},
	{"E20", "Public OSINT & Registry Records", "HTML", "External OSINT", "Adversary Infrastructure", "Links external IPs 198.18.7.x to compromised staging infrastructure"},
}

var evidenceCmd = &cobra.Command{
	Use:   "evidence",
	Short: "Forensic evidence inspection and cross-system correlation toolkit",
	Long:  "Explore and correlate the 20 case evidence files (E01 to E20) from Case File CR-26-047.",
}

var evidenceListCmd = &cobra.Command{
	Use:   "list",
	Short: "List all 20 evidence artifacts in the master evidence catalog",
	Run: func(cmd *cobra.Command, args []string) {
		utils.PrintHeader("Master Evidence Catalog (CR-26-047)")

		cyan := utils.ColorElectricCyan + utils.ColorBold
		yellow := utils.ColorAmberGold + utils.ColorBold
		white := utils.ColorPureWhite + utils.ColorBold
		gray := utils.ColorSlate
		dim := utils.ColorCharcoal
		reset := utils.ColorReset

		fmt.Println()
		fmt.Printf("  %s%-5s %-36s %-8s %-12s %s%s\n", cyan, "ID", "DESCRIPTION", "FORMAT", "SOURCE", "KEY PROVEN FINDING", reset)
		fmt.Println("  " + dim + strings.Repeat("─", 110) + reset)

		for _, e := range evidenceCatalog {
			fmt.Printf("  %s%-5s%s %s%-36s%s %s%-8s%s %-12s %s%s%s\n",
				yellow, e.ID, reset,
				white, e.Description, reset,
				gray, e.Format, reset,
				e.Source,
				gray, e.KeyFinding, reset)
		}
		fmt.Println()
		utils.PrintGradientBar()
	},
}

var evidenceTimelineCmd = &cobra.Command{
	Use:   "timeline",
	Short: "Display the correlated cross-system forensic timeline (UTC & IST)",
	Run: func(cmd *cobra.Command, args []string) {
		utils.PrintHeader("Correlated Multi-System Forensic Timeline (UTC & IST)")

		cyan := utils.ColorElectricCyan + utils.ColorBold
		pink := utils.ColorNeonPink + utils.ColorBold
		green := utils.ColorEmeraldMint + utils.ColorBold
		red := utils.ColorCrimson + utils.ColorBold
		yellow := utils.ColorAmberGold + utils.ColorBold
		white := utils.ColorPureWhite + utils.ColorBold
		gray := utils.ColorSlate
		reset := utils.ColorReset

		events := []struct {
			Time   string
			Tag    string
			TagCol string
			System string
			Desc   string
			Impact string
		}{
			{"2024-06-05", "DUE DILIGENCE", yellow, "Governance (E07/E09)", "TallyBridge approved with SOC 2 credential vault carved out", "Risk R-031 accepted as LOW by Finance Manager"},
			{"2024-06-12", "PROVISIONING", yellow, "Registry (E04)", "key-tb-07, tb-sync-svc, bvk-7f3a created with infinite lifetime", "Zero IP/CIDR restrictions configured on any key"},
			{"2026-06-25 06:01 UTC (11:31 IST)", "KEY LEAK", red, "Chat (E13)", "Sunita Iyer asks customer to paste config into ticket TKT-48213", "Storage key bvk-7f3a leaked into ticket comments!"},
			{"2026-06-30", "OFFBOARDING", yellow, "HR Roster (E14)", "Rohan Menon resigns; HR fails to deactivate SSO domain account", "Account left active alongside 7 other terminated employees"},
			{"2026-08-09 03:12 UTC (08:42 IST)", "RECONNAISSANCE", cyan, "Finance API (E01)", "Attacker probes /v2/me and /v2/schema via key-tb-07 from 198.18.7.41", "LedgerOne endpoints & schema disclosed to adversary"},
			{"2026-08-11 18:00 UTC (23:30 IST)", "TICKET EXFIL", pink, "Support API (E02)", "10 bulk exports (EXP-5410 to 5419) executed by tb-sync-svc", "Leaked storage key bvk-7f3a harvested from TKT-48213"},
			{"2026-08-12 03:41 UTC (09:11 IST)", "VENDOR EXFIL", green, "Finance API (E01)", "Attacker downloads 9,840 vendor master records via req-c35c2ccaff", "Baseline vendor list and payout schedules exfiltrated"},
			{"2026-08-14 to 16", "STORAGE THEFT", pink, "Cloud Store (E05)", "Weaponized bvk-7f3a used to steal vendor-bank-details-2026.xlsx", "All 300 haulier & vendor banking coordinates exfiltrated"},
			{"2026-08-17 to 19", "TUNNEL PIVOT", cyan, "Private Link (E15)", "tb-build-02 (10.20.4.77) pulls 22.2MB payment data across tunnel", "Early morning dispatch dashboard sluggishness noticed (Note 94)"},
			{"2026-09-03 01:44 UTC (07:14 IST)", "SILENT TAMPER", red, "Finance API (E18/E19)", "PATCH /v2/vendors/V-0412/bank-details changes account to ****9083", "Approval Ref was BLANK! Diverts INR 248,000 to mule route (INV-9081)"},
			{"2026-09-06 01:36 UTC (07:06 IST)", "LOCK-IN CHECK", green, "Finance API (E18)", "GET /v2/payments/scheduled confirms tampered account queued for run", "Payment scheduled for fund disbursement on September 8!"},
			{"2026-09-07", "COMMISSION", yellow, "General Manager", "Dev Raghavan commissions emergency cybersecurity investigation", "Last line of defense before funds release on September 8!"},
		}

		fmt.Println()
		for _, ev := range events {
			fmt.Printf("  %s[%-32s]%s %s[%-13s]%s %s%-20s%s\n",
				cyan, ev.Time, reset,
				ev.TagCol, ev.Tag, reset,
				white, ev.System, reset)
			fmt.Printf("    ├── Action : %s\n", ev.Desc)
			fmt.Printf("    └── Impact : %s%s%s\n\n", gray, ev.Impact, reset)
		}
		utils.PrintGradientBar()
	},
}

var evidenceInspectCmd = &cobra.Command{
	Use:   "inspect [ID]",
	Short: "Inspect detailed findings for a specific evidence file (e.g. E18, E19)",
	Args:  cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		id := strings.ToUpper(args[0])
		var target *EvidenceItem
		for _, e := range evidenceCatalog {
			if e.ID == id {
				target = &e
				break
			}
		}

		if target == nil {
			utils.PrintError("Evidence ID '%s' not found. Use 'hso evidence list' to view available IDs.", id)
			return
		}

		cyan := utils.ColorElectricCyan + utils.ColorBold
		yellow := utils.ColorAmberGold + utils.ColorBold
		white := utils.ColorPureWhite + utils.ColorBold
		gray := utils.ColorSlate
		reset := utils.ColorReset

		evidenceLines := []string{
			fmt.Sprintf(" Artifact Title : %s%s%s", white, target.Description, reset),
			fmt.Sprintf(" Source Agency  : %s%s%s", yellow, target.Source, reset),
			fmt.Sprintf(" File Format    : %s%s%s", gray, target.Format, reset),
			fmt.Sprintf(" Attack Phase   : %s%s%s", cyan, target.Phase, reset),
			"",
			fmt.Sprintf(" %sForensic Proof & Key Finding:%s", yellow, reset),
			fmt.Sprintf(" %s%s%s", white, target.KeyFinding, reset),
		}
		utils.DrawBox(fmt.Sprintf("🔬 EVIDENCE DOSSIER: %s", target.ID), evidenceLines, cyan, 96)
	},
}

var evidenceTimeConvertCmd = &cobra.Command{
	Use:   "time-convert [timestamp]",
	Short: "Convert between UTC and IST (+05:30) to resolve case clock skew traps",
	Args:  cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		raw := args[0]
		t, err := utils.ParseCaseTime(raw)
		if err != nil {
			utils.PrintError("Failed to parse time string '%s': %v", raw, err)
			return
		}

		istLoc := time.FixedZone("IST", 5*3600+1800)
		tIST := t.In(istLoc)

		cyan := utils.ColorElectricCyan + utils.ColorBold
		green := utils.ColorEmeraldMint + utils.ColorBold
		white := utils.ColorPureWhite + utils.ColorBold
		yellow := utils.ColorAmberGold + utils.ColorBold
		reset := utils.ColorReset

		timeLines := []string{
			fmt.Sprintf(" Input Raw Timestamp  : %s%s%s", white, raw, reset),
			fmt.Sprintf(" Normalized UTC Time  : %s%s%s", green, t.Format("2006-01-02 15:04:05 UTC"), reset),
			fmt.Sprintf(" Local Chennai (IST)  : %s%s%s", yellow, tIST.Format("2006-01-02 15:04:05 IST"), reset),
			fmt.Sprintf(" Unix Epoch Seconds   : %s%d%s", white, t.Unix(), reset),
		}
		utils.DrawBox("⏱ TIMESTAMP SKEW & NORMALIZATION MATRIX", timeLines, cyan, 76)
	},
}

func init() {
	evidenceCmd.AddCommand(evidenceListCmd)
	evidenceCmd.AddCommand(evidenceTimelineCmd)
	evidenceCmd.AddCommand(evidenceInspectCmd)
	evidenceCmd.AddCommand(evidenceTimeConvertCmd)
	rootCmd.AddCommand(evidenceCmd)
}
