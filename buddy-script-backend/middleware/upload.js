const { createClient } = require('@supabase/supabase-js');
const multer = require('multer');
require('dotenv').config();

const bucketName = process.env.SUPABASE_BUCKET || 'post-images';
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
);
const upload = multer({ storage: multer.memoryStorage() });

const getStorageFilePath = (value) => {
  if (!value || typeof value !== 'string') return null;
  if (value.startsWith('http')) {
    const match = value.match(
      /\/storage\/v1\/object\/(?:public|private)\/[^/]+\/(.+)$/,
    );
    return match ? decodeURIComponent(match[1]) : null;
  }
  return value;
};

const uploadToSupabase = async (file) => {
  const fileName = `${Date.now()}_${file.originalname}`;
  const { error } = await supabase.storage
    .from(bucketName)
    .upload(fileName, file.buffer, { contentType: file.mimetype });

  if (error) throw error;
  return fileName;
};

const getSignedImageUrl = async (storagePath) => {
  const filePath = getStorageFilePath(storagePath);
  if (!filePath) return null;

  const { data, error } = await supabase.storage
    .from(bucketName)
    .createSignedUrl(filePath, 60 * 60);

  if (error) throw error;
  return data.signedUrl;
};

module.exports = {
  upload,
  uploadToSupabase,
  getSignedImageUrl,
  getStorageFilePath,
};
