import express from 'express';
import { authMe, searchUserByUserName} from '../controllers/userController.js';

const router = express.Router();
router.get('/me', authMe );
router.get("/search",searchUserByUserName);
export default router;