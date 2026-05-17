const express = require('express');
const router = express.Router();
const { getAllModules, createModule, deleteModule } = require('../controllers/moduleController');
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');

router.use(authenticateToken);

router.get('/', getAllModules);
router.post('/', authorizeRoles('ADMIN'), createModule);
router.delete('/:id', authorizeRoles('ADMIN'), deleteModule);

module.exports = router;
