import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { sourceUrl, destinationPath, documentId } = await req.json();

    console.log('Uploading file from:', sourceUrl);
    console.log('To storage path:', destinationPath);

    // Fetch the file from the source URL
    const fileResponse = await fetch(sourceUrl);
    if (!fileResponse.ok) {
      throw new Error(`Failed to fetch file: ${fileResponse.statusText}`);
    }

    const fileBlob = await fileResponse.blob();
    const fileArrayBuffer = await fileBlob.arrayBuffer();
    
    console.log('File size:', fileArrayBuffer.byteLength, 'bytes');

    // Upload to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('research-documents')
      .upload(destinationPath, fileArrayBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    console.log('File uploaded successfully:', uploadData);

    // Update the research document record with the correct file size
    if (documentId) {
      const { error: updateError } = await supabase
        .from('research_documents')
        .update({ 
          file_size: fileArrayBuffer.byteLength,
          updated_at: new Date().toISOString()
        })
        .eq('id', documentId);

      if (updateError) {
        console.error('Error updating document record:', updateError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        path: uploadData.path,
        size: fileArrayBuffer.byteLength 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
