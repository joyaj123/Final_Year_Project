import jwt from "jsonwebtoken";
//run before the route 
import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  try {
    const token = req.cookies.token;  //to check the cookies where the token is 

    if (!token) {
      return res.status(401).json({ message: "No token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();

  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

//requirement here : is user loged in?



//WE WILL USE AUTHORIZATION MIDDLEWAR TOO
//y3ne to check the role eza admin, investor,company , men hata had kel route 
//requirement here : is the user admin/invesotr/compnay? 

/**User request
      ↓
Check token (using authentication middleware)
      ↓
Check role (using authorization middleware)
      ↓
Controller runs*/