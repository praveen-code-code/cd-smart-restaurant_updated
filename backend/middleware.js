const jwt=require('jsonwebtoken'),{User}=require('./models');
exports.auth=async(req,res,next)=>{try{const t=(req.headers.authorization||'').split(' ')[1];
 const {id}=jwt.verify(t,process.env.JWT_SECRET||'dev_secret');req.user=await User.findById(id);
 if(!req.user||req.user.status!=='active')throw 0;next()}catch{res.status(401).json({message:'Please log in'})}};
exports.admin=(req,res,next)=>req.user.role==='admin'?next():res.status(403).json({message:'Admins only'});
