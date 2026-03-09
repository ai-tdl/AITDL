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

import logging
import json
import os
import sys
from datetime import datetime

class JsonFormatter(logging.Formatter):
    """
    Custom formatter to output logs in JSON format for production (Railway/Vercel).
    """
    def format(self, record):
        log_record = {
            "timestamp": datetime.fromtimestamp(record.created).isoformat(),
            "level": record.levelname,
            "message": record.getMessage(),
            "module": record.module,
            "funcName": record.funcName,
            "line": record.lineno,
        }
        if record.exc_info:
            log_record["exception"] = self.formatException(record.exc_info)
        return json.dumps(log_record)

def setup_logging():
    """
    Configures logging based on the environment.
    Use JSON in production, human-readable in development.
    """
    env = os.getenv("ENVIRONMENT", "development").lower()
    root_log = logging.getLogger()
    
    # Clear existing handlers
    for handler in root_log.handlers[:]:
        root_log.removeHandler(handler)

    handler = logging.StreamHandler(sys.stdout)
    
    if env == "production":
        handler.setFormatter(JsonFormatter())
    else:
        # Standard human-readable format for dev
        fmt = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        handler.setFormatter(fmt)

    root_log.addHandler(handler)
    root_log.setLevel(logging.INFO if env == "production" else logging.DEBUG)
    
    # Silence noisy loggers
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)
