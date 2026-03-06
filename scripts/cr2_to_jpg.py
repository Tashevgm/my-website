import os
from pathlib import Path
import rawpy
from PIL import Image
from tqdm import tqdm


def convert_folder(photos_dir: Path, out_dir: Path, quality: int = 95):
    out_dir.mkdir(parents=True, exist_ok=True)
    files = [p for p in photos_dir.iterdir() if p.suffix.lower() == '.cr2']
    if not files:
        print('No .CR2 files found in', photos_dir)
        return

    for p in tqdm(files, desc='Converting'):
        out_path = out_dir / (p.stem + '.jpg')
        if out_path.exists():
            continue
        try:
            with rawpy.imread(str(p)) as raw:
                rgb = raw.postprocess(use_camera_wb=True, output_bps=8, no_auto_bright=True, half_size=False)
            img = Image.fromarray(rgb)
            img.save(out_path, 'JPEG', quality=quality)
        except Exception as e:
            print('Failed to convert', p.name, '-', e)


if __name__ == '__main__':
    base = Path(__file__).resolve().parents[1]
    photos = base / 'Photos'
    output = base / 'Photos_converted'
    print('Source:', photos)
    print('Output:', output)
    convert_folder(photos, output)
    print('Done.')
