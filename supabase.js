import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qrisvraxtizebivjwhbu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyaXN2cmF4dGl6ZWJpdmp3aGJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3MTY3NjMsImV4cCI6MjEwNDI5Mjc2M30.D5gDh2g9I_iaXds-4MkULSynWVawW9pWmTRhNkwI-nA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);