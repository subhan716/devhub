const User = require('../models/User');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');
const axios = require('axios');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please add all fields' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      passwordHash: password,
    });

    if (user) {
      const accessToken = generateAccessToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      // Save refresh token to DB
      user.refreshToken = refreshToken;
      await user.save();

      res.cookie('jwt', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user and select passwordHash explicitly because we set select: false in schema
    const user = await User.findOne({ email }).select('+passwordHash');

    if (user && !user.passwordHash) {
      return res.status(401).json({ message: 'You registered using a social account. Please log in with Google or GitHub.' });
    }

    if (user && (await user.matchPassword(password))) {
      const accessToken = generateAccessToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      user.refreshToken = refreshToken;
      await user.save();

      res.cookie('jwt', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Logout user / clear refresh token
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.refreshToken = '';
      await user.save();
    }
    res.cookie('jwt', '', {
      httpOnly: true,
      expires: new Date(0),
    });
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || { url: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png' }
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Redirect to Google OAuth
// @route   GET /api/auth/google
// @access  Public
const googleAuth = (req, res) => {
  const intent = req.query.intent || 'login';
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_CALLBACK_URL}&response_type=code&scope=profile email&state=${intent}`;
  res.redirect(url);
};

// @desc    Google OAuth Callback
// @route   GET /api/auth/google/callback
// @access  Public
const googleCallback = async (req, res) => {
  try {
    const { code, state: intent } = req.query;
    if (!code) return res.status(400).send('No code provided');

    const { data } = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      code,
      redirect_uri: process.env.GOOGLE_CALLBACK_URL,
      grant_type: 'authorization_code',
    });

    const { access_token } = data;
    const { data: profile } = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    let isNewUser = false;
    let user = await User.findOne({ email: profile.email });
    if (!user) {
      isNewUser = true;
      user = await User.create({
        name: profile.name,
        email: profile.email,
        googleId: profile.id,
        isVerified: true,
      });
    } else if (!user.googleId) {
      user.googleId = profile.id;
      await user.save();
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('jwt', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    // Redirect based on intent and whether it's a new registration or login
    if (intent === 'register' && !isNewUser) {
      // User tried to register but already has an account
      return res.redirect(`${process.env.CLIENT_URL}/register?error=account_exists`);
    }

    if (isNewUser) {
      res.redirect(`${process.env.CLIENT_URL}/setup-profile?oauth=success`);
    } else {
      res.redirect(`${process.env.CLIENT_URL}/feed?oauth=success`);
    }
  } catch (error) {
    console.error('Google Auth Error:', error.response?.data || error.message);
    res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
  }
};

// @desc    Redirect to GitHub OAuth
// @route   GET /api/auth/github
// @access  Public
const githubAuth = (req, res) => {
  const intent = req.query.intent || 'login';
  // Note: GitHub doesn't have a direct 'state' parameter like Google, wait it DOES have state.
  const url = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${process.env.GITHUB_CALLBACK_URL}&scope=user:email&state=${intent}`;
  res.redirect(url);
};

// @desc    GitHub OAuth Callback
// @route   GET /api/auth/github/callback
// @access  Public
const githubCallback = async (req, res) => {
  try {
    const { code, state: intent } = req.query;
    if (!code) return res.status(400).send('No code provided');

    const { data } = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: process.env.GITHUB_CALLBACK_URL,
    }, {
      headers: { Accept: 'application/json' }
    });

    const { access_token } = data;
    const { data: profile } = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    // GitHub emails might be private, fetch separately
    const { data: emails } = await axios.get('https://api.github.com/user/emails', {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    
    const primaryEmail = emails.find(e => e.primary)?.email || emails[0]?.email;
    if (!primaryEmail) throw new Error('No email found from GitHub');

    let isNewUser = false;
    let user = await User.findOne({ email: primaryEmail });
    if (!user) {
      isNewUser = true;
      user = await User.create({
        name: profile.name || profile.login,
        email: primaryEmail,
        githubId: profile.id.toString(),
        isVerified: true,
      });
    } else if (!user.githubId) {
      user.githubId = profile.id.toString();
      await user.save();
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('jwt', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    if (intent === 'register' && !isNewUser) {
      // User tried to register but already has an account
      return res.redirect(`${process.env.CLIENT_URL}/register?error=account_exists`);
    }

    if (isNewUser) {
      res.redirect(`${process.env.CLIENT_URL}/setup-profile?oauth=success`);
    } else {
      res.redirect(`${process.env.CLIENT_URL}/feed?oauth=success`);
    }
  } catch (error) {
    console.error('GitHub Auth Error:', error.response?.data || error.message);
    res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
  }
};

// @desc    Update user status preference
// @route   PUT /api/auth/status
// @access  Private
const updateStatusPreference = async (req, res) => {
  try {
    const { statusPreference } = req.body;
    
    if (!['online', 'invisible'].includes(statusPreference)) {
      return res.status(400).json({ message: 'Invalid status preference' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.statusPreference = statusPreference;
    await user.save();

    res.status(200).json({ statusPreference: user.statusPreference });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  googleAuth,
  googleCallback,
  githubAuth,
  githubCallback,
  updateStatusPreference,
};
