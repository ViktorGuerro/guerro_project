ALTER TABLE dice_overlay_state
    ADD COLUMN dice_groups_json TEXT DEFAULT NULL AFTER label;
