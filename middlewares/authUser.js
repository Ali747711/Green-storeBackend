import jwt from 'jsonwebtoken'
import User from '../models/user.js'

const authUser = async(req, res, next) => {
    // 🔍 DEBUG: Log everything
    // console.log('=== AUTH USER DEBUG ===')
    // console.log('All cookies:', req.cookies)
    // console.log('Token cookie:', req.cookies.token)
    // console.log('Headers:', req.headers.cookie)
    // console.log('=====================')
    
    // const {token} = req.cookies
    // ✅ Check BOTH Authorization header AND cookie
    let token = null
    
    // 1. Check Authorization header (for mobile)
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7)
        // console.log('✅ Token from Authorization header: ', token)
    }
    
    // 2. Check cookie (for desktop)
    if (!token && req.cookies.token) {
        token = req.cookies.token
        // console.log('✅ Token from cookie')
    }
    
    
    if(!token){
        return res.json({success: false, message: 'Not authorized! No token found'})
    }

    try {
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET)
        // console.log('✅ Token decoded:', tokenDecode)
        
        if(tokenDecode.id){
            req.user = {id: tokenDecode.id}
            // console.log('✅ User authenticated:', req.user)
            next()
        }else{
            console.log('❌ No user ID in token')
            return res.json({success: false, message: 'Not authorized! Invalid token'})
        }
    } catch (error) {
        console.log('❌ Token verification failed:', error.message)
        res.json({success: false, message: `Error: ${error.message}`})
    }
}

export default authUser




