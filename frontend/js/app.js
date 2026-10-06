const $=s=>document.querySelector(s),money=n=>'₹'+(+n).toLocaleString('en-IN',{maximumFractionDigits:2});
const ICON={Pizza:'🍕',Burgers:'🍔',Starters:'🍗','Main Course':'🍝',Salads:'🥗',Desserts:'🍰',Beverages:'🥤','Special Items':'⭐'};
const CATS=Object.keys(ICON);
async function api(p,o={}){const h={};if(localStorage.token)h.Authorization='Bearer '+localStorage.token;let b=o.body;
 if(b&&!(b instanceof FormData)){h['Content-Type']='application/json';b=JSON.stringify(b)}
 const r=await fetch('/api'+p,{...o,headers:h,body:b}),d=await r.json().catch(()=>({}));
 if(!r.ok){if(r.status===401&&localStorage.token)logout();throw new Error(d.message||'Something went wrong')}return d}
const user=()=>JSON.parse(localStorage.user||'null');
function logout(){localStorage.removeItem('token');localStorage.removeItem('user');location.href='/login.html'}
function toast(m){let t=$('#toast');if(!t){t=document.createElement('div');t.id='toast';document.body.append(t)}t.textContent=m;t.className='show';setTimeout(()=>t.className='',2400)}
const cart={get:()=>JSON.parse(localStorage.cart||'[]'),set(c){localStorage.cart=JSON.stringify(c);nav()},
 add(p){const c=this.get(),i=c.find(x=>x.id===p._id);i?i.qty++:c.push({id:p._id,name:p.name,price:+(p.price*(1-p.discount/100)).toFixed(2),qty:1});this.set(c);toast(p.name+' added to cart')},
 count:()=>cart.get().reduce((a,i)=>a+i.qty,0)};
function nav(){const u=user(),h=$('#nav');if(!h)return;
 h.innerHTML=`<a class="logo" href="/">Smart Restaurant</a><a href="/">Menu</a>`+(u?.role==='admin'?`<a href="/admin/dashboard.html">Dashboard</a>`:u?`<a href="/orders.html">My orders</a>`:'')+
 `<a href="/cart.html">Cart <span class="badge">${cart.count()}</span></a>`+(u?`<a href="#" onclick="logout()">Log out (${u.name.split(' ')[0]})</a>`:`<a href="/login.html">Log in</a>`)}
document.addEventListener('DOMContentLoaded',nav);
const foodCard=p=>`<article class="food"><a href="/product.html?id=${p._id}" aria-label="View ${p.name}">${p.image?`<img src="${p.image}" alt="${p.name}">`:`<div class="pic">${ICON[p.category]||'🍽️'}</div>`}</a>
 <div class="in"><h3><span class="veg ${p.foodType==='Veg'?'':'nv'}"></span><a href="/product.html?id=${p._id}">${p.name}</a></h3><p>${p.description||''}</p>
 <div class="price">${p.discount?`<s>${money(p.price)}</s>`:''}${money(p.price*(1-p.discount/100))} · ⭐ ${p.rating}</div>
 <button class="btn" onclick='cart.add(${JSON.stringify(p).replace(/'/g,"&#39;")})'>Add to cart</button></div></article>`;


 require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/events', require('./events').handler);

app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'))
);

['auth', 'products', 'orders', 'offers', 'admin'].forEach((r) => {
  app.use(
    '/api/' + r,
    require('./routes/' + r)
  );
});

app.use(
  express.static(path.join(__dirname, '../frontend'))
);

app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.status || 500).json({
    message: err.message || 'Server error'
  });
});

module.exports = app;