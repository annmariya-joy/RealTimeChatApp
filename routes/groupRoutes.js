const express = require('express');
const router = express.Router();
const {createGroup, addMember,removeMember,updateGroup,deleteGroup } = require('../controllers/groupController'); 

const { authenticateAccessToken } = require('../config/utils/auth');

router.post('/createGroup',authenticateAccessToken, createGroup);

router.post('/addmembers', authenticateAccessToken,addMember);

router.put('/updateGroup', authenticateAccessToken,updateGroup);

router.delete('/removemembers',authenticateAccessToken, removeMember);

router.delete('/deleteGroup',authenticateAccessToken, deleteGroup);
module.exports = router;
