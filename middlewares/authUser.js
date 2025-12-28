import jwt from 'jsonwebtoken'
import User from '../models/user.js'

const authUser = async(req, res, next) => {
    // 🔍 DEBUG: Log everything
    console.log('=== AUTH USER DEBUG ===')
    console.log('All cookies:', req.cookies)
    console.log('Token cookie:', req.cookies.token)
    console.log('Headers:', req.headers.cookie)
    console.log('=====================')
    
    const {token} = req.cookies
    
    if(!token){
        return res.json({success: false, message: 'Not authorized! No token found'})
    }

    try {
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET)
        console.log('✅ Token decoded:', tokenDecode)
        
        if(tokenDecode.id){
            req.user = {id: tokenDecode.id}
            console.log('✅ User authenticated:', req.user)
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




