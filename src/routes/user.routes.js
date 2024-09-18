import { Router } from "express";
import { registerUser } from "../controllers/user.controllers.js";
import{uplod} from "../middlewares/multer.middlewares.js"

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


export default router