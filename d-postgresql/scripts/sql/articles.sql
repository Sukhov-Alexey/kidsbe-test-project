CREATE EXTENSION IF NOT EXISTS "uuid-ossp"
    SCHEMA public
    VERSION "1.1";

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
    RETURNS trigger
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE NOT LEAKPROOF
AS $BODY$
BEGIN
   NEW.updated_at = now(); 
   RETURN NEW;
END;
$BODY$;

CREATE OR REPLACE FUNCTION public.update_created_at_column()
    RETURNS trigger
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE NOT LEAKPROOF
AS $BODY$
BEGIN
   NEW.created_at = now(); 
   NEW.updated_at = now();
   RETURN NEW;
END;
$BODY$;

ALTER FUNCTION public.update_created_at_column()
    OWNER TO postgres;

ALTER FUNCTION public.update_updated_at_column()
    OWNER TO postgres;


CREATE TABLE IF NOT EXISTS public.articles
(
    id          uuid NOT NULL DEFAULT uuid_generate_v4(),
    author_id   uuid NOT NULL,
    title       text COLLATE pg_catalog."default",
    content     text COLLATE pg_catalog."default",
    created_at  timestamp without time zone NOT NULL,
    updated_at  timestamp without time zone NOT NULL,
    CONSTRAINT  articles_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.articles
    OWNER to postgres;

CREATE OR REPLACE TRIGGER update_articles_created_at
    BEFORE INSERT
    ON public.articles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_created_at_column();

CREATE OR REPLACE TRIGGER update_articles_updated_at
    BEFORE UPDATE 
    ON public.articles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.edits_history
(
    id          uuid NOT NULL DEFAULT uuid_generate_v4(),
    article_id  uuid NOT NULL,
    editor_id   uuid,
    created_at  timestamp without time zone NOT NULL,
    updated_at  timestamp without time zone,
    CONSTRAINT edits_history_pkey PRIMARY KEY (id),
    CONSTRAINT edits_history_article_id_fkey FOREIGN KEY (article_id)
        REFERENCES public.articles (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
        NOT VALID
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.edits_history
    OWNER to postgres;

CREATE OR REPLACE TRIGGER update_history_created_at
    BEFORE INSERT
    ON public.edits_history
    FOR EACH ROW
    EXECUTE FUNCTION public.update_created_at_column();