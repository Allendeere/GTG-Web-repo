import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://lvxzewfxhodndvvajmcg.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2eHpld2Z4aG9kbmR2dmFqbWNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MDUwMTcsImV4cCI6MjA3NjE4MTAxN30.WrMMBCrGj9gJqxtx6Qn6_KNYMg7Kg1SeshMemUDcYDY'


export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
})