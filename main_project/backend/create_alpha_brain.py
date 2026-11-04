import os
from PIL import Image
import numpy as np

src_path = r"C:\Users\P Keerthi\.gemini\antigravity-ide\brain\783a3d68-2381-4d76-8187-2c66eee64c85\glowing_brain_isolated_1792576210661.jpg"
out_dir = r"c:\Users\P Keerthi\Downloads\srkarthikeya1805 ps_adhd_2026 main adhd_backend\frontend\src\assets"

im = Image.open(src_path).convert("RGBA")
arr = np.array(im, dtype=np.float32)

# Calculate brightness / luminance
# arr[:, :, 0] = R, arr[:, :, 1] = G, arr[:, :, 2] = B
# Max channel brightness
max_ch = np.max(arr[:, :, :3], axis=2)

# Soft threshold: near pure black (<= 10) becomes 0 alpha
# Values above 10 ramp smoothly up to 255
alpha = np.clip((max_ch - 8.0) * (255.0 / (255.0 - 8.0)), 0, 255)

# For deep glow, let's ensure the brain itself is solid and outer glow fades smoothly
# Anything with brightness > 60 can have high alpha
solid_threshold = 40.0
alpha_boosted = np.where(max_ch > solid_threshold, 
                         np.minimum(255.0, 180.0 + (max_ch - solid_threshold) * (75.0 / (255.0 - solid_threshold))),
                         alpha)

arr[:, :, 3] = np.clip(alpha_boosted, 0, 255)

out_im = Image.fromarray(arr.astype(np.uint8), "RGBA")
out_path = os.path.join(out_dir, "brain_perfect_alpha.png")
out_im.save(out_path, "PNG")
print("Saved transparent brain asset to:", out_path)
print("Image size:", out_im.size)
