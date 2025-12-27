import User from "../models/user.js";

// Update user cart data: /api/cart/update

export const updateCart = async (req, res) => {
  try {
    const { userId, cartItems } = req.body;
    console.log("Incoming cartItems: ", cartItems);
    console.log("Incoming userId: ", userId);
    const updatedUser = await User.findByIdAndUpdate(userId, { cartItems });
    console.log("Updated user: ", updatedUser);
    res.json({
      success: true,
      message: `User with username: ${updatedUser.name} Updated!`,
    });
  } catch (error) {
    res.json({
      success: false,
      message: `Error in cartItems update API: ${error.message}`,
    });
    console.log(`Error in cartItems update API: ${error.message}`);
  }
};
