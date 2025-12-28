import jwt from "jsonwebtoken";

// Seller login: /api/seller/login
export const sellerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      email === process.env.SELLER_EMAIL &&
      password === process.env.SELLER_PASSWORD
    ) {
      const token = jwt.sign({ email }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      res.cookie("sellerToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Use secure cookies in production
        sameSite: "none", // CSRF protection
        maxAge: 7 * 24 * 60 * 1000, // cookie expiration time
      });
      return res.json({
        success: true,
        message: "Seller logged in Successfully!",
      });
    } else {
      return res.json({
        success: false,
        message: "Login failed! Invalid credentials",
      });
    }
  } catch (error) {
    res.json({
      success: false,
      message: `Error in seller login: ${error.message}`,
    });
  }
};

// Seller isAuth: /api/seller/isAuth

export const isSellerAuth = async (req, res) => {
  try {
    return res.json({ success: true, message: "Seller is Auth!" });
  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: `Error message in isSellerAuth: ${error.message}`,
    });
  }
};

// Seller logout: /api/seller/logout

export const sellerLogout = async (req, res) => {
  try {
    res.clearCookie("sellerToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
    });

    return res.json({
      success: true,
      message: "Seller logged out successfully!",
    });
  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: `Error message in Seller logout: ${error.message}`,
    });
  }
};
