export const getUserIdFromToken = (): number | null => {
  const token = localStorage.getItem('access_token');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.user_id;
  } catch (e) {
    console.error('Error decoding token:', e);
    return null;
  }
}