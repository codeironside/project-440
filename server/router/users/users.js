const express =require("express")
const {register,home, login, forgottenpassword} = require("../../controller/users/users")
const router= express.Router()

//register link

router.route("/register").post(register)

//home link

router.route("").get(home)

//login route

router.route("/login").post(login)

//forgotten password
router.route("/forgottenpassword").post(forgottenpassword)

module.exports=router