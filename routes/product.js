import express from 'express'
import { upload } from '../config/multer.js'
import authSeller from '../middlewares/authSeller.js'
import { addProduct, changeStock, productById, productList } from '../controller/productController.js'

const router = express.Router()

router.post('/add', upload.array(["images"]), authSeller, addProduct)
router.get('/list', productList)
router.get('/:id', productById)
router.post('/stock', authSeller, changeStock)


export default router
