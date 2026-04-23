import api from '../axios';

// Fetch the full recursive tree for the sidebar
export const getProjectTree = (projectId) => api.get(`/files/tree/${projectId}`);

// Create a new file
export const createFile = (data) => api.post('/files/file', data);

// Create a new folder
export const createFolder = (data) => api.post('/files/folder', data);

// Auto-save: Update file content
export const updateFileContent = (fileId, content, userId) => 
    api.put(`/files/file/${fileId}/content?userId=${userId}`, content, {
        headers: { 'Content-Type': 'text/plain' }
    });

// Rename a file
export const renameFile = (fileId, newName) => 
    api.patch(`/files/file/${fileId}/rename?newName=${newName}`);

// Rename a folder
export const renameFolder = (folderId, newName) => 
    api.patch(`/files/folder/${folderId}/rename?newName=${newName}`);

// Search for content within a project
export const searchInProject = (projectId, query) => 
    api.get(`/files/search/${projectId}?q=${query}`);

// Delete a file
export const deleteFile = (fileId) => api.delete(`/files/file/${fileId}`);

// Delete Folder
export const deleteFolder = (folderId) => api.delete(`/files/folder/${folderId}`);