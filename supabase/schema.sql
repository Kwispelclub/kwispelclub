-- =============================================
-- KWISPELCLUB — Supabase Database Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. PROFILES (extends Supabase auth.users)
-- =============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'koper' CHECK (role IN ('koper', 'verkoper', 'kapsalon', 'trainer', 'admin')),
  location TEXT,
  verified BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'actief' CHECK (status IN ('actief', 'in_review', 'geblokkeerd')),
  -- Verkoper specific
  company_name TEXT,
  vat_number TEXT,
  -- Settings
  email_notifications BOOLEAN DEFAULT TRUE,
  newsletter BOOLEAN DEFAULT TRUE,
  vaccination_reminders BOOLEAN DEFAULT TRUE,
  profile_visible BOOLEAN DEFAULT TRUE,
  show_location BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, first_name, last_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================
-- 2. PETS (huisdierprofielen)
-- =============================================
CREATE TABLE pets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  species TEXT NOT NULL CHECK (species IN ('hond', 'kat', 'konijn', 'overig')),
  breed TEXT,
  age_years INTEGER,
  weight_kg DECIMAL(5,1),
  gender TEXT CHECK (gender IN ('reu', 'teef', 'kater', 'poes', 'onbekend')),
  chipped BOOLEAN DEFAULT FALSE,
  chip_number TEXT,
  allergies TEXT,
  notes TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 3. VACCINATIONS
-- =============================================
CREATE TABLE vaccinations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  vet_name TEXT,
  status TEXT DEFAULT 'done' CHECK (status IN ('done', 'upcoming', 'missed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 4. PRODUCT CATEGORIES
-- =============================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO categories (name, slug, icon, sort_order) VALUES
  ('Voeding', 'voeding', '🦴', 1),
  ('Speelgoed', 'speelgoed', '🧶', 2),
  ('Accessoires', 'accessoires', '🐕', 3),
  ('Verzorging', 'verzorging', '🛁', 4),
  ('Transport & Reizen', 'transport', '🚗', 5),
  ('Benches & Manden', 'benches-manden', '🏠', 6);

-- =============================================
-- 5. PRODUCTS
-- =============================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  brand TEXT,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  category_id UUID REFERENCES categories(id),
  image_url TEXT,
  images TEXT[], -- array of image URLs
  stock INTEGER DEFAULT 0,
  status TEXT DEFAULT 'demo' CHECK (status IN ('demo', 'actief', 'uitverkocht', 'verborgen')),
  species_target TEXT CHECK (species_target IN ('hond', 'kat', 'beide', 'overig')),
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 6. ORDERS
-- =============================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT NOT NULL UNIQUE,
  buyer_id UUID NOT NULL REFERENCES profiles(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'betaald', 'verzonden', 'geleverd', 'geannuleerd', 'retour')),
  subtotal DECIMAL(10,2) NOT NULL,
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  shipping_address JSONB,
  payment_method TEXT,
  payment_id TEXT, -- Mollie payment ID
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL
);

-- Generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := 'KC-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('order_number_seq')::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;
CREATE TRIGGER set_order_number BEFORE INSERT ON orders FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- =============================================
-- 7. SALONS (Hondenkapsalons)
-- =============================================
CREATE TABLE salons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  address TEXT,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  phone TEXT,
  email TEXT,
  website TEXT,
  image_url TEXT,
  images TEXT[],
  rating DECIMAL(2,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'in_review' CHECK (status IN ('actief', 'in_review', 'inactief')),
  opening_hours JSONB, -- {"ma": {"open": "09:00", "close": "17:00"}, ...}
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 8. SALON SERVICES
-- =============================================
CREATE TABLE salon_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  duration_minutes INTEGER NOT NULL,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 9. BOOKINGS (Kapsalon afspraken)
-- =============================================
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  salon_id UUID NOT NULL REFERENCES salons(id),
  service_id UUID NOT NULL REFERENCES salon_services(id),
  customer_id UUID NOT NULL REFERENCES profiles(id),
  pet_id UUID REFERENCES pets(id),
  booking_date DATE NOT NULL,
  time_slot TIME NOT NULL,
  status TEXT DEFAULT 'gepland' CHECK (status IN ('gepland', 'bevestigd', 'voltooid', 'geannuleerd', 'no_show')),
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_email TEXT,
  pet_name TEXT,
  pet_breed TEXT,
  pet_size TEXT,
  notes TEXT,
  price DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prevent double bookings
CREATE UNIQUE INDEX idx_unique_booking ON bookings (salon_id, booking_date, time_slot)
  WHERE status NOT IN ('geannuleerd');

-- =============================================
-- 10. 2DE HANDS LISTINGS
-- =============================================
CREATE TABLE second_hand_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category_id UUID REFERENCES categories(id),
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2) NOT NULL,
  condition TEXT NOT NULL CHECK (condition IN ('zo_goed_als_nieuw', 'licht_gebruikt', 'goed', 'redelijk')),
  images TEXT[],
  location TEXT,
  delivery TEXT DEFAULT 'ophalen_of_verzenden' CHECK (delivery IN ('ophalen', 'verzenden', 'ophalen_of_verzenden')),
  status TEXT DEFAULT 'actief' CHECK (status IN ('actief', 'gereserveerd', 'verkocht', 'verwijderd')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enforce max 2 active listings per user
CREATE OR REPLACE FUNCTION check_listing_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM second_hand_listings 
      WHERE seller_id = NEW.seller_id AND status IN ('actief', 'gereserveerd')) >= 2 THEN
    RAISE EXCEPTION 'Maximum 2 actieve advertenties bereikt';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_listing_limit 
  BEFORE INSERT ON second_hand_listings 
  FOR EACH ROW EXECUTE FUNCTION check_listing_limit();

-- Enforce recent purchase requirement (3 months)
CREATE OR REPLACE FUNCTION check_recent_purchase()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM orders 
    WHERE buyer_id = NEW.seller_id 
      AND status IN ('betaald', 'verzonden', 'geleverd')
      AND created_at > NOW() - INTERVAL '3 months'
  ) THEN
    RAISE EXCEPTION 'Je moet een aankoop hebben in de laatste 3 maanden';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_recent_purchase
  BEFORE INSERT ON second_hand_listings
  FOR EACH ROW EXECUTE FUNCTION check_recent_purchase();

-- Enforce max 70% of original price
ALTER TABLE second_hand_listings 
  ADD CONSTRAINT check_price_limit 
  CHECK (price <= original_price * 0.7);

-- =============================================
-- 11. REVIEWS
-- =============================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reviewer_id UUID NOT NULL REFERENCES profiles(id),
  -- Polymorphic: one of these should be set
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  salon_id UUID REFERENCES salons(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 12. FAVORITES
-- =============================================
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES second_hand_listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id),
  UNIQUE(user_id, listing_id)
);

-- =============================================
-- 13. ACADEMY COURSES
-- =============================================
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('hond', 'kat', 'algemeen')),
  trainer_name TEXT,
  trainer_avatar TEXT,
  trainer_bio TEXT,
  total_modules INTEGER DEFAULT 0,
  total_lessons INTEGER DEFAULT 0,
  duration_text TEXT,
  image_url TEXT,
  status TEXT DEFAULT 'concept' CHECK (status IN ('concept', 'demo', 'actief', 'verborgen')),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE course_modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  duration_text TEXT
);

CREATE TABLE course_lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id UUID NOT NULL REFERENCES course_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT DEFAULT 'video' CHECK (type IN ('video', 'article', 'quiz')),
  duration_minutes INTEGER,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE course_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, lesson_id)
);

-- =============================================
-- 14. BLOG POSTS
-- =============================================
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT,
  image_url TEXT,
  category TEXT,
  author_name TEXT,
  author_avatar TEXT,
  read_time TEXT,
  status TEXT DEFAULT 'concept' CHECK (status IN ('concept', 'gepubliceerd', 'verborgen')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 15. EARLY ACCESS / NEWSLETTER
-- =============================================
CREATE TABLE early_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  role TEXT DEFAULT 'koper',
  source TEXT DEFAULT 'website',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  source TEXT DEFAULT 'website',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 16. CONTACT MESSAGES
-- =============================================
CREATE TABLE contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'nieuw' CHECK (status IN ('nieuw', 'gelezen', 'beantwoord')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 17. SITE SETTINGS (key-value store)
-- =============================================
CREATE TABLE site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO site_settings (key, value) VALUES
  ('general', '{"siteName": "Kwispelclub", "tagline": "Alles voor je beste vriend", "logo": "🐾", "contactEmail": "info@kwispelclub.be", "phone": "+32 89 123 456", "address": "Bree, Limburg, België"}'),
  ('launch', '{"launchMode": true, "launchText": "Kwispelclub is in opbouw! Webshop & boekingen zijn nog niet actief."}'),
  ('shop', '{"freeShippingMin": 50, "currency": "EUR"}'),
  ('social', '{"facebook": "https://facebook.com/kwispelclub", "instagram": "https://instagram.com/kwispelclub", "tiktok": ""}'),
  ('hero', '{"title": "Alles voor je beste vriend", "subtitle": "Vind premium voeding, deskundig advies, betrouwbare verkopers en een warme community.", "ctaPrimary": "Ontdek nu →", "ctaSecondary": "Bekijk marktplaats", "tagText": "#1 Huisdierplatform in België & Nederland"}'),
  ('chatbot', '{"name": "Kwispel", "avatar": "🐕", "enabled": true}');

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE second_hand_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all, edit own
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Pets: owners can CRUD their own
CREATE POLICY "Users can view own pets" ON pets FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users can insert own pets" ON pets FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update own pets" ON pets FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can delete own pets" ON pets FOR DELETE USING (auth.uid() = owner_id);

-- Vaccinations: via pet ownership
CREATE POLICY "Users can manage pet vaccinations" ON vaccinations FOR ALL 
  USING (EXISTS (SELECT 1 FROM pets WHERE pets.id = vaccinations.pet_id AND pets.owner_id = auth.uid()));

-- Orders: users see own orders
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = buyer_id);
CREATE POLICY "Users can create orders" ON orders FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Order items: via order ownership
CREATE POLICY "Users can view own order items" ON order_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.buyer_id = auth.uid()));

-- Bookings: customers see own, salons see their bookings
CREATE POLICY "Users can view own bookings" ON bookings FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Users can create bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = customer_id);

-- 2de hands: public read, owner write
CREATE POLICY "Listings are viewable by everyone" ON second_hand_listings FOR SELECT USING (true);
CREATE POLICY "Users can insert own listings" ON second_hand_listings FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Users can update own listings" ON second_hand_listings FOR UPDATE USING (auth.uid() = seller_id);
CREATE POLICY "Users can delete own listings" ON second_hand_listings FOR DELETE USING (auth.uid() = seller_id);

-- Favorites: own only
CREATE POLICY "Users can manage own favorites" ON favorites FOR ALL USING (auth.uid() = user_id);

-- Course progress: own only
CREATE POLICY "Users can manage own progress" ON course_progress FOR ALL USING (auth.uid() = user_id);

-- Reviews: public read, authenticated write
CREATE POLICY "Reviews are viewable by everyone" ON reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- Public tables (no RLS needed, read-only for users)
-- products, categories, salons, salon_services, courses, course_modules, course_lessons, blog_posts
-- These are managed by admin and readable by all
