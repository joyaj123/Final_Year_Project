
export const adminOnly = (req,res,next) =>{
  if(req.user.role !== "ADMIN"){
    return res.status(403).json({message : "Access denied "})
  }
  next() ; 
}

export const b_ownerOnly = (req,res,next) =>{
  if(req.user.role !== "BUSINESS_OWNER"){
    return res.status(403).json({message : "Acess denied"}) ; 
  }
  next() ; 
}

export const investorOnly = (req,res,next) =>{
  if(req.user.role !== "INVESTOR"){
    return res.status(403).json({message : "Acess denied"}) ; 
  }
  next() ; 
}
