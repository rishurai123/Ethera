const express = require('express');
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const Project = require('../models/Project');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all tasks for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const priority = req.query.priority;
    const project = req.query.project;
    const assignedTo = req.query.assignedTo;
    const search = req.query.search;
    const overdue = req.query.overdue;

    // First, get all projects the user has access to
    const userProjects = await Project.find({
      $or: [
        { owner: req.user._id },
        { 'teamMembers.user': req.user._id }
      ],
      isActive: true
    }).select('_id');

    const projectIds = userProjects.map(p => p._id);

    let query = {
      project: { $in: projectIds },
      isActive: true
    };

    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    if (project) {
      query.project = project;
    }

    if (assignedTo) {
      query.assignedTo = assignedTo;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (overdue === 'true') {
      query.dueDate = { $lt: new Date() };
      query.status = { $ne: 'completed' };
    }

    const tasks = await Task.find(query)
      .populate('project', 'name status')
      .populate('assignedTo', 'username email avatar')
      .populate('createdBy', 'username email avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Task.countDocuments(query);

    res.json({
      tasks,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error while fetching tasks' });
  }
});

// Get single task by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'name status owner teamMembers')
      .populate('assignedTo', 'username email avatar')
      .populate('createdBy', 'username email avatar')
      .populate('comments.user', 'username email avatar');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user has access to this task's project
    const project = task.project;
    const hasAccess = project.owner.toString() === req.user._id.toString() ||
                     project.teamMembers.some(member => member.user.toString() === req.user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied to this task' });
    }

    res.json({ task });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ message: 'Server error while fetching task' });
  }
});

// Create new task
router.post('/', [
  auth,
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Task title must be between 1 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('project')
    .isMongoId()
    .withMessage('Valid project ID is required'),
  body('assignedTo')
    .optional()
    .isMongoId()
    .withMessage('Valid user ID is required for assignment'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be low, medium, high, or urgent'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  body('estimatedHours')
    .optional()
    .isFloat({ min: 0, max: 1000 })
    .withMessage('Estimated hours must be between 0 and 1000')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { title, description, project, assignedTo, priority, dueDate, estimatedHours, tags } = req.body;

    // Check if user has access to the project
    const projectDoc = await Project.findById(project);
    if (!projectDoc) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const hasAccess = projectDoc.owner.toString() === req.user._id.toString() ||
                     projectDoc.teamMembers.some(member => member.user.toString() === req.user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied to this project' });
    }

    // If assignedTo is provided, check if the user is a team member
    if (assignedTo) {
      const isTeamMember = projectDoc.owner.toString() === assignedTo ||
                          projectDoc.teamMembers.some(member => member.user.toString() === assignedTo);

      if (!isTeamMember) {
        return res.status(400).json({ message: 'Assigned user must be a team member' });
      }
    }

    const task = new Task({
      title,
      description,
      project,
      assignedTo,
      createdBy: req.user._id,
      priority: priority || 'medium',
      dueDate,
      estimatedHours,
      tags: tags || []
    });

    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('project', 'name status')
      .populate('assignedTo', 'username email avatar')
      .populate('createdBy', 'username email avatar');

    res.status(201).json({
      message: 'Task created successfully',
      task: populatedTask
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error while creating task' });
  }
});

// Update task
router.put('/:id', [
  auth,
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Task title must be between 1 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('status')
    .optional()
    .isIn(['todo', 'in-progress', 'review', 'completed', 'cancelled'])
    .withMessage('Invalid status'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be low, medium, high, or urgent'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  body('estimatedHours')
    .optional()
    .isFloat({ min: 0, max: 1000 })
    .withMessage('Estimated hours must be between 0 and 1000'),
  body('actualHours')
    .optional()
    .isFloat({ min: 0, max: 1000 })
    .withMessage('Actual hours must be between 0 and 1000')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const task = await Task.findById(req.params.id).populate('project');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user has access to this task's project
    const project = task.project;
    const isOwner = project.owner.toString() === req.user._id.toString();
    const isAssignedUser = task.assignedTo && task.assignedTo.toString() === req.user._id.toString();
    const isTeamMember = project.teamMembers.some(member => member.user.toString() === req.user._id.toString());

    if (!isOwner && !isAssignedUser && !isTeamMember) {
      return res.status(403).json({ message: 'Access denied to this task' });
    }

    const { title, description, status, priority, dueDate, estimatedHours, actualHours, tags } = req.body;

    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (status) task.status = status;
    if (priority) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (estimatedHours !== undefined) task.estimatedHours = estimatedHours;
    if (actualHours !== undefined) task.actualHours = actualHours;
    if (tags !== undefined) task.tags = tags;

    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate('project', 'name status')
      .populate('assignedTo', 'username email avatar')
      .populate('createdBy', 'username email avatar');

    res.json({
      message: 'Task updated successfully',
      task: updatedTask
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Server error while updating task' });
  }
});

// Add comment to task
router.post('/:id/comments', [
  auth,
  body('text')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Comment must be between 1 and 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const task = await Task.findById(req.params.id).populate('project');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user has access to this task's project
    const project = task.project;
    const hasAccess = project.owner.toString() === req.user._id.toString() ||
                     project.teamMembers.some(member => member.user.toString() === req.user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied to this task' });
    }

    const { text } = req.body;

    task.comments.push({
      user: req.user._id,
      text,
      createdAt: new Date()
    });

    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate('project', 'name status')
      .populate('assignedTo', 'username email avatar')
      .populate('createdBy', 'username email avatar')
      .populate('comments.user', 'username email avatar');

    res.json({
      message: 'Comment added successfully',
      task: updatedTask
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error while adding comment' });
  }
});

// Delete task
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('project');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user is project owner or task creator
    const project = task.project;
    const isOwner = project.owner.toString() === req.user._id.toString();
    const isCreator = task.createdBy.toString() === req.user._id.toString();

    if (!isOwner && !isCreator) {
      return res.status(403).json({ message: 'Only project owners or task creators can delete tasks' });
    }

    // Soft delete by setting isActive to false
    task.isActive = false;
    await task.save();

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error while deleting task' });
  }
});

// Get task statistics
router.get('/stats/dashboard', auth, async (req, res) => {
  try {
    // Get all projects the user has access to
    const userProjects = await Project.find({
      $or: [
        { owner: req.user._id },
        { 'teamMembers.user': req.user._id }
      ],
      isActive: true
    }).select('_id');

    const projectIds = userProjects.map(p => p._id);

    const [
      totalTasks,
      todoTasks,
      inProgressTasks,
      completedTasks,
      overdueTasks,
      myTasks,
      highPriorityTasks
    ] = await Promise.all([
      Task.countDocuments({ project: { $in: projectIds }, isActive: true }),
      Task.countDocuments({ project: { $in: projectIds }, status: 'todo', isActive: true }),
      Task.countDocuments({ project: { $in: projectIds }, status: 'in-progress', isActive: true }),
      Task.countDocuments({ project: { $in: projectIds }, status: 'completed', isActive: true }),
      Task.countDocuments({
        project: { $in: projectIds },
        dueDate: { $lt: new Date() },
        status: { $ne: 'completed' },
        isActive: true
      }),
      Task.countDocuments({ project: { $in: projectIds }, assignedTo: req.user._id, isActive: true }),
      Task.countDocuments({
        project: { $in: projectIds },
        priority: { $in: ['high', 'urgent'] },
        status: { $ne: 'completed' },
        isActive: true
      })
    ]);

    res.json({
      stats: {
        total: totalTasks,
        todo: todoTasks,
        inProgress: inProgressTasks,
        completed: completedTasks,
        overdue: overdueTasks,
        assignedToMe: myTasks,
        highPriority: highPriorityTasks
      }
    });
  } catch (error) {
    console.error('Get task stats error:', error);
    res.status(500).json({ message: 'Server error while fetching task statistics' });
  }
});

module.exports = router;
