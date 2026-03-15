import jwt from "jsonwebtoken";

export const authMiddleware = (req,res,next)=>{ //authentication 
    //its job hon is to verify the JWT token is valid  
  try{
    const authHeader = req.headers.authorization;

    if(!authHeader){
      return res.status(401).json({message:"No token"});
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token,process.env.JWT_SECRET);

    req.user = decoded;

    next();

  }
  catch(error){
    return res.status(401).json({message:"Invalid token"});
  }

};//requirement here : is user loged in?

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