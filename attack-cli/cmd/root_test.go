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
