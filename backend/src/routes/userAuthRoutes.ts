import { Router } from 'express';
import { register, login, updateProfile, googleAuth } from '../controllers/userAuthController';
import { requireUserAuth } from '../middleware/userAuth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.put('/profile', requireUserAuth, updateProfile);

export const userAuthRouter = router;

