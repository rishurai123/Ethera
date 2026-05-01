const express = require('express');
const { body, validationResult } = require('express-validator');
const Project = require('../models/Project');
const Task = require('../models/Task');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all projects for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const search = req.query.search;

    let query = {
      $or: [
        { owner: req.user._id },
        { 'teamMembers.user': req.user._id }
      ],
      isActive: true
    };

    if (status) {
      query.status = status;
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const projects = await Project.find(query)
      .populate('owner', 'username email avatar')
      .populate('teamMembers.user', 'username email avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Project.countDocuments(query);

    res.json({
      projects,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Server error while fetching projects' });
  }
});

// Get single project by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'username email avatar')
      .populate('teamMembers.user', 'username email avatar');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user has access to this project
    const hasAccess = project.owner._id.toString() === req.user._id.toString() ||
                     project.teamMembers.some(member => member.user._id.toString() === req.user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied to this project' });
    }

    res.json({ project });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ message: 'Server error while fetching project' });
  }
});

// Create new project
router.post('/', [
  auth,
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Project name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be low, medium, high, or urgent'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, description, priority, endDate, tags } = req.body;

    const project = new Project({
      name,
      description,
      owner: req.user._id,
      priority: priority || 'medium',
      endDate,
      tags: tags || []
    });

    await project.save();

    const populatedProject = await Project.findById(project._id)
      .populate('owner', 'username email avatar')
      .populate('teamMembers.user', 'username email avatar');

    res.status(201).json({
      message: 'Project created successfully',
      project: populatedProject
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Server error while creating project' });
  }
});

// Update project
router.put('/:id', [
  auth,
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Project name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('status')
    .optional()
    .isIn(['planning', 'active', 'on-hold', 'completed', 'cancelled'])
    .withMessage('Invalid status'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be low, medium, high, or urgent')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is owner or admin member
    const isOwner = project.owner.toString() === req.user._id.toString();
    const isAdminMember = project.teamMembers.some(
      member => member.user.toString() === req.user._id.toString() && member.role === 'admin'
    );

    if (!isOwner && !isAdminMember) {
      return res.status(403).json({ message: 'Only project owners or admin members can update projects' });
    }

    const { name, description, status, priority, endDate, tags } = req.body;

    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (status) project.status = status;
    if (priority) project.priority = priority;
    if (endDate !== undefined) project.endDate = endDate;
    if (tags !== undefined) project.tags = tags;

    await project.save();

    const updatedProject = await Project.findById(project._id)
      .populate('owner', 'username email avatar')
      .populate('teamMembers.user', 'username email avatar');

    res.json({
      message: 'Project updated successfully',
      project: updatedProject
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ message: 'Server error while updating project' });
  }
});

// Add team member to project
router.post('/:id/members', [
  auth,
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('role')
    .isIn(['admin', 'member'])
    .withMessage('Role must be admin or member')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only owner can add members
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only project owners can add team members' });
    }

    const { email, role } = req.body;

    // Find user by email
    const User = require('../models/User');
    const user = await User.findOne({ email, isActive: true });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is already a member
    const existingMember = project.teamMembers.find(
      member => member.user.toString() === user._id.toString()
    );

    if (existingMember) {
      return res.status(400).json({ message: 'User is already a team member' });
    }

    // Add member to project
    project.teamMembers.push({
      user: user._id,
      role: role
    });

    await project.save();

    const updatedProject = await Project.findById(project._id)
      .populate('owner', 'username email avatar')
      .populate('teamMembers.user', 'username email avatar');

    res.json({
      message: 'Team member added successfully',
      project: updatedProject
    });
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({ message: 'Server error while adding team member' });
  }
});

// Remove team member from project
router.delete('/:id/members/:memberId', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only owner can remove members
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only project owners can remove team members' });
    }

    const memberId = req.params.memberId;

    // Remove member from project
    project.teamMembers = project.teamMembers.filter(
      member => member.user.toString() !== memberId
    );

    await project.save();

    const updatedProject = await Project.findById(project._id)
      .populate('owner', 'username email avatar')
      .populate('teamMembers.user', 'username email avatar');

    res.json({
      message: 'Team member removed successfully',
      project: updatedProject
    });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ message: 'Server error while removing team member' });
  }
});

// Delete project
router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only owner can delete project
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only project owners can delete projects' });
    }

    // Soft delete by setting isActive to false
    project.isActive = false;
    await project.save();

    // Also soft delete all tasks in this project
    await Task.updateMany(
      { project: project._id },
      { isActive: false }
    );

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ message: 'Server error while deleting project' });
  }
});

module.exports = router;
