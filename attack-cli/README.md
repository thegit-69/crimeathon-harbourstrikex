# HARBORSTRIKE-X — Offensive Validation CLI (`hso`) & Simulation Suite

**CRIMEATHON '26 | Case File CR-26-047 (Harbor & Finch Freight Pvt. Ltd.)**  
**Track:** OFFENSE (Controlled Attack Simulation, Machine Identity Abuse & Payment Tampering)  
**Primary Engine:** Go (`go1.24+ windows/amd64`)  
**Secondary Script:** Python (`harborstrike_attack.py`)  
**Design:** Pro Linux Terminal HUD & Cyber-Security Forensic Aesthetic  

---

## ⚡ 1. Quickstart & Setup Guide

### 📋 Prerequisites
- **Operating System:** Windows, Linux, or macOS (`amd64` / `arm64`)
- **Go Version:** Go 1.21 or higher installed.
  - To verify Go installation:
    ```powershell
    go version
    ```
  - *If Go is installed but not recognized in PowerShell*, add it to your session PATH:
    ```powershell
    $env:Path += ";C:\Program Files\Go\bin"
    ```

---

### 🛠️ Setup & Build Commands

Open PowerShell or your terminal and navigate to the `attack-cli` directory:

```powershell
# 1. Navigate to the CLI folder
cd c:\Users\DELL\Desktop\crimeathon-harbourstrikex\attack-cli

# 2. Download and verify Go dependencies
go mod download
go mod verify

# 3. Option A: Build the standalone binary (Recommended)
go build -o dist\hso.exe .

# 3. Option B: Or run the automated test and build script
.\build.ps1
```

Once built, the standalone executable is located at `dist\hso.exe`.

---

### 💻 Two Ways to Run the CLI

#### Method 1: Using the Compiled Binary (Fastest & Recommended)
```powershell
# From the attack-cli directory:
.\dist\hso.exe status
.\dist\hso.exe recon
```

#### Method 2: Running Directly via Go (No Build Required)
```powershell
# Run directly from source code:
go run . status
go run . recon
```

#### Optional: Add `hso` to System PATH (Run from Anywhere)
To execute `hso` from any terminal directory without typing `.\dist\hso.exe`:
```powershell
# Add dist directory to current PowerShell session:
$env:Path += ";$PWD\dist"

# Now you can simply run:
hso status
hso recon
hso tamper
```

---

## 🎯 2. Evaluator Presentation Workflow (Step-by-Step Demonstration)

Present each attack phase individually to the evaluators. Each command prints rich breadcrumbs, glowing ANSI HUD cards, forensic evidence links (`E01` to `E20`), MITRE ATT&CK techniques, and next-phase recommendations.

```powershell
# Step 0: Check System Readiness & SOC Target Infrastructure HUD
.\dist\hso.exe status

# Step 1: Phase 1 — Probe Machine Identity Scoping & Zero-IP Restriction
# Evidence: E01, E18 | MITRE: T1078.004
.\dist\hso.exe recon

# Step 2: Phase 2 — Harvest Support Tickets & Discover Leaked Storage Key
# Evidence: E02, E06 | MITRE: T1530
.\dist\hso.exe harvest

# Step 3: Phase 3 — Exfiltrate Master Bank Sheets from Cloud Object Storage
# Evidence: E05 | MITRE: T1567.002
.\dist\hso.exe storage

# Step 4: Phase 4 — Dump 9,840 Vendor Master Records & Pinpoint Target V-0412
# Evidence: E18 | MITRE: T1005
.\dist\hso.exe vendor-exfil

# Step 5: Phase 5 — Simulate Rogue Build Host Pivot Across Private Link Tunnel
# Evidence: E15 | MITRE: T1572
.\dist\hso.exe pivot

# Step 6: Phase 6 — Execute Silent Fraudulent Bank Tampering (THE CLIMAX)
# Evidence: E18, E19 | MITRE: T1565.001
.\dist\hso.exe tamper

# Step 7: Phase 7 — Verify Fraudulent Payout Locked into Disbursement Queue
# Evidence: E09 | MITRE: T1020
.\dist\hso.exe verify-run

# Step 8: Phase 8 — Validate Terminated Employee Kiosk Login (Decoy Analysis)
# Evidence: E04, E16 | MITRE: T1078.002
.\dist\hso.exe auth-test

# Step 9: Generate Executive Validation & MITRE ATT&CK Technical Report
.\dist\hso.exe report

# Step 10: Launch Interactive Multi-Pane Cyber Workbench (Posting-Inspired TUI)
.\dist\hso.exe ui
```

---

## 📖 3. Complete Command Catalog & Flags Reference

| Command | Category | Purpose | Key Flags | Evidence Mapped |
| :--- | :--- | :--- | :--- | :--- |
| `status` | System | Displays SOC readiness, targets, credentials & API matrix | `--json` | Global |
| `recon` | Phase 1 | Scopes `key-tb-07` machine identity & verifies missing IP lock | `--mode`, `--target-url` | E01, E18 |
| `harvest` | Phase 2 | Harvests HelpDeskr tickets; extracts leaked BlueVault key | `--mode`, `--limit` | E02, E06 |
| `storage` | Phase 3 | Exfiltrates `vendor-bank-details-2026.xlsx` (3.46 MB) | `--mode`, `--file` | E05 |
| `vendor-exfil` | Phase 4 | Dumps 9,840 vendor records and isolates Coastal Packaging | `--mode`, `--vendor-id` | E18 |
| `pivot` | Phase 5 | Simulates lateral pivot across Private Link (`10.20.4.77`) | `--mode`, `--packets` | E15 |
| `tamper` | Phase 6 | Executes stealth bank routing redirection (`HDFC0001842`) | `--mode`, `--vendor-id` | E18, E19 |
| `verify-run` | Phase 7 | Verifies fraudulent payout of ₹2,48,000 queued for release | `--mode`, `--run-date` | E09 |
| `auth-test` | Phase 8 | Replays Rohan Menon's kiosk login without MFA (Decoy) | `--mode`, `--user` | E04, E16 |
| `campaign` | Automation | Runs the full 8-phase offensive sequence end-to-end | `--mode`, `--target-url` | E01–E20 |
| `report` | Forensics | Generates executive findings & MITRE ATT&CK matrix | `--output`, `--format` | All |
| `ui` | Interactive | Launches interactive multi-pane terminal HUD workbench | None | Interactive |
| `evidence list` | Forensics | Lists all 20 case evidence dossiers with hashes & sizes | None | E01–E20 |
| `evidence inspect` | Forensics | Deep inspects specific evidence file (e.g., `inspect E18`) | None | E01–E20 |
| `evidence time-convert` | Forensics | Normalizes UTC to IST (+05:30) timestamp skew | None | Timestamp |
| `server start` | Mock Daemon | Launches synthetic enterprise backend on localhost:8080 | `--port` | Standalone |

---

## 🔌 4. Backend Connectivity & Development Resilience

The CLI is engineered with an **automatic fail-safe architecture** so your live presentation never crashes regardless of backend development status:

### 1. High-Fidelity Simulation Mode (Default)
By default, `hso` runs in offline simulation mode:
```powershell
.\dist\hso.exe recon
```
- Requires **zero external dependencies** or network ports.
- Emits exact case forensic fingerprints, cryptographic hashes, and timing data.

### 2. Live Backend Mode
When your team's custom backend server is ready:
```powershell
.\dist\hso.exe recon --mode live --target-url http://localhost:8080
```

### 3. Built-in Auto-Fallback (Never Crashes)
If `--mode live` is passed but your backend server is unreachable or still in development, `hso` **never throws a socket exception or exits unexpectedly**. Instead, it cleanly logs:
```
[⚠ LIVE TARGET NOTICE] Target http://localhost:8080 unreachable (backend in development). Engaging offline replay simulator.
```
and seamlessly renders the full exploit data so your demonstration continues without a hitch.

### 4. Built-in Enterprise Mock Backend Daemon
If you want to demonstrate actual HTTP network requests, `hso` includes its own internal enterprise backend daemon:
```powershell
# Open a separate PowerShell window and run:
.\dist\hso.exe server start --port 8080

# In your main terminal, test live execution against it:
.\dist\hso.exe status --mode live --target-url http://localhost:8080
.\dist\hso.exe tamper --mode live --target-url http://localhost:8080
```

---

## 🔬 5. Evidence Dossier & Clock Skew Analysis

Case CR-26-047 contains a deliberate clock skew trap (UTC vs IST +05:30). `hso` includes built-in evidence inspection tools:

```powershell
# Browse all 20 case evidence artifacts with SHA-256 digests
.\dist\hso.exe evidence list

# Deep inspect critical smoking-gun evidence dossiers
.\dist\hso.exe evidence inspect E18
.\dist\hso.exe evidence inspect E19

# Convert and normalize timestamps to resolve investigator traps
.\dist\hso.exe evidence time-convert "2026-09-03 01:44:30"
```

---

## 📊 6. Footprint Accuracy Matrix (100% Forensic Match)

| Vector | Executed Action | Target Evidence Log | Generated Footprint ID | Trace Status |
| :--- | :--- | :--- | :--- | :--- |
| **VEC-01** | `PATCH /api/v2/vendors/V-0412/bank-details` | E18 (API Log) / E19 (Change Log) | `req-5f61b0de8` · `chg-8b9888c39b` | Verified (200 OK) |
| **VEC-02** | `POST /api/v1/exports` | E02 (Audit Log) / E06 (Billing) | `EXP-5419` (`evt-3fe76f60c4`) | Verified (Delete Timeout) |
| **VEC-03** | `GET /files/.../vendor-bank-details-2026.xlsx` | E05 (BlueVault Log) | `bv-edb0081dad` (3.46 MB) | Verified (Epoch Drift) |
| **VEC-04** | `TCP 443 /api/v2/queries` | E15 (Private Link Flow Log) | `flow-seq-8812` (22.2 MB) | Verified (Established) |

---

## 🐍 7. Python Exploit Script Alternative

If running on a machine without the Go runtime installed, the included Python simulation script can be executed directly:

```bash
# Execute full attack vector sequence
python harborstrike_attack.py --run-all

# Execute single vector (1 to 4)
python harborstrike_attack.py --vector 1

# Verify footprints against evidence logs
python harborstrike_attack.py --verify

# Export report as JSON
python harborstrike_attack.py --json
```

---

## 🧪 8. Unit Testing & Verification

To run the automated test suite across all CLI command modules:

```powershell
cd attack-cli
go test -v ./...
```
Expected output:
```
ok      harborstrike-x/attack-cli/cmd       (passed)
ok      harborstrike-x/attack-cli/pkg/server (passed)
```
