export default function ProjectsPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Projects</h1>
      <div className="grid grid-cols-1 md-grid-cols-2 lg-grid-cols-3 gap-6">
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Sample Project</h2>
          <p className="text-gray-600 mb-4">This is a sample project card.</p>
          <div className="flex justify-between items-center">
            <span className="status-badge status-completed">Active</span>
            <button className="btn btn-primary">View Details</button>
          </div>
        </div>
        
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Another Project</h2>
          <p className="text-gray-600 mb-4">This is another sample project.</p>
          <div className="flex justify-between items-center">
            <span className="status-badge status-in-progress">In Progress</span>
            <button className="btn btn-secondary">View Details</button>
          </div>
        </div>
      </div>
    </div>
  );
}
