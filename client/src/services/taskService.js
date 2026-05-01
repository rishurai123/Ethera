import api from './api';

export const getTasks = (params = {}) => {
  return api.get('/tasks', { params });
};

export const getTask = (id) => {
  return api.get(`/tasks/${id}`);
};

export const createTask = (taskData) => {
  return api.post('/tasks', taskData);
};

export const updateTask = (id, taskData) => {
  return api.put(`/tasks/${id}`, taskData);
};

export const deleteTask = (id) => {
  return api.delete(`/tasks/${id}`);
};

export const addComment = (taskId, commentData) => {
  return api.post(`/tasks/${taskId}/comments`, commentData);
};

export const getTaskStats = () => {
  return api.get('/tasks/stats/dashboard');
};
