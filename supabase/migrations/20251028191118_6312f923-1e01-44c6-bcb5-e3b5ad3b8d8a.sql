-- Add research summary column to companies table
ALTER TABLE companies 
ADD COLUMN classification_research_summary text;