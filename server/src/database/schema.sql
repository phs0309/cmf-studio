-- CMF Studio Database Schema (PostgreSQL)

-- Access Codes Table
CREATE TABLE IF NOT EXISTS access_codes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Recommended Designs Table  
CREATE TABLE IF NOT EXISTS recommended_designs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500) NOT NULL,
    access_code VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (access_code) REFERENCES access_codes(code) ON DELETE CASCADE
);

-- User Submissions Table
CREATE TABLE IF NOT EXISTS submissions (
    id SERIAL PRIMARY KEY,
    access_code VARCHAR(255) NOT NULL,
    comment TEXT,
    generated_image_url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (access_code) REFERENCES access_codes(code) ON DELETE CASCADE
);

-- Original Images for Submissions
CREATE TABLE IF NOT EXISTS submission_images (
    id SERIAL PRIMARY KEY,
    submission_id INTEGER NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    image_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_access_codes_code ON access_codes(code);
CREATE INDEX IF NOT EXISTS idx_access_codes_active ON access_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_recommended_designs_access_code ON recommended_designs(access_code);
CREATE INDEX IF NOT EXISTS idx_submissions_access_code ON submissions(access_code);
CREATE INDEX IF NOT EXISTS idx_submission_images_submission_id ON submission_images(submission_id);

-- Insert Default Access Codes
INSERT INTO access_codes (code) VALUES 
('RAONIX-2024'),
('PREMIUM-USER'),
('DEMO-ACCESS')
ON CONFLICT (code) DO NOTHING;

-- Insert Default Recommended Designs
INSERT INTO recommended_designs (title, description, image_url, access_code) VALUES 
('Sporty Red Sneaker', 'A vibrant red sneaker concept in a glossy, durable plastic finish, perfect for an athletic look.', 'https://images.unsplash.com/photo-1542291026-7eec264c27ab?q=80&w=800&auto=format&fit=crop', 'RAONIX-2024'),
('Elegant Blue Headphones', 'Sleek blue headphones with a matte aluminum finish, combining style and premium sound quality.', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop', 'RAONIX-2024'),
('Modern Green Smartphone', 'A sophisticated green smartphone with brushed titanium accents and premium materials.', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop', 'PREMIUM-USER')
ON CONFLICT DO NOTHING;