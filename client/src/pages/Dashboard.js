import React from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { getTaskStats, getTasks } from '../services/taskService';
import { getProjects } from '../services/projectService';
import { 
  CheckSquare, 
  Clock, 
  AlertCircle, 
  Users, 
  FolderOpen,
  TrendingUp,
  Calendar,
  Plus
} from 'lucide-react';

const Dashboard = () => {
  const { data: stats } = useQuery('taskStats', getTaskStats);
  const { data: recentTasks, isLoading: tasksLoading } = useQuery('recentTasks', () => 
    getTasks({ limit: 5, sort: '-createdAt' })
  );
  const { data: projects, isLoading: projectsLoading } = useQuery('projects', () => 
    getProjects({ limit: 5 })
  );

  const statCards = [
    {
      title: 'Total Tasks',
      value: stats?.data?.stats?.total || 0,
      icon: CheckSquare,
      color: 'bg-blue-500',
      link: '/tasks'
    },
    {
      title: 'In Progress',
      value: stats?.data?.stats?.inProgress || 0,
      icon: Clock,
      color: 'bg-yellow-500',
      link: '/tasks?status=in-progress'
    },
    {
      title: 'Completed',
      value: stats?.data?.stats?.completed || 0,
      icon: TrendingUp,
      color: 'bg-green-500',
      link: '/tasks?status=completed'
    },
    {
      title: 'Overdue',
      value: stats?.data?.stats?.overdue || 0,
      icon: AlertCircle,
      color: 'bg-red-500',
      link: '/tasks?overdue=true'
    },
    {
      title: 'Assigned to Me',
      value: stats?.data?.stats?.assignedToMe || 0,
      icon: Users,
      color: 'bg-purple-500',
      link: '/tasks?assignedTo=me'
    },
    {
      title: 'High Priority',
      value: stats?.data?.stats?.highPriority || 0,
      icon: Calendar,
      color: 'bg-orange-500',
      link: '/tasks?priority=high'
    }
  ];

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
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex space-x-3">
          <Link
            to="/tasks/new"
            className="btn btn-primary inline-flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Link>
          <Link
            to="/projects/new"
            className="btn btn-secondary inline-flex items-center"
          >
            <FolderOpen className="w-4 h-4 mr-2" />
            New Project
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Link
              key={index}
              to={stat.link}
              className="card p-6 hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex items-center">
                <div className={`flex-shrink-0 p-3 rounded-lg ${stat.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <div className="card">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Tasks</h2>
              <Link to="/tasks" className="text-sm text-blue-600 hover:text-blue-500">
                View all
              </Link>
            </div>
            {tasksLoading ? (
              <div className="text-center py-4">
                <div className="spinner mx-auto"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTasks?.data?.tasks?.length > 0 ? (
                  recentTasks.data.tasks.map((task) => (
                    <Link
                      key={task._id}
                      to={`/tasks/${task._id}`}
                      className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {task.title}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1">
                            {task.project?.name}
                          </p>
                        </div>
                        <div className="flex space-x-2 ml-2">
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
                  <p className="text-gray-500 text-center py-4">No recent tasks</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Recent Projects */}
        <div className="card">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Projects</h2>
              <Link to="/projects" className="text-sm text-blue-600 hover:text-blue-500">
                View all
              </Link>
            </div>
            {projectsLoading ? (
              <div className="text-center py-4">
                <div className="spinner mx-auto"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {projects?.data?.projects?.length > 0 ? (
                  projects.data.projects.map((project) => (
                    <Link
                      key={project._id}
                      to={`/projects/${project._id}`}
                      className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {project.name}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1">
                            {project.teamMembers?.length || 0} members
                          </p>
                        </div>
                        <span className={`status-badge ${getStatusColor(project.status)}`}>
                          {project.status}
                        </span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No recent projects</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
