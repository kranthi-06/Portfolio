import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const mockGallery = [
    {
      id: "img1",
      url: "https://res.cloudinary.com/u9evrlxb/image/upload/v1786456633/gallery/mbkjif0xw981kmkhgwoq.jpg",
      filename: "test.jpg",
      type: "image",
      order: 1,
      isCover: true,
      caption: "Test cover"
    }
  ];

  const { data, error } = await supabase
    .from('achievements')
    .update({ gallery: mockGallery })
    .eq('id', '1b43668e-f27a-44df-a371-557a25b9e724')
    .select();
    
  console.log("Update result:", JSON.stringify({ data, error }, null, 2));
}

run();
