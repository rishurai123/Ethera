export default function DashboardPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md-grid-cols-3 gap-6">
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Welcome to TaskFlow</h2>
          <p className="text-gray-600">Your team task management dashboard</p>
        </div>
      </div>
    </div>
  );
}
