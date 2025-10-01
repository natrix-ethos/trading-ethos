# Trading Ethos Database Migration

This SQL migration file creates all the necessary tables for the Trading Ethos application.

## Tables Created

### 1. `profiles`
- **Purpose**: User profiles linked to Supabase auth
- **Key Fields**: id (UUID), email, name, created_at, streak_count
- **Relationships**: Primary table referenced by all other tables

### 2. `daily_rituals`
- **Purpose**: Daily trading rituals and embodiment tracking
- **Key Fields**: user_id, date, pre_market_data (JSONB), post_market_data (JSONB), embodiment_score, completion_status
- **Features**: Unique constraint on (user_id, date)

### 3. `trades`
- **Purpose**: Individual trade records with psychological state tracking
- **Key Fields**: user_id, date, time, asset, entry, exit, pnl, identity_state, embodiment_rating, beliefs_influence, nervous_system_state
- **Features**: Decimal precision for financial data

### 4. `micro_evidence`
- **Purpose**: Micro-evidence entries for pattern recognition
- **Key Fields**: user_id, date, time, evidence_text
- **Features**: Simple text-based evidence collection

### 5. `weekly_reviews`
- **Purpose**: Weekly reflection and review sessions
- **Key Fields**: user_id, week_start_date, conviction_statement, patterns_recognized, behaviors_to_eliminate (JSONB)
- **Features**: Unique constraint on (user_id, week_start_date)

### 6. `monthly_reviews`
- **Purpose**: Monthly deep reflection and identity work
- **Key Fields**: user_id, month, old_self_stories (JSONB), new_self_truths (JSONB)
- **Features**: Unique constraint on (user_id, month)

## Key Features

### Security
- **Row Level Security (RLS)** enabled on all tables
- **Policies** ensure users can only access their own data
- **Automatic profile creation** when users sign up

### Performance
- **Indexes** on frequently queried columns
- **Composite indexes** for common query patterns
- **Foreign key constraints** for data integrity

### Data Integrity
- **Check constraints** for score ranges (0-10)
- **Unique constraints** to prevent duplicates
- **Cascade deletes** to maintain referential integrity

### Automation
- **Updated_at triggers** automatically update timestamps
- **Profile creation trigger** for new user signups
- **UUID generation** for primary keys

## How to Run the Migration

### Option 1: Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase_migration.sql`
4. Click "Run" to execute the migration

### Option 2: Supabase CLI
```bash
# If you have Supabase CLI installed
supabase db reset
# Then run the migration file
psql -h your-db-host -U postgres -d postgres -f supabase_migration.sql
```

### Option 3: Direct Database Connection
```bash
# Using psql directly
psql "postgresql://postgres:[password]@[host]:5432/postgres" -f supabase_migration.sql
```

## Post-Migration Steps

1. **Verify Tables**: Check that all tables were created successfully
2. **Test RLS**: Ensure Row Level Security policies are working
3. **Test Triggers**: Verify that profile creation works on user signup
4. **Create Sample Data**: Add some test data to verify relationships

## Notes

- The migration includes comprehensive comments for documentation
- All tables use UUID primary keys for better scalability
- JSONB fields allow for flexible data storage
- The schema is designed for a trading psychology and embodiment tracking application
- RLS policies ensure data privacy and security
