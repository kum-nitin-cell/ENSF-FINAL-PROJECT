-- Supabase schema for AI Mock Interview App

-- Enable uuid-ossp extension for UUID generation if not already enabled
create extension if not exists "uuid-ossp";

-- Profiles table
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  full_name text,
  resume_text text,
  resume_filename text,
  job_description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Interview Sessions Table
create table interview_sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  interview_type text not null, -- behavioral, technical, mixed
  difficulty text not null, -- easy, medium, hard
  num_questions integer not null,
  follow_up_enabled boolean default true,
  industry text,
  role_title text,
  status text default 'active' not null, -- active, paused, completed
  overall_score integer,
  strengths jsonb,
  improvements jsonb,
  started_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Session Questions Table
create table session_questions (
  id uuid default uuid_generate_v4() primary key,
  session_id uuid references public.interview_sessions(id) on delete cascade not null,
  question_number integer not null,
  question_text text not null,
  user_answer text,
  score integer,
  feedback_strengths jsonb,
  feedback_improvements jsonb,
  feedback_ideal text,
  asked_at timestamp with time zone default timezone('utc'::text, now()) not null,
  answered_at timestamp with time zone
);


-- Row Level Security (RLS) Setup
alter table profiles enable row level security;
alter table interview_sessions enable row level security;
alter table session_questions enable row level security;

-- Policies for profiles
-- UPDATE: user can only update rows they own + must remain owned by them
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

-- Trigger for new user creation to auto-create profile
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Policies for interview_sessions
create policy "Users can view own sessions" on interview_sessions for select using (auth.uid() = user_id);
create policy "Users can insert own sessions" on interview_sessions for insert with check (auth.uid() = user_id);
create policy "Users can update own sessions" on interview_sessions for update using (auth.uid() = user_id);
create policy "Users can delete own sessions" on interview_sessions for delete using (auth.uid() = user_id);

-- Policies for session_questions
create policy "Users can view own questions" on session_questions for select using (
  exists (select 1 from interview_sessions s where s.id = session_questions.session_id and s.user_id = auth.uid())
);
create policy "Users can insert own questions" on session_questions for insert with check (
  exists (select 1 from interview_sessions s where s.id = session_questions.session_id and s.user_id = auth.uid())
);
create policy "Users can update own questions" on session_questions for update using (
  exists (select 1 from interview_sessions s where s.id = session_questions.session_id and s.user_id = auth.uid())
);
create policy "Users can delete own questions" on session_questions for delete using (
  exists (select 1 from interview_sessions s where s.id = session_questions.session_id and s.user_id = auth.uid())
);

