import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import jwt from 'jsonwebtoken';

export const verifyJWT = asyncHandler( async(req, res, next)=> {
    // const tokenFromCookie = req.cookies?.accessToken;
    // const tokenFromHeader = req.header("Authorization")?.replace("Bearer ", "");
    
    // console.log("Token from Cookie:", tokenFromCookie);
    // console.log("Token from Header:", tokenFromHeader);
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        // console.log("token recieved", token);
        
    
        if(!token) {
            throw new ApiError(401, "Unauthorized Request")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!user) {
            throw new ApiError(401, "Invalid Access Token")
        }
    
        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "invalid access token.")
    }
})