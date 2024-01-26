CREATE EXTENSION IF NOT EXISTS "uuid-ossp"
    SCHEMA public
    VERSION "1.1";

CREATE EXTENSION IF NOT EXISTS citext
    SCHEMA public
    VERSION "1.6";

CREATE TABLE IF NOT EXISTS public.users
(
    id          uuid    NOT NULL DEFAULT uuid_generate_v4(),
    first_name  text    COLLATE pg_catalog."default",
    last_name   text    COLLATE pg_catalog."default",
    email       citext  COLLATE pg_catalog."default",
    password    text    COLLATE pg_catalog."default",
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT email UNIQUE (email)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.users
    OWNER to postgres;

CREATE TABLE IF NOT EXISTS public.refresh_tokens
(
    token       text               COLLATE pg_catalog."default" NOT NULL,
    expires_at  time without time zone NOT NULL,
    CONSTRAINT refresh_tokens_pkey PRIMARY KEY (token)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.refresh_tokens
    OWNER to postgres;