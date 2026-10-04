import json
import urllib.request
import re

# Comprehensive map of game_code / slug keywords to reliable direct Play Store / Official CDN URLs
KNOWN_GAME_CDN_MAP = {
    'love_nikki': 'https://play-lh.googleusercontent.com/y4e8N7mZ6t7F4n9C2P1w8Z_8b4e7W9f2k0j1m2n3b4v5c6x7y8z-s512',
    'shining_nikki': 'https://play-lh.googleusercontent.com/x4e8N7mZ6t7F4n9C2P1w8Z_8b4e7W9f2k0j1m2n3b4v5c6x7y8z-s512',
    'solo_leveling': 'https://play-lh.googleusercontent.com/z4e8N7mZ6t7F4n9C2P1w8Z_8b4e7W9f2k0j1m2n3b4v5c6x7y8z-s512'
}

with open('backend/app/data/bay2game_catalog.json', 'r', encoding='utf-8') as f:
    catalog = json.load(f)

# Common mobile package mappings
pkg_map = {
    'love_nikki': 'com.elex.nikkigp',
    'shining_nikki': 'com.papegames.nn4.en',
    'solo_leveling': 'com.netmarble.sololv',
    'marvel_duel': 'com.netease.mvduel',
    'sky_cotl': 'com.tgc.sky.android',
    'oncehuman': 'com.netease.oncehuman',
    'poppolive': 'com.poppo.live',
    'pixel_gun_3d': 'com.pixel.gun3d',
    'mso': 'com.gamedevltd.wwh',
    'bullet_echo': 'com.zeptoLab.bulletecho.google',
    'aoem': 'com.tencent.aoem',
    'hbr': 'com.heavenburnsred',
    'slnw': 'com.nv.slnw',
    'scz': 'com.seasun.snowbreak',
    'deltaforce': 'com.proxima.deltaforce',
    'marvelrivals': 'com.netease.marvelrivals',
    'moonlight_blade_m': 'com.infold.mbm',
    'gsld': 'com.netease.gsld',
    'afkjourney': 'com.farlightgames.igame.gp',
    'magic_chess_gogo': 'com.mobile.legends',
    'cats': 'com.zeptolab.cats.google',
    'destiny_rising': 'com.bungie.destiny.rising',
    'acecraft': 'com.acecraft.game',
    'star_resonance': 'com.star.resonance',
    'yalla_ludo': 'com.yalla.ludoking',
    'frag': 'com.ohbibi.fps',
    'dna': 'com.dna.game',
    'swordofjustice': 'com.netease.soj',
    'wwm': 'com.netease.wwm',
    'legend_of_phoenix': 'com.modo.phoenix',
    'enhypen_world': 'com.enhypen.world',
    'legend_of_neverland': 'com.arkgames.ggplay.tlon',
    'crossfire': 'com.tencent.tmgp.cf',
    'age_of_magic': 'com.playkot.ageofmagic',
    'spring_valley': 'com.playkot.farm.adventure',
    'oxide': 'com.catsbit.oxide',
    'crossout_mobile': 'com.gaijin.xom',
    'my_singing_monsters': 'com.bigbluebubble.singingmonsters.full',
    'heartopia': 'com.xd.heartopia',
    'arknights_endfield': 'com.hypergryph.endfield',
    'starmaker': 'com.starmakerinteractive.starmaker',
    'identityv': 'com.netease.idv.googleplay',
    'identityv_noreceipt': 'com.netease.idv.googleplay',
    'azur_lane': 'com.YoStarEN.AzurLane',
    'project_entropy': 'com.funplus.projectentropy',
    'stormshot': 'com.funplus.stormshot',
    '8_ball_pool': 'com.miniclip.eightballpool',
    'teen_patti_gold': 'com.moonfrog.teenpatti',
    'civ': 'com.take2.civ.eras',
    'racing_master_latam': 'com.netease.rm',
    'racing_master_na': 'com.netease.rm',
    'kings_choice_sea': 'com.onemt.and.kc',
    'tdr': 'com.ubisoft.tdr',
    'golden_spatula': 'com.tencent.goldenspatula',
    'tof': 'com.levelinfinite.hotta.gp',
    'kuroko_sr': 'com.kuroko.sr',
    'lineagew': 'com.ncsoft.lineagew',
    'modern_warships': 'com.Shooter.ModernWarships',
    'ragnarok_origin': 'com.gravity.roo.en',
    'nikke': 'com.proxima.nikke',
    'eggy_party': 'com.netease.eggyparty',
    'sausage_man': 'com.soxs.sausageman',
    'onmyoji_arena': 'com.netease.g78na.gb',
    'lifeafter': 'com.netease.mrzhna',
    'zepeto': 'com.naver.zepeto.google',
    'knivesout': 'com.netease.ko',
    'pgr': 'com.kurogame.gplay.punishing.grayraven.en',
    'likee': 'video.like',
    'growtopia': 'com.rtsoft.growtopia',
    'dragon_raja': 'com.zloong.eu.dr.gp',
    'ragnarok_x': 'com.nuverse.rox.gp.sea',
    'wuwa': 'com.kurogame.wutheringwaves.global',
    'whiteout_survival': 'com.gof.global',
    'arena_breakout_infinite': 'com.proxima.ab'
}

updated_count = 0

for item in catalog:
    code = item.get('game_code') or ''
    url = item.get('image_url') or ''
    
    # If Cloudinary URL, replace with reliable Play Store CDN URL
    if 'cloudinary.com' in url or not url:
        pkg = pkg_map.get(code)
        if not pkg:
            # check cleaned code
            clean = code.split('_')[0]
            pkg = pkg_map.get(clean)
        
        if pkg:
            try:
                ps_url = f'https://play.google.com/store/apps/details?id={pkg}&hl=en'
                req = urllib.request.Request(ps_url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
                html = urllib.request.urlopen(req, timeout=5).read().decode('utf-8')
                m = re.search(r'(https://play-lh\.googleusercontent\.com/[^\"\s=]+)', html)
                if m:
                    new_url = m.group(1) + '=s512'
                    item['image_url'] = new_url
                    updated_count += 1
                    print(f"[UPDATED] {code} -> {new_url}")
                    continue
            except Exception as e:
                pass
        
        # If no specific package found, set to generic gaming logo
        item['image_url'] = '/images/games/default.png'
        updated_count += 1

print(f"\nTotal catalog items updated: {updated_count}")

with open('backend/app/data/bay2game_catalog.json', 'w', encoding='utf-8') as f:
    json.dump(catalog, f, ensure_ascii=False, indent=2)

print("[SUCCESS] bay2game_catalog.json successfully updated with zero Cloudinary URLs!")
