package utils

import (
	"fmt"
	"io"
	"os"
	"regexp"
	"runtime"
	"strings"
	"syscall"
	"text/tabwriter"
	"time"
	"unsafe"
)

var ansiRegex = regexp.MustCompile(`\x1b\[[0-9;]*[a-zA-Z]`)

// StripANSI removes ANSI escape codes from string
func StripANSI(s string) string {
	return ansiRegex.ReplaceAllString(s, "")
}

// VisibleLen computes the visible column width of a string in terminal
func VisibleLen(s string) int {
	return len([]rune(StripANSI(s)))
}

// PadRight pads string with spaces to reach target visual width
func PadRight(s string, width int) string {
	vLen := VisibleLen(s)
	if vLen >= width {
		return s
	}
	return s + strings.Repeat(" ", width-vLen)
}

// PadLeft pads string on left to reach target visual width
func PadLeft(s string, width int) string {
	vLen := VisibleLen(s)
	if vLen >= width {
		return s
	}
	return strings.Repeat(" ", width-vLen) + s
}

// ANSI Color & Styling Constants (Pro Linux / Terminal Aesthetic)
const (
	ColorReset       = "\033[0m"
	ColorBold        = "\033[1m"
	ColorDim         = "\033[2m"
	ColorItalic      = "\033[3m"
	ColorUnderline   = "\033[4m"

	// Standard Colors
	ColorBlack       = "\033[30m"
	ColorRed         = "\033[1;31m"
	ColorGreen       = "\033[1;32m"
	ColorYellow      = "\033[1;33m"
	ColorBlue        = "\033[1;34m"
	ColorMagenta     = "\033[1;35m"
	ColorCyan        = "\033[1;36m"
	ColorWhite       = "\033[1;37m"
	ColorGray        = "\033[0;90m"

	// 256-Color Vibrant Pro Accents
	ColorElectricCyan   = "\033[38;5;51m"   // Bright Cyan
	ColorNeonPink       = "\033[38;5;198m"  // Deep Hot Pink
	ColorElectricPurple = "\033[38;5;141m"  // Bright Lavender Purple
	ColorEmeraldMint    = "\033[38;5;48m"   // Radiant Mint Green
	ColorAmberGold      = "\033[38;5;214m"  // Rich Gold
	ColorCrimson        = "\033[38;5;197m"  // Aggressive Red
	ColorSlate          = "\033[38;5;248m"  // Clean Slate Gray
	ColorCharcoal       = "\033[38;5;238m"  // Dark Gray Border

	// Aliases
	ColorNeonTeal       = ColorElectricCyan
	ColorNeonCyan       = ColorElectricCyan
	ColorNeonPurple     = ColorElectricPurple
	ColorNeonGreen      = ColorEmeraldMint
	ColorNeonAmber      = ColorAmberGold
	ColorNeonCoral      = ColorCrimson
	ColorPureWhite      = ColorWhite
	ColorMuted          = ColorGray

	// Pill Badges with Backgrounds
	BgRed            = "\033[48;5;196;38;5;255;1m"
	BgGreen          = "\033[48;5;34;38;5;255;1m"
	BgYellow         = "\033[48;5;214;38;5;16;1m"
	BgBlue           = "\033[48;5;33;38;5;255;1m"
	BgMagenta        = "\033[48;5;198;38;5;255;1m"
	BgCyan           = "\033[48;5;37;38;5;16;1m"
	BgDark           = "\033[48;5;236;38;5;250;1m"
	BgStatus200      = "\033[48;5;34;38;5;255;1m"
	BgStatusAlert    = "\033[48;5;196;38;5;255;1m"
	BgPillPink       = "\033[48;5;198;38;5;255;1m"
	BgPillPurple     = "\033[48;5;141;38;5;16;1m"
	BgPillAmber      = "\033[48;5;214;38;5;16;1m"
	BgPillDark       = "\033[48;5;236;38;5;250;1m"
	BgMethodGet      = "\033[48;5;63;38;5;255;1m"
	BgMethodPost     = "\033[48;5;37;38;5;16;1m"
	BgMethodPatch    = "\033[48;5;198;38;5;255;1m"
	BgMethodDelete   = "\033[48;5;196;38;5;255;1m"
)

func init() {
	// Enable Virtual Terminal Processing on Windows so Linux ANSI colors render natively
	if runtime.GOOS == "windows" {
		kernel32 := syscall.NewLazyDLL("kernel32.dll")
		getMode := kernel32.NewProc("GetConsoleMode")
		setMode := kernel32.NewProc("SetConsoleMode")
		for _, fd := range []uintptr{os.Stdout.Fd(), os.Stderr.Fd()} {
			var mode uint32
			r, _, _ := getMode.Call(fd, uintptr(unsafe.Pointer(&mode)))
			if r != 0 {
				mode |= 0x0004 // ENABLE_VIRTUAL_TERMINAL_PROCESSING
				setMode.Call(fd, uintptr(mode))
			}
		}
	}
}

// PrintBanner outputs a pro-level cyberpunk / SOC HUD banner
func PrintBanner() {
	cyan := ColorElectricCyan + ColorBold
	pink := ColorNeonPink + ColorBold
	purple := ColorElectricPurple + ColorBold
	white := ColorPureWhite + ColorBold
	gray := ColorSlate
	dim := ColorMuted
	reset := ColorReset

	fmt.Println()
	fmt.Printf("  %s██╗  ██╗███████╗ ██████╗ %s      %sHARBORSTRIKE-X%s %s[v2.6.0-OFFENSE]%s\n", cyan, reset, white, reset, BgPillPink, reset)
	fmt.Printf("  %s██║  ██║██╔════╝██╔═══██╗%s      %s----------------------------------------%s\n", cyan, reset, dim, reset)
	fmt.Printf("  %s███████║███████╗██║   ██║%s      %s⚡ ENGINE  :%s Go Offensive Validation CLI (hso)\n", cyan, reset, pink, white)
	fmt.Printf("  %s██╔══██║╚════██║██║   ██║%s      %s🎯 TARGET  :%s Harbor & Finch Freight Pvt. Ltd.\n", cyan, reset, purple, white)
	fmt.Printf("  %s██║  ██║███████║╚██████╔╝%s      %s📁 CASE ID :%s CR-26-047 %s(Chennai Logistics Hub)%s\n", cyan, reset, cyan, ColorAmberGold+ColorBold, gray, reset)
	fmt.Printf("  %s╚═╝  ╚═╝╚══════╝ ╚═════╝ %s      %s🔥 THREAT  :%s Silent Vendor Fraud & Supply-Chain Abuse\n", cyan, reset, ColorCrimson+ColorBold, white)
	fmt.Printf("  %s===========================%s      %s🛡 STATUS  :%s %s[ ARMED / EXPLOIT READY ]%s\n", dim, reset, ColorEmeraldMint+ColorBold, reset, BgGreen, reset)
	fmt.Println()
	PrintGradientBar()
}

// PrintGradientBar renders a pro smooth gradient divider bar
func PrintGradientBar() {
	bar := ColorElectricCyan + "━" +
		ColorElectricCyan + "━" +
		ColorElectricPurple + "━" +
		ColorElectricPurple + "━" +
		ColorNeonPink + "━" +
		ColorNeonPink + "━" +
		ColorAmberGold + "━" +
		ColorAmberGold + "━" +
		ColorEmeraldMint + "━" +
		ColorEmeraldMint + "━"
	repeated := strings.Repeat(bar, 7)
	fmt.Println("  " + repeated + ColorReset)
	fmt.Println()
}

// PrintSuccess formats a pro success line [+]
func PrintSuccess(format string, a ...interface{}) {
	msg := fmt.Sprintf(format, a...)
	fmt.Printf("  %s[✔ SUCCESS]%s  %s%s%s\n", ColorEmeraldMint+ColorBold, ColorReset, ColorPureWhite, msg, ColorReset)
}

// PrintWarning formats a pro warning line [!]
func PrintWarning(format string, a ...interface{}) {
	msg := fmt.Sprintf(format, a...)
	fmt.Printf("  %s[⚠ WARNING]%s  %s%s%s\n", ColorAmberGold+ColorBold, ColorReset, ColorAmberGold, msg, ColorReset)
}

// PrintError formats a pro critical error line [-]
func PrintError(format string, a ...interface{}) {
	msg := fmt.Sprintf(format, a...)
	fmt.Printf("  %s[✖ EXPLOIT]%s  %s%s%s\n", ColorCrimson+ColorBold, ColorReset, ColorCrimson+ColorBold, msg, ColorReset)
}

// PrintInfo formats a pro information line [*]
func PrintInfo(format string, a ...interface{}) {
	msg := fmt.Sprintf(format, a...)
	fmt.Printf("  %s[▸ TARGET ]%s  %s%s%s\n", ColorElectricCyan+ColorBold, ColorReset, ColorSlate, msg, ColorReset)
}

// PrintHeader formats a sleek rounded section header
func PrintHeader(title string) {
	fmt.Println()
	border := ColorElectricPurple + ColorBold
	white := ColorPureWhite + ColorBold
	reset := ColorReset

	lineLen := 70 - len(title) - 6
	if lineLen < 4 {
		lineLen = 4
	}
	fmt.Printf("  %s╭─── %s %s%s\n", border, white+title+reset, border+strings.Repeat("─", lineLen), reset)
}

// PrintHeaderClose closes a section box
func PrintHeaderClose() {
	fmt.Printf("  %s╰%s%s\n\n", ColorElectricPurple+ColorBold, strings.Repeat("─", 71), ColorReset)
}

// Badge returns a color-pill badge
func Badge(text, colorCode string) string {
	return fmt.Sprintf("%s %s %s", colorCode, text, ColorReset)
}

// BadgeSuccess returns green exploit tag
func BadgeSuccess(text string) string {
	return fmt.Sprintf("%s ✔ %s %s", BgGreen, text, ColorReset)
}

// BadgeDanger returns red critical tag
func BadgeDanger(text string) string {
	return fmt.Sprintf("%s ✖ %s %s", BgRed, text, ColorReset)
}

// BadgeWarning returns amber warning tag
func BadgeWarning(text string) string {
	return fmt.Sprintf("%s ⚠ %s %s", BgYellow, text, ColorReset)
}

// BadgeInfo returns blue/cyan info tag
func BadgeInfo(text string) string {
	return fmt.Sprintf("%s ℹ %s %s", BgBlue, text, ColorReset)
}

// MethodBadge formats HTTP verbs into clean Linux colored tags
func MethodBadge(method string) string {
	switch strings.ToUpper(method) {
	case "GET":
		return fmt.Sprintf("%s GET %s", BgMethodGet, ColorReset)
	case "POST", "POS":
		return fmt.Sprintf("%s POST %s", BgMethodPost, ColorReset)
	case "PATCH":
		return fmt.Sprintf("%s PATCH %s", BgMethodPatch, ColorReset)
	case "DELETE", "DEL":
		return fmt.Sprintf("%s DEL %s", BgMethodDelete, ColorReset)
	default:
		return fmt.Sprintf("[%s]", method)
	}
}

// StatusBadge formats HTTP status responses
func StatusBadge(code int, text string) string {
	if code >= 200 && code < 300 {
		return fmt.Sprintf("%s %d %s %s", BgStatus200, code, text, ColorReset)
	}
	return fmt.Sprintf("%s %d %s %s", BgStatusAlert, code, text, ColorReset)
}

// ProgressMeter renders a pro gradient progress bar
func ProgressMeter(filled, total int) string {
	percent := (filled * 100) / total
	barWidth := 28
	filledBlocks := (filled * barWidth) / total

	bar := ""
	for i := 0; i < barWidth; i++ {
		if i < filledBlocks {
			bar += ColorEmeraldMint + "█" + ColorReset
		} else {
			bar += ColorCharcoal + "░" + ColorReset
		}
	}
	return fmt.Sprintf("[%s] %s%d%%%s (%d/%d)", bar, ColorElectricCyan+ColorBold, percent, ColorReset, filled, total)
}

// DrawBox renders a pro-styled colored box card with aligned borders
func DrawBox(title string, lines []string, borderColor string, width int) {
	if width <= 0 {
		width = 76
	}
	reset := ColorReset
	topTitle := fmt.Sprintf("╭─── %s ", title)
	topFill := width - VisibleLen(topTitle) - 1
	if topFill < 2 {
		topFill = 2
	}
	fmt.Printf("  %s%s%s╮%s\n", borderColor, topTitle, strings.Repeat("─", topFill), reset)

	for _, l := range lines {
		padded := PadRight(l, width-2)
		fmt.Printf("  %s│%s %s %s│%s\n", borderColor, reset, padded, borderColor, reset)
	}

	fmt.Printf("  %s╰%s╯%s\n\n", borderColor, strings.Repeat("─", width-2), reset)
}

// PrintBreadcrumb prints a stylish arrow-separated breadcrumb trail
func PrintBreadcrumb(crumbs ...string) {
	cyan := ColorElectricCyan + ColorBold
	pink := ColorNeonPink + ColorBold
	reset := ColorReset
	var rendered []string
	for _, c := range crumbs {
		rendered = append(rendered, fmt.Sprintf("%s%s%s", cyan, c, reset))
	}
	fmt.Printf("  %s⚡%s %s\n\n", pink, reset, strings.Join(rendered, fmt.Sprintf(" %s❯%s ", ColorMuted, reset)))
}

// DrawDiffCard renders a pro-level forensic diff HUD with pixel-perfect borders
func DrawDiffCard(vendor, oldVal, newVal, modifiedBy, approvalRef string) {
	red := ColorCrimson + ColorBold
	green := ColorEmeraldMint + ColorBold
	yellow := ColorAmberGold + ColorBold
	white := ColorPureWhite + ColorBold
	gray := ColorSlate
	reset := ColorReset
	width := 74

	line1 := fmt.Sprintf(" Target Vendor   : %s%s%s", white, vendor, reset)
	line2 := fmt.Sprintf(" Disbursement    : %sINR 248,000.00%s %s(Scheduled Run: 08 Sept 2026, Invoice INV-9081)%s", yellow, reset, gray, reset)
	line3 := fmt.Sprintf(" [-] ORIGINAL    : %s%s%s  %s[GENUINE]%s", green, oldVal, reset, green, reset)
	line4 := fmt.Sprintf(" [+] TAMPERED    : %s%s%s  %s[MULE ACCOUNT]%s", red, newVal, reset, red, reset)
	line5 := fmt.Sprintf(" Changed By      : %s%s%s", yellow, modifiedBy, reset)
	line6 := fmt.Sprintf(" Approval Gate   : %s%s%s", red, approvalRef, reset)
	line7 := fmt.Sprintf(" Exploit Verdict : %s CRITICAL: MULE ACCOUNT LOCKED FOR PAYOUT %s", BgRed, reset)

	fmt.Println()
	topTitle := "╭─── 🎯 FORENSIC DISBURSEMENT ALTERATION HUD (PHASE 6) "
	fmt.Printf("  %s%s%s╮%s\n", red, topTitle, strings.Repeat("─", width-VisibleLen(topTitle)-1), reset)
	fmt.Printf("  %s│%s %s %s│%s\n", red, reset, PadRight(line1, width-2), red, reset)
	fmt.Printf("  %s│%s %s %s│%s\n", red, reset, PadRight(line2, width-2), red, reset)
	div1 := "├─── RECIPIENT BANKING COORDINATES "
	fmt.Printf("  %s%s%s┤%s\n", red, div1, strings.Repeat("─", width-VisibleLen(div1)-1), reset)
	fmt.Printf("  %s│%s %s %s│%s\n", red, reset, PadRight(line3, width-2), red, reset)
	fmt.Printf("  %s│%s %s %s│%s\n", red, reset, PadRight(line4, width-2), red, reset)
	div2 := "├─── ACTOR & GOVERNANCE AUDIT RECORD "
	fmt.Printf("  %s%s%s┤%s\n", red, div2, strings.Repeat("─", width-VisibleLen(div2)-1), reset)
	fmt.Printf("  %s│%s %s %s│%s\n", red, reset, PadRight(line5, width-2), red, reset)
	fmt.Printf("  %s│%s %s %s│%s\n", red, reset, PadRight(line6, width-2), red, reset)
	fmt.Printf("  %s│%s %s %s│%s\n", red, reset, PadRight(line7, width-2), red, reset)
	fmt.Printf("  %s╰%s╯%s\n\n", red, strings.Repeat("─", width-2), reset)
}

// DrawAttackGraph renders an ASCII attack graph linking the intrusion phases
func DrawAttackGraph() {
	cyan := ColorElectricCyan + ColorBold
	purple := ColorElectricPurple + ColorBold
	pink := ColorNeonPink + ColorBold
	green := ColorEmeraldMint + ColorBold
	red := ColorCrimson + ColorBold
	white := ColorPureWhite + ColorBold
	dim := ColorMuted
	reset := ColorReset

	w := 78
	top := "╭─── ⚡ HARBORSTRIKE-X INTRUSION KILL-CHAIN GRAPH "
	fmt.Printf("\n  %s%s%s╮%s\n", purple, top, strings.Repeat("─", w-VisibleLen(top)-1), reset)

	lines := []string{
		"",
		fmt.Sprintf("   %s[1] API RECON%s %s(key-tb-07)%s %s──────►%s %s[2] TICKET THEFT%s %s(EXP-5412)%s", cyan, reset, dim, reset, dim, reset, pink, reset, dim, reset),
		fmt.Sprintf("              %s│                                   │%s", dim, reset),
		fmt.Sprintf("              %s▼                                   ▼%s", dim, reset),
		fmt.Sprintf("   %s[4] VENDOR DUMP%s %s(9,840)%s          %s[3] STORAGE EXFIL%s %s(bvk-7f3a)%s", green, reset, dim, reset, cyan, reset, dim, reset),
		fmt.Sprintf("              %s│                                   │%s", dim, reset),
		fmt.Sprintf("              %s└─────────────────┬─────────────────┘%s", dim, reset),
		fmt.Sprintf("                                %s▼%s", dim, reset),
		fmt.Sprintf("                     %s[5] TUNNEL PIVOT%s %s(10.20.4.77)%s", purple, reset, dim, reset),
		fmt.Sprintf("                                %s│%s", dim, reset),
		fmt.Sprintf("                                %s▼%s", dim, reset),
		fmt.Sprintf("         %s[6] SILENT BANK TAMPER%s %s(V-0412)%s %s──►%s %s[7] DISBURSEMENT%s", red, reset, dim, reset, dim, reset, green, reset),
		fmt.Sprintf("          %s(HDFC0001842-4417 → 9083)%s               %sLOCK-IN (Sep 8)%s", dim, reset, ColorAmberGold+ColorBold, reset),
		fmt.Sprintf("                                %s│%s", dim, reset),
		fmt.Sprintf("                                %s▼%s", dim, reset),
		fmt.Sprintf("                 %s[8] ORPHANED KIOSK LOGIN%s %s(r.menon)%s", white, reset, dim, reset),
		"",
	}

	for _, l := range lines {
		fmt.Printf("  %s│%s %s %s│%s\n", purple, reset, PadRight(l, w-2), purple, reset)
	}
	fmt.Printf("  %s╰%s╯%s\n\n", purple, strings.Repeat("─", w-2), reset)
}

// NewTableWriter initializes a tabwriter for pretty-printed terminal tables
func NewTableWriter(out io.Writer) *tabwriter.Writer {
	if out == nil {
		out = os.Stdout
	}
	return tabwriter.NewWriter(out, 0, 0, 3, ' ', 0)
}

// FormatDualTime returns both UTC and IST string representations
func FormatDualTime(t time.Time) string {
	istLoc := time.FixedZone("IST", 5*3600+1800)
	tUTC := t.UTC().Format("2006-01-02 15:04:05 UTC")
	tIST := t.In(istLoc).Format("15:04:05 IST")
	return fmt.Sprintf("%s (%s)", tUTC, tIST)
}

// ParseCaseTime parses a timestamp string and returns UTC time
func ParseCaseTime(raw string) (time.Time, error) {
	layouts := []string{
		"2006-01-02 15:04:05",
		"2006-01-02T15:04:05Z",
		"2006-01-02T15:04:05",
		"2006-01-02 15:04",
		"2006-01-02",
	}
	for _, l := range layouts {
		if t, err := time.Parse(l, raw); err == nil {
			return t.UTC(), nil
		}
	}
	return time.Time{}, fmt.Errorf("unable to parse timestamp: %s", raw)
}
