const products = [
  {id:1,name:"Wireless Headphones",category:"Electronics",price:4500,emoji:"🎧",description:"Comfortable sound for music and calls."},
  {id:2,name:"Smart Watch",category:"Electronics",price:6500,emoji:"⌚",description:"A stylish watch for everyday use."},
  {id:3,name:"Mobile Phone",category:"Electronics",price:42000,emoji:"📱",description:"A modern phone for daily tasks."},
  {id:4,name:"Classic Sneakers",category:"Fashion",price:3800,emoji:"👟",description:"Comfortable shoes for daily wear."},
  {id:5,name:"Travel Backpack",category:"Fashion",price:2200,emoji:"🎒",description:"A practical bag for work and travel."},
  {id:6,name:"Wrist Watch",category:"Fashion",price:3000,emoji:"⌚",description:"A simple and elegant accessory."},
  {id:7,name:"Coffee Maker",category:"Home",price:5500,emoji:"☕",description:"Make a fresh cup of coffee at home."},
  {id:8,name:"Desk Lamp",category:"Home",price:1800,emoji:"💡",description:"Brighten your study or work desk."}
];

let cart = JSON.parse(localStorage.getItem("shopEasyCart") || "[]");
const $ = id => document.getElementById(id);
const money = amount => "Rs. " + amount.toLocaleString("en-PK");

function saveCart(){ localStorage.setItem("shopEasyCart", JSON.stringify(cart)); }
function renderProducts(){
  const search = $("searchInput").value.trim().toLowerCase();
  const category = $("categoryFilter").value;
  const maxPrice = Number($("maxPrice").value);
  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search) &&
    (category === "all" || p.category === category) &&
    p.price <= maxPrice
  );
  $("productGrid").innerHTML = filtered.map(p => `
    <article class="product-card">
      <div class="product-image">${p.emoji}</div>
      <div class="product-info">
        <span class="product-category">${p.category}</span>
        <h3>${p.name}</h3>
        <p class="product-description">${p.description}</p>
        <div class="product-bottom">
          <span class="product-price">${money(p.price)}</span>
          <button class="add-button" onclick="addToCart(${p.id})">Add to Cart</button>
        </div>
      </div>
    </article>`).join("");
  $("noProducts").classList.toggle("hidden", filtered.length !== 0);
}
function addToCart(id){
  const item = cart.find(x => x.id === id);
  if(item) item.qty++;
  else cart.push({id,qty:1});
  saveCart(); renderCart(); openCart();
}
function changeQty(id,change){
  const item = cart.find(x => x.id === id);
  if(!item) return;
  item.qty += change;
  if(item.qty <= 0) cart = cart.filter(x => x.id !== id);
  saveCart(); renderCart();
}
function removeItem(id){cart=cart.filter(x=>x.id!==id);saveCart();renderCart();}
function cartTotal(){return cart.reduce((sum,item)=>sum+products.find(p=>p.id===item.id).price*item.qty,0);}
function renderCart(){
  $("cartCount").textContent=cart.reduce((sum,x)=>sum+x.qty,0);
  $("cartSubtotal").textContent=money(cartTotal());
  $("checkoutTotal").textContent=money(cartTotal());
  if(!cart.length){$("cartItems").innerHTML='<p class="cart-empty">Your cart is empty. Add a product to get started.</p>';return;}
  $("cartItems").innerHTML=cart.map(item=>{
    const p=products.find(x=>x.id===item.id);
    return `<div class="cart-item">
      <div class="cart-emoji">${p.emoji}</div>
      <div><h4>${p.name}</h4><small>${money(p.price)} each</small>
        <div class="quantity"><button onclick="changeQty(${p.id},-1)">−</button><span>${item.qty}</span><button onclick="changeQty(${p.id},1)">+</button></div>
        <button class="remove-button" onclick="removeItem(${p.id})">Remove</button>
      </div><strong>${money(p.price*item.qty)}</strong>
    </div>`;
  }).join("");
}
function openCart(){$("cartDrawer").classList.add("open");$("backdrop").classList.remove("hidden");}
function closeCart(){$("cartDrawer").classList.remove("open");$("backdrop").classList.add("hidden");}
function openCheckout(){
  if(!cart.length){alert("Your cart is empty. Please add a product first.");return;}
  closeCart();$("checkoutTotal").textContent=money(cartTotal());$("checkoutModal").classList.remove("hidden");
}

$("searchInput").addEventListener("input",renderProducts);
$("categoryFilter").addEventListener("change",renderProducts);
$("maxPrice").addEventListener("input",()=>{
  $("priceValue").textContent=money(Number($("maxPrice").value));renderProducts();
});
$("cartButton").addEventListener("click",openCart);
$("closeCart").addEventListener("click",closeCart);
$("backdrop").addEventListener("click",closeCart);
$("checkoutButton").addEventListener("click",openCheckout);
$("closeCheckout").addEventListener("click",()=>$("checkoutModal").classList.add("hidden"));

$("checkoutForm").addEventListener("submit",event=>{
  event.preventDefault();
  if(!cart.length){alert("Your cart is empty.");return;}
  const form = new FormData(event.target);
  const orderId = "SE" + Date.now().toString().slice(-7);
  const customer = form.get("name");
  const email = form.get("email");
  const payment = form.get("payment");
  const total = cartTotal();
  const order = {
    orderId, customer, email, payment, total,
    items: cart.map(item=>({product:products.find(p=>p.id===item.id).name,quantity:item.qty})),
    status:"Order Placed", createdAt:new Date().toISOString()
  };
  const oldOrders=JSON.parse(localStorage.getItem("shopEasyOrders")||"[]");
  oldOrders.push(order);
  localStorage.setItem("shopEasyOrders",JSON.stringify(oldOrders));
  $("successMessage").textContent=`Order ${orderId} has been placed by ${customer}. Total: ${money(total)}. Payment: ${payment}.`;
  $("checkoutModal").classList.add("hidden");
  $("successModal").classList.remove("hidden");
  cart=[];saveCart();renderCart();event.target.reset();
});
$("continueShopping").addEventListener("click",()=>{
  $("successModal").classList.add("hidden");
  document.getElementById("products").scrollIntoView({behavior:"smooth"});
});
renderProducts();renderCart();
