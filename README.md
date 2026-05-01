# Team Task Manager

A full-stack web application for team project and task management with role-based access control.

## Features

- **Authentication**: User signup and login system
- **Project Management**: Create and manage projects
- **Team Management**: Add team members with roles (Admin/Member)
- **Task Management**: Create, assign, and track tasks with status updates
- **Dashboard**: Overview of tasks, status, and overdue items
- **Role-based Access Control**: Admin and Member roles with different permissions

## Technology Stack

### Backend
- Node.js with Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- bcrypt for password hashing
- CORS for cross-origin requests

### Frontend
- React.js
- React Router for navigation
- Axios for API calls
- Tailwind CSS for styling
- React Hook Form for form handling

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   cd server && npm install
   cd ../client && npm install
   ```

3. Set up environment variables:
   - Create `.env` file in `server` directory
   - Add MongoDB connection string and JWT secret

4. Run the application:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Team Members
- `GET /api/team-members` - Get team members
- `POST /api/team-members` - Add team member
- `PUT /api/team-members/:id` - Update team member
- `DELETE /api/team-members/:id` - Remove team member

## Deployment

This application is designed to be deployed on Railway. See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy

1. Push the code to GitHub
2. Create a new Railway project from the GitHub repo
3. Set environment variables (MongoDB URI, JWT secret)
4. Railway will automatically build and deploy

### Live Demo

The application will be available at: `https://your-project-name.railway.app`

## Contributing

Pull requests are welcome. For major changes, please open an issue first.
