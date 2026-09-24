from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
EXTS = {".ts", ".tsx", ".css", ".js", ".jsx", ".py"}
files = [p for p in ROOT.rglob("*") if p.is_file() and p.suffix in EXTS]
counts = {ext: sum(1 for p in files if p.suffix == ext) for ext in sorted(EXTS)}
print("WEARO repository audit")
print(f"Project: {ROOT.name}")
print(f"Source files: {len(files)}")
for ext, count in counts.items():
    print(f"{ext:>4}: {count}")
large = sorted(((p.stat().st_size, p.relative_to(ROOT)) for p in files), reverse=True)[:10]
print("Largest source files:")
for size, path in large:
    print(f"{size:>8} bytes  {path}")
