/* =========================================================
   UniKG — apply.js
   1. Справочники   2. Мастер заявки (apply.html)
   3. Вход / регистрация (login.html)   4. Личный кабинет (cabinet.html)
   ДЕМО: данные хранятся только в браузере (localStorage). Файлы не отправляются.
   ========================================================= */

/* ---------- 1. СПРАВОЧНИКИ ---------- */
const COUNTRIES = [
  ["KG", "Кыргызстан", "Кыргызстан", "Kyrgyzstan"], ["KZ", "Казахстан", "Казакстан", "Kazakhstan"],
  ["UZ", "Узбекистан", "Өзбекстан", "Uzbekistan"], ["TJ", "Таджикистан", "Тажикстан", "Tajikistan"],
  ["RU", "Россия", "Россия", "Russia"], ["OTHER", "Другая страна", "Башка өлкө", "Other country"]
];
const countryName = c => { const x = COUNTRIES.find(k => k[0] === c) || COUNTRIES[5]; return T(x[1], x[2], x[3]); };
const LEVELS = {
  bachelor: { ru: "Бакалавриат", ky: "Бакалавриат", en: "Bachelor's" },
  master:   { ru: "Магистратура", ky: "Магистратура", en: "Master's" },
  other:    { ru: "Другое (аспирантура и др.)", ky: "Башка (аспирантура ж.б.)", en: "Other (PhD, etc.)" }
};
const DOC_ORDER = ["certificate", "passport", "photo", "transcript", "medical", "nostr", "transl"];
const DOCS_REQ = {
  certificate: { t: T("Аттестат об окончании школы", "Мектепти бүтүргөндүгү тууралуу аттестат", "School-leaving certificate"),
    d: T("Документ об окончании школы. Если он ещё не выдан — загрузите справку или выписку оценок из школы.", "Мектепти бүтүргөндүгү тууралуу документ. Азырынча берилбесе — мектептин справкасын же бааларынын көчүрмөсүн жүктөңүз.", "The certificate or diploma proving you finished school. If not issued yet, upload the transcript your school gives.") },
  passport: { t: T("Паспорт", "Паспорт", "Passport"),
    d: T("Скан или чёткое фото главной страницы: фото, ФИО и номер. Должны быть видны все четыре угла.", "Башкы беттин скану же даана сүрөтү: сүрөт, аты-жөнү жана номери. Төрт бурчу тең көрүнсүн.", "A scan or clear photo of the main page with your photo, name and number. All four corners visible.") },
  photo: { t: T("Фото 3×4", "3×4 сүрөт", "Photo 3×4"),
    d: T("Фото на светлом фоне. Подойдёт чёткое фото напечатанного снимка с телефона.", "Ачык фондогу сүрөт. Басылган сүрөттүн телефондогу даана сүрөтү да жарайт.", "A plain photo on a light background. A clear phone photo of a printed one is fine.") },
  transcript: { t: T("Академическая справка (табель оценок)", "Академиялык справка (бааалар тизмеси)", "Academic transcript"),
    d: T("Перечень изученных предметов и оценки по каждому.", "Окулган предметтер жана ар биринин баасы.", "Subjects studied and the grade for each.") },
  medical: { t: T("Медицинская справка", "Медициналык справка", "Medical certificate"),
    d: T("Справка о состоянии здоровья (форма 086-У). Для иностранцев и медицинских направлений.", "Ден соолук тууралуу справка (086-У). Чет элдиктер жана медициналык багыттар үчүн.", "Health certificate (form 086-U). For international applicants and medical programs.") },
  nostr: { t: T("Свидетельство о признании (нострификация)", "Таануу күбөлүгү (нострификация)", "Nostrification certificate"),
    d: T("Нужно, если документ об образовании получен за границей. Уточните в вузе.", "Билим документи чет өлкөдө алынган болсо керек. ЖОЖдон тактаңыз.", "Needed if your education document is foreign. Confirm with the institution.") },
  transl: { t: T("Нотариальные переводы", "Нотариалдык котормолор", "Notarized translations"),
    d: T("Переводы документов на русский или кыргызский язык, заверенные нотариусом.", "Документтердин орус же кыргыз тилине нотариалдык котормосу.", "Notarized translations of your documents into Russian or Kyrgyz.") }
};
const isMedInst = i => i && (i.med === true || (i.tags || []).includes("med"));
function requiredDocs(country, insts) {
  const k = ["certificate", "passport", "photo"];
  const foreign = country !== "KG";
  if (foreign) k.push("transcript", "nostr", "transl");
  if (foreign || insts.some(isMedInst)) k.push("medical");
  return DOC_ORDER.filter(x => k.includes(x));
}
const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const dirLabel = k => (k && DIRECTIONS[k]) ? t(DIRECTIONS[k]) : "—";

/* ---------- 2. МАСТЕР ЗАЯВКИ ---------- */
function initApply() {
  const root = $("wizard");
  if (!root) return;
  const d0 = DB.get(), logged = !!(d0.session && d0.user);
  const W = { step: 0, school: logged ? d0.user.school || "" : "", name: logged ? d0.user.name : "", country: logged ? d0.user.country || "KG" : "KG",
    kind: "uni", picks: [], prog: {}, level: "bachelor", docs: logged ? Object.assign({}, d0.docs) : {} };
  const pre = findInst(new URLSearchParams(location.search).get("add"));
  if (pre) { W.picks = [pre.id]; W.kind = pre.kind; }
  const LAST = logged ? 5 : 6;
  const insts = () => W.picks.map(findInst).filter(Boolean);
  const nav = (back, next, label) => `<div class="wz-nav">${back ? `<button type="button" class="btn btn-line" data-go="back">${T("Назад", "Артка", "Back")}</button>` : "<span></span>"}${next ? `<button type="button" class="btn" data-go="next">${label || T("Продолжить", "Улантуу", "Continue")}</button>` : ""}</div>`;
  const err = `<p class="wz-err" id="wErr"></p>`;

  const views = [
    // 0. школа
    () => `<h2>${T("Какую школу вы окончили?", "Кайсы мектепти бүтүрдүңүз?", "Which school did you graduate from?")}</h2>
      <label for="wSchool">${T("Школа", "Мектеп", "School")}</label><input id="wSchool" value="${esc(W.school)}" autocomplete="off">
      <label for="wName">${T("Полное имя", "Толук аты-жөнү", "Full name")}</label><input id="wName" value="${esc(W.name)}" autocomplete="name">
      <label for="wCountry">${T("Страна", "Өлкө", "Country")}</label>
      <select id="wCountry">${COUNTRIES.map(c => OPT(c[0], c[1], c[2], c[3], c[0] === W.country)).join("")}</select>${err}${nav(false, true)}`,
    // 1. вуз или колледж
    () => `<h2>${T("Где вы хотите учиться: в университете или в колледже?", "Кайда окугуңуз келет: университетпи же колледжби?", "Do you want to study at a university or a college?")}</h2>
      <div class="opts">${[["uni", "🎓", T("Университет", "Университет", "University")], ["col", "🏫", T("Колледж", "Колледж", "College")], ["both", "✨", T("И то и другое", "Экөө тең", "Both")]]
        .map(o => `<button type="button" class="opt ${W.kind === o[0] ? "on" : ""}" data-kind="${o[0]}"><span class="ic">${o[1]}</span>${o[2]}</button>`).join("")}</div>${nav(true, false)}`,
    // 2. выбор учреждений
    () => `<h2>${T("Куда вы хотите поступить?", "Кайда тапшыргыңыз келет?", "Where do you want to study?")}</h2>
      <p class="lead">${T("Можно выбрать 3, 4 и больше учебных заведений.", "3, 4 жана андан көп окуу жайын тандай аласыз.", "You can choose 3, 4 or more institutions.")}</p>
      <div class="chip-list">${insts().map(i => `<span class="pick-chip">${logo(i)}<b>${i.abbr}</b><button type="button" data-rm="${i.id}" aria-label="remove">×</button></span>`).join("")}
        <button type="button" class="btn btn-sm" data-open>+ ${T("Добавить", "Кошуу", "Add")}</button></div>${err}${nav(true, true)}`,
    // 3. направление и уровень
    () => `<h2>${T("Какой факультет или направление вы выбираете?", "Кайсы факультет же багытты тандайсыз?", "Which faculty or field do you choose?")}</h2>
      ${insts().map(i => `<div class="prog-row">${logo(i)}<b>${i.name}</b>
        <select data-prog="${i.id}">${OPT("", "— выберите —", "— тандаңыз —", "— choose —")}${Object.keys(DIRECTIONS).map(k => OPT(k, DIRECTIONS[k].ru, DIRECTIONS[k].ky, DIRECTIONS[k].en, W.prog[i.id] === k)).join("")}</select></div>`).join("")}
      ${insts().some(i => i.kind === "uni") ? `<h3>${T("Уровень обучения", "Окуу деңгээли", "Level of study")}</h3>
        <div class="opts small">${Object.keys(LEVELS).map(k => `<label class="opt-radio"><input type="radio" name="lvl" value="${k}" ${W.level === k ? "checked" : ""}><span>${t(LEVELS[k])}</span></label>`).join("")}</div>` : ""}${nav(true, true)}`,
    // 4. документы
    () => `<h2>${T("Загрузите документы", "Документтериңизди жүктөңүз", "Upload your documents")}</h2>
      <p class="lead">${T("Подойдёт чёткое фото. Любой документ можно переснять позже.", "Даана сүрөт жетиштүү. Каалаган документти кийин кайра тартсаңыз болот.", "A clear photo is fine. You can retake any of these later.")}</p>
      ${requiredDocs(W.country, insts()).map(k => `<div class="doc-up"><div><b>${DOCS_REQ[k].t}</b><small>${DOCS_REQ[k].d}</small><span class="fname" id="fn-${k}">${W.docs[k] ? "✓ " + esc(W.docs[k]) : ""}</span></div>
        <label class="btn btn-sm">${T("Загрузить", "Жүктөө", "Upload")}<input type="file" data-doc="${k}" accept="image/*,.pdf" hidden></label></div>`).join("")}
      <p class="fnote">${T("Демо: файлы пока не отправляются на сервер, запоминается только название.", "Демо: файлдар азырынча серверге жөнөтүлбөйт, аталышы гана сакталат.", "Demo: files are not sent to a server yet; only the file name is kept.")}</p>${nav(true, true)}`,
    // 5. проверка
    () => `<h2>${T("Проверьте данные", "Маалыматты текшериңиз", "Check your details")}</h2>
      <div class="review">
        <div><span>${T("Имя", "Аты-жөнү", "Name")}</span><b>${esc(W.name)}</b></div>
        <div><span>${T("Страна", "Өлкө", "Country")}</span><b>${countryName(W.country)}</b></div>
        <div><span>${T("Школа", "Мектеп", "School")}</span><b>${esc(W.school)}</b></div>
        <h3>${T("Подаёте в", "Тапшырасыз", "Applying to")} (${insts().length})</h3>
        ${insts().map(i => `<div class="rv-inst">${logo(i)}<div><b>${i.name}</b><span>${dirLabel(W.prog[i.id])}${i.kind === "uni" ? " · " + t(LEVELS[W.level]) : ""}</span></div></div>`).join("")}
        <h3>${T("Документы", "Документтер", "Documents")}</h3>
        ${requiredDocs(W.country, insts()).map(k => `<div class="rv-doc ${W.docs[k] ? "ok" : "miss"}"><span>${W.docs[k] ? "✓" : "•"}</span>${DOCS_REQ[k].t}${W.docs[k] ? "" : ` <em>${T("— загрузите позже в кабинете", "— кийин кабинетте жүктөңүз", "— upload later in your dashboard")}</em>`}</div>`).join("")}
      </div>${nav(true, true, T("Всё верно", "Баары туура", "Everything correct"))}`,
    // 6. аккаунт
    () => `<h2>${T("Создайте аккаунт", "Аккаунт түзүңүз", "Create your account")}</h2>
      <label for="aEmail">${T("Email или телефон", "Email же телефон", "Email or phone")}</label><input id="aEmail" required>
      <label for="aPass">${T("Пароль", "Сырсөз", "Password")}</label><input id="aPass" type="password" minlength="6">
      <label class="agree"><input type="checkbox" id="aAgree"><span>${T("Я согласен(на) с Условиями использования и Политикой конфиденциальности", "Мен Колдонуу шарттары жана Купуялык саясаты менен макулмун", "I agree to the Terms & Conditions and Privacy Policy")}</span></label>${err}${nav(true, true, T("Зарегистрироваться", "Катталуу", "Register"))}`
  ];

  const say = (ru, ky, en) => { const e = $("wErr"); if (e) e.innerHTML = T(ru, ky, en); };
  function render() {
    const n = LAST + 1;
    root.innerHTML = `<div class="wz-bar"><span style="width:${((W.step + 1) / n) * 100}%"></span></div><div class="card wz">${views[W.step]()}</div>`;
    fixLogos(); window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function save(account) {
    DB.update(d => {
      d.user = Object.assign(d.user || {}, { name: W.name, country: W.country, school: W.school }, account || {});
      d.session = true; d.apps = d.apps || []; d.docs = Object.assign(d.docs || {}, W.docs);
      insts().forEach(i => { if (!d.apps.some(a => a.id === i.id)) d.apps.push({ id: i.id, program: W.prog[i.id] || "", level: i.kind === "uni" ? W.level : "spo", date: new Date().toISOString().slice(0, 10) }); });
    });
    location.href = "cabinet.html";
  }
  function next() {
    if (W.step === 0) {
      W.school = $("wSchool").value.trim(); W.name = $("wName").value.trim(); W.country = $("wCountry").value;
      if (!W.school || !W.name) return say("Укажите школу и имя.", "Мектепти жана атыңызды жазыңыз.", "Please enter your school and name.");
    }
    if (W.step === 2 && !W.picks.length) return say("Добавьте хотя бы одно учебное заведение.", "Жок дегенде бир окуу жайын кошуңуз.", "Add at least one institution.");
    if (W.step === 5 && logged) return save();
    if (W.step === 6) {
      const em = $("aEmail").value.trim().toLowerCase();
      if (!em || !$("aAgree").checked) return say("Введите email или телефон и подтвердите согласие.", "Email же телефонду жазып, макулдугуңузду тастыктаңыз.", "Enter your email or phone and accept the terms.");
      return save({ email: em });
    }
    W.step++; render();
  }

  // модальное окно «+ Добавить»
  function openPicker() {
    const box = $("picker");
    const groups = [];
    if (W.kind !== "col") groups.push([T("Университеты", "Университеттер", "Universities"), UNIS]);
    if (W.kind !== "uni") groups.push([T("Колледжи", "Колледждер", "Colleges"), COLLEGES]);
    box.hidden = false;
    box.innerHTML = `<div class="modal-box"><div class="modal-head"><h3>${T("Выберите учебные заведения", "Окуу жайларын тандаңыз", "Choose institutions")}</h3><button type="button" class="icon-btn" data-x aria-label="close">✕</button></div>
      <div class="modal-search"><input id="pq" type="search" autocomplete="off"></div><div class="modal-list" id="pl"></div>
      <div class="modal-foot"><span id="pc"></span><button type="button" class="btn" data-x>${T("Готово", "Даяр", "Done")}</button></div></div>`;
    const count = () => { $("pc").textContent = W.picks.length; };
    const draw = () => {
      const q = $("pq").value.trim().toLowerCase();
      $("pl").innerHTML = groups.map(([title, arr]) => {
        const rows = arr.filter(i => (i.name + " " + i.abbr).toLowerCase().includes(q)).map(i =>
          `<label class="pick-row"><input type="checkbox" value="${i.id}" ${W.picks.includes(i.id) ? "checked" : ""}>${logo(i)}<span><b>${i.name}</b><small>${i.kind === "uni" ? t(CITIES[i.city]) : i.addr}</small></span></label>`).join("");
        return rows ? `<h4 class="pick-h">${title}</h4>${rows}` : "";
      }).join("");
      fixLogos(); count();
    };
    const close = () => { box.hidden = true; render(); };
    box.onclick = e => { if (e.target === box || e.target.closest("[data-x]")) close(); };
    box.onchange = e => { if (e.target.type === "checkbox") { const id = e.target.value; W.picks = e.target.checked ? [...new Set([...W.picks, id])] : W.picks.filter(x => x !== id); count(); } };
    box.oninput = e => { if (e.target.id === "pq") draw(); };
    draw();
  }

  root.addEventListener("click", e => {
    const b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.go === "next") next();
    if (b.dataset.go === "back") { W.step--; render(); }
    if (b.dataset.kind) { W.kind = b.dataset.kind; W.step = 2; render(); }
    if (b.dataset.rm) { W.picks = W.picks.filter(x => x !== b.dataset.rm); render(); }
    if (b.hasAttribute("data-open")) openPicker();
  });
  root.addEventListener("change", e => {
    const el = e.target;
    if (el.dataset.prog !== undefined) W.prog[el.dataset.prog] = el.value;
    if (el.name === "lvl") W.level = el.value;
    if (el.dataset.doc) { const f = el.files[0]; W.docs[el.dataset.doc] = f ? f.name : ""; $("fn-" + el.dataset.doc).textContent = f ? "✓ " + f.name : ""; }
  });
  render();
}

/* ---------- 3. ВХОД / РЕГИСТРАЦИЯ ---------- */
function initAuth() {
  const form = $("authForm");
  if (!form) return;
  const auth = $("auth"), msg = $("authMsg");
  const say = (ru, ky, en) => { msg.innerHTML = T(ru, ky, en); msg.style.display = "block"; };
  form.addEventListener("submit", e => {
    e.preventDefault();
    const email = $("em").value.trim().toLowerCase(), d = DB.get();
    if (auth.dataset.mode === "up") {
      DB.update(x => { x.user = { name: $("nm").value.trim(), email, country: "KG", school: "" }; x.session = true; x.apps = x.apps || []; x.docs = x.docs || {}; });
      location.href = "cabinet.html";
    } else if (d.user && d.user.email === email) {
      DB.update(x => { x.session = true; });
      location.href = "cabinet.html";
    } else say("Аккаунт не найден. Сначала зарегистрируйтесь.", "Аккаунт табылган жок. Адегенде катталыңыз.", "Account not found. Please sign up first.");
  });
  $("googleBtn").addEventListener("click", () => say("Вход через Google появится после подключения сервера.", "Google аркылуу кирүү сервер кошулгандан кийин пайда болот.", "Google sign-in will appear once a server is connected."));
}

/* ---------- 4. ЛИЧНЫЙ КАБИНЕТ ---------- */
function initCabinet() {
  const root = $("dash");
  if (!root) return;
  if (!(DB.get().session && DB.get().user)) { location.replace("login.html"); return; }
  const NAV = [["home", "🏠", T("Главная", "Башкы бет", "Home")], ["apps", "🎓", T("Заявки", "Арыздар", "Applications")], ["docs", "📄", T("Документы", "Документтер", "Documents")], ["profile", "👤", T("Профиль", "Профиль", "Profile")]];
  let tab = (location.hash || "#home").slice(1);
  if (!NAV.some(n => n[0] === tab)) tab = "home";

  function stats(d) {
    const apps = (d.apps || []).map(a => Object.assign({}, a, { inst: findInst(a.id) })).filter(a => a.inst);
    const req = requiredDocs(d.user.country, apps.map(a => a.inst));
    const docs = d.docs || {};
    return { apps, req, have: req.filter(k => docs[k]), miss: req.filter(k => !docs[k]) };
  }
  const status = s => s.miss.length ? `<span class="status warn">${T("Нужны документы", "Документтер керек", "Documents needed")}</span>` : `<span class="status ok">${T("На рассмотрении", "Каралууда", "Under review")}</span>`;
  const emptyApps = `<div class="empty-box"><b>${T("Заявок пока нет.", "Азырынча арыз жок.", "No applications yet.")}</b><span>${T("Выберите вуз или колледж и подайте первую заявку.", "ЖОЖ же колледж тандап, биринчи арызыңызды бериңиз.", "Browse institutions and create your first application.")}</span><a class="btn btn-sm" href="apply.html">${T("Подать заявку", "Арыз берүү", "Start application")}</a></div>`;
  const appCard = (a, s) => `<article class="app-card">${logo(a.inst)}<div class="app-main"><h3>${a.inst.name}</h3>
      <p>${dirLabel(a.program)} · ${a.level === "spo" ? T("СПО (колледж)", "СКБ (колледж)", "Vocational") : t(LEVELS[a.level] || LEVELS.bachelor)} · ${a.date}</p>
      <ol class="tl"><li>${T("Подано", "Тапшырылды", "Submitted")}<small>${a.date}</small></li>
        <li class="${s.miss.length ? "wait" : ""}">${T("Документы", "Документтер", "Documents")}<small>${s.have.length}/${s.req.length}</small></li>
        <li class="wait">${T("Ответ учебного заведения", "Окуу жайынын жообу", "Institution's response")}<small>${T("ожидается", "күтүлөт", "pending")}</small></li></ol></div>${status(s)}</article>`;

  const views = {
    home(d, s) {
      const secs = [[!!(d.user.name && d.user.country && d.user.school), T("Основные данные", "Негизги маалымат", "Basic info")],
        [s.apps.length > 0 && s.apps.every(a => a.program), T("Учёба", "Окуу", "Academic")], [s.req.length > 0 && !s.miss.length, T("Документы", "Документтер", "Documents")]];
      const done = secs.filter(x => x[0]).length, n = s.apps.length;
      return `<h1>${T("Личный кабинет", "Жеке кабинет", "Dashboard")}</h1>
        <div class="card"><div class="eyebrow-s">${T("Заполнение профиля", "Профилди толтуруу", "Profile completion")}</div><h2>${esc(d.user.name)}</h2>
          <p class="muted">${done}/3 ${T("разделов заполнено", "бөлүм толтурулду", "sections complete")}</p>
          <div class="progress"><span style="width:${(done / 3) * 100}%"></span></div>
          <div class="sect-chips">${secs.map(x => `<div class="sect-chip ${x[0] ? "done" : ""}">${x[0] ? "✓" : "○"} ${x[1]}</div>`).join("")}</div></div>
        <div class="card"><div class="eyebrow-s">${T("Мои заявки", "Менин арыздарым", "Application pipeline")}</div><h2>${T("Куда я подал(а) документы", "Кайда документ тапшырдым", "Where I applied")}</h2>
          <div class="pipe"><div><small>${T("Подано", "Тапшырылды", "Submitted")}</small><b>${n}</b></div>
            <div class="${s.miss.length ? "warn" : ""}"><small>${T("Нужны документы", "Документтер керек", "Documents needed")}</small><b>${s.miss.length ? n : 0}</b></div>
            <div class="ok"><small>${T("На рассмотрении", "Каралууда", "Under review")}</small><b>${s.miss.length ? 0 : n}</b></div>
            <div><small>${T("Ответы получены", "Жооптор келди", "Responses")}</small><b>0</b></div></div>
          ${n ? s.apps.map(a => appCard(a, s)).join("") : emptyApps}
          ${n ? `<p class="fnote">${T("Ответы учебных заведений появятся здесь.", "Окуу жайларынын жооптору ушул жерде чыгат.", "Institutions' responses will appear here.")}</p>` : ""}</div>
        ${n && s.miss.length ? `<div class="card warn-card"><h3>${T("Осталось загрузить", "Жүктөө калды", "Still to upload")} (${s.miss.length})</h3><ul class="ach">${s.miss.map(k => `<li><b>${DOCS_REQ[k].t}</b></li>`).join("")}</ul><a class="btn btn-sm" href="#docs">${T("Загрузить документы", "Документтерди жүктөө", "Upload documents")}</a></div>` : ""}`;
    },
    apps(d, s) {
      return `<h1>${T("Мои заявки", "Менин арыздарым", "My applications")}</h1>${s.apps.length ? s.apps.map(a => `<div class="card">${appCard(a, s)}</div>`).join("") : `<div class="card">${emptyApps}</div>`}
        <a class="btn" href="apply.html">+ ${T("Подать ещё заявку", "Дагы арыз берүү", "New application")}</a>`;
    },
    docs(d, s) {
      const docs = d.docs || {};
      return `<h1>${T("Мои документы", "Менин документтерим", "My documents")}</h1>
        <p class="lead">${T("Загружено", "Жүктөлдү", "Uploaded")}: <b>${s.have.length}</b> ${T("из", "ичинен", "of")} <b>${s.req.length}</b>. ${s.miss.length ? T("Осталось загрузить:", "Жүктөө калды:", "Still missing:") + " " + s.miss.length : T("Всё загружено!", "Баары жүктөлдү!", "All uploaded!")}</p>
        ${s.req.map(k => `<div class="doc-up ${docs[k] ? "done" : "miss"}"><div><b>${DOCS_REQ[k].t}</b><small>${DOCS_REQ[k].d}</small>
          <span class="fname">${docs[k] ? "✓ " + esc(docs[k]) : T("Не загружен", "Жүктөлгөн жок", "Not uploaded")}</span></div>
          <label class="btn btn-sm">${docs[k] ? T("Заменить", "Алмаштыруу", "Replace") : T("Загрузить", "Жүктөө", "Upload")}<input type="file" data-doc="${k}" accept="image/*,.pdf" hidden></label></div>`).join("")}
        <p class="fnote">${T("Демо: файлы не отправляются на сервер, запоминается только название.", "Демо: файлдар серверге жөнөтүлбөйт, аталышы гана сакталат.", "Demo: files are not sent to a server; only the file name is kept.")}</p>`;
    },
    profile(d) {
      const row = (a, b) => `<div class="m-row"><span>${a}</span><b>${b}</b></div>`;
      return `<h1>${T("Профиль", "Профиль", "Profile")}</h1><div class="card">
        ${row(T("Имя", "Аты-жөнү", "Name"), esc(d.user.name))}${row("Email / " + T("телефон", "телефон", "phone"), esc(d.user.email || "—"))}
        ${row(T("Страна", "Өлкө", "Country"), countryName(d.user.country))}${row(T("Школа", "Мектеп", "School"), esc(d.user.school || "—"))}</div>
        <button class="btn btn-line" type="button" id="logout" style="max-width:240px">${T("Выйти", "Чыгуу", "Log out")}</button>`;
    }
  };

  function render() {
    const d = DB.get(), s = stats(d);
    root.innerHTML = `<div class="dash"><aside class="dnav">${NAV.map(n => `<a href="#${n[0]}" class="${n[0] === tab ? "active" : ""}"><span>${n[1]}</span>${n[2]}</a>`).join("")}
      <a href="universities.html"><span>🔎</span>${T("Поиск вузов", "ЖОЖ издөө", "University search")}</a></aside><section class="dmain">${views[tab](d, s)}</section></div>`;
    fixLogos();
  }
  window.addEventListener("hashchange", () => { tab = (location.hash || "#home").slice(1); if (!NAV.some(n => n[0] === tab)) tab = "home"; render(); window.scrollTo(0, 0); });
  root.addEventListener("change", e => {
    if (e.target.dataset.doc) { const f = e.target.files[0]; if (f) { DB.update(d => { d.docs = d.docs || {}; d.docs[e.target.dataset.doc] = f.name; }); render(); } }
  });
  root.addEventListener("click", e => { if (e.target.id === "logout") { DB.update(d => { d.session = false; }); location.href = "index.html"; } });
  render();
}

document.addEventListener("DOMContentLoaded", () => { initApply(); initAuth(); initCabinet(); fixLogos(); });
