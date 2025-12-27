import express from 'express'
import { updateCart } from '../controller/cartController.js'
import authUser from '../middlewares/authUser.js'

const cartRouter = express.Router()

cartRouter.post('/update', updateCart)

export default cartRouter