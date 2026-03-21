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
