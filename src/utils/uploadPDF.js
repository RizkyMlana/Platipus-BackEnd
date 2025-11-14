import { supabase } from '../config/storage.js';

export const uploadPDF = async (file, folder = 'proposals') => {
  const { data, error } = await supabase.storage
    .from('proposals')
    .upload(`${folder}/${Date.now()}_${file.originalname}`, file.buffer, {
      contentType: file.mimetype,
    });

  if (error) throw error;
  return data.path;
};
