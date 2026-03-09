import logging
from services import hooks

log = logging.getLogger(__name__)

def on_system_ready(*args, **kwargs):
    log.info("[AI Assistant] Plugin initialized and ready to intercept queries.")

# Register to the core system event
hooks.register("on_system_ready", on_system_ready)
