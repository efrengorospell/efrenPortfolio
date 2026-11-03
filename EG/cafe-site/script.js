const menuItems = [
  {name:"Sinta Latte",description:"Double espresso, silky milk, a little brown sugar.",price:185,category:"coffee",art:"latte",badge:"HOUSE FAVORITE",dietary:"Contains dairy"},
  {name:"Iced Ube Cloud",description:"Ube cream, espresso, and a slow-melting cloud.",price:210,category:"coffee",art:"ube",badge:"A LITTLE LOCAL",dietary:"Contains dairy"},
  {name:"Honey Oat Matcha",description:"Stone-ground matcha with honey and oat milk.",price:195,category:"coffee",art:"matcha",badge:"",dietary:"Oat milk"},
  {name:"Cold Brew No. 3",description:"Steeped for sixteen hours. Smooth all the way down.",price:170,category:"coffee",art:"coldbrew",badge:"SLOW STEEP",dietary:"Black coffee"},
  {name:"Brown Butter Cookie",description:"Golden edges, soft middle, dark chocolate bits.",price:95,category:"bakery",art:"cookie",badge:"FRESH BAKED",dietary:"Contains dairy"},
  {name:"Banana Loaf",description:"Ripe banana, toasted walnuts, just enough spice.",price:110,category:"bakery",art:"loaf",badge:"",dietary:"Contains nuts"},
  {name:"Avocado Sourdough",description:"Smashed avocado, chili oil, toasted sourdough.",price:240,category:"brunch",art:"toast",badge:"BRUNCH PICK",dietary:"Vegetarian"},
  {name:"Garden Toast",description:"Whipped ricotta, greens, lemon, and good olive oil.",price:225,category:"brunch",art:"salad",badge:"",dietary:"Vegetarian"}
];

const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (char) => ({
  "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"
}[char]));

function artMarkup(art){
  if(["latte","matcha","ube","coldbrew"].includes(art)){
    return `<div class="drink-glass art-${art}"><span class="straw"></span></div>${art==="latte"?'<span class="latte-art"></span>':""}`;
  }
  const artClass={cookie:"cookie-art",loaf:"loaf-art",toast:"toast-art",salad:"toast-art"}[art]||"cookie-art";
  return `<div class="${artClass}"></div>`;
}

const menuGrid=document.querySelector("#menu-grid");
menuGrid.innerHTML=menuItems.map((item)=>`
  <article class="menu-card" data-category="${item.category}">
    <div class="menu-art" data-art="${item.art}" aria-hidden="true">
      ${item.badge?`<span class="menu-ribbon">${escapeHTML(item.badge)}</span>`:""}
      ${artMarkup(item.art)}
    </div>
    <div class="menu-card-content">
      <div class="menu-card-top"><h3>${escapeHTML(item.name)}</h3><span class="menu-price">₱${item.price}</span></div>
      <p>${escapeHTML(item.description)}</p>
      <div class="menu-card-bottom"><span class="menu-kind">${escapeHTML(item.category)}</span><span class="dietary">${escapeHTML(item.dietary)}</span></div>
    </div>
  </article>`).join("");

document.querySelectorAll(".filter-button").forEach((button)=>{
  button.addEventListener("click",()=>{
    const filter=button.dataset.filter;
    document.querySelectorAll(".filter-button").forEach((item)=>{
      const active=item===button;
      item.classList.toggle("is-active",active);
      item.setAttribute("aria-pressed",String(active));
    });
    menuGrid.querySelectorAll(".menu-card").forEach((card)=>{
      card.hidden=filter!=="all"&&card.dataset.category!==filter;
    });
  });
});

const navToggle=document.querySelector(".menu-toggle");
const siteNav=document.querySelector("#site-nav");
navToggle.addEventListener("click",()=>{
  const open=navToggle.getAttribute("aria-expanded")!=="true";
  navToggle.setAttribute("aria-expanded",String(open));
  navToggle.setAttribute("aria-label",open?"Close navigation":"Open navigation");
  siteNav.classList.toggle("is-open",open);
});
siteNav.querySelectorAll("a").forEach((link)=>link.addEventListener("click",()=>{
  navToggle.setAttribute("aria-expanded","false");
  navToggle.setAttribute("aria-label","Open navigation");
  siteNav.classList.remove("is-open");
}));

const reservationDialog=document.querySelector("#reservation-dialog");
const confirmationDialog=document.querySelector("#confirmation-dialog");
document.querySelectorAll(".reserve-trigger").forEach((button)=>button.addEventListener("click",()=>reservationDialog.showModal()));
document.querySelector(".dialog-close").addEventListener("click",()=>reservationDialog.close());
reservationDialog.addEventListener("click",(event)=>{
  if(event.target===reservationDialog)reservationDialog.close();
});
document.querySelectorAll(".confirmation-close").forEach((button)=>button.addEventListener("click",()=>confirmationDialog.close()));
confirmationDialog.addEventListener("click",(event)=>{
  if(event.target===confirmationDialog)confirmationDialog.close();
});

const dateInput=document.querySelector("#reservation-date");
const manilaTodayParts=new Intl.DateTimeFormat("en-CA",{
  timeZone:"Asia/Manila",year:"numeric",month:"2-digit",day:"2-digit"
}).formatToParts(new Date());
const manilaToday=Object.fromEntries(manilaTodayParts.map((part)=>[part.type,part.value]));
dateInput.min=`${manilaToday.year}-${manilaToday.month}-${manilaToday.day}`;

document.querySelector("#reservation-form").addEventListener("submit",(event)=>{
  event.preventDefault();
  const form=new FormData(event.currentTarget);
  const guestName=String(form.get("name")).trim();
  const dateValue=new Date(`${form.get("date")}T12:00:00+08:00`);
  const readableDate=new Intl.DateTimeFormat("en-PH",{
    timeZone:"Asia/Manila",weekday:"short",month:"short",day:"numeric"
  }).format(dateValue);
  document.querySelector("#confirmation-copy").textContent=
    `Thanks, ${guestName}. Your sample request is for ${form.get("guests")} on ${readableDate} at ${form.get("time")}.`;
  reservationDialog.close();
  confirmationDialog.showModal();
  event.currentTarget.reset();
  dateInput.min=`${manilaToday.year}-${manilaToday.month}-${manilaToday.day}`;
});

function updateOpenStatus(){
  const parts=new Intl.DateTimeFormat("en-US",{
    timeZone:"Asia/Manila",weekday:"short",hour:"2-digit",minute:"2-digit",hourCycle:"h23"
  }).formatToParts(new Date());
  const values=Object.fromEntries(parts.map((part)=>[part.type,part.value]));
  const weekday=values.weekday;
  const hour=Number(values.hour);
  const minute=Number(values.minute);
  const closeHour=weekday==="Sun"?18:(weekday==="Fri"||weekday==="Sat"?22:20);
  const open=hour>=8&&hour<closeHour;
  const status=document.querySelector("#open-status-text");
  status.textContent=open?`Open now · until ${closeHour>12?closeHour-12:closeHour}:00 PM`:hour<8?"Closed · opens at 8:00 AM":"Closed for today";
  status.closest(".open-status").classList.toggle("is-closed",!open);
}
updateOpenStatus();
setInterval(updateOpenStatus,60000);
document.querySelector("#year").textContent=new Date().getFullYear();
