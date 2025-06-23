-- Add input validation to initiate_payment RPC
create or replace function initiate_payment(
  p_invoice_id uuid,
  p_amount numeric
)
returns text
language plpgsql
security definer
as $$
declare
  v_invoice_exists boolean;
  v_stripe_session_id text;
begin
  -- Input Validation: ensure invoice exists
  select exists(select 1 from public.invoices where id = p_invoice_id)
    into v_invoice_exists;
  if not v_invoice_exists then
    raise exception 'Payment initiation failed: Invoice ID % does not exist.', p_invoice_id;
  end if;

  -- Input Validation: ensure amount is positive
  if p_amount <= 0 then
    raise exception 'Payment initiation failed: Amount must be greater than zero. Received %', p_amount;
  end if;

  -- Log attempt
  raise notice 'Attempting to initiate payment for Invoice ID: %, Amount: %', p_invoice_id, p_amount;

  -- Return mock Stripe session ID
  v_stripe_session_id := 'cs_mock_' || replace(p_invoice_id::text, '-', '');
  return v_stripe_session_id;
end;
$$;

grant execute on function initiate_payment(uuid, numeric) to authenticated;
