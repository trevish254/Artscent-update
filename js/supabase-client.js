// Supabase configuration
const supabaseUrl = 'https://pehhhvtjmgzbimkfcbld.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlaGhodnRqbWd6Ymlta2ZjYmxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2NTA2NzYsImV4cCI6MjEwMjIyNjY3Nn0.sG_B0dx-eIeOrBwjBvdmqtDQrxUQE2x-yBU9V80vxCw';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

window.supabaseClient = supabase;
