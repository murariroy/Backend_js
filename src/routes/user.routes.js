import { Router } from "express";
import { changeCurrentPassword, getCurrentUser, getWatchHistory, loginUSer, logOutUser, refreshAccessToken, registerUser, updateAccountDetails, updateUSerAvatar, updateusercoverImage } from "../controllers/user.controllers.js";
import{uplod} from "../middlewares/multer.middlewares.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router= Router()
router.route("/register").post(
    uplod.fields([
       {
        name:"avatar",
        maxCount:1
       } ,
       {
         name:"coverImage",
         maxCount:1
       }
    ]),
    registerUser
)

router.route("/login").post(loginUSer)

//secured routes
router.route("/logout").post(verifyJWT, logOutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT,changeCurrentPassword)

router.route("/curretn-user").get(verifyJWT,getCurrentUser)
router.route("/update-account").patch(verifyJWT,updateAccountDetails)
router.route("/avatar").patch(verifyJWT,uplod.single("avatar"),updateUSerAvatar)
router.route("/cover-image").patch(verifyJWT,uplod.single("/coverImage"),updateusercoverImage)
router.route("/c/:username").get(verifyJWT,getUserChhanelProfile)
router.route("/history").get(verifyJWT,getWatchHistory)




export default router