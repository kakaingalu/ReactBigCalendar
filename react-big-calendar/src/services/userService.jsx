import axiosInstance from './httpService';

export const fetchNavUserProfile = async () => {
    try {
        // This endpoint should return at least avatar_url, full_name, email, role.name
        const response = await axiosInstance.get('/users/profile/nav-info/'); // NEW: Lightweight endpoint for navbar
        // OR use existing full profile endpoint if it's fast enough:
        // const response = await axiosInstance.get('/users/profile/');
        return response.data;
    } catch (error) {
        console.error("Error fetching user profile for navbar:", error);
        // Don't throw here, let the component use fallbacks
        return null;
    }
};