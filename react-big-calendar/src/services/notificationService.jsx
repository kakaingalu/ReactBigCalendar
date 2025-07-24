import axiosInstance from "@services/httpService";

/**
 * Fetches unread notifications for the current user.
 * Assumes authentication is handled (e.g., via cookies or Authorization header).
 * @returns {Promise<AxiosResponse<any>>} Promise resolving with the API response.
 */
export const getUnreadNotifications = () => {
  return axiosInstance.get('dms/notifications/unread/');
};

/**
 * Marks specified notifications as read on the backend.
 * @param {string[] | number[]} notificationIds - An array of notification IDs to mark as read.
 * @returns {Promise<AxiosResponse<any>>} Promise resolving with the API response.
 */
export const markNotificationsRead = (notificationIds) => {
  if (!notificationIds || notificationIds.length === 0) {
    return Promise.resolve({ data: { detail: 'No IDs provided.' } }); // Or reject/throw error
  }
  // Make sure the backend endpoint matches '/api/notifications/mark-read/'
  return axiosInstance.post(
    'dms/notifications/mark-read/',
    { ids: notificationIds }, // Send the IDs in the request body as expected by the backend view
  );
   // The caller component will handle .then(response => ...) and .catch(error => ...)
};

// TODO: add other notification-related API calls here later
// (e.g., delete notifications, get all notifications with pagination)