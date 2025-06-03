import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vlukzrpragowreweylse.supabase.co'; // ← remplace ici
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsdWt6cnByYWdvd3Jld2V5bHNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MTc2MjYsImV4cCI6MjA2NDA5MzYyNn0.7tqiQA_-NxwgFO2jU9wrqB3D7HLsjyrU_0LawB2wYNU'; // ← colle ici ta clé publique

export const supabase = createClient(supabaseUrl, supabaseKey);
