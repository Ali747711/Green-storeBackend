import Address from "../models/address.js"


// Add Address: /api/address/add


export const addAddress = async(req, res) => {
    try {
        const {address, userId} = req.body
        await Address.create({...address, userId})

        res.json({success: true, message: 'Address added successfully'})
    } catch (error) {
        res.json({success: false, message: `Error in add address API: ${error.message}`})
        console.log(`Error in add address API: ${error.message}`)
    }
}

// Get addresses: /api/address/get

export const getAddress = async(req, res) => {
    try {
        const {userId} = req.body
        // console.log(userId)
        const addresses = await Address.find({userId})

        res.json({success: true, addresses})
    } catch (error) {
        res.json({success: false, message: `Error in get addresses API: ${error.message}`})
        console.log(`Error in get addresses API: ${error.message}`)
    }
}
