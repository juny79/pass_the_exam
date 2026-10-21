import json
import os

base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
cert_path = os.path.join(base_dir, "data", "ind_safety_cert.json")

with open(cert_path, "r", encoding="utf-8") as f:
    cert = json.load(f)

youtube_templates = [
    {
        "channel": "산안기 합격 완성 (전설의 120제)",
        "mnemonic": "앞글자 두음 비법 및 현장 연계 핵심 암기",
        "lecture_summary": "1. 실기 필답형/작업형에 반드시 나오는 핵심 수치와 키워드를 정확하게 암기하세요.\n2. 산업안전보건법령 및 기술지침(KOSHA GUIDE)의 원문을 충실히 인용해야 만점 처리됩니다."
    },
    {
        "channel": "안전대장 TV",
        "mnemonic": "원리 이해를 통한 기출 변형 완벽 대응",
        "lecture_summary": "1. 단순 암기보다 왜 이런 방호장치와 안전거리가 필요한지 물리적/공학적 배경을 파악하세요.\n2. 계산 문제는 단위 환산(시간, 초, 분) 실수를 방지하는 것이 합격의 열쇠입니다."
    },
    {
        "channel": "에듀윌 산업안전 명강",
        "mnemonic": "기출 빈출 공식 및 법정 기준 마스터",
        "lecture_summary": "1. 빈출 60대 핵심 카테고리는 매회 출제되므로 반드시 눈에 익히세요.\n2. 작업형 동영상 문제는 화면의 위험요인 2가지와 예방대책 2가지를 쓰는 정형화된 패턴입니다."
    }
]

total_topics = 0
for s_idx, subj in enumerate(cert["subjects"]):
    for c_idx, cat in enumerate(subj["subcategories"]):
        for t_idx, topic in enumerate(cat["topics"]):
            total_topics += 1
            topic["id"] = f"{subj['code']}_{c_idx+1:02d}_{t_idx+1:02d}"
            topic["frequency"] = f"출제 확률 {topic.get('prob', '85%')} (필기/실기 빈출)"
            topic["probability"] = topic.get("prob", "85%")
            topic["core_concepts"] = topic.get("core", "")
            topic["practical_point"] = topic.get("prac", "")
            
            clean_title = topic["title"].replace("(", " ").replace(")", " ").replace("/", " ").replace(",", " ")
            topic["related_terms"] = [w.strip() for w in clean_title.split() if len(w.strip()) > 1][:5]
            
            tpl = youtube_templates[(s_idx + c_idx + t_idx) % len(youtube_templates)]
            mnemonic_kw = topic["related_terms"][0] if topic["related_terms"] else "핵심수칙"
            topic["youtube_tips"] = {
                "channel": tpl["channel"],
                "mnemonic": f"{topic['title'][:12]}... 암기 포인트: '{mnemonic_kw}'",
                "lecture_summary": f"💡 [{topic['title']}]\n{tpl['lecture_summary']}\n- 연계 핵심 키워드: {', '.join(topic['related_terms'][:3])}"
            }

with open(cert_path, "w", encoding="utf-8") as f:
    json.dump(cert, f, ensure_ascii=False, indent=2)

print(f"ind_safety_cert.json enriched: {total_topics} topics")
