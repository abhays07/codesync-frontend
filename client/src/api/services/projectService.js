import api from '../axios';

/**
 * PROJECT RETRIEVAL SERVICES
 */

// Fetches all projects owned by the logged-in developer
export const getOwnerProjects = (ownerId) => api.get(`/projects/owner/${ownerId}`);

// Real-time optimized search by project name 
// Now includes userId to persist star states in search results
export const searchProjects = (name, userId) => api.get(`/projects/search?name=${name}&userId=${userId}`);

// Fetches all public projects for discovery
export const getPublicProjects = (userId) => api.get(`/projects/public?currentUserId=${userId}`);

// Filters projects by programming language 
export const getProjectsByLanguage = (lang) => api.get(`/projects/language/${lang}`);


/**
 * PROJECT MANAGEMENT SERVICES (CRUD & ACTIONS)
 */

// Creates a new project cluster 
export const createProject = (projectData) => api.post('/projects', projectData);

// Deletes a project permanently 
export const deleteProject = (projectId) => api.delete(`/projects/${projectId}`);

// Archives a project (Soft delete/Archive logic from Case Study) 
export const archiveProject = (projectId) => api.put(`/projects/${projectId}/archive`);

// Bookmarks a project and increments star count (Toggle logic) 
export const starProject = (projectId, userId) => 
    api.put(`/projects/${projectId}/star?userId=${userId}`);

// Creates a personal copy of a public project 
export const forkProject = (projectId, userId) => 
    api.post(`/projects/${projectId}/fork?userId=${userId}`);