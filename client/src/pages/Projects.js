import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { getProjects } from '../services/projectService';
import { Plus, Filter, Search, Users, Calendar } from 'lucide-react';

const Projects = () => {
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    page: 1
  });

  const { data: projectsData, isLoading, error } = useQuery(
    ['projects', filters],
    () => getProjects(filters),
    { keepPreviousData: true }
  );

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const getStatusColor = (status) => {
    const colors = {
      'planning': 'bg-gray-100 text-gray-800',
      'active': 'bg-blue-100 text-blue-800',
      'on-hold': 'bg-yellow-100 text-yellow-800',
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
        <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
        <Link
          to="/projects/new"
          className="btn btn-primary inline-flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search projects..."
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
            <option value="planning">Planning</option>
            <option value="active">Active</option>
            <option value="on-hold">On Hold</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <button
            onClick={() => setFilters({ status: '', search: '', page: 1 })}
            className="btn btn-secondary"
          >
            <Filter className="w-4 h-4 mr-2" />
            Clear Filters
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-8">
            <div className="spinner mx-auto"></div>
          </div>
        ) : error ? (
          <div className="col-span-full text-center py-8">
            <p className="text-red-600">Error loading projects: {error.message}</p>
          </div>
        ) : projectsData?.data?.projects?.length > 0 ? (
          projectsData.data.projects.map((project) => (
            <Link
              key={project._id}
              to={`/projects/${project._id}`}
              className="card p-6 hover:shadow-lg transition-shadow duration-200"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {project.name}
                  </h3>
                  <span className={`status-badge ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                </div>
                
                {project.description && (
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {project.description}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {project.teamMembers?.length || 0}
                    </div>
                    {project.endDate && (
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(project.endDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <span className={`status-badge ${getPriorityColor(project.priority)}`}>
                    {project.priority}
                  </span>
                </div>

                {project.tags && project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {project.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {project.tags.length > 3 && (
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                        +{project.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500">No projects found</p>
            <Link
              to="/projects/new"
              className="btn btn-primary inline-flex items-center mt-4"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create your first project
            </Link>
          </div>
        )}
      </div>

      {/* Pagination */}
      {projectsData?.data?.pagination && projectsData.data.pagination.pages > 1 && (
        <div className="flex justify-center space-x-2">
          <button
            onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
            disabled={filters.page === 1}
            className="btn btn-secondary disabled:opacity-50"
          >
            Previous
          </button>
          <span className="py-2 px-4 text-sm text-gray-700">
            Page {filters.page} of {projectsData.data.pagination.pages}
          </span>
          <button
            onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
            disabled={filters.page === projectsData.data.pagination.pages}
            className="btn btn-secondary disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Projects;
