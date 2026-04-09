import { API_ORIGIN } from '../services/api';

/**
 * Resolves the full URL for a given image path.
 * If the path is a full URL (external), it returns it as-is.
 * If the path is a local relative path, it prepends the API origin.
 */
export const getImageUrl = (path) => {
  if (!path) return 'https://via.placeholder.com/400x300?text=No+Image';
  
  // If it's already a full URL (like Unsplash), return as is
  if (path.startsWith('http')) return path;
  
  // Clean the path and prepend API origin
  // Ensure we don't double slash
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_ORIGIN}${cleanPath}`;
};
