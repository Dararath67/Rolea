import httpx
import urllib.parse

key = 'pwkCw4Sly7CIWLBLtajJP4LSZ7MC2k8O'
url = 'https://www.vngzz2game.site/api/v1/generate_qr'

amounts = ['0.89', '1.00', '4.49', '8.99', '17.99']

for amt in amounts:
    r = httpx.post(
        url,
        json={"amount": amt, "currency": "USD", "idempotency_key": f"usd-live-{amt}"},
        headers={"X-API-Key": key}
    )
    if r.status_code in [200, 201]:
        data = r.json()
        qr_str = urllib.parse.unquote(data['data']['qr_string'])
        print(f"USD Requested: ${amt}")
        print(f"Status: {r.status_code} | Return Amount: {data['data'].get('amount')}")
        print(f"QR String: {qr_str}")
        print(f"Contains 5303840 (USD): {'5303840' in qr_str}")
        print(f"Contains 5303116 (KHR): {'5303116' in qr_str}")
        print("=" * 60)
    else:
        print(f"Error ${amt} -> {r.status_code}: {r.text}")
