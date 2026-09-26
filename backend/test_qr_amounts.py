import httpx
import urllib.parse

key = 'pwkCw4Sly7CIWLBLtajJP4LSZ7MC2k8O'
url = 'https://www.vngzz2game.site/api/v1/generate_qr'

# Let's test sending KHR value as amount (e.g. 3649 for $0.89)
for amt in ['3649', '4100', '10000']:
    r = httpx.post(url, json={'amount': amt, 'currency': 'USD', 'idempotency_key': f'amt-khr-{amt}'}, headers={'X-API-Key': key})
    if r.status_code in [200, 201]:
        data = r.json()
        qr_str = urllib.parse.unquote(data['data']['qr_string'])
        print(f"Sent amount: {amt}")
        print(f"QR String: {qr_str}")
        print(f"Amount tag: {'5404' + amt in qr_str or '5405' + amt in qr_str}")
        print("-" * 50)
    else:
        print(f"Error {amt} -> {r.text}")
