import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {asyncHandler} from "../utils/asyncHandler";
import {ApiError} from "../utils/ApiError"
import {User} from "../models/user.model.js"
import { ApiResponse } from "../utils/ApiResponse.js";


const gererateAccessAndRefreshToken= async (userId) =>{
   try{
       const user= await User.findById(userId)
       const accessToken=  user.generateAccessToken()
       const refreshToken = user.generateRefreshToken()

       user.refreshToken= refreshToken
       user.save({validateBeforeSave:false})

       return(refreshToken,accessToken)

   }catch(error){
      throw new ApiError(500,"something went wrong while generating refresh ans access token")
   }
}



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
    new ApiResponuserse(200,createdUser,"  registered secussfully")
   )
      
})

const loginUSer = asyncHandler (async (req,res) =>{
    // req body => data
    // usrname por email
    //find the user
    //password check
    //access and refresh token
    // send cookie

    const {email,password,username} = req.body
    if(!username || !email){
      throw new ApiError(400,"username or  is requemailired")

    }
    const user = await User.findOne({
      $or: [{username},{email}]
    })

    if(!user){
      throw new ApiError(404,"user does not exists")
    }
     const isPasswordValid= await user.isPasswordCorrect(password)
      
     if(!isPasswordValid){
       throw new ApiError(401,"Invalid user credentials")
     }

     const {accessToken,refreshToken}= await gererateAccessAndRefreshToken(user._id)
      
    const loggedInUSer= await User.findById(user._id).select("-password -refreshtoken")

    const options={
      httpOnly:true,
      secure:true
    } 

     return res
     .status(200)
     .cookie("accessToken", accessToken,   options)
      .cookie("refreshToken",refreshToken,options)
      .json(
         new ApiError(
            200,
            {
               user: loggedInUSer,accessToken,
               refreshToken
            },
            "userlogged in successfully",
            
         )
      )
          
        



})

const logOutUser = asyncHandler(async (req,res) =>{
    await User.findByIdAndUpdate(
      req.user._id,
      {
         $set:{
            refreshToken:undefined
         }
      },
      {
            new:true
      }
     )

     const options = {
      httpOnly:true,
      secure:true
     }
     return res
     .status(200)
     .clearCookie("accessToken",options)
     .clearCookie("refreshToken",options)
})

const refreshAccessToken = asyncHandler( async (req,res) =>{
    try {
       const incomingRefreshToken = req.cookie.
       refreshToken || req.body.refreshToken
  
       if(incomingRefreshToken){
          throw new ApiError(401,"Unauthorized token")
       }
       const dedcodedToken= jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
       )
       const user= await User.findById(dedcodedToken?._id)
  
       if(!user){
        throw new ApiError(401,"Invalid refresh Token")
  
       }
       if (incomingRefreshToken !== user?.refreshToken){
        throw new ApiError(401,"Refresh token is expired or user")
  
       }
       const options = {
        httpOnly:true,
        secure:true
       }
       const {accessToken,refreshToken} = await gererateAccessAndRefreshToken(user?._id)
  
       returnres
       .status(200)
       .cookie("accessToken",accessToken,options)
       .cookie("refreshToken",refreshToken,options)
        .json(
           new ApiResponse(
              200,
              {accessToken,refreshToken:refreshToken},
              "Access token refreshed"
           )
        )
    } catch (error) {
      throw new ApiError(401,error?.message || "invalid Access Token")
      
    }
  
   })  


   const changeCurrentPassword =asyncHandler(async(req,res) =>{
      const {oldPassword,setPassword} = req.body

      const user = await User.findById(req.user?.id)
       const isPasswordCorrect= user.isPasswordCorrect(oldPassword)
   
           if(!isPasswordCorrect){
            throw new ApiError(400,"Invalid old password")

           }

           user.password = newPassword
           await user.save({validateBeforeSave:false})

           return res
           .status(200)
           .json(new ApiError(200,{} ,"Password change successfully"))

   
      })

      const getCurrentUser = asyncHandler(async(req,res)=>{
         return res
         .status(200)
         .json(200,req.user,"current user fectch successfully")

      }) 


     const updateAccountDetails = asyncHandler(async(req,res) =>{
      const {fullName,email} = req.body

      if(!fullName || !email){
         throw new ApiError(400,"All feilds are required")

      }

     const user = User.findByIdAndUpdate(
         req.user?.id,
         {
            $set:{
               fullName,
               email
            }
         },
         {new:true}

      ).select("-password")

      returnres.status(200).json(new ApiResponse(200,user,"Accoutn details updated seccusfully"))

     

     }) 



const updateUSerAvatar = asyncHandler(async(req,res) =>{
   const avatarLocalPAth = req.file?.path

   if(!avatarLocalPAth){
      throw new ApiError(400,"Avatar file is missing")

   }

   const avatar = await uploadOnCloudinary(avatarLocalPAth)

   if(!avatar.url){
      throw new ApiError(400,"Error while uploading on avatar")

   }
   const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
         $set:{
            avatar:avatar.url
         }
      },
      {new:true}
   ).select("-password")
})

const updateusercoverImage = asyncHandler(async(req,res) =>{
   const coverLocalPAth = req.file?.path

   if(!coverLocalPath){
      throw new ApiError(400,"cover file is missing")

   }

   const coverImage = await uploadOnCloudinary(coverLocalPath)

   if(!avatar.url){
      throw new ApiError(400,"Error while uploading on cover")

   }
   const user=  await User.findByIdAndUpdate(
      req.user?._id,
      {
         $set:{
            coverImage:coverImage.url
         }
      },
      {new:true}
   ).select("-password")

   return res
   .status(200)
   .json(
      new ApiResponse(200,"cover image successfully")
   )
})





export {
   registerUser,
   loginUSer,
   logOutUser,
   refreshAccessToken,
   changeCurrentPassword,
   getCurrentUser,
   updateAccountDetails,
   updateUSerAvatar,
   updateusercoverImage,

}
