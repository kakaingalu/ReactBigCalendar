import axiosInstance from '@services/httpService';

export const uploadFile = (endpoint, file, options = {}) => {
    const formData = new FormData();
    formData.append('file', file);

    // Add any extra options (like language for OCR, interval for lining)
    Object.keys(options).forEach(key => {
        formData.append(key, options[key]);
    });

    return axiosInstance.post(`dms/${endpoint}/`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export const getTaskStatus = (taskId) => {
    return axiosInstance.get(`dms/task-status/${taskId}/`);
};

// Specific upload functions (optional, but cleaner)
export const uploadPdfToWord = (file) => uploadFile('pdf-to-word', file);
export const uploadWordToPdf = (file) => uploadFile('word-to-pdf', file);
export const uploadForOcr = (file, options) => uploadFile('ocr', file, options);
export const uploadForTenthLining = (file, options) => uploadFile('tenth-lining', file, options);
export const uploadForPagination = (file, options) => uploadFile('pagination', file, options);

// Function to construct full download URL (since backend returns relative path)
export const getFullDownloadUrl = (relativePath) => {
    // Assumes Django serves media files at root during development
    // Adjust if your setup is different (e.g., using different base URL for media)
    // const djangoBaseUrl = 'lawris-app.com/api/'; // Base URL of Django server
    // return `${djangoBaseUrl}${relativePath}`;
    return `${relativePath}`;
}