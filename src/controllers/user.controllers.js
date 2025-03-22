import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import fs from "fs";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while registering Access and RefreshToken"
    );
  }
};

// Register User
const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, phoneNumber, password, role } = req.body;
  // console.log(req.file);

  // Check if any fields are missing or empty
  if (
    [fullName, email, phoneNumber, password, role].some(
      (field) => !field || field.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ApiError(400, "Invalid email format");
  }

  // Check if user already exists by email or phone number
  const existedUser = await User.findOne({
    $or: [{ email }, { phoneNumber }],
  });

  if (existedUser) {
    throw new ApiError(
      409,
      "User with this email or phone number already exists."
    );
  }

  let profilePhotoLocalPath;
  if (req.file) {
    profilePhotoLocalPath = req.file.path;
    // console.log("Profile photo file path:", profilePhotoLocalPath);
  }

  let profilePhoto = null;
  if (profilePhotoLocalPath) {
    profilePhoto = await uploadOnCloudinary(profilePhotoLocalPath);
    // console.log("Cloudinary URL:", profilePhoto?.url);
  }

  // Create new user
  const user = await User.create({
    fullName,
    email,
    phoneNumber,
    role,
    password,
    profile: {
      profilePhoto: profilePhoto?.url || "",
    },
  });

  // Exclude password and refreshToken from the response
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  // console.log("created user", createdUser);

  // Send response
  res
    .status(201)
    .json({ success: true, message: "User registered successfully." });
  // return res
  //   .status(201)
  //   .json(new ApiResponse(201, createdUser, "User registered successfully."));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid Refresh Token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh Token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access Token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh Token");
  }
});

// console.log(registerUser);

// Login User
const loginUser = asyncHandler(async (req, res) => {
  try {
    // console.log("request body", req.body);

    const { email, password, role } = req.body;

    if (!email) {
      throw new ApiError(400, "Email is required.");
    }

    const user = await User.findOne({ email });

    if (!user) {
      throw new ApiError(404, "User does not exist.");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid User Credentials.");
    }

    if (role !== user.role) {
      throw new ApiError(400, "Invalid Role Credentials.");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id
    );

    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );
    // console.log("Logged In User:", loggedInUser);

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({
        success: true,
        user: loggedInUser,
        accessToken,
        refreshToken,
        message: `User logged in successfully, welcome ${user.fullName}`,
      });
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode || 500, error.message));
  }
});

const getAllUsers = asyncHandler(async (req, res) => {
  console.log("📢 API CALL: GET /api/v1/users");  // ✅ Log API Call

  const users = await User.find();

  if (!users || users.length === 0) {
      console.log("❌ No users found in database!");
      throw new ApiError(404, "No users found.");
  }

  console.log("✅ Users fetched successfully");
  res.status(200).json(new ApiResponse(200, users, "Users fetched successfully"));
});

export { getAllUsers };

// Logout User
// const logoutUser = asyncHandler(async (req, res) => {
//   try {
//     await User.findByIdAndUpdate(
//       req.user?._id,
//       {
//         $set: {
//           refreshToken: undefined,
//         },
//       },
//       {
//         new: true,
//       }
//     );

//     const options = {
//       httpOnly: true,
//       secure: true,
//       sameSite: "None", 
//       path: "/",
//     };

//     return res
//       .status(200)
//       .clearCookie("accessToken", options)
//       .clearCookie("refreshToken", options)
//       .json(new ApiResponse(200, {}, "User logged out"));
//   } catch (error) {
//     return res
//       .status(error.statusCode || 500)
//       .json(new ApiError(error.statusCode || 500, error.message));
//   }
// });

const logoutUser = async (req, res) => {
  try {
      return res.status(200).cookie("token", "", { maxAge: 0 }).json({
          message: "Logged out successfully.",
          success: true
      })
  } catch (error) {
      console.log(error);
  }
}

// Update User
const updateUser = asyncHandler(async (req, res) => {
  try {
    // console.log("Logged-in user:", req.user); 
    const userId = req.user?._id; 

    const { fullName, email, phoneNumber, bio, skills } = req.body;

    if (!(fullName || email || phoneNumber || bio || skills)) {
      throw new ApiError(400, "No fields to update.");
    }

    const updateData = {};

    // Update non-nested fields
    if (fullName) updateData.fullName = fullName;
    if (email) updateData.email = email;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;

    // Update nested fields inside `profile`
    if (bio) updateData["profile.bio"] = bio;
    if (skills) updateData["profile.skills"] = skills.split(",").map(skill => skill.trim());

    if (req.file) {
      const resumeFile = await uploadOnCloudinary(req.file.path);
      if (!resumeFile.url) {
        throw new ApiError(400, "Error while uploading file");
      }
      updateData["profile.resume"] = resumeFile.url;
      updateData["profile.resumeName"] = req.file.originalname;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData }, // Use dot notation for nested fields
      { new: true, runValidators: true }
    ).select("-password"); // Exclude password from response

    return res
      .status(200)
      .json(
        new ApiResponse(200, updatedUser, "Account details updated successfully.")
      );
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode || 500, error.message));
  }
});


export { registerUser, loginUser, logoutUser, updateUser, refreshAccessToken, getAllUsers };
