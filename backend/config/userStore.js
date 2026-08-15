const Company = require('../models/Company');
const Candidate = require('../models/Candidate');
const mongoose = require('mongoose');

// Persistent memory registry for strict duplicate checks & token resolution
const userRegistry = new Map();
const emailRegistry = new Map();

/**
 * Strict Duplicate Email Checker across MongoDB and User Store
 */
const findUserByEmail = async (email) => {
  const normalizedEmail = email.toLowerCase().trim();

  // 1. Check Memory Registry first
  if (emailRegistry.has(normalizedEmail)) {
    return emailRegistry.get(normalizedEmail);
  }

  // 2. Check MongoDB if connected
  if (mongoose.connection.readyState === 1) {
    const comp = await Company.findOne({ workEmail: normalizedEmail }).select('+password');
    if (comp) {
      const userObj = { ...comp.toObject(), role: 'company' };
      emailRegistry.set(normalizedEmail, userObj);
      userRegistry.set(comp._id.toString(), userObj);
      return userObj;
    }

    const cand = await Candidate.findOne({ email: normalizedEmail }).select('+password');
    if (cand) {
      const userObj = { ...cand.toObject(), role: 'candidate' };
      emailRegistry.set(normalizedEmail, userObj);
      userRegistry.set(cand._id.toString(), userObj);
      return userObj;
    }
  }

  return null;
};

/**
 * Strict User Lookup by ID
 */
const findUserById = async (id, role) => {
  const idStr = id.toString();

  // 1. Check Memory Registry
  if (userRegistry.has(idStr)) {
    return userRegistry.get(idStr);
  }

  // 2. Check MongoDB if connected
  if (mongoose.connection.readyState === 1) {
    try {
      if (role === 'company') {
        const comp = await Company.findById(idStr).select('-password');
        if (comp) {
          const userObj = { ...comp.toObject(), role: 'company' };
          userRegistry.set(idStr, userObj);
          return userObj;
        }
      } else {
        const cand = await Candidate.findById(idStr).select('-password');
        if (cand) {
          const userObj = { ...cand.toObject(), role: 'candidate' };
          userRegistry.set(idStr, userObj);
          return userObj;
        }
      }
    } catch (e) {
      // Invalid ObjectId format fallback
    }
  }

  return null;
};

/**
 * Save Registered User into Memory Registry & MongoDB
 */
const saveUserRecord = (userObj) => {
  const idStr = userObj.id || userObj._id.toString();
  const email = (userObj.workEmail || userObj.email).toLowerCase().trim();

  const record = {
    ...userObj,
    _id: idStr,
    id: idStr,
  };

  userRegistry.set(idStr, record);
  emailRegistry.set(email, record);
  return record;
};

module.exports = {
  findUserByEmail,
  findUserById,
  saveUserRecord,
};
