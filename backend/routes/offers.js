const r=require('express').Router(),{Offer}=require('../models'),{auth,admin}=require('../middleware');
r.get('/',async(q,s)=>{const n=new Date();s.json(await Offer.find({active:true,startDate:{$lte:n},endDate:{$gte:n}}))});
r.post('/',auth,admin,async(q,s)=>s.json(await Offer.create(q.body)));
r.put('/:id',auth,admin,async(q,s)=>s.json(await Offer.findByIdAndUpdate(q.params.id,q.body,{new:true})));
r.delete('/:id',auth,admin,async(q,s)=>{await Offer.findByIdAndDelete(q.params.id);s.json({ok:true})});
module.exports=r;
