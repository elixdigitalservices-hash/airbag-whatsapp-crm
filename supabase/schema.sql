-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- LEADS
create table if not exists leads (
  id uuid primary key default uuid_generate_v4(),
  name text,
  phone text not null,
  email text,
  interest text,
  selected_service_id uuid,
  selected_pack text,
  status text not null default 'new',
  payment_status text not null default 'unpaid',
  stripe_customer_id text,
  last_message text,
  summary text,
  source text not null default 'whatsapp',
  requires_human boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- MESSAGES
create table if not exists messages (
  id uuid primary key default uuid_generate_v4(),
  lead_id uuid not null references leads(id) on delete cascade,
  direction text not null check (direction in ('inbound', 'outbound')),
  sender_type text not null check (sender_type in ('user', 'bot', 'human')),
  content text not null,
  whatsapp_message_id text,
  created_at timestamptz not null default now()
);

-- SERVICES
create table if not exists services (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  category text,
  price numeric,
  short_description text,
  includes jsonb,
  extras jsonb,
  payment_link text,
  active boolean not null default true,
  sort_order integer not null default 0,
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- PROMOTIONS
create table if not exists promotions (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  bot_text text,
  active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  service_ids jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- PAYMENTS
create table if not exists payments (
  id uuid primary key default uuid_generate_v4(),
  lead_id uuid references leads(id) on delete set null,
  stripe_payment_id text,
  stripe_checkout_session_id text,
  stripe_customer_id text,
  customer_name text,
  customer_email text,
  customer_phone text,
  product_name text,
  service_id uuid references services(id) on delete set null,
  amount numeric,
  currency text not null default 'eur',
  status text not null default 'unknown',
  paid_at timestamptz,
  raw_payload jsonb,
  created_at timestamptz not null default now()
);

-- SETTINGS
create table if not exists settings (
  id uuid primary key default uuid_generate_v4(),
  key text unique not null,
  value jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- INTERNAL NOTES
create table if not exists internal_notes (
  id uuid primary key default uuid_generate_v4(),
  lead_id uuid not null references leads(id) on delete cascade,
  note text not null,
  created_at timestamptz not null default now()
);

-- INDEXES
create index if not exists leads_phone_idx on leads(phone);
create index if not exists leads_status_idx on leads(status);
create index if not exists leads_requires_human_idx on leads(requires_human);
create index if not exists messages_lead_id_idx on messages(lead_id);
create index if not exists payments_lead_id_idx on payments(lead_id);
create index if not exists payments_stripe_payment_id_idx on payments(stripe_payment_id);

-- AUTO-UPDATE updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger leads_updated_at before update on leads
  for each row execute function update_updated_at();

create trigger services_updated_at before update on services
  for each row execute function update_updated_at();

create trigger promotions_updated_at before update on promotions
  for each row execute function update_updated_at();

create trigger settings_updated_at before update on settings
  for each row execute function update_updated_at();

-- SEED: Servicios iniciales de Autoescuela Airbag
insert into services (name, category, price, short_description, includes, extras, payment_link, sort_order) values
(
  'Carnet B — Pack 90 €',
  'coche',
  90,
  'Pack básico carnet de coche',
  '["Matrícula", "Curso teórico completo", "Libro oficial", "Test en aula ilimitados", "Test online durante 1 mes", "Placa L"]',
  '[]',
  'https://buy.stripe.com/fZueVcaDf80vb7DeL83Je08',
  1
),
(
  'Carnet B — Pack 295 €',
  'coche',
  295,
  'Pack completo carnet de coche con prácticas y tasas incluidas',
  '["Matrícula", "Curso teórico completo", "Libro oficial", "Test en aula ilimitados", "Test online durante 3 meses", "Placa L", "Tasas oficiales de Tráfico incluidas", "4 clases prácticas de 40 minutos"]',
  '[]',
  'https://buy.stripe.com/dRm00idPr1C7fnT9qO3Je07',
  2
),
(
  'Moto A1/A2 — 220 €',
  'moto',
  220,
  'Pack moto A1/A2 con prácticas en pista',
  '["Tasas de tráfico", "Matrícula", "Libro y test en aula", "3 clases prácticas en pista de 30 minutos", "Test online durante 1 mes"]',
  '[{"name": "Clase pista 30 min", "price": 20}, {"name": "Clase circulación 60 min", "price": 60}, {"name": "Examen pista", "price": 35}, {"name": "Examen circulación", "price": 50}]',
  'https://buy.stripe.com/5kQ7sKcLncgLa3z7iG3Je04',
  3
),
(
  'Moto A — 350 €',
  'moto',
  350,
  'Pack moto A con intensivo teórico y prácticas completas',
  '["Matrícula / alta en la autoescuela", "Gestión inicial del expediente", "Curso teórico intensivo de 3 horas", "2 horas de clases de pista", "4 horas de clases de circulación", "Tasas de Tráfico: 30 € pago único"]',
  '[]',
  'https://buy.stripe.com/8x2dR85iV4OjejP6eC3Je05',
  4
);

-- SEED: Settings iniciales
insert into settings (key, value) values
('school_name', '"Autoescuela Airbag"'),
('school_phone', '"955 542 232"'),
('school_email', '"info@aeairbag.com"'),
('school_address', '"C. Navarro Caro, Tomares, Sevilla"'),
('school_hours', '"10:00 a 13:00 y 17:00 a 20:00"'),
('school_web', '"https://aeairbag.com"'),
('chatbot_active', 'true'),
('welcome_message', '"¡Hola! Soy el asistente de Autoescuela Airbag 🚗🏍️\n\nTe ayudo a consultar precios, elegir carnet, resolver dudas y reservar tu plaza.\n\n¿Qué necesitas?\n\n1. Carnet de coche B\n2. Carnet moto A1/A2\n3. Carnet moto A\n4. Test online\n5. Plazos y documentación\n6. Hablar con la autoescuela"'),
('handoff_message', '"Para esto es mejor que te atienda directamente el equipo de Autoescuela Airbag, así te dan una respuesta exacta.\n\n📞 Teléfono: 955 542 232\n✉️ Email: info@aeairbag.com\n📍 Dirección: C. Navarro Caro, Tomares, Sevilla\n🕒 Horario: 10:00 a 13:00 y 17:00 a 20:00"')
on conflict (key) do nothing;
