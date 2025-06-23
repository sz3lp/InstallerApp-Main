# Deploying Low Stock Alert Functions

This guide explains how to deploy the stored procedure `generate_inventory_alerts` and the Edge Function `check-thresholds.ts`.

## 1. Create the Stored Procedure

1. Log in to your Supabase project.
2. Open the SQL editor and run the SQL script that defines `generate_inventory_alerts`.
   - The procedure scans `inventory_levels` and inserts rows into `inventory_alerts` when quantities fall below `reorder_threshold`.
3. Verify the procedure exists under **Functions** in the dashboard.

## 2. Deploy the Edge Function

1. Ensure the Supabase CLI is installed and authenticated.
2. From the repository root, run:

   ```bash
   cd installer-app/api/inventory
   supabase functions deploy check-thresholds
   ```

   This uploads `check-thresholds.ts` as an Edge Function named `check-thresholds`.

3. Test the function locally with `supabase functions serve check-thresholds` if needed.

## 3. Schedule Regular Execution

Use the Supabase CLI to schedule the procedure so that alerts are generated automatically:

```bash
supabase cron schedule daily-inventory-alert --cron "0 0 * * *" --command "call generate_inventory_alerts();"
```

This example runs the RPC once per day at midnight. Scheduled jobs are visible under **Database → Scheduled Jobs** in the Supabase dashboard.

After the schedule is active, Supabase will call `generate_inventory_alerts` on the defined interval and populate the `inventory_alerts` table.
