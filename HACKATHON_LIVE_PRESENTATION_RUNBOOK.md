# 🏆 HARBORSTRIKE-X: Live Hackathon Presentation Runbook
### Case File: `CR-26-047` | Harbor & Finch Freight Pvt. Ltd. | Track: **OFFENSE**
**Team:** Guns and Roses | **Format:** Dual-Screen Speech-First Exploit Symphony

---

## 💻 1. Laptop Setup & Dual-Screen Layout (Before Judges Arrive)

### Screen Setup (Split Screen 50/50):
* **Left Half:** PowerShell Terminal in `c:\...\attack-cli` (The Attacker Console)
* **Right Half:** Chrome Browser on `http://localhost:5173` (The Target Enterprise Portal)

---

### Step-by-Step Laptop Startup:

#### Terminal 1: Start Frontend Web Portal
```powershell
cd c:\Users\DELL\Desktop\crimeathon-harbourstrikex\frontend
npm run dev
```
* Opens at `http://localhost:5173`
* Open tabs:
  1. `http://localhost:5173/ledgerone` (Click **Vendors** tab)
  2. `http://localhost:5173/helpdeskr`
  3. `http://localhost:5173/bluevault`
  4. `http://localhost:5173/tallybridge`
  5. `http://localhost:5173/dashboard`

#### Terminal 2: Prepare the Go Attack CLI
```powershell
cd c:\Users\DELL\Desktop\crimeathon-harbourstrikex\attack-cli

# If Go is not recognized in session, run:
$env:Path += ";C:\Program Files\Go\bin"

# Test build:
go build -o dist\hso.exe .
.\dist\hso.exe status
```

---

## ⚡ 2. The 30-Second Opening Hook
*(Say this with confident eye contact the moment judges walk up to your desk)*

> *"Good morning / afternoon, Judges.  
> We are Team **Guns and Roses**, presenting **Operation HARBORSTRIKE-X** on the Offense Track.  
> 
> Most teams in this hackathon will show you a basic script that modifies a bank account. But in a real enterprise, why didn't the firewall block it? Why didn't dual-manager approval stop it? Why did the security operations center miss it?  
> 
> Our project is a **weaponized offensive validation suite built in Go**. We reverse-engineered the exact structural blind spots of Case CR-26-047 to demonstrate:  
> 1. How a machine token silently bypassed Maker-Checker financial controls.  
> 2. How the attacker hid inside a 187-second clock-skew blind spot.  
> 3. How a decoy physical kiosk alarm was used to induce SOC alert fatigue.  
> 
> Let us walk you through the live intrusion step-by-step from our terminal, showing you the exact visual damage in the company's ERP at each level."*

---

## 🎯 3. Level-by-Level Attack & Speech Symphony

---

### 🟢 LEVEL 0: Architecture & Attack Surface
* 🗣️ **SPEECH:**  
  > *"Judges, Harbor & Finch Freight's logistics core connects three segregated cloud systems: LedgerOne for financial ERP, HelpDeskr for operations, and BlueVault for document storage, linked by TallyBridge Connect.  
  Conventional defenses protect human logins with passwords and MFA. But the adversary exploited the **machine integration seam**: persistent service tokens operating with zero human supervision."*
* 🎬 **TRIGGER:** *"Let us first query the target infrastructure to map the machine token exposure..."*
* ⌨️ **RUN COMMAND:**
  ```powershell
  .\dist\hso.exe status
  ```
* 👁️ **POINT AT SCREEN:**  
  Point to terminal HUD showing token `key-tb-07` active, mode `simulate`/`live`, and all target systems mapped.

---

### 🟢 LEVEL 1: Machine Identity Scoping (Phase 1)
* 🗣️ **SPEECH:**  
  > *"Our entry point is the compromised integration partner, TallyBridge Connect. IT issued a machine token called `key-tb-07` back in 2024. Notice the fatal configuration gap: it was granted wildcard read/write permissions across all financial modules, with zero IP allowlisting. It can be replayed from anywhere in the world."*
* 🎬 **TRIGGER:** *"Watch our Go CLI probe the LedgerOne schema to verify this token's permissions..."*
* ⌨️ **RUN COMMAND:**
  ```powershell
  .\dist\hso.exe recon
  ```
* 👁️ **POINT AT SCREEN:**  
  * **Terminal:** Highlight `Scope: *:* (Full Read/Write)` and `IP Restriction: NONE`.  
  * **Evidence Cited:** Evidence **`E01`** (LedgerOne API Log) & **`E04`** (Software Register).

---

### 🟢 LEVEL 2: Support Ticket Exfiltration & Leaked Key (Phase 2)
* 🗣️ **SPEECH:**  
  > *"Before touching the finance system, the attacker gathered operational intelligence. HelpDeskr's export endpoint lacked rate limiting. The attacker abused admin token `tb-sync-svc` to dump 10 bulk archives (`EXP-5410` to `EXP-5419`).  
  When our CLI scans the ticket conversations, we discover an IT hygiene disaster: an IT technician pasted private BlueVault storage key `bvk-7f3a` in plain text inside Ticket TKT-48213!"*
* 🎬 **TRIGGER:** *"Let us run our ticket harvester and extract the secret from Ticket TKT-48213..."*
* ⌨️ **RUN COMMAND:**
  ```powershell
  .\dist\hso.exe harvest
  ```
* 👁️ **POINT AT SCREEN:**  
  * **Terminal:** Shows harvested storage key **`bvk-7f3a`**.  
  * **Browser (`/helpdeskr`):** Point to Ticket `TKT-48213` and the export surcharge invoice (**Evidence `E02` & `E06`**).

---

### 🟢 LEVEL 3: Document Vault Exfiltration & Clock Skew (Phase 3)
* 🗣️ **SPEECH:**  
  > *"With the stolen `bvk-7f3a` key, the attacker accessed BlueVault—the document repository. They downloaded `vendor-bank-details-2026.xlsx`, a 3.46 MB master file with bank account numbers for all 9,840 active vendors.  
  Notice what our CLI flags: BlueVault's clock was unsynchronized, drifting **187 seconds fast**. The attacker noted this drift to slip past SIEM correlation rules."*
* 🎬 **TRIGGER:** *"Now watch our tool breach the document vault and download the master bank records..."*
* ⌨️ **RUN COMMAND:**
  ```powershell
  .\dist\hso.exe storage
  ```
* 👁️ **POINT AT SCREEN:**  
  * **Terminal:** Confirms download of the 3.46 MB file and flags the fast epoch drift.  
  * **Browser (`/bluevault`):** Point to `/Finance/Bank Instructions/` marked with a red **`COMPROMISED`** badge (**Evidence `E05`**).

---

### 🟢 LEVEL 4: Pinpointing the High-Value Target (Phase 4)
* 🗣️ **SPEECH:**  
  > *"A smart attacker doesn't tamper with hundreds of vendors—that triggers volume anomaly alerts. Instead, we query live ERP records to find the single most profitable invoice scheduled for immediate release.  
  Our CLI isolates **Coastal Packaging Ltd (`V-0412`)**: they have Invoice `INV-9081` for **₹2,48,000** scheduled for disbursement on September 8th."*
* 🎬 **TRIGGER:** *"Let us execute our vendor reconnaissance filter to isolate the primary victim..."*
* ⌨️ **RUN COMMAND:**
  ```powershell
  .\dist\hso.exe vendor-exfil
  ```
* 👁️ **POINT AT SCREEN:**  
  * **Terminal:** Highlights Vendor `V-0412`, original account `•••• 4417`, and the ₹2,48,000 payout.  
  * **Browser (`/ledgerone` ➔ Vendors Tab):** Point to Coastal Packaging's clean baseline state (**Evidence `E18`**).

---

### 🟢 LEVEL 5: Infiltrating the Trusted Private Link Tunnel (Phase 5)
* 🗣️ **SPEECH:**  
  > *"Amateurs attack from a public VPN and get blocked.  
  Real adversaries pivot through trusted infrastructure. The attacker compromised a rogue build runner (`tb-build-02` at `10.20.4.77`) inside the vendor's network. Because Harbor & Finch had a dedicated Private Link tunnel (`10.20.4.0/24`) with TallyBridge, network firewalls allowed this traffic through without inspection."*
* 🎬 **TRIGGER:** *"Watch our CLI simulate the lateral tunnel pivot across the Private Link..."*
* ⌨️ **RUN COMMAND:**
  ```powershell
  .\dist\hso.exe pivot
  ```
* 👁️ **POINT AT SCREEN:**  
  * **Terminal:** Confirms 22.2 MB transferred across 55 TCP 443 flows (`flow-seq-8812`).  
  * **Browser (`/tallybridge`):** Point to `tb-build-02` flagged in red as **`ROGUE HOST (Compromised)`** (**Evidence `E15`**).

---

### 🟢 LEVEL 6: The Decoy False-Flag (Phase 8 — Tactical Diversion)
* 🗣️ **SPEECH:**  
  > *"Judges, look at the timeline. At **01:39 UTC**—exactly 5 minutes *before* the financial attack—a login attempt was made on warehouse kiosk `dev-81546` using the credentials of **Rohan Menon**, a terminated employee whose account was never revoked.  
  Most teams think Rohan Menon was the hacker. That is the trap!  
  This was an **intentional decoy**. The physical alarm at the Chennai depot diverted 100% of the on-duty SOC analysts to the warehouse floor, completely blinding them to the Private Link tunnel."*
* 🎬 **TRIGGER:** *"Let us validate the decoy event to prove the diversion timeline..."*
* ⌨️ **RUN COMMAND:**
  ```powershell
  .\dist\hso.exe auth-test
  ```
* 👁️ **POINT AT SCREEN:**  
  Terminal displays the dual-timeline card: `01:39 Decoy Kiosk Alarm ➔ 01:40 SOC Distracted ➔ 01:44 True Attack Enters` (**Evidence `E03` & `E14`**).

---

### 🔴 LEVEL 7: THE CLIMAX — Silent Maker-Checker Bypass (Phase 6)
* 🗣️ **SPEECH:**  
  > *"Now, the climax of the attack.  
  Company policy mandates: 'Any bank change above ₹50,000 requires two separate manager approvals.'  
  How did we bypass it?  
  We weaponized a schema parameter flaw: when `key-tb-07` submits a PATCH request with **`approval_reference: ""` (blank)**, the ERP parser assumes it is an internal automated batch sync! It approves the change instantly with **zero alerts sent to finance managers**."*
* 🎬 **TRIGGER:** *"Watch our CLI fire the weaponized payload and look at the victim's ERP in real time..."*
* ⌨️ **RUN COMMAND:**
  ```powershell
  .\dist\hso.exe tamper
  ```
* 👁️ **POINT AT SCREEN (THE WOW MOMENT):**  
  1. **Look at Browser (`/ledgerone`):**  
     * Row `V-0412` instantly turns **bright crimson red** with badges **`FRAUD TARGET`** and **`TAMPERED`**!  
     * Account flips from `•••• 4417` to **`•••• 9083` (Mule Account)**.  
  2. **Click Change History (E19):** Point to row `chg-8b9888c39b` showing `Approval Reference` is **`BLANK (NaN)`**!

---

### 🔴 LEVEL 8: Confirming the Heist (Phase 7)
* 🗣️ **SPEECH:**  
  > *"With the bank account altered, the financial trap is sprung. All that remains is for the automated disbursement engine to execute the payment run on September 8th."*
* 🎬 **TRIGGER:** *"Let us verify if the core banking disbursement engine accepted the change..."*
* ⌨️ **RUN COMMAND:**
  ```powershell
  .\dist\hso.exe verify-run
  ```
* 👁️ **POINT AT SCREEN:**  
  In LedgerOne, click **Payment Schedule (08 Sep Run)**:  
  Point to the top row: **`Coastal Packaging Ltd (V-0412) · ₹2,48,000 · Destination: •••• 9083`** with badge **`PAYOUT ARMED`** (**Evidence `E09`**).

---

## 🌟 4. THE 3 SHOWSTOPPERS (The Winning WOW Factors)

---

### 🌟 WOW Factor 1: Exploit Evasion Deep-Dive
* 🗣️ **SPEECH:**  
  > *"Judges, to prove this is real adversary tradecraft and not just an API script, look at our Evasion Suite:  
  1. **Maker-Checker Bypass:** We exploited the blank parameter loophole to bypass Policy §4.3.  
  2. **Chronos Smuggling:** Because BlueVault was 187 seconds fast, the SIEM’s 60-second correlation window failed to bind the storage exfiltration to the API call.  
  3. **SOC Alert Fatigue:** We proved Rohan Menon was a deliberate decoy."*
* ⌨️ **RUN COMMAND:**
  ```powershell
  .\dist\hso.exe bypass --technique all
  ```
* 👁️ **POINT AT SCREEN:**  
  Terminal renders the side-by-side **Maker-Checker Exploit Card**, the **Clock Skew Matrix**, and the **SOC Decoy Timeline**.

---

### 🌟 WOW Factor 2: The Unseen-Data Stress Test (`hso weaponize`)
* 🗣️ **SPEECH:**  
  > *"In Tier 3, judges evaluate on unseen variations. Other teams hardcoded vendor `V-0412` and will crash.  
  Our tool is a dynamic weaponization engine. Judges, give us ANY vendor ID and ANY account right now, and watch our tool synthesize the exploit live."*
* ⌨️ **RUN COMMAND (Using vendor V-0108 as proof):**
  ```powershell
  .\dist\hso.exe weaponize --target V-0108 --account ICIC0000921-9999 --export-poc all
  ```
* 👁️ **POINT AT SCREEN:**  
  * Terminal dynamically crafts the raw payload and computes the SHA-256 digest.  
  * Open folder `dist/poc/`: Show newly generated standalone runnable files `exploit_V-0108.py` and `exploit_V-0108.sh`.

---

### 🌟 WOW Factor 3: The 1-Second Judging Deliverable (`hso proof-pack`)
* 🗣️ **SPEECH:**  
  > *"Finally, for Tier 3 grading, we don't submit disorganized screenshots or raw notes. With a single command, our tool compiles the official judging pack."*
* ⌨️ **RUN COMMAND:**
  ```powershell
  .\dist\hso.exe proof-pack
  ```
* 👁️ **POINT AT SCREEN:**  
  Terminal shows the 4 compiled deliverables in `dist/proof-pack/`:  
  * `EVIDENCE_CORRELATION_MATRIX.json` (100% join of E01–E20)  
  * `MITRE_ATTACK_NAVIGATOR.json` (Enterprise matrix layer)  
  * `FORENSIC_ACCURACY_SCORECARD.md` (Ground truth audit)  
  * `EXPLOIT_VERIFICATION_HASHES.sha256` (Cryptographic verification checksums)

---

## 🛑 5. The 15-Second Closing Statement
> *"Judges, the money was set to disappear on September 8th.  
> But because we exposed the exact architectural flaws, we give Harbor & Finch the exact remediations:  
> 1. Reject API calls with blank approval references.  
> 2. Bind machine tokens to mutual TLS and subnet allowlists.  
> 3. Enforce NTP synchronization across cloud storage.  
> 
> Thank you. We are Team **Guns and Roses**, and we welcome your questions."*

---

## 🛡️ 6. Quick Judge Q&A Cheat Sheet
* **Q: Who is Rohan Menon? Was he an insider threat?**  
  *A:* *"No, he was an intentional false-flag decoy. His login was at 01:39 UTC—exactly 5 minutes prior to the attack—to create physical alert fatigue in Chennai while the API attack slipped through via Private Link."*
* **Q: Why didn't Maker-Checker dual control block the bank update?**  
  *A:* *"Because `key-tb-07` passed `approval_reference: ""` (blank), and the ERP parser treated it as an internal automated batch sync, bypassing managerial sign-off."*
* **Q: Why did the SIEM miss the correlation between BlueVault and LedgerOne?**  
  *A:* *"Because BlueVault's server clock was drifting 187 seconds fast, placing the file download outside the SIEM's 60-second sliding correlation window."*
* **Q: What if our backend is not running or network fails?**  
  *A:* *"Our Go CLI runs in high-fidelity offline simulation mode by default with 0 network dependencies, and includes an auto-fallback feature that never crashes."*

---
*Generated for Team Guns and Roses | CRIMEATHON '26 Final Live Defense*
