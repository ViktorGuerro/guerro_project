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
2. Импортируйте схему:

```bash
mysql -u guerro_user -p guerro_db < sql/init.sql
```

Для существующих установок применяйте SQL-миграции из `sql/migrations/` по порядку (например, через mysql-клиент).

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
- `POST /api/show_dice_overlay.php`
- `POST /api/hide_dice_overlay.php`
