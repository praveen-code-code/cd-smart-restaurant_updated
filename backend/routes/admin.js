const r=require('express').Router(),{User,Product,Order}=require('../models'),{auth,admin}=require('../middleware');
r.use(auth,admin);
r.get('/users',async(q,s)=>s.json(await User.find({role:'customer'}).select('-password').sort('-createdAt')));
r.put('/users/:id',async(q,s)=>s.json(await User.findByIdAndUpdate(q.params.id,{status:q.body.status},{new:true}).select('-password')));
r.get('/stats',async(q,s)=>{
 const d0=new Date();d0.setHours(0,0,0,0);const week=new Date(Date.now()-7*864e5),valid={orderStatus:{$ne:'Cancelled'}};
 const [today,customers,products,orders]=await Promise.all([Order.find({...valid,createdAt:{$gte:d0}}),User.countDocuments({role:'customer'}),Product.countDocuments(),Order.find(valid).sort('-createdAt').limit(500)]);
 const tally=fn=>{const m={};orders.forEach(o=>fn(o).forEach(([k,v])=>m[k]=(m[k]||0)+v));return Object.entries(m).map(([name,n])=>({name,n})).sort((a,b)=>b.n-a.n)};
 const bestSellers=tally(o=>o.items.map(i=>[i.name,i.qty])),categories=tally(o=>o.items.map(i=>[i.category,i.qty])),hours=tally(o=>[[new Date(o.createdAt).getHours(),1]]);
 const daily={};orders.filter(o=>o.createdAt>=week).forEach(o=>{const k=o.createdAt.toISOString().slice(0,10);daily[k]=(daily[k]||0)+o.totalAmount});
 const tips=[];
 if(categories[0])tips.push(`🔥 ${categories[0].name} has the highest demand (${categories[0].n} items sold). Create a "${categories[0].name} + Drink" combo offer.`);
 const low=categories[categories.length-1];if(categories.length>1)tips.push(`📊 ${low.name} orders are lowest (${low.n}). Run a 15% weekend ${low.name} promotion.`);
 const pairs={};orders.forEach(o=>{const n=[...new Set(o.items.map(i=>i.name))].sort();for(let i=0;i<n.length;i++)for(let j=i+1;j<n.length;j++){const k=n[i]+' + '+n[j];pairs[k]=(pairs[k]||0)+1}});
 const tp=Object.entries(pairs).sort((a,b)=>b[1]-a[1])[0];if(tp)tips.push(`⭐ Customers often order ${tp[0]} together (${tp[1]} times). Bundle them as a combo.`);
 if(hours[0])tips.push(`⏰ Peak ordering hour is ${hours[0].name}:00. Schedule offers and staff for this window.`);
 if(!tips.length)tips.push('Not enough order data yet. Suggestions appear once customers place orders.');
 s.json({todayOrders:today.length,todaySales:Math.round(today.reduce((a,o)=>a+o.totalAmount,0)),customers,products,bestSellers:bestSellers.slice(0,5),leastOrdered:bestSellers.slice(-3).reverse(),categories,peakHour:hours[0]?.name,dailySales:daily,suggestions:tips})});
r.get('/marketing',async(q,s)=>{
 const orders=await Order.find({orderStatus:{$ne:'Cancelled'}}).populate('userId','name').sort('-createdAt').limit(1000);
 const sum=a=>a.reduce((x,y)=>x+y,0),age=o=>(Date.now()-o.createdAt)/864e5,tot=o=>o.totalAmount;
 const weeklySales=[3,2,1,0].map(w=>({label:w?w+'w ago':'This week',v:Math.round(sum(orders.filter(o=>age(o)>=w*7&&age(o)<(w+1)*7).map(tot)))}));
 const week=weeklySales[3].v,prev=weeklySales[2].v,growth=prev?Math.round((week-prev)/prev*100):0;
 const monthly=Math.round(sum(orders.filter(o=>age(o)<30).map(tot)));
 const catRev={};orders.forEach(o=>o.items.forEach(i=>catRev[i.category]=Math.round((catRev[i.category]||0)+i.price*i.qty)));
 const hours=Array(24).fill(0);orders.forEach(o=>hours[new Date(o.createdAt).getHours()]++);
 const sp={};orders.forEach(o=>{const n=o.userId?.name||'Guest';sp[n]=sp[n]||{name:n,orders:0,spent:0};sp[n].orders++;sp[n].spent+=tot(o)});
 const cust=Object.values(sp).sort((a,b)=>b.spent-a.spent),repeatRate=cust.length?Math.round(cust.filter(c=>c.orders>1).length/cust.length*100):0;
 const cats=Object.entries(catRev).sort((a,b)=>b[1]-a[1]),plans=[];
 if(cats[0])plans.push({title:`Bundle your top category: ${cats[0][0]}`,why:`${cats[0][0]} earns the most revenue (₹${cats[0][1].toLocaleString('en-IN')}).`,action:`Offer a ${cats[0][0]} + Drink combo at 10% off for 7 days.`,offer:{name:cats[0][0]+' Combo',code:'COMBO10',discountPercent:10,category:cats[0][0]}});
 if(cats.length>1){const c=cats[cats.length-1];plans.push({title:`Lift a slow category: ${c[0]}`,why:`${c[0]} brings in the least revenue (₹${c[1].toLocaleString('en-IN')}).`,action:`Run a 15% weekend promotion on ${c[0]} and feature it on the home page.`,offer:{name:c[0]+' Weekend',code:'WEEKEND15',discountPercent:15,category:c[0]}})}
 if(prev)plans.push(growth<0?{title:'Win back customers',why:`Sales are down ${-growth}% versus last week.`,action:'Send a 10% comeback coupon to customers who ordered before but not this week.',offer:{name:'We Miss You',code:'COMEBACK10',discountPercent:10}}:{title:'Keep the momentum',why:`Sales are up ${growth}% versus last week.`,action:'Launch a small loyalty reward to turn this growth into repeat orders.',offer:{name:'Loyalty Reward',code:'LOYAL5',discountPercent:5}});
 if(cust.length&&repeatRate<50)plans.push({title:'Turn one-time buyers into regulars',why:`Only ${repeatRate}% of customers ordered more than once.`,action:'Offer 10% off the second order within 7 days.',offer:{name:'Second Order Bonus',code:'AGAIN10',discountPercent:10}});
 const slow=hours.map((n,h)=>[h,n]).filter(x=>x[0]>=11&&x[0]<=22).sort((a,b)=>a[1]-b[1])[0];
 if(orders.length&&slow)plans.push({title:`Fill the quiet hour at ${slow[0]}:00`,why:`Only ${slow[1]} orders arrive at ${slow[0]}:00, your slowest lunch-to-dinner hour.`,action:`Run a happy-hour deal from ${slow[0]}:00 to ${slow[0]+1}:00.`,offer:{name:'Happy Hour',code:'HAPPY10',discountPercent:10}});
 s.json({weeklySales,week,prev,growth,monthly,aov:orders.length?Math.round(sum(orders.map(tot))/orders.length):0,repeatRate,hours,categoryRevenue:catRev,topCustomers:cust.slice(0,5),plans})});
module.exports=r;
