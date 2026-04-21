ALTER TABLE entities
    MODIFY side ENUM('hero', 'enemy', 'boss', 'npc') NOT NULL;
