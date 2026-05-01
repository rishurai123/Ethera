import '../dashboard/layout';

export default function ProjectsLayout({ children }) {
  const DashboardLayout = require('../dashboard/layout').default;
  return <DashboardLayout>{children}</DashboardLayout>;
}
