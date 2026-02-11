-- ============================================
-- ROOFING PROS USA — Fleet Manager
-- Run this ONCE in your Supabase SQL Editor
-- ============================================

-- Teams table
CREATE TABLE teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  doh TEXT NOT NULL,
  truck_label TEXT NOT NULL,
  lead TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
);

-- Members table
CREATE TABLE members (
  id SERIAL PRIMARY KEY,
  team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  truck TEXT NOT NULL DEFAULT '',
  is_lead BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0
);

-- Users table (simple auth — no Supabase Auth needed)
CREATE TABLE app_users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Manager'
);

-- ============================================
-- INSERT DEFAULT DATA
-- ============================================

-- Users
INSERT INTO app_users (username, password, role) VALUES
  ('admin', 'roofpro2026', 'Admin'),
  ('manager', 'manager2026', 'Manager');

-- Teams
INSERT INTO teams (id, name, color, doh, truck_label, lead, sort_order) VALUES
  ('melbourne', 'MELBOURNE', '#4A90D9', 'DOH', 'Truck', 'Brock Berry', 1),
  ('tampa', 'TAMPA', '#7B68EE', 'DOH3', 'Truck2', 'Christopher Bucci', 2),
  ('orlando', 'ORLANDO', '#E8A838', 'DOH2', 'Truck #02', 'David Bolden', 3),
  ('orlando2', 'ORLANDO (2)', '#FF6B35', 'DOH24', 'Truck #023', 'Nicholas Boviard', 4),
  ('retail', 'RETAIL DIVISION', '#FFD700', 'DOH7', 'Truck3', 'Thorin Doyle', 5);

-- MELBOURNE
INSERT INTO members (team_id, name, truck, is_lead, sort_order) VALUES
  ('melbourne', 'Brock Berry', '125', true, 1),
  ('melbourne', 'Hunter Percival', '127', false, 2),
  ('melbourne', 'Jeffrey Dodge', '98', false, 3),
  ('melbourne', 'Kenneth Mitchell', '112', false, 4),
  ('melbourne', 'Micah Mitzel', '74', false, 5),
  ('melbourne', 'Anthony Heydt', '88', false, 6),
  ('melbourne', 'Roger Whitaker', '106', false, 7),
  ('melbourne', 'Nick Street', '115', false, 8),
  ('melbourne', 'Marco Johnston', '87', false, 9),
  ('melbourne', 'Eric Beckwith', '69', false, 10),
  ('melbourne', 'Nazareth Badia', '97', false, 11),
  ('melbourne', 'Jake Peterson', '70', false, 12),
  ('melbourne', 'Devon Ireland', '95', false, 13);

-- TAMPA
INSERT INTO members (team_id, name, truck, is_lead, sort_order) VALUES
  ('tampa', 'Christopher Bucci', '38', true, 1),
  ('tampa', 'Jonathan Crisman', '83', false, 2),
  ('tampa', 'Kenneth Fox', '119', false, 3),
  ('tampa', 'Charlie Davis', '25', false, 4),
  ('tampa', 'Joseph Leggett', '71', false, 5),
  ('tampa', 'Paul Ouellette', '77', false, 6),
  ('tampa', 'Michael Reyes', 'NT', false, 7),
  ('tampa', 'Jarod Craig', '29', false, 8),
  ('tampa', 'Austin Zwinge', '116', false, 9),
  ('tampa', 'Brandon McDuffee', '26', false, 10);

-- ORLANDO
INSERT INTO members (team_id, name, truck, is_lead, sort_order) VALUES
  ('orlando', 'David Bolden', '113', true, 1),
  ('orlando', 'John Costello', '117', false, 2),
  ('orlando', 'Carry Westmoreland', '118', false, 3),
  ('orlando', 'Dominique Simpson', '108', false, 4),
  ('orlando', 'Jason Smith', '62', false, 5),
  ('orlando', 'George Cabrera', '100', false, 6),
  ('orlando', 'Quinton Watson', 'NT', false, 7),
  ('orlando', 'Steven Celentano', '68', false, 8),
  ('orlando', 'Michael (Shane) Allen', '121', false, 9),
  ('orlando', 'Gregory Castillano', '89', false, 10),
  ('orlando', 'Clara Thomas', '73', false, 11),
  ('orlando', 'Ricky Wells', '63', false, 12),
  ('orlando', 'Joseph Rodriguez', '91', false, 13),
  ('orlando', 'Devon Davis', '101', false, 14),
  ('orlando', 'Deandre Lovett', '67', false, 15),
  ('orlando', 'Marc Chang Yen', '122', false, 16),
  ('orlando', 'James Davis', 'NT', false, 17);

-- ORLANDO (2)
INSERT INTO members (team_id, name, truck, is_lead, sort_order) VALUES
  ('orlando2', 'Nicholas Boviard', '124', true, 1),
  ('orlando2', 'Chris De Guzman', '72', false, 2),
  ('orlando2', 'Jesus Colon', '6', false, 3),
  ('orlando2', 'Fernando Beckles', '126', false, 4),
  ('orlando2', 'Derrick Alexander', '36', false, 5),
  ('orlando2', 'Jose Irizarry', '81', false, 6),
  ('orlando2', 'Miguel Delgado', '75', false, 7),
  ('orlando2', 'Duncan Ferrell', '99', false, 8),
  ('orlando2', 'Chad Lantow', '28', false, 9),
  ('orlando2', 'Gregory Krivosheyer', '79', false, 10);

-- RETAIL DIVISION
INSERT INTO members (team_id, name, truck, is_lead, sort_order) VALUES
  ('retail', 'Thorin Doyle', '500', true, 1),
  ('retail', 'Vacant', '501', false, 2),
  ('retail', 'Ronnie Hunter', '502', false, 3),
  ('retail', 'Vacant', '502', false, 4),
  ('retail', 'Juan (JC) Batista', '503', false, 5),
  ('retail', 'Vacant', '504', false, 6),
  ('retail', 'Cowboy - Temp', '505', false, 7),
  ('retail', 'Jamie Reeves', '506', false, 8),
  ('retail', 'Kevin Conley', '507', false, 9),
  ('retail', 'Vacant', '508', false, 10),
  ('retail', 'Ricky Sills', '509', false, 11),
  ('retail', 'Vacant', 'NT', false, 12);

-- ============================================
-- ROW LEVEL SECURITY (open for authenticated app access)
-- ============================================
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;

-- Allow anonymous/public read+write (our app handles auth at the app level)
CREATE POLICY "Allow all on teams" ON teams FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on members" ON members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on app_users" ON app_users FOR ALL USING (true) WITH CHECK (true);
