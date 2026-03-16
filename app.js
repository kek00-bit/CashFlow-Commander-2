let bills = JSON.parse(localStorage.getItem("bills")) || [];

function saveBills(){ localStorage.setItem("bills", JSON.stringify(bills)); }

function nextDate(bill){
let d = new Date(bill.date);
switch(bill.recurring){
case "weekly": d.setDate(d.getDate()+7); break;
case "biweekly": d.setDate(d.getDate()+14); break;
case "monthly": d.setMonth(d.getMonth()+1); break;
case "yearly": d.setFullYear(d.getFullYear()+1); break;
}
return d.toISOString().split("T")[0];
}

function addBill(){
let b = {
name: document.getElementById("name").value,
amount: parseFloat(document.getElementById("amount").value),
date: document.getElementById("date").value,
category: document.getElementById("category").value,
recurring: document.getElementById("recurring").value,
notes: document.getElementById("notes").value
};
if(!b.name||!b.amount||!b.date){alert("Fill all required fields");return;}
bills.push(b); saveBills(); render();
}

function markPaid(i){
let b = bills[i];
if(b.recurring!="none") b.date=nextDate(b);
else bills.splice(i,1);
saveBills(); render();
}

function del(i){ bills.splice(i,1); saveBills(); render(); }

function render(){
let list=document.getElementById("billList"); list.innerHTML="";
let total=0,nextDue=null;
bills.forEach((b,i)=>{
total+=b.amount;
if(!nextDue||new Date(b.date)<new Date(nextDue)) nextDue=b.date;
list.innerHTML+=`<tr>
<td>${b.name}</td>
<td>$${b.amount}</td>
<td>${b.date}</td>
<td>${b.category}</td>
<td>${b.recurring}</td>
<td><button onclick="markPaid(${i})">Paid</button> <button onclick="del(${i})">Delete</button></td>
</tr>`;
});
document.getElementById("billCount").innerText=bills.length;
document.getElementById("totalAmount").innerText="$"+total;
document.getElementById("nextDue").innerText=nextDue||"None";
drawCharts(); drawCalendar(); drawAI();
}

let categoryChart=null, cashFlowChart=null;
function drawCharts(){
let catTotals={};
bills.forEach(b=>{catTotals[b.category]=(catTotals[b.category]||0)+b.amount;});
if(categoryChart) categoryChart.destroy();
categoryChart=new Chart(document.getElementById("categoryChart"),{
type:'pie',
data:{labels:Object.keys(catTotals),datasets:[{data:Object.values(catTotals),backgroundColor:['#2a7fff','#ff6384','#ffcd56','#36a2eb','#9b59b6']}]}
});

let months=Array(12).fill(0);
bills.forEach(b=>{months[new Date(b.date).getMonth()]+=b.amount;});
if(cashFlowChart) cashFlowChart.destroy();
cashFlowChart=new Chart(document.getElementById("cashFlowChart"),{
type:'line',
data:{labels:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],datasets:[{label:'Monthly Cash Flow',data:months,borderColor:'#2a7fff',fill:false}]}
});
}

function drawCalendar(){
let cal=document.getElementById("calendar"); cal.innerHTML="";
let year=new Date().getFullYear();
for(let d=1;d<=365;d++){
let day=new Date(year,0,d);
let div=document.createElement("div"); div.className="day"; div.innerText=day.getDate();
bills.forEach(b=>{
if(new Date(b.date).toDateString()==day.toDateString()){let dot=document.createElement("div"); dot.className="dot"; div.appendChild(dot);}
});
cal.appendChild(div);
}
}

function drawAI(){
let panel=document.getElementById("aiPanel"); panel.innerHTML="";
if(!bills.length){panel.innerText="No bills yet."; return;}
let today=new Date();
let upcoming=bills.filter(b=>new Date(b.date)>=today).sort((a,b)=>new Date(a.date)-new Date(b.date));
panel.innerHTML="<b>Top bills to pay first:</b><br>";
upcoming.slice(0,5).forEach(b=>{panel.innerHTML+=`${b.name} $${b.amount} due ${b.date}<br>`;});
}

function exportPDF(){
const { jsPDF } = window.jspdf;
let doc = new jsPDF();
doc.text("CashFlow Commander Report",10,10);
let y=20;
bills.forEach(b=>{doc.text(`${b.name} $${b.amount} due ${b.date}`,10,y); y+=10;});
doc.save("CashFlowCommander.pdf");
}

render();
