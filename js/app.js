(function(){
"use strict";

/* ---------- helpers ---------- */
const $ = s => document.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmt = n => Math.round(Number(n) || 0).toLocaleString("en-US");
const money = n => fmt(n) + " د.ع";
const sum = (arr, f) => arr.reduce((a, x) => a + (Number(f(x)) || 0), 0);
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
function num(v){
  if (v == null) return 0;
  const s = String(v).replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d)).replace(/[,\s،٬]/g, "");
  const n = parseFloat(s);
  return isFinite(n) ? n : 0;
}
function localISO(d){ d = d || new Date(); const z = d.getTimezoneOffset() * 60000; return new Date(d.getTime() - z).toISOString().slice(0, 10); }
const today = () => localISO();
function addMonths(iso, n){
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1 + n, 1);
  const last = new Date(dt.getFullYear(), dt.getMonth() + 1, 0).getDate();
  dt.setDate(Math.min(d, last));
  return localISO(dt);
}
function addDays(iso, n){ const [y, m, d] = iso.split("-").map(Number); return localISO(new Date(y, m - 1, d + n)); }
function dayDiff(a, b){ const p = s => { const [y, m, d] = s.split("-").map(Number); return Date.UTC(y, m - 1, d); }; return Math.round((p(a) - p(b)) / 864e5); }
const LOC = "ar-IQ-u-nu-latn";
function fmtDate(iso){ if (!iso) return "—"; const [y, m, d] = iso.split("-").map(Number); return new Date(y, m - 1, d).toLocaleDateString(LOC, {year:"numeric", month:"short", day:"numeric"}); }
function monthName(ym){ const [y, m] = ym.split("-").map(Number); return new Date(y, m - 1, 1).toLocaleDateString(LOC, {month:"long", year:"numeric"}); }
function monthShort(ym){ const [y, m] = ym.split("-").map(Number); return new Date(y, m - 1, 1).toLocaleDateString(LOC, {month:"short"}); }
function roundTo(n, step){ return Math.round(n / step) * step; }
function waNumber(p){ let d = String(p || "").replace(/\D/g, ""); if (d.startsWith("00")) d = d.slice(2); if (d.startsWith("0")) d = "964" + d.slice(1); return d; }

const P = {
  home:"M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z",
  pos:"M3 4h2l2.4 11.2a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.8L20 8H6.2M9 20.5h.01M17 20.5h.01",
  box:"M21 8l-9-5-9 5v8l9 5 9-5zM3 8l9 5 9-5M12 13v8",
  receipt:"M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6M9 16h3",
  cal:"M4 6h16v14H4zM4 10h16M8 3v4M16 3v4M8 14h2M14 14h2",
  users:"M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21a7 7 0 0 1 14 0M16 3.5a4 4 0 0 1 0 7.5M22 21a7 7 0 0 0-4-6.3",
  safe:"M3 5h18v14H3zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM12 9v1M3 9h2M3 15h2M7 19v2M17 19v2",
  gear:"M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z",
  more:"M5 12h.01M12 12h.01M19 12h.01",
  plus:"M12 5v14M5 12h14",
  minus:"M5 12h14",
  search:"M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4",
  print:"M6 9V3h12v6M6 18H4v-7h16v7h-2M6 14h12v7H6z",
  chat:"M21 12a8 8 0 0 1-11.8 7L4 20l1.1-4.6A8 8 0 1 1 21 12z",
  phone:"M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2",
  trash:"M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3",
  edit:"M4 20h4L19 9l-4-4L4 16zM14 6l4 4",
  x:"M6 6l12 12M18 6L6 18",
  image:"M4 5h16v14H4zM4 16l5-5 4 4 3-3 4 4M15 9h.01",
  coin:"M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v10M15 9.5c-.5-1-1.6-1.5-3-1.5-1.7 0-3 .8-3 2s1.3 1.7 3 2 3 .8 3 2-1.3 2-3 2c-1.4 0-2.5-.5-3-1.5",
  down:"M12 4v12M6 10l6 6 6-6M5 20h14",
  up:"M12 20V8M6 14l6-6 6 6M5 4h14",
  logout:"M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 17l-5-5 5-5M5 12h11",
  lock:"M6 11h12v10H6zM8 11V7a4 4 0 0 1 8 0v4",
  list:"M9 6h12M9 12h12M9 18h12M4 6h.01M4 12h.01M4 18h.01"
};
const ic = (n, s) => `<svg class="ic" viewBox="0 0 24 24" ${s ? `style="width:${s}px;height:${s}px"` : ""} aria-hidden="true"><path d="${P[n]}"/></svg>`;
const LOGO = `<svg class="logo" viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" rx="11" fill="#1E4FD8"/><path d="M8 19 20 9l12 10v11.5a1.5 1.5 0 0 1-1.5 1.5h-21A1.5 1.5 0 0 1 8 30.5z" fill="none" stroke="#fff" stroke-width="2.4" stroke-linejoin="round"/><path d="M21.8 14.5 15.5 24h4.6l-1.6 6.5 6.6-10h-4.7z" fill="#F4B400"/></svg>`;

/* ---------- state & storage ---------- */
const COLS = ["products", "customers", "sales", "cash", "users", "log"];
const S = { products:[], customers:[], sales:[], cash:[], users:[], log:[], settings:{ storeName:"معرض البيت الجديد", phone:"", address:"", markup:25, months:10, footer:"شكراً لتعاملكم معنا" } };
const T0 = today();
const ui = {
  lq:"", luser:"", lkind:"", lmonth:T0.slice(0,7),
  view:"dashboard", pq:"", pcat:"", posq:"", sq:"", smonth:T0.slice(0,7), stype:"",
  iq:"", imonth:T0.slice(0,7), itab:"month", cq:"", cfilter:"", tmonth:T0.slice(0,7),
  sseller:"", cart:[], saleType:"cash", saleCustomer:"", discount:0, down:0, months:0, startDate:addMonths(T0, 1)
};
let DB = null, MODE = "local", ready = false, readOnly = false, busy = false, editImg = "";
const LS_KEY = "bayt-jadid-store-v1";

function lsLoad(){
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return;
    const d = JSON.parse(raw);
    COLS.forEach(k => { if (Array.isArray(d[k])) S[k] = d[k]; });
    if (d.settings) Object.assign(S.settings, d.settings);
  } catch (e) {}
}
function lsSave(){
  try { localStorage.setItem(LS_KEY, JSON.stringify(S)); }
  catch (e) { toast("تعذّر الحفظ: مساحة المتصفح ممتلئة. صغّر الصور أو احذف منتجات قديمة.", true); }
}
const clean = o => JSON.parse(JSON.stringify(o));
function dbErr(e){
  const c = e && e.code;
  if (c === "invalid_argument" || c === "not_granted") { readOnly = true; toast("ليس لديك صلاحية التعديل على هذه البيانات", true); }
  else if (c === "quota_exceeded") toast("امتلأت مساحة التخزين. احذف بيانات قديمة أو صوراً كبيرة.", true);
  else toast("تعذّر الحفظ، حاول مرة أخرى", true);
}
async function put(col, obj){
  if (readOnly) { toast("الصفحة للقراءة فقط", true); throw new Error("ro"); }
  const i = S[col].findIndex(x => x.id === obj.id);
  if (i >= 0) S[col][i] = obj; else S[col].push(obj);
  if (MODE === "cloud") {
    const data = clean(obj); delete data.id;
    try { await DB.collection(col).doc(obj.id).set(data); }
    catch (e) { dbErr(e); throw e; }
  } else lsSave();
}
async function del(col, id){
  if (readOnly) { toast("الصفحة للقراءة فقط", true); throw new Error("ro"); }
  S[col] = S[col].filter(x => x.id !== id);
  if (MODE === "cloud") { try { await DB.collection(col).doc(id).delete(); } catch (e) { dbErr(e); throw e; } }
  else lsSave();
}
async function saveSettings(){
  if (MODE === "cloud") { try { await DB.doc("meta/settings").set(clean(S.settings)); } catch (e) { dbErr(e); throw e; } }
  else lsSave();
}

/* ---------- derived ---------- */
const prod = id => S.products.find(p => p.id === id);
const cust = id => S.customers.find(c => c.id === id);
const saleById = id => S.sales.find(s => s.id === id);
const months = () => Math.max(1, Math.round(num(S.settings.months)) || 10);
const live = () => S.sales.filter(s => s.status !== "cancelled");
function saleCollected(s){
  if (s.status === "cancelled") return 0;
  if (s.type === "cash") return s.total || 0;
  return (s.down || 0) + sum(s.schedule || [], x => x.paid || 0);
}
function saleRemaining(s){
  if (s.type !== "inst" || s.status === "cancelled") return 0;
  return sum(s.schedule || [], x => Math.max(0, x.amount - (x.paid || 0)));
}
function saleProfit(s){ return sum(s.items || [], it => (it.price - (it.cost || 0)) * it.qty) - (s.discount || 0); }
function instStatus(x){
  const pd = x.paid || 0;
  if (pd >= x.amount) return "paid";
  if (x.due < today()) return pd > 0 ? "late partial" : "late";
  return pd > 0 ? "partial" : "due";
}
function instRows(){
  const rows = [];
  S.sales.forEach(s => { if (s.type === "inst" && s.status !== "cancelled") (s.schedule || []).forEach((x, i) => rows.push({ s, x, i })); });
  return rows;
}
const unpaid = r => (r.x.paid || 0) < r.x.amount;
const left = r => Math.max(0, r.x.amount - (r.x.paid || 0));
function balance(){ return sum(S.cash, e => e.type === "in" ? e.amount : -e.amount); }
function lateCount(){ const T = today(); return instRows().filter(r => r.x.due < T && unpaid(r)).length; }
function buildSchedule(total, n, start){
  const out = [];
  if (total <= 0) return out;
  const base = Math.floor(total / n / 250) * 250 || Math.floor(total / n);
  for (let i = 0; i < n; i++) {
    const amt = i === n - 1 ? total - base * (n - 1) : base;
    out.push({ n:i + 1, due:addMonths(start, i), amount:amt, paid:0, paidDate:"" });
  }
  return out;
}
function nextNo(){ return Math.max(1000, ...S.sales.map(s => s.no || 0)) + 1; }

/* ---------- users & permissions ---------- */
function sha256(ascii){function rr(v,a){return(v>>>a)|(v<<(32-a));}var mp=Math.pow,mw=mp(2,32),i,j,result="",words=[],bl=ascii.length*8,hash=sha256.h=sha256.h||[],k=sha256.k=sha256.k||[],pc=k.length,comp={};for(var c=2;pc<64;c++){if(!comp[c]){for(i=0;i<313;i+=c)comp[i]=c;hash[pc]=(mp(c,.5)*mw)|0;k[pc++]=(mp(c,1/3)*mw)|0;}}ascii+="\x80";while(ascii.length%64-56)ascii+="\x00";for(i=0;i<ascii.length;i++){j=ascii.charCodeAt(i);if(j>>8)return "";words[i>>2]|=j<<((3-i)%4)*8;}words[words.length]=((bl/mw)|0);words[words.length]=bl;for(j=0;j<words.length;){var w=words.slice(j,j+=16),old=hash;hash=hash.slice(0,8);for(i=0;i<64;i++){var w15=w[i-15],w2=w[i-2],a=hash[0],e=hash[4];var t1=hash[7]+(rr(e,6)^rr(e,11)^rr(e,25))+((e&hash[5])^((~e)&hash[6]))+k[i]+(w[i]=(i<16)?w[i]:(w[i-16]+(rr(w15,7)^rr(w15,18)^(w15>>>3))+w[i-7]+(rr(w2,17)^rr(w2,19)^(w2>>>10)))|0);var t2=(rr(a,2)^rr(a,13)^rr(a,22))+((a&hash[1])^(a&hash[2])^(hash[1]&hash[2]));hash=[(t1+t2)|0].concat(hash);hash[4]=(hash[4]+t1)|0;}for(i=0;i<8;i++)hash[i]=(hash[i]+old[i])|0;}for(i=0;i<8;i++)for(j=3;j+1;j--){var b=(hash[i]>>(j*8))&255;result+=((b<16)?0:"")+b.toString(16);}return result;}
const hashPw = (salt, pw) => sha256(unescape(encodeURIComponent(salt + "|" + pw)));
const PERMS = [
  ["dashboard", "عرض الرئيسية والإحصائيات"],
  ["sell", "تسجيل المبيعات"],
  ["allsales", "رؤية مبيعات كل الموظفين"],
  ["products", "إضافة وتعديل المنتجات والكميات"],
  ["cost", "رؤية سعر الكلفة والأرباح"],
  ["collect", "تحصيل الأقساط"],
  ["customers", "تعديل وحذف العملاء"],
  ["cancel", "إلغاء الفواتير"],
  ["treasury", "الخزنة والمصاريف"],
  ["settings", "إعدادات المعرض والنسخ الاحتياطي"],
  ["log", "عرض سجل العمليات"]
];
const PRESETS = {
  "بائع": ["sell", "collect"],
  "محاسب": ["dashboard", "allsales", "collect", "treasury", "cost", "log"],
  "محصّل أقساط": ["collect"],
  "مشرف": ["dashboard", "sell", "allsales", "products", "cost", "collect", "customers", "cancel", "treasury"]
};
let ME = null, loginFails = 0, lockUntil = 0;
const SESS = "bayt-session";
const can = p => !!ME && (ME.admin || (ME.perms || []).includes(p));
const roleName = u => u.admin ? "مدير" : (Object.entries(PRESETS).find(([, v]) => v.length === (u.perms || []).length && v.every(x => u.perms.includes(x))) || ["صلاحيات مخصصة"])[0];
function syncMe(){
  if (ME) { const u = S.users.find(x => x.id === ME.id); ME = u && u.active !== false ? u : null; if (!ME) clearSession(); return; }
  let id = null;
  try { id = sessionStorage.getItem(SESS) || localStorage.getItem(SESS); } catch (e) {}
  if (id) { const u = S.users.find(x => x.id === id && x.active !== false); if (u) ME = u; }
}
function setSession(id, remember){ try { sessionStorage.setItem(SESS, id); if (remember) localStorage.setItem(SESS, id); } catch (e) {} }
function clearSession(){ try { sessionStorage.removeItem(SESS); localStorage.removeItem(SESS); } catch (e) {} }
const by = () => ME ? { by:ME.id, byName:ME.name } : {};
const LOGK = { auth:"دخول وخروج", sale:"مبيعات", collect:"استحصال", product:"منتجات", customer:"عملاء", cash:"خزنة", user:"مستخدمون", notify:"مطالبات", settings:"إعدادات" };
async function logAct(kind, action, details, ref){
  if (!ME || readOnly) return;
  const e = { id:uid(), ts:Date.now(), date:today(), kind, action, details:details || "", ref:ref || "", ...by() };
  try { await put("log", e); } catch (err) {}
}
const VIS = {
  dashboard:() => can("dashboard"), pos:() => can("sell"), products:() => true,
  sales:() => can("sell") || can("allsales") || can("cancel"), installments:() => can("collect") || can("dashboard"),
  customers:() => can("sell") || can("collect") || can("customers"), treasury:() => can("treasury"),
  users:() => !!(ME && ME.admin), log:() => can("log"), settings:() => true
};
const BN = [["dashboard", "الرئيسية", "home"], ["products", "المنتجات", "box"], ["pos", "بيع", "pos"], ["installments", "الاستحصال", "cal"]];
const primaryKeys = () => BN.filter(([k]) => VIS[k]()).map(([k]) => k);
function firstView(){ return ["dashboard", "pos", "installments", "products"].find(k => VIS[k]()) || "products"; }
const randCode = n => { const a = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; let s = ""; const r = new Uint32Array(n); (window.crypto || {}).getRandomValues ? crypto.getRandomValues(r) : r.forEach((_, i) => r[i] = Math.random() * 1e9); r.forEach(x => s += a[x % a.length]); return s; };

function vAuth(){
  const st = S.settings;
  if (!S.users.length) return `<div class="auth-wrap"><div class="auth-card">${LOGO}
    <div><h1>${esc(st.storeName)}</h1><p class="muted" style="margin-top:6px">أنشئ حساب المدير. للمدير كل الصلاحيات، ومنه تضيف الموظفين وتحدد صلاحياتهم.</p></div>
    <form id="f-setup">
      <label class="field"><span>اسمك</span><input id="su-name" name="name" required autocomplete="name"></label>
      <label class="field"><span>اسم المستخدم</span><input name="username" required autocomplete="username" dir="ltr" placeholder="admin"></label>
      <label class="field"><span>كلمة المرور</span><input name="password" type="password" required minlength="6" autocomplete="new-password"></label>
      <label class="field"><span>تأكيد كلمة المرور</span><input name="password2" type="password" required autocomplete="new-password"></label>
      <button class="btn primary lg" type="submit">إنشاء الحساب والدخول</button>
    </form></div></div>`;
  return `<div class="auth-wrap"><div class="auth-card">${LOGO}
    <div><h1>${esc(st.storeName)}</h1><p class="muted" style="margin-top:6px">سجّل الدخول للمتابعة</p></div>
    <form id="f-login">
      <label class="field"><span>اسم المستخدم</span><input id="li-user" name="username" required autocomplete="username" dir="ltr"></label>
      <label class="field"><span>كلمة المرور</span><input name="password" type="password" required autocomplete="current-password"></label>
      <label class="check"><input type="checkbox" name="remember"> تذكّرني على هذا الجهاز</label>
      <button class="btn primary lg" type="submit">دخول</button>
    </form>
    <button class="linkbtn" data-act="recover">نسيت كلمة مرور المدير؟</button></div></div>`;
}
async function doSetup(f){
  const v = Object.fromEntries(new FormData(f));
  if (!v.name.trim() || !v.username.trim()) return toast("أكمل الاسم واسم المستخدم", true);
  if (v.password.length < 6) return toast("كلمة المرور 6 أحرف على الأقل", true);
  if (v.password !== v.password2) return toast("كلمتا المرور غير متطابقتين", true);
  const salt = randCode(12), code = randCode(4) + "-" + randCode(4) + "-" + randCode(4);
  const u = { id:uid(), name:v.name.trim(), username:v.username.trim().toLowerCase(), salt, hash:hashPw(salt, v.password), admin:true, perms:[], active:true, createdAt:Date.now(), rsalt:salt + "r", rhash:hashPw(salt + "r", code) };
  try { await put("users", u); } catch (e) { return; }
  ME = u; setSession(u.id, false); ui.view = firstView(); render(); logAct("user", "إنشاء حساب المدير", u.name);
  openModal(`${head("رمز الاسترجاع")}<div class="sheet-body" style="display:flex;flex-direction:column;gap:14px">
    <p>احتفظ بهذا الرمز في مكان آمن. ستحتاجه إذا نسيت كلمة مرور المدير. لن يظهر مرة أخرى.</p>
    <div class="code">${code}</div></div>
    <div class="sheet-foot"><span class="grow"></span><button class="btn primary" data-act="closeModal">احتفظت بالرمز</button></div>`);
}
function doLogin(f){
  const v = Object.fromEntries(new FormData(f));
  if (Date.now() < lockUntil) return toast(`محاولات كثيرة، انتظر ${Math.ceil((lockUntil - Date.now()) / 1000)} ثانية`, true);
  const u = S.users.find(x => x.username === v.username.trim().toLowerCase());
  if (!u || u.hash !== hashPw(u.salt, v.password)) {
    loginFails++; if (loginFails >= 5) { lockUntil = Date.now() + 30000; loginFails = 0; }
    return toast("اسم المستخدم أو كلمة المرور غير صحيحة", true);
  }
  if (u.active === false) return toast("هذا الحساب موقوف. راجع المدير", true);
  loginFails = 0; ME = u; setSession(u.id, !!v.remember); ui.view = firstView(); render(); toast(`أهلاً ${u.name}`); logAct("auth", "تسجيل دخول", "");
}
function recoverModal(){
  openModal(`${head("استرجاع حساب المدير")}<form id="f-recover" class="sheet-body"><div class="fgrid">
    <label class="field span2"><span>اسم مستخدم المدير</span><input name="username" required dir="ltr"></label>
    <label class="field span2"><span>رمز الاسترجاع</span><input name="code" required dir="ltr" placeholder="XXXX-XXXX-XXXX"></label>
    <label class="field span2"><span>كلمة المرور الجديدة</span><input name="password" type="password" required minlength="6"></label></div></form>
    <div class="sheet-foot"><span class="grow"></span><button class="btn" data-act="closeModal">إلغاء</button><button class="btn primary" type="submit" form="f-recover">تغيير كلمة المرور</button></div>`);
}
async function doRecover(f){
  const v = Object.fromEntries(new FormData(f));
  if (Date.now() < lockUntil) return toast("محاولات كثيرة، انتظر قليلاً", true);
  const u = S.users.find(x => x.admin && x.username === v.username.trim().toLowerCase());
  if (!u || !u.rhash || u.rhash !== hashPw(u.rsalt, v.code.trim().toUpperCase())) { loginFails++; if (loginFails >= 5) { lockUntil = Date.now() + 30000; loginFails = 0; } return toast("البيانات غير صحيحة", true); }
  if (v.password.length < 6) return toast("كلمة المرور 6 أحرف على الأقل", true);
  const salt = randCode(12);
  try { await put("users", { ...u, salt, hash:hashPw(salt, v.password), active:true }); } catch (e) { return; }
  closeModal(); toast("تم تغيير كلمة المرور، سجّل الدخول الآن");
}
function vUsers(){
  const list = [...S.users].sort((a, b) => (b.admin - a.admin) || a.name.localeCompare(b.name, "ar"));
  return `<header class="vhead"><div><h1>المستخدمون</h1><p class="muted">حسابات الموظفين وصلاحياتهم</p></div>
    <button class="btn primary" data-act="newUser">${ic("plus")} إضافة مستخدم</button></header>
  <div class="list"><div class="lrow users-r lhead"><span>الاسم</span><span>الدور</span><span>الصلاحيات</span><span>الحالة</span></div>
  ${list.map(u => `<button class="lrow users-r" data-act="editUser" data-id="${u.id}">
    <span class="t row"><span class="av">${esc((u.name || "?").trim().charAt(0))}</span><span><b>${esc(u.name)}${u.id === ME.id ? ` <small class="muted">(أنت)</small>` : ""}</b><small dir="ltr" style="display:block;text-align:end">${esc(u.username)}</small></span></span>
    <span class="hide-m">${u.admin ? `<span class="badge brand">مدير</span>` : esc(roleName(u))}</span>
    <span class="hide-m"><small class="muted">${u.admin ? "كل الصلاحيات" : (u.perms || []).map(p => (PERMS.find(x => x[0] === p) || ["", p])[1]).join("، ") || "لا شيء"}</small></span>
    <span>${u.active === false ? `<span class="badge bad">موقوف</span>` : `<span class="badge ok">فعّال</span>`}</span></button>`).join("")}</div>
  <p class="hint" style="margin-top:12px">يُسجَّل اسم المستخدم على كل فاتورة وكل حركة في الخزنة.</p>`;
}
function userModal(u){
  const isNew = !u; u = u || { perms:["sell", "collect"], active:true };
  const self = !isNew && u.id === ME.id;
  openModal(`${head(isNew ? "إضافة مستخدم" : "تعديل المستخدم")}
  <form id="f-user" class="sheet-body" data-id="${u.id || ""}"><div class="fgrid">
    <label class="field"><span>الاسم</span><input name="name" required value="${esc(u.name || "")}"></label>
    <label class="field"><span>اسم المستخدم</span><input name="username" required dir="ltr" autocomplete="off" value="${esc(u.username || "")}"></label>
    <label class="field span2"><span>${isNew ? "كلمة المرور" : "كلمة مرور جديدة"}</span><input name="password" type="password" autocomplete="new-password" ${isNew ? "required" : ""} minlength="6" placeholder="${isNew ? "6 أحرف على الأقل" : "اتركها فارغة إذا لا تريد تغييرها"}"></label>
    <label class="check span2"><input type="checkbox" name="admin" id="u-admin" ${u.admin ? "checked" : ""} ${self ? "disabled" : ""}> مدير بكل الصلاحيات، ويستطيع إدارة المستخدمين</label>
    <label class="check span2"><input type="checkbox" name="active" ${u.active !== false ? "checked" : ""} ${self ? "disabled" : ""}> الحساب فعّال ويستطيع الدخول</label>
  </div>
  <div id="permbox" class="${u.admin ? "off" : ""}" style="margin-top:18px">
    <div class="row" style="flex-wrap:wrap;margin-bottom:10px"><b style="margin-inline-end:6px">جاهز:</b>${Object.keys(PRESETS).map(k => `<button type="button" class="btn sm" data-act="preset" data-v="${k}">${k}</button>`).join("")}</div>
    <div class="perms">${PERMS.map(([k, l]) => `<label class="check"><input type="checkbox" name="perm" value="${k}" ${(u.perms || []).includes(k) ? "checked" : ""}> ${l}</label>`).join("")}</div>
  </div></form>
  <div class="sheet-foot">${!isNew && !self ? `<button class="btn ghost danger" data-act="delUser" data-id="${u.id}">${ic("trash", 18)} حذف</button>` : ""}<span class="grow"></span><button class="btn" data-act="closeModal">إلغاء</button><button class="btn primary" type="submit" form="f-user">حفظ</button></div>`, true);
}
async function saveUser(f){
  const fd = new FormData(f), v = Object.fromEntries(fd);
  const id = f.dataset.id, old = S.users.find(x => x.id === id);
  const self = old && old.id === ME.id;
  const username = (v.username || "").trim().toLowerCase();
  if (!v.name.trim() || !username) return toast("أكمل الاسم واسم المستخدم", true);
  if (S.users.some(x => x.username === username && x.id !== id)) return toast("اسم المستخدم مستخدم من قبل", true);
  if ((!old || v.password) && (v.password || "").length < 6) return toast("كلمة المرور 6 أحرف على الأقل", true);
  const admin = self ? true : !!v.admin, active = self ? true : !!v.active;
  if (old && old.admin && (!admin || !active) && S.users.filter(x => x.admin && x.active !== false).length <= 1) return toast("يجب أن يبقى مدير فعّال واحد على الأقل", true);
  const u = { ...(old || { id:uid(), createdAt:Date.now() }), name:v.name.trim(), username, admin, active, perms:admin ? [] : fd.getAll("perm") };
  if (v.password) { u.salt = randCode(12); u.hash = hashPw(u.salt, v.password); }
  if (!old) { u.createdBy = ME.id; u.createdByName = ME.name; }
  try { await put("users", u); } catch (e) { return; }
  logAct("user", old ? "تعديل مستخدم" : "إضافة مستخدم", `${u.name} (${u.username})، ${u.admin ? "مدير" : roleName(u)}${!u.active ? "، موقوف" : ""}${old && v.password ? "، تغيير كلمة المرور" : ""}`);
  closeModal(); toast("تم حفظ المستخدم"); render();
}
function passModal(){
  openModal(`${head("تغيير كلمة المرور")}<form id="f-pass" class="sheet-body"><div class="fgrid">
    <label class="field span2"><span>كلمة المرور الحالية</span><input name="cur" type="password" required autocomplete="current-password"></label>
    <label class="field"><span>الجديدة</span><input name="p1" type="password" required minlength="6" autocomplete="new-password"></label>
    <label class="field"><span>تأكيد الجديدة</span><input name="p2" type="password" required autocomplete="new-password"></label></div></form>
    <div class="sheet-foot"><span class="grow"></span><button class="btn" data-act="closeModal">إلغاء</button><button class="btn primary" type="submit" form="f-pass">حفظ</button></div>`);
}
async function savePass(f){
  const v = Object.fromEntries(new FormData(f));
  if (ME.hash !== hashPw(ME.salt, v.cur)) return toast("كلمة المرور الحالية غير صحيحة", true);
  if (v.p1.length < 6) return toast("كلمة المرور 6 أحرف على الأقل", true);
  if (v.p1 !== v.p2) return toast("كلمتا المرور غير متطابقتين", true);
  const salt = randCode(12);
  try { await put("users", { ...ME, salt, hash:hashPw(salt, v.p1) }); } catch (e) { return; }
  logAct("user", "تغيير كلمة المرور", ME.name); closeModal(); toast("تم تغيير كلمة المرور");
}
function newRecoveryCode(){
  const code = randCode(4) + "-" + randCode(4) + "-" + randCode(4), rs = randCode(12);
  put("users", { ...ME, rsalt:rs, rhash:hashPw(rs, code) }).then(() => openModal(`${head("رمز استرجاع جديد")}<div class="sheet-body" style="display:flex;flex-direction:column;gap:14px"><p>الرمز القديم لم يعد يعمل. احتفظ بهذا الرمز في مكان آمن.</p><div class="code">${code}</div></div><div class="sheet-foot"><span class="grow"></span><button class="btn primary" data-act="closeModal">تم</button></div>`)).catch(() => {});
}

/* ---------- small components ---------- */
function ebar(p){
  const q = p.qty || 0, mn = p.min ?? 2;
  const lvl = q <= 0 ? 0 : q <= mn ? 1 : q <= mn * 2 ? 3 : q <= mn * 4 ? 4 : 5;
  const on = q <= 0 ? 0 : Math.min(6, lvl + 1);
  let h = ""; for (let i = 0; i < 6; i++) h += `<i class="${i < on ? "on" : ""}"></i>`;
  const lab = q <= 0 ? "نفدت الكمية" : q <= mn ? "كمية منخفضة" : "متوفر";
  return `<span class="ebar l${lvl === 3 ? 3 : lvl}" title="${lab}">${h}</span>`;
}
function strip(s, lg){
  const sc = s.schedule || [];
  return `<div class="strip${lg ? " lg" : ""}" style="--n:${sc.length || 1}" title="الأقساط المدفوعة ${sc.filter(x => (x.paid||0) >= x.amount).length} من ${sc.length}">${sc.map(x => {
    const st = instStatus(x); const p = Math.round(Math.min(1, (x.paid || 0) / x.amount) * 100);
    return `<i class="${st}" style="--p:${p}"></i>`;
  }).join("")}</div>`;
}
const stBadge = st => st === "paid" ? `<span class="badge ok">مدفوع</span>` : st.startsWith("late") ? `<span class="badge bad">متأخر</span>` : st === "partial" ? `<span class="badge warn">مدفوع جزئياً</span>` : `<span class="badge">قادم</span>`;
const typeBadge = s => s.type === "inst" ? `<span class="badge warn">أقساط</span>` : `<span class="badge brand">نقد</span>`;
function saleStatusBadge(s){
  if (s.status === "cancelled") return `<span class="badge bad">ملغاة</span>`;
  if (s.type === "cash") return `<span class="badge ok">مسددة</span>`;
  if (saleRemaining(s) <= 0) return `<span class="badge ok">مكتملة</span>`;
  return (s.schedule || []).some(x => instStatus(x).startsWith("late")) ? `<span class="badge bad">عليها متأخرات</span>` : `<span class="badge">جارية</span>`;
}
function relDue(due){
  const d = dayDiff(due, today());
  if (d === 0) return "اليوم";
  if (d < 0) return `متأخر ${-d} يوم`;
  if (d === 1) return "غداً";
  return `بعد ${d} يوم`;
}
const imgOr = (src, s) => src ? `<img src="${src}" alt="" loading="lazy">` : ic("image", s || 22);
function empty(title, text, btn){ return `<div class="empty"><h3>${title}</h3><p>${text}</p>${btn || ""}</div>`; }
function waLink(c, msg){
  if (!c || !c.phone) return "";
  return `<a class="icon-btn wa" target="_blank" rel="noopener" title="تذكير عبر واتساب" href="https://wa.me/${waNumber(c.phone)}?text=${encodeURIComponent(msg)}">${ic("chat", 18)}</a><a class="icon-btn" title="اتصال" href="tel:${esc(c.phone)}">${ic("phone", 18)}</a>`;
}
function storeSign(){
  const st = S.settings; const lines = [];
  if (st.address) lines.push(`📍 العنوان: ${st.address}`);
  if (st.phone) lines.push(`📞 للاستفسار: ${st.phone}`);
  return lines.join("\n");
}
function demandMsg(s, x){
  const T = today(), st = S.settings;
  const lateList = (s.schedule || []).filter(y => y.due < T && (y.paid || 0) < y.amount);
  const isLate = x.due < T;
  const amt = x.amount - (x.paid || 0);
  const lateTotal = sum(lateList, y => y.amount - (y.paid || 0));
  const days = -dayDiff(x.due, T);
  const L = [];
  L.push("السلام عليكم ورحمة الله وبركاته");
  L.push(`السيد/ة *${s.customerName}* المحترم/ة،`);
  L.push("");
  L.push(`تحية طيبة من *${st.storeName}*.`);
  L.push(isLate ? "نود إعلامكم بأن موعد تسديد القسط الشهري المستحق عليكم قد حان وتجاوز تاريخ الاستحقاق، ولم يتم تسديده حتى الآن."
                : (x.due === T ? "نود تذكيركم بأن اليوم هو موعد تسديد القسط الشهري المستحق عليكم." : "نود تذكيركم بقرب موعد تسديد القسط الشهري المستحق عليكم."));
  L.push("");
  L.push("*تفاصيل القسط:*");
  L.push(`▫️ رقم الفاتورة: ${s.no}`);
  L.push(`▫️ رقم القسط: ${x.n} من ${s.schedule.length}`);
  L.push(`▫️ تاريخ الاستحقاق: ${fmtDate(x.due)}`);
  L.push(`▫️ المبلغ المطلوب: *${money(amt)}*`);
  if (isLate) L.push(`▫️ مدة التأخير: ${days} يوم`);
  if (lateList.length > 1) L.push(`▫️ مجموع المتأخرات (${lateList.length} أقساط): *${money(lateTotal)}*`);
  L.push(`▫️ المتبقي الكلي من الفاتورة: ${money(saleRemaining(s))}`);
  L.push("");
  L.push(isLate ? "نرجو منكم التفضل بمراجعة المعرض وتسديد المبلغ المستحق في أقرب وقت ممكن، حفاظاً على انتظام حسابكم لدينا."
                : "نرجو منكم التفضل بمراجعة المعرض وتسديد القسط في موعده، حفاظاً على انتظام حسابكم لدينا.");
  L.push("وفي حال تم التسديد مسبقاً، يُرجى تجاهل هذه الرسالة.");
  const sign = storeSign(); if (sign) { L.push(""); L.push(sign); }
  L.push("");
  L.push("شاكرين حسن تعاونكم،");
  L.push(`إدارة ${st.storeName}`);
  return L.join("\n");
}
function custDemandMsg(c){
  const T = today(), st = S.settings;
  const rows = [];
  S.sales.filter(s => s.customerId === c.id && s.type === "inst" && s.status !== "cancelled").forEach(s => s.schedule.forEach(x => { if (x.due < T && (x.paid || 0) < x.amount) rows.push({ s, x }); }));
  const total = sum(rows, r => r.x.amount - (r.x.paid || 0));
  const L = ["السلام عليكم ورحمة الله وبركاته", `السيد/ة *${c.name}* المحترم/ة،`, "", `تحية طيبة من *${st.storeName}*.`,
    "نود إعلامكم بوجود أقساط شهرية مستحقة عليكم تجاوزت موعد التسديد، وتفاصيلها كالآتي:", ""];
  rows.sort((a, b) => a.x.due.localeCompare(b.x.due)).forEach(r => L.push(`▫️ فاتورة ${r.s.no}، القسط ${r.x.n}، استحقاق ${fmtDate(r.x.due)}: ${money(r.x.amount - (r.x.paid || 0))}`));
  L.push("", `*المجموع المطلوب: ${money(total)}*`, "", "نرجو منكم التفضل بمراجعة المعرض وتسديد المبلغ في أقرب وقت ممكن، حفاظاً على انتظام حسابكم لدينا.", "وفي حال تم التسديد مسبقاً، يُرجى تجاهل هذه الرسالة.");
  const sign = storeSign(); if (sign) L.push("", sign);
  L.push("", "شاكرين حسن تعاونكم،", `إدارة ${st.storeName}`);
  return { text:L.join("\n"), total, n:rows.length };
}
const waHref = (phone, msg) => `https://wa.me/${waNumber(phone)}?text=${encodeURIComponent(msg)}`;
function waBtn(phone, msg, label, logInfo, small){
  if (!phone) return `<span class="badge" title="لا يوجد رقم هاتف">بدون رقم</span>`;
  return `<a class="btn ${small ? "sm " : ""}wa" target="_blank" rel="noopener" href="${waHref(phone, msg)}" data-walog="${esc(logInfo)}">${ic("chat", 18)} ${label}</a>`;
}
function custDemand(c){
  if (!c || !c.phone) return "";
  const d = custDemandMsg(c);
  const call = `<a class="icon-btn" title="اتصال" href="tel:${esc(c.phone)}">${ic("phone", 18)}</a>`;
  return (d.n ? waBtn(c.phone, d.text, "مطالبة بالمتأخرات", `${c.name}، ${d.n} أقساط متأخرة بمجموع ${money(d.total)}`) : "") + call;
}
function reminderMsg(s, x){
  return `مرحباً ${s.customerName}، نذكّركم بموعد القسط رقم ${x.n} من فاتورة رقم ${s.no} بمبلغ ${money(x.amount - (x.paid || 0))} المستحق بتاريخ ${fmtDate(x.due)}. ${S.settings.storeName}`;
}

/* ---------- navigation ---------- */
const NAV = [
  ["dashboard", "الرئيسية", "home"], ["pos", "بيع جديد", "pos"], ["products", "المنتجات", "box"],
  ["sales", "المبيعات", "receipt"], ["installments", "الاستحصال", "cal"], ["customers", "العملاء", "users"],
  ["treasury", "الخزنة", "safe"], ["users", "المستخدمون", "users"], ["log", "سجل العمليات", "list"], ["settings", "الإعدادات", "gear"]
];
function renderChrome(){
  const lc = ready ? lateCount() : 0;
  $("#sidenav").innerHTML = `<div class="brand">${LOGO}<div><b>${esc(S.settings.storeName)}</b><small>كهربائيات وأجهزة منزلية</small></div></div>
    ${NAV.filter(([k]) => VIS[k]()).map(([k, l, i]) => `<button class="nav ${ui.view === k ? "on" : ""}" data-act="nav" data-v="${k}">${ic(i)}<span>${l}</span>${k === "installments" && lc ? `<span class="count">${lc}</span>` : ""}</button>`).join("")}
    <div class="side-foot"><span class="dot ${MODE === "cloud" ? "" : "local"}"></span>${MODE === "cloud" ? "البيانات محفوظة سحابياً ومتزامنة بين أجهزتك" : "البيانات محفوظة على هذا الجهاز فقط"}</div>
    ${ME ? `<div class="me"><span class="av">${esc(ME.name.trim().charAt(0))}</span><span class="t"><b>${esc(ME.name)}</b><small>${ME.admin ? "مدير" : esc(roleName(ME))}</small></span><button data-act="logout" title="تسجيل الخروج" aria-label="تسجيل الخروج">${ic("logout")}</button></div>` : ""}`;
  $("#topbar").innerHTML = `${LOGO}<b>${esc(S.settings.storeName)}</b>${ME ? `<span class="who">${esc(ME.name)}</span><button class="out" data-act="logout" aria-label="تسجيل الخروج">${ic("logout")}</button>` : ""}`;
  const bn = BN.filter(([k]) => VIS[k]());
  bn.push(["more", "المزيد", "more"]);
  const moreOn = !bn.some(([k]) => k === ui.view);
  $("#bnav").style.gridTemplateColumns = `repeat(${bn.length},1fr)`;
  $("#bnav").innerHTML = bn.map(([k, l, i]) => `<button class="${k === "pos" ? "sell " : ""}${ui.view === k || (k === "more" && moreOn) ? "on" : ""}" data-act="${k === "more" ? "more" : "nav"}" data-v="${k}">${ic(i)}<span>${l}</span>${k === "installments" && lc ? `<span class="count">${lc}</span>` : ""}</button>`).join("");
}

/* ---------- views ---------- */
function vDashboard(){
  const T = today(), M = T.slice(0, 7);
  const L = live();
  const mS = L.filter(s => s.date.startsWith(M)), dS = L.filter(s => s.date === T);
  const rows = instRows();
  const thisM = rows.filter(r => r.x.due.startsWith(M));
  const expM = sum(thisM, r => r.x.amount), colM = sum(thisM, r => Math.min(r.x.paid || 0, r.x.amount));
  const arrears = sum(rows.filter(r => r.x.due < M + "-01"), left);
  const late = rows.filter(r => r.x.due < T && unpaid(r));
  const debt = sum(S.sales, saleRemaining);
  const stockCost = sum(S.products, p => (p.qty || 0) * (p.cost || 0)), stockCash = sum(S.products, p => (p.qty || 0) * (p.cash || 0));
  const week = rows.filter(r => r.x.due >= T && r.x.due <= addDays(T, 7) && unpaid(r)).sort((a, b) => a.x.due.localeCompare(b.x.due));
  const low = S.products.filter(p => (p.qty || 0) <= (p.min ?? 2)).sort((a, b) => a.qty - b.qty);
  const mIn = S.cash.filter(e => e.date.startsWith(M));
  const pct = expM ? Math.round(colM / expM * 100) : 0;

  const mKeys = []; for (let i = 5; i >= 0; i--) mKeys.push(addMonths(M + "-01", -i).slice(0, 7));
  const data = mKeys.map(k => {
    const ss = L.filter(s => s.date.startsWith(k));
    return { k, c:sum(ss.filter(s => s.type === "cash"), s => s.total), i:sum(ss.filter(s => s.type === "inst"), s => s.total),
      col:sum(S.cash.filter(e => e.type === "in" && e.date.startsWith(k) && e.saleId), e => e.amount) };
  });
  const mx = Math.max(1, ...data.map(d => Math.max(d.c, d.i, d.col)));
  const top = {}; L.forEach(s => s.items.forEach(it => { top[it.name] = (top[it.name] || 0) + it.qty; }));
  const topL = Object.entries(top).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const dateStr = new Date().toLocaleDateString(LOC, { weekday:"long", year:"numeric", month:"long", day:"numeric" });

  return `
  <section class="hero">
    <div><h1>${esc(S.settings.storeName)}</h1><p class="muted">${dateStr}</p></div>
    <div class="hero-actions">
      ${can("sell") ? `<button class="btn volt" data-act="nav" data-v="pos">${ic("pos")} بيع جديد</button>` : ""}
      ${can("products") ? `<button class="btn" data-act="newProduct">${ic("plus")} منتج</button>` : ""}
      ${can("collect") ? `<button class="btn" data-act="nav" data-v="installments">${ic("coin")} تحصيل قسط</button>` : ""}
    </div>
  </section>
  <section class="kpis">
    <article class="kpi safe"><span class="k">رصيد الخزنة الحالي</span><span class="v num">${money(balance())}</span>
      <span class="s">وارد هذا الشهر ${money(sum(mIn.filter(e => e.type === "in"), e => e.amount))}، صادر ${money(sum(mIn.filter(e => e.type === "out"), e => e.amount))}</span></article>
    <article class="kpi expect"><span class="k">الوارد المتوقع من الأقساط في ${monthName(M)}</span>
      <span class="v num">${money(expM)}</span>
      <div class="prog" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><i style="width:${pct}%"></i></div>
      <span class="s">تم تحصيل ${money(colM)} (${pct}%)، المتبقي ${money(expM - colM)}${arrears ? `، ومتأخرات سابقة ${money(arrears)}` : ""}</span></article>
    <article class="kpi"><span class="k">مبيعات اليوم</span><span class="v num">${money(sum(dS, s => s.total))}</span><span class="s">${dS.length} فاتورة</span></article>
    <article class="kpi"><span class="k">مبيعات الشهر</span><span class="v num">${money(sum(mS, s => s.total))}</span><span class="s">نقد ${fmt(sum(mS.filter(s => s.type === "cash"), s => s.total))}، أقساط ${fmt(sum(mS.filter(s => s.type === "inst"), s => s.total))}</span></article>
    <article class="kpi late"><span class="k">أقساط متأخرة</span><span class="v num">${money(sum(late, left))}</span><span class="s">${late.length} قسط لدى ${new Set(late.map(r => r.s.customerId)).size} عميل</span></article>
    <article class="kpi"><span class="k">إجمالي ديون الأقساط</span><span class="v num">${money(debt)}</span><span class="s">${S.sales.filter(s => saleRemaining(s) > 0).length} فاتورة جارية</span></article>
    ${can("cost") ? `<article class="kpi"><span class="k">الربح التقديري للشهر</span><span class="v num">${money(sum(mS, saleProfit))}</span><span class="s">الفرق بين سعر البيع والكلفة</span></article>` : ""}
    <article class="kpi"><span class="k">قيمة المخزون</span><span class="v num">${money(stockCash)}</span><span class="s">${can("cost") ? `بسعر الكلفة ${money(stockCost)}` : `${fmt(sum(S.products, p => p.qty))} قطعة`}</span></article>
  </section>
  <section class="dgrid">
    <div class="panel">
      <div class="panel-h"><h2>آخر 6 أشهر</h2><div class="legend"><span><i style="background:var(--brand)"></i>بيع نقدي</span><span><i style="background:var(--volt)"></i>بيع أقساط</span><span><i style="background:var(--e1)"></i>تحصيلات</span></div></div>
      <div class="chart">${data.map(d => `<div class="col"><div class="bars">
        <span class="bar" style="height:${d.c / mx * 100}%" title="نقدي ${money(d.c)}"></span>
        <span class="bar i" style="height:${d.i / mx * 100}%" title="أقساط ${money(d.i)}"></span>
        <span class="bar c" style="height:${d.col / mx * 100}%" title="تحصيلات ${money(d.col)}"></span></div>
        <span class="lbl">${monthShort(d.k)}</span></div>`).join("")}</div>
    </div>
    <div class="panel">
      <div class="panel-h"><h2>أقساط متأخرة</h2>${late.length ? `<button class="btn sm ghost" data-act="goInst" data-v="late">عرض الكل</button>` : ""}</div>
      <div class="mini">${late.length ? late.sort((a, b) => a.x.due.localeCompare(b.x.due)).slice(0, 6).map(r => `
        <button class="mini-r" data-act="pay" data-id="${r.s.id}" data-i="${r.i}"><span class="t"><b>${esc(r.s.customerName)}</b><small>القسط ${r.x.n} من ${r.s.schedule.length}، ${relDue(r.x.due)}</small></span><span class="a" style="color:var(--bad)">${fmt(left(r))}</span></button>`).join("") : `<p class="empty-s">لا توجد أقساط متأخرة</p>`}</div>
    </div>
  </section>
  <section class="tri">
    <div class="panel"><div class="panel-h"><h2>مستحق خلال 7 أيام</h2></div><div class="mini">${week.length ? week.slice(0, 6).map(r => `
      <button class="mini-r" data-act="pay" data-id="${r.s.id}" data-i="${r.i}"><span class="t"><b>${esc(r.s.customerName)}</b><small>${relDue(r.x.due)}</small></span><span class="a">${fmt(left(r))}</span></button>`).join("") : `<p class="empty-s">لا أقساط مستحقة هذا الأسبوع</p>`}</div></div>
    <div class="panel"><div class="panel-h"><h2>مخزون منخفض</h2></div><div class="mini">${low.length ? low.slice(0, 6).map(p => `
      <button class="mini-r" data-act="editProduct" data-id="${p.id}"><span class="t"><b>${esc(p.name)}</b><small>${esc(p.cat || "")}</small></span>${ebar(p)}<span class="a">${p.qty}</span></button>`).join("") : `<p class="empty-s">كل المنتجات متوفرة بكميات جيدة</p>`}</div></div>
    <div class="panel"><div class="panel-h"><h2>الأكثر مبيعاً</h2></div><div class="mini">${topL.length ? topL.map(([n, q]) => `
      <div class="mini-r" style="cursor:default"><span class="t"><b>${esc(n)}</b></span><span class="a">${q} قطعة</span></div>`).join("") : `<p class="empty-s">ستظهر هنا بعد أول عملية بيع</p>`}</div></div>
  </section>
  ${S.users.length > 1 && can("allsales") ? `<section class="panel" style="margin-top:14px"><div class="panel-h"><h2>مبيعات الموظفين في ${monthName(M)}</h2></div><div class="mini">${S.users.map(u => { const us = mS.filter(s => s.by === u.id); const col = sum(S.cash.filter(e => e.by === u.id && e.type === "in" && e.cat === "قسط" && e.date.startsWith(M)), e => e.amount); return { u, n:us.length, t:sum(us, s => s.total), col }; }).sort((a, b) => b.t - a.t).map(x => `
    <div class="mini-r" style="cursor:default"><span class="av">${esc(x.u.name.charAt(0))}</span><span class="t"><b>${esc(x.u.name)}</b><small>${x.n} فاتورة، حصّل أقساطاً بقيمة ${fmt(x.col)}</small></span><span class="a">${money(x.t)}</span></div>`).join("")}</div></section>` : ""}`;
}

function vProducts(){
  const q = ui.pq.trim().toLowerCase();
  const list = S.products.filter(p => (!ui.pcat || p.cat === ui.pcat) && (!q || [p.name, p.brand, p.model, p.cat].join(" ").toLowerCase().includes(q)))
    .sort((a, b) => (a.name || "").localeCompare(b.name || "", "ar"));
  const cats = [...new Set(S.products.map(p => p.cat).filter(Boolean))];
  const n = months();
  return `
  <header class="vhead"><div><h1>المنتجات</h1><p class="muted">${S.products.length} منتج، ${fmt(sum(S.products, p => p.qty))} قطعة في المخزن</p></div>
    ${can("products") ? `<button class="btn primary" data-act="newProduct">${ic("plus")} إضافة منتج</button>` : ""}</header>
  ${S.products.length ? `<div class="toolbar">
    <label class="search">${ic("search")}<input id="pq" data-bind="pq" value="${esc(ui.pq)}" placeholder="ابحث بالاسم أو الماركة أو الموديل" aria-label="بحث"></label>
    <select id="pcat" data-bind="pcat" aria-label="القسم"><option value="">كل الأقسام</option>${cats.map(c => `<option ${c === ui.pcat ? "selected" : ""}>${esc(c)}</option>`).join("")}</select></div>` : ""}
  ${list.length ? `<div class="pgrid">${list.map(p => `
    <button class="pcard" data-act="editProduct" data-id="${p.id}">
      <span class="pimg">${imgOr(p.img, 34)}</span>
      <span class="pbody">
        <span class="pmeta">${esc(p.cat || "بدون قسم")}${p.brand ? ` / ${esc(p.brand)}` : ""}</span>
        <strong class="pname">${esc(p.name)}</strong>
        <span class="prices"><span><small>سعر النقد</small><b>${fmt(p.cash)}</b></span><span><small>قسط شهري (${n} أشهر)</small><b>${fmt((p.inst || 0) / n)}</b></span></span>
        <span class="stock ${p.qty <= 0 ? "out" : ""}">${ebar(p)}<span>${p.qty <= 0 ? "نفدت الكمية" : p.qty + " قطعة"}</span></span>
      </span></button>`).join("")}</div>`
    : S.products.length ? empty("لا توجد نتائج", "جرّب كلمة بحث أخرى أو قسماً مختلفاً.")
    : empty(can("products") ? "أضف أول منتج" : "لا توجد منتجات", can("products") ? "سجّل المنتج مع صورته وسعر النقد وسعر الأقساط والكمية المتوفرة." : "لم يضف المدير أي منتج بعد.", can("products") ? `<button class="btn primary" data-act="newProduct">${ic("plus")} إضافة منتج</button>` : "")}`;
}

function cartTotals(){
  const sub = sum(ui.cart, c => c.price * c.qty);
  if (ui.saleType === "cash") { const disc = Math.min(ui.discount || 0, sub); return { sub, disc, total:sub - disc }; }
  const n = Math.max(1, Math.round(ui.months || months()));
  const down = Math.min(ui.down || 0, sub);
  const rem = sub - down;
  const sched = buildSchedule(rem, n, ui.startDate || addMonths(today(), 1));
  return { sub, total:sub, down, rem, n, sched, monthly:sched[0] ? sched[0].amount : 0 };
}
function vPos(){
  const q = ui.posq.trim().toLowerCase();
  const inst = ui.saleType === "inst";
  const pl = S.products.filter(p => !q || [p.name, p.brand, p.model, p.cat].join(" ").toLowerCase().includes(q))
    .sort((a, b) => (b.qty > 0) - (a.qty > 0) || (a.name || "").localeCompare(b.name || "", "ar")).slice(0, 80);
  const t = cartTotals();
  const custs = [...S.customers].sort((a, b) => a.name.localeCompare(b.name, "ar"));
  if (!S.products.length) return `<header class="vhead"><h1>بيع جديد</h1></header>${empty("لا توجد منتجات بعد", "أضف منتجاتك أولاً ثم ارجع لتسجيل عمليات البيع.", `<button class="btn primary" data-act="newProduct">${ic("plus")} إضافة منتج</button>`)}`;
  return `
  <header class="vhead"><div><h1>بيع جديد</h1><p class="muted">اضغط على المنتج لإضافته، ثم اختر طريقة الدفع</p></div></header>
  <div class="pos">
    <section class="panel">
      <label class="search">${ic("search")}<input id="posq" data-bind="posq" value="${esc(ui.posq)}" placeholder="ابحث عن منتج" aria-label="بحث عن منتج"></label>
      <div class="picklist">${pl.map(p => { const inCart = ui.cart.find(c => c.pid === p.id); return `
        <button class="pick" data-act="addCart" data-id="${p.id}" ${p.qty <= 0 ? "disabled" : ""}>
          <span class="pick-img">${imgOr(p.img, 20)}</span>
          <span class="pick-t"><b>${esc(p.name)}</b><small>${p.qty > 0 ? `متوفر ${p.qty}${inCart ? `، في السلة ${inCart.qty}` : ""}` : "نفدت الكمية"}</small></span>
          <span class="pick-p">${fmt(inst ? p.inst : p.cash)}</span></button>`; }).join("") || `<p class="empty-s">لا توجد نتائج</p>`}</div>
    </section>
    <section class="panel pos-cart" id="cart">
      <div class="seg" role="group" aria-label="طريقة الدفع">
        <button class="${!inst ? "on" : ""}" data-act="saleType" data-v="cash" aria-pressed="${!inst}">نقد</button>
        <button class="${inst ? "on inst" : ""}" data-act="saleType" data-v="inst" aria-pressed="${inst}">أقساط ${t.n || months()} أشهر</button>
      </div>
      <div class="field"><span>العميل</span><div class="row">
        <select id="saleCustomer" data-bind="saleCustomer"><option value="">${inst ? "اختر العميل" : "زبون نقدي (بدون اسم)"}</option>${custs.map(c => `<option value="${c.id}" ${c.id === ui.saleCustomer ? "selected" : ""}>${esc(c.name)}${c.phone ? " - " + esc(c.phone) : ""}</option>`).join("")}</select>
        <button class="btn sm" data-act="newCustomer" data-from="pos">${ic("plus")} جديد</button></div></div>
      <div>${ui.cart.length ? ui.cart.map((c, i) => { const p = prod(c.pid); return `
        <div class="citem"><span class="n">${esc(p ? p.name : "منتج محذوف")}</span><span class="lt">${fmt(c.price * c.qty)}</span>
          <div class="ctl"><input id="cp-${i}" data-cprice="${i}" inputmode="numeric" value="${c.price}" aria-label="سعر القطعة">
            <span class="qty"><button data-act="cartQty" data-i="${i}" data-d="1" aria-label="زيادة">${ic("plus", 16)}</button><span>${c.qty}</span><button data-act="cartQty" data-i="${i}" data-d="-1" aria-label="إنقاص">${ic("minus", 16)}</button></span>
            <span class="grow"></span><button class="icon-btn" data-act="cartDel" data-i="${i}" aria-label="حذف">${ic("trash", 18)}</button></div></div>`; }).join("") : `<p class="empty-s">السلة فارغة</p>`}</div>
      ${inst ? `<div class="fgrid">
        <label class="field"><span>المقدمة (دفعة أولى)</span><input id="down" data-bind="down" data-num inputmode="numeric" value="${ui.down || ""}" placeholder="0"></label>
        <label class="field"><span>عدد الأشهر</span><input id="months" data-bind="months" data-num type="number" min="1" max="60" value="${ui.months || months()}"></label>
        <label class="field span2"><span>تاريخ أول قسط</span><input id="startDate" data-bind="startDate" type="date" value="${ui.startDate}"></label></div>`
      : `<label class="field"><span>خصم</span><input id="discount" data-bind="discount" data-num inputmode="numeric" value="${ui.discount || ""}" placeholder="0"></label>`}
      <dl class="totals">
        <dt>المجموع</dt><dd>${money(t.sub)}</dd>
        ${inst ? `<dt>المقدمة</dt><dd>${money(t.down)}</dd><dt>المبلغ المقسّط</dt><dd>${money(t.rem)}</dd>
          <dt class="big">القسط الشهري</dt><dd class="big">${money(t.monthly)}</dd>`
        : `<dt>الخصم</dt><dd>${money(t.disc)}</dd><dt class="big">الصافي</dt><dd class="big">${money(t.total)}</dd>`}
      </dl>
      ${inst && t.sched.length ? `<div><p class="hint" style="margin-bottom:6px">أول قسط ${fmtDate(t.sched[0].due)}، آخر قسط ${fmtDate(t.sched[t.sched.length - 1].due)}</p>${strip({ schedule:t.sched })}</div>` : ""}
      <button class="btn volt block lg" data-act="checkout" ${!ui.cart.length || busy ? "disabled" : ""}>تأكيد البيع</button>
    </section>
  </div>
  ${ui.cart.length ? `<button class="cartbar" data-act="toCart"><span>السلة: ${sum(ui.cart, c => c.qty)} قطعة</span><span>${money(inst ? t.sub : t.total)}</span></button>` : ""}`;
}

function vSales(){
  const q = ui.sq.trim().toLowerCase();
  const list = S.sales.filter(s => (can("allsales") || s.by === ME.id) && (!ui.sseller || s.by === ui.sseller) && (!ui.smonth || s.date.startsWith(ui.smonth)) && (!ui.stype || (ui.stype === "cancelled" ? s.status === "cancelled" : s.type === ui.stype && s.status !== "cancelled"))
    && (!q || [s.no, s.customerName, s.customerPhone, ...(s.items || []).map(i => i.name)].join(" ").toLowerCase().includes(q)))
    .sort((a, b) => b.date.localeCompare(a.date) || b.no - a.no);
  const lv = list.filter(s => s.status !== "cancelled");
  return `
  <header class="vhead"><div><h1>المبيعات</h1><p class="muted">${lv.length} فاتورة بقيمة ${money(sum(lv, s => s.total))}${ui.smonth ? ` في ${monthName(ui.smonth)}` : ""}</p></div>
    ${can("sell") ? `<button class="btn volt" data-act="nav" data-v="pos">${ic("pos")} بيع جديد</button>` : ""}</header>
  <div class="toolbar">
    <label class="search">${ic("search")}<input id="sq" data-bind="sq" value="${esc(ui.sq)}" placeholder="رقم الفاتورة أو اسم العميل أو المنتج" aria-label="بحث"></label>
    <input id="smonth" type="month" data-bind="smonth" value="${ui.smonth}" aria-label="الشهر">
    <select id="stype" data-bind="stype" aria-label="النوع"><option value="">كل الأنواع</option><option value="cash" ${ui.stype === "cash" ? "selected" : ""}>نقد</option><option value="inst" ${ui.stype === "inst" ? "selected" : ""}>أقساط</option><option value="cancelled" ${ui.stype === "cancelled" ? "selected" : ""}>ملغاة</option></select>
    ${can("allsales") && S.users.length > 1 ? `<select id="sseller" data-bind="sseller" aria-label="الموظف"><option value="">كل الموظفين</option>${S.users.map(u => `<option value="${u.id}" ${ui.sseller === u.id ? "selected" : ""}>${esc(u.name)}</option>`).join("")}</select>` : ""}
    ${ui.smonth ? `<button class="btn ghost sm" data-act="allMonths">كل الأشهر</button>` : ""}
  </div>
  <div class="sum4">
    <div class="kpi"><span class="k">نقد</span><span class="v num">${money(sum(lv.filter(s => s.type === "cash"), s => s.total))}</span></div>
    <div class="kpi"><span class="k">أقساط</span><span class="v num">${money(sum(lv.filter(s => s.type === "inst"), s => s.total))}</span></div>
    <div class="kpi"><span class="k">المحصّل</span><span class="v num">${money(sum(lv, saleCollected))}</span></div>
    ${can("cost") ? `<div class="kpi"><span class="k">الربح التقديري</span><span class="v num">${money(sum(lv, saleProfit))}</span></div>` : `<div class="kpi"><span class="k">عدد القطع</span><span class="v num">${fmt(sum(lv, s => sum(s.items, i => i.qty)))}</span></div>`}
  </div>
  ${list.length ? `<div class="list">
    <div class="lrow sales-r lhead"><span>الفاتورة</span><span>العميل والمنتجات</span><span>التاريخ</span><span>السداد</span><span style="text-align:end">المبلغ</span><span>الحالة</span></div>
    ${list.map(s => `<button class="lrow sales-r" data-act="openSale" data-id="${s.id}">
      <span class="t"><b>#${s.no}</b>${typeBadge(s)}</span>
      <span class="t"><b>${esc(s.customerName)}</b><small>${esc((s.items || []).map(i => i.name + (i.qty > 1 ? " ×" + i.qty : "")).join("، "))}${s.byName && can("allsales") ? ` (البائع: ${esc(s.byName)})` : ""}</small></span>
      <span class="hide-m">${fmtDate(s.date)}</span>
      <span class="hide-m">${s.type === "inst" ? strip(s) : ""}</span>
      <span class="amt">${money(s.total)}</span>
      <span>${saleStatusBadge(s)}</span></button>`).join("")}</div>`
    : empty("لا توجد مبيعات", ui.smonth ? "لا توجد فواتير في هذا الشهر حسب الفلتر المختار." : "سجّل أول عملية بيع من صفحة البيع.")}`;
}

function vInstallments(){
  const T = today(), M = ui.imonth || T.slice(0, 7);
  const rows = instRows();
  const mR = rows.filter(r => r.x.due.startsWith(M));
  const late = rows.filter(r => r.x.due < T && unpaid(r));
  const week = rows.filter(r => r.x.due >= T && r.x.due <= addDays(T, 7) && unpaid(r));
  const exp = sum(mR, r => r.x.amount), col = sum(mR, r => Math.min(r.x.paid || 0, r.x.amount));
  let list = ui.itab === "late" ? late : ui.itab === "week" ? week : mR;
  const q = ui.iq.trim().toLowerCase();
  if (q) list = list.filter(r => [r.s.customerName, r.s.customerPhone, r.s.no].join(" ").toLowerCase().includes(q));
  list = [...list].sort((a, b) => a.x.due.localeCompare(b.x.due));
  const tab = (k, l, c) => `<button class="tab ${ui.itab === k ? "on" : ""}" data-act="itab" data-v="${k}">${l}<span class="c">${c}</span></button>`;
  return `
  <header class="vhead"><div><h1>الاستحصال</h1><p class="muted">متابعة تحصيل الأقساط الشهرية والمتأخرات ومطالبة العملاء</p></div>
    <input id="imonth" type="month" data-bind="imonth" value="${M}" style="width:auto" aria-label="الشهر"></header>
  <div class="sum4">
    <div class="kpi"><span class="k">المتوقع في ${monthName(M)}</span><span class="v num">${money(exp)}</span><span class="s">${mR.length} قسط</span></div>
    <div class="kpi"><span class="k">تم تحصيله</span><span class="v num" style="color:var(--ok)">${money(col)}</span><span class="s">${exp ? Math.round(col / exp * 100) : 0}% من المتوقع</span></div>
    <div class="kpi"><span class="k">المتبقي للشهر</span><span class="v num">${money(exp - col)}</span></div>
    <div class="kpi late"><span class="k">مجموع المتأخرات</span><span class="v num">${money(sum(late, left))}</span><span class="s">${late.length} قسط</span></div>
  </div>
  <div class="tabs">${tab("month", "أقساط الشهر", mR.length)}${tab("late", "المتأخرة (للمطالبة)", late.length)}${tab("week", "خلال 7 أيام", week.length)}</div>
  <div class="toolbar"><label class="search">${ic("search")}<input id="iq" data-bind="iq" value="${esc(ui.iq)}" placeholder="اسم العميل أو رقم الهاتف أو الفاتورة" aria-label="بحث"></label></div>
  ${list.length ? `<div class="list">
    <div class="lrow inst-r lhead"><span>العميل</span><span>الاستحقاق</span><span style="text-align:end">المبلغ</span><span>الحالة</span><span></span></div>
    ${list.map(r => { const st = instStatus(r.x); const c = cust(r.s.customerId) || { phone:r.s.customerPhone }; return `
    <div class="lrow inst-r">
      <span class="t"><b>${esc(r.s.customerName)}</b><small>فاتورة #${r.s.no}، القسط ${r.x.n} من ${r.s.schedule.length}</small></span>
      <span class="t hide-m"><b>${fmtDate(r.x.due)}</b><small>${st === "paid" ? "سُدد " + fmtDate(r.x.paidDate) + (r.x.paidByName ? "، استحصله " + esc(r.x.paidByName) : "") : relDue(r.x.due)}</small></span>
      <span class="amt">${money(st === "paid" ? r.x.amount : left(r))}${(r.x.paid || 0) > 0 && st !== "paid" ? `<small class="muted" style="display:block;font-weight:500">دُفع ${fmt(r.x.paid)}</small>` : ""}</span>
      <span>${stBadge(st)}</span>
      <span class="acts full-m">${st !== "paid" ? waBtn(c.phone, demandMsg(r.s, r.x), st.startsWith("late") ? "مطالبة واتساب" : "تذكير واتساب", `${r.s.customerName}، فاتورة ${r.s.no}، القسط ${r.x.n}، ${money(left(r))}${st.startsWith("late") ? "، متأخر" : ""}`, true) + (c.phone ? `<a class="icon-btn" title="اتصال" href="tel:${esc(c.phone)}">${ic("phone", 18)}</a>` : "") + (can("collect") ? `<button class="btn sm primary" data-act="pay" data-id="${r.s.id}" data-i="${r.i}">تسديد</button>` : "") : ""}<button class="btn sm ghost" data-act="openSale" data-id="${r.s.id}">الفاتورة</button></span>
    </div>`; }).join("")}</div>`
  : empty(ui.itab === "late" ? "لا توجد متأخرات" : "لا توجد أقساط", ui.itab === "month" ? "لا أقساط مستحقة في هذا الشهر. اختر شهراً آخر من الأعلى." : "كل شيء على ما يرام.")}`;
}

function custStats(c){
  const ss = S.sales.filter(s => s.customerId === c.id && s.status !== "cancelled");
  const T = today();
  const lateR = ss.flatMap(s => s.type === "inst" ? s.schedule.filter(x => x.due < T && (x.paid || 0) < x.amount) : []);
  return { ss, total:sum(ss, s => s.total), paid:sum(ss, saleCollected), rem:sum(ss, saleRemaining), late:sum(lateR, x => x.amount - (x.paid || 0)), lateN:lateR.length };
}
function vCustomers(){
  const q = ui.cq.trim().toLowerCase();
  let list = S.customers.filter(c => !q || [c.name, c.phone, c.phone2, c.address, c.idNo].join(" ").toLowerCase().includes(q)).map(c => ({ c, st:custStats(c) }));
  if (ui.cfilter === "debt") list = list.filter(x => x.st.rem > 0);
  if (ui.cfilter === "late") list = list.filter(x => x.st.late > 0);
  list.sort((a, b) => b.st.late - a.st.late || b.st.rem - a.st.rem || a.c.name.localeCompare(b.c.name, "ar"));
  return `
  <header class="vhead"><div><h1>العملاء</h1><p class="muted">${S.customers.length} عميل</p></div>
    ${can("customers") || can("sell") ? `<button class="btn primary" data-act="newCustomer">${ic("plus")} إضافة عميل</button>` : ""}</header>
  ${S.customers.length ? `<div class="toolbar">
    <label class="search">${ic("search")}<input id="cq" data-bind="cq" value="${esc(ui.cq)}" placeholder="الاسم أو الهاتف أو العنوان" aria-label="بحث"></label>
    <select id="cfilter" data-bind="cfilter" aria-label="فلترة"><option value="">كل العملاء</option><option value="debt" ${ui.cfilter === "debt" ? "selected" : ""}>عليهم أقساط</option><option value="late" ${ui.cfilter === "late" ? "selected" : ""}>عليهم متأخرات</option></select></div>` : ""}
  ${list.length ? `<div class="list">
    <div class="lrow cust-r lhead"><span>العميل</span><span>الهاتف</span><span>المشتريات</span><span style="text-align:end">المتبقي عليه</span><span>الحالة</span></div>
    ${list.map(({ c, st }) => `<button class="lrow cust-r" data-act="openCustomer" data-id="${c.id}">
      <span class="t"><b>${esc(c.name)}</b><small>${esc(c.address || "")}</small></span>
      <span class="hide-m num">${esc(c.phone || "—")}</span>
      <span class="hide-m">${st.ss.length} فاتورة، ${money(st.total)}</span>
      <span class="amt">${money(st.rem)}</span>
      <span>${st.late ? `<span class="badge bad">متأخر ${fmt(st.late)}</span>` : st.rem ? `<span class="badge">منتظم</span>` : `<span class="badge ok">لا ديون</span>`}</span></button>`).join("")}</div>`
  : S.customers.length ? empty("لا توجد نتائج", "جرّب بحثاً آخر.") : empty("أضف أول عميل", "سجّل بيانات العميل والكفيل لمتابعة مشترياته وأقساطه.", `<button class="btn primary" data-act="newCustomer">${ic("plus")} إضافة عميل</button>`)}`;
}

const CASH_IN = ["إيداع رأس مال", "بيع نقدي", "قسط", "مقدمة أقساط", "إيراد آخر"];
const CASH_OUT = ["شراء بضاعة", "رواتب", "إيجار", "كهرباء ومولدة", "نقل وتوصيل", "صيانة", "سحب شخصي", "استرجاع", "مصروف آخر"];
function vTreasury(){
  const M = ui.tmonth;
  const list = S.cash.filter(e => !M || e.date.startsWith(M)).sort((a, b) => b.date.localeCompare(a.date) || (b.createdAt || 0) - (a.createdAt || 0));
  const inn = sum(list.filter(e => e.type === "in"), e => e.amount), out = sum(list.filter(e => e.type === "out"), e => e.amount);
  const byCat = (type) => { const m = {}; list.filter(e => e.type === type).forEach(e => { m[e.cat] = (m[e.cat] || 0) + e.amount; }); return Object.entries(m).sort((a, b) => b[1] - a[1]); };
  const ci = byCat("in"), co = byCat("out"); const mx = Math.max(1, ...ci.map(x => x[1]), ...co.map(x => x[1]));
  const bars = (arr, col) => arr.map(([k, v]) => `<div class="catbar"><span>${esc(k)}</span><span class="tr"><i style="width:${v / mx * 100}%;background:${col}"></i></span><b class="num">${fmt(v)}</b></div>`).join("");
  return `
  <header class="vhead"><div><h1>الخزنة</h1><p class="muted">كل المبالغ الداخلة والخارجة</p></div>
    <div class="row"><button class="btn" data-act="newCash" data-v="out">${ic("up")} مصروف</button><button class="btn primary" data-act="newCash" data-v="in">${ic("down")} إيداع</button></div></header>
  <section class="kpis">
    <article class="kpi safe"><span class="k">الرصيد الحالي</span><span class="v num">${money(balance())}</span><span class="s">مجموع كل الحركات منذ البداية</span></article>
    <article class="kpi"><span class="k">الوارد ${M ? "في " + monthName(M) : ""}</span><span class="v num" style="color:var(--ok)">${money(inn)}</span></article>
    <article class="kpi"><span class="k">الصادر ${M ? "في " + monthName(M) : ""}</span><span class="v num" style="color:var(--bad)">${money(out)}</span></article>
  </section>
  ${(ci.length || co.length) ? `<section class="dgrid" style="grid-template-columns:1fr 1fr"><div class="panel"><div class="panel-h"><h2>مصادر الوارد</h2></div><div class="catbars">${bars(ci, "var(--e1)") || `<p class="empty-s">لا يوجد</p>`}</div></div>
    <div class="panel"><div class="panel-h"><h2>أوجه الصرف</h2></div><div class="catbars">${bars(co, "var(--e6)") || `<p class="empty-s">لا يوجد</p>`}</div></div></section>` : ""}
  <div class="toolbar"><input id="tmonth" type="month" data-bind="tmonth" value="${M}" aria-label="الشهر">${M ? `<button class="btn ghost sm" data-act="allTMonths">كل الأشهر</button>` : ""}<span class="grow"></span><span class="muted">صافي الفترة: <b class="num" style="color:${inn - out >= 0 ? "var(--ok)" : "var(--bad)"}">${money(inn - out)}</b></span></div>
  ${list.length ? `<div class="list">
    <div class="lrow cash-r lhead"><span>التاريخ</span><span>البند</span><span>التفاصيل</span><span style="text-align:end">المبلغ</span><span></span></div>
    ${list.map(e => `<div class="lrow cash-r">
      <span class="hide-m">${fmtDate(e.date)}</span>
      <span class="t"><b>${esc(e.cat)}</b><small class="muted" style="display:block">${e.type === "in" ? "وارد" : "صادر"}</small></span>
      <span class="t hide-m"><small>${esc(e.note || "")}${e.byName ? `<span class="muted" style="display:block">بواسطة ${esc(e.byName)}</span>` : ""}</small></span>
      <span class="amt ${e.type}">${e.type === "in" ? "+" : "−"}${money(e.amount)}</span>
      <span>${e.saleId ? (saleById(e.saleId) ? `<button class="icon-btn" data-act="openSale" data-id="${e.saleId}" title="عرض الفاتورة">${ic("receipt", 18)}</button>` : "") : `<button class="icon-btn" data-act="delCash" data-id="${e.id}" title="حذف الحركة">${ic("trash", 18)}</button>`}</span>
    </div>`).join("")}</div>`
  : empty("لا توجد حركات", "سجّل رأس المال الافتتاحي كإيداع، وستُضاف المبيعات والأقساط تلقائياً.", `<button class="btn primary" data-act="newCash" data-v="in">${ic("down")} تسجيل إيداع</button>`)}`;
}

function vSettings(){
  const st = S.settings;
  let theme = "auto"; try { theme = localStorage.getItem("bayt-theme") || "auto"; } catch (e) {}
  const acct = `<div class="panel"><h2 style="margin-bottom:10px">حسابي</h2>
        <div class="row" style="margin-bottom:12px"><span class="av">${esc(ME.name.charAt(0))}</span><span><b>${esc(ME.name)}</b><small class="muted" style="display:block" dir="ltr">${esc(ME.username)}</small></span></div>
        <div class="row" style="flex-wrap:wrap"><button class="btn" data-act="changePass">${ic("lock", 18)} تغيير كلمة المرور</button>${ME.admin ? `<button class="btn" data-act="newRecovery">رمز استرجاع جديد</button>` : ""}<button class="btn ghost danger" data-act="logout">${ic("logout", 18)} خروج</button></div></div>`;
  const themeP = `<div class="panel"><h2 style="margin-bottom:10px">المظهر</h2>
        <select id="themeSel"><option value="auto" ${theme === "auto" ? "selected" : ""}>حسب الجهاز</option><option value="light" ${theme === "light" ? "selected" : ""}>فاتح</option><option value="dark" ${theme === "dark" ? "selected" : ""}>داكن</option></select></div>`;
  if (!can("settings")) return `<header class="vhead"><div><h1>الإعدادات</h1><p class="muted">حسابك ومظهر المنصة</p></div></header>
  <div class="dgrid" style="grid-template-columns:minmax(0,1fr) minmax(0,1fr)">${acct}${themeP}</div>`;
  return `
  <header class="vhead"><div><h1>الإعدادات</h1><p class="muted">بيانات المعرض وطريقة احتساب الأقساط</p></div></header>
  <div class="dgrid" style="grid-template-columns:minmax(0,1.3fr) minmax(0,1fr)">
    <form id="f-settings" class="panel">
      <div class="fgrid">
        <label class="field span2"><span>اسم المعرض</span><input name="storeName" value="${esc(st.storeName)}" required></label>
        <label class="field"><span>رقم الهاتف</span><input name="phone" value="${esc(st.phone)}" inputmode="tel"></label>
        <label class="field"><span>العنوان</span><input name="address" value="${esc(st.address)}"></label>
        <label class="field"><span>نسبة زيادة سعر الأقساط عن النقد (%)</span><input name="markup" type="number" min="0" step="0.5" value="${st.markup}"><small class="hint">تُستخدم لاقتراح سعر الأقساط تلقائياً عند إضافة منتج</small></label>
        <label class="field"><span>عدد أشهر التقسيط الافتراضي</span><input name="months" type="number" min="1" max="60" value="${st.months}"></label>
        <label class="field span2"><span>عبارة أسفل الفاتورة</span><input name="footer" value="${esc(st.footer || "")}"></label>
      </div>
      <div class="row" style="margin-top:16px;justify-content:flex-end"><button class="btn primary" type="submit">حفظ الإعدادات</button></div>
    </form>
    <div style="display:flex;flex-direction:column;gap:14px">
      ${acct}${themeP}
      <div class="panel"><h2 style="margin-bottom:6px">حفظ البيانات</h2>
        <p class="muted" style="margin-bottom:12px">${MODE === "cloud" ? "بياناتك محفوظة سحابياً وتظهر على الهاتف والكمبيوتر عند فتح نفس الرابط." : "بياناتك محفوظة في متصفح هذا الجهاز فقط. احرص على أخذ نسخة احتياطية بانتظام."}</p>
        <div class="row" style="flex-wrap:wrap"><button class="btn" data-act="exportData">${ic("down")} تنزيل نسخة احتياطية</button>
        <label class="btn">${ic("up")} استرجاع نسخة<input type="file" id="importfile" accept="application/json,.json" hidden></label></div></div>
    </div>
  </div>`;
}

function vLog(){
  const q = ui.lq.trim().toLowerCase();
  const list = S.log.filter(e => (!ui.lmonth || (e.date || "").startsWith(ui.lmonth)) && (!ui.luser || e.by === ui.luser) && (!ui.lkind || e.kind === ui.lkind)
    && (!q || [e.action, e.details, e.byName].join(" ").toLowerCase().includes(q))).sort((a, b) => b.ts - a.ts);
  const shown = list.slice(0, 400);
  const badge = k => ({ sale:"brand", collect:"ok", product:"", customer:"", cash:"warn", user:"bad", notify:"ok", auth:"", settings:"" }[k] || "");
  const tm = ts => new Date(ts).toLocaleTimeString(LOC, { hour:"2-digit", minute:"2-digit" });
  const users = [...new Map(S.log.map(e => [e.by, e.byName])).entries()].filter(([id]) => id);
  return `<header class="vhead"><div><h1>سجل العمليات</h1><p class="muted">من نفّذ كل عملية ومتى: البيع والاستحصال وإضافة المنتجات وغيرها</p></div></header>
  <div class="toolbar">
    <label class="search">${ic("search")}<input id="lq" data-bind="lq" value="${esc(ui.lq)}" placeholder="رقم فاتورة، اسم عميل، منتج..." aria-label="بحث"></label>
    <select id="luser" data-bind="luser" aria-label="المستخدم"><option value="">كل المستخدمين</option>${users.map(([id, n]) => { const u = S.users.find(x => x.id === id); return `<option value="${id}" ${ui.luser === id ? "selected" : ""}>${esc(u ? u.name : n)}</option>`; }).join("")}</select>
    <select id="lkind" data-bind="lkind" aria-label="النوع"><option value="">كل العمليات</option>${Object.entries(LOGK).map(([k, l]) => `<option value="${k}" ${ui.lkind === k ? "selected" : ""}>${l}</option>`).join("")}</select>
    <input id="lmonth" type="month" data-bind="lmonth" value="${ui.lmonth}" aria-label="الشهر">${ui.lmonth ? `<button class="btn ghost sm" data-act="allLMonths">كل الأشهر</button>` : ""}
  </div>
  ${shown.length ? `<div class="list"><div class="lrow log-r lhead"><span>الوقت</span><span>المستخدم</span><span>العملية</span><span>التفاصيل</span></div>
    ${shown.map(e => `<div class="lrow log-r">
      <span class="t hide-m"><b class="num">${fmtDate(e.date)}</b><small>${tm(e.ts)}</small></span>
      <span class="t"><b>${esc(e.byName || "—")}</b><small class="muted show-m">${fmtDate(e.date)} ${tm(e.ts)}</small></span>
      <span><span class="badge ${badge(e.kind)}">${esc(e.action)}</span></span>
      <span class="t full-m"><small>${esc(e.details)}</small></span></div>`).join("")}</div>
    ${list.length > shown.length ? `<p class="hint" style="margin-top:10px">يُعرض أحدث ${shown.length} من ${list.length} عملية. استخدم البحث أو الفلاتر لتضييق النتائج.</p>` : ""}`
  : empty("لا توجد عمليات", "ستظهر هنا كل عملية بيع واستحصال وإضافة منتج مع اسم من نفّذها.")}`;
}
const VIEWS = { dashboard:vDashboard, pos:vPos, products:vProducts, sales:vSales, installments:vInstallments, customers:vCustomers, treasury:vTreasury, users:vUsers, log:vLog, settings:vSettings };

function render(){
  const a = document.activeElement;
  const view = $("#view");
  const fid = a && a.id && view.contains(a) ? a.id : null;
  let sel = null; try { sel = fid ? [a.selectionStart, a.selectionEnd] : null; } catch (e) {}
  if (ready) syncMe();
  document.body.classList.toggle("auth", ready && !ME);
  if (ready && ME && !VIS[ui.view]()) ui.view = firstView();
  view.innerHTML = !ready ? `<div class="loader">جارٍ تحميل البيانات</div>` : !ME ? vAuth() : VIEWS[ui.view]();
  if (ready && !ME && !fid) setTimeout(() => { const f = $("#li-user") || $("#su-name"); if (f && window.innerWidth > 640) f.focus(); }, 30);
  renderChrome();
  if (fid) { const el = document.getElementById(fid); if (el) { el.focus(); try { if (sel && sel[0] != null) el.setSelectionRange(sel[0], sel[1]); } catch (e) {} } }
}

/* ---------- modal / toast / confirm ---------- */
let toastT;
function toast(msg, bad){ const t = $("#toast"); t.textContent = msg; t.className = "toast" + (bad ? " bad" : ""); t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 3200); }
function openModal(html, wide){
  const m = $("#modal");
  m.innerHTML = `<div class="sheet ${wide ? "wide" : ""}" role="dialog" aria-modal="true">${html}</div>`;
  m.hidden = false; document.body.classList.add("locked");
  setTimeout(() => { const f = m.querySelector("[autofocus]") || m.querySelector(".sheet-body input:not([type=file]),.sheet-body select"); if (f && window.innerWidth > 640) f.focus(); }, 40);
}
function closeModal(){ const m = $("#modal"); m.hidden = true; m.innerHTML = ""; document.body.classList.remove("locked"); }
const head = (t, sub) => `<div class="sheet-head"><div><h2>${t}</h2>${sub ? `<p class="muted">${sub}</p>` : ""}</div><button class="icon-btn" data-act="closeModal" aria-label="إغلاق">${ic("x", 18)}</button></div>`;
let confirmCb = null;
function askConfirm(msg, ok, danger){
  return new Promise(res => {
    confirmCb = res;
    openModal(`${head("تأكيد")}<div class="sheet-body"><p>${msg}</p></div><div class="sheet-foot"><span class="grow"></span><button class="btn" data-act="confirmNo">رجوع</button><button class="btn ${danger ? "danger" : "primary"}" data-act="confirmYes">${ok}</button></div>`);
  });
}

/* ---------- products ---------- */
function productModal(p){
  const isNew = !p; p = p || { qty:1, min:2 };
  const ro = !can("products");
  editImg = p.img || "";
  const n = months();
  const cats = [...new Set(["ثلاجات", "غسالات", "مكيفات", "تلفزيونات", "طباخات وأفران", "أجهزة مطبخ صغيرة", "مكانس كهربائية", "مبردات ومراوح", "سخانات", "هواتف ولوحيات", "حاسبات", ...S.products.map(x => x.cat).filter(Boolean)])];
  openModal(`${head(isNew ? "إضافة منتج" : "تعديل المنتج")}
  <form id="f-product" class="sheet-body" data-id="${p.id || ""}" data-touched="${isNew ? "0" : "1"}">
    <div class="imgpick"><div class="imgprev" id="imgprev">${imgOr(editImg, 36)}</div>
      <div style="display:flex;flex-direction:column;gap:6px"><div class="row"><label class="btn sm">${ic("image", 18)} اختيار صورة<input type="file" id="imgfile" accept="image/*" hidden></label>
      <button type="button" class="btn sm ghost" data-act="clearImg">إزالة</button></div><p class="hint">تُصغَّر الصورة تلقائياً لتوفير المساحة</p></div></div>
    <div class="fgrid">
      <label class="field span2"><span>اسم المنتج</span><input name="name" required value="${esc(p.name || "")}" placeholder="مثال: ثلاجة سامسونج 18 قدم"></label>
      <label class="field"><span>القسم</span><input name="cat" list="catlist" value="${esc(p.cat || "")}"></label>
      <label class="field"><span>الماركة</span><input name="brand" value="${esc(p.brand || "")}"></label>
      <label class="field"><span>الموديل</span><input name="model" value="${esc(p.model || "")}"></label>
      <label class="field"><span>الضمان</span><input name="warranty" value="${esc(p.warranty || "")}" placeholder="سنة واحدة"></label>
      ${can("cost") ? `<label class="field"><span>سعر الشراء (الكلفة)</span><input name="cost" inputmode="numeric" value="${p.cost || ""}"></label>` : ""}
      <label class="field"><span>سعر النقد</span><input name="cash" inputmode="numeric" required value="${p.cash || ""}"></label>
      <label class="field"><span>سعر الأقساط الكلي (${n} أشهر)</span><input name="inst" inputmode="numeric" value="${p.inst || ""}"></label>
      <div class="field calc"><span>القسط الشهري</span><output id="monthly">${p.inst ? money(p.inst / n) : "—"}</output><small class="hint" id="markupInfo">${p.cash && p.inst ? `أعلى من النقد بـ ${((p.inst / p.cash - 1) * 100).toFixed(1)}%` : `يُقترح تلقائياً بزيادة ${S.settings.markup}% عن النقد`}</small></div>
      <label class="field"><span>الكمية المتوفرة</span><input name="qty" type="number" min="0" value="${p.qty ?? 0}"></label>
      <label class="field"><span>تنبيه عند نزول الكمية إلى</span><input name="min" type="number" min="0" value="${p.min ?? 2}"></label>
      <label class="field span2"><span>التفاصيل والمواصفات</span><textarea name="desc" rows="4" placeholder="اللون، السعة، استهلاك الطاقة، المزايا...">${esc(p.desc || "")}</textarea></label>
    </div>
    <datalist id="catlist">${cats.map(c => `<option value="${esc(c)}">`).join("")}</datalist>
    ${!isNew && (p.createdByName || p.updatedByName) ? `<div class="audit">${p.createdByName ? `<span>أضافه ${esc(p.createdByName)}${p.createdAt ? " في " + fmtDate(localISO(new Date(p.createdAt))) : ""}</span>` : ""}${p.updatedByName ? `<span>آخر تعديل: ${esc(p.updatedByName)}${p.updatedAt ? " في " + fmtDate(localISO(new Date(p.updatedAt))) : ""}</span>` : ""}</div>` : ""}
  </form>
  ${ro ? `<div class="sheet-foot"><span class="muted" style="font-size:.85rem">${ic("lock", 16)} عرض فقط</span><span class="grow"></span><button class="btn" data-act="closeModal">إغلاق</button></div>`
  : `<div class="sheet-foot">${!isNew ? `<button class="btn ghost danger" data-act="delProduct" data-id="${p.id}">${ic("trash", 18)} حذف</button>` : ""}<span class="grow"></span><button class="btn" data-act="closeModal">إلغاء</button><button class="btn primary" type="submit" form="f-product">حفظ المنتج</button></div>`}`, true);
  if (ro) { document.querySelectorAll("#f-product input, #f-product textarea, #f-product button").forEach(el => { el.disabled = true; }); const lb = document.querySelector("#f-product .imgpick .row"); if (lb) lb.remove(); }
}
function productCalc(f, changed){
  const E = f.elements, n = months();
  if (changed === "inst") f.dataset.touched = "1";
  const cash = num(E.cash.value);
  if (changed === "cash" && f.dataset.touched !== "1") E.inst.value = cash ? roundTo(cash * (1 + num(S.settings.markup) / 100), 1000) : "";
  const inst = num(E.inst.value);
  $("#monthly").textContent = inst ? money(inst / n) : "—";
  $("#markupInfo").textContent = cash && inst ? `أعلى من النقد بـ ${((inst / cash - 1) * 100).toFixed(1)}%` : "";
}
async function saveProduct(f){
  const v = Object.fromEntries(new FormData(f));
  if (!v.name.trim()) return toast("اكتب اسم المنتج", true);
  if (!num(v.cash)) return toast("اكتب سعر النقد", true);
  const id = f.dataset.id || uid();
  const old = prod(id) || { createdAt:Date.now() };
  const p = { ...old, id, name:v.name.trim(), cat:v.cat.trim(), brand:v.brand.trim(), model:v.model.trim(), warranty:v.warranty.trim(),
    cost:can("cost") ? num(v.cost) : (old.cost || 0), cash:num(v.cash), inst:num(v.inst) || num(v.cash), qty:Math.max(0, Math.round(num(v.qty))), min:Math.max(0, Math.round(num(v.min))),
    desc:v.desc.trim(), img:editImg, updatedAt:Date.now(), updatedBy:ME.id, updatedByName:ME.name };
  if (!f.dataset.id) { p.createdBy = ME.id; p.createdByName = ME.name; }
  try { await put("products", p); } catch (e) { return; }
  if (!f.dataset.id) logAct("product", "إضافة منتج", `${p.name}، نقد ${fmt(p.cash)}، أقساط ${fmt(p.inst)}، الكمية ${p.qty}`, p.id);
  else { const ch = []; if (old.cash !== p.cash) ch.push(`سعر النقد ${fmt(old.cash)} ← ${fmt(p.cash)}`); if (old.inst !== p.inst) ch.push(`سعر الأقساط ${fmt(old.inst)} ← ${fmt(p.inst)}`); if (old.qty !== p.qty) ch.push(`الكمية ${old.qty} ← ${p.qty}`); if (can("cost") && old.cost !== p.cost) ch.push(`الكلفة ${fmt(old.cost)} ← ${fmt(p.cost)}`); if (old.name !== p.name) ch.push(`الاسم ${old.name} ← ${p.name}`);
    logAct("product", "تعديل منتج", `${p.name}${ch.length ? "، " + ch.join("، ") : ""}`, p.id); }
  closeModal(); toast(f.dataset.id ? "تم حفظ التعديلات" : "تمت إضافة المنتج"); render();
}
function compressImage(file){
  return new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => { const img = new Image(); img.onload = () => {
      const max = 560; let w = img.width, h = img.height; const s = Math.min(1, max / Math.max(w, h)); w = Math.round(w * s); h = Math.round(h * s);
      const c = document.createElement("canvas"); c.width = w; c.height = h; const x = c.getContext("2d");
      x.fillStyle = "#fff"; x.fillRect(0, 0, w, h); x.drawImage(img, 0, 0, w, h); res(c.toDataURL("image/jpeg", 0.74));
    }; img.onerror = rej; img.src = fr.result; };
    fr.onerror = rej; fr.readAsDataURL(file);
  });
}

/* ---------- customers ---------- */
let custFrom = "";
function customerForm(c, from){
  const isNew = !c; c = c || {}; custFrom = from || "";
  openModal(`${head(isNew ? "إضافة عميل" : "تعديل بيانات العميل")}
  <form id="f-customer" class="sheet-body" data-id="${c.id || ""}"><div class="fgrid">
    <label class="field span2"><span>اسم العميل الكامل</span><input name="name" required value="${esc(c.name || "")}" autocomplete="off"></label>
    <label class="field span2"><span>رقم الهاتف (واتساب)</span><input name="phone" required inputmode="tel" dir="ltr" style="text-align:right" value="${esc(c.phone || "")}" placeholder="07XXXXXXXXX"></label>
    <label class="field span2"><span>عنوان السكن</span><input name="address" required value="${esc(c.address || "")}" placeholder="المحافظة، المنطقة، المحلة، أقرب نقطة دالة"></label>
  </div></form>
  <div class="sheet-foot"><span class="grow"></span><button class="btn" data-act="closeModal">إلغاء</button><button class="btn primary" type="submit" form="f-customer">حفظ العميل</button></div>`);
}
async function saveCustomer(f){
  const v = Object.fromEntries(new FormData(f));
  const name = (v.name || "").trim(), phone = (v.phone || "").replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d)).replace(/[^\d+]/g, ""), address = (v.address || "").trim();
  if (!name) return toast("اكتب اسم العميل", true);
  if (phone.replace(/\D/g, "").length < 10) return toast("اكتب رقم هاتف صحيح، مثل 07701234567", true);
  if (!address) return toast("اكتب عنوان السكن", true);
  const id = f.dataset.id || uid();
  const dup = S.customers.find(x => x.id !== id && x.phone && x.phone.replace(/\D/g, "") === phone.replace(/\D/g, ""));
  if (dup) return toast(`هذا الرقم مسجّل للعميل "${dup.name}"`, true);
  const old = cust(id) || { createdAt:Date.now(), createdBy:ME.id, createdByName:ME.name };
  const c = { ...old, id, name, phone, address, updatedByName:ME.name };
  try { await put("customers", c); } catch (e) { return; }
  logAct("customer", f.dataset.id ? "تعديل عميل" : "إضافة عميل", `${name}، ${phone}، ${address}`, id);
  // keep invoice snapshots in sync with the customer's name/phone
  for (const s of S.sales.filter(s => s.customerId === id && (s.customerName !== c.name || s.customerPhone !== c.phone))) {
    try { await put("sales", { ...s, customerName:c.name, customerPhone:c.phone }); } catch (e) {}
  }
  if (custFrom === "pos") { ui.saleCustomer = id; closeModal(); }
  else if (f.dataset.id) openCustomer(id); else closeModal();
  toast("تم حفظ العميل"); render();
}
function openCustomer(id){
  const c = cust(id); if (!c) return;
  const st = custStats(c);
  const all = S.sales.filter(s => s.customerId === id).sort((a, b) => b.date.localeCompare(a.date));
  openModal(`${head(esc(c.name), c.phone ? `<span class="num">${esc(c.phone)}</span>` : "")}
  <div class="sheet-body">
    <div class="kv">
      <div><small>إجمالي المشتريات</small><b class="num">${money(st.total)}</b></div>
      <div><small>المدفوع</small><b class="num" style="color:var(--ok)">${money(st.paid)}</b></div>
      <div><small>المتبقي عليه</small><b class="num">${money(st.rem)}</b></div>
      <div><small>متأخرات</small><b class="num" style="color:${st.late ? "var(--bad)" : "inherit"}">${money(st.late)}</b></div>
    </div>
    <div class="kv">
      ${c.address ? `<div><small>العنوان</small><b>${esc(c.address)}</b></div>` : ""}
      ${c.phone ? `<div><small>رقم الهاتف</small><b class="num" dir="ltr">${esc(c.phone)}</b></div>` : ""}
      ${c.createdByName ? `<div><small>أضافه</small><b>${esc(c.createdByName)}</b></div>` : ""}
    </div>
    <h3 class="sec">الفواتير</h3>
    ${all.length ? `<div class="list">${all.map(s => `<button class="lrow" style="grid-template-columns:minmax(0,1fr) auto" data-act="openSale" data-id="${s.id}">
      <span class="t"><b>#${s.no} ${typeBadge(s)} ${saleStatusBadge(s)}</b><small>${fmtDate(s.date)}، ${esc(s.items.map(i => i.name).join("، "))}</small>${s.type === "inst" && s.status !== "cancelled" ? `<span style="display:block;margin-top:6px">${strip(s)}</span>` : ""}</span>
      <span class="amt">${money(s.total)}${saleRemaining(s) ? `<small class="muted" style="display:block;font-weight:500">باقي ${fmt(saleRemaining(s))}</small>` : ""}</span></button>`).join("")}</div>` : `<p class="empty-s">لا توجد فواتير لهذا العميل</p>`}
  </div>
  <div class="sheet-foot">${!all.length && can("customers") ? `<button class="btn ghost danger" data-act="delCustomer" data-id="${id}">${ic("trash", 18)} حذف</button>` : ""}
    ${custDemand(c)}<span class="grow"></span>
    ${can("customers") ? `<button class="btn" data-act="editCustomer" data-id="${id}">${ic("edit", 18)} تعديل</button>` : ""}
    ${can("sell") ? `<button class="btn volt" data-act="sellTo" data-id="${id}">${ic("pos", 18)} بيع له</button>` : ""}</div>`, true);
}

/* ---------- sales ---------- */
function openSale(id){
  const s = saleById(id); if (!s) return;
  const rem = saleRemaining(s);
  const c = cust(s.customerId) || { phone:s.customerPhone };
  openModal(`${head(`فاتورة #${s.no}`, `${fmtDate(s.date)} ${typeBadge(s)} ${saleStatusBadge(s)}`)}
  <div class="sheet-body">
    <div class="kv">
      <div><small>العميل</small><b>${s.customerId ? `<a href="#" data-act="openCustomer" data-id="${s.customerId}" style="color:var(--brand)">${esc(s.customerName)}</a>` : esc(s.customerName)}</b></div>
      ${s.byName ? `<div><small>البائع</small><b>${esc(s.byName)}</b></div>` : ""}
      <div><small>الإجمالي</small><b class="num">${money(s.total)}</b></div>
      <div><small>المدفوع</small><b class="num" style="color:var(--ok)">${money(saleCollected(s))}</b></div>
      ${s.type === "inst" ? `<div><small>المتبقي</small><b class="num">${money(rem)}</b></div>` : ""}
    </div>
    <div class="tbl-wrap"><table class="tbl"><thead><tr><th>المنتج</th><th>الكمية</th><th>السعر</th><th>المجموع</th></tr></thead><tbody>
      ${s.items.map(i => `<tr><td>${esc(i.name)}</td><td>${i.qty}</td><td>${fmt(i.price)}</td><td>${fmt(i.price * i.qty)}</td></tr>`).join("")}
      ${s.discount ? `<tr><td colspan="3">خصم</td><td>−${fmt(s.discount)}</td></tr>` : ""}
      ${s.type === "inst" ? `<tr><td colspan="3">المقدمة</td><td>${fmt(s.down)}</td></tr>` : ""}
    </tbody></table></div>
    ${s.type === "inst" ? `<h3 class="sec">جدول الأقساط</h3>${strip(s, true)}
    <div class="tbl-wrap" style="margin-top:12px"><table class="tbl"><thead><tr><th>#</th><th>الاستحقاق</th><th>المبلغ</th><th>المدفوع</th><th>الحالة</th><th></th></tr></thead><tbody>
      ${s.schedule.map((x, i) => { const st = instStatus(x); return `<tr><td>${x.n}</td><td>${fmtDate(x.due)}</td><td>${fmt(x.amount)}</td><td>${fmt(x.paid || 0)}${x.paidDate ? `<small class="muted" style="display:block">${fmtDate(x.paidDate)}${x.paidByName ? "، " + esc(x.paidByName) : ""}</small>` : ""}</td><td>${stBadge(st)}</td>
        <td>${st !== "paid" && s.status !== "cancelled" && can("collect") ? `<button class="btn sm primary" data-act="pay" data-id="${s.id}" data-i="${i}" data-ret="sale">تسديد</button>` : ""}</td></tr>`; }).join("")}
    </tbody></table></div>` : ""}
  </div>
  <div class="sheet-foot">${s.status !== "cancelled" && can("cancel") ? `<button class="btn ghost danger" data-act="cancelSale" data-id="${s.id}">إلغاء الفاتورة</button>` : ""}
    ${s.type === "inst" && rem && s.status !== "cancelled" ? (() => { const nx = s.schedule.find(x => (x.paid || 0) < x.amount); const late = nx && nx.due < today(); return waBtn(c.phone, demandMsg(s, nx), late ? "مطالبة واتساب" : "تذكير واتساب", `${s.customerName}، فاتورة ${s.no}، القسط ${nx.n}`); })() : ""}
    <span class="grow"></span><button class="btn" data-act="printSale" data-id="${s.id}">${ic("print", 18)} طباعة</button></div>`, true);
}
async function checkout(){
  if (busy || !ui.cart.length) return;
  for (const c of ui.cart) { const p = prod(c.pid); if (!p) return toast("في السلة منتج محذوف، احذفه أولاً", true); if (c.qty > p.qty) return toast(`الكمية المطلوبة من "${p.name}" أكبر من المتوفر (${p.qty})`, true); }
  const inst = ui.saleType === "inst";
  if (inst && !ui.saleCustomer) return toast("اختر العميل لبيع الأقساط", true);
  const t = cartTotals();
  if (inst && t.rem <= 0) return toast("المبلغ المتبقي للتقسيط يجب أن يكون أكبر من صفر", true);
  const c = cust(ui.saleCustomer);
  const sale = { id:uid(), no:nextNo(), date:today(), createdAt:Date.now(), type:ui.saleType,
    customerId:c ? c.id : "", customerName:c ? c.name : "زبون نقدي", customerPhone:c ? (c.phone || "") : "",
    items:ui.cart.map(x => { const p = prod(x.pid); return { pid:p.id, name:p.name, qty:x.qty, price:x.price, cost:p.cost || 0 }; }),
    subtotal:t.sub, discount:inst ? 0 : t.disc, total:t.total, down:inst ? t.down : 0, months:inst ? t.n : 0, schedule:inst ? t.sched : [], status:inst ? "active" : "done", ...by() };
  busy = true; render();
  try {
    await put("sales", sale);
    for (const it of sale.items) { const p = prod(it.pid); await put("products", { ...p, qty:p.qty - it.qty }); }
    const amt = inst ? sale.down : sale.total;
    if (amt > 0) await put("cash", { id:uid(), date:sale.date, createdAt:Date.now(), type:"in", cat:inst ? "مقدمة أقساط" : "بيع نقدي", amount:amt, note:`فاتورة #${sale.no} - ${sale.customerName}`, saleId:sale.id, ...by() });
  } catch (e) { busy = false; render(); return; }
  busy = false;
  ui.cart = []; ui.discount = 0; ui.down = 0; ui.saleCustomer = ""; ui.months = 0; ui.startDate = addMonths(today(), 1);
  logAct("sale", inst ? "بيع بالأقساط" : "بيع نقدي", `فاتورة #${sale.no}، ${sale.customerName}، ${sale.items.map(i => i.name + (i.qty > 1 ? " ×" + i.qty : "")).join("، ")}، الإجمالي ${money(sale.total)}${inst ? `، المقدمة ${money(sale.down)}` : ""}`, sale.id);
  render(); openSale(sale.id); toast("تم تسجيل البيع");
}
async function cancelSale(id){
  const s = saleById(id); if (!s) return;
  const refund = saleCollected(s);
  const ok = await askConfirm(`سيتم إلغاء الفاتورة #${s.no} وإرجاع الكميات إلى المخزن${refund ? `، وتسجيل استرجاع ${money(refund)} من الخزنة للعميل` : ""}.`, "إلغاء الفاتورة", true);
  if (!ok) return openSale(id);
  try {
    await put("sales", { ...s, status:"cancelled", cancelledAt:Date.now(), cancelledBy:ME.id, cancelledByName:ME.name });
    for (const it of s.items) { const p = prod(it.pid); if (p) await put("products", { ...p, qty:p.qty + it.qty }); }
    if (refund > 0) await put("cash", { id:uid(), date:today(), createdAt:Date.now(), type:"out", cat:"استرجاع", amount:refund, note:`إلغاء فاتورة #${s.no} - ${s.customerName}`, saleId:s.id, ...by() });
  } catch (e) { return; }
  logAct("sale", "إلغاء فاتورة", `فاتورة #${s.no}، ${s.customerName}، ${money(s.total)}${refund ? `، استرجاع ${money(refund)}` : ""}`, s.id);
  closeModal(); toast("تم إلغاء الفاتورة"); render();
}
function payModal(id, idx, ret){
  const s = saleById(id); if (!s) return;
  const x = s.schedule[idx]; const due = x.amount - (x.paid || 0);
  openModal(`${head("تسديد قسط", `${esc(s.customerName)}، فاتورة #${s.no}`)}
  <form id="f-pay" class="sheet-body" data-id="${id}" data-i="${idx}" data-ret="${ret || ""}">
    <div class="kv">
      <div><small>القسط</small><b>${x.n} من ${s.schedule.length}</b></div>
      <div><small>تاريخ الاستحقاق</small><b>${fmtDate(x.due)}</b></div>
      <div><small>المتبقي من القسط</small><b class="num">${money(due)}</b></div>
      <div><small>المتبقي من الفاتورة</small><b class="num">${money(saleRemaining(s))}</b></div>
    </div>
    <div class="fgrid">
      <label class="field"><span>المبلغ المستلم</span><input name="amount" inputmode="numeric" value="${due}" autofocus></label>
      <label class="field"><span>تاريخ الاستلام</span><input name="date" type="date" value="${today()}"></label>
      <label class="field span2"><span>ملاحظة</span><input name="note" placeholder="اختياري"></label>
    </div>
    <p class="hint" style="margin-top:10px">إذا كان المبلغ أكبر من القسط يُخصم الفرق من الأقساط التالية بالترتيب.</p>
  </form>
  <div class="sheet-foot"><span class="grow"></span><button class="btn" data-act="${ret === "sale" ? "openSale" : "closeModal"}" data-id="${id}">رجوع</button><button class="btn primary" type="submit" form="f-pay">تسجيل الدفعة</button></div>`);
}
async function savePay(f){
  const s = saleById(f.dataset.id); if (!s) return;
  const idx = +f.dataset.i, v = Object.fromEntries(new FormData(f));
  let amt = Math.round(num(v.amount)); const rem = saleRemaining(s);
  if (amt <= 0) return toast("اكتب مبلغاً صحيحاً", true);
  if (amt > rem) return toast(`المبلغ أكبر من المتبقي على الفاتورة (${money(rem)})`, true);
  const date = v.date || today();
  const sched = s.schedule.map(x => ({ ...x }));
  let l = amt; const touched = [];
  for (let j = idx; j < sched.length && l > 0; j++) { const need = sched[j].amount - (sched[j].paid || 0); if (need <= 0) continue; const take = Math.min(need, l); sched[j].paid = (sched[j].paid || 0) + take; sched[j].paidDate = date; sched[j].paidBy = ME.id; sched[j].paidByName = ME.name; l -= take; touched.push(sched[j].n); }
  for (let j = 0; j < sched.length && l > 0; j++) { const need = sched[j].amount - (sched[j].paid || 0); if (need <= 0) continue; const take = Math.min(need, l); sched[j].paid = (sched[j].paid || 0) + take; sched[j].paidDate = date; sched[j].paidBy = ME.id; sched[j].paidByName = ME.name; l -= take; touched.push(sched[j].n); }
  const ns = { ...s, schedule:sched };
  ns.status = sum(sched, x => Math.max(0, x.amount - (x.paid || 0))) <= 0 ? "done" : "active";
  try {
    await put("sales", ns);
    await put("cash", { id:uid(), date, createdAt:Date.now(), type:"in", cat:"قسط", amount:amt, note:`فاتورة #${s.no} - ${s.customerName} - القسط ${touched.join("، ")}${v.note ? " - " + v.note.trim() : ""}`, saleId:s.id, ...by() });
  } catch (e) { return; }
  logAct("collect", "استحصال قسط", `فاتورة #${s.no}، ${s.customerName}، القسط ${touched.join("، ")}، المبلغ ${money(amt)}`, s.id);
  toast(`تم تسجيل دفعة ${money(amt)}`);
  if (f.dataset.ret === "sale") openSale(s.id); else closeModal();
  render();
}
function invoiceHTML(s){
  const st = S.settings;
  return `<div class="ph"><div><h2>${esc(st.storeName)}</h2><div>${esc(st.address || "")}</div><div>${esc(st.phone || "")}</div></div>
    <div style="text-align:end"><h2>فاتورة ${s.type === "inst" ? "بيع بالأقساط" : "بيع نقدي"}</h2><div>رقم: ${s.no}</div><div>التاريخ: ${fmtDate(s.date)}</div></div></div>
    ${s.byName ? `<p><b>البائع:</b> ${esc(s.byName)}</p>` : ""}<p><b>العميل:</b> ${esc(s.customerName)} ${s.customerPhone ? " &nbsp; <b>الهاتف:</b> " + esc(s.customerPhone) : ""}</p>
    <table><thead><tr><th>المنتج</th><th>الكمية</th><th>السعر</th><th>المجموع</th></tr></thead><tbody>
    ${s.items.map(i => `<tr><td>${esc(i.name)}</td><td>${i.qty}</td><td>${fmt(i.price)}</td><td>${fmt(i.price * i.qty)}</td></tr>`).join("")}</tbody></table>
    <p>${s.discount ? `الخصم: ${money(s.discount)}<br>` : ""}<b>الإجمالي: ${money(s.total)}</b>${s.type === "inst" ? `<br>المقدمة: ${money(s.down)}<br>المبلغ المقسط: ${money(s.total - s.down)} على ${s.schedule.length} أشهر` : ""}</p>
    ${s.type === "inst" ? `<table><thead><tr><th>#</th><th>تاريخ الاستحقاق</th><th>المبلغ</th><th>المدفوع</th></tr></thead><tbody>${s.schedule.map(x => `<tr><td>${x.n}</td><td>${fmtDate(x.due)}</td><td>${fmt(x.amount)}</td><td>${fmt(x.paid || 0)}</td></tr>`).join("")}</tbody></table>
    <div class="sig"><span>توقيع العميل: ..................</span><span>توقيع المعرض: ..................</span></div>` : ""}
    <p style="margin-top:24px;text-align:center">${esc(st.footer || "")}</p>`;
}

/* ---------- treasury ---------- */
function cashModal(type){
  const cats = type === "in" ? CASH_IN.filter(c => !["بيع نقدي", "قسط", "مقدمة أقساط"].includes(c)) : CASH_OUT.filter(c => c !== "استرجاع");
  openModal(`${head(type === "in" ? "تسجيل إيداع" : "تسجيل مصروف")}
  <form id="f-cash" class="sheet-body" data-type="${type}"><div class="fgrid">
    <label class="field"><span>البند</span><select name="cat">${cats.map(c => `<option>${c}</option>`).join("")}</select></label>
    <label class="field"><span>المبلغ</span><input name="amount" inputmode="numeric" required autofocus></label>
    <label class="field"><span>التاريخ</span><input name="date" type="date" value="${today()}"></label>
    <label class="field"><span>ملاحظة</span><input name="note"></label>
  </div></form>
  <div class="sheet-foot"><span class="grow"></span><button class="btn" data-act="closeModal">إلغاء</button><button class="btn primary" type="submit" form="f-cash">حفظ</button></div>`);
}
async function saveCash(f){
  const v = Object.fromEntries(new FormData(f));
  const amt = Math.round(num(v.amount)); if (amt <= 0) return toast("اكتب مبلغاً صحيحاً", true);
  try { await put("cash", { id:uid(), date:v.date || today(), createdAt:Date.now(), type:f.dataset.type, cat:v.cat, amount:amt, note:(v.note || "").trim(), ...by() }); } catch (e) { return; }
  logAct("cash", f.dataset.type === "in" ? "إيداع في الخزنة" : "مصروف من الخزنة", `${v.cat}، ${money(amt)}${v.note ? "، " + v.note.trim() : ""}`);
  closeModal(); toast("تم الحفظ"); render();
}

/* ---------- backup ---------- */
async function exportData(){
  const data = JSON.stringify({ app:"bayt-jadid", version:1, exportedAt:new Date().toISOString(), ...S }, null, 1);
  const filename = `نسخة-البيت-الجديد-${today()}.json`;
  let dl = null; try { if (window.claude && window.claude.use) dl = await window.claude.use("downloads"); } catch (e) {}
  if (dl) { try { await dl.save({ filename, data }); toast("تم حفظ النسخة الاحتياطية"); } catch (e) { if (e && e.code !== "declined") toast("تعذّر تنزيل الملف", true); } return; }
  try { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([data], { type:"application/json" })); a.download = filename; a.click(); } catch (e) { toast("التنزيل غير متاح هنا", true); }
}
async function importData(file){
  let d; try { d = JSON.parse(await file.text()); } catch (e) { return toast("الملف غير صالح", true); }
  if (!d || !Array.isArray(d.products)) return toast("هذا الملف ليس نسخة احتياطية من المعرض", true);
  const n = COLS.reduce((a, k) => a + (Array.isArray(d[k]) ? d[k].length : 0), 0);
  const ok = await askConfirm(`سيتم دمج ${n} سجلاً من النسخة مع بياناتك الحالية. السجلات المتطابقة تُستبدل بنسخة الملف.`, "استرجاع");
  if (!ok) return closeModal();
  closeModal(); toast("جارٍ الاسترجاع...");
  try {
    for (const k of COLS) for (const o of (d[k] || [])) if (o && o.id) await put(k, o);
    if (d.settings) { Object.assign(S.settings, d.settings); await saveSettings(); }
  } catch (e) { return; }
  toast("تم استرجاع البيانات"); render();
}
function applyTheme(t){ const r = document.documentElement; if (t === "light" || t === "dark") r.setAttribute("data-theme", t); else r.removeAttribute("data-theme"); }

/* ---------- actions ---------- */
const GUARD = { newProduct:"products", delProduct:"products", addCart:"sell", cartQty:"sell", saleType:"sell", checkout:"sell", sellTo:"sell",
  cancelSale:"cancel", pay:"collect", newCash:"treasury", delCash:"treasury", exportData:"settings", editCustomer:"customers", delCustomer:"customers" };
const ADMIN_ONLY = ["newUser", "editUser", "delUser"];
const PUBLIC = ["recover", "closeModal", "confirmYes", "confirmNo"];
const ACT = {
  logout:() => { logAct("auth", "تسجيل خروج", ""); ME = null; clearSession(); ui.cart = []; closeModal(); render(); window.scrollTo(0, 0); },
  recover:() => recoverModal(),
  changePass:() => passModal(),
  newRecovery:() => newRecoveryCode(),
  newUser:() => userModal(null),
  editUser:d => userModal(S.users.find(u => u.id === d.id)),
  preset:d => { const set = PRESETS[d.v] || []; document.querySelectorAll("#f-user input[name=perm]").forEach(cb => { cb.checked = set.includes(cb.value); }); },
  delUser:async d => { const u = S.users.find(x => x.id === d.id); if (!u) return;
    if (u.admin && S.users.filter(x => x.admin && x.active !== false).length <= 1) return toast("لا يمكن حذف آخر مدير", true);
    if (!(await askConfirm(`حذف المستخدم "${esc(u.name)}"؟ فواتيره السابقة تبقى باسمه. لإيقافه مؤقتاً ألغِ تفعيل الحساب بدلاً من الحذف.`, "حذف", true))) return userModal(u);
    try { await del("users", u.id); } catch (e) { return; } logAct("user", "حذف مستخدم", `${u.name} (${u.username})`); closeModal(); toast("تم حذف المستخدم"); render(); },
  nav:d => { ui.view = d.v; closeModal(); render(); window.scrollTo(0, 0); },
  more:() => openModal(`${head("المزيد")}<div class="sheet-body"><div class="mini">${NAV.filter(([k]) => VIS[k]() && !primaryKeys().includes(k)).map(([k, l, i]) => `<button class="mini-r" data-act="nav" data-v="${k}">${ic(i)}<span class="t"><b>${l}</b></span></button>`).join("")}<button class="mini-r" data-act="logout">${ic("logout")}<span class="t"><b>تسجيل الخروج</b><small>${esc(ME ? ME.name : "")}</small></span></button></div></div>`),
  closeModal,
  confirmYes:() => { const cb = confirmCb; confirmCb = null; if (cb) cb(true); },
  confirmNo:() => { const cb = confirmCb; confirmCb = null; closeModal(); if (cb) cb(false); },
  newProduct:() => productModal(null),
  editProduct:d => productModal(prod(d.id)),
  clearImg:() => { editImg = ""; $("#imgprev").innerHTML = ic("image", 36); },
  delProduct:async d => { const p = prod(d.id); if (!(await askConfirm(`حذف المنتج "${esc(p.name)}"؟ الفواتير السابقة لن تتأثر.`, "حذف", true))) return productModal(p); try { await del("products", d.id); } catch (e) { return; } logAct("product", "حذف منتج", `${p.name}، الكمية ${p.qty}`); ui.cart = ui.cart.filter(c => c.pid !== d.id); closeModal(); toast("تم حذف المنتج"); render(); },
  addCart:d => { const p = prod(d.id); if (!p) return; const c = ui.cart.find(x => x.pid === p.id); if (c) { if (c.qty >= p.qty) return toast("لا توجد كمية إضافية في المخزن", true); c.qty++; } else ui.cart.push({ pid:p.id, qty:1, price:ui.saleType === "inst" ? (p.inst || p.cash) : p.cash }); render(); },
  cartQty:d => { const c = ui.cart[+d.i]; const p = prod(c.pid); const nq = c.qty + (+d.d); if (nq < 1) { ui.cart.splice(+d.i, 1); } else if (p && nq > p.qty) return toast("لا توجد كمية إضافية في المخزن", true); else c.qty = nq; render(); },
  cartDel:d => { ui.cart.splice(+d.i, 1); render(); },
  saleType:d => { ui.saleType = d.v; ui.cart.forEach(c => { const p = prod(c.pid); if (p) c.price = d.v === "inst" ? (p.inst || p.cash) : p.cash; }); render(); },
  toCart:() => { const el = $("#cart"); if (el) el.scrollIntoView({ behavior:"smooth", block:"start" }); },
  checkout,
  newCustomer:d => customerForm(null, d.from),
  editCustomer:d => customerForm(cust(d.id)),
  openCustomer:d => openCustomer(d.id),
  delCustomer:async d => { const c = cust(d.id); if (!(await askConfirm(`حذف العميل "${esc(c.name)}"؟`, "حذف", true))) return openCustomer(d.id); try { await del("customers", d.id); } catch (e) { return; } logAct("customer", "حذف عميل", `${c.name}، ${c.phone || ""}`); closeModal(); toast("تم حذف العميل"); render(); },
  sellTo:d => { ui.saleCustomer = d.id; ui.view = "pos"; closeModal(); render(); window.scrollTo(0, 0); },
  openSale:d => openSale(d.id),
  cancelSale:d => cancelSale(d.id),
  printSale:d => { const s = saleById(d.id); if (!s) return; $("#print").innerHTML = invoiceHTML(s); try { window.print(); } catch (e) { toast("الطباعة غير متاحة هنا", true); } },
  pay:d => payModal(d.id, +d.i, d.ret),
  itab:d => { ui.itab = d.v; render(); },
  goInst:d => { ui.view = "installments"; ui.itab = d.v; render(); window.scrollTo(0, 0); },
  allMonths:() => { ui.smonth = ""; render(); },
  allTMonths:() => { ui.tmonth = ""; render(); },
  allLMonths:() => { ui.lmonth = ""; render(); },
  newCash:d => cashModal(d.v),
  delCash:async d => { const ce = S.cash.find(x => x.id === d.id); if (!(await askConfirm("حذف هذه الحركة من الخزنة؟", "حذف", true))) return closeModal(); try { await del("cash", d.id); } catch (e) { return; } if (ce) logAct("cash", "حذف حركة خزنة", `${ce.cat}، ${money(ce.amount)}، ${ce.note || ""}`); closeModal(); toast("تم الحذف"); render(); },
  exportData
};
document.addEventListener("click", e => {
  const wa = e.target.closest("[data-walog]");
  if (wa && ME) { logAct("notify", "إرسال مطالبة واتساب", wa.dataset.walog); return; }
  const el = e.target.closest("[data-act]");
  if (!el) { if (e.target.id === "modal") { if (confirmCb) ACT.confirmNo(); else closeModal(); } return; }
  const a = el.dataset.act, fn = ACT[a];
  if (!fn) return;
  e.preventDefault();
  if (!ME && !PUBLIC.includes(a)) return;
  if (a === "newCustomer" && !(can("customers") || can("sell"))) return toast("ليس لديك صلاحية لهذا الإجراء", true);
  if (GUARD[a] && !can(GUARD[a])) return toast("ليس لديك صلاحية لهذا الإجراء", true);
  if (ADMIN_ONLY.includes(a) && !(ME && ME.admin)) return toast("هذا الإجراء للمدير فقط", true);
  if (a === "nav" && VIS[el.dataset.v] && !VIS[el.dataset.v]()) return toast("ليس لديك صلاحية لهذه الصفحة", true);
  fn(el.dataset, el);
});
document.addEventListener("keydown", e => { if (e.key === "Escape" && !$("#modal").hidden) { if (confirmCb) ACT.confirmNo(); else closeModal(); } });
document.addEventListener("submit", e => {
  e.preventDefault();
  const f = e.target;
  if (!ME && !["f-login", "f-setup", "f-recover"].includes(f.id)) return;
  const FG = { "f-product":"products", "f-pay":"collect", "f-cash":"treasury", "f-settings":"settings" };
  if (FG[f.id] && !can(FG[f.id])) return toast("ليس لديك صلاحية لهذا الإجراء", true);
  if (f.id === "f-user" && !ME.admin) return toast("هذا الإجراء للمدير فقط", true);
  if (f.id === "f-customer" && (f.dataset.id ? !can("customers") : !(can("customers") || can("sell")))) return toast("ليس لديك صلاحية لهذا الإجراء", true);
  const h = { "f-login":doLogin, "f-setup":doSetup, "f-recover":doRecover, "f-user":saveUser, "f-pass":savePass, "f-product":saveProduct, "f-customer":saveCustomer, "f-pay":savePay, "f-cash":saveCash, "f-settings":async form => {
    const v = Object.fromEntries(new FormData(form));
    Object.assign(S.settings, { storeName:v.storeName.trim() || "معرض البيت الجديد", phone:v.phone.trim(), address:v.address.trim(), markup:num(v.markup), months:Math.max(1, Math.round(num(v.months)) || 10), footer:v.footer.trim() });
    try { await saveSettings(); } catch (e) { return; }
    logAct("settings", "تعديل الإعدادات", `${S.settings.storeName}، زيادة الأقساط ${S.settings.markup}%، ${S.settings.months} أشهر`);
    toast("تم حفظ الإعدادات"); render();
  } }[f.id];
  if (h) h(f);
});
document.addEventListener("input", e => {
  const t = e.target;
  if (t.dataset.bind) { ui[t.dataset.bind] = t.hasAttribute("data-num") ? num(t.value) : t.value; render(); return; }
  if (t.dataset.cprice != null) { const c = ui.cart[+t.dataset.cprice]; if (c) c.price = num(t.value); render(); return; }
  if (t.form && t.form.id === "f-product" && (t.name === "cash" || t.name === "inst")) productCalc(t.form, t.name);
});
document.addEventListener("change", async e => {
  const t = e.target;
  if (t.id === "imgfile" && t.files[0]) {
    try { editImg = await compressImage(t.files[0]); $("#imgprev").innerHTML = `<img src="${editImg}" alt="">`; }
    catch (err) { toast("تعذّر قراءة الصورة", true); }
  }
  if (t.id === "importfile" && t.files[0]) { await importData(t.files[0]); t.value = ""; }
  if (t.id === "u-admin") { const b = $("#permbox"); if (b) b.className = t.checked ? "off" : ""; }
  if (t.id === "themeSel") { try { localStorage.setItem("bayt-theme", t.value); } catch (err) {} applyTheme(t.value); }
});

/* ---------- boot ---------- */
async function boot(){
  try { applyTheme(localStorage.getItem("bayt-theme") || "auto"); } catch (e) {}
  render();
  let db = null;
  try { if (window.claude && typeof window.claude.use === "function") db = await window.claude.use("db"); } catch (e) { db = null; }
  if (!db) { MODE = "local"; lsLoad(); ready = true; render(); return; }
  DB = db; MODE = "cloud";
  const seen = new Set();
  const mark = k => { if (!seen.has(k)) { seen.add(k); if (seen.size === COLS.length + 1) { ready = true; } } };
  let rt = 0;
  const rerender = () => { if (!ready) return; clearTimeout(rt); rt = setTimeout(render, 40); };
  const onErr = e => { if (e && e.code === "revoked") { readOnly = true; toast("انتهت صلاحية الوصول للبيانات", true); } };
  COLS.forEach(k => DB.collection(k).onSnapshot(snap => {
    S[k] = snap.docs.map(d => ({ id:d.id, ...clean(d.data() || {}) }));
    const was = ready; mark(k); if (!was && ready) render(); else rerender();
  }, onErr));
  DB.doc("meta/settings").onSnapshot(snap => {
    if (snap.exists) Object.assign(S.settings, clean(snap.data()));
    const was = ready; mark("settings"); if (!was && ready) render(); else rerender();
  }, onErr);
  setTimeout(() => { if (!ready) { ready = true; render(); } }, 8000);
}
boot();
})();
