import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import User from '../models/User';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({ message: 'Please fill in all fields' });
      return;
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      isVerified: true,
    });

    const jwtSecret = process.env.JWT_SECRET;
    const refreshSecret = process.env.REFRESH_TOKEN_SECRET || 'refresh_secret';
    if (!jwtSecret) throw new Error('JWT_SECRET is not defined');

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      refreshSecret,
      { expiresIn: '7d' }
    );

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: 'Registration successful',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      accessToken: token,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const verifyOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otpCode } = req.body;

    if (!email || !otpCode) {
      res.status(400).json({ message: 'Please provide email and OTP code' });
      return;
    }

    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (user.isVerified) {
      res.status(400).json({ message: 'User is already verified' });
      return;
    }

    if (user.otpCode !== otpCode) {
      res.status(400).json({ message: 'Invalid OTP code' });
      return;
    }

    if (user.otpExpires && user.otpExpires < new Date()) {
      res.status(400).json({ message: 'OTP code has expired' });
      return;
    }

    user.isVerified = true;
    user.otpCode = undefined;
    user.otpExpires = undefined;
    await user.save();

    const jwtSecret = process.env.JWT_SECRET;
    const refreshSecret = process.env.REFRESH_TOKEN_SECRET || 'refresh_secret';
    if (!jwtSecret) throw new Error('JWT_SECRET is not defined');

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      refreshSecret,
      { expiresIn: '7d' }
    );

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: 'Email verified successfully',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        isVerified: user.isVerified,
        role: user.role,
      },
      accessToken: token,
    });
  } catch (error: any) {
    console.error('OTP verification error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { identifier, password } = req.body;
    console.log(`Login attempt for identifier: ${identifier}`);

    if (!identifier || !password) {
      res.status(400).json({ message: 'Please provide email/username and password' });
      return;
    }

    const user = await User.findOne({
      $or: [
        { email: identifier },
        { username: identifier }
      ]
    });
    console.log(`User found: ${!!user}`);

    if (!user || !user.password) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcryptjs.compare(password, user.password);
    console.log(`Password match: ${isMatch}`);

    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    const refreshSecret = process.env.REFRESH_TOKEN_SECRET || 'refresh_secret';
    console.log(`JWT_SECRET defined: ${!!jwtSecret}`);

    if (!jwtSecret) {
      console.error("CRITICAL: JWT_SECRET is missing in environment variables");
      throw new Error('JWT_SECRET is not defined');
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      refreshSecret,
      { expiresIn: '7d' }
    );

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: 'Login successful',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        isVerified: user.isVerified,
        role: user.role,
      },
      token,
    });
  } catch (error: any) {
    console.error('SERVER LOGIN ERROR:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const refreshUserToken = async (req: Request, res: Response): Promise<void> => {
  const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;
  if (!refreshToken) {
    res.status(401).json({ message: 'Refresh token missing' });
    return;
  }

  try {
    const refreshSecret = process.env.REFRESH_TOKEN_SECRET || 'refresh_secret';
    const decoded: any = jwt.verify(refreshToken, refreshSecret);

    const user = await User.findById(decoded.userId);
    if (!user) {
      res.status(401).json({ message: 'Invalid refresh token' });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) throw new Error('JWT_SECRET is not defined');

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: '15m' }
    );

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 15 * 60 * 1000,
    });

    res.status(200).json({ token });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  res.clearCookie('auth_token');
  res.clearCookie('refreshToken');
  res.status(200).json({ message: 'Logged out successfully' });
};

export const getMe = async (req: any, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};
