/* UniCart GH – vanilla JS, component-style render functions */
const CONFIG = {
  // Point this at your server route that calls the AI Gateway (keep API keys server-side).
  // Expected: POST {title,category,type,condition,price,campus,location,description} -> {suggestion, missing?:[]}
  AI_REVIEW_ENDPOINT: ""
};
const U = id => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=70`;
const PLACEHOLDER = "assets/placeholder.svg";
const CATS = ["All","Fashion & Thrift","Tech & Gadgets","Hostel Essentials","Food & Snacks","Books & Academic","Student Services"];
const PRESETS = [U("photo-1542291026-7eec264c27ff"),U("photo-1496181133206-80ce9b88a853"),U("photo-1523381210434-271e8be1f52b"),U("photo-1512820790803-83ca734da794"),U("photo-1567620905732-2d1ec7ab7445")];
const L = (id,title,price,cat,type,cond,campus,loc,seller,phone,img,desc,delivery,n,from) =>
  ({id,title,price,cat,type,cond,campus,loc,seller,phone,img,desc,delivery,n,from,t:id});
let listings = [
  L(12,"Nike Air Max 90 – size 43, barely worn",320,"Fashion & Thrift","Physical Product","Neatly Used","UPSA","Hall 1, UPSA","Kofi's Kicks","233241234567",PRESETS[0],"Worn twice, no creases. Comes with original box. Cleaned and ready.","Campus Gate Meetup",6),
  L(11,"HP EliteBook 840 – 8GB RAM, 256GB SSD",2400,"Tech & Gadgets","Physical Product","Neatly Used","UG Legon","Commonwealth Hall","TechPlug Legon","233201234567",PRESETS[1],"Fast and light, 6h battery, charger included. Great for coding and assignments.","Campus Gate Meetup",9),
  L(10,"Thrift jackets & oversized hoodies bundle",90,"Fashion & Thrift","Physical Product","Neatly Used","KNUST","Unity Hall","Ama Thrift","233551234567",PRESETS[2],"Hand-picked thrift pieces, sizes S–XL. Message for today's stock.","Hostel Delivery",14),
  L(9,"Logo & flyer design (24hr delivery)",50,"Student Services","Student Service","Service/Booking","UCC","Oguaa Hall","PixelAkua","233261234567",U("photo-1561070791-2526d30994b5"),"Logos, event flyers and social posts. Two free revisions. Price starts at GH₵ 50.","Online delivery",21,true),
  L(8,"Jollof, chicken & plantain – lunch packs",35,"Food & Snacks","Physical Product","Brand New","UPSA","Campus Food Court","Mama Efua's Kitchen","233271234567",PRESETS[4],"Freshly cooked daily. Pre-order before 11am for 1pm pickup.","Hostel Delivery",32),
  L(7,"Level 200 Accounting textbooks (set of 4)",180,"Books & Academic","Physical Product","Neatly Used","UG Legon","Legon Hall","BookBae","233501234567",PRESETS[3],"Clean pages, light highlighting. Sold as a set only.","Campus Gate Meetup",4),
  L(6,"Graduation & event photography",150,"Student Services","Student Service","Service/Booking","KNUST","Katanga Hostel","Lens by Yaw","233241112222",U("photo-1452587925148-ce544e77e70d"),"Shoots, edited photos in 48hrs. Group discounts available. From GH₵ 150.","We come to you",17,true),
  L(5,"Wireless headphones – noise cancelling",210,"Tech & Gadgets","Physical Product","Brand New","GIMPA","GIMPA Hostel B","SoundSpot","233201112222",U("photo-1505740420928-5e560c06d30e"),"Sealed in box, 30-hour battery, 6-month seller warranty.","Campus Gate Meetup",8),
  L(4,"Braids, twists & wig installs",80,"Student Services","Student Service","Service/Booking","UCC","Atlantic Hall","Glow by Naa","233551112222",U("photo-1521590832167-7bcbfaa6381f"),"Appointments at your hostel. Bring your own hair or buy from me. From GH₵ 80.","Hostel visit",12,true)
];
const state = {cat:"All",q:"",campus:"All Campuses",loc:"",type:"",cond:"",sort:"new",saved:new Set(),form:{},step:1,review:null};
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const priceTxt = l => `${l.from?"From ":""}GH₵ ${Number(l.price).toLocaleString()}`;
const waLink = l => `https://wa.me/${l.phone}?text=${encodeURIComponent(`Hi ${l.seller}, I saw your listing "${l.title}" (GH₵${l.price}) on UniCart. Is it still available?`)}`;
const initials = n => n.split(/\s+/).map(w=>w[0]).join("").slice(0,2).toUpperCase();
const img = (src,alt) => `<img src="${esc(src)}" alt="${esc(alt)}" loading="lazy" onerror="this.onerror=null;this.src='${PLACEHOLDER}'">`;

function toast(msg){const t=document.createElement("div");t.className="toast";t.textContent=msg;$("#toasts").append(t);setTimeout(()=>t.remove(),3200)}

/* ---------- Filters & grid ---------- */
function visible(){
  const q=state.q.toLowerCase();
  let r=listings.filter(l=>(state.cat==="All"||l.cat===state.cat)&&(state.campus==="All Campuses"||l.campus===state.campus)&&(!state.loc||l.loc===state.loc)&&(!state.type||l.type===state.type)&&(!state.cond||l.cond===state.cond)&&(!q||`${l.title} ${l.cat} ${l.desc} ${l.seller}`.toLowerCase().includes(q)));
  return r.sort((a,b)=>state.sort==="lo"?a.price-b.price:state.sort==="hi"?b.price-a.price:b.t-a.t);
}
function card(l){
  const on=state.saved.has(l.id);
  return `<article class="card" data-id="${l.id}" tabindex="0">
    <div class="imgwrap">${img(l.img,l.title)}<span class="badge">${esc(l.campus)}</span>
      <button class="heart ${on?"on":""}" data-save="${l.id}" aria-label="${on?"Remove from saved":"Save"}" aria-pressed="${on}">♥</button></div>
    <div class="body"><span class="tag">${esc(l.type==="Student Service"?"Student Service":l.cond)}</span>
      <h3>${esc(l.title)}</h3><div class="price">${priceTxt(l)}</div>
      <div class="seller"><span class="av">${esc(initials(l.seller))}</span><span>${esc(l.seller)}</span><span class="ver">✓ Verified Student</span></div></div>
    <a class="btn wa" data-wa href="${waLink(l)}" target="_blank" rel="noopener">Chat on WhatsApp</a></article>`;
}
function render(){
  $("#pills").innerHTML=CATS.map(c=>`<button class="pill ${c===state.cat?"on":""}" data-cat="${c}">${c}</button>`).join("");
  const locs=[...new Set(listings.map(l=>l.loc))].sort();
  $("#fLoc").innerHTML=`<option value="">Any hostel / location</option>`+locs.map(x=>`<option ${x===state.loc?"selected":""}>${esc(x)}</option>`).join("");
  const r=visible();
  $("#resultCount").textContent=`${r.length} listing${r.length===1?"":"s"}`;
  $("#grid").innerHTML=r.length?r.map(card).join(""):`<div class="empty"><h3>Nothing matches yet</h3><p>Clear a filter or post what you're selling.</p></div>`;
  $("#savedCount").textContent=state.saved.size;
}

/* ---------- Modals ---------- */
function openModal(html){$("#modal").innerHTML=html;$("#modal").hidden=false;$("#overlay").hidden=false;$("#modal").scrollTop=0}
function closeModal(){$("#modal").hidden=true;$("#overlay").hidden=true}
function head(t){return `<div class="mhead"><h2>${t}</h2><button class="x" data-close aria-label="Close">✕</button></div>`}
function toggleSave(id){state.saved.has(id)?state.saved.delete(id):state.saved.add(id);render()}
function detail(id){
  const l=listings.find(x=>x.id===id),on=state.saved.has(id);
  openModal(`${head("Listing details")}<div class="mbody">${img(l.img,l.title).replace("<img",'<img class="dimg"')}
    <div class="chips"><span class="badge" style="position:static">${esc(l.campus)}</span><span class="tag">${esc(l.cond)}</span><span class="tag">${esc(l.cat)}</span></div>
    <h3 style="font-size:1.4rem">${esc(l.title)}</h3><div class="price" style="font-size:1.8rem">${priceTxt(l)}</div>
    <p>${esc(l.desc)}</p>
    <p><strong>Pickup / delivery:</strong> ${esc(l.delivery)}<br><strong>Seller area:</strong> ${esc(l.loc)}</p>
    <div class="sellercard"><span class="av">${esc(initials(l.seller))}</span><div><strong>${esc(l.seller)}</strong> <span class="ver">✓ Verified Student</span><br><small>${l.n} active listings · Usually replies within an hour</small></div></div></div>
    <div class="stick"><button class="btn" data-save="${id}" data-detail>${on?"♥ Saved":"♡ Save"}</button><a class="btn wa" href="${waLink(l)}" target="_blank" rel="noopener">Order / Enquire on WhatsApp</a></div>`);
}
function savedModal(){
  const s=listings.filter(l=>state.saved.has(l.id));
  openModal(`${head("Saved items")}<div class="mbody">${s.length?s.map(l=>`<div class="sellercard" data-id="${l.id}" style="cursor:pointer"><strong>${esc(l.title)}</strong><span class="price" style="margin-left:auto">${priceTxt(l)}</span></div>`).join(""):"<p>Tap the heart on any listing to save it here.</p>"}</div>`);
}

/* ---------- Post flow (3 steps: item → seller → AI review) ---------- */
const opts=(a,v)=>a.map(x=>`<option ${x===v?"selected":""}>${x}</option>`).join("");
function postModal(){
  const f=state.form,s=state.step;
  const bar=`<div class="steps">${[1,2,3].map(i=>`<span class="${i<=s?"on":""}"></span>`).join("")}</div>`;
  let body="";
  if(s===1) body=`<label>Photo URL<input name="img" value="${esc(f.img||"")}" placeholder="https://..."></label>
    <label>Or upload a photo<input type="file" id="file" accept="image/*"></label>
    <div class="presets">${PRESETS.map(p=>`<img src="${p}" data-preset="${p}" class="${f.img===p?"on":""}" alt="Sample photo" onerror="this.src='${PLACEHOLDER}'">`).join("")}</div>
    <div class="toggle"><button type="button" data-type="Physical Product" class="${(f.type||"Physical Product")==="Physical Product"?"on":""}">Product</button><button type="button" data-type="Student Service" class="${f.type==="Student Service"?"on":""}">Student Service</button></div>
    <label>Title<input name="title" value="${esc(f.title||"")}" maxlength="80" placeholder="e.g. Neatly used HP laptop"></label>
    <div class="row2"><label>Category<select name="cat">${opts(CATS.slice(1),f.cat)}</select></label>
    <label>Condition<select name="cond">${opts(["Brand New","Neatly Used","Service/Booking"],f.cond)}</select></label></div>
    <label>Price (GH₵)<input name="price" type="number" min="1" value="${esc(f.price||"")}" placeholder="180"></label>`;
  if(s===2) body=`<div class="row2"><label>Campus<select name="campus">${opts(["UPSA","UG Legon","KNUST","UCC","GIMPA"],f.campus)}</select></label>
    <label>Pickup / hostel location<input name="loc" value="${esc(f.loc||"")}" placeholder="e.g. Hall 2, main gate"></label></div>
    <div class="row2"><label>Seller name or brand<input name="seller" value="${esc(f.seller||"")}"></label>
    <label>WhatsApp number<input name="phone" inputmode="tel" value="${esc(f.phone||"")}" placeholder="0241234567 or 233241234567"></label></div>
    <label>Pickup / delivery option<select name="delivery">${opts(["Campus Gate Meetup","Hostel Delivery","Online delivery","We come to you"],f.delivery)}</select></label>
    <label>Description<textarea name="desc" placeholder="What is it, how is it, why should buyers pick you?">${esc(f.desc||"")}</textarea></label>`;
  if(s===3){const r=state.review; body=!r?`<p>Reviewing your listing…</p>`:`<div class="review"><div class="score">${r.score}% complete</div><div class="bar"><i style="width:${r.score}%"></i></div>
    <ul class="checks">${r.checks.map(c=>`<li>${c[1]?"✅":"⚠️"} ${esc(c[0])}</li>`).join("")}</ul>
    <strong>Suggested description</strong><div class="suggest" id="sugg">${esc(r.suggestion)}</div>
    <button class="btn" type="button" data-use style="margin-top:.6rem">Use suggestion</button></div>
    <p><small>Your listing goes live right after this review. Photo and details are checked for completeness only.</small></p>`}
  openModal(`${head("Post an item")}<form class="mbody" id="postForm" novalidate>${bar}${body}</form>
    <div class="mfoot">${s>1?`<button class="btn" data-back>Back</button>`:"<span></span>"}<button class="btn lime" data-next>${s===3?"Publish listing":s===2?"Review with AI":"Next"}</button></div>`);
}
function readForm(){const fd=new FormData($("#postForm"));fd.forEach((v,k)=>{if(typeof v==="string")state.form[k]=v.trim()})}
function ghPhone(p){let d=String(p).replace(/\D/g,"");if(d.startsWith("0"))d="233"+d.slice(1);return /^233\d{9}$/.test(d)?d:""}
function validate(){
  const f=state.form;
  if(state.step===1){if(!f.title)return"Add a title.";if(!(+f.price>0))return"Enter a price in GH₵.";if(!f.img)return"Add a photo URL, upload, or pick a sample."}
  if(state.step===2){if(!f.seller)return"Add your seller name.";if(!ghPhone(f.phone))return"Enter a valid Ghana WhatsApp number (233…).";if(!f.loc)return"Add a pickup or hostel location."}
  return"";
}
function localReview(f){
  const d=f.desc||"";
  const checks=[["Clear title",(f.title||"").length>=12],["Realistic price",+f.price>0],["Photo added",!!f.img],["Pickup location",!!f.loc],["Description 60+ characters",d.length>=60],["Mentions condition or what's included",/(new|used|worn|clean|include|charger|box|warranty|revision|deliver)/i.test(d)]];
  const kind=f.type==="Student Service";
  const suggestion=`${f.title||"Item"} – ${f.cond||""} at ${f.campus}.\n${d||(kind?"Reliable, friendly service with quick turnaround.":"Ready for a new owner.")}\n${kind?"Starting price":"Price"}: GH₵ ${f.price}. ${f.delivery||"Campus Gate Meetup"} near ${f.loc}.\nMessage me on WhatsApp to confirm availability${kind?" and book a slot":" and arrange a safe campus meetup"}.`;
  return {score:Math.round(checks.filter(c=>c[1]).length/checks.length*100),checks,suggestion};
}
async function runReview(){
  const f=state.form;state.review=null;postModal();
  let r=localReview(f);
  if(CONFIG.AI_REVIEW_ENDPOINT){
    try{const res=await fetch(CONFIG.AI_REVIEW_ENDPOINT,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(f)});
      if(res.ok){const j=await res.json();if(j.suggestion)r.suggestion=j.suggestion;(j.missing||[]).forEach(m=>r.checks.push([m,false]))}}
    catch(e){toast("AI review offline – showing the built-in check.")}
  }
  state.review=r;postModal();
}
function publish(){
  const f=state.form,id=Date.now();
  listings.unshift({id,t:id,title:f.title,price:+f.price,cat:f.cat||CATS[1],type:f.type||"Physical Product",cond:f.cond||"Brand New",campus:f.campus||"UPSA",loc:f.loc,seller:f.seller,phone:ghPhone(f.phone),img:f.img,desc:f.desc||"No description provided.",delivery:f.delivery||"Campus Gate Meetup",n:1,from:f.type==="Student Service"});
  closeModal();state.form={};state.step=1;state.cat="All";render();toast("Listing posted! It's live at the top of the feed.");scrollTo({top:$("#listings").offsetTop-70,behavior:"smooth"});
}
function startPost(){state.form={};state.step=1;state.review=null;postModal()}

/* ---------- Events ---------- */
document.addEventListener("click",e=>{
  const t=e.target,c=s=>t.closest(s);
  if(c("[data-wa]"))return e.stopPropagation();
  const sv=c("[data-save]");if(sv){e.preventDefault();const id=+sv.dataset.save;toggleSave(id);if(sv.hasAttribute("data-detail"))detail(id);return}
  if(c("[data-close]")||t.id==="overlay")return closeModal();
  if(c("#openPost,#heroPost,#fPost")){e.preventDefault();return startPost()}
  if(c("#openSaved,#fSaved")){e.preventDefault();return savedModal()}
  const cat=c("[data-cat]");if(cat){state.cat=cat.dataset.cat;return render()}
  const ty=c("[data-type]");if(ty&&$("#postForm")){readForm();state.form.type=ty.dataset.type;if(ty.dataset.type==="Student Service")state.form.cond="Service/Booking";return postModal()}
  const pr=c("[data-preset]");if(pr){readForm();state.form.img=pr.dataset.preset;return postModal()}
  if(c("[data-use]")){state.form.desc=state.review.suggestion;toast("Suggestion applied.");return}
  if(c("[data-back]")){readForm();state.step--;return postModal()}
  if(c("[data-next]")){
    if(state.step<3){readForm();const err=validate();if(err)return toast(err);state.step++;return state.step===3?runReview():postModal()}
    return publish();
  }
  const cd=c("[data-id]");if(cd&&!$("#postForm"))return detail(+cd.dataset.id);
});
document.addEventListener("keydown",e=>{
  if(e.key==="Escape")closeModal();
  if(e.key==="Enter"&&e.target.matches(".card"))detail(+e.target.dataset.id);
});
document.addEventListener("change",e=>{
  if(e.target.id==="file"&&e.target.files[0]){const fr=new FileReader();fr.onload=()=>{readForm();state.form.img=fr.result;postModal()};fr.readAsDataURL(e.target.files[0])}
});
$("#q").addEventListener("input",e=>{state.q=e.target.value;render()});
[["#campus","campus"],["#fLoc","loc"],["#fType","type"],["#fCond","cond"],["#sort","sort"]].forEach(([s,k])=>$(s).addEventListener("change",e=>{state[k]=e.target.value;render()}));
render();
