# || ॐ श्री गणेशाय नमः ||
#
# Organization: AITDL

import os
from supabase import create_client, Client

def get_supabase() -> Client:
    # Phase 4: Supabase Integration
    url: str = os.getenv("SUPABASE_URL", "")
    key: str = os.getenv("SUPABASE_ANON_KEY", "")
    
    # In testing environments, return a mock or just initialization without throwing an error if keys are missing
    if not url or not key:
        print("Warning: SUPABASE_URL and SUPABASE_ANON_KEY not set. Auth may fail.")
        
    return create_client(url, key)

supabase = get_supabase()
