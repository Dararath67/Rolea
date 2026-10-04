import os
import glob
from PIL import Image, ImageFilter, ImageEnhance, ImageDraw

def create_gradient_background(width, height, color1, color2):
    base = Image.new('RGBA', (width, height), color1)
    top = Image.new('RGBA', (width, height), color2)
    mask = Image.new('L', (width, height))
    draw = ImageDraw.Draw(mask)
    for y in range(height):
        # radial/diagonal blend
        alpha = int(255 * (y / height))
        draw.line([(0, y), (width, y)], fill=alpha)
    base.paste(top, (0, 0), mask)
    return base

game_themes = {
    'mlbb': ((10, 25, 47, 255), (30, 58, 138, 255)),
    'freefire': ((15, 23, 42, 255), (194, 65, 12, 255)),
    'pubg': ((9, 13, 22, 255), (217, 119, 6, 255)),
    'hok': ((30, 27, 75, 255), (107, 33, 168, 255)),
    'valorant': ((15, 23, 42, 255), (220, 38, 38, 255)),
    'wildrift': ((6, 78, 59, 255), (2, 132, 199, 255)),
    'bloodstrike': ((69, 10, 10, 255), (153, 27, 27, 255)),
    'fcmobile': ((6, 78, 59, 255), (5, 150, 105, 255)),
    'roblox': ((30, 41, 59, 255), (225, 29, 72, 255)),
    'genshin': ((8, 51, 68, 255), (2, 132, 199, 255)),
    'codm': ((15, 23, 42, 255), (101, 163, 13, 255)),
    'clashofclans': ((120, 53, 15, 255), (217, 119, 6, 255)),
    'brawlstars': ((30, 58, 138, 255), (234, 179, 8, 255)),
    'aov': ((59, 7, 100, 255), (37, 99, 235, 255)),
    'steam': ((27, 40, 56, 255), (42, 71, 94, 255)),
    'chatgpt': ((15, 23, 42, 255), (13, 148, 136, 255)),
    'canva': ((6, 182, 212, 255), (59, 130, 246, 255)),
    'netflix': ((69, 10, 10, 255), (220, 38, 38, 255)),
    'spotify': ((9, 13, 22, 255), (22, 163, 74, 255)),
    'youtube': ((15, 23, 42, 255), (220, 38, 38, 255)),
    'cellcard': ((194, 65, 12, 255), (234, 88, 12, 255)),
    'smart': ((21, 128, 61, 255), (34, 197, 94, 255)),
    'metfone': ((185, 28, 28, 255), (220, 38, 38, 255))
}

CARD_W, CARD_H = 800, 500

os.makedirs('public/images/games', exist_ok=True)

for key, (c1, c2) in game_themes.items():
    file_path = f'public/images/games/{key}.png'
    if not os.path.exists(file_path):
        print(f'Missing icon for {key}')
        continue

    try:
        icon_img = Image.open(file_path).convert('RGBA')

        # Create gradient canvas
        bg = create_gradient_background(CARD_W, CARD_H, c1, c2)

        # Ambient backdrop blur from scaled icon
        backdrop = icon_img.resize((CARD_W, CARD_H), Image.Resampling.LANCZOS)
        backdrop = backdrop.filter(ImageFilter.GaussianBlur(radius=40))
        enhancer = ImageEnhance.Brightness(backdrop)
        backdrop = enhancer.enhance(0.45)

        bg.paste(backdrop, (0, 0), backdrop)

        # Scale main icon nicely inside the card (e.g. 360x360 or max bound)
        max_size = 380
        icon_w, icon_h = icon_img.size
        scale = min(max_size / icon_w, max_size / icon_h)
        new_w, new_h = int(icon_w * scale), int(icon_h * scale)
        scaled_icon = icon_img.resize((new_w, new_h), Image.Resampling.LANCZOS)

        # Center position
        pos_x = (CARD_W - new_w) // 2
        pos_y = (CARD_H - new_h) // 2

        # Create soft shadow behind main icon
        shadow = Image.new('RGBA', (new_w + 40, new_h + 40), (0, 0, 0, 0))
        shadow_icon = Image.new('RGBA', (new_w, new_h), (0, 0, 0, 180))
        shadow.paste(shadow_icon, (20, 20), scaled_icon)
        shadow = shadow.filter(ImageFilter.GaussianBlur(radius=20))

        bg.paste(shadow, (pos_x - 20, pos_y - 15), shadow)
        bg.paste(scaled_icon, (pos_x, pos_y), scaled_icon)

        bg.save(file_path, 'PNG', optimize=True)
        print(f'Successfully generated HD game card for {key}.png')
    except Exception as e:
        print(f'Failed to generate card for {key}: {e}')
