from PIL import Image, ImageDraw, ImageFilter
import os

W, H = 800, 500

# Deep obsidian dark gaming canvas
base = Image.new('RGBA', (W, H), (15, 23, 42, 255))
top = Image.new('RGBA', (W, H), (30, 58, 138, 255))

mask = Image.new('L', (W, H))
draw_m = ImageDraw.Draw(mask)
for y in range(H):
    alpha = int(255 * (y / H))
    draw_m.line([(0, y), (W, y)], fill=alpha)

base.paste(top, (0, 0), mask)

# Draw central game controller emblem
draw = ImageDraw.Draw(base)

# Glow circle behind controller
glow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
glow_draw = ImageDraw.Draw(glow)
glow_draw.ellipse([(W//2 - 140, H//2 - 140), (W//2 + 140, H//2 + 140)], fill=(59, 130, 246, 120))
glow = glow.filter(ImageFilter.GaussianBlur(radius=40))
base.paste(glow, (0, 0), glow)

# Controller body
ctrl_box = [(W//2 - 120, H//2 - 70), (W//2 + 120, H//2 + 70)]
draw.rounded_rectangle(ctrl_box, radius=40, fill=(30, 41, 59, 240), outline=(96, 165, 250, 255), width=4)

# D-pad (left)
draw.rectangle([(W//2 - 80, H//2 - 25), (W//2 - 50, H//2 + 25)], fill=(226, 232, 240, 255))
draw.rectangle([(W//2 - 95, H//2 - 10), (W//2 - 35, H//2 + 10)], fill=(226, 232, 240, 255))

# Action Buttons (right)
draw.ellipse([(W//2 + 50, H//2 - 30), (W//2 + 70, H//2 - 10)], fill=(239, 68, 68, 255))
draw.ellipse([(W//2 + 70, H//2 - 10), (W//2 + 90, H//2 + 10)], fill=(34, 197, 94, 255))
draw.ellipse([(W//2 + 30, H//2 - 10), (W//2 + 50, H//2 + 10)], fill=(234, 179, 8, 255))
draw.ellipse([(W//2 + 50, H//2 + 10), (W//2 + 70, H//2 + 30)], fill=(59, 130, 246, 255))

out_path = os.path.join('public', 'images', 'games', 'default.png')
base.save(out_path, 'PNG')
print(f"[SUCCESS] Saved default game card to {out_path}")
