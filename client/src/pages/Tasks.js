import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { getTasks } from '../services/taskService';
import { Plus, Filter, Search } from 'lucide-react';

const Tasks = () => {
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    search: '',
    page: 1
  });

  const { data: tasksData, isLoading, error } = useQuery(
    ['tasks', filters],
    () => getTasks(filters),
    { keepPreviousData: true }
  );

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const getStatusColor = (status) => {
    const colors = {
      'todo': 'bg-gray-100 text-gray-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      'review': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'low': 'bg-gray-100 text-gray-600',
      'medium': 'bg-blue-100 text-blue-600',
      'high': 'bg-orange-100 text-orange-600',
      'urgent': 'bg-red-100 text-red-600'
    };
    return colors[priority] || 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
        <Link
          to="/tasks/new"
          className="btn btn-primary inline-flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Task
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="input-field pl-10"
            />
          </div>
          
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="input-field"
          >
            <option value="">All Status</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="review">Review</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={filters.priority}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
            className="input-field"
          >
            <option value="">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>

          <button
            onClick={() => setFilters({ status: '', priority: '', search: '', page: 1 })}
            className="btn btn-secondary"
          >
            <Filter className="w-4 h-4 mr-2" />
            Clear Filters
          </button>
        </div>
      </div>

      {/* Tasks List */}
      <div className="card">
        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="spinner mx-auto"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600">Error loading tasks: {error.message}</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {tasksData?.data?.tasks?.length > 0 ? (
                  tasksData.data.tasks.map((task) => (
                    <Link
                      key={task._id}
                      to={`/tasks/${task._id}`}
                      className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900">
                            {task.title}
                          </h3>
                          {task.description && (
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {task.description}
                            </p>
                          )}
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-sm text-gray-500">
                              Project: {task.project?.name}
                            </span>
                            {task.assignedTo && (
                              <span className="text-sm text-gray-500">
                                Assigned to: {task.assignedTo?.username}
                              </span>
                            )}
                            {task.dueDate && (
                              <span className="text-sm text-gray-500">
                                Due: {new Date(task.dueDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col space-y-2 ml-4">
                          <span className={`status-badge ${getStatusColor(task.status)}`}>
                            {task.status}
                          </span>
                          <span className={`status-badge ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No tasks found</p>
                    <Link
                      to="/tasks/new"
                      className="btn btn-primary inline-flex items-center mt-4"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create your first task
                    </Link>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {tasksData?.data?.pagination && tasksData.data.pagination.pages > 1 && (
                <div className="flex justify-center mt-6 space-x-2">
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={filters.page === 1}
                    className="btn btn-secondary disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="py-2 px-4 text-sm text-gray-700">
                    Page {filters.page} of {tasksData.data.pagination.pages}
                  </span>
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={filters.page === tasksData.data.pagination.pages}
                    className="btn btn-secondary disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tasks;
