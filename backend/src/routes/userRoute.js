import express from 'express';
import { authMe, searchUserByUserName, uploadAvatar, updateProfile, changePassword} from '../controllers/userController.js';
import {upload} from "../middlewares/uploadMiddleware.js"
const router = express.Router();
router.get('/me', authMe );
router.get("/search",searchUserByUserName);
router.patch("/me", updateProfile);
router.patch("/password", changePassword);
router.post("/uploadAvatar", upload.single("file"),uploadAvatar);
export default router;