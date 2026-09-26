import httpx
import urllib.parse

key = 'pwkCw4Sly7CIWLBLtajJP4LSZ7MC2k8O'
url = 'https://www.vngzz2game.site/api/v1/generate_qr'

packages = [
    ("55 Diamonds ($0.89)", 0.89),
    ("275 Diamonds ($4.49)", 4.49),
    ("570 Diamonds ($8.99)", 8.99),
    ("1160 Diamonds ($17.99)", 17.99),
]

for name, usd_price in packages:
    khr_amt = int(round(usd_price * 4100))
    r = httpx.post(
        url,
        json={
            "amount": str(khr_amt),
            "currency": "USD",
            "idempotency_key": f"pkg-test-{khr_amt}"
        },
        headers={"X-API-Key": key}
    )
    if r.status_code in [200, 201]:
        data = r.json()
        qr_str = urllib.parse.unquote(data['data']['qr_string'])
        print(f"Package: {name} -> KHR Amount sent: {khr_amt} Riel")
        print(f"Status: {r.status_code} | QR Amount: {data['data'].get('amount')}")
        print(f"QR String: {qr_str}")
        print("=" * 60)
    else:
        print(f"Error for {name}: {r.status_code} - {r.text}")
