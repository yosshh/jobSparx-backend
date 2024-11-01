import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Company } from "../models/company.models.js";

// Register Company
const registerCompany = asyncHandler(async (req, res) => {
    try {
        const { companyName } = req.body;
        if (!companyName) {
            throw new ApiError(400, "Company name is required.");
        }

        const existingCompany = await Company.findOne({ companyName });
        if (existingCompany) {
            throw new ApiError(400, "Company name already exists, try registering with a different name.");
        }

        const createCompany = await Company.create({
            companyName,
            userId: req.user._id // Make sure `req.user._id` is set by the authentication middleware
        });

        return res
            .status(201)
            .json(new ApiResponse(201, createCompany, "Company registered successfully."));
    } catch (error) {
        console.error(error);
        return res.status(error.statusCode || 500).json(new ApiError(error.statusCode || 500, error.message));
    }
});

// Get Companies by User ID
const getCompany = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;
        const companies = await Company.find({ userId });
        if (!companies.length) {
            throw new ApiError(404, "No company found.");
        }

        return res
            .status(200)
            .json(new ApiResponse(200, companies, "Companies retrieved successfully."));
    } catch (error) {
        console.error(error);
        return res.status(error.statusCode || 500).json(new ApiError(error.statusCode || 500, error.message));
    }
});

// Get Company by Company ID
const getCompanyId = asyncHandler(async (req, res) => {
    try {
        const companyId = req.params.id;
        const company = await Company.findById(companyId);
        if (!company) {
            throw new ApiError(404, "Company not found.");
        }

        return res
            .status(200)
            .json(new ApiResponse(200, company, "Company found successfully."));
    } catch (error) {
        console.error(error);
        return res.status(error.statusCode || 500).json(new ApiError(error.statusCode || 500, error.message));
    }
});

// Update Company
const updateCompany = asyncHandler(async (req, res) => {
    try {
        const { companyName, description, location, website } = req.body;
        if (!(companyName || description || location || website)) {
            throw new ApiError(400, "Some credentials are missing.");
        }

        const updatedCompany = await Company.findByIdAndUpdate(
            req.params.id,
            {
                $set: {
                    companyName,
                    description,
                    location,
                    website
                }
            },
            {
                new: true
            }
        );

        if (!updatedCompany) {
            throw new ApiError(404, "Company not found.");
        }

        return res
            .status(200)
            .json(new ApiResponse(200, updatedCompany, "Details updated successfully."));
    } catch (error) {
        console.error(error);
        return res.status(error.statusCode || 500).json(new ApiError(error.statusCode || 500, error.message));
    }
});

export { registerCompany, getCompany, getCompanyId, updateCompany };
