const jwt=require('jsonwebtoken'),{User}=require('./models');const clients=new Set();
exports.emit=(type,data,userId)=>clients.forEach(c=>{if(c.admin||(userId&&String(c.id)===String(userId)))c.res.write(`data:${JSON.stringify({type,...data})}\n\n`)});
exports.handler=async(q,res)=>{try{const{id}=jwt.verify(q.query.token,process.env.JWT_SECRET||'dev_secret'),u=await User.findById(id);if(!u)throw 0;
 res.set({'Content-Type':'text/event-stream','Cache-Control':'no-cache',Connection:'keep-alive'});res.flushHeaders();res.write(': ok\n\n');
 const c={res,id:u._id,admin:u.role==='admin'};clients.add(c);const hb=setInterval(()=>res.write(': hb\n\n'),25000);q.on('close',()=>{clearInterval(hb);clients.delete(c)})}catch{res.sendStatus(401)}};
