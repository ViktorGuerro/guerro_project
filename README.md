# guerro_project

Каркас веб-приложения для DnD-интерфейса (`master / players / viewers`) на чистом PHP + JS + MySQL.

## Требования

- PHP 8.1+ с расширениями: `pdo_mysql`, `fileinfo`, `json`
- MySQL 8.0+ (или MariaDB с поддержкой `ENUM` и `ON UPDATE CURRENT_TIMESTAMP`)
- Веб-сервер (Nginx/Apache) с корнем проекта на эту директорию

## Работа с БД

### Базовые правила

- `sql/init.sql` — **только для новой установки с нуля**.
- `sql/migrations/*.sql` — **только для обновления существующей БД**.
- Любая новая фича, которая меняет схему БД (таблицы, колонки, `ENUM`, индексы, FK, overlay/dice/battle-таблицы), должна включать:
  1. отдельную миграцию в `sql/migrations/`;
  2. обновление `sql/init.sql` до актуального снимка схемы;
  3. запись о применении в `schema_migrations` внутри самой миграции.

> Важно: не используйте обновлённый `sql/init.sql` как способ обновить рабочую базу.
> `CREATE TABLE IF NOT EXISTS` не заменяет миграции и не обновляет существующие структуры (`ENUM`, `ALTER COLUMN`, новые FK и т.д.).

### Новая установка

1. Создайте БД и пользователя, например:
   - БД: `guerro_db`
   - пользователь: `guerro_user`
2. Импортируйте полную схему:

```bash
mysql -u guerro_user -p guerro_db < sql/init.sql
```

### Обновление существующей БД

1. Откройте `sql/migrations/` и выберите ещё не применённые файлы в порядке имён (`000_...`, `001_...`, `002_...`).
2. Перед запуском можно проверить журнал миграций:

```sql
SELECT migration_name, applied_at
FROM schema_migrations
ORDER BY id;
```

3. Выполните миграции через штатный раннер:

```bash
php bin/migrate.php
```

4. После деплоя обязательно применяйте все новые миграции перед запуском приложения в production.

## Настройка подключения к БД

Откройте `inc/config.php` и заполните блок `db`:

- `host`
- `port`
- `dbname`
- `user`
- `pass`
- `charset`

Минимум нужно заменить `pass` (по умолчанию `CHANGE_ME`).

## Права на директории загрузок

Приложению нужны права записи в:

- `uploads/maps/`
- `uploads/tokens/`

Пример:

```bash
chmod -R 775 uploads
chown -R www-data:www-data uploads
```

(подставьте пользователя вашего веб-сервера при необходимости).

## Основные URL

- `/master.php` — экран мастера
- `/players.php` — экран игроков
- `/viewers.php` — экран зрителей
- `/operator.php` — экран оператора для управления СЛ с телефона

## API (кратко)

- `GET /api/state.php`
- `POST /api/toggle_mode.php`
- `POST /api/update_state.php`
- `POST /api/upload_map.php`
- `GET /api/list_maps.php`
- `POST /api/show_dc.php`
- `POST /api/hide_dc.php`
- `POST /api/save_entity.php`
- `POST /api/delete_entity.php`
- `POST /api/add_icon.php`
- `POST /api/move_icon.php`
- `POST /api/delete_icon.php`
- `POST /api/show_roll_result_overlay.php`
- `POST /api/hide_roll_result_overlay.php`


## Кодировка и collation

- Ожидаемая кодировка: `utf8mb4`.
- Ожидаемое сравнение строк: `utf8mb4_general_ci`.
- `sql/init.sql` и миграции приведены к единому стилю сравнения во избежание `Illegal mix of collations`.
