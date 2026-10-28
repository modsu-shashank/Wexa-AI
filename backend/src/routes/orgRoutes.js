const express = require('express');
const router = express.Router();
const orgController = require('../controllers/orgController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', orgController.getOrganization);
router.put('/', orgController.updateOrganization);

module.exports = router;
