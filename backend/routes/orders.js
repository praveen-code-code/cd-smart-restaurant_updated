const r=require('express').Router(),{Order,Product,Offer}=require('../models'),{auth,admin}=require('../middleware'),{emit}=require('../events');
r.post('/',auth,async(q,s)=>{const{items=[],address,paymentMethod,coupon}=q.body;
 if(!items.length||!address?.line)return s.status(400).json({message:'Cart and delivery address are required'});
 const ps=await Product.find({_id:{$in:items.map(i=>i.id)},isAvailable:true});
 const lines=items.map(i=>{const p=ps.find(x=>String(x._id)===i.id);if(!p)return null;
  return{product:p._id,name:p.name,category:p.category,price:+(p.price*(1-p.discount/100)).toFixed(2),qty:Math.max(1,+i.qty||1)}}).filter(Boolean);
 if(!lines.length)return s.status(400).json({message:'Items are unavailable'});
 let subtotal=lines.reduce((a,l)=>a+l.price*l.qty,0);
 if(coupon){const n=new Date(),o=await Offer.findOne({code:coupon.toUpperCase(),active:true,startDate:{$lte:n},endDate:{$gte:n}});if(o)subtotal*=1-o.discountPercent/100}
 subtotal=+subtotal.toFixed(2);const deliveryFee=40,tax=+(subtotal*.05).toFixed(2);
 const o=await Order.create({userId:q.user._id,items:lines,subtotal,deliveryFee,tax,totalAmount:+(subtotal+deliveryFee+tax).toFixed(2),address,paymentMethod:paymentMethod||'COD'});emit('new_order',{id:o._id,total:o.totalAmount,customer:q.user.name});s.json(o)});
r.get('/my-orders',auth,async(q,s)=>s.json(await Order.find({userId:q.user._id}).sort('-createdAt')));
r.get('/',auth,admin,async(q,s)=>s.json(await Order.find().populate('userId','name email').sort('-createdAt').limit(200)));
r.get('/:id',auth,async(q,s)=>{const o=await Order.findById(q.params.id);
 if(!o||(String(o.userId)!==String(q.user._id)&&q.user.role!=='admin'))return s.status(404).json({message:'Order not found'});s.json(o)});
r.put('/:id/status',auth,admin,async(q,s)=>{const o=await Order.findByIdAndUpdate(q.params.id,{orderStatus:q.body.status},{new:true,runValidators:true});emit('status',{id:o._id,status:o.orderStatus},o.userId);s.json(o)});
module.exports=r;
