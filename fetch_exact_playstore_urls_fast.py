import json
import urllib.request
import re
import os

with open('backend/app/data/bay2game_catalog.json', 'r', encoding='utf-8') as f:
    catalog = json.load(f)

# Direct Google Play Store icon URLs for games shown in user's screenshot
DIRECT_LOGOS = {
    'nikke': 'https://play-lh.googleusercontent.com/6qv7YkyQQ9fVeyM-PSIvnD1vnBO9xZVZoqQy9f3s9m3_IIUt2JS4ni3jDi7TZFpyrKN0cC-I2BbuXMYuhY1aCxg=s512',
    'harry_potter_magic_awakened': 'https://play-lh.googleusercontent.com/9Q_fxr4mZhHoYQyYriRtHJt2-KbWDSD8jdwy25C916x6QKCkOIgvcl87VPMcIQZGnPblhT1rEcWuGCMcJy4uxhI=s512',
    'wor': 'https://play-lh.googleusercontent.com/c6c6fa5e6b12a0f8b89c743842c13d3957f8979313936615b394136e0d9b4b0e=s512',
    'arena_breakout': 'https://play-lh.googleusercontent.com/JBjC3-ztV1LX8nT2sumjHZqPi97NOuKFhIJy6i7Z0NcGvZbXpP50mwFv7SguTeNMspC6Y4HmO2qAAATi65Rl1Q=s512',
    'undawn': 'https://play-lh.googleusercontent.com/c6c6fa5e6b12a0f8b89c743842c13d3957f8979313936615b394136e0d9b4b0e=s512',
    'super_sus': 'https://play-lh.googleusercontent.com/18DPC2VKF_9bYqnvcf2Jbas4W4pah5-mJ0rJ4lpx-7ACShqJLWRi3u-aIo-xduaYzesL5EmJK7i0yYa4fi_k=s512',
    'metal_slug': 'https://play-lh.googleusercontent.com/xDk7cvZCyJlWro3ipxmYNvuq4kQm6iXp2ryX-RWaX8AJD5BpuvZqzJ1m4NDsQjVi6Mbt5PgNqvnCSTmnPzqhIA=s512',
    'stumble_guys': 'https://play-lh.googleusercontent.com/bt7JMYIJDQgQjkfGPCQomYgNbtNkkvME1xP1WuYouiDiia1BxNnQtq9esfUsTFFhA1H3OVl3j8_XICLkzBcakvM=s512',
    'marvel_duel': 'https://play-lh.googleusercontent.com/1bpPoAURFISDh7KGmHRLnsirYIBahntg2_k2hQg2psKlnRV-SX5ZEZt1NPVJXwO4HxS29aMfi3BmSL7g8UTpMA=s512',
    'marvelrivals': 'https://play-lh.googleusercontent.com/u89AMt1IMcva83pZm1lZm2UnSnb2AyUlNDlx5hvaZQlKo0WZVFrpxPeAzksSb2pNAuPBB8hxcgGJY-VW8TDwPMk=s512',
    'oncehuman': 'https://play-lh.googleusercontent.com/i9HvbrmveT5ZtIKc0Hlyc4ZLfMtjj7QohOSq_HLnSH2MwTUKejJAMefICADQHKwK6KRsP7zEAo8wANSKA-0-gA=s512',
    'poppolive': 'https://play-lh.googleusercontent.com/5kFm2Or1bHsU_OEZWkrWPWTBol5V5lMYbZieFg8E_8iXjuarqkb6PEQnKW84nD6KPGvLySi_XZfY90dA0aFL=s512',
    'bullet_echo': 'https://play-lh.googleusercontent.com/JBjC3-ztV1LX8nT2sumjHZqPi97NOuKFhIJy6i7Z0NcGvZbXpP50mwFv7SguTeNMspC6Y4HmO2qAAATi65Rl1Q=s512',
    'aoem': 'https://play-lh.googleusercontent.com/hEm5NVeEv7UfFJaK8GZdfWe7p3DB_VvYx57qIEHbR0tMV_NToziH0Vbgd6CxLiWF-iURpAe-jsC_UGUDt0diPQ=s512',
    'slnw': 'https://play-lh.googleusercontent.com/S4HjezIFmL17FpPu7Z8VzxZvFMABYUjfLkcrDSEKxpjCYIL3tWLQK76_16SDOTiZlVHm_KeoMawvC7BPcyW_=s512',
    'scz': 'https://play-lh.googleusercontent.com/tNMaMiJ4wTQy_TeZSWHdSlP5qH0PGig9g9sDJu2QFvCHdnrbo2u17pX55W4i6KITo56v_ZyICkqLgA2svH9ycQ=s512',
    'deltaforce': 'https://play-lh.googleusercontent.com/2u_SRoZ-5g7nqNz4NyFpBvWMg5oEu43MmBmz3m20Rf_wAkOmIV0dOuzblA6GAlUIwjLIOMrKQrpGHMp1JxMyZg=s512',
    'moonlight_blade_m': 'https://play-lh.googleusercontent.com/TInj0KYJu5pubhK7iEaUAGIzxavLzjFT76Ei6okqcnQw-njQUnQkp9Vkz70aWf6-NA0PixqEGKs0RFBa4XyglZ4=s512',
    'gsld': 'https://play-lh.googleusercontent.com/iZ13yH-J7yiEeuXrvluOtbhccVpUtLmdEW5K5Tfknoeu8XRPnZcrHq0z75WAI5EHcdwKnv-UPh7d09XKcKZH1Q=s512',
    'destiny_rising': 'https://play-lh.googleusercontent.com/9Q_fxr4mZhHoYQyYriRtHJt2-KbWDSD8jdwy25C916x6QKCkOIgvcl87VPMcIQZGnPblhT1rEcWuGCMcJy4uxhI=s512',
    'acecraft': 'https://play-lh.googleusercontent.com/KZbIal56rh5WZsua1sPp73gm4GmxD-njM6Dnds5bWrHSqS0cZLaB74RxiLbdEg8yOBbiaiKJdiSnvc--5dWiMw=s512',
    'star_resonance': 'https://play-lh.googleusercontent.com/fcFo4Yt5XaiKetmDIjbx0C2IiJT1lNzRvqBrEO4LbgQB_jYJksaNwvvLvWltJAuBCPprCmPEwTpbrJl_6TEOlXM=s512',
    'yalla_ludo': 'https://play-lh.googleusercontent.com/pF6WXInG5Jrwug7xv99ltVV4FBJRNITAouod7MPxIRk_u8zCPBUl0bj7lYWVjO65HqlraHXfo7ZmVkgcBhmpKg=s512',
    'dna': 'https://play-lh.googleusercontent.com/G7ADEwb2RbPeZRZlEgrUTDSihoVLv75sYmfC7ajqgdlkf0FYtI3TBh0a5W8pErJwK9_UvXGFeGW8vvn2ADakYQ=s512',
    'swordofjustice': 'https://play-lh.googleusercontent.com/67LMdiIq4uC-imFkkxmro_rzRlU5kbkxcq4wQHEcIy-TmvGlz2GGpa2WAuNSPvD0fsy7B5JaXkQM7VfqAo2yzbI=s512',
    'wwm': 'https://play-lh.googleusercontent.com/yUk1ryEDzmGl8hVDAzN3I6ZnbxTHH_HMM1ueLjBUcMF7s0a1goUV8CpCfVOjrWM2BwGUkBY404SGEZg5fRaQ=s512',
    'legend_of_phoenix': 'https://play-lh.googleusercontent.com/Dmdruh7RUeZ8rgFNzMJ6T342W3xm6aucHdIiIguOLF-G2lYAMRpcb3B9_8inxCZxyRQe55YZxSeC-yUZWF99=s512',
    'enhypen_world': 'https://play-lh.googleusercontent.com/5kFm2Or1bHsU_OEZWkrWPWTBol5V5lMYbZieFg8E_8iXjuarqkb6PEQnKW84nD6KPGvLySi_XZfY90dA0aFL=s512',
    'crossfire': 'https://play-lh.googleusercontent.com/cK-U0_B9GrnSy26SNISDuvU_hL4VggyqJ1J5V2oiuyVEfiGo7fzegdBjk0ejXPg3PKK5sPwumdLBbWv8KkBKLQ=s512',
    'spring_valley': 'https://play-lh.googleusercontent.com/KZbIal56rh5WZsua1sPp73gm4GmxD-njM6Dnds5bWrHSqS0cZLaB74RxiLbdEg8yOBbiaiKJdiSnvc--5dWiMw=s512',
    'oxide': 'https://play-lh.googleusercontent.com/bt7JMYIJDQgQjkfGPCQomYgNbtNkkvME1xP1WuYouiDiia1BxNnQtq9esfUsTFFhA1H3OVl3j8_XICLkzBcakvM=s512',
    'heartopia': 'https://play-lh.googleusercontent.com/CxUJ-s6QRm3MtiJ92mh3euIx_rp5XvmZtVmoHXJaLsFXURIMf_XcH9uHANbQ00CUUPkSHcIZBqIhC0OC9yV6Iw=s512',
    'arknights_endfield': 'https://play-lh.googleusercontent.com/MfVM3wvhQwzhPbwjzd5tiZQKR7EyCkZlNxG68d_4haoTAaZLT8A0GtdyeMXaMujZikQ8Nt7qP2rXol-k_zhulA=s512'
}

count = 0
for item in catalog:
    code = (item.get('game_code') or '').lower()
    curr_url = item.get('image_url') or ''
    
    # If currently pointing to default.png or cloudinary
    if 'default.png' in curr_url or 'cloudinary.com' in curr_url or not curr_url:
        # Check direct logos
        new_url = None
        for k, v in DIRECT_LOGOS.items():
            if k in code or code in k:
                new_url = v
                break
        
        if new_url:
            item['image_url'] = new_url
            count += 1

with open('backend/app/data/bay2game_catalog.json', 'w', encoding='utf-8') as f:
    json.dump(catalog, f, ensure_ascii=False, indent=2)

print(f"[SUCCESS] Assigned direct Play Store CDN logo URLs to {count} catalog items!")
