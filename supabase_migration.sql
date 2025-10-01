-- Trading Ethos Database Schema Migration
-- This migration creates all the necessary tables for the trading ethos application

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    streak_count INTEGER DEFAULT 0 CHECK (streak_count >= 0),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create daily_rituals table
CREATE TABLE daily_rituals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    pre_market_data JSONB DEFAULT '{}',
    post_market_data JSONB DEFAULT '{}',
    embodiment_score INTEGER CHECK (embodiment_score >= 0 AND embodiment_score <= 10),
    completion_status TEXT CHECK (completion_status IN ('pending', 'in_progress', 'completed', 'skipped')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Create trades table
CREATE TABLE trades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time TIME NOT NULL,
    asset TEXT NOT NULL,
    entry DECIMAL(15,8) NOT NULL,
    exit DECIMAL(15,8),
    pnl DECIMAL(15,8),
    identity_state TEXT,
    embodiment_rating INTEGER CHECK (embodiment_rating >= 0 AND embodiment_rating <= 10),
    beliefs_influence TEXT,
    nervous_system_state TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create micro_evidence table
CREATE TABLE micro_evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time TIME NOT NULL,
    evidence_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create weekly_reviews table
CREATE TABLE weekly_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    week_start_date DATE NOT NULL,
    conviction_statement TEXT,
    patterns_recognized TEXT,
    behaviors_to_eliminate JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, week_start_date)
);

-- Create monthly_reviews table
CREATE TABLE monthly_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    month DATE NOT NULL, -- First day of the month
    old_self_stories JSONB DEFAULT '[]',
    new_self_truths JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, month)
);

-- Create indexes for better performance
CREATE INDEX idx_daily_rituals_user_id ON daily_rituals(user_id);
CREATE INDEX idx_daily_rituals_date ON daily_rituals(date);
CREATE INDEX idx_daily_rituals_user_date ON daily_rituals(user_id, date);

CREATE INDEX idx_trades_user_id ON trades(user_id);
CREATE INDEX idx_trades_date ON trades(date);
CREATE INDEX idx_trades_user_date ON trades(user_id, date);
CREATE INDEX idx_trades_asset ON trades(asset);

CREATE INDEX idx_micro_evidence_user_id ON micro_evidence(user_id);
CREATE INDEX idx_micro_evidence_date ON micro_evidence(date);
CREATE INDEX idx_micro_evidence_user_date ON micro_evidence(user_id, date);

CREATE INDEX idx_weekly_reviews_user_id ON weekly_reviews(user_id);
CREATE INDEX idx_weekly_reviews_week_start ON weekly_reviews(week_start_date);
CREATE INDEX idx_weekly_reviews_user_week ON weekly_reviews(user_id, week_start_date);

CREATE INDEX idx_monthly_reviews_user_id ON monthly_reviews(user_id);
CREATE INDEX idx_monthly_reviews_month ON monthly_reviews(month);
CREATE INDEX idx_monthly_reviews_user_month ON monthly_reviews(user_id, month);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to all tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_rituals_updated_at BEFORE UPDATE ON daily_rituals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trades_updated_at BEFORE UPDATE ON trades
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_micro_evidence_updated_at BEFORE UPDATE ON micro_evidence
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_weekly_reviews_updated_at BEFORE UPDATE ON weekly_reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_monthly_reviews_updated_at BEFORE UPDATE ON monthly_reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_rituals ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE micro_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_reviews ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles table
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for daily_rituals table
CREATE POLICY "Users can view own daily rituals" ON daily_rituals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily rituals" ON daily_rituals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily rituals" ON daily_rituals
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own daily rituals" ON daily_rituals
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for trades table
CREATE POLICY "Users can view own trades" ON trades
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trades" ON trades
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trades" ON trades
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own trades" ON trades
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for micro_evidence table
CREATE POLICY "Users can view own micro evidence" ON micro_evidence
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own micro evidence" ON micro_evidence
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own micro evidence" ON micro_evidence
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own micro evidence" ON micro_evidence
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for weekly_reviews table
CREATE POLICY "Users can view own weekly reviews" ON weekly_reviews
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weekly reviews" ON weekly_reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weekly reviews" ON weekly_reviews
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own weekly reviews" ON weekly_reviews
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for monthly_reviews table
CREATE POLICY "Users can view own monthly reviews" ON monthly_reviews
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own monthly reviews" ON monthly_reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own monthly reviews" ON monthly_reviews
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own monthly reviews" ON monthly_reviews
    FOR DELETE USING (auth.uid() = user_id);

-- Create a function to automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add comments to tables for documentation
COMMENT ON TABLE profiles IS 'User profiles linked to auth.users';
COMMENT ON TABLE daily_rituals IS 'Daily trading rituals and embodiment tracking';
COMMENT ON TABLE trades IS 'Individual trade records with psychological state tracking';
COMMENT ON TABLE micro_evidence IS 'Micro-evidence entries for pattern recognition';
COMMENT ON TABLE weekly_reviews IS 'Weekly reflection and review sessions';
COMMENT ON TABLE monthly_reviews IS 'Monthly deep reflection and identity work';

-- Add comments to key columns
COMMENT ON COLUMN profiles.streak_count IS 'Current streak of consecutive days with completed rituals';
COMMENT ON COLUMN daily_rituals.embodiment_score IS 'Self-rated embodiment score from 0-10';
COMMENT ON COLUMN daily_rituals.completion_status IS 'Status: pending, in_progress, completed, skipped';
COMMENT ON COLUMN trades.embodiment_rating IS 'Self-rated embodiment during trade from 0-10';
COMMENT ON COLUMN trades.identity_state IS 'Description of identity state during trade';
COMMENT ON COLUMN trades.beliefs_influence IS 'How beliefs influenced the trade decision';
COMMENT ON COLUMN trades.nervous_system_state IS 'Description of nervous system state during trade';
COMMENT ON COLUMN weekly_reviews.behaviors_to_eliminate IS 'JSON array of behaviors to eliminate';
COMMENT ON COLUMN monthly_reviews.old_self_stories IS 'JSON array of old self-limiting stories';
COMMENT ON COLUMN monthly_reviews.new_self_truths IS 'JSON array of new empowering truths';
