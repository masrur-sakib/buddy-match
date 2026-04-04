const { createClient } = require('@supabase/supabase-js');
const multer = require('multer');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
);
const upload = multer({ storage: multer.memoryStorage() });

const uploadToSupabase = async (file) => {
  const fileName = `${Date.now()}_${file.originalname}`;
  const { data, error } = await supabase.storage
    .from('post-images')
    .upload(fileName, file.buffer, { contentType: file.mimetype });

  if (error) throw error;
  return supabase.storage.from('post-images').getPublicUrl(fileName).data
    .publicUrl;
};

module.exports = { upload, uploadToSupabase };
