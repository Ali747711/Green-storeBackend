import User from "../models/user.js"
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'


// register
export const register = async(req, res) => {
    try {
        const {name, email, password} = req.body
        if(!name || !email || !password){
            return res.json({success: false, message: 'Missing details!'}).status(500)
        }

        const existingUser = await User.findOne({email})
        if(existingUser){
            return res.json({success: false, message: 'User already exists!'})
        }

        const hashedPW = await bcrypt.hash(password, 12)
        const user = await User.create({name, email, password: hashedPW})

        const token = jwt.sign({id: user._id,}, process.env.JWT_SECRET, {expiresIn: '7d'})
        res.cookie('token', token, {
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
            sameSite: process.env.NODE_ENV === 'production' ? 'node' : 'strict', // CSRF protection
            maxAge: 7*24*60*1000 // cookie expiration time 

        })

        return res.json({success: true, user: {email: user.email, name: user.name}})
    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: `Error message in register: ${error.message}`})
    }
}

export const login = async(req, res) => {
    try {
        const {email, password} = req.body

        if(!email || !password){
            return res.json({success: false, message: 'Missing details!'}).status(500)
        }

        const user = await User.findOne({email})

        if(!user){
            return res.json({success: false, message: 'Invalid password or email!'})
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if(!isMatch){
            return res.json({success: false, message: 'Invalid password or email!'})
        }

        const token = jwt.sign({id: user._id,}, process.env.JWT_SECRET, {expiresIn: '7d'})
        res.cookie('token', token, {
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
            sameSite: process.env.NODE_ENV === 'production' ? 'node' : 'strict', // CSRF protection
            maxAge: 7*24*60*1000 // cookie expiration time 

        })

        return res.json({success: true, user: {email: user.email, name: user.name}})
    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: `Error message in login: ${error.message}`})
    }
}

// check auth: /api/user/is-auth
export const isAuth = async(req, res) => {
     try {
        const id = req.user.id
        const user = await User.findById(id).select('-password')
        console.log(user, 'userController')
        return res.json({success: true, user})
     } catch (error) {
        console.log(error.message)
        res.json({success: false, message: `Error message in isAuth: ${error.message}`})
     }
}

// Log out user: /api/user/logout

export const logout = async(req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV ==='production' ? 'node' : 'strict'
        })

        return res.json({success: true, message: 'Logged out successfully!'})
    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: `Error message in logout: ${error.message}`})
    }
}