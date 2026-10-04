import urllib.request
import re
import os

packages = {
    'bloodstrike.png': 'com.netease.newspike',
    'hok.png': 'com.levelinfinite.sgameGlobal',
    'steam.png': 'com.valvesoftware.android.steam.community',
    'netflix.png': 'com.netflix.mediaclient',
    'spotify.png': 'com.spotify.music',
    'youtube.png': 'com.google.android.youtube'
}

for name, pkg in packages.items():
    try:
        url = f'https://play.google.com/store/apps/details?id={pkg}&hl=en'
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        html = urllib.request.urlopen(req, timeout=10).read().decode('utf-8')
        m = re.search(r'(https://play-lh\.googleusercontent\.com/[^\"\s=]+)', html)
        if m:
            img_url = m.group(1) + '=s512-rw'
            img_req = urllib.request.Request(img_url, headers={'User-Agent': 'Mozilla/5.0'})
            img_data = urllib.request.urlopen(img_req, timeout=10).read()
            out_path = os.path.join('public', 'images', 'games', name)
            with open(out_path, 'wb') as f:
                f.write(img_data)
            print(f'Successfully downloaded official icon for {name} ({len(img_data)} bytes)')
        else:
            print(f'No image found for {pkg}')
    except Exception as e:
        print(f'Failed {name}: {e}')
