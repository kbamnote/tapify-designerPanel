const BASE = 'https://tapify-backend-production.up.railway.app';

export const api = async (endpoint, options = {}) => {
  const res = await fetch(BASE + endpoint, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error('Invalid JSON response from server');
  }

  if (!data.success) throw new Error(data.message || 'Request failed');
  return data;
};

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch(`${BASE}/api/admin/designs/upload-image.php`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error('Invalid JSON response from server');
  }

  if (!data.success) throw new Error(data.message || 'Upload failed');
  return data;
};

export default BASE;
