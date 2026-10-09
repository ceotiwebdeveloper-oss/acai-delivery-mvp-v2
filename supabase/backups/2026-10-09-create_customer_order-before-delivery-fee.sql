-- BACKUP do estado anterior da função create_customer_order.
-- Restaurar este arquivo no SQL Editor do Supabase reverte a função para a versão anterior.
CREATE OR REPLACE FUNCTION public.create_customer_order(p_store_slug text, p_customer_name text, p_customer_phone text, p_delivery_type text, p_address text, p_address_number text, p_complement text, p_payment_method text, p_notes text, p_items jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_store_id uuid;
  v_order_id uuid;
  v_item jsonb;
  v_product record;
  v_quantity integer;
  v_selected_ids uuid[];
  v_selected_options jsonb;
  v_unit_price numeric;
  v_subtotal numeric := 0;
begin
  if nullif(trim(p_customer_name), '') is null or nullif(trim(p_customer_phone), '') is null then
    raise exception 'Nome e telefone são obrigatórios';
  end if;
  if p_delivery_type not in ('delivery', 'pickup') then
    raise exception 'Tipo de entrega inválido';
  end if;
  if p_delivery_type = 'delivery' and (nullif(trim(p_address), '') is null or nullif(trim(p_address_number), '') is null) then
    raise exception 'Endereço e número são obrigatórios para entrega';
  end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'O pedido precisa conter pelo menos um item';
  end if;

  select id into v_store_id from public.stores where slug = p_store_slug and is_open = true;
  if v_store_id is null then raise exception 'Loja não encontrada ou fechada'; end if;

  insert into public.orders (
    store_id, customer_name, customer_phone, delivery_type, address, address_number,
    complement, payment_method, notes, subtotal, delivery_fee, total, status
  ) values (
    v_store_id, trim(p_customer_name), trim(p_customer_phone), p_delivery_type,
    case when p_delivery_type = 'delivery' then trim(p_address) else null end,
    case when p_delivery_type = 'delivery' then trim(p_address_number) else null end,
    case when p_delivery_type = 'delivery' then nullif(trim(p_complement), '') else null end,
    p_payment_method, nullif(trim(p_notes), ''), 0, 0, 0, 'pending'
  ) returning id into v_order_id;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_quantity := (v_item->>'quantity')::integer;
    if v_quantity is null or v_quantity < 1 or v_quantity > 99 then
      raise exception 'Quantidade inválida';
    end if;

    select id, name, price into v_product
    from public.products
    where id = (v_item->>'product_id')::uuid
      and store_id = v_store_id and is_available = true;
    if v_product.id is null then raise exception 'Produto inválido ou indisponível'; end if;

    select coalesce(array_agg(x::uuid), array[]::uuid[]) into v_selected_ids
    from jsonb_array_elements_text(coalesce(v_item->'selected_option_ids', '[]'::jsonb)) x;

    if exists (
      select 1 from public.option_groups g
      where g.store_id = v_store_id
        and exists (
          select 1 from public.options o
          where o.option_group_id = g.id and o.is_available = true
        )
        and (coalesce(g.required, false) or coalesce(g.min_options, 0) > 0)
        and (
          select count(*) from public.options o
          where o.option_group_id = g.id and o.id = any(v_selected_ids) and o.is_available = true
        ) < greatest(coalesce(g.min_options, 0), case when coalesce(g.required, false) then 1 else 0 end)
        and exists (
          select 1 from public.options o
          where o.option_group_id = g.id and o.id = any(v_selected_ids) and o.is_available = true
        ) = false
    ) then raise exception 'Selecione as opções obrigatórias'; end if;

    if exists (
      select 1 from public.options o
      join public.option_groups g on g.id = o.option_group_id
      where o.id = any(v_selected_ids) and (g.store_id <> v_store_id or o.is_available = false)
    ) then raise exception 'Opção inválida ou indisponível'; end if;

    select coalesce(sum(o.price), 0),
           coalesce(jsonb_agg(jsonb_build_object('id', o.id, 'name', o.name, 'price', coalesce(o.price,0))), '[]'::jsonb)
      into v_unit_price, v_selected_options
    from public.options o where o.id = any(v_selected_ids);

    v_unit_price := coalesce(v_product.price, 0) + coalesce(v_unit_price, 0);

    insert into public.order_items (
      order_id, product_id, product_name, quantity, unit_price, total, selected_options
    ) values (
      v_order_id, v_product.id, v_product.name, v_quantity, v_unit_price,
      v_unit_price * v_quantity, v_selected_options
    );
    v_subtotal := v_subtotal + v_unit_price * v_quantity;
  end loop;

  update public.orders set subtotal = v_subtotal, total = v_subtotal where id = v_order_id;
  return v_order_id;
end;
$function$;
