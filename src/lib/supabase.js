import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://oqfskbbsvinqraznefcz.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xZnNrYmJzdmlucXJhem5lZmN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5MjkzNjAsImV4cCI6MjA5NjUwNTM2MH0.79TUx6TwisT65KfUryzJkLLxKVvmy-oGf1YpiL1qU0c'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
