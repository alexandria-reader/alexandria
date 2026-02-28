CREATE TYPE wordstatus AS ENUM ('learning', 'familiar', 'learned');

DROP TABLE IF EXISTS match_girl;
DROP TABLE IF EXISTS webdictionary_preferences;
DROP TABLE IF EXISTS users_words;
DROP TABLE IF EXISTS users_translations;
DROP TABLE IF EXISTS webdictionaries;
DROP TABLE IF EXISTS translations;
DROP TABLE IF EXISTS reading_progress;
DROP TABLE IF EXISTS texts;
DROP TABLE IF EXISTS words;
DROP TABLE IF EXISTS admins;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS languages;


CREATE TABLE languages (
    id varchar(4) PRIMARY KEY,
    "name" varchar(32) UNIQUE NOT NULL,
    flag varchar(4) NOT NULL,
    each_char_is_word boolean DEFAULT false,
    is_right_to_left boolean DEFAULT false
);


CREATE TABLE users (
    id integer PRIMARY KEY GENERATED ALWAYS AS identity,
    username text NOT NULL,
    password_hash text NOT NULL,
    email text UNIQUE NOT NULL,
    known_language_id varchar(4) REFERENCES languages (id) NOT NULL,
    learn_language_id varchar(4) REFERENCES languages (id) NOT NULL,
    verified boolean DEFAULT false,
    verification_code text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);


CREATE TABLE admins (
    user_id int PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE
);


CREATE TABLE words (
    id integer PRIMARY KEY GENERATED ALWAYS AS identity,
    language_id varchar(4) NOT NULL REFERENCES languages (id) ON DELETE CASCADE,
    word text NOT NULL,
    ts_config regconfig NOT NULL,
    tsquery_simple tsquery
        GENERATED ALWAYS AS (phraseto_tsquery('simple', word)) STORED,
    tsquery_language tsquery
        GENERATED ALWAYS AS (phraseto_tsquery(ts_config, word)) STORED
);


CREATE TABLE texts (
    id integer PRIMARY KEY GENERATED ALWAYS AS identity,
    user_id int NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    language_id varchar(4) NOT NULL REFERENCES languages (id),
    title text NOT NULL,
    author text,
    body text NOT NULL,
    ts_config regconfig NOT NULL,
    tsvector_simple tsvector 
        GENERATED ALWAYS AS (to_tsvector('simple', title || ' ' || body)) STORED,
    tsvector_language tsvector
        GENERATED ALWAYS AS (to_tsvector(ts_config, title || ' ' || body)) STORED,
    source_url text,
    source_type text,
    upload_time timestamptz DEFAULT now(),
    last_opened timestamptz,
    is_public boolean DEFAULT false
);


CREATE INDEX ts_simple_idx ON texts USING GIN (tsvector_simple);
CREATE INDEX ts_language_idx ON texts USING GIN (tsvector_language);


CREATE TABLE translations (
    id integer PRIMARY KEY GENERATED ALWAYS AS identity,
    word_id int NOT NULL REFERENCES words (id) ON DELETE CASCADE,
    target_language_id varchar(4) NOT NULL REFERENCES languages (id) ON DELETE CASCADE,
    translation text NOT NULL
);


CREATE TABLE webdictionaries (
    id integer PRIMARY KEY GENERATED ALWAYS AS identity,
    source_language_id varchar(4) NOT NULL REFERENCES languages (id) ON DELETE CASCADE,
    target_language_id varchar(4) NOT NULL REFERENCES languages (id) ON DELETE CASCADE,
    "name" text NOT NULL,
    "url" text NOT NULL
);


CREATE TABLE users_translations (
    user_id int NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    translation_id int NOT NULL REFERENCES translations (id) ON DELETE CASCADE,
    context text DEFAULT '',
    date_created timestamptz DEFAULT now(),
    PRIMARY KEY (user_id, translation_id)
);


CREATE TABLE users_words (
    user_id int NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    word_id int NOT NULL REFERENCES words (id) ON DELETE CASCADE,
    word_status wordstatus NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    PRIMARY KEY (user_id, word_id)
);


CREATE TABLE webdictionary_preferences (
    user_id int NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    webdictionary_id int NOT NULL REFERENCES webdictionaries (id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, webdictionary_id)
);

CREATE TABLE match_girl (
    language_id varchar(4) PRIMARY KEY REFERENCES languages (id) ON DELETE CASCADE,
    title text NOT NULL,
    body text NOT NULL
);

CREATE TABLE reading_progress (
    user_id int NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    text_id int NOT NULL REFERENCES texts (id) ON DELETE CASCADE,
    page_start_word_index int NOT NULL DEFAULT 0,
    updated_at timestamptz DEFAULT now(),
    PRIMARY KEY (user_id, text_id)
);
