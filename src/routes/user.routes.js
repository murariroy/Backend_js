import { Router } from "express";
import { loginUSer, logOutUser, refreshAccessToken, registerUser } from "../controllers/user.controllers.js";
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

export default router