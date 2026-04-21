# guerro_project

Каркас веб-приложения для DnD-интерфейса (`master / players / viewers`) на чистом PHP + JS + MySQL.

## Требования

- PHP 8.1+ с расширениями: `pdo_mysql`, `fileinfo`, `json`
- MySQL 8.0+ (или MariaDB с поддержкой `ENUM` и `ON UPDATE CURRENT_TIMESTAMP`)
- Веб-сервер (Nginx/Apache) с корнем проекта на эту директорию

## Настройка базы данных

1. Создайте БД и пользователя, например:
   - БД: `guerro_db`
   - пользователь: `guerro_user`
2. Для новой установки импортируйте базовую схему:

```bash
mysql -u guerro_user -p guerro_db < sql/init.sql
```

3. После обновления проекта применяйте новые миграции из `sql/migrations/` (по порядку файлов):

```bash
mysql -u guerro_user -p guerro_db < sql/migrations/000_create_schema_migrations.sql
mysql -u guerro_user -p guerro_db < sql/migrations/001_split_battle_overlay_to_attacker_and_target.sql
```

`sql/init.sql` используется только для развёртывания с нуля. Обновления существующей БД должны идти через миграции из `sql/migrations/`.

### Правило изменений схемы

При каждом изменении структуры БД:

1. Обновляйте `sql/init.sql` для новых установок.
2. Добавляйте отдельную миграцию в `sql/migrations/`.
3. Обновляйте README, если поменялся процесс установки/обновления.

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
