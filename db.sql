CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; 
CREATE EXTENSION IF NOT EXISTS "citext"; 

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now(); 
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_articles_updated_at BEFORE UPDATE
ON articles FOR EACH ROW EXECUTE PROCEDURE 
update_updated_at_column();