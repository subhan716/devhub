const User = require('../models/User');
const PendingUser = require('../models/PendingUser');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');
const axios = require('axios');
const sendEmail = require('../utils/sendEmail');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please add all fields' });
    }

    // Block temporary/disposable emails
    const emailDomain = email.split('@')[1]?.toLowerCase();
    const blockedDomains = [
      'temp-mail.org', 'temp-mail.ru', 'temp-mail.io', 'tempmail.com', 'mailinator.com', 
      'yopmail.com', 'guerrillamail.com', '10minutemail.com', 'trashmail.com', 
      'getairmail.com', 'dispostable.com', 'sharklasers.com', 'guerrillamailblock.com', 
      'guerrillamail.net', 'guerrillamail.org', 'guerrillamail.biz', 'grr.la', 
      'guerrillamail.de', 'pokemail.net', 'spam4.me', 'crazymailing.com', 
      'generator.email', 'emailfake.com', 'fakeinbox.com', 'throwawaymail.com', 
      'maildrop.cc', 'temp-mail.net', 'minuteinbox.com', 'mytemp.email', 
      'internetslasers.com', 'smartlasers.com', 'duck.com', 'tempmail.net'
    ];

    if (
      blockedDomains.includes(emailDomain) || 
      emailDomain.includes('tempmail') || 
      emailDomain.includes('disposable') || 
      emailDomain.includes('temp-mail') ||
      emailDomain.includes('mailinator') ||
      emailDomain.includes('yopmail')
    ) {
      return res.status(400).json({ message: 'Temporary or disposable email addresses are not allowed. Please use a legit email.' });
    }

    // Check if user exists in main collection
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Delete any existing pending user with this email to avoid duplicates/conflicts
    await PendingUser.deleteOne({ email });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpire = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    // Create pending user
    const pendingUser = await PendingUser.create({
      name,
      email,
      passwordHash: password, // Mongoose pre-save hook handles hashing in User, let's keep passwordHash
      otp,
      otpExpire,
    });

    if (pendingUser) {
      // Send OTP Email
      try {
        console.log(`[DEVELOPMENT OTP LOG] Verification OTP code for ${pendingUser.email} is: ${otp}`);
        await sendEmail({
          to: pendingUser.email,
          subject: 'DevHub Account Verification Code',
          html: `
            <div style="font-family: Arial, sans-serif; background-color: #0d0d12; color: #ffffff; padding: 30px; border-radius: 12px; max-width: 500px; margin: auto;">
              <h2 style="color: #00F0FF; text-align: center; border-bottom: 1px solid #1a1a26; padding-bottom: 15px;">Welcome to DevHub!</h2>
              <p style="font-size: 15px; line-height: 1.5; color: #b3b3b3;">Thank you for registering on DevHub. To complete your sign-up, please verify your email address using the 6-digit verification code below:</p>
              <div style="background-color: #1a1a26; border: 1px solid #00F0FF/30; border-radius: 8px; padding: 15px; text-align: center; margin: 20px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #00F0FF;">${otp}</span>
              </div>
              <p style="font-size: 12px; color: #666; text-align: center;">This code is valid for 5 minutes. If you did not request this, you can safely ignore this email.</p>
            </div>
          `,
        });
      } catch (mailError) {
        console.error('Failed to send verification email:', mailError.message);
      }

      res.status(201).json({
        message: 'Verification OTP sent to email',
        email: pendingUser.email,
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

    if (user && user.otpLockUntil && user.otpLockUntil > new Date()) {
      const minutesLeft = Math.ceil((user.otpLockUntil - new Date()) / (60 * 1000));
      return res.status(403).json({ 
        message: `This account is temporarily locked due to too many verification failures. Please try again in ${minutesLeft} minutes.` 
      });
    }

    if (user && !user.passwordHash) {
      return res.status(401).json({ message: 'You registered using a social account. Please log in with Google or GitHub.' });
    }

    if (user && (await user.matchPassword(password))) {
      // Check if user is verified
      if (!user.isVerified) {
        return res.status(403).json({ 
          message: 'Account not verified. Please verify your email first.',
          isVerified: false,
          email: user.email
        });
      }

      const accessToken = generateAccessToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      user.refreshToken = refreshToken;
      await user.save();

      res.cookie('jwt', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: accessToken,
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify OTP Code
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    // Check main collection first
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User is already registered and verified' });
    }

    const pendingUser = await PendingUser.findOne({ email });
    if (!pendingUser) {
      return res.status(404).json({ message: 'Verification session not found or expired. Please sign up again.' });
    }

    // Check if account is locked due to brute force
    if (pendingUser.otpLockUntil && pendingUser.otpLockUntil > new Date()) {
      const minutesLeft = Math.ceil((pendingUser.otpLockUntil - new Date()) / (60 * 1000));
      return res.status(403).json({ 
        message: `Too many failed attempts. This account is locked. Please try again in ${minutesLeft} minutes.` 
      });
    }

    // Check if OTP matches and is not expired
    if (pendingUser.otp !== otp || pendingUser.otpExpire < new Date()) {
      pendingUser.otpFailedAttempts = (pendingUser.otpFailedAttempts || 0) + 1;
      
      if (pendingUser.otpFailedAttempts >= 3) {
        pendingUser.otpLockUntil = new Date(Date.now() + 30 * 60 * 1000); // Lock for 30 minutes
        pendingUser.otp = undefined; // Invalidate OTP
        pendingUser.otpExpire = undefined;
        pendingUser.otpFailedAttempts = 0; // Reset counter for next lock cycle
        await pendingUser.save();
        return res.status(403).json({ 
          message: 'Too many failed verification attempts. Your account has been locked for 30 minutes.' 
        });
      }

      await pendingUser.save();
      const remainingAttempts = 3 - pendingUser.otpFailedAttempts;
      return res.status(400).json({ 
        message: `Invalid or expired OTP. You have ${remainingAttempts} attempts remaining.` 
      });
    }

    // OTP matches! Create the user in the main database collection now
    const user = await User.create({
      name: pendingUser.name,
      email: pendingUser.email,
      passwordHash: pendingUser.passwordHash,
      googleId: pendingUser.googleId,
      githubId: pendingUser.githubId,
      isVerified: true,
    });

    // Delete the pending record
    await PendingUser.deleteOne({ email });

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('jwt', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: accessToken,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Resend Verification OTP
// @route   POST /api/auth/resend-otp
// @access  Public
const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const pendingUser = await PendingUser.findOne({ email });
    if (!pendingUser) {
      return res.status(404).json({ message: 'Verification session not found or expired. Please sign up again.' });
    }

    // Check if account is locked
    if (pendingUser.otpLockUntil && pendingUser.otpLockUntil > new Date()) {
      const minutesLeft = Math.ceil((pendingUser.otpLockUntil - new Date()) / (60 * 1000));
      return res.status(403).json({ 
        message: `This account is locked. Please try again in ${minutesLeft} minutes.` 
      });
    }

    // Check and enforce Resend Rate Limits: Max 3 attempts within 30 minutes
    const now = new Date();
    if (!pendingUser.otpResendTimeWindowStart || (now - pendingUser.otpResendTimeWindowStart) > (30 * 60 * 1000)) {
      // Start a new window
      pendingUser.otpResendTimeWindowStart = now;
      pendingUser.otpResendAttempts = 1;
    } else {
      // Within same 30-minute window
      if (pendingUser.otpResendAttempts >= 3) {
        const timeElapsed = now - pendingUser.otpResendTimeWindowStart;
        const minutesToWait = Math.ceil((30 * 60 * 1000 - timeElapsed) / (60 * 1000));
        return res.status(429).json({ 
          message: `Too many resends. You can request another OTP code in ${minutesToWait} minutes.` 
        });
      }
      pendingUser.otpResendAttempts += 1;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpire = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    pendingUser.otp = otp;
    pendingUser.otpExpire = otpExpire;
    await pendingUser.save();

    // Send OTP Email
    try {
      console.log(`[DEVELOPMENT OTP LOG] Verification OTP code (Resend) for ${pendingUser.email} is: ${otp}`);
      await sendEmail({
        to: pendingUser.email,
        subject: 'DevHub Account Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; background-color: #0d0d12; color: #ffffff; padding: 30px; border-radius: 12px; max-width: 500px; margin: auto;">
            <h2 style="color: #00F0FF; text-align: center; border-bottom: 1px solid #1a1a26; padding-bottom: 15px;">Welcome to DevHub!</h2>
            <p style="font-size: 15px; line-height: 1.5; color: #b3b3b3;">Thank you for registering on DevHub. To complete your sign-up, please verify your email address using the 6-digit verification code below:</p>
            <div style="background-color: #1a1a26; border: 1px solid #00F0FF/30; border-radius: 8px; padding: 15px; text-align: center; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #00F0FF;">${otp}</span>
            </div>
            <p style="font-size: 12px; color: #666; text-align: center;">This code is valid for 5 minutes. If you did not request this, you can safely ignore this email.</p>
          </div>
        `,
      });
    } catch (mailError) {
      console.error('Failed to send verification email:', mailError.message);
    }

    res.status(200).json({ message: 'Verification OTP sent to email', email: pendingUser.email });
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
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpire = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    if (!user) {
      isNewUser = true;
      // Overwrite any existing pending registration
      await PendingUser.deleteOne({ email: profile.email });

      const pending = await PendingUser.create({
        name: profile.name,
        email: profile.email,
        googleId: profile.id,
        otp,
        otpExpire,
      });

      // Send OTP Email
      try {
        console.log(`[DEVELOPMENT OTP LOG] Verification OTP code (Google) for ${pending.email} is: ${otp}`);
        await sendEmail({
          to: pending.email,
          subject: 'DevHub Account Verification Code',
          html: `
            <div style="font-family: Arial, sans-serif; background-color: #0d0d12; color: #ffffff; padding: 30px; border-radius: 12px; max-width: 500px; margin: auto;">
              <h2 style="color: #00F0FF; text-align: center; border-bottom: 1px solid #1a1a26; padding-bottom: 15px;">Welcome to DevHub!</h2>
              <p style="font-size: 15px; line-height: 1.5; color: #b3b3b3;">Thank you for registering on DevHub. To complete your sign-up, please verify your email address using the 6-digit verification code below:</p>
              <div style="background-color: #1a1a26; border: 1px solid #00F0FF/30; border-radius: 8px; padding: 15px; text-align: center; margin: 20px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #00F0FF;">${otp}</span>
              </div>
              <p style="font-size: 12px; color: #666; text-align: center;">This code is valid for 5 minutes. If you did not request this, you can safely ignore this email.</p>
            </div>
          `,
        });
      } catch (mailError) {
        console.error('Failed to send verification email:', mailError.message);
      }
    } else if (!user.googleId) {
      user.googleId = profile.id;
      await user.save();
    }

    if (intent === 'register' && !isNewUser) {
      return res.redirect(`${process.env.CLIENT_URL}/register?error=account_exists`);
    }

    if (isNewUser) {
      return res.redirect(`${process.env.CLIENT_URL}/verify-otp?email=${encodeURIComponent(profile.email)}`);
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('jwt', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.redirect(`${process.env.CLIENT_URL}/feed?oauth=success`);
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

    const { data: emails } = await axios.get('https://api.github.com/user/emails', {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    
    const primaryEmail = emails.find(e => e.primary)?.email || emails[0]?.email;
    if (!primaryEmail) throw new Error('No email found from GitHub');

    let isNewUser = false;
    let user = await User.findOne({ email: primaryEmail });
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpire = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    if (!user) {
      isNewUser = true;
      // Overwrite any existing pending registration
      await PendingUser.deleteOne({ email: primaryEmail });

      const pending = await PendingUser.create({
        name: profile.name || profile.login,
        email: primaryEmail,
        githubId: profile.id.toString(),
        otp,
        otpExpire,
      });

      // Send OTP Email
      try {
        console.log(`[DEVELOPMENT OTP LOG] Verification OTP code (GitHub) for ${pending.email} is: ${otp}`);
        await sendEmail({
          to: pending.email,
          subject: 'DevHub Account Verification Code',
          html: `
            <div style="font-family: Arial, sans-serif; background-color: #0d0d12; color: #ffffff; padding: 30px; border-radius: 12px; max-width: 500px; margin: auto;">
              <h2 style="color: #00F0FF; text-align: center; border-bottom: 1px solid #1a1a26; padding-bottom: 15px;">Welcome to DevHub!</h2>
              <p style="font-size: 15px; line-height: 1.5; color: #b3b3b3;">Thank you for registering on DevHub. To complete your sign-up, please verify your email address using the 6-digit verification code below:</p>
              <div style="background-color: #1a1a26; border: 1px solid #00F0FF/30; border-radius: 8px; padding: 15px; text-align: center; margin: 20px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #00F0FF;">${otp}</span>
              </div>
              <p style="font-size: 12px; color: #666; text-align: center;">This code is valid for 5 minutes. If you did not request this, you can safely ignore this email.</p>
            </div>
          `,
        });
      } catch (mailError) {
        console.error('Failed to send verification email:', mailError.message);
      }
    } else if (!user.githubId) {
      user.githubId = profile.id.toString();
      await user.save();
    }

    if (intent === 'register' && !isNewUser) {
      return res.redirect(`${process.env.CLIENT_URL}/register?error=account_exists`);
    }

    if (isNewUser) {
      return res.redirect(`${process.env.CLIENT_URL}/verify-otp?email=${encodeURIComponent(primaryEmail)}`);
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('jwt', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.redirect(`${process.env.CLIENT_URL}/feed?oauth=success`);
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
  verifyOtp,
  resendOtp,
};
