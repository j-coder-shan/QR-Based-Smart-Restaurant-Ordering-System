INSERT INTO license_keys (key_code, is_used) 
VALUES ('RESTO-A13D-LCWS', false) 
ON CONFLICT (key_code) DO NOTHING;
