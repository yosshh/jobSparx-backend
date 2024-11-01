import { Router } from 'express';
import { verifyJWT } from '../middleware/auth.middleware.js';
import { getCompany, getCompanyId, registerCompany, updateCompany } from '../controllers/company.controllers.js';


const router = Router()


// console.log(loginUser);
// console.log(logoutUser);
// console.log(registerUser);
// console.log(updateUser);

router.route("/register-company").post(verifyJWT, registerCompany)
router.route("/get-company").get(verifyJWT, getCompany)
router.route("/get-company/:id").get(verifyJWT, getCompanyId)
router.route('/update/:id').put(verifyJWT, updateCompany)


export default router