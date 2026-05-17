const express = require('express');
const router = express.Router();
const { getAllClasses, createClass, deleteClass } = require('../controllers/classController');
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');

router.use(authenticateToken);

router.get('/', getAllClasses); // Accessible by all authenticated users
router.post('/', authorizeRoles('ADMIN'), createClass);
router.delete('/:id', authorizeRoles('ADMIN'), deleteClass);

module.exports = router;
