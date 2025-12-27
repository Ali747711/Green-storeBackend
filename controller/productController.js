import {v2 as cloudinary} from 'cloudinary'
import Product from '../models/product.js'

// Add Product: /api/product/add
export const addProduct = async(req, res) => {
    try {
        // Validate request
        if (!req.body.productData) {
            return res.status(400).json({ success: false, message: "Missing product data" });
        }
        let productData = JSON.parse(req.body.productData)

        // Validate images
        const images = req.files || [];
        if (images.length === 0) {
            return res.status(400).json({ success: false, message: "At least one image is required" });
        }

        let imagesUrl = await Promise.all(
            images.map( async(item) => {
                let result = await cloudinary.uploader.upload(item.path, {resource_type: 'image'})
                return result.secure_url
            })
        )

        const product = await Product.create({...productData, image: imagesUrl})
        res.json({success: true, message: `Product added successfully!`})
    } catch (error) {
        res.json({success: false, message: `Error in add product: ${error.message}`})
        console.log(error.message)
    }
}


// Get products: /api/product/list
export const productList = async(req, res) => {
    try {
        const products = await Product.find({})
        if(products){
            return res.json({success: true, products})
        }else{
            res.json({success: false, message: 'No product available!'})
        }
    } catch (error) {
        res.json({success: false, message: `Error in product list: ${error.message}`})
        console.log(`Error in product list API: ${error.message}`)
    }
}


// Get single Product: /api/product/id
export const productById = async(req, res) => {
    try {
        const {id} = req.body
        if(id){
            const product = await Product.findById(id)
            res.json({success: true, product})
        }else{
            res.json({success: false, message: `ID is not available`})
        }
        
    } catch (error) {
        res.json({success: false, message: `Error in single product API: ${error.message}`})
        console.log(`Error in single product API: ${error.message}`)
    }
}

// Change product inStock: /api/product/stock
export const changeStock = async(req, res) => {
    try {
        const {id, inStock} = req.body
        await Product.findByIdAndUpdate(id, {inStock})
        res.json({success: true, message: 'Stock updated !'})
    } catch (error) {
        res.json({success: false, message: `Error in Stock API: ${error.message}`})
        console.log(`Error in Stock API: ${error.message}`)
    }
}