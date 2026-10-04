import json
import urllib.request
import urllib.parse
import re

with open('backend/app/data/bay2game_catalog.json', 'r', encoding='utf-8') as f:
    catalog = json.load(f)

# Package mapping dictionary for all games in the catalog
pkg_dict = {
    'nikke': 'com.proxima.nikke',
    'harry_potter_magic_awakened': 'com.netease.harrypotter.en',
    'undawn': 'com.garena.game.undawn',
    'wor': 'com.garena.game.undawn',
    'arena_breakout': 'com.proxima.ab',
    'arena_breakout_infinite': 'com.proxima.ab',
    'super_sus': 'com.pi23.game',
    'metal_slug': 'com.vng.metalslug',
    'stumble_guys': 'com.kitkagames.fallbuddies',
    'bigo': 'sg.bigo.live',
    'ragnarok_origin': 'com.gravity.roo.en',
    'identityv': 'com.netease.idv.googleplay',
    'identityv_noreceipt': 'com.netease.idv.googleplay',
    'maplestorym': 'com.nexon.maplem.global',
    'fifa': 'com.ea.gp.fifamobile',
    'eafc': 'com.ea.gp.fifamobile',
    'revelation': 'com.vng.revelation',
    'legends_of_runeterra': 'com.riotgames.legendsofruneterra',
    'teamfight_tactics': 'com.riotgames.league.teamfighttactics',
    'xbox': 'com.microsoft.xboxone.smartglass',
    'roblox': 'com.roblox.client',
    'pubg': 'com.tencent.ig',
    'gemini': 'com.google.android.apps.bard',
    'freefire': 'com.dts.freefireth',
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
    'azur_lane': 'com.YoStarEN.AzurLane',
    'project_entropy': 'com.funplus.projectentropy',
    'stormshot': 'com.funplus.stormshot',
    '8_ball_pool': 'com.miniclip.eightballpool',
    'teen_patti_gold': 'com.moonfrog.teenpatti',
    'civ': 'com.take2.civ.eras',
    'racing_master': 'com.netease.rm',
    'kings_choice': 'com.onemt.and.kc',
    'tdr': 'com.ubisoft.tdr',
    'golden_spatula': 'com.tencent.goldenspatula',
    'tof': 'com.levelinfinite.hotta.gp',
    'kuroko_sr': 'com.kuroko.sr',
    'lineagew': 'com.ncsoft.lineagew',
    'modern_warships': 'com.Shooter.ModernWarships',
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
    'eggy_party': 'com.netease.eggyparty',
    'sausage_man': 'com.soxs.sausageman',
    'onmyoji_arena': 'com.netease.g78na.gb'
}

def search_playstore_icon(query):
    try:
        q_enc = urllib.parse.quote(query)
        search_url = f"https://play.google.com/store/search?q={q_enc}&c=apps&hl=en"
        req = urllib.request.Request(search_url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        html = urllib.request.urlopen(req, timeout=5).read().decode('utf-8')
        m = re.search(r'(https://play-lh\.googleusercontent\.com/[^\"\s=]+)', html)
        if m:
            return m.group(1) + '=s512'
    except Exception as e:
        pass
    return None

updated_count = 0

for item in catalog:
    code = (item.get('game_code') or '').lower()
    name = item.get('name') or ''
    current_url = item.get('image_url') or ''
    
    # If default.png or cloudinary.com or empty
    if 'default.png' in current_url or 'cloudinary.com' in current_url or not current_url:
        pkg = None
        for k, p in pkg_dict.items():
            if k in code or code in k:
                pkg = p
                break
        
        found_url = None
        if pkg:
            try:
                ps_url = f'https://play.google.com/store/apps/details?id={pkg}&hl=en'
                req = urllib.request.Request(ps_url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
                html = urllib.request.urlopen(req, timeout=5).read().decode('utf-8')
                m = re.search(r'(https://play-lh\.googleusercontent\.com/[^\"\s=]+)', html)
                if m:
                    found_url = m.group(1) + '=s512'
            except Exception:
                pass
        
        if not found_url:
            # Fallback search Play Store with game name
            found_url = search_playstore_icon(name)
        
        if found_url:
            item['image_url'] = found_url
            updated_count += 1
            print(f"[FOUND ICON] {code} ({name}) -> {found_url}")
        else:
            item['image_url'] = '/images/games/default.png'
            print(f"[NO ICON FOUND] {code} ({name})")

with open('backend/app/data/bay2game_catalog.json', 'w', encoding='utf-8') as f:
    json.dump(catalog, f, ensure_ascii=False, indent=2)

print(f"\n[DONE] Updated {updated_count} game icons in catalog!")
