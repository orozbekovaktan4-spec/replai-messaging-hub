#!/bin/bash

echo "📦 Создание пакета для программистов..."
echo ""

cd /Users/ak

# Удалить старый архив если есть
rm -f replai-design-package.zip

echo "🗜️  Создание ZIP архива (это займёт ~30 секунд)..."

# Создать ZIP без node_modules, .git, секретов
zip -r replai-design-package.zip replai \
  -x "*/node_modules/*" \
  -x "*/.git/*" \
  -x "*/.DS_Store" \
  -x "*/pnpm-lock.yaml" \
  -x "*/dist/*" \
  -x "*/build/*" \
  -x "*/.next/*" \
  -x "replai/.env" \
  > /dev/null 2>&1

# Проверить размер
SIZE=$(du -h replai-design-package.zip | cut -f1)

echo ""
echo "✅ Пакет создан!"
echo ""
echo "📊 Информация:"
echo "   Файл: /Users/ak/replai-design-package.zip"
echo "   Размер: $SIZE"
echo ""
echo "📤 Следующий шаг:"
echo "   1. Загрузи на Google Drive / Dropbox / WeTransfer"
echo "   2. Отправь ссылку программисту"
echo "   3. Используй шаблон из КАК-ОТПРАВИТЬ-ПРОГРАММИСТАМ.md"
echo ""
echo "🎉 Готово!"
