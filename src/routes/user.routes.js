import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  updateUser,
  getAllUsers,
} from "../controllers/user.controllers.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();

// Routes
router.route("/").get(getAllUsers);
router.route("/register").post(upload.single("file"), registerUser);
router.route("/login").post(loginUser);
router.route("/logout").get(logoutUser);
router.route("/profile/update").post(verifyJWT,upload.single("file"), updateUser); 

export default router;
