export default function TasksPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Tasks</h1>
      <div className="grid grid-cols-1 md-grid-cols-2 lg-grid-cols-3 gap-6">
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Sample Task</h2>
          <p className="text-gray-600 mb-4">This is a sample task card.</p>
          <div className="flex justify-between items-center">
            <span className="status-badge status-todo">To Do</span>
            <button className="btn btn-primary">View Details</button>
          </div>
        </div>
        
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Another Task</h2>
          <p className="text-gray-600 mb-4">This is another sample task.</p>
          <div className="flex justify-between items-center">
            <span className="status-badge status-review">In Review</span>
            <button className="btn btn-secondary">View Details</button>
          </div>
        </div>
      </div>
    </div>
  );
}
