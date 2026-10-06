const r=require('express').Router(),multer=require('multer'),path=require('path'),{Product}=require('../models'),{auth,admin}=require('../middleware');
const up=multer({storage:multer.diskStorage({destination:path.join(__dirname,'../uploads'),filename:(q,f,cb)=>cb(null,Date.now()+path.extname(f.originalname))}),
 fileFilter:(q,f,cb)=>cb(null,/image\//.test(f.mimetype)),limits:{fileSize:5e6}});
const body=q=>{const b={...q.body};if(q.file)b.image='/uploads/'+q.file.filename;return b};
r.get('/',async(q,s)=>{const{search,category,foodType,sort,all}=q.query,f={};
 if(!all)f.isAvailable=true;if(search)f.name=new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'i');
 if(category)f.category=category;if(foodType)f.foodType=foodType;
 const so={price_asc:{price:1},price_desc:{price:-1},popular:{rating:-1}}[sort]||{createdAt:-1};
 s.json(await Product.find(f).sort(so))});
r.get('/:id',async(q,s)=>{try{const p=await Product.findById(q.params.id);p?s.json(p):s.status(404).json({message:'Dish not found'})}catch{s.status(404).json({message:'Dish not found'})}});
r.post('/',auth,admin,up.single('image'),async(q,s)=>s.json(await Product.create(body(q))));
r.put('/:id',auth,admin,up.single('image'),async(q,s)=>s.json(await Product.findByIdAndUpdate(q.params.id,body(q),{new:true})));
r.delete('/:id',auth,admin,async(q,s)=>{await Product.findByIdAndDelete(q.params.id);s.json({ok:true})});
module.exports=r;
