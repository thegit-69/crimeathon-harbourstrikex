# 🏆 The Ultimate Master Judge Interview & Live Attack Script
### Operation HARBORSTRIKE-X | Case File: `CR-26-047` (Harbor & Finch Freight)
**Team:** Guns and Roses | **Track:** OFFENSE

---

## 💡 MODULE 1: The Plain-English Story
*(Understand this first so you can speak naturally without memorizing robotic text)*

### The Simple Story:
Imagine a freight logistics company (**Harbor & Finch Freight**). They pay millions of rupees every week to trucking and packaging vendors. To pay them automatically, their accounting system (**LedgerOne**) connects to an IT integration partner (**TallyBridge Connect**).

1. **The Leak:** An attacker compromised the integration partner. They stole an automated machine API key called **`key-tb-07`**.
2. **The Recon:** The attacker logged into their support portal (**HelpDeskr**) and found a cloud storage password (**`bvk-7f3a`**) pasted in plain text in an old ticket!
3. **The Target Selection:** With that password, they downloaded an Excel sheet with all 9,840 vendor bank accounts from **BlueVault**. They picked their victim: **Coastal Packaging Ltd (`V-0412`)**, who had a huge pending payout of **₹2,48,000** on September 8th.
4. **The Heist (The Climax):** The company had a rule: *"Any bank change needs two managers to approve."*  
   **How did the attacker bypass it?** They sent an automated API request leaving the `approval_reference` field completely **BLANK**. The flawed backend code assumed: *"Hey, this is from our trusted machine key key-tb-07 with a blank reference—it must be an automated internal sync!"* It approved it instantly with **zero alerts to managers**.
5. **The Decoy:** To make sure nobody noticed, 5 minutes earlier the attacker triggered a fake login on a warehouse floor kiosk using a fired employee's name (**Rohan Menon**). The security guards and SOC analysts panicked and ran to the warehouse floor to check the kiosk, while the real digital robbery happened silently across a private tunnel!

---

## ⚡ MODULE 2: The 30-Second Opening Hook
*(Use this the moment the judges walk up to your desk and say: "Tell us about your project")*

> *"Good morning / afternoon, Judges.  
> We are Team **Guns and Roses**, presenting **Operation HARBORSTRIKE-X** on the Offense Track.  
> 
> Most teams in this hackathon will show you a basic script that changes a bank account. But in a real enterprise, why didn't the firewall block it? Why didn't dual-manager approval stop it? Why did the security operations center miss it?  
> 
> Our project is a **weaponized offensive validation suite built in Go**. We reverse-engineered the exact structural blind spots of Case CR-26-047 to demonstrate:  
> 1. How a machine token silently bypassed Maker-Checker financial controls.  
> 2. How the attacker hid inside a 187-second clock-skew blind spot.  
> 3. How a decoy physical kiosk alarm was used to induce SOC alert fatigue.  
> 
> Let us walk you through the live intrusion step-by-step from our terminal, showing you the exact visual damage in the company's ERP at each level."*

---

## 🎯 MODULE 3: The Complete Phase-by-Phase Live Attack & Speech Symphony
*(Keep PowerShell open on the Left side of your screen and the Browser on the Right side)*

---

### LEVEL 0: System Readiness & Infrastructure Overview
* 🗣️ **WHAT YOU SAY:**  
  > *"Judges, let us begin by mapping Harbor & Finch Freight's integration perimeter. Their infrastructure ties together three cloud services: LedgerOne for financial ERP, HelpDeskr for customer support, and BlueVault for document storage, all linked by TallyBridge Connect. Let us check system readiness."*
* ⌨️ **RUN COMMAND:**
  ```powershell
  .\dist\hso.exe status
  ```
* 👁️ **POINT AT SCREEN:**  
  Point to the terminal HUD showing token `key-tb-07` active, mode `simulate`/`live`, and all target systems mapped.

---

### LEVEL 1: Machine Identity Scoping (Phase 1)
* 🗣️ **WHAT YOU SAY:**  
  > *"Our entry point is the compromised integration partner, TallyBridge Connect. IT issued a machine token called `key-tb-07` back in 2024. But notice the fatal configuration gap: it was granted wildcard read/write permissions across all financial modules, with zero IP allowlisting. It can be replayed from anywhere in the world."*
* 🎬 **ACTION TRIGGER:** *"Watch our Go CLI probe the LedgerOne schema to verify this token's permissions..."*
* ⌨️ **RUN COMMAND:**
  ```powershell
  .\dist\hso.exe recon
  ```
* 👁️ **POINT AT SCREEN:**  
  * **Terminal:** Highlight `Scope: *:* (Full Read/Write)` and `IP Restriction: NONE`.  
  * **Evidence Cited:** Evidence **`E01`** (LedgerOne API Log) & **`E04`** (Software Register).

---

### LEVEL 2: Support Ticket Exfiltration & Leaked Key (Phase 2)
* 🗣️ **WHAT YOU SAY:**  
  > *"Before touching the finance system, the attacker gathered operational intelligence. HelpDeskr's export endpoint lacked rate limiting. The attacker abused admin token `tb-sync-svc` to dump 10 bulk archives (`EXP-5410` to `EXP-5419`).  
  When our CLI scans the ticket conversations, we discover an IT hygiene disaster: an IT technician pasted the private BlueVault storage key `bvk-7f3a` in plain text inside Ticket TKT-48213!"*
* 🎬 **ACTION TRIGGER:** *"Let us run our ticket harvester and extract the secret from Ticket TKT-48213..."*
* ⌨️ **RUN COMMAND:**
  ```powershell
  .\dist\hso.exe harvest
  ```
* 👁️ **POINT AT SCREEN:**  
  * **Terminal:** Shows harvested storage key **`bvk-7f3a`**.  
  * **Browser (`/helpdeskr`):** Point to Ticket `TKT-48213` and the export surcharge invoice (**Evidence `E02` & `E06`**).

---

### LEVEL 3: Document Vault Exfiltration & The Clock Skew Discovery (Phase 3)
* 🗣️ **WHAT YOU SAY:**  
  > *"With the stolen `bvk-7f3a` key, the attacker accessed BlueVault—the document repository. They downloaded `vendor-bank-details-2026.xlsx`, a 3.46 MB master file with bank account numbers for all 9,840 active vendors.  
  Notice what our CLI flags: BlueVault's clock was unsynchronized, drifting **187 seconds fast**. The attacker noted this drift to slip past SIEM correlation rules."*
* 🎬 **ACTION TRIGGER:** *"Now watch our tool breach the document vault and download the master bank records..."*
* ⌨️ **RUN COMMAND:**
  ```powershell
  .\dist\hso.exe storage
  ```
* 👁️ **POINT AT SCREEN:**  
  * **Terminal:** Confirms download of the 3.46 MB file and flags the fast epoch drift.  
  * **Browser (`/bluevault`):** Point to `/Finance/Bank Instructions/` marked with a red **`COMPROMISED`** badge (**Evidence `E05`**).

---

### LEVEL 4: Pinpointing the High-Value Target (Phase 4)
* 🗣️ **WHAT YOU SAY:**  
  > *"A smart attacker doesn't tamper with hundreds of vendors—that triggers volume anomaly alerts. Instead, we query live ERP records to find the single most profitable invoice scheduled for immediate release.  
  Our CLI isolates **Coastal Packaging Ltd (`V-0412`)**: they have Invoice `INV-9081` for **₹2,48,000** scheduled for disbursement on September 8th."*
* 🎬 **ACTION TRIGGER:** *"Let us execute our vendor reconnaissance filter to isolate the primary victim..."*
* ⌨️ **RUN COMMAND:**
  ```powershell
  .\dist\hso.exe vendor-exfil
  ```
* 👁️ **POINT AT SCREEN:**  
  * **Terminal:** Highlights Vendor `V-0412`, original account `•••• 4417`, and the ₹2,48,000 payout.  
  * **Browser (`/ledgerone` ➔ Vendors Tab):** Point to Coastal Packaging's clean baseline state (**Evidence `E18`**).

---

### LEVEL 5: Infiltrating the Trusted Private Link Tunnel (Phase 5)
* 🗣️ **WHAT YOU SAY:**  
  > *"An amateur attacker attacks from the public internet and gets blocked.  
  Real adversaries pivot through trusted infrastructure. The attacker compromised a rogue build runner (`tb-build-02` at `10.20.4.77`) inside the vendor's network. Because Harbor & Finch had a dedicated Private Link tunnel (`10.20.4.0/24`) with TallyBridge, network firewalls allowed this traffic through without inspection."*
* 🎬 **ACTION TRIGGER:** *"Watch our CLI simulate the lateral tunnel pivot across the Private Link..."*
* ⌨️ **RUN COMMAND:**
  ```powershell
  .\dist\hso.exe pivot
  ```
* 👁️ **POINT AT SCREEN:**  
  * **Terminal:** Confirms 22.2 MB transferred across 55 TCP 443 flows (`flow-seq-8812`).  
  * **Browser (`/tallybridge`):** Point to `tb-build-02` flagged in red as **`ROGUE HOST (Compromised)`** (**Evidence `E15`**).

---

### LEVEL 6: The Decoy False-Flag (Phase 8 — Tactical Diversion)
* 🗣️ **WHAT YOU SAY:**  
  > *"Judges, look at the timeline. At **01:39 UTC**—exactly 5 minutes *before* the financial attack—a login attempt was made on warehouse kiosk `dev-81546` using the credentials of **Rohan Menon**, a terminated employee whose account was never revoked.  
  Most teams think Rohan Menon was the hacker. That is the trap!  
  This was an **intentional decoy**. The physical alarm at the Chennai depot diverted 100% of the on-duty SOC analysts to the warehouse floor, completely blinding them to the Private Link tunnel."*
* 🎬 **ACTION TRIGGER:** *"Let us validate the decoy event to prove the diversion timeline..."*
* ⌨️ **RUN COMMAND:**
  ```powershell
  .\dist\hso.exe auth-test
  ```
* 👁️ **POINT AT SCREEN:**  
  Terminal displays the dual-timeline card: `01:39 Decoy Kiosk Alarm ➔ 01:40 SOC Distracted ➔ 01:44 True Attack Enters` (**Evidence `E03` & `E14`**).

---

### 🔴 LEVEL 7: THE CLIMAX — Silent Maker-Checker Bypass (Phase 6)
* 🗣️ **WHAT YOU SAY:**  
  > *"Now, the climax of the attack.  
  Company policy mandates: 'Any bank change above ₹50,000 requires two separate manager approvals.'  
  How did we bypass it?  
  We weaponized a schema parameter flaw: when `key-tb-07` submits a PATCH request with **`approval_reference: ""` (blank)**, the ERP parser assumes it is an internal automated batch sync! It approves the change instantly with **zero alerts sent to finance managers**."*
* 🎬 **ACTION TRIGGER:** *"Watch our CLI fire the weaponized payload and look at the victim's ERP in real time..."*
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
* 🗣️ **WHAT YOU SAY:**  
  > *"With the bank account altered, the financial trap is sprung. All that remains is for the automated disbursement engine to execute the payment run on September 8th."*
* 🎬 **ACTION TRIGGER:** *"Let us verify if the core banking disbursement engine accepted the change..."*
* ⌨️ **RUN COMMAND:**
  ```powershell
  .\dist\hso.exe verify-run
  ```
* 👁️ **POINT AT SCREEN:**  
  In LedgerOne, click **Payment Schedule (08 Sep Run)**:  
  Point to the top row: **`Coastal Packaging Ltd (V-0412) · ₹2,48,000 · Destination: •••• 9083`** with badge **`PAYOUT ARMED`** (**Evidence `E09`**).

---

## 🌟 LEVEL 9: THE 3 WOW FACTORS (The Showstoppers)

---

### 🌟 WOW Factor 1: Exploit Evasion Deep-Dive
* 🗣️ **WHAT YOU SAY:**  
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
* 🗣️ **WHAT YOU SAY:**  
  > *"In Tier 3, judges evaluate on unseen variations. Other teams hardcoded vendor `V-0412` and will crash.  
  Our tool is a dynamic weaponization engine. Judges, give us ANY vendor ID and ANY account right now, and watch our tool synthesize the exploit live."*
* ⌨️ **RUN COMMAND (Using vendor V-0108 as proof):**
  ```powershell
  .\dist\hso.exe weaponize --target V-0108 --account ICIC0000921-9999 --export-poc all
  ```
* 👁️ **POINT AT SCREEN:**  
  * Terminal dynamically crafts the raw payload and computes the SHA-256 digest.  
  * Shows newly generated standalone runnable files in `dist/poc/`: `exploit_V-0108.py` and `exploit_V-0108.sh`.

---

### 🌟 WOW Factor 3: The 1-Second Judging Deliverable (`hso proof-pack`)
* 🗣️ **WHAT YOU SAY:**  
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
  * `EXPLOIT_VERIFICATION_HASHES.sha256` (Cryptographic verification digests)

---

## 🛑 THE 15-SECOND CLOSING STATEMENT
> *"Judges, the money was set to disappear on September 8th.  
> But because we exposed the exact architectural flaws, we give Harbor & Finch the exact remediations:  
> 1. Reject API calls with blank approval references.  
> 2. Bind machine tokens to mutual TLS and subnet allowlists.  
> 3. Enforce NTP synchronization across cloud storage.  
> 
> Thank you. We are Team **Guns and Roses**, and we welcome your questions."*

---

## 🛡️ Quick Q&A Reference (Keep in Mind)
* **If they ask about Rohan Menon:** *"He was an intentional decoy to distract the SOC 5 minutes before the real attack."*
* **If they ask why Maker-Checker failed:** *"Because `key-tb-07` sent `approval_reference: ""` (blank), and the ERP parser treated it as an internal automated sync."*
* **If they ask why the SIEM missed it:** *"Because BlueVault's clock was drifting 187 seconds fast, breaking the SIEM's 60-second sliding correlation window."*
* **If they ask what happens if backend is down:** *"Our Go CLI runs in high-fidelity offline simulation mode by default with 0 network dependencies, and includes an auto-fallback feature that never crashes."*

---
*Created for Team Guns and Roses | CRIMEATHON '26 Live Defense*
