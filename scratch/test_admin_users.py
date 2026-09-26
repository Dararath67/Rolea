import urllib.request
import json

# 1. Fetch admin users list
req = urllib.request.Request('http://localhost:8000/api/v1/admin/users')
with urllib.request.urlopen(req) as res:
    data = json.loads(res.read().decode())
    print('Users Count:', data.get('count'))
    for u in data.get('data', []):
        print(f"ID: {u.get('id')} | User: {u.get('username')} | Email: {u.get('email')} | Password: {u.get('password_plain')} | Wallet: ${u.get('wallet_usd')}")

# 2. Test Reset Password on first user
if data.get('data'):
    test_u = data['data'][0]
    reset_data = json.dumps({'new_password': 'UpdatedPass999!'}).encode()
    reset_req = urllib.request.Request(
        f"http://localhost:8000/api/v1/admin/users/{test_u['id']}/reset-password",
        data=reset_data,
        headers={'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(reset_req) as res:
        reset_res = json.loads(res.read().decode())
        print('Reset Password Result:', reset_res)

    # 3. Verify user list reflects the updated password
    req = urllib.request.Request('http://localhost:8000/api/v1/admin/users')
    with urllib.request.urlopen(req) as res:
        data = json.loads(res.read().decode())
        for u in data.get('data', []):
            if u['id'] == test_u['id']:
                print(f"Verified Updated Password for {u['username']}: {u.get('password_plain')}")
