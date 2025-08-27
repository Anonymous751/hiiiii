const protect = async (req, res, next) => {
  try {
    let token;

    // 1️⃣ Check header
    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    // 2️⃣ Check cookie as fallback
    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ success: false, message: "❌ No token, authorization denied" });
    }

    // 3️⃣ Verify token
    const decoded = verifyToken(token);

    if (!decoded?.userId) {
      return res.status(401).json({ success: false, message: "❌ Invalid token payload" });
    }

    // 4️⃣ Fetch user
    const user = await userModel.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({ success: false, message: "❌ User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    return res.status(401).json({ success: false, message: "❌ Not authorized, token failed" });
  }
};

export default protect;
