create or replace function decrement_inventory(
  installer_id_input uuid,
  material_id_input uuid,
  amount int
) returns void as $$
begin
  update installer_inventory
  set quantity = quantity - amount
  where installer_id = installer_id_input
    and material_id = material_id_input;
end;
$$ language plpgsql;
