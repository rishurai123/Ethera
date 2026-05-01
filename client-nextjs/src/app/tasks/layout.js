import '../dashboard/layout';

export default function TasksLayout({ children }) {
  const DashboardLayout = require('../dashboard/layout').default;
  return <DashboardLayout>{children}</DashboardLayout>;
}
