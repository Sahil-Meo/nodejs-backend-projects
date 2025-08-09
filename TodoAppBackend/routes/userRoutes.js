import express from 'express'
import { getUsers, createUser, fetchSingleUser } from '../controllers/userControllers.js'
import verifyToken from '../middelware/fetchUser.middleware.js'

const router = express.Router()

router.get("/", getUsers)
router.post("/createUser", createUser)
router.get("/fetchSingleUser", verifyToken, fetchSingleUser)


export default router;