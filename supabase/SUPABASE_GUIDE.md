# 🚀 Study Path - Supabase Development Guide

This guide covers all the essential Supabase commands and workflows for the Study Path project.

## 📋 Table of Contents

1. [Initial Setup](#initial-setup)
2. [Local Development](#local-development)
3. [Migrations](#migrations)
4. [Seeding](#seeding)
5. [Remote Deployment](#remote-deployment)
6. [Sync Local & Remote](#sync-local--remote)
7. [Troubleshooting](#troubleshooting)

---

## 🏗️ Initial Setup

### **Step 1: Initialize Supabase Project**
```bash
# Initialize Supabase in your project
npx supabase init

# This creates:
# - supabase/ folder
# - supabase/config.toml
# - supabase/migrations/ folder
```

### **Step 2: Start Local Development**
```bash
# Start local Supabase (requires Docker Desktop)
npx supabase start

# This will:
# - Download Docker images
# - Start local database
# - Apply existing migrations
# - Run seed files
```

### **Step 3: Get Local URLs**
After `npx supabase start`, you'll get:
```
API URL: http://127.0.0.1:54321
Studio URL: http://127.0.0.1:54323
DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

---

## 🏠 Local Development

### **Start Local Supabase**
```bash
# Start local development environment
npx supabase start

# Check status
npx supabase status
```

### **Stop Local Supabase**
```bash
# Stop all local services
npx supabase stop
```

### **Reset Local Database**
```bash
# Reset database and reapply all migrations + seeds
npx supabase db reset

# This will:
# 1. Drop all tables
# 2. Reapply all migrations
# 3. Run seed.sql file
```

### **Access Local Database**
```bash
# Open Supabase Studio (Web UI)
# URL: http://127.0.0.1:54323

# Connect via psql
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

---

## 📝 Migrations

### **Create New Migration**
```bash
# Create a new migration file
npx supabase migration new create_table_name

# Example:
npx supabase migration new create_users_table
# Creates: supabase/migrations/20250922051833_create_users_table.sql
```

### **Apply Migrations Locally**
```bash
# Apply all pending migrations to local database
npx supabase db reset

# Or apply specific migration
npx supabase db reset --file 20250922051833_create_users_table.sql
```

### **Check Migration Status**
```bash
# List all migrations and their status
npx supabase migration list

# Check local database status
npx supabase status
```

### **Migration File Structure**
```sql
-- supabase/migrations/YYYYMMDDHHMMSS_migration_name.sql

-- Example migration:
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own data" ON public.users
FOR SELECT USING (auth.uid() = id);
```

---

## 🌱 Seeding

### **Create Seed File**
```bash
# Create seed file (if not exists)
touch supabase/seed.sql
```

### **Seed Local Database**
```bash
# Method 1: Reset and seed (recommended)
npx supabase db reset

# Method 2: Seed existing database
npx supabase db seed
```

### **Seed File Structure**
```sql
-- supabase/seed.sql

-- Insert sample data
INSERT INTO public.subjects (id, name, description) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'Mathematics', 'Learn math concepts'),
    ('550e8400-e29b-41d4-a716-446655440002', 'Science', 'Explore science topics');

-- Note: Don't seed users table - they're created via auth
```

---

## 🌐 Remote Deployment

### **Step 1: Login to Supabase**
```bash
# Login to your Supabase account
npx supabase login

# This opens browser for authentication
```

### **Step 2: Link to Remote Project**
```bash
# Link to your remote Supabase project
npx supabase link --project-ref YOUR_PROJECT_REF

# Get project ref from: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/general
```

### **Step 3: Push Migrations to Remote**
```bash
# Push all migrations to remote database
npx supabase db push

# Push specific migration
npx supabase db push --file 20250922051833_create_users_table.sql
```

### **Step 4: Seed Remote Database**
```bash
# Push migrations and seed data
npx supabase db push --include-seed

# Or seed existing remote database
npx supabase db seed --remote
```

---

## 🔄 Sync Local & Remote

### **Pull Remote Schema to Local**
```bash
# Pull remote schema changes to local
npx supabase db pull

# This creates new migration files from remote changes
```

### **Push Local Changes to Remote**
```bash
# Push local migrations to remote
npx supabase db push

# Push with seed data
npx supabase db push --include-seed
```

### **Sync Workflow**
```bash
# 1. Pull latest remote changes
npx supabase db pull

# 2. Create new migration locally
npx supabase migration new your_changes

# 3. Test locally
npx supabase db reset

# 4. Push to remote
npx supabase db push
```

---

## 🛠️ Troubleshooting

### **Docker Issues**
```bash
# If Docker is not running:
# 1. Install Docker Desktop
# 2. Start Docker Desktop
# 3. Wait for it to be fully running
# 4. Then run: npx supabase start
```

### **Migration Errors**
```bash
# Check migration status
npx supabase migration list

# Reset and try again
npx supabase db reset

# Check logs
npx supabase db reset --debug
```

### **Connection Issues**
```bash
# Check if Supabase is running
npx supabase status

# Restart if needed
npx supabase stop
npx supabase start
```

### **Remote Connection Issues**
```bash
# Re-link to remote project
npx supabase link --project-ref YOUR_PROJECT_REF

# Check authentication
npx supabase login
```

---

## 📚 Common Commands Reference

### **Local Development**
```bash
npx supabase init          # Initialize project
npx supabase start         # Start local development
npx supabase stop          # Stop local development
npx supabase status        # Check status
npx supabase db reset      # Reset local database
```

### **Migrations**
```bash
npx supabase migration new <name>    # Create new migration
npx supabase migration list          # List migrations
npx supabase db push                 # Push to remote
npx supabase db pull                 # Pull from remote
```

### **Seeding**
```bash
npx supabase db seed                 # Seed local database
npx supabase db push --include-seed  # Push with seed data
```

### **Remote Operations**
```bash
npx supabase login                   # Login to Supabase
npx supabase link --project-ref <ref> # Link to remote project
npx supabase db push                 # Push migrations to remote
```

---

## 🎯 Study Path Project Structure

```
supabase/
├── config.toml                                    # Supabase configuration
├── seed.sql                                       # Seed data
└── migrations/
    ├── 20250922051833_create_users_table.sql     # Users table
    ├── 20250922062729_create_subjects_table.sql  # Subjects table
    └── 20250922062743_create_topics_table.sql    # Topics table
```

---

## 🚀 Quick Start Checklist

- [ ] `npx supabase init`
- [ ] `npx supabase start`
- [ ] Create migrations: `npx supabase migration new <name>`
- [ ] Test locally: `npx supabase db reset`
- [ ] Login: `npx supabase login`
- [ ] Link: `npx supabase link --project-ref <ref>`
- [ ] Deploy: `npx supabase db push --include-seed`

---

## 📖 Additional Resources

- [Supabase CLI Documentation](https://supabase.com/docs/guides/cli)
- [Supabase Local Development](https://supabase.com/docs/guides/local-development)
- [Supabase Migrations](https://supabase.com/docs/guides/database/migrations)
- [Supabase Studio](http://127.0.0.1:54323) (Local)

---

**Happy coding! 🎉**
