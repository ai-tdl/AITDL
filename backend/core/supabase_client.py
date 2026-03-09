"""
॥ ॐ श्री गणेशाय नमः ॥
॥ ॐ श्री सरस्वत्यै नमः ॥
॥ ॐ नमो नारायणाय ॥
॥ ॐ नमः शिवाय ॥
॥ ॐ दुर्गायै नमः ॥

Creator: Jawahar R. Mallah
Organization: AITDL — AI Technology Development Lab
Web: https://aitdl.com

Historical Reference:
628 CE · Brahmasphuṭasiddhānta

Current Build:
8 March MMXXVI
Vikram Samvat 2082

Platform: AITDL Platform V3
Fingerprint: AITDL-PLATFORM-V3
"""

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
