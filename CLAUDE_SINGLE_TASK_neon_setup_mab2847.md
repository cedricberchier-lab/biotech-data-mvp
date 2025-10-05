# Claude — Single File Task: Create & Seed Neon Postgres for Multi‑Site Biotech Demo (mAb‑2847)

This file allows Claude in VS Code to build and seed a Neon Postgres database simulating multi‑site biotech manufacturing data.

**Systems covered:**
- DCS (DeltaV, Experion, PCS7)
- MES (Werum PAS-X)
- LIMS (LabWare)
- PI (OSIsoft PI)

**Sites:**
- Site A (STA): DeltaV + Experion + PAS-X
- Site B (STB): DeltaV + PCS7 + PAS-X
- Global LIMS shared across sites

**Product:** mAb-2847

---

## 1️⃣ Instructions

1. **Create Neon project**
   - Create a new Neon project in browser (Postgres 16+).
   - Copy your connection string like:
     ```bash
     postgres://user:password@host/db?sslmode=require
     ```

2. **In VS Code (Claude workspace)**  
   Set env var or create `.env`:
   ```bash
   export DATABASE_URL="postgres://user:password@host/db?sslmode=require"
   ```

3. **Run the SQL below**  
   Paste this block into a file `schema_and_seed_mab2847.sql` and run:
   ```bash
   psql "$DATABASE_URL" -f schema_and_seed_mab2847.sql
   ```

4. **Verify data**  
   ```sql
   SELECT table_name, COUNT(*) FROM information_schema.tables WHERE table_schema='public';
   ```

---

## 2️⃣ FULL SQL (Schema + Seed)

✅ **COMPLETED**: Full SQL schema and seed data has been created in `schema_and_seed_mab2847.sql`

The file includes:
- **9 Tables**: sites, equipment, dcs_data, mes_batch_records, mes_process_steps, lims_samples, lims_test_results, pi_calculated_data, material_genealogy
- **Sample Data**: Batch B-2024-0342 for mAb-2847 at Site A
- **Multi-Site Setup**: Site A (Boulder) and Site B (Singapore)
- **Realistic Data**: DCS time-series, LIMS test results, MES process steps, PI calculated values

See `SETUP_INSTRUCTIONS.md` for detailed setup guide.
