import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {asyncHandler} from "../utils/asyncHandler";
import {ApiError} from "../utils/ApiError"
import {User} from "../models/user.model.js"
import { ApiResponse } from "../utils/ApiResponse.js";


const registerUser = asyncHandler(async(req,res) =>{
     // get user details from frontend
     //validation - not empty
     //check if user already exists :username,email
     //check for image,check for avtar
     //upload them to cloudinary ,avatar
     // create user object-create entry in db
     //remove password and refresh token filed from response
     //check for user creation
     //return response
      



    const {fullName,email,username,password}= req.body
    // console.log(fullName);

     if(
        [fullName,email,username,password].some((feild) => 
         feild?.trim() === ''
        )

        
     ){

        throw new ApiError(400,"All feilds are required")
     }
    const existedUser= User.findOne({
        $or:[{username},{email}]
     })
     if(existedUser){
        throw new ApiError(409,"User with email or username already exists")

     }
    const avatarLocalPAth= req.files?.avatar[0].path;
     const coverImageLocalPath= req.files.coverImage[0]?.path;

    if(!avatarLocalPAth){
        throw new ApiError(400,"Avatar file is required")

    }
    const avatar = await uploadOnCloudinary(avatarLocalPAth)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    
    if(!avatar){
        throw new ApiError(400,"Avatar file is required")
        
    }
    User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase()
    })

   const createdUser= await User.findById(user._id).select(
    "-password - refreshToken"
   )

   if(!createdUser){
    throw new ApiError(500,"Something went wrong while registering the user")

   }
   return res.status(201).json(
    new ApiResponse(200,createdUser,"Usrregistered secussfully")
   )
      
})

export {registerUser}
