-- =========================================================================
-- EventHub Demo Seeding SQL Script
-- Copy and paste this entire script into your Supabase SQL Editor and run it!
-- =========================================================================

-- Enable pgcrypto extension if not already enabled (for password hashing)
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- 1. Seed Coordinator Admin User in auth.users
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role,
  created_at,
  updated_at
)
VALUES (
  'a1111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000000',
  'admin.demo.eventhub@gmail.com',
  extensions.crypt('AdminDemo123!', extensions.gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Coordinator Coordinator"}',
  'authenticated',
  'authenticated',
  now(),
  now()
)
ON CONFLICT (id) DO NOTHING;

-- 2. Seed Student Demo User in auth.users
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role,
  created_at,
  updated_at
)
VALUES (
  's2222222-2222-2222-2222-222222222222',
  '00000000-0000-0000-0000-000000000000',
  'student.demo.eventhub@gmail.com',
  extensions.crypt('StudentDemo123!', extensions.gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Alex Rivera"}',
  'authenticated',
  'authenticated',
  now(),
  now()
)
ON CONFLICT (id) DO NOTHING;

-- 3. Upsert profiles with full mock data and correct roles
INSERT INTO public.profiles (
  user_id,
  email,
  full_name,
  role,
  bio,
  email_notifications,
  event_reminders
)
VALUES (
  'a1111111-1111-1111-1111-111111111111',
  'admin.demo.eventhub@gmail.com',
  'Coordinator Coordinator',
  'admin',
  'Official structural administrator for active workspace events catalog.',
  true,
  true
)
ON CONFLICT (user_id) DO UPDATE SET
  role = 'admin',
  full_name = 'Coordinator Coordinator',
  bio = 'Official structural administrator for active workspace events catalog.';

INSERT INTO public.profiles (
  user_id,
  email,
  full_name,
  role,
  branch,
  roll_number,
  academic_year,
  phone_number,
  bio,
  email_notifications,
  event_reminders
)
VALUES (
  's2222222-2222-2222-2222-222222222222',
  'student.demo.eventhub@gmail.com',
  'Alex Rivera',
  'student',
  'Computer Science & Engineering',
  'CSE-2023-042',
  'Third Year',
  '+1 (555) 019-2834',
  'Passionate full-stack developer, React enthusiast, and college tech club member.',
  true,
  true
)
ON CONFLICT (user_id) DO UPDATE SET
  role = 'student',
  full_name = 'Alex Rivera',
  branch = 'Computer Science & Engineering',
  roll_number = 'CSE-2023-042',
  academic_year = 'Third Year',
  phone_number = '+1 (555) 019-2834',
  bio = 'Passionate full-stack developer, React enthusiast, and college tech club member.';

-- 4. Seed events
INSERT INTO public.events (
  id,
  name,
  description,
  rules,
  registration_link,
  deadline,
  status,
  created_by
)
VALUES (
  'e1111111-1111-1111-1111-111111111111',
  'National AI Hackathon 2026',
  'A 36-hour intensive hackathon focused on building agentic AI applications. Sponsored by major tech leaders.',
  '1. Team size: 2-4 members. 2. Code must be written entirely during the hackathon. 3. APIs must be verified.',
  'https://hackathon.college.edu',
  now() - interval '5 days',
  'completed',
  'a1111111-1111-1111-1111-111111111111'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.events (
  id,
  name,
  description,
  rules,
  registration_link,
  deadline,
  status,
  created_by
)
VALUES (
  'e2222222-2222-2222-2222-222222222222',
  'Advanced React & Next.js Masterclass',
  'Deep dive workshop into modern React design paradigms, Server Components, suspense architectures, and advanced custom state synchronization.',
  'Pre-requisites: Basic JavaScript & core React knowledge.',
  'https://react-workshop.college.edu',
  now() + interval '12 days',
  'active',
  'a1111111-1111-1111-1111-111111111111'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.events (
  id,
  name,
  description,
  rules,
  registration_link,
  deadline,
  status,
  created_by
)
VALUES (
  'e3333333-3333-3333-3333-333333333333',
  'Google Cloud Fundamentals Workshop',
  'Learn core cloud concepts, Kubernetes deployment metrics, and secure database integrations in a fully guided visual hands-on session.',
  'Please bring a laptop with an active Google Account.',
  '',
  now() + interval '4 days',
  'active',
  'a1111111-1111-1111-1111-111111111111'
)
ON CONFLICT (id) DO NOTHING;

-- 5. Seed Event Registrations
INSERT INTO public.event_registrations (
  id,
  event_id,
  student_id,
  status,
  student_full_name,
  student_email,
  student_phone,
  student_branch,
  student_roll_number,
  student_academic_year
)
VALUES (
  'r1111111-1111-1111-1111-111111111111',
  'e1111111-1111-1111-1111-111111111111',
  's2222222-2222-2222-2222-222222222222',
  'attended',
  'Alex Rivera',
  'student.demo.eventhub@gmail.com',
  '+1 (555) 019-2834',
  'Computer Science & Engineering',
  'CSE-2023-042',
  'Third Year'
)
ON CONFLICT (event_id, student_id) DO NOTHING;

INSERT INTO public.event_registrations (
  id,
  event_id,
  student_id,
  status,
  student_full_name,
  student_email,
  student_phone,
  student_branch,
  student_roll_number,
  student_academic_year
)
VALUES (
  'r2222222-2222-2222-2222-222222222222',
  'e2222222-2222-2222-2222-222222222222',
  's2222222-2222-2222-2222-222222222222',
  'registered',
  'Alex Rivera',
  'student.demo.eventhub@gmail.com',
  '+1 (555) 019-2834',
  'Computer Science & Engineering',
  'CSE-2023-042',
  'Third Year'
)
ON CONFLICT (event_id, student_id) DO NOTHING;

INSERT INTO public.event_registrations (
  id,
  event_id,
  student_id,
  status,
  student_full_name,
  student_email,
  student_phone,
  student_branch,
  student_roll_number,
  student_academic_year
)
VALUES (
  'r3333333-3333-3333-3333-333333333333',
  'e3333333-3333-3333-3333-333333333333',
  's2222222-2222-2222-2222-222222222222',
  'registered',
  'Alex Rivera',
  'student.demo.eventhub@gmail.com',
  '+1 (555) 019-2834',
  'Computer Science & Engineering',
  'CSE-2023-042',
  'Third Year'
)
ON CONFLICT (event_id, student_id) DO NOTHING;

-- 6. Seed Certificate
INSERT INTO public.certificates (
  id,
  name,
  event_name,
  recipient_user_id,
  recipient_name,
  certificate_type,
  download_url,
  created_by
)
VALUES (
  'c1111111-1111-1111-1111-111111111111',
  'National AI Hackathon 2026 - Certificate of Achievement',
  'National AI Hackathon 2026',
  's2222222-2222-2222-2222-222222222222',
  'Alex Rivera',
  'achievement',
  'https://pnxgmkfitdomwrjylcjh.supabase.co/storage/v1/object/public/certificates/sample.pdf?template=gold',
  'a1111111-1111-1111-1111-111111111111'
)
ON CONFLICT (id) DO NOTHING;
