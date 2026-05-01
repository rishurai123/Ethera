# Railway Deployment Guide

This guide will help you deploy the Team Task Manager application to Railway.

## Prerequisites

1. Railway account (sign up at [railway.app](https://railway.app))
2. GitHub account (Railway integrates with GitHub)
3. MongoDB Atlas account (for database)

## Step 1: Database Setup

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a new cluster (free tier is sufficient)
3. Create a database user with read/write permissions
4. Get your connection string
5. Add your IP address to the whitelist (or use 0.0.0.0/0 for Railway)

## Step 2: Push to GitHub

1. Initialize a git repository in your project:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. Create a new repository on GitHub
3. Push your code:
   ```bash
   git remote add origin https://github.com/yourusername/team-task-manager.git
   git branch -M main
   git push -u origin main
   ```

## Step 3: Railway Setup

1. Log in to your Railway dashboard
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Railway will automatically detect the project structure

## Step 4: Environment Variables

In your Railway project settings, add these environment variables:

### For the Backend (Server)
```
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/team-task-manager?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this-to-a-strong-random-string
NODE_ENV=production
```

### For the Frontend (Client)
```
REACT_APP_API_URL=https://your-project-name.railway.app/api
```

## Step 5: Configuration Files

The project includes these deployment files:

- `railway.json` - Railway configuration
- `nixpacks.toml` - Build configuration
- `.env` files - Environment variables templates

## Step 6: Build and Deploy

1. Railway will automatically build and deploy your application
2. The build process:
   - Installs dependencies for both client and server
   - Builds the React frontend
   - Starts the Node.js server
3. Once deployed, Railway will provide you with a public URL

## Step 7: Update Frontend API URL

After deployment, update the frontend API URL:

1. In `client/.env`, change:
   ```
   REACT_APP_API_URL=https://your-actual-railway-url.railway.app/api
   ```

2. Push the changes and Railway will automatically redeploy

## Step 8: Test the Application

1. Visit your Railway URL
2. Test user registration and login
3. Create projects and tasks
4. Verify all features are working

## Troubleshooting

### Build Issues
- Check the Railway build logs
- Ensure all dependencies are properly listed in package.json files
- Verify the build commands in nixpacks.toml

### Database Connection Issues
- Verify MongoDB connection string
- Check if IP whitelist includes Railway's IP range
- Ensure database user has proper permissions

### Frontend API Issues
- Verify REACT_APP_API_URL is correct
- Check CORS settings in the server
- Ensure backend is running on the correct port

## Production Considerations

1. **Security**: Use strong JWT secrets and database passwords
2. **Performance**: Monitor database performance and optimize queries
3. **Backups**: Set up automatic database backups
4. **Monitoring**: Use Railway's monitoring tools to track performance
5. **Scaling**: Railway automatically scales based on traffic

## Custom Domain (Optional)

1. In Railway project settings, click "Settings" → "Custom Domains"
2. Add your custom domain
3. Update DNS records as instructed by Railway
4. Update REACT_APP_API_URL if using custom domain

## Support

- Railway documentation: [docs.railway.app](https://docs.railway.app)
- MongoDB Atlas documentation: [docs.mongodb.com](https://docs.mongodb.com)
- For issues with this specific project, check the GitHub repository
