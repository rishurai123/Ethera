# Local Development Setup

## Prerequisites

1. Node.js (v18 or higher)
2. MongoDB (local installation or MongoDB Atlas)
3. Git

## Quick Start

### 1. Environment Setup

Create environment files:

**Server Environment** (`server/.env`):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/team-task-manager
JWT_SECRET=your-super-secret-jwt-key-change-this-in-development
NODE_ENV=development
```

**Client Environment** (`client/.env`):
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 2. Database Setup

**Option 1: Local MongoDB**
- Install MongoDB locally
- Start MongoDB service
- Database will be created automatically

**Option 2: MongoDB Atlas**
- Create a free cluster at [MongoDB Atlas](https://cloud.mongodb.com)
- Get your connection string
- Update `MONGODB_URI` in server/.env

### 3. Run the Application

**Option A: Using npm scripts (Recommended)**
```bash
# Install dependencies for all packages
npm install

# Run both backend and frontend concurrently
npm run dev
```

**Option B: Manual startup**
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend  
cd client
npm start
```

### 4. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- API Documentation: http://localhost:5000

## Testing Features

### Authentication
1. Register a new user (admin or member role)
2. Login with your credentials
3. Test protected routes

### Project Management
1. Create a new project
2. Add team members
3. Update project status
4. Delete projects

### Task Management
1. Create tasks within projects
2. Assign tasks to team members
3. Update task status and priority
4. Add comments to tasks

### Dashboard
1. View task statistics
2. See recent tasks and projects
3. Navigate between different views

## Development Notes

### Project Structure
```
team-task-manager/
├── server/                 # Node.js/Express backend
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── middleware/        # Authentication middleware
│   ├── config/            # Database configuration
│   └── index.js           # Server entry point
├── client/                # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── contexts/      # React contexts
│   │   └── utils/         # Utility functions
│   └── public/
├── railway.json           # Railway deployment config
├── nixpacks.toml          # Build configuration
└── DEPLOYMENT.md          # Deployment guide
```

### API Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

#### Projects
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/:id/members` - Add team member
- `DELETE /api/projects/:id/members/:memberId` - Remove team member

#### Tasks
- `GET /api/tasks` - List tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks/:id` - Get task details
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/:id/comments` - Add comment
- `GET /api/tasks/stats/dashboard` - Get dashboard statistics

### Common Issues

1. **MongoDB Connection Error**
   - Check if MongoDB is running
   - Verify connection string in .env
   - Ensure IP whitelist for MongoDB Atlas

2. **CORS Error**
   - Ensure frontend URL is in CORS whitelist
   - Check API URL in client .env

3. **Authentication Issues**
   - Check JWT_SECRET is set
   - Verify token is being sent in headers

4. **Build Errors**
   - Clear node_modules and reinstall
   - Check for missing dependencies

## Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for Railway deployment instructions.
