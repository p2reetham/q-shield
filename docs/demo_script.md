# SIH Demo Script (≈5 minutes)

1. **Command Center** — show the live stat tiles, security score gauge, and
   threat distribution donut (initially near-empty on a fresh database).
2. **Signatures** — generate a key pair, sign a sample document, verify it
   (VALID), then re-run verify with tampered content to show INVALID /
   SUSPICIOUS.
3. **Threat Detection** — pick the "Key Compromise" scenario and run analysis;
   walk through the rule / ML / quantum-weighted score bars and the resulting
   CRITICAL classification.
4. **Quantum Engine** — run the optimizer live, point out the disclaimer text,
   and show the selected feature list changing between runs.
5. **Blockchain** — click through a few blocks, show the previous/current hash
   linkage, then click "Verify Blockchain Integrity."
6. **Command Center → Simulate Attack** — click the button once to show the
   full pipeline (event → features → ML → quantum → score → block → alert)
   updating the dashboard live, then jump to **Alerts** to show the generated
   alert with its recommended action.
7. Close on **Post-Quantum** to show forward-looking awareness of the
   classical-crypto risk this whole system currently relies on.
