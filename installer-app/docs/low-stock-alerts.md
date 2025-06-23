# Deploying Low Stock Alert Functions

This guide explains how to deploy the stored procedure `generate_low_stock_alerts` and the Edge Function `check-thresholds.ts`.

## 1. Create the Stored Procedure

1. Log in to your Supabase project.
2. Open the SQL editor and run the SQL script that defines `generate_low_stock_alerts`.
   - The procedure should scan installer inventory and insert rows into `inventory_alerts` when quantities fall below `reorder_threshold`.
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

Use the Supabase CLI to schedule the function so that alerts are generated automatically:

```bash
supabase functions schedule check-thresholds --cron "0 * * * *"
```

The above example runs the function every hour. Adjust the cron expression as required. Scheduled functions are visible under **Edge Functions → Schedules** in the Supabase dashboard.

After the schedule is active, Supabase will call the function at the defined interval, which triggers `generate_low_stock_alerts` in your database and populates the `inventory_alerts` table.
