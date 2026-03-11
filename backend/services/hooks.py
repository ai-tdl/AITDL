import logging
import inspect
from typing import Callable, Dict, List, Any

log = logging.getLogger(__name__)

# Registry mapping event names to lists of callback functions
_hooks: Dict[str, List[Callable]] = {}

def register(event_name: str, callback: Callable) -> None:
    """
    Register a callback function to be executed when an event is triggered.
    """
    if event_name not in _hooks:
        _hooks[event_name] = []
    
    _hooks[event_name].append(callback)
    log.debug(f"Registered hook for event: {event_name}")

async def trigger(event_name: str, *args: Any, **kwargs: Any) -> None:
    """
    Trigger all registered callbacks for a specific event.
    Executes asynchronously.
    """
    if event_name not in _hooks:
        return

    callbacks = _hooks[event_name]
    log.debug(f"Triggering {len(callbacks)} hooks for event: {event_name}")
    
    for callback in callbacks:
        try:
            # Check if callback is an async coroutine or a standard function
            if inspect.iscoroutinefunction(callback):
                await callback(*args, **kwargs)
            else:
                callback(*args, **kwargs)
        except Exception as e:
            log.error(f"Error executing hook '{event_name}': {e}", exc_info=True)

def list_hooks() -> Dict[str, List[str]]:
    """
    Returns a mapping of event names to a list of registered callback function names.
    Useful for Admin Dashboard introspection.
    """
    return {
        event: [getattr(callback, '__name__', 'anonymous') for callback in callbacks]
        for event, callbacks in _hooks.items()
    }

def clear(event_name: str) -> None:
    """
    Clears all registered hooks for a specific event.
    """
    if event_name in _hooks:
        _hooks.pop(event_name)
        log.debug(f"Cleared all hooks for event: {event_name}")
