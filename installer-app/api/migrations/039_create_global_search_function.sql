CREATE OR REPLACE FUNCTION global_search_entities(search_term text)
RETURNS TABLE(id uuid, label text, entity_type text)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT l.id, l.clinic_name AS label, 'lead' AS entity_type
  FROM leads l
  WHERE l.clinic_name ILIKE '%' || search_term || '%'
     OR l.contact_name ILIKE '%' || search_term || '%'
     OR l.contact_phone ILIKE '%' || search_term || '%'

  UNION ALL

  SELECT c.id, c.name AS label, 'client' AS entity_type
  FROM clients c
  WHERE c.name ILIKE '%' || search_term || '%'
     OR c.contact_name ILIKE '%' || search_term || '%'
     OR c.email ILIKE '%' || search_term || '%'

  UNION ALL

  SELECT j.id, CONCAT('Job #', j.job_number, ' - ', c.name) AS label, 'job' AS entity_type
  FROM jobs j
  JOIN clients c ON j.client_id = c.id
  WHERE j.address ILIKE '%' || search_term || '%'
     OR j.description ILIKE '%' || search_term || '%'
     OR c.name ILIKE '%' || search_term || '%'

  UNION ALL

  SELECT i.id,
    CONCAT('Invoice #', i.invoice_number, ' - ', c.name, ' ($', i.invoice_total, ')') AS label,
    'invoice' AS entity_type
  FROM invoices i
  JOIN clients c ON i.client_id = c.id
  WHERE i.invoice_number::text ILIKE '%' || search_term || '%'
     OR c.name ILIKE '%' || search_term || '%';
END;
$$;
