import json
import os
import re

base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
page_path = os.path.join(base_dir, "frontend", "src", "app", "page.tsx")

# 1. Update frontend/src/app/page.tsx
with open(page_path, "r", encoding="utf-8") as f:
    page_text = f.read()

# Pattern 1: In the 3-tier accordion
pattern1 = re.compile(
    r'\n\s*<div className="flex items-center gap-2 p-2 bg-rose-950/40 rounded-lg border border-rose-800/40 text-rose-200 font-semibold">\s*<Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0" />\s*<span>.*?\{t\.youtube_tips\.mnemonic\}</span>\s*</div>',
    re.MULTILINE
)
page_text = pattern1.sub("", page_text)

# Pattern 2: In the grading result card
pattern2 = re.compile(
    r'\n\s*<div className="flex items-center gap-2 p-2 bg-rose-950/40 rounded-lg border border-rose-800/40 text-rose-200 font-semibold">\s*<Lightbulb className="w-3\.5 h-3\.5 text-amber-400 flex-shrink-0" />\s*<span>.*?\{result\.youtube_tips\.mnemonic\}</span>\s*</div>',
    re.MULTILINE
)
page_text = pattern2.sub("", page_text)

# Clean up label references
page_text = page_text.replace("유튜브 명강의 요약 & 두음 암기 비법", "유튜브 명강의 핵심 요약 특강")
page_text = page_text.replace("유튜브 명강의 요약 및 암기비법", "유튜브 명강의 발췌 요약")
page_text = page_text.replace("유튜브 명강의 요약 및 두음 암기 비법", "유튜브 명강의 핵심 요약")
page_text = page_text.replace("유튜브 명강의 요약 · AI 실기 채점", "유튜브 명강의 핵심 요약 · AI 실기 채점")

with open(page_path, "w", encoding="utf-8") as f:
    f.write(page_text)

print("frontend/src/app/page.tsx updated successfully!")

# 2. Update json datasets
def clean_mnemonic_from_cert(cert):
    for sub in cert.get("subjects", []):
        for cat in sub.get("subcategories", []):
            for t in cat.get("topics", []):
                yt = t.get("youtube_tips")
                if yt and "mnemonic" in yt:
                    yt["mnemonic"] = ""

for fname in ["ind_safety_cert.json", "seed_data.json", "processed_exam_data.json"]:
    fpath = os.path.join(base_dir, "data", fname)
    if os.path.exists(fpath):
        with open(fpath, "r", encoding="utf-8") as f:
            data = json.load(f)
        
        if "certifications" in data:
            for c in data["certifications"]:
                clean_mnemonic_from_cert(c)
        elif "subjects" in data:
            clean_mnemonic_from_cert(data)
            
        with open(fpath, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"Cleaned mnemonic from {fname}")
