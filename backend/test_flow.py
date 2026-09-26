import httpx
import json

base_url = "http://127.0.0.1:8000"

print("--- Step 1: Checking Player ID via VngZz Endpoint ---")
r1 = httpx.get(f"{base_url}/api/v1/game/check_id?game=mlbb&userid=262856740&serverid=3543")
print("Status:", r1.status_code)
print("Data:", r1.json())
assert r1.status_code == 200
assert r1.json().get("playerName") == "Eveline"

print("\n--- Step 2: Creating Top-Up Order ---")
order_payload = {
    "game_slug": "mlbb",
    "product_id": "MLBB_86",
    "player_id": "262856740",
    "server_id": "3543",
    "payment_method_id": "vngzz2game",
    "currency": "USD"
}
r2 = httpx.post(f"{base_url}/api/v1/orders", json=order_payload, timeout=20.0)
print("Status:", r2.status_code)
order_data = r2.json()["data"]
order_id = order_data["id"]
print(f"Order Created: ID={order_id}, Product={order_data['product_name_en']}, Price=${order_data['amount_usd']}, Status={order_data['status']}")
assert r2.status_code == 200

print("\n--- Step 3: Generating VngZz KHQR QR Code ---")
qr_payload = {
    "amount": order_data["amount_usd"],
    "currency": "USD",
    "order_id": order_id
}
r3 = httpx.post(f"{base_url}/api/v1/payments/vngzz/generate-qr", json=qr_payload)
print("Status:", r3.status_code)
print("QR Data:", r3.json())
assert r3.status_code == 200

print("\n--- Step 4: Simulating VngZz Successful Payment Callback ---")
pay_payload = {
    "order_id": order_id,
    "state": "PAID",
    "transaction_id": f"VNGZZ-TXN-{order_id}"
}
r4 = httpx.post(f"{base_url}/api/v1/webhooks/payment/vngzz", json=pay_payload, timeout=20.0)
print("Status:", r4.status_code)
print("Webhook Result:", r4.json())
assert r4.status_code == 200

print("\n--- Step 5: Verifying Order Delivery & Status in System ---")
r5 = httpx.get(f"{base_url}/api/v1/orders/{order_id}")
print("Status:", r5.status_code)
final_order = r5.json()["data"]
print(f"Final Order: Status={final_order['status']}, Provider={final_order['provider_id']}, DeliveryCode={final_order['delivery_code']}")
assert final_order["status"] == "success"
assert final_order["delivery_code"] is not None

print("\n==========================================")
print("ALL 5 STEPS PASSED SUCCESSFULLY 100%!")
print("==========================================")
