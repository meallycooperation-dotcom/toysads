ALTER TABLE products
ADD COLUMN description TEXT,
ADD COLUMN category TEXT CHECK (category IN ('male', 'female')),
ADD COLUMN level TEXT CHECK (level IN ('intense', 'luxurious', 'playful'));
