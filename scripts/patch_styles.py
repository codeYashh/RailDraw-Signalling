import re

path = r'apk_decompiled\res\values\styles.xml'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove problematic items
items_to_remove = [
    r'<item name="displayOptions">.*?</item>',
    r'<item name="showDividers">.*?</item>',
    r'<item name="boxBackgroundMode">.*?</item>',
    r'<item name="behavior_peekHeight">.*?</item>',
    r'<item name="autoSizeTextType">.*?</item>',
    r'<item name="endIconMode">.*?</item>',
]

for pattern in items_to_remove:
    content = re.sub(pattern, '', content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print('styles.xml updated, items removed!')
