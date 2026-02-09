# Инструкция по загрузке на GitHub

## ⚠️ ВАЖНО: Git не установлен в системе!

## Вариант 1: GitHub Desktop (РЕКОМЕНДУЕТСЯ - проще всего)

1. Скачайте GitHub Desktop: https://desktop.github.com/
2. Установите и войдите в свой GitHub аккаунт
3. В GitHub Desktop: **File → Add Local Repository**
4. Выберите папку: `C:\Users\Falcons\Desktop\Web\ataix-kz-clone`
5. Нажмите **"Publish repository"**
6. Выберите ваш приватный репозиторий из списка
7. Готово!

## Вариант 2: Установить Git и использовать командную строку

### Шаг 1: Установите Git
Скачайте с https://git-scm.com/download/win

## Шаг 2: Создайте репозиторий на GitHub
1. Зайдите на github.com
2. Нажмите "+" → "New repository"
3. Укажите имя: `ataix-kz-clone`
4. НЕ добавляйте README, .gitignore или лицензию (они уже есть)
5. Нажмите "Create repository"

## Шаг 3: Выполните команды в терминале

Откройте PowerShell или Git Bash в папке проекта и выполните:

```bash
# Инициализация Git (если еще не инициализирован)
git init

# Добавление всех файлов
git add .

# Первый коммит
git commit -m "Initial commit"

# Добавление удаленного репозитория (замените YOUR_USERNAME на ваш GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/ataix-kz-clone.git

# Переименование ветки в main (если нужно)
git branch -M main

# Загрузка на GitHub
git push -u origin main
```

## Если репозиторий уже существует на GitHub

Если вы уже создали репозиторий на GitHub, GitHub покажет вам команды. Обычно это:

```bash
git remote add origin https://github.com/YOUR_USERNAME/ataix-kz-clone.git
git branch -M main
git push -u origin main
```

## Важно

- `.gitignore` уже настроен и исключает `node_modules`, `.next`, `.env` и другие ненужные файлы
- При первом `git push` вас попросят ввести логин и пароль (или токен доступа)
- Для безопасности лучше использовать Personal Access Token вместо пароля
