# HARBORSTRIKE-X — Offensive Validation CLI (`hso`) & Simulation Suite

**CRIMEATHON '26 | Case File CR-26-047 (Harbor & Finch Freight Pvt. Ltd.)**  
**Track:** OFFENSE (Controlled Attack Simulation, Machine Identity Abuse & Payment Tampering)  
**Primary Engine:** Go (`go1.24+ windows/amd64`)  
**Secondary Script:** Python (`harborstrike_attack.py`)  
**Design:** Pro Linux Terminal HUD & Cyber-Security Forensic Aesthetic  

---

## ⚡ 1. Offensive Mission Overview

The objective of this offensive tool is to simulate, orchestrate, and measure the weaponized exploitation of supply-chain vulnerabilities identified in Case CR-26-047 against Harbor & Finch Freight's logistics infrastructure:
- **Target Organization:** Harbor & Finch Freight Pvt. Ltd. (Chennai Hub, Coimbatore, Madurai depots)
- **Primary Weaponized Vector:** Silent Vendor Master Bank Detail Redirection
- **High-Value Target:** Coastal Packaging Ltd (`V-0412`), Invoice `INV-9081`, amount **INR 2,48,000**
- **Disbursement Deadline:** 08 September 2026

---

## 🎯 2. Step-by-Step Presentation Guide (One-by-One Evaluator Demonstration)

Present each phase individually to the evaluators using the compiled Go binary `hso.exe`. Each command prints rich breadcrumbs, glowing ANSI HUD cards, forensic evidence links (`E01` to `E20`), MITRE ATT&CK techniques, and next-phase recommendations.

```powershell
# Step 0: Check System Readiness & Target Infrastructure HUD
.\dist\hso.exe status

# Step 1: Phase 1 — Probe Machine Identity Scoping & Zero-IP Restriction
.\dist\hso.exe recon

# Step 2: Phase 2 — Harvest Support Tickets & Discover Leaked Storage Key
.\dist\hso.exe harvest

# Step 3: Phase 3 — Exfiltrate Master Bank Sheets from Cloud Object Storage
.\dist\hso.exe storage

# Step 4: Phase 4 — Dump 9,840 Vendor Master Records & Pinpoint Target V-0412
.\dist\hso.exe vendor-exfil

# Step 5: Phase 5 — Simulate Rogue Build Host Pivot Across Private Link
.\dist\hso.exe pivot

# Step 6: Phase 6 — Execute Silent Fraudulent Bank Tampering (THE CLIMAX)
.\dist\hso.exe tamper

# Step 7: Phase 7 — Verify Fraudulent Payout Locked into Disbursement Queue
.\dist\hso.exe verify-run

# Step 8: Phase 8 — Validate Terminated Employee Kiosk Login (Decoy Analysis)
.\dist\hso.exe auth-test

# Step 8 (Variant): Validate Admin Brute-Force Password Spray Probe (Case E13)
.\dist\hso.exe auth-test --user a.kapoor

# Step 9: Post-Exfil Anti-Forensics & Trace Elimination (T1070)
.\dist\hso.exe anti-forensics

# Step 10: Generate Executive Validation & MITRE ATT&CK Technical Report
.\dist\hso.exe report

# Step 11: Launch Interactive Multi-Pane Workbench (Posting-Inspired TUI)
.\dist\hso.exe ui
```

---

## 📊 3. Footprint Accuracy Matrix (100% Match)

| Vector | Executed Action | Target Evidence Log | Generated Footprint ID | Trace Status |
| :--- | :--- | :--- | :--- | :--- |
| **VEC-01** | `PATCH /api/v2/vendors/V-0412/bank-details` | E18 (API Log) / E19 (Change Log) | `req-5f61b0de8` · `chg-8b9888c39b` | Verified (200 OK) |
| **VEC-02** | `POST /api/v1/exports` | E02 (Audit Log) / E06 (Billing) | `EXP-5419` (`evt-3fe76f60c4`) | Verified (Delete Timeout) |
| **VEC-03** | `GET /files/.../vendor-bank-details-2026.xlsx` | E05 (BlueVault Log) | `bv-edb0081dad` (3.46 MB) | Verified (Epoch Drift) |
| **VEC-04** | `TCP 443 /api/v2/queries` | E15 (Private Link Flow Log) | `flow-seq-8812` (22.2 MB) | Verified (Established) |

---

## 🔌 4. Backend Connectivity & Development Resilience

The CLI is engineered to prevent crashes during live presentations whether your custom backend is running or still in development:

### 1. Offline Simulation Mode (Default)
By default, `hso` runs in high-fidelity offline simulation mode (`--mode simulate`). It requires **zero network dependencies** and replays the exact case forensic findings.

### 2. Live Backend Mode
When your custom project backend is ready, connect the CLI using:
```powershell
.\dist\hso.exe recon --mode live --target-url http://localhost:8080
```

### 3. Built-in Auto-Fallback (Fail-Safe)
If `--mode live` is passed but your backend server is unreachable or still in development, `hso` **never crashes with a socket error**. It automatically outputs:
```
[⚠ LIVE TARGET NOTICE] Target http://localhost:8080 unreachable (backend in development). Engaging offline replay simulator.
```
and seamlessly renders the complete exploit data so your demonstration continues without interruption.

### 4. Built-in Enterprise Mock Backend Daemon
If you need an actual running HTTP backend target, `hso` includes a built-in synthetic enterprise server:
```powershell
# In a separate terminal:
.\dist\hso.exe server start --port 8080
```
This spawns an in-memory HTTP server implementing all LedgerOne, HelpDeskr, BlueVault, and SSO endpoints with real-time state mutation.

---

## 🔬 5. Evidence Inspection & Clock Skew Normalization

```powershell
# Browse all 20 case evidence artifacts
.\dist\hso.exe evidence list

# Inspect specific critical evidence dossiers
.\dist\hso.exe evidence inspect E18
.\dist\hso.exe evidence inspect E19

# Resolve UTC vs IST (+05:30) case clock skew trap
.\dist\hso.exe evidence time-convert "2026-09-03 01:44:30"
```

---

## 🐍 6. Python Exploit Script Alternative

For environments without Go installed, the legacy Python simulator is also included:
```bash
python harborstrike_attack.py --run-all
python harborstrike_attack.py --vector 1
python harborstrike_attack.py --verify
python harborstrike_attack.py --json
```

---

## 🛠️ 7. Build & Compilation Instructions

From PowerShell:
```powershell
cd attack-cli
go build -o dist\hso.exe .
```
Executable binary is generated at `dist/hso.exe`.
