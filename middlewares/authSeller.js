import jwt from 'jsonwebtoken'

const authSeller = async(req, res, next) => {
    // const {sellerToken} = req.cookies
    // ✅ Check BOTH Authorization header AND cookie
    let token = null
    
    // 1. Check Authorization header (for mobile)
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7)
    }
    
    // 2. Check cookie (for desktop)
    if (!token && req.cookies.sellerToken) {
        token = req.cookies.sellerToken
    }


    if(!token){
        return res.json({success: false, message: 'Not authorized!'})
    }

    try {
        const tokenDecode = jwt.verify(sellerToken, process.env.JWT_SECRET)
        if(tokenDecode.email === process.env.SELLER_EMAIL){
            next()
        }else{
            return res.json({success: false, message: 'Not authorized!'})
        }
    } catch (error) {
        return res.json({success: false, message: `Error in authSeller: ${error.message}`})
    }
}

export default authSeller
