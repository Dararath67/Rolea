import urllib.request
import re
import json

games_pkgs = {
    'mlbb': ('com.mobile.legends', 'Mobile Legends: Bang Bang'),
    'freefire': ('com.dts.freefireth', 'Free Fire'),
    'pubg': ('com.tencent.ig', 'PUBG Mobile'),
    'hok': ('com.levelinfinite.sgameGlobal', 'Honor of Kings'),
    'bloodstrike': ('com.netease.newspike', 'Blood Strike'),
    'wildrift': ('com.riotgames.league.wildrift', 'Wild Rift'),
    'fcmobile': ('com.ea.gp.fifamobile', 'EA SPORTS FC Mobile'),
    'roblox': ('com.roblox.client', 'Roblox'),
    'genshin': ('com.miHoYo.GenshinImpact', 'Genshin Impact'),
    'codm': ('com.activision.callofduty.shooter', 'Call of Duty: Mobile'),
    'clashofclans': ('com.supercell.clashofclans', 'Clash of Clans'),
    'brawlstars': ('com.supercell.brawlstars', 'Brawl Stars'),
    'aov': ('com.garena.game.kgth', 'Arena of Valor'),
    'steam': ('com.valvesoftware.android.steam.community', 'Steam'),
    'netflix': ('com.netflix.mediaclient', 'Netflix'),
    'spotify': ('com.spotify.music', 'Spotify'),
    'youtube': ('com.google.android.youtube', 'YouTube')
}

live_urls = {}

for key, (pkg, name) in games_pkgs.items():
    try:
        url = f'https://play.google.com/store/apps/details?id={pkg}&hl=en'
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        html = urllib.request.urlopen(req, timeout=10).read().decode('utf-8')
        m = re.search(r'(https://play-lh\.googleusercontent\.com/[^\"\s=]+)', html)
        if m:
            img_url = m.group(1) + '=s512'
            check_req = urllib.request.Request(img_url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(check_req, timeout=5) as resp:
                if resp.status == 200:
                    live_urls[key] = img_url
                    print(f'[OK] {key}: {img_url}')
                else:
                    print(f'[FAIL] {key}: Status {resp.status}')
        else:
            print(f'[NO MATCH] {key}')
    except Exception as e:
        print(f'[ERROR] {key}: {e}')

live_urls['valorant'] = 'https://media.valorant-api.com/gamemodes/96012644-4cf7-86a8-8605-99ac6f8196e8/displayicon.png'

with open('live_game_urls.json', 'w', encoding='utf-8') as f:
    json.dump(live_urls, f, indent=2)

print('\nSaved live URLs to live_game_urls.json:')
print(json.dumps(live_urls, indent=2))
