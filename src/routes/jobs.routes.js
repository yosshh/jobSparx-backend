import { Router } from 'express';
import { verifyJWT } from '../middleware/auth.middleware.js';
import { getAdminJobs, getJob, getJobById, postJob } from '../controllers/job.controllers.js';


const router = Router()



router.route("/post").post(verifyJWT, postJob)
router.route("/get").get(verifyJWT, getJob)
router.route("/getAdminJobs").get(verifyJWT, getAdminJobs)
router.route('/getJobs/:id').get(verifyJWT, getJobById)


export default router