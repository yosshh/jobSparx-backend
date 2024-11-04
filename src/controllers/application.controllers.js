import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Application } from "../models/application.models.js";
import { Job } from "../models/job.models.js";

const applyJob = asyncHandler(async(req, res)=> {
    try {
        const userId = req.user._id;
        const jobId  = req.params.id;
        if(!jobId) {
            throw new ApiError(400, "job id is required.")
        }

        // check if user has already applied for the job
        const existingApplication = await Application.findOne({job:jobId, applicant:userId})
        if(existingApplication) {
            throw new ApiError(400, "You have already applied for the job.")
        }

        // check if the job exists
        const job = await Job.findById(jobId);
        if(!job) {
            throw new ApiError(404, "Job does not exists.")
        }

        // create a new application
        const newApplication = await Application.create({
            job: jobId,
            applicant: userId
        });

        job.applications.push(newApplication._id);
        await job.save();
        return res
        .status(201)
        .json(new ApiResponse(201, "Job applied successfully."))
    } catch (error) {
        console.log(error);
    }
})

// for students to see how many jobs person has applied
const getAppliedJobs = asyncHandler(async(req, res)=> {
    try {
        const userId = req.user._id;
        const application = await Application.find({applicant: userId}).sort({createdAt: -1}).populate({
            path: 'job',
            options: {sort:{createdAt: -1}},
            populate: {
                path: 'company',
                options : {sort:{createdAt: -1}},
            }
        });
        if(!application) {
            throw new ApiError(404, "No application.")
        }

        return res
        .status(200)
        .json(new ApiResponse(200, application))
    } catch (error) {
        console.log(error);
    }
})


// for admins to see how many people have applied for the job
const getApplicants = asyncHandler(async(req, res)=> {
    try {
        console.log("inside getApplicants");
        
        const jobId = req.params.id;
        const job = await Job.findById(jobId).populate({
            path: 'applications',
            options: {sort:{createdAt:-1}},
            populate: {
                path: 'applicant'
            }
        });
        if(!job) {
            throw new ApiError(404, "problem occured while searching job posted by the admin.")
        }

        return res
        .status(200)
        .json(new ApiResponse(200,job.applications, "Applicants fetched successfully."))
    } catch (error) {
        console.log(error);
    }
});


const updateStatus = asyncHandler(async(req, res)=> {
    try {
        console.log("inside update");
        
        const {status} = req.body;
        const applicationId = req.params.id;
        if(!status) {
            throw new ApiError(400, "status is required.")
        }

        // finding application by application id
        const application = await Application.findById(applicationId);
        if(!application) {
            throw new ApiError(404, "Application not found.")
        }

        // update the status
        application.status = status.toLowerCase();
        await application.save()

        return res
        .status(200)
        .json(new ApiResponse(200, application, "status updated successfully."))
    } catch (error) {
        console.log(error);
    }
})
export {applyJob, getAppliedJobs, getApplicants, updateStatus}