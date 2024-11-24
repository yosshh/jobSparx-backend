import { Router } from 'express';
import { verifyJWT } from '../middleware/auth.middleware.js';
import { getCompany, getCompanyId, registerCompany, updateCompany } from '../controllers/company.controllers.js';
import { upload } from '../middleware/multer.middleware.js';


const router = Router()


router.route("/register-company").post(verifyJWT, registerCompany)
router.route("/get-company").get(verifyJWT, getCompany)
router.route("/get-company/:id").get(getCompanyId)
router.route('/update/:id').put(verifyJWT,upload.single("file") ,updateCompany)


export default router