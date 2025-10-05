# Database Setup Instructions

## Step 1: Create Neon Postgres Database

1. Go to [neon.tech](https://neon.tech) and sign up/login
2. Click "Create Project"
3. Name it: `mab2847-biotech-db`
4. Select region: `US East (Ohio)` or closest to you
5. Click "Create Project"

## Step 2: Get Connection String

1. In your Neon dashboard, go to your project
2. Click "Connection Details"
3. Copy the connection string (looks like):
   ```
   postgres://username:password@ep-cool-name-123456.us-east-2.aws.neon.tech/mab2847?sslmode=require
   ```

## Step 3: Set Environment Variable

### Option A: Using .env file (Recommended)
```bash
cp .env.example .env
# Edit .env and paste your connection string
```

### Option B: Export in terminal
```bash
export DATABASE_URL="postgres://username:password@host/db?sslmode=require"
```

## Step 4: Run Schema and Seed Script

```bash
psql "$DATABASE_URL" -f schema_and_seed_mab2847.sql
```

If you don't have `psql` installed:

### macOS:
```bash
brew install postgresql
```

### Ubuntu/Debian:
```bash
sudo apt-get install postgresql-client
```

### Windows:
Download from: https://www.postgresql.org/download/windows/

## Step 5: Verify Data

```bash
psql "$DATABASE_URL" -c "SELECT table_name, COUNT(*) FROM information_schema.tables WHERE table_schema='public' GROUP BY table_name;"
```

You should see 9 tables with data:
- sites (2 records)
- equipment (9 records)
- dcs_data (15 records)
- mes_batch_records (1 record)
- mes_process_steps (5 records)
- lims_samples (3 records)
- lims_test_results (8 records)
- pi_calculated_data (6 records)
- material_genealogy (6 records)

## Step 6: Install Postgres Client in Next.js

```bash
npm install @neondatabase/serverless
```

## Step 7: Test Connection

Create a test file `test-db.js`:

```javascript
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function testConnection() {
  const result = await sql`SELECT COUNT(*) FROM sites`;
  console.log('Sites count:', result[0].count);
}

testConnection();
```

Run:
```bash
node test-db.js
```

## Next Steps

Once the database is set up:
1. The app will connect to real data instead of mock generators
2. API routes will query live Neon database
3. MVP features can use actual multi-site manufacturing data

## Troubleshooting

### Connection refused
- Check if your IP is allowed in Neon (it should auto-allow)
- Verify the connection string is correct

### psql command not found
- Install PostgreSQL client (see Step 4)

### Permission denied
- Check database user has CREATE TABLE permissions
- Neon owner role should have all permissions by default
