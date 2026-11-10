#!/bin/bash
# Remove ALL emoji from admin-super.html

file="admin-super.html"
backup="admin-super.html.backup"

# Create backup
cp "$file" "$backup"

# Remove emoji systematically
sed -i '' 's/💻//g' "$file"
sed -i '' 's/⚡//g' "$file"
sed -i '' 's/🤖//g' "$file"
sed -i '' 's/📸//g' "$file"
sed -i '' 's/🔄//g' "$file"
sed -i '' 's/✅//g' "$file"
sed -i '' 's/❌//g' "$file"
sed -i '' 's/⚠️//g' "$file"
sed -i '' 's/📡//g' "$file"
sed -i '' 's/🚀//g' "$file"
sed -i '' 's/✨//g' "$file"
sed -i '' 's/👋//g' "$file"
sed -i '' 's/🎉//g' "$file"
sed -i '' 's/🏢//g' "$file"
sed -i '' 's/✓//g' "$file"
sed -i '' 's/✗//g' "$file"

echo "Emoji removed from $file"
echo "Backup saved as $backup"
