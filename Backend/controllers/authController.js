import crypto from 'crypto';
import User from '../models/User.js';

// Generate JWT manually using native crypto
const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || 'fallback_secret';
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  
  // Expiry set to 30 days from now
  const exp = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60);
  const payload = Buffer.from(JSON.stringify({ id, exp })).toString('base64url');
  
  const signature = crypto.createHmac('sha256', secret)
                          .update(`${header}.${payload}`)
                          .digest('base64url');
                          
  return `${header}.${payload}.${signature}`;
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { id: empId, password } = req.body;

    // Check for user email/empId
    const user = await User.findOne({ 
      $or: [{ empId: empId }, { email: empId }] 
    });

    if (user && (await user.matchPassword(password))) {
      // Update last login
      const now = new Date();
      user.lastLogin = now.toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric'
      }) + ', ' + now.toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit', hour12: true
      });
      await user.save();

      res.json({
        success: true,
        token: generateToken(user._id),
        user: user, // will use toJSON transform to strip password and set id=empId
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid employee ID or password' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
