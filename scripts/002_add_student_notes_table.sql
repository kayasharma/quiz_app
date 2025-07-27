-- Create Student Notes table
CREATE TABLE IF NOT EXISTS student_notes (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    student_email VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    original_content TEXT,
    summary TEXT NOT NULL,
    key_points JSONB,
    insights JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_student_notes_email ON student_notes(student_email);
CREATE INDEX IF NOT EXISTS idx_student_notes_created_at ON student_notes(created_at);

-- Verify table was created
SELECT 'Student notes table created successfully!' as status;
