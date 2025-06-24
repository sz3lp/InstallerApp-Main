-- This script contains SQL assertions to be run against the Supabase database
-- to verify data integrity and consistency after E2E tests or independently.

-- Assertion 1: invoice.status is 'paid' only if SUM(payments.amount) >= invoice.total_fees
-- This checks if the invoice status correctly reflects the payment state.
SELECT
    i.id AS invoice_id,
    i.invoice_total,
    COALESCE(SUM(p.amount), 0) AS total_paid,
    i.payment_status AS actual_status,
    CASE
        WHEN COALESCE(SUM(p.amount), 0) >= i.invoice_total THEN 'paid'
        ELSE 'unpaid'
    END AS expected_status
FROM
    invoices i
LEFT JOIN
    payments p ON i.id = p.invoice_id
GROUP BY
    i.id, i.invoice_total, i.payment_status
HAVING
    i.payment_status <> (
        CASE
            WHEN COALESCE(SUM(p.amount), 0) >= i.invoice_total THEN 'paid'
            ELSE 'unpaid'
        END
    );
-- Expected result: Empty set (no invoices found where actual status doesn't match expected based on payments)

-- Assertion 2: payments.invoice_id FK matches target invoice
-- This checks if all payments are correctly linked to a valid invoice.
SELECT
    p.id AS payment_id,
    p.invoice_id AS payment_linked_invoice_id
FROM
    payments p
WHERE
    NOT EXISTS (
        SELECT 1
        FROM invoices i
        WHERE i.id = p.invoice_id
    );
-- Expected result: Empty set (no payments found with invalid/non-existent invoice_id)

-- Assertion 3: quote.status is 'approved' before job spawn (conceptual)
-- This assumes a `jobs` table linked to `quotes` and `invoices`.
-- This assertion checks if any invoice/job was created from a quote that was not 'approved'.
SELECT
    q.id AS quote_id,
    q.status AS quote_status,
    j.id AS job_id,
    i.id AS invoice_id
FROM
    quotes q
LEFT JOIN
    jobs j ON q.id = j.quote_id
LEFT JOIN
    invoices i ON j.id = i.job_id
WHERE
    (j.id IS NOT NULL OR i.id IS NOT NULL) AND q.status <> 'approved';
-- Expected result: Empty set (no jobs or invoices created from non-approved quotes)

-- Assertion 4: No orphaned invoices (all have job_id and client_id)
-- This checks for invoices that might be missing critical linkage data.
SELECT
    id AS invoice_id,
    job_id,
    client_id
FROM
    invoices
WHERE
    job_id IS NULL OR client_id IS NULL;
-- Expected result: Empty set (all invoices are linked to a job and client)

-- Assertion 5: Check for duplicate payments for the same invoice/method/amount within a short timeframe
-- (Useful for catching idempotency issues or accidental double entries, but might need tuning)
SELECT
    invoice_id,
    amount,
    payment_method,
    COUNT(*) AS duplicate_count
FROM
    payments
GROUP BY
    invoice_id, amount, payment_method
HAVING
    COUNT(*) > 1 AND MAX(date) - MIN(date) < INTERVAL '5 minutes'; -- Adjust interval as needed
-- Expected result: Empty set (no suspicious duplicate payments)
