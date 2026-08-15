const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Company = require('../models/Company');
const Candidate = require('../models/Candidate');
const { uploadStreamToCloud } = require('../config/cloudinary');
const { JWT_SECRET } = require('../middleware/authMiddleware');
const { findUserByEmail, saveUserRecord } = require('../config/userStore');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, JWT_SECRET, {
    expiresIn: '7d',
  });
};

/**
 * @desc    Register Company Profile
 * @route   POST /api/auth/register/company
 * @access  Public
 */
const registerCompany = async (req, res) => {
  try {
    const { companyName, workEmail, password, industry, companySize, website, location, description } = req.body;

    if (!companyName || !workEmail || !password) {
      return res.status(400).json({
        success: false,
        message: 'Company name, work email, and password are required fields.',
      });
    }

    // STRICT Duplicate Email Check
    const existingUser = await findUserByEmail(workEmail);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A company or user with this email address is already registered. Please sign in instead.',
      });
    }

    let logoUrl = '';
    if (req.file) {
      const uploadRes = await uploadStreamToCloud(req.file.buffer, 'intellify_logos', 'image');
      logoUrl = uploadRes.url;
    }

    let company;
    if (mongoose.connection.readyState === 1) {
      company = await Company.create({
        companyName,
        workEmail,
        password,
        industry: industry || 'Technology & Software',
        companySize: companySize || '11-50',
        website: website || '',
        location: location || 'Remote',
        description: description || '',
        logoUrl,
      });
      company = company.toObject();
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      company = {
        _id: 'comp_' + Date.now(),
        companyName,
        workEmail,
        password: hashedPassword,
        role: 'company',
        industry: industry || 'Technology & Software',
        companySize: companySize || '11-50',
        website: website || '',
        location: location || 'Remote',
        description: description || '',
        logoUrl,
      };
    }

    saveUserRecord(company);

    const token = generateToken(company._id || company.id, 'company');

    return res.status(201).json({
      success: true,
      message: 'Company registered successfully!',
      token,
      user: {
        id: company._id || company.id,
        companyName: company.companyName,
        email: company.workEmail,
        role: 'company',
        industry: company.industry,
        companySize: company.companySize,
        logoUrl: company.logoUrl,
      },
    });
  } catch (error) {
    console.error('Register Company Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error occurred during company registration.',
    });
  }
};

/**
 * @desc    Register Candidate Profile (Multi-step form payload + Resume cloud file upload)
 * @route   POST /api/auth/register/candidate
 * @access  Public
 */
const registerCandidate = async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      phone,
      location,
      title,
      experienceYears,
      primarySkills,
      summary,
      degree,
      university,
      graduationYear,
      githubUrl,
      linkedInUrl,
      leetCodeUrl,
      portfolioUrl,
    } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email, and password are required fields.',
      });
    }

    // STRICT Duplicate Email Check
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A candidate with this email address is already registered. Please sign in instead.',
      });
    }

    // Process Cloud Resume Upload
    let resumeUrl = '';
    let resumePublicId = '';
    let resumeFileName = '';

    if (req.file) {
      resumeFileName = req.file.originalname;
      const uploadRes = await uploadStreamToCloud(req.file.buffer, 'intellify_resumes', 'raw');
      resumeUrl = uploadRes.url;
      resumePublicId = uploadRes.publicId;
    }

    // Parse primary skills
    let parsedSkills = [];
    if (primarySkills) {
      if (Array.isArray(primarySkills)) {
        parsedSkills = primarySkills;
      } else if (typeof primarySkills === 'string') {
        try {
          parsedSkills = JSON.parse(primarySkills);
        } catch (e) {
          parsedSkills = primarySkills.split(',').map((s) => s.trim());
        }
      }
    }

    let candidate;
    if (mongoose.connection.readyState === 1) {
      candidate = await Candidate.create({
        fullName,
        email,
        password,
        phone: phone || '',
        location: location || '',
        title: title || 'Software Developer',
        experienceYears: Number(experienceYears) || 0,
        primarySkills: parsedSkills,
        summary: summary || '',
        degree: degree || 'Bachelor of Science',
        university: university || '',
        graduationYear: graduationYear || '',
        githubUrl: githubUrl || '',
        linkedInUrl: linkedInUrl || '',
        leetCodeUrl: leetCodeUrl || '',
        portfolioUrl: portfolioUrl || '',
        resumeUrl,
        resumePublicId,
        resumeFileName,
      });
      candidate = candidate.toObject();
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      candidate = {
        _id: 'cand_' + Date.now(),
        fullName,
        email,
        password: hashedPassword,
        phone: phone || '',
        location: location || '',
        role: 'candidate',
        title: title || 'Software Developer',
        experienceYears: Number(experienceYears) || 0,
        primarySkills: parsedSkills,
        summary: summary || '',
        degree: degree || 'Bachelor of Science',
        university: university || '',
        graduationYear: graduationYear || '',
        githubUrl: githubUrl || '',
        linkedInUrl: linkedInUrl || '',
        leetCodeUrl: leetCodeUrl || '',
        portfolioUrl: portfolioUrl || '',
        resumeUrl,
        resumePublicId,
        resumeFileName,
      };
    }

    saveUserRecord(candidate);

    const token = generateToken(candidate._id || candidate.id, 'candidate');

    return res.status(201).json({
      success: true,
      message: 'Candidate profile created successfully!',
      token,
      user: {
        id: candidate._id || candidate.id,
        fullName: candidate.fullName,
        email: candidate.email,
        role: 'candidate',
        title: candidate.title,
        resumeUrl: candidate.resumeUrl,
        primarySkills: candidate.primarySkills,
      },
    });
  } catch (error) {
    console.error('Register Candidate Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error occurred during candidate registration.',
    });
  }
};

/**
 * @desc    Universal Login for Company and Candidate
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const targetEmail = email.toLowerCase().trim();
    let user = await findUserByEmail(targetEmail);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    let isMatch = false;
    if (user.matchPassword) {
      isMatch = await user.matchPassword(password);
    } else if (user.password) {
      isMatch = await bcrypt.compare(password, user.password);
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    const userRole = role || user.role || 'candidate';
    const token = generateToken(user._id || user.id, userRole);

    const userObj = { ...user };
    delete userObj.password;

    return res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        ...userObj,
        role: userRole,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during login authentication.',
    });
  }
};

/**
 * @desc    Get Current Logged-in User Profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
  try {
    return res.json({
      success: true,
      user: req.user,
      role: req.role,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch current user profile.',
    });
  }
};

module.exports = {
  registerCompany,
  registerCandidate,
  login,
  getMe,
};
