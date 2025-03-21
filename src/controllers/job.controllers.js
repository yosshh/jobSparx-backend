import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Job } from "../models/job.models.js";
import { io } from "../server.js";


// admin posting jobs
const postJob = asyncHandler( async (req, res) => {
    try {
        const { title, description, requirements, salary, location, jobType, experience, position, companyId} = req.body;
        const userId = req.user._id;

        if ([title, description, requirements, location, jobType, position, companyId].some(field => !field) || salary == null || experience == null) {
            throw new ApiError(400, "All fields are required.");
        }
        

        const job = await Job.create({
            title,
            description,
            location,
            salary: Number(salary),
            experience,
            position,
            requirements: requirements.split(","),
            jobType,
            company: companyId,
            created_by: userId
        })
        console.log("📢 Emitting new job alert:", job);
        io.emit("newJob", {
            title: job.title,
            company: job.company.toString(),
            location: job.location
        });


        return res
        .status(201)
        .json( new ApiResponse(201, job, "Job created successfully."))
    } catch (error) {
        console.log(error);
    }
})

// for students
const getJob = asyncHandler(async(req, res)=>  {
    try {
        const keyword = req.query.keyword || "";
        const query = {
            $or: [
                {title: {$regex: keyword, $options: "i"}},
                {title: {$regex: keyword, $options: "i"}},
            ]
        };
        const jobs = await Job.find(query).populate({
            path: "company"
        }).sort({ createdAt: -1});
        if(!jobs) {
            throw new ApiError(404, "Jobs not found.")
        }

        return res
        .status(200)
        .json( new ApiResponse( 200, jobs))
    } catch (error) {
        console.log(error);
    }
})

// for students
const getJobById = asyncHandler(async(req, res)=> {
    try {
        const jobId = req.params.id;
        const job = await Job.findById(jobId).populate({
            path: "applications"
        });
        if(!job) {
            throw new ApiError(404, "Jobs not found.")
        }

        return res
        .status(200)
        .json(new ApiResponse(200, job))
    } catch (error) {
        console.log(error);
    }
})


// jobs posted by admin
const getAdminJobs = asyncHandler(async(req, res)=> {
    try {
        const adminId = req.user._id;
        const jobs = await Job.find({created_by: adminId}).populate({
            path: 'company',
            createdAt: -1
        })
        if(!jobs) {
            throw new ApiError(404, "Job not found for admin.")
        }

        return res
        .status(200)
        .json(new ApiResponse(200, jobs))
    } catch (error) {
        console.log(error);
    }
})


export {getAdminJobs, getJob, getJobById, postJob}