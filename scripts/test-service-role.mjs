import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('achievements').select('*');
  console.log("DB content:", JSON.stringify(data, null, 2));

  // Let's do a mock update with the API structure
  const mockGallery = [
    {
      url: "https://res.cloudinary.com/u9evrlxb/image/upload/v1786456633/gallery/mbkjif0xw981kmkhgwoq.jpg",
      public_id: "gallery/mbkjif0xw981kmkhgwoq",
      filename: "test.jpg",
      caption: "",
      isCover: true
    }
  ];

  const updateRes = await supabase
    .from('achievements')
    .update({ gallery: mockGallery })
    .eq('id', '1b43668e-f27a-44df-a371-557a25b9e724')
    .select();
    
  console.log("Update result:", JSON.stringify(updateRes, null, 2));
}

run();
