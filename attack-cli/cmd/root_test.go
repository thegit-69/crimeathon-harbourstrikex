package cmd

import (
	"testing"
)

func TestRootCommand(t *testing.T) {
	if rootCmd == nil {
		t.Fatal("expected rootCmd to be initialized")
	}
	if rootCmd.Use != "hso" {
		t.Fatalf("expected rootCmd.Use to be 'hso', got '%s'", rootCmd.Use)
	}
}

func TestResolveCampaignPhases(t *testing.T) {
	if phases := resolveCampaignPhases(false, false, "1,6"); len(phases) != 2 || phases[0] != 1 || phases[1] != 6 {
		t.Fatalf("targeted selection should return phases 1 and 6, got %v", phases)
	}
	if phases := resolveCampaignPhases(false, true, "1,6"); len(phases) != 2 {
		t.Fatalf("explicit selection should override inherited all flag state, got %v", phases)
	}
	if phases := resolveCampaignPhases(true, true, "1,6"); len(phases) != 8 {
		t.Fatalf("--all should run all phases, got %v", phases)
	}
}
