"""Read the supplied workbook; apply only the decisions from the design interview."""
import json
import re
import argparse
from pathlib import Path
import openpyxl

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('workbook', type=Path, help='Path to the source Skill rework workbook')
source = parser.parse_args().workbook
sheet = openpyxl.load_workbook(source, data_only=True)['Reduced Skill List']
descriptions = {
    'Bureaucracy': 'Navigate official procedures, paperwork, and administrative institutions.',
    'Commerce': 'Appraise goods, understand markets, and conduct trade.',
    'Instruction': 'Teach skills, explain concepts, and guide others through practice.',
    'Survival': 'Find food, water, and shelter, and cope with hazards in the wilderness.',
    'Research': 'Find and interpret information in books, records, and other sources.',
    'Brawn': 'Lift, push, and pull heavy objects, and force open or break physical obstacles.',
    'Athletics': 'Climb, jump, run, and perform demanding feats of physical movement.',
    'Hide': 'Conceal yourself and move quietly to avoid detection.',
    'Disrupt Magic': 'Interfere with and disrupt magical effects.',
    'Escape Artist': 'Escape restraints and open locks without the proper key.',
    'Rumors': 'Gather local information and assess the credibility and significance of gossip.',
}
catalog = []
for name, alternate, group, attribute, kind, description in sheet.iter_rows(min_row=2, max_col=6, values_only=True):
    if not name:
        continue
    template = name.endswith(' (any)')
    name = name.removesuffix(' (any)')
    choices = [v.strip().replace('Startegy', 'Strategy') for v in (alternate or '').split('/') if v.strip()]
    if name == 'Athletics':
        choices = [v for v in choices if v != 'Lift']
    if name == 'Brawn':
        group, attribute = 'Exploration', 'Might'
    catalog.append({
        'id': re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-'),
        'name': name,
        'aliases': [] if template else choices,
        'suggestions': choices if template else [],
        'template': template,
        'group': group,
        'attribute': attribute.strip(),
        'type': kind,
        'description': descriptions.get(name, description),
    })
assert len(catalog) == 44
target = Path(__file__).resolve().parent.parent / 'public' / 'catalog.js'
target.write_text('// Reviewed Reduced Skill List; see docs/requirements.md for campaign decisions.\nexport const CATALOG = ' + json.dumps(catalog, ensure_ascii=False, indent=2) + ';\n', encoding='utf-8')
print(f'Imported {len(catalog)} reviewed skills.')
