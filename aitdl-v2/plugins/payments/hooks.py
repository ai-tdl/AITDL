import logging
from services import hooks

log = logging.getLogger(__name__)

def on_payment_completed(tx_data):
    log.info(f"[Payments] Processed translation payload for TxID: {tx_data.get('transaction_id')}")

hooks.register("on_payment_completed", on_payment_completed)
