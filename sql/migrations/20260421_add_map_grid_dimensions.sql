ALTER TABLE maps
    ADD COLUMN grid_cols INT NOT NULL DEFAULT 32 AFTER original_name,
    ADD COLUMN grid_rows INT NOT NULL DEFAULT 18 AFTER grid_cols;
