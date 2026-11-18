/* UniCart GH – vanilla JS, component-style render functions */
const AI_GATEWAY_URL="/api/review-listing"; // your server route that calls Vercel AI Gateway (keep API keys server-side)
const FALLBACK="assets/placeholder.svg";
const S={items:[...LISTINGS],saved:new Set(),cat:"All",q:"",campus:"",loc:"",type:"",cond:"",sort:"new",post:null};
const $=(s)=>document.querySelector(s);
const esc=(t)=>String(t).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const cedi=(l)=>(l.from?"From ":"")+"GH₵ "+Number(l.price).toLocaleString();
const avatar=(n)=>"data:image/svg+xml,"+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" fill="#B5F800"/><text x="20" y="26" text-anchor="middle" font-family="Arial" font-weight="700" font-size="17" fill="#0D0D0D">${esc(n.trim().slice(0,2).toUpperCase())}</text></svg>`);
const imgTag=(src,cls="",alt="")=>`<img ${cls?`class="${cls}"`:""} src="${esc(src)}" alt="${esc(alt)}" loading="lazy" onerror="this.onerror=null;this.src='${FALLBACK}'">`;
const heart=`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0D0D0D" stroke-width="2"><path d="M12 21s-8-5.3-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.7-8 11-8 11z"/></svg>`;
const waIcon=`<svg width="20" height="20" viewBox="0 0 24 24" fill="#0D0D0D"><path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2zm5.4 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .5l-.4.6-.3.3c-.1.2-.3.3-.1.6.2.3.7 1.2 1.5 1.9 1 .9 1.9 1.2 2.2 1.3.3.1.4.1.6-.1l.8-1c.2-.3.4-.2.6-.1l1.8.9c.3.1.5.2.5.3.1.2.1.7-.1 1.3z"/></svg>`;
function waLink(l){const t=`Hi ${l.seller}, I saw your listing "${l.title}" (GH₵${l.price}) on UniCart. Is it still available?`;return`https://wa.me/${l.phone}?text=${encodeURIComponent(t)}`}
function toast(m){const t=$("#toast");t.textContent=m;t.classList.add("show");clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove("show"),2600)}

/* ---------- Components ---------- */
function Card(l){
  return `<article class="card"><div class="imgbox" data-open="${l.id}">${imgTag(l.img,"",l.title)}<span class="badge">${esc(l.campus)}</span>
  <button class="save ${S.saved.has(l.id)?"on":""}" data-save="${l.id}" aria-label="Save">${heart}</button></div>
  <div class="body"><div class="tags"><span class="tag">${esc(l.cond)}</span>${l.type==="service"?'<span class="tag">Student Service</span>':""}${l.hot?'<span class="tag hot">Hot Deal</span>':""}${l.pending?'<span class="tag">Pending approval</span>':""}</div>
  <h3 class="title" data-open="${l.id}">${esc(l.title)}</h3><div class="price">${cedi(l)}</div>
  <div class="seller">${imgTag(avatar(l.seller),"",l.seller)}<span>${esc(l.seller)}</span><span class="ver">✓ Verified Student</span></div>
  <a class="btn wa" href="${waLink(l)}" target="_blank" rel="noopener">${waIcon}Chat on WhatsApp</a></div></article>`;
}
function Detail(l){
  return `<div class="modal-h"><h3>${esc(l.title)}</h3><button class="btn" data-close aria-label="Close">✕</button></div>
  <div class="modal-b">${imgTag(l.img,"hero-img",l.title)}<div class="price">${cedi(l)}</div>
  <div class="tags"><span class="tag">${esc(l.cond)}</span><span class="tag">${esc(l.cat)}</span><span class="tag">${esc(l.campus)}</span></div>
  <p>${esc(l.desc)}</p><p><b>Pickup / delivery:</b> ${esc(l.deliv)}<br><b>Seller area:</b> ${esc(l.loc)}</p>
  <div class="sellercard">${imgTag(avatar(l.seller),"",l.seller)}<div><b>${esc(l.seller)}</b> <span class="ver">✓ Verified Student</span><br><small>${l.listings} active listings · Usually replies within an hour</small></div></div></div>
  <div class="sticky-bar"><button class="btn heart-btn save ${S.saved.has(l.id)?"on":""}" style="position:static" data-save="${l.id}" aria-label="Save">${heart}</button>
  <a class="btn wa lime" style="background:var(--wa)" href="${waLink(l)}" target="_blank" rel="noopener">${waIcon}Order / Enquire on WhatsApp</a></div>`;
}
function render(){
  const q=S.q.toLowerCase();
  let r=S.items.filter(l=>(S.cat==="All"||l.cat===S.cat)&&(!S.campus||l.campus===S.campus)&&(!S.loc||l.loc===S.loc)&&(!S.type||l.type===S.type)&&(!S.cond||l.cond===S.cond)&&(!q||(l.title+l.cat+l.desc+l.seller).toLowerCase().includes(q)));
  r.sort((a,b)=>S.sort==="asc"?a.price-b.price:S.sort==="desc"?b.price-a.price:b.ts-a.ts);
  $("#grid").innerHTML=r.length?r.map(Card).join(""):`<div class="empty"><h3>No listings found</h3><p>Try another campus or category, or post the first one.</p></div>`;
  $("#pills").innerHTML=["All",...CATEGORIES].map(c=>`<button class="pill ${c===S.cat?"on":""}" data-cat="${esc(c)}">${esc(c)}</button>`).join("");
  const locs=[...new Set(S.items.map(l=>l.loc))].sort();
  $("#fLoc").innerHTML=`<option value="">Any hostel / location</option>`+locs.map(x=>`<option ${x===S.loc?"selected":""}>${esc(x)}</option>`).join("");
  $("#savedCount").textContent=S.saved.size;
}
const open=(id)=>$(id).classList.add("open"),close=()=>document.querySelectorAll(".overlay").forEach(o=>o.classList.remove("open"));
function showDetail(id){const l=S.items.find(x=>x.id==id);if(!l)return;$("#detailBox").innerHTML=Detail(l);open("#detail")}
function toggleSave(id){S.saved.has(id)?S.saved.delete(id):S.saved.add(id);render();const l=S.items.find(x=>x.id==id);if($("#detail").classList.contains("open"))$("#detailBox").innerHTML=Detail(l)}

/* ---------- Post item (3 steps) ---------- */
function newDraft(){return{step:1,img:SAMPLE_IMAGES[0],title:"",cat:CATEGORIES[0],type:"product",price:"",cond:"Brand New",campus:"UPSA",loc:"",seller:"",phone:"233",desc:"",ai:null}}
function sync(){const d=S.post;document.querySelectorAll("#postBox [data-f]").forEach(el=>d[el.dataset.f]=el.value)}
function PostForm(){
  const d=S.post,o=(arr,v)=>arr.map(x=>`<option ${x===v?"selected":""}>${esc(x)}</option>`).join("");
  const steps=`<div class="steps">${[1,2,3].map(n=>`<span class="${n<=d.step?"on":""}"></span>`).join("")}</div>`;
  let body="";
  if(d.step===1)body=`<label>Photo URL<input data-f="img" value="${esc(d.img)}"></label><label>…or upload a photo<input type="file" accept="image/*" id="file"></label>
  <div class="samples">${SAMPLE_IMAGES.map(s=>`<span data-sample="${s}">${imgTag(s,s===d.img?"on":"","sample")}</span>`).join("")}</div>
  <label>Title<input data-f="title" value="${esc(d.title)}" placeholder="e.g. Neatly used HP laptop"></label>
  <div class="toggle"><button data-type="product" class="${d.type==="product"?"on":""}">Physical Product</button><button data-type="service" class="${d.type==="service"?"on":""}">Student Service</button></div>
  <label>Category<select data-f="cat">${o(CATEGORIES,d.cat)}</select></label>`;
  if(d.step===2)body=`<div class="row"><label>Price (GH₵)<input data-f="price" type="number" min="0" value="${esc(d.price)}"></label>
  <label>Condition<select data-f="cond">${o(["Brand New","Neatly Used","Service/Booking"],d.cond)}</select></label></div>
  <div class="row"><label>Campus<select data-f="campus">${o(["UPSA","UG Legon","KNUST","UCC","GIMPA"],d.campus)}</select></label>
  <label>Pickup / hostel<input data-f="loc" value="${esc(d.loc)}" placeholder="e.g. Unity Hall"></label></div>
  <div class="row"><label>Seller / brand name<input data-f="seller" value="${esc(d.seller)}"></label>
  <label>WhatsApp (233…)<input data-f="phone" inputmode="numeric" value="${esc(d.phone)}"></label></div>`;
  if(d.step===3)body=`<label>Description<textarea data-f="desc" rows="4" placeholder="Condition, size, what's included, pickup options…">${esc(d.desc)}</textarea></label>
  <div class="ai-box"><b>AI listing review</b><small>Checks your text for completeness and suggests a buyer-friendly description.</small>
  <button class="btn" id="aiBtn">${d.aiLoading?"Reviewing…":"Review with AI"}</button>${d.ai?AIResult(d.ai):""}</div>`;
  return `<div class="modal-h"><h3>Post item · Step ${d.step} of 3</h3><button class="btn" data-close aria-label="Close">✕</button></div>
  <div class="modal-b">${steps}${body}</div><div class="sticky-bar">${d.step>1?'<button class="btn" id="back">Back</button>':""}
  <button class="btn lime" style="flex:1" id="next">${d.step<3?"Next":"Submit for approval"}</button></div>`;
}
const AIResult=(a)=>`${a.issues.length?`<ul>${a.issues.map(i=>`<li>${esc(i)}</li>`).join("")}</ul>`:"<p>✓ Looks complete.</p>"}<div class="sug">${esc(a.suggestion)}</div><button class="btn" id="useAI">Use suggestion</button>`;
function localReview(d){
  const issues=[];if(d.title.length<12)issues.push("Make the title more specific (brand, size, model).");
  if(d.desc.length<40)issues.push("Add more detail to the description (at least 40 characters).");
  if(!/\b(size|gb|ram|new|used|brand|model|color|colour|hours|delivery)\b/i.test(d.desc+d.title))issues.push("Mention size, specs, colour, or what's included.");
  if(!d.loc)issues.push("Add a pickup or hostel location.");
  const suggestion=`${d.title||"Item"} – ${d.cond}. ${d.desc||"Add key details here."} Available at ${d.loc||"your campus"} (${d.campus}). Chat on WhatsApp to confirm availability and meet at a public campus spot.`;
  return{issues,suggestion};
}
async function aiReview(){
  const d=S.post;sync();d.aiLoading=true;refreshPost();
  try{const r=await fetch(AI_GATEWAY_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({title:d.title,category:d.cat,price:d.price,condition:d.cond,description:d.desc})});
    if(!r.ok)throw 0;const j=await r.json();d.ai={issues:j.issues||[],suggestion:j.suggestion||""}}
  catch{d.ai=localReview(d);toast("AI Gateway not reachable – used built-in checks")}
  d.aiLoading=false;refreshPost();
}
function refreshPost(){$("#postBox").innerHTML=PostForm()}
function openPost(){S.post=newDraft();refreshPost();open("#post")}
function submitPost(){
  const d=S.post;sync();
  const id=Date.now();S.items.unshift({id,title:d.title,cat:d.cat,type:d.type,price:+d.price,from:d.type==="service",cond:d.type==="service"?"Service/Booking":d.cond,campus:d.campus,loc:d.loc,img:d.img||FALLBACK,seller:d.seller,phone:d.phone.replace(/\D/g,""),desc:d.desc,deliv:d.loc?`Meetup at ${d.loc}`:"Campus Gate Meetup",listings:1,ts:id,pending:!(d.ai&&!d.ai.issues.length)});
  S.cat="All";render();close();toast("Listing submitted! It's live and awaiting approval.");
}
function validate(d){
  if(d.step===1&&d.title.trim().length<3)return"Add a title.";
  if(d.step===2){if(!(+d.price>0))return"Enter a price in GH₵.";if(!d.seller.trim())return"Add your seller name.";if(!/^233\d{9}$/.test(d.phone.replace(/\D/g,"")))return"WhatsApp must look like 233241234567.";}
  if(d.step===3&&d.desc.trim().length<10)return"Add a short description.";
}

/* ---------- Events ---------- */
document.addEventListener("click",e=>{
  const t=e.target,c=(s)=>t.closest(s);
  if(c("[data-save]")){e.stopPropagation();return toggleSave(+c("[data-save]").dataset.save)}
  if(c("[data-open]"))return showDetail(c("[data-open]").dataset.open);
  if(c("[data-cat]")){S.cat=c("[data-cat]").dataset.cat;return render()}
  if(c("[data-close]")||t.classList.contains("overlay"))return close();
  if(c("[data-sample]")){sync();S.post.img=c("[data-sample]").dataset.sample;return refreshPost()}
  if(c("[data-type]")){sync();S.post.type=c("[data-type]").dataset.type;S.post.cat=S.post.type==="service"?"Student Services":S.post.cat;return refreshPost()}
  if(c("#openPost,#openPost2,#fPost")){e.preventDefault();return openPost()}
  if(c("#openSaved,#fSaved")){e.preventDefault();const s=S.items.filter(l=>S.saved.has(l.id));if(!s.length)return toast("Nothing saved yet – tap a heart.");S.q="";S.cat="All";$("#grid").innerHTML=s.map(Card).join("");$("#market").scrollIntoView({behavior:"smooth"});return toast("Showing saved items")}
  if(c("#back")){sync();S.post.step--;return refreshPost()}
  if(c("#next")){sync();const err=validate(S.post);if(err)return toast(err);if(S.post.step<3){S.post.step++;return refreshPost()}return submitPost()}
  if(c("#aiBtn"))return aiReview();
  if(c("#useAI")){S.post.desc=S.post.ai.suggestion;S.post.ai=null;return refreshPost()}
});
document.addEventListener("change",e=>{if(e.target.id==="file"&&e.target.files[0]){sync();const r=new FileReader();r.onload=()=>{S.post.img=r.result;refreshPost()};r.readAsDataURL(e.target.files[0])}});
document.addEventListener("keydown",e=>{if(e.key==="Escape")close()});
$("#q").oninput=e=>{S.q=e.target.value;render()};
[["#campus","campus"],["#fLoc","loc"],["#fType","type"],["#fCond","cond"],["#sort","sort"]].forEach(([s,k])=>$(s).onchange=e=>{S[k]=e.target.value;render()});
render();
