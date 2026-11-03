const STORAGE_KEYS={transactions:"budget-buddy.transactions.v1",budget:"budget-buddy.monthly-budget.v1"};
const expenseCategories=["Food","Transport","School","Bills","Shopping","Entertainment","Health","Other"];
const incomeCategories=["Allowance","Freelance","Gift","Other"];
const categoryIcons={Food:"☻",Transport:"↗",School:"✎",Bills:"⌁",Shopping:"＋",Entertainment:"♪",Health:"✳",Other:"◌",Allowance:"↓",Freelance:"⌘",Gift:"◇"};
const categoryColors={Food:"#ff8a72",Transport:"#9c83ff",School:"#d2a84c",Bills:"#62a9a0",Shopping:"#e58ab0",Entertainment:"#7b9ce0",Health:"#92b56d",Other:"#a6a9a4",Allowance:"#91b55f",Freelance:"#8a72eb",Gift:"#e7a35c"};
const money=new Intl.NumberFormat("en-PH",{style:"currency",currency:"PHP",minimumFractionDigits:0,maximumFractionDigits:2});
const dateDisplay=new Intl.DateTimeFormat("en-PH",{month:"short",day:"numeric",year:"numeric"});
const monthDisplay=new Intl.DateTimeFormat("en-PH",{month:"long",year:"numeric"});
const localDateString=(date)=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
const dateOffset=(offset)=>{const date=new Date();date.setDate(date.getDate()+offset);return localDateString(date);};

const sampleTransactions=[
  {id:"sample-1",title:"Monthly allowance",amount:6000,type:"income",category:"Allowance",date:dateOffset(-2)},
  {id:"sample-2",title:"Groceries for the week",amount:680,type:"expense",category:"Food",date:dateOffset(-1)},
  {id:"sample-3",title:"Jeepney & train fare",amount:170,type:"expense",category:"Transport",date:dateOffset(-1)},
  {id:"sample-4",title:"Lunch on campus",amount:145,type:"expense",category:"Food",date:dateOffset(0)},
  {id:"sample-5",title:"Mobile load",amount:99,type:"expense",category:"Bills",date:dateOffset(-3)},
  {id:"sample-6",title:"School supplies",amount:380,type:"expense",category:"School",date:dateOffset(-2)},
  {id:"sample-7",title:"Coffee with a friend",amount:120,type:"expense",category:"Food",date:dateOffset(-2)},
  {id:"sample-8",title:"Birthday gift",amount:500,type:"income",category:"Gift",date:dateOffset(-3)}
];

function readStorage(key,fallback){
  try{const value=localStorage.getItem(key);return value===null?fallback:JSON.parse(value)}
  catch{return fallback}
}
let transactions=readStorage(STORAGE_KEYS.transactions,null);
if(!Array.isArray(transactions)){transactions=sampleTransactions;try{localStorage.setItem(STORAGE_KEYS.transactions,JSON.stringify(transactions))}catch{}}
let monthlyBudget=Number(readStorage(STORAGE_KEYS.budget,10000));
if(!Number.isFinite(monthlyBudget)||monthlyBudget<=0)monthlyBudget=10000;
let monthCursor=new Date(new Date().getFullYear(),new Date().getMonth(),1);
let editingTransactionId=null;
let storageWarningShown=false;

const $=(selector)=>document.querySelector(selector);
const transactionList=$("#transaction-list");
const categoryList=$("#category-list");
const transactionDialog=$("#transaction-dialog");
const budgetDialog=$("#budget-dialog");
const transactionForm=$("#transaction-form");
const budgetForm=$("#budget-form");
const categorySelect=transactionForm.elements.category;
const toast=$("#toast");
let toastTimer;

function showToast(message){
  toast.textContent=message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>toast.classList.remove("is-visible"),2600);
}
function saveData(){
  try{
    localStorage.setItem(STORAGE_KEYS.transactions,JSON.stringify(transactions));
    localStorage.setItem(STORAGE_KEYS.budget,String(monthlyBudget));
  }catch{
    if(!storageWarningShown){showToast("Browser storage is unavailable. Changes may not stay after you close this page.");storageWarningShown=true;}
  }
}
function escapeHTML(value){
  return String(value??"").replace(/[&<>"']/g,(character)=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[character]));
}
function monthKey(date){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}`;}
function selectedMonthTransactions(){
  const key=monthKey(monthCursor);
  return transactions.filter((item)=>typeof item.date==="string"&&item.date.startsWith(key));
}
function getTotals(items){
  return items.reduce((totals,item)=>{
    const amount=Number(item.amount)||0;
    if(item.type==="income")totals.income+=amount;
    else totals.expenses+=amount;
    return totals;
  },{income:0,expenses:0});
}
function getCategoryOptions(type){return type==="income"?incomeCategories:expenseCategories;}
function updateCategoryOptions(type,selected=""){
  categorySelect.innerHTML=getCategoryOptions(type).map((category)=>`<option value="${escapeHTML(category)}">${escapeHTML(category)}</option>`).join("");
  if(selected&&getCategoryOptions(type).includes(selected))categorySelect.value=selected;
}
function refreshCategoryFilter(){
  const filter=$("#category-filter");
  const selected=filter.value;
  const categories=[...new Set(selectedMonthTransactions().map((item)=>item.category).filter(Boolean))].sort();
  filter.innerHTML='<option value="all">All categories</option>'+categories.map((category)=>`<option value="${escapeHTML(category)}">${escapeHTML(category)}</option>`).join("");
  if(categories.includes(selected))filter.value=selected;
}
function filteredTransactions(items){
  const search=$("#transaction-search").value.trim().toLowerCase();
  const type=$("#type-filter").value;
  const category=$("#category-filter").value;
  return items.filter((item)=>{
    const matchesType=type==="all"||item.type===type;
    const matchesCategory=category==="all"||item.category===category;
    const matchesSearch=!search||`${item.title} ${item.category} ${item.type}`.toLowerCase().includes(search);
    return matchesType&&matchesCategory&&matchesSearch;
  }).sort((a,b)=>b.date.localeCompare(a.date)||String(b.id).localeCompare(String(a.id)));
}
function renderSummary(items){
  const {income,expenses}=getTotals(items);
  const remaining=monthlyBudget-expenses;
  const net=income-expenses;
  const used=monthlyBudget>0?expenses/monthlyBudget*100:0;
  const displayPercent=Math.round(used);
  $("#current-month").textContent=monthDisplay.format(monthCursor);
  $("#budget-remaining").textContent=money.format(remaining);
  $("#income-total").textContent=money.format(income);
  $("#expense-total").textContent=money.format(expenses);
  $("#net-total").textContent=money.format(net);
  $("#spent-summary").textContent=money.format(expenses);
  $("#budget-summary").textContent=money.format(monthlyBudget);
  $("#budget-progress-caption").textContent=`${displayPercent}% used`;
  $("#budget-status").textContent=remaining<0?`${money.format(Math.abs(remaining))} over your monthly limit`:"After this month’s expenses";
  $("#budget-status-dot").style.background=remaining<0?"var(--coral)":"var(--lime)";
  const progress=Math.max(0,Math.min(100,used));
  $("#budget-progress-fill").style.width=`${progress}%`;
  $("#sidebar-progress-fill").style.width=`${progress}%`;
  $("#sidebar-budget-amount").textContent=money.format(monthlyBudget);
  $("#sidebar-budget-caption").textContent=`${money.format(Math.max(0,remaining))} left this month`;
}
function renderTransactions(items){
  const visible=filteredTransactions(items);
  $("#transaction-count").textContent=`(${items.length})`;
  $("#visible-count").textContent=`Showing ${visible.length} of ${items.length} transaction${items.length===1?"":"s"}`;
  $("#empty-state").hidden=visible.length>0;
  transactionList.innerHTML=visible.map((item)=>{
    const income=item.type==="income";
    const sign=income?"+":"−";
    const icon=categoryIcons[item.category]||categoryIcons.Other;
    return `<tr>
      <td class="transaction-name-cell"><span class="transaction-icon ${income?"is-income":""}">${icon}</span>${escapeHTML(item.title)}</td>
      <td><span class="transaction-category">${escapeHTML(item.category)}</span></td>
      <td>${dateDisplay.format(new Date(`${item.date}T12:00:00`))}</td>
      <td class="transaction-amount ${income?"is-income":""}">${sign}${money.format(Number(item.amount)||0)}</td>
      <td class="transaction-actions"><button type="button" data-edit="${escapeHTML(item.id)}" aria-label="Edit ${escapeHTML(item.title)}">✎</button><button type="button" data-delete="${escapeHTML(item.id)}" aria-label="Delete ${escapeHTML(item.title)}">×</button></td>
    </tr>`;
  }).join("");
}
function renderCategories(items){
  const expenses=items.filter((item)=>item.type==="expense");
  const total=expenses.reduce((sum,item)=>sum+(Number(item.amount)||0),0);
  const grouped={};
  expenses.forEach((item)=>{grouped[item.category]=(grouped[item.category]||0)+(Number(item.amount)||0);});
  const rows=Object.entries(grouped).sort((a,b)=>b[1]-a[1]);
  $("#category-total").textContent=money.format(total);
  if(!rows.length){categoryList.innerHTML='<p class="empty-category">Add expenses to see where your money goes.</p>';return;}
  categoryList.innerHTML=rows.map(([category,amount])=>{
    const percent=total?Math.round(amount/total*100):0;
    const color=categoryColors[category]||categoryColors.Other;
    return `<div class="category-row"><div class="category-row-top"><span class="category-label"><i class="category-swatch" style="background:${color}"></i>${escapeHTML(category)}</span><span class="category-value">${money.format(amount)}</span></div><div class="category-bar"><span style="width:${percent}%;background:${color}"></span></div></div>`;
  }).join("");
}
function render(){
  const items=selectedMonthTransactions();
  refreshCategoryFilter();
  renderSummary(items);
  renderTransactions(items);
  renderCategories(items);
}
function openTransactionDialog(item=null){
  editingTransactionId=item?.id||null;
  transactionForm.reset();
  $("#dialog-error").textContent="";
  $("#transaction-dialog-title").innerHTML=item?"Edit this <em>transaction.</em>":"Add a <em>transaction.</em>";
  const type=item?.type||"expense";
  transactionForm.elements.type.value=type;
  transactionForm.elements.id.value=item?.id||"";
  transactionForm.elements.title.value=item?.title||"";
  transactionForm.elements.amount.value=item?.amount||"";
  transactionForm.elements.date.value=item?.date||localDateString(new Date());
  document.querySelectorAll(".type-option").forEach((button)=>{
    const active=button.dataset.type===type;
    button.classList.toggle("is-selected",active);
    button.setAttribute("aria-pressed",String(active));
  });
  updateCategoryOptions(type,item?.category||"");
  transactionDialog.showModal();
  setTimeout(()=>transactionForm.elements.title.focus(),40);
}
function openBudgetDialog(){
  $("#budget-input").value=monthlyBudget;
  budgetDialog.showModal();
  setTimeout(()=>$("#budget-input").focus(),40);
}

document.querySelectorAll(".add-trigger").forEach((button)=>button.addEventListener("click",()=>openTransactionDialog()));
document.querySelectorAll(".type-option").forEach((button)=>button.addEventListener("click",()=>{
  const type=button.dataset.type;
  transactionForm.elements.type.value=type;
  document.querySelectorAll(".type-option").forEach((option)=>{
    const active=option===button;
    option.classList.toggle("is-selected",active);
    option.setAttribute("aria-pressed",String(active));
  });
  updateCategoryOptions(type);
}));
transactionForm.addEventListener("submit",(event)=>{
  event.preventDefault();
  const values=new FormData(transactionForm);
  const amount=Number(values.get("amount"));
  if(!Number.isFinite(amount)||amount<=0){$("#dialog-error").textContent="Enter an amount greater than zero.";return;}
  const updated={
    id:editingTransactionId||`${Date.now()}-${Math.random().toString(16).slice(2,8)}`,
    title:String(values.get("title")).trim(),amount,type:values.get("type"),category:values.get("category"),date:values.get("date")
  };
  if(!updated.title||!updated.date){$("#dialog-error").textContent="Complete each field before saving.";return;}
  if(editingTransactionId)transactions=transactions.map((item)=>item.id===editingTransactionId?updated:item);
  else transactions.push(updated);
  saveData();render();transactionDialog.close();showToast(editingTransactionId?"Transaction updated.":"Transaction added.");
});
document.querySelectorAll(".dialog-close").forEach((button)=>button.addEventListener("click",()=>button.closest("dialog").close()));
document.querySelectorAll("#edit-budget-side,#edit-budget-main").forEach((button)=>button.addEventListener("click",openBudgetDialog));
budgetForm.addEventListener("submit",(event)=>{
  event.preventDefault();
  const amount=Number($("#budget-input").value);
  if(!Number.isFinite(amount)||amount<=0)return;
  monthlyBudget=amount;saveData();render();budgetDialog.close();showToast("Monthly budget updated.");
});
transactionList.addEventListener("click",(event)=>{
  const editButton=event.target.closest("[data-edit]");
  const deleteButton=event.target.closest("[data-delete]");
  if(editButton){const item=transactions.find((entry)=>entry.id===editButton.dataset.edit);if(item)openTransactionDialog(item);}
  if(deleteButton){
    const item=transactions.find((entry)=>entry.id===deleteButton.dataset.delete);
    if(item&&window.confirm(`Delete “${item.title}”?`)){transactions=transactions.filter((entry)=>entry.id!==item.id);saveData();render();showToast("Transaction deleted.");}
  }
});
$("#transaction-search").addEventListener("input",()=>renderTransactions(selectedMonthTransactions()));
$("#type-filter").addEventListener("change",()=>renderTransactions(selectedMonthTransactions()));
$("#category-filter").addEventListener("change",()=>renderTransactions(selectedMonthTransactions()));
$("#clear-filters").addEventListener("click",()=>{
  $("#transaction-search").value="";$("#type-filter").value="all";$("#category-filter").value="all";render();
});
$("#prev-month").addEventListener("click",()=>{monthCursor=new Date(monthCursor.getFullYear(),monthCursor.getMonth()-1,1);render();});
$("#next-month").addEventListener("click",()=>{monthCursor=new Date(monthCursor.getFullYear(),monthCursor.getMonth()+1,1);render();});

function exportCSV(){
  const items=selectedMonthTransactions();
  if(!items.length){showToast("There are no transactions to export for this month.");return;}
  const csvCell=(value)=>`"${String(value).replaceAll('"','""')}"`;
  const rows=[["Date","Name","Type","Category","Amount"],...items.map((item)=>[item.date,item.title,item.type,item.category,item.amount])];
  const content="\uFEFF"+rows.map((row)=>row.map(csvCell).join(",")).join("\r\n");
  const blob=new Blob([content],{type:"text/csv;charset=utf-8"});
  const url=URL.createObjectURL(blob);
  const link=document.createElement("a");
  link.href=url;link.download=`budget-buddy-${monthKey(monthCursor)}.csv`;document.body.appendChild(link);link.click();link.remove();URL.revokeObjectURL(url);
  showToast("Your CSV download is ready.");
}
$("#export-csv").addEventListener("click",exportCSV);
$("#mobile-export").addEventListener("click",exportCSV);

const profileMenuButton=$("#profile-menu-button");
const profileMenu=$("#profile-menu");
profileMenu.hidden=true;
profileMenuButton.setAttribute("aria-expanded","false");
function closeProfileMenu(returnFocus=false){
  profileMenu.hidden=true;
  profileMenuButton.setAttribute("aria-expanded","false");
  if(returnFocus)profileMenuButton.focus();
}
profileMenuButton.addEventListener("click",()=>{
  const opening=profileMenu.hidden;
  profileMenu.hidden=!opening;
  profileMenuButton.setAttribute("aria-expanded",String(opening));
  if(opening)profileMenu.querySelector("button").focus();
});
profileMenu.addEventListener("keydown",(event)=>{
  const buttons=[...profileMenu.querySelectorAll("button")];
  const index=buttons.indexOf(document.activeElement);
  if(event.key==="Escape"){event.preventDefault();closeProfileMenu(true);}
  if(event.key==="ArrowDown"){event.preventDefault();buttons[(index+1)%buttons.length].focus();}
  if(event.key==="ArrowUp"){event.preventDefault();buttons[(index-1+buttons.length)%buttons.length].focus();}
});
document.addEventListener("click",(event)=>{
  if(!profileMenu.hidden&&!event.target.closest(".profile-actions"))closeProfileMenu();
});
$("#reset-sample-data").addEventListener("click",()=>{
  closeProfileMenu();
  if(!window.confirm("Reset the tracker to its sample transactions and ₱10,000 budget? This replaces your current entries."))return;
  transactions=sampleTransactions.map((item)=>({...item}));
  monthlyBudget=10000;
  saveData();render();showToast("Sample transactions restored.");
});
$("#clear-all-data").addEventListener("click",()=>{
  closeProfileMenu();
  if(!transactions.length){showToast("There are no transactions to clear.");return;}
  if(!window.confirm("Delete every saved transaction? Your monthly budget will stay the same."))return;
  transactions=[];saveData();render();showToast("All transactions cleared.");
});
$("#storage-info").addEventListener("click",()=>{
  closeProfileMenu();
  showToast("Your transactions are stored in this browser on this device.");
});

function setActiveNavigation(hash){
  document.querySelectorAll(".side-nav .nav-link,.mobile-bottom-bar .mobile-tab[href]").forEach((link)=>{
    const active=link.getAttribute("href")===hash;
    link.classList.toggle("is-active",active);
    link.classList.toggle("is-current",active);
    if(active)link.setAttribute("aria-current","location");
    else link.removeAttribute("aria-current");
  });
}
document.querySelectorAll(".side-nav .nav-link,.mobile-bottom-bar .mobile-tab[href]").forEach((link)=>{
  link.addEventListener("click",(event)=>{
    const hash=link.getAttribute("href");
    const target=document.querySelector(hash);
    if(!target)return;
    event.preventDefault();
    setActiveNavigation(hash);
    history.replaceState(null,"",hash);
    target.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"});
  });
});
window.addEventListener("hashchange",()=>setActiveNavigation(location.hash||"#overview"));
setActiveNavigation(location.hash||"#overview");

render();
