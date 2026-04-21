ALTER TABLE dice_overlay_state
    ADD COLUMN roll_mode ENUM('normal', 'advantage', 'disadvantage') NOT NULL DEFAULT 'normal' AFTER label,
    ADD COLUMN advantage_values_json TEXT DEFAULT NULL AFTER dice_groups_json,
    ADD COLUMN selected_roll TINYINT UNSIGNED DEFAULT NULL AFTER advantage_values_json;
