require('dotenv').config();const m=require('mongoose'),bcrypt=require('bcryptjs'),{User,Product,Offer}=require('./models');
(async()=>{await m.connect(process.env.MONGO_URI||'mongodb://127.0.0.1:27017/smart-restaurant');
 await Promise.all([User.deleteMany({}),Product.deleteMany({}),Offer.deleteMany({})]);
 await User.create({name:'Admin',email:'admin@restaurant.com',password:await bcrypt.hash('admin123',10),role:'admin'});
 const P=(name,category,price,foodType,discount=0,rating=4.3)=>({name,category,price,foodType,discount,rating,description:name+', freshly prepared to order.'});
 const prods=await Product.insertMany([P('Chicken Burger','Burgers',180,'Non-Veg',0,4.6),P('Veg Burger','Burgers',140,'Veg'),P('French Fries','Starters',120,'Veg'),P('Chicken 65','Starters',220,'Non-Veg',10),
  P('Margherita Pizza','Pizza',250,'Veg',0,4.5),P('Pepperoni Pizza','Pizza',320,'Non-Veg'),P('Chicken Biryani','Main Course',260,'Non-Veg',0,4.8),P('Paneer Butter Masala','Main Course',230,'Veg'),
  P('Caesar Salad','Salads',170,'Veg'),P('Chocolate Cake','Desserts',150,'Veg',0,4.7),P('Cold Coffee','Beverages',110,'Veg'),P('Coke','Beverages',50,'Veg')]);
 await Offer.create({name:'Weekend Special',description:'20% off your order',discountPercent:20,code:'WEEKEND20',startDate:new Date(),endDate:new Date(Date.now()+90*864e5)});
 const{Order}=require('./models');await Order.deleteMany({});
 const cs=await User.insertMany(['Ravi','Anjali','Kiran','Sneha','Arjun','Meena'].map((n,i)=>({name:n,email:n.toLowerCase()+'@demo.com',phone:'90000000'+i,password:'x'})));
 const w=[5,1,3,1,2,1,5,1,1,2,2,3],pick=()=>{let r=Math.random()*w.reduce((a,b)=>a+b);for(let i=0;i<prods.length;i++){r-=w[i];if(r<=0)return prods[i]}return prods[0]};
 const orders=[];for(let k=0;k<150;k++){const t=new Date(Date.now()-Math.random()*30*864e5);t.setHours([12,13,13,19,20,20,21,15][k%8]);
  const items=Array.from({length:1+k%3},()=>{const p=pick();return{product:p._id,name:p.name,category:p.category,price:p.price,qty:1+k%2}});
  const sub=items.reduce((a,i)=>a+i.price*i.qty,0),tax=+(sub*.05).toFixed(2);
  orders.push({userId:cs[k%6]._id,items,subtotal:sub,deliveryFee:40,tax,totalAmount:sub+40+tax,address:{line:'Demo'},orderStatus:'Delivered',createdAt:t})}
 await Order.insertMany(orders);
 console.log('Seeded 150 demo orders.');console.log('Seeded. Admin login: admin@restaurant.com / admin123');process.exit()})();
