// Database schema as TypeScript constant
export const SCHEMA_SQL = `
-- CMF Studio Database Schema

-- Access Codes Table
CREATE TABLE IF NOT EXISTS access_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code VARCHAR(255) UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Recommended Designs Table  
CREATE TABLE IF NOT EXISTS recommended_designs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500) NOT NULL,
    access_code VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (access_code) REFERENCES access_codes(code)
);

-- User Submissions Table
CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    access_code VARCHAR(255) NOT NULL,
    comment TEXT,
    generated_image_url VARCHAR(500) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (access_code) REFERENCES access_codes(code)
);

-- Original Images for Submissions
CREATE TABLE IF NOT EXISTS submission_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    submission_id INTEGER NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    image_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE
);

-- Insert Default Access Codes
INSERT OR IGNORE INTO access_codes (code) VALUES 
('RAONIX-2024'),
('PREMIUM-USER'),
('DEMO-ACCESS');

-- Insert Default Recommended Designs
INSERT OR IGNORE INTO recommended_designs (title, description, image_url, access_code) VALUES 
('Sporty Red Sneaker', 'A vibrant red sneaker concept in a glossy, durable plastic finish, perfect for an athletic look.', 'https://images.unsplash.com/photo-1542291026-7eec264c27ab?q=80&w=800&auto=format&fit=crop', 'RAONIX-2024'),
('Elegant Blue Headphones', 'Sleek blue headphones with a matte aluminum finish, combining style and premium sound quality.', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop', 'RAONIX-2024'),
('Modern Green Smartphone', 'A sophisticated green smartphone with brushed titanium accents and premium materials.', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop', 'PREMIUM-USER');
`;