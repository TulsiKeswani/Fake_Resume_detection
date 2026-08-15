const express = require('express');
const router = express.Router();
const multer = require('multer');
const { registerCompany, registerCandidate, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.post('/register/company', upload.single('logo'), registerCompany);
router.post('/register/candidate', upload.single('resume'), registerCandidate);
router.post('/login', login);
router.get('/me', protect, getMe);

module.exports = router;
