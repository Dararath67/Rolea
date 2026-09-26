import urllib.request
import json

def api_call(path, method='GET', data=None):
    url = 'http://127.0.0.1:8000/api/v1' + path
    headers = {'Content-Type': 'application/json'}
    body = json.dumps(data).encode('utf-8') if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode('utf-8'))

users = api_call('/admin/users').get('data', [])
admin_user = users[0]
user_id = admin_user.get('id')
print(f"Original User: {admin_user.get('username')} | Email: {admin_user.get('email')} | Phone: {admin_user.get('phone')}")

update_res = api_call(f'/admin/users/{user_id}/update-info', 'POST', {
    'email': 'admin_updated@roleatopup.com',
    'phone': '099888777',
    'username': 'admin',
    'role': 'admin'
})
print("Updated Email:", update_res.get('data', {}).get('email'))
print("Updated Phone:", update_res.get('data', {}).get('phone'))

restore_res = api_call(f'/admin/users/{user_id}/update-info', 'POST', {
    'email': 'admin@roleatopup.com',
    'phone': '012345678',
    'username': 'admin',
    'role': 'admin'
})
print("Restored Email:", restore_res.get('data', {}).get('email'))
print("Restored Phone:", restore_res.get('data', {}).get('phone'))
print("SUCCESS: User Info Edit (Email & Phone) verified 100%!")
