# HarborStrike Offensive Attack Simulator & Exploit Engine
**CRIMEATHON '26 | Case File CR-26-047 (Harbor & Finch Freight Pvt. Ltd.)**  
**Track:** OFFENSE (Controlled Attack Simulation & Footprint Verification)

---

## 1. Offensive Mission Overview
The objective of this offensive tool is to simulate and measure the weaponized exploitation of supply-chain vulnerabilities identified in Case CR-26-047:
- **Target Organization:** Harbor & Finch Freight Pvt. Ltd. (Chennai, Coimbatore, Madurai depots)
- **Primary Weaponized Vector:** Silent Vendor Master Bank Detail Redirection
- **High-Value Target:** Coastal Packaging Ltd (`V-0412`), Invoice `INV-9081`, amount **₹2,48,000**
- **Disbursement Deadline:** 08 September 2026

---

## 2. Weaponized Attack Vectors
1. **`VEC-01` (Financial Redirection):** Stealth `PATCH` to `/api/v2/vendors/V-0412/bank-details` with empty `approval_reference` via compromised machine token `key-tb-07` from rogue build runner `10.20.4.77`.
2. **`VEC-02` (Bulk Support Exfiltration):** Cloud export endpoint abuse on HelpDeskr (`POST /api/v1/exports`) harvesting 10 bulk jobs (`EXP-5410`–`EXP-5419`) via admin token `tb-sync-svc`.
3. **`VEC-03` (Document Vault Exfiltration):** Harvesting `vendor-bank-details-2026.xlsx` (3.46 MB) from BlueVault via leaked key `bvk-7f3a`.
4. **`VEC-04` (Tunnel Pivot):** Lateral pivot through vendor Private Link tunnel (`10.20.4.0/24`) transferring 22.2 MB.

---

## 3. CLI Execution Commands

### Execute All Attack Vectors & Verify Footprints
```bash
python harborstrike_attack.py --run-all
```

### Run an Individual Exploit Vector (1 to 4)
```bash
python harborstrike_attack.py --vector 1
```

### Verify Attack Footprints Against Target Evidence Logs
```bash
python harborstrike_attack.py --verify
```

### Export Results as JSON
```bash
python harborstrike_attack.py --json
```

---

## 4. Footprint Accuracy Matrix (100% Match)

| Vector | Executed Action | Target Evidence Log | Generated Footprint ID | Trace Status |
| :--- | :--- | :--- | :--- | :--- |
| **VEC-01** | `PATCH /api/v2/vendors/V-0412/bank-details` | E18 (API Log) / E19 (Change Log) | `req-5f61b0de8` · `chg-8b9888c39b` | Verified (200 OK) |
| **VEC-02** | `POST /api/v1/exports` | E02 (Audit Log) / E06 (Billing) | `EXP-5419` (`evt-3fe76f60c4`) | Verified (Delete Timeout) |
| **VEC-03** | `GET /files/.../vendor-bank-details-2026.xlsx` | E05 (BlueVault Log) | `bv-edb0081dad` (3.46 MB) | Verified (Epoch Drift) |
| **VEC-04** | `TCP 443 /api/v2/queries` | E15 (Private Link Flow Log) | `flow-seq-8812` (22.2 MB) | Verified (Established) |
