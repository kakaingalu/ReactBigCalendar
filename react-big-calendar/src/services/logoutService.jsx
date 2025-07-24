import axiosInstance from '@services/httpService';
import { removeUser } from '@redux/userSlice';

export const logoutService = async (navigate, dispatch) => {
  try {
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token')
    
    if (!accessToken) {
      console.warn("No access token found.");
      return;
    }

    const payload = {
      accessToken: accessToken,
      refreshToken: refreshToken
    }

    const response = await axiosInstance.post('/auth/logout/', payload)
    if (response.status === 200) {
      const userId = localStorage.getItem('user_id');

      // Remove tokens and user info from localStorage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_id');
      localStorage.removeItem('user_role')
      localStorage.removeItem('full_name')
      localStorage.removeItem('email')
      localStorage.removeItem('user')

      // Remove user from Redux
      if (userId) {
        dispatch(removeUser(userId));
      }

      navigate('/auth');
    }
  } catch (error) {
    console.error("Logout failed:", error);
  }
};

export default logoutService