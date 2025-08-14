import express from 'express';
import {createBranch,getBranches} from '../controllers/branch.controller.js';
import verifyToken from '../middlewares/verifyToken.js';
import isAdmin from '../middlewares/isAdmin.js';

const router = express.Router();

router.post('/createbranch', createBranch);

router.get('/listbranch',getBranches);

export default router;