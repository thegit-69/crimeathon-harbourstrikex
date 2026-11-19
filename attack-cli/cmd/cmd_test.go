package cmd

import (
	"bytes"
	"testing"
)

func executeCommand(args ...string) (string, error) {
	buf := new(bytes.Buffer)
	rootCmd.SetOut(buf)
	rootCmd.SetErr(buf)
	rootCmd.SetArgs(args)

	err := rootCmd.Execute()
	return buf.String(), err
}

func TestStatusCmd(t *testing.T) {
	output, err := executeCommand("status")
	if err != nil {
		t.Fatalf("status command failed: %v, output: %s", err, output)
	}
}

func TestReconCmd(t *testing.T) {
	output, err := executeCommand("recon", "--mode", "simulate")
	if err != nil {
		t.Fatalf("recon command failed: %v, output: %s", err, output)
	}
}

func TestHarvestCmd(t *testing.T) {
	output, err := executeCommand("harvest", "--mode", "simulate")
	if err != nil {
		t.Fatalf("harvest command failed: %v, output: %s", err, output)
	}
}

func TestStorageCmd(t *testing.T) {
	output, err := executeCommand("storage", "--mode", "simulate")
	if err != nil {
		t.Fatalf("storage command failed: %v, output: %s", err, output)
	}
}

func TestVendorExfilCmd(t *testing.T) {
	output, err := executeCommand("vendor-exfil", "--mode", "simulate")
	if err != nil {
		t.Fatalf("vendor-exfil command failed: %v, output: %s", err, output)
	}
}

func TestPivotCmd(t *testing.T) {
	output, err := executeCommand("pivot", "--mode", "simulate")
	if err != nil {
		t.Fatalf("pivot command failed: %v, output: %s", err, output)
	}
}

func TestTamperCmd(t *testing.T) {
	output, err := executeCommand("tamper", "--mode", "simulate")
	if err != nil {
		t.Fatalf("tamper command failed: %v, output: %s", err, output)
	}
}

func TestVerifyRunCmd(t *testing.T) {
	output, err := executeCommand("verify-run", "--mode", "simulate")
	if err != nil {
		t.Fatalf("verify-run command failed: %v, output: %s", err, output)
	}
}

func TestAuthTestCmd(t *testing.T) {
	output, err := executeCommand("auth-test", "--mode", "simulate")
	if err != nil {
		t.Fatalf("auth-test command failed: %v, output: %s", err, output)
	}
}

func TestCampaignRunCmd(t *testing.T) {
	output, err := executeCommand("campaign", "run", "--phases", "1,6", "--mode", "simulate")
	if err != nil {
		t.Fatalf("campaign run failed: %v, output: %s", err, output)
	}
}

func TestCampaignPlanCmd(t *testing.T) {
	output, err := executeCommand("campaign", "plan")
	if err != nil {
		t.Fatalf("campaign plan failed: %v, output: %s", err, output)
	}
}

func TestEvidenceListCmd(t *testing.T) {
	output, err := executeCommand("evidence", "list")
	if err != nil {
		t.Fatalf("evidence list failed: %v, output: %s", err, output)
	}
}

func TestEvidenceTimelineCmd(t *testing.T) {
	output, err := executeCommand("evidence", "timeline")
	if err != nil {
		t.Fatalf("evidence timeline failed: %v, output: %s", err, output)
	}
}

func TestEvidenceInspectCmd(t *testing.T) {
	output, err := executeCommand("evidence", "inspect", "E18")
	if err != nil {
		t.Fatalf("evidence inspect failed: %v, output: %s", err, output)
	}
}

func TestEvidenceTimeConvertCmd(t *testing.T) {
	output, err := executeCommand("evidence", "time-convert", "2026-09-03 01:44:30")
	if err != nil {
		t.Fatalf("evidence time-convert failed: %v, output: %s", err, output)
	}
}

func TestReportCmd(t *testing.T) {
	output, err := executeCommand("report", "--format", "text")
	if err != nil {
		t.Fatalf("report command failed: %v, output: %s", err, output)
	}
}

func TestUICmd(t *testing.T) {
	output, err := executeCommand("ui")
	if err != nil {
		t.Fatalf("ui command failed: %v, output: %s", err, output)
	}
}
