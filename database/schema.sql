-- RecipeVault database schema
-- Spring Boot / Hibernate will auto-create these via ddl-auto=update,
-- but this file is here so you can inspect/run the schema manually
-- and so it's visible in your repo as a design artifact.

CREATE DATABASE IF NOT EXISTS recipevault;
USE recipevault;

CREATE TABLE IF NOT EXISTS users (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(100)  NOT NULL,
    email         VARCHAR(150)  NOT NULL UNIQUE,
    password      VARCHAR(255)  NOT NULL,   -- BCrypt hash, never plaintext
    created_at    DATETIME      NOT NULL
);

CREATE TABLE IF NOT EXISTS recipes (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id        BIGINT        NOT NULL,
    title          VARCHAR(150)  NOT NULL,
    description    VARCHAR(1000),
    ingredients    TEXT          NOT NULL,
    instructions   TEXT          NOT NULL,
    image_url      VARCHAR(500),
    recipe_url     VARCHAR(500),
    category       VARCHAR(50),
    cooking_time   VARCHAR(50),
    servings       VARCHAR(30),
    difficulty     VARCHAR(20),
    visibility     ENUM('PUBLIC', 'PRIVATE') NOT NULL DEFAULT 'PUBLIC',
    created_at     DATETIME      NOT NULL,
    updated_at     DATETIME      NOT NULL,
    CONSTRAINT fk_recipes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_recipes_title (title),
    INDEX idx_recipes_category (category),
    INDEX idx_recipes_visibility (visibility)
);

CREATE TABLE IF NOT EXISTS saved_recipes (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT NOT NULL,
    recipe_id   BIGINT NOT NULL,
    saved_at    DATETIME NOT NULL,
    CONSTRAINT fk_saved_user   FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE,
    CONSTRAINT fk_saved_recipe FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    UNIQUE KEY uq_user_recipe (user_id, recipe_id)
);
