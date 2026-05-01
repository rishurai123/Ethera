import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/tasks')}
          className="btn btn-secondary inline-flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Tasks
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Task Details</h1>
      </div>
      
      <div className="card p-6">
        <p className="text-gray-600">Task ID: {id}</p>
        <p className="mt-4">Detailed task view will be implemented here.</p>
      </div>
    </div>
  );
};

export default TaskDetail;
