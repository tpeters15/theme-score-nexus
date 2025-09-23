import { supabase } from "@/integrations/supabase/client";

/**
 * Utility function to clean up orphaned research documents
 * that exist in the database but not in storage
 */
export const cleanupOrphanedDocuments = async (): Promise<{
  cleaned: number;
  errors: string[];
}> => {
  const errors: string[] = [];
  let cleanedCount = 0;

  try {
    // Get all research documents
    const { data: documents, error: fetchError } = await supabase
      .from('research_documents')
      .select('*');

    if (fetchError) {
      errors.push(`Failed to fetch documents: ${fetchError.message}`);
      return { cleaned: 0, errors };
    }

    if (!documents?.length) {
      return { cleaned: 0, errors: [] };
    }

    // Check each document for file existence
    for (const doc of documents) {
      if (!doc.file_path) {
        // Remove documents without file paths
        const { error: deleteError } = await supabase
          .from('research_documents')
          .delete()
          .eq('id', doc.id);

        if (deleteError) {
          errors.push(`Failed to delete document ${doc.id}: ${deleteError.message}`);
        } else {
          cleanedCount++;
          console.log(`Removed document without file path: ${doc.title}`);
        }
        continue;
      }

      try {
        // Check if file exists in storage
        const { data, error } = await supabase.storage
          .from('research-documents')
          .list(doc.file_path.includes('/') ? doc.file_path.substring(0, doc.file_path.lastIndexOf('/')) : '', {
            limit: 1000
          });

        const filename = doc.file_path.split('/').pop();
        const fileExists = data?.some(file => file.name === filename);

        if (error || !fileExists) {
          // File doesn't exist, remove the database record
          const { error: deleteError } = await supabase
            .from('research_documents')
            .delete()
            .eq('id', doc.id);

          if (deleteError) {
            errors.push(`Failed to delete orphaned document ${doc.id}: ${deleteError.message}`);
          } else {
            cleanedCount++;
            console.log(`Removed orphaned document: ${doc.title} (${doc.file_path})`);
          }
        }
      } catch (error) {
        errors.push(`Error checking file ${doc.file_path}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return { cleaned: cleanedCount, errors };
  } catch (error) {
    errors.push(`Cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return { cleaned: 0, errors };
  }
};

/**
 * Verify if a specific document file exists in storage
 */
export const verifyDocumentExists = async (filePath: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.storage
      .from('research-documents')
      .list(filePath.includes('/') ? filePath.substring(0, filePath.lastIndexOf('/')) : '', {
        limit: 1000
      });

    if (error) return false;

    const filename = filePath.split('/').pop();
    return data?.some(file => file.name === filename) || false;
  } catch (error) {
    console.error('Error verifying document existence:', error);
    return false;
  }
};