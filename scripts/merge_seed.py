import json

with open('data/seed_data.json', 'r', encoding='utf-8') as f:
    seed = json.load(f)

with open('data/ind_safety_cert.json', 'r', encoding='utf-8') as f:
    ind_cert = json.load(f)

with open('data/ind_safety_questions.json', 'r', encoding='utf-8') as f:
    ind_questions = json.load(f)

existing_certs = [c for c in seed.get('certifications', []) if c['id'] != 'ind_safety_engineer']
existing_certs.append(ind_cert)

existing_questions = [q for q in seed.get('sample_questions', []) if q.get('cert_id') != 'ind_safety_engineer']
existing_questions.extend(ind_questions)

merged_seed = {
    'certifications': existing_certs,
    'sample_questions': existing_questions
}

with open('data/seed_data.json', 'w', encoding='utf-8') as f:
    json.dump(merged_seed, f, ensure_ascii=False, indent=2)

print('Updated data/seed_data.json successfully')
for c in merged_seed['certifications']:
    s_cnt = len(c['subjects'])
    t_cnt = sum(len(subcat['topics']) for s in c['subjects'] for subcat in s['subcategories'])
    print(c['title'], c['id'], s_cnt, t_cnt)
