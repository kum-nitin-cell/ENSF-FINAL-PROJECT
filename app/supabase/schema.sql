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
