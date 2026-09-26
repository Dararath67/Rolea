import urllib.request
import json
import time

time.sleep(2)

print('=== 1. FETCH ADMIN USERS LIST ===')
req = urllib.request.Request('http://localhost:8000/api/v1/admin/users')
with urllib.request.urlopen(req) as res:
    data = json.loads(res.read().decode())
    users = data.get('data', [])
    print(f'Total Users: {len(users)}')
    for u in users:
        print(f"- ID: {u.get('id')} | User: {u.get('username')} | Email: {u.get('email')} | Plain Password: {u.get('password_plain')} | Wallet: ${u.get('wallet_usd')}")

if users:
    target_user = users[0]
    uid = target_user['id']
    print(f"\nTargeting User: {target_user['username']} ({uid}) with initial balance: ${target_user['wallet_usd']}")

    # 2. Add Funds (+$150.00)
    print('\n=== 2. TEST ADD FUNDS (+$150.00) ===')
    add_payload = json.dumps({'mode': 'add', 'amount_usd': 150.0, 'reason': 'Test Admin Credit +$150'}).encode()
    add_req = urllib.request.Request(f'http://localhost:8000/api/v1/admin/users/{uid}/adjust-balance', data=add_payload, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(add_req) as res:
        resp = json.loads(res.read().decode())
        print('Add Funds Result:', resp.get('message'), '| New Balance: $', resp.get('new_balance_usd'))

    # 3. Deduct Funds (-$50.00)
    print('\n=== 3. TEST DEDUCT FUNDS (-$50.00) ===')
    deduct_payload = json.dumps({'mode': 'deduct', 'amount_usd': 50.0, 'reason': 'Test Admin Debit -$50'}).encode()
    deduct_req = urllib.request.Request(f'http://localhost:8000/api/v1/admin/users/{uid}/adjust-balance', data=deduct_payload, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(deduct_req) as res:
        resp = json.loads(res.read().decode())
        print('Deduct Funds Result:', resp.get('message'), '| New Balance: $', resp.get('new_balance_usd'))

    # 4. Reset Password Test
    print('\n=== 4. TEST RESET PASSWORD ===')
    pass_payload = json.dumps({'new_password': 'GamerSuperPass2026!'}).encode()
    pass_req = urllib.request.Request(f'http://localhost:8000/api/v1/admin/users/{uid}/reset-password', data=pass_payload, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(pass_req) as res:
        resp = json.loads(res.read().decode())
        print('Reset Password Result:', resp.get('message'), '| New Plain Password:', resp.get('new_password'))

    # 5. Verify Final User State
    print('\n=== 5. VERIFY UPDATED USER CREDENTIALS & BALANCE ===')
    req = urllib.request.Request('http://localhost:8000/api/v1/admin/users')
    with urllib.request.urlopen(req) as res:
        data = json.loads(res.read().decode())
        for u in data.get('data', []):
            if u['id'] == uid:
                print(f"VERIFIED -> User: {u.get('username')} | Email: {u.get('email')} | Password: {u.get('password_plain')} | Balance: ${u.get('wallet_usd')}")
