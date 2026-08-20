const User = require('../models/User');
const AdminUser = require('../models/AdminUser');
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

// @desc    Authenticate a user (Checks dedicated AdminUser first, then User)
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // 1. Check dedicated AdminUser collection first
    const adminUser = await AdminUser.findOne({ email: email.toLowerCase() }).select('+passwordHash');
    if (adminUser) {
      if (adminUser.lockUntil && adminUser.lockUntil > new Date()) {
        const minutesLeft = Math.ceil((adminUser.lockUntil - new Date()) / (60 * 1000));
        return res.status(403).json({ 
          message: `Admin account is locked due to security attempts. Please try again in ${minutesLeft} minutes.` 
        });
      }

      if (adminUser.isActive === false) {
        return res.status(403).json({ message: 'Admin account has been deactivated.' });
      }

      if (await adminUser.matchPassword(password)) {
        const accessToken = generateAccessToken(adminUser._id);
        const refreshToken = generateRefreshToken(adminUser._id);

        adminUser.refreshToken = refreshToken;
        adminUser.lastLoginAt = new Date();
        adminUser.lastLoginIp = req.ip || req.connection?.remoteAddress || '';
        adminUser.failedLoginAttempts = 0;
        adminUser.lockUntil = undefined;
        await adminUser.save();

        res.cookie('jwt', accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV !== 'development',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
          maxAge: 30 * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
          _id: adminUser.id,
          name: adminUser.name,
          email: adminUser.email,
          role: adminUser.role,
          isAdmin: true,
          token: accessToken,
        });
      } else {
        adminUser.failedLoginAttempts = (adminUser.failedLoginAttempts || 0) + 1;
        if (adminUser.failedLoginAttempts >= 5) {
          adminUser.lockUntil = new Date(Date.now() + 30 * 60 * 1000);
        }
        await adminUser.save();
        return res.status(401).json({ message: 'Invalid credentials' });
      }
    }

    // 2. Otherwise, check regular User collection
    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');

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

      if (user.isSuspended) {
        return res.status(403).json({ message: 'Your account has been suspended by an administrator.' });
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

      return res.status(200).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerifiedBadge: user.isVerifiedBadge,
        token: accessToken,
      });
    } else {
      return res.status(401).json({ message: 'Invalid credentials' });
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
            <h2 style="color: #00F0FF; text-align: center; border-bottom: 1px solid #1a1a26; padding-bottom: 15px;">DevHub Verification Code</h2>
            <p style="font-size: 15px; line-height: 1.5; color: #b3b3b3;">You requested a new verification code. Please use the 6-digit code below to activate your account:</p>
            <div style="background-color: #1a1a26; border: 1px solid #00F0FF/30; border-radius: 8px; padding: 15px; text-align: center; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #00F0FF;">${otp}</span>
            </div>
            <p style="font-size: 12px; color: #666; text-align: center;">This code is valid for 5 minutes. If you did not request this, please disregard.</p>
          </div>
        `,
      });
    } catch (mailError) {
      console.error('Failed to resend verification email:', mailError.message);
    }

    res.status(200).json({
      message: 'New verification OTP sent to your email',
      email: pendingUser.email,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Log out user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = async (req, res) => {
  try {
    if (req.user) {
      // Clear refresh token in either User or AdminUser
      await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
      await AdminUser.findByIdAndUpdate(req.user._id, { refreshToken: null });
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

// @desc    Get current logged in user (or Admin)
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    let user = await User.findById(req.user.id);
    let isAdmin = false;

    if (!user) {
      user = await AdminUser.findById(req.user.id);
      isAdmin = true;
    }

    if (user) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isAdmin: isAdmin || ['super_admin', 'admin', 'moderator'].includes(user.role),
        isVerifiedBadge: user.isVerifiedBadge,
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
      let pendingUser = await PendingUser.findOne({ email: profile.email });
      if (!pendingUser) {
        pendingUser = await PendingUser.create({
          name: profile.name,
          email: profile.email,
          googleId: profile.id,
          otp,
          otpExpire,
        });
      } else {
        pendingUser.otp = otp;
        pendingUser.otpExpire = otpExpire;
        pendingUser.googleId = profile.id;
        await pendingUser.save();
      }

      // Send OTP Email
      try {
        console.log(`[DEVELOPMENT OTP LOG] Verification OTP code (Google) for ${profile.email} is: ${otp}`);
        await sendEmail({
          to: profile.email,
          subject: 'DevHub Google Sign-Up Verification Code',
          html: `
            <div style="font-family: Arial, sans-serif; background-color: #0d0d12; color: #ffffff; padding: 30px; border-radius: 12px; max-width: 500px; margin: auto;">
              <h2 style="color: #00F0FF; text-align: center; border-bottom: 1px solid #1a1a26; padding-bottom: 15px;">DevHub Verification Code</h2>
              <p style="font-size: 15px; line-height: 1.5; color: #b3b3b3;">Welcome to DevHub! To complete your Google sign-up, enter the following 6-digit code:</p>
              <div style="background-color: #1a1a26; border: 1px solid #00F0FF/30; border-radius: 8px; padding: 15px; text-align: center; margin: 20px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #00F0FF;">${otp}</span>
              </div>
              <p style="font-size: 12px; color: #666; text-align: center;">This code is valid for 5 minutes. If you did not request this, please disregard.</p>
            </div>
          `,
        });
      } catch (mailError) {
        console.error('Failed to send verification email:', mailError.message);
      }

      return res.redirect(`${process.env.CLIENT_URL}/verify-otp?email=${encodeURIComponent(profile.email)}&source=google`);
    }

    if (intent === 'register') {
      return res.redirect(`${process.env.CLIENT_URL}/register?error=account_exists`);
    }

    if (!user.googleId) {
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
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    const isFirstTimeLogin = isNewUser || (!user.bio && !user.title && !user.avatar?.public_id);
    const targetUrl = isFirstTimeLogin ? `${process.env.CLIENT_URL}/setup-profile` : `${process.env.CLIENT_URL}/feed`;

    res.redirect(targetUrl);
  } catch (error) {
    console.error('Google Auth Error:', error.response?.data || error.message);
    res.redirect(`${process.env.CLIENT_URL}/login?error=google_auth_failed`);
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

    const { data } = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: process.env.GITHUB_CALLBACK_URL,
      },
      { headers: { Accept: 'application/json' } }
    );

    const { access_token } = data;
    const { data: profile } = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    let primaryEmail = profile.email;
    if (!primaryEmail) {
      const { data: emails } = await axios.get('https://api.github.com/user/emails', {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      const primaryEmailObj = emails.find((e) => e.primary && e.verified);
      primaryEmail = primaryEmailObj ? primaryEmailObj.email : emails[0]?.email;
    }

    if (!primaryEmail) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=no_github_email`);
    }

    let isNewUser = false;
    let user = await User.findOne({ email: primaryEmail });
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpire = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    if (!user) {
      isNewUser = true;
      let pendingUser = await PendingUser.findOne({ email: primaryEmail });
      if (!pendingUser) {
        pendingUser = await PendingUser.create({
          name: profile.name || profile.login,
          email: primaryEmail,
          githubId: profile.id.toString(),
          otp,
          otpExpire,
        });
      } else {
        pendingUser.otp = otp;
        pendingUser.otpExpire = otpExpire;
        pendingUser.githubId = profile.id.toString();
        await pendingUser.save();
      }

      // Send OTP Email
      try {
        console.log(`[DEVELOPMENT OTP LOG] Verification OTP code (GitHub) for ${primaryEmail} is: ${otp}`);
        await sendEmail({
          to: primaryEmail,
          subject: 'DevHub GitHub Sign-Up Verification Code',
          html: `
            <div style="font-family: Arial, sans-serif; background-color: #0d0d12; color: #ffffff; padding: 30px; border-radius: 12px; max-width: 500px; margin: auto;">
              <h2 style="color: #00F0FF; text-align: center; border-bottom: 1px solid #1a1a26; padding-bottom: 15px;">DevHub Verification Code</h2>
              <p style="font-size: 15px; line-height: 1.5; color: #b3b3b3;">Welcome to DevHub! To complete your GitHub sign-up, enter the following 6-digit code:</p>
              <div style="background-color: #1a1a26; border: 1px solid #00F0FF/30; border-radius: 8px; padding: 15px; text-align: center; margin: 20px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #00F0FF;">${otp}</span>
              </div>
              <p style="font-size: 12px; color: #666; text-align: center;">This code is valid for 5 minutes. If you did not request this, please disregard.</p>
            </div>
          `,
        });
      } catch (mailError) {
        console.error('Failed to send verification email:', mailError.message);
      }

      return res.redirect(`${process.env.CLIENT_URL}/verify-otp?email=${encodeURIComponent(primaryEmail)}&source=github`);
    }

    if (intent === 'register') {
      return res.redirect(`${process.env.CLIENT_URL}/register?error=account_exists`);
    }

    if (!user.githubId) {
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
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    const isFirstTimeLogin = isNewUser || (!user.bio && !user.title && !user.avatar?.public_id);
    const targetUrl = isFirstTimeLogin ? `${process.env.CLIENT_URL}/setup-profile` : `${process.env.CLIENT_URL}/feed`;

    res.redirect(targetUrl);
  } catch (error) {
    console.error('GitHub Auth Error:', error.response?.data || error.message);
    res.redirect(`${process.env.CLIENT_URL}/login?error=github_auth_failed`);
  }
};

// @desc    Update online/invisible status preference
// @route   PUT /api/auth/status
// @access  Private
const updateStatusPreference = async (req, res) => {
  try {
    const { statusPreference } = req.body;
    if (!['online', 'invisible'].includes(statusPreference)) {
      return res.status(400).json({ message: 'Invalid status preference' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.statusPreference = statusPreference;
    await user.save();

    res.status(200).json({ message: 'Status preference updated successfully', statusPreference: user.statusPreference });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc    Update user password (or set initial password for OAuth users)
// @route   PUT /api/auth/update-password
// @access  Private
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id || req.user._id;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long.' });
    }

    const user = await User.findById(userId).select('+passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If user already has a password set, verify currentPassword
    if (user.passwordHash) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required to update credentials.' });
      }
      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ message: 'Incorrect current password. Please try again.' });
      }
    }

    // Set new password (pre-save hook will hash it with bcrypt 10 rounds)
    user.passwordHash = newPassword;
    user.tokenVersion = (user.tokenVersion || 0) + 1; // Invalidate other stale sessions
    await user.save();

    res.status(200).json({ 
      message: 'Password updated successfully! Other active sessions have been cryptographically rotated.' 
    });
  } catch (error) {
    console.error('Error in updatePassword:', error);
    res.status(500).json({ message: 'Failed to update password: ' + error.message });
  }
};

// @desc    Get user security telemetry & active session forensics
// @route   GET /api/auth/security-forensics
// @access  Private
const getSecurityForensics = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const user = await User.findById(userId).select('+passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userAgent = req.headers['user-agent'] || 'Unknown Browser';
    let browser = 'Unknown Browser';
    let os = 'Unknown OS';

    // Fast User-Agent Parser
    if (userAgent.includes('Chrome')) browser = 'Google Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Mozilla Firefox';
    else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'Apple Safari';
    else if (userAgent.includes('Edg')) browser = 'Microsoft Edge';

    if (userAgent.includes('Windows')) os = 'Windows OS';
    else if (userAgent.includes('Macintosh') || userAgent.includes('Mac OS')) os = 'macOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android Device';
    else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS Device';

    const clientIp = req.ip || req.connection?.remoteAddress || req.headers['x-forwarded-for'] || '127.0.0.1';

    res.status(200).json({
      hasPasswordSet: Boolean(user.passwordHash),
      isOAuthUser: Boolean(user.googleId || user.githubId),
      tokenVersion: user.tokenVersion || 0,
      lastUpdated: user.updatedAt,
      currentSession: {
        browser,
        os,
        ip: clientIp.replace('::ffff:', ''),
        lastActive: new Date().toISOString(),
        isCurrent: true,
      },
    });
  } catch (error) {
    console.error('Error in getSecurityForensics:', error);
    res.status(500).json({ message: 'Failed to retrieve security forensics: ' + error.message });
  }
};

// @desc    Revoke all other active device sessions (Zero-Trust $O(1)$ Token Invalidation)
// @route   POST /api/auth/revoke-all-sessions
// @access  Private
const revokeAllSessions = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // $O(1) Token Version Bump
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();

    // Generate fresh access token for current device so current user stays logged in if desired
    const accessToken = generateAccessToken(user);
    res.cookie('jwt', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: 'All other active device sessions have been revoked successfully.',
      tokenVersion: user.tokenVersion,
      newToken: accessToken,
    });
  } catch (error) {
    console.error('Error in revokeAllSessions:', error);
    res.status(500).json({ message: 'Failed to revoke sessions: ' + error.message });
  }
};



// Helper to mask email (e.g. s***@gmail.com)
const maskEmail = (email) => {
  if (!email) return 'your email';
  const parts = email.split('@');
  const name = parts[0];
  const domain = parts[1];
  const maskedName = name.length > 2 ? name[0] + '***' + name[name.length - 1] : name[0] + '***';
  return `${maskedName}@${domain}`;
};

// @desc    Request Email OTP for Password Change (LinkedIn Step-Up Security)
// @route   POST /api/auth/request-password-otp
// @access  Private
const requestPasswordOtp = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id || req.user._id;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long.' });
    }

    const user = await User.findById(userId).select('+passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password if user already has one
    if (user.passwordHash) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required.' });
      }
      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ message: 'Incorrect current password. Please try again.' });
      }
    }

    // Generate 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.passwordChangeOtp = otp;
    user.passwordChangeOtpExpire = otpExpire;
    user.pendingNewPassword = newPassword;
    await user.save();

    console.log(`[DEVELOPMENT OTP LOG] Password change verification OTP for ${user.email} is: ${otp}`);

    // Send Security Verification Email
    try {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; background-color: #0A0A0A; color: #FFFFFF; padding: 30px; border-radius: 12px; max-width: 520px; margin: auto; border: 1px solid #222;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #00F0FF; font-size: 24px; margin: 0; letter-spacing: -0.5px;">DevHub Security</h1>
            <p style="color: #888; font-size: 12px; margin-top: 4px;">Account Security & Step-Up Verification</p>
          </div>
          <p style="font-size: 14px; color: #CCC; line-height: 1.6;">Hello <strong>${user.name}</strong>,</p>
          <p style="font-size: 14px; color: #CCC; line-height: 1.6;">
            We received a request to update the password on your DevHub developer account. Use the 6-digit verification code below to authorize this change:
          </p>
          <div style="background-color: #111116; border: 1px solid #00F0FF; border-radius: 8px; text-align: center; padding: 18px; margin: 24px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #00F0FF; font-family: monospace;">${otp}</span>
          </div>
          <p style="font-size: 12px; color: #888; line-height: 1.5;">
            This security code is valid for <strong>10 minutes</strong>. If you did not initiate this request, someone may be attempting to access your account. Please check your active sessions immediately.
          </p>
          <hr style="border: 0; border-top: 1px solid #222; margin: 24px 0;" />
          <p style="font-size: 11px; color: #555; text-align: center; margin: 0;">
            DevHub Global Trust & Safety • Zero-Trust Security Infrastructure
          </p>
        </div>
      `;

      await sendEmail({
        to: user.email,
        subject: `DevHub Security Code: ${otp} (Confirm Password Change)`,
        html: emailHtml,
      });
    } catch (emailErr) {
      console.warn('Could not dispatch password OTP email via network, relying on console log:', emailErr.message);
    }

    res.status(200).json({
      success: true,
      message: `Verification code sent to ${maskEmail(user.email)}`,
      emailMasked: maskEmail(user.email),
    });
  } catch (error) {
    console.error('Error in requestPasswordOtp:', error);
    res.status(500).json({ message: 'Failed to request password verification code: ' + error.message });
  }
};

// @desc    Verify OTP and Finalize Password Change
// @route   POST /api/auth/verify-password-otp
// @access  Private
const verifyPasswordOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    const userId = req.user.id || req.user._id;

    if (!otp) {
      return res.status(400).json({ message: 'Please enter the 6-digit verification code.' });
    }

    const user = await User.findById(userId).select('+passwordChangeOtp +passwordChangeOtpExpire +pendingNewPassword');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.passwordChangeOtp || !user.passwordChangeOtpExpire) {
      return res.status(400).json({ message: 'No active password change request found. Please request a new code.' });
    }

    if (new Date() > new Date(user.passwordChangeOtpExpire)) {
      return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
    }

    if (user.passwordChangeOtp.trim() !== otp.trim()) {
      return res.status(400).json({ message: 'Invalid verification code. Please check your email and try again.' });
    }

    if (!user.pendingNewPassword) {
      return res.status(400).json({ message: 'Pending password expired. Please restart the password change flow.' });
    }

    // Apply new password (pre-save hook hashes with bcrypt)
    user.passwordHash = user.pendingNewPassword;
    user.passwordChangeOtp = undefined;
    user.passwordChangeOtpExpire = undefined;
    user.pendingNewPassword = undefined;
    user.tokenVersion = (user.tokenVersion || 0) + 1; // Invalidate all other sessions
    await user.save();

    // Generate fresh JWT token for current session cookie
    const accessToken = generateAccessToken(user);
    res.cookie('jwt', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Send confirmation security alert email
    try {
      await sendEmail({
        to: user.email,
        subject: 'Security Alert: Your DevHub Password Was Changed',
        html: `
          <div style="font-family: Arial, sans-serif; background-color: #0A0A0A; color: #FFFFFF; padding: 30px; border-radius: 12px; max-width: 520px; margin: auto; border: 1px solid #222;">
            <h2 style="color: #00F0FF; margin-top: 0;">Password Successfully Updated</h2>
            <p style="color: #CCC; font-size: 14px; line-height: 1.6;">Hello ${user.name},</p>
            <p style="color: #CCC; font-size: 14px; line-height: 1.6;">
              The password for your DevHub account (${user.email}) was successfully changed on ${new Date().toUTCString()}.
            </p>
            <p style="color: #888; font-size: 12px; line-height: 1.5;">
              All other active sessions on other browsers and devices have been automatically signed out for your protection.
            </p>
          </div>
        `,
      });
    } catch (e) {
      // ignore
    }

    res.status(200).json({
      success: true,
      message: 'Password updated successfully! All other active sessions have been signed out.',
      newToken: accessToken,
    });
  } catch (error) {
    console.error('Error in verifyPasswordOtp:', error);
    res.status(500).json({ message: 'Failed to verify code: ' + error.message });
  }
};

// @desc    Resend Password Change OTP
// @route   POST /api/auth/resend-password-otp
// @access  Private
const resendPasswordOtp = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const user = await User.findById(userId).select('+pendingNewPassword');
    if (!user || !user.pendingNewPassword) {
      return res.status(400).json({ message: 'No pending password change found. Please start over.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.passwordChangeOtp = otp;
    user.passwordChangeOtpExpire = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    console.log(`[DEVELOPMENT OTP LOG] Resent password change OTP for ${user.email} is: ${otp}`);

    try {
      await sendEmail({
        to: user.email,
        subject: `DevHub Security Code: ${otp} (Resend)`,
        html: `<p>Your new DevHub security code is: <strong>${otp}</strong> (valid for 10 minutes).</p>`,
      });
    } catch (e) {
      // ignore
    }

    res.status(200).json({
      success: true,
      message: `New verification code sent to ${maskEmail(user.email)}`,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to resend code: ' + error.message });
  }
};


module.exports = {
  registerUser,
  loginUser,
  verifyOtp,
  resendOtp,
  logoutUser,
  getMe,
  googleAuth,
  googleCallback,
  githubAuth,
  githubCallback,
  updateStatusPreference,
  updatePassword,
  requestPasswordOtp,
  verifyPasswordOtp,
  resendPasswordOtp,
  getSecurityForensics,
  revokeAllSessions,
};
