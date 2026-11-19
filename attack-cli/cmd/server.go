package cmd

import (
	"fmt"
	"os"
	"os/signal"
	"syscall"

	"github.com/spf13/cobra"
	"harborstrike-x/attack-cli/pkg/server"
	"harborstrike-x/attack-cli/pkg/utils"
)

var (
	serverPort int
)

var serverCmd = &cobra.Command{
	Use:   "server",
	Short: "Manage the built-in synthetic enterprise target lab server",
	Long: `Manage the built-in synthetic enterprise target lab server.
Provides in-memory emulation of LedgerOne, HelpDeskr, BlueVault, and SSO endpoints
matching the CRIMEATHON '26 Case File CR-26-047 architecture.`,
}

var serverStartCmd = &cobra.Command{
	Use:   "start",
	Short: "Start the synthetic enterprise target lab server",
	Run: func(cmd *cobra.Command, args []string) {
		utils.PrintBanner()
		utils.PrintHeader("Synthetic Enterprise Target Lab Server")
		utils.PrintInfo("Starting mock enterprise systems on port %d...", serverPort)
		fmt.Println("  * LedgerOne Financials API : /v2/me, /v2/schema, /v2/vendors, /v2/payments")
		fmt.Println("  * HelpDeskr Support SaaS   : /api/v1/auth, /api/v1/tickets, /api/v1/exports")
		fmt.Println("  * BlueVault Cloud Storage  : /storage/files, /storage/download")
		fmt.Println("  * Enterprise SSO Identity  : /sso/login")
		fmt.Println("  * Lab Health & Status      : /lab/status")
		fmt.Println()

		srv := server.NewLabServer(serverPort)

		// Listen for termination signals to shut down gracefully
		sigChan := make(chan os.Signal, 1)
		signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)

		go func() {
			<-sigChan
			utils.PrintWarning("Shutting down synthetic enterprise lab server...")
			srv.Stop()
			os.Exit(0)
		}()

		utils.PrintSuccess("Lab server is live! You can now run 'hso campaign run --mode live' against http://localhost:%d", serverPort)
		if err := srv.Start(); err != nil {
			utils.PrintError("Server error: %v", err)
		}
	},
}

func init() {
	serverStartCmd.Flags().IntVarP(&serverPort, "port", "p", 8080, "HTTP port for target server")
	serverCmd.AddCommand(serverStartCmd)
	rootCmd.AddCommand(serverCmd)
}
