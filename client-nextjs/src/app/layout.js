import './globals.css';

export const metadata = {
  title: "TaskFlow - Team Task Manager",
  description: "Modern team task management application",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
