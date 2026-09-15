(async ()=>{
  try{
    const body={customerEmail:'proxytest@example.com', customerName:'Proxy Tester', items:[{id:1,name:'Test Pot',price:100,quantity:1}], total:100, paymentMethod:'cod'};
    const res=await fetch('http://localhost:3000/api/orders',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});
    const j=await res.text();
    console.log('STATUS',res.status,res.statusText);console.log('BODY',j);
  }catch(e){console.error('ERR',e)}
})();
