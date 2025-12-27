import express from 'express'
import { isSellerAuth, sellerLogin, sellerLogout } from '../controller/sellerController.js'
import authSeller from '../middlewares/authSeller.js'

const router = express.Router()

router.post('/login', sellerLogin)
router.get('/is-Auth', authSeller, isSellerAuth)
router.get('/logout', authSeller, sellerLogout)



export default router