import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import  jwt from "jsonwebtoken"
import { User } from "../models/user.model";

export const verifyJWT = asyncHandler(async(req,res,next) =>{
  try {
    const token=  req.cookie?.accessToken || req.header("Authorization")?.replace("Bearer","")
  
      if(!token){
          throw new ApiError(401,"Unauthorization")
      }
       const dedcodedToken= jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
  
         const user= await User.findById(dedcodedToken?._id).select("-password _refreshToken")
        
         if(!user){
          throw new ApiError(401,"Invalid Access Token")
         }
         req.user = user;
         next()
         
  
  
  } catch (error) {
       throw new ApiError(401,"Invalid accessToken")
  }



    })   