export const decodeToken = (token: string) => {
  if (!token || typeof token !== 'string' || !token.includes('.')) {
    return null;
  }
  
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Token decoding failed:", error);
    return null;
  }
};

export const isTokenExpired = (token: string) => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  
  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userProfileImage');
  localStorage.removeItem('userInfo');
  // On peut forcer un rechargement pour vider les états React
  window.location.href = "/signin";
};

export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;
  
  const decoded = decodeToken(token);
  if (!decoded || isTokenExpired(token)) {
    // Nettoyage si malformé ou expiré
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userProfileImage');
    localStorage.removeItem('userInfo');
    return false;
  }
  
  return true;
};
