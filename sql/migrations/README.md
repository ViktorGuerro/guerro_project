# SQL migrations

## Название миграций

Используйте последовательный формат:

- `000_create_schema_migrations.sql`
- `001_split_battle_overlay_to_attacker_and_target.sql`
- `002_add_dice_overlay_state.sql`

Правила:

- трёхзначный числовой префикс (`NNN_`);
- короткое и понятное описание одного изменения;
- одна миграция = одно логически цельное изменение.

## Применение

1. Проверить, что уже применено:

```sql
SELECT migration_name, applied_at
FROM schema_migrations
ORDER BY id;
```

2. Выполнить неприменённые файлы вручную по порядку имён.

Пример:

```bash
mysql -u guerro_user -p guerro_db < sql/migrations/003_expand_entities_side_enum_for_boss_and_npc.sql
```

## Отметка о выполнении

Каждая миграция должна завершаться записью в `schema_migrations`:

```sql
INSERT INTO schema_migrations (migration_name)
VALUES ('003_expand_entities_side_enum_for_boss_and_npc.sql')
ON DUPLICATE KEY UPDATE migration_name = migration_name;
```

## Важно

- `sql/init.sql` используйте только для установки новой БД с нуля.
- Для обновления рабочей БД используйте только `sql/migrations/*.sql`.
