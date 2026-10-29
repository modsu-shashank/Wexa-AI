const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Organization = require('../models/Organization');

const signToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      organizationId: user.organizationId,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Register new Organization + Admin User
exports.register = async (req, res, next) => {
  try {
    const { organizationName, email, password, name } = req.body;

    if (!organizationName || !organizationName.trim()) {
      return res.status(400).json({ success: false, message: 'Organization name is required.' });
    }
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'An account with this email address already exists.' });
    }

    const organization = await Organization.create({
      name: organizationName.trim(),
      defaultLowStockThreshold: 5,
    });

    // First user of an org always gets admin role
    const user = await User.create({
      email: normalizedEmail,
      password,
      organizationId: organization._id,
      role: 'admin',
      name: (name || '').trim(),
    });

    const token = signToken(user);

    res.status(201).json({
      success: true,
      message: 'Organization and admin account created successfully.',
      token,
      user: { id: user._id, email: user.email, role: user.role, name: user.name, organizationId: user.organizationId },
      organization: { id: organization._id, name: organization.name, defaultLowStockThreshold: organization.defaultLowStockThreshold },
    });
  } catch (error) {
    next(error);
  }
};

// Login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const organization = await Organization.findById(user.organizationId);
    const token = signToken(user);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: { id: user._id, email: user.email, role: user.role, name: user.name, organizationId: user.organizationId },
      organization: organization
        ? { id: organization._id, name: organization.name, defaultLowStockThreshold: organization.defaultLowStockThreshold }
        : null,
    });
  } catch (error) {
    next(error);
  }
};

// Get current user
exports.getMe = async (req, res, next) => {
  try {
    const organization = await Organization.findById(req.organizationId);
    res.status(200).json({
      success: true,
      user: { id: req.user._id, email: req.user.email, role: req.user.role, name: req.user.name, organizationId: req.user.organizationId },
      organization: organization
        ? { id: organization._id, name: organization.name, defaultLowStockThreshold: organization.defaultLowStockThreshold }
        : null,
    });
  } catch (error) {
    next(error);
  }
};

// Admin-only: Invite a staff user to the same org
exports.inviteUser = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ success: false, message: 'A user with this email already exists.' });
    }
    const user = await User.create({
      email: normalizedEmail,
      password,
      organizationId: req.organizationId,
      role: 'user',
      name: (name || '').trim(),
    });
    res.status(201).json({
      success: true,
      message: `Staff user ${user.email} added to your organization.`,
      user: { id: user._id, email: user.email, role: user.role, name: user.name },
    });
  } catch (error) {
    next(error);
  }
};

// Admin-only: List all users in org
exports.listUsers = async (req, res, next) => {
  try {
    const users = await User.find({ organizationId: req.organizationId }).select('-password').lean();
    res.status(200).json({ success: true, users });
  } catch (error) {
    next(error);
  }
};
