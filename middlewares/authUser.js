import jwt from 'jsonwebtoken'
import User from '../models/user.js'

const authUser = async(req, res, next) => {
    const {token} = req.cookies
    console.log(token, 'authUser')
    if(!token){
        return res.json({success: false, message: 'Not authorized!'})
    }

    try {
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET)
        
        const user = await User.findById(tokenDecode.id)
        
        if(tokenDecode.id){
            req.user = {id: tokenDecode.id}
        }else{
            return res.json({success: false, message: 'Not authorized!'})
        }
        next()
    } catch (error) {
        res.json({success: false, message: `Error message in authUser middleware: ${error.message}`})
    }
}

export default authUser