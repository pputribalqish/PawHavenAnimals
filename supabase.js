
// =====================================
// PAW HAVEN - SUPABASE CONFIGURATION
// =====================================

const SUPABASE_URL = "https://fduakyyqwzxjwpaewyhg.supabase.co";

const SUPABASE_KEY = "sb_publishable_Dr2kr7lMScnn2SQG42d4YA_92aZKseN";

// Initialise Supabase
const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

console.log("Paw Haven Supabase connected!");
