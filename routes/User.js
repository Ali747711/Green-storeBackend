import express, { Router } from 'express'
import { isAuth, login, logout, register } from '../controller/userController.js'
import authUser from '../middlewares/authUser.js'

const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.get('/is-auth', authUser, isAuth)
router.get('/logout', authUser, logout)


export default router