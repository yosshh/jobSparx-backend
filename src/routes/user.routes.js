import { Router } from 'express';
import { loginUser, logoutUser, registerUser, updateUser } from '../controllers/user.controllers.js';
import { verifyJWT } from '../middleware/auth.middleware.js';


const router = Router()


// console.log(loginUser);
// console.log(logoutUser);
// console.log(registerUser);
// console.log(updateUser);

router.route("/register").post(registerUser)
router.route("/login").post(loginUser)
router.route("/logout").post(verifyJWT, logoutUser)
router.route('/profile/update').post(verifyJWT, updateUser)


export default router