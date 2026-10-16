/* =========================================================
   UniKG — main.js
   2. Шапка/футер   3. Язык   4. Тема   5. Доступность
   6. Главная   7. Каталог вузов + фильтры   8. Калькулятор ОРТ   9. Формы
   (данные — в data.js, колледжи — colleges.js, заявка/кабинет — apply.js)
   ========================================================= */

/* ---------- 2. ШАПКА И ФУТЕР ---------- */
function buildLayout() {
  const page = location.pathname.split("/").pop() || "index.html";
  const cur = { "university.html": "universities.html", "college.html": "colleges.html", "blog-post.html": "blog.html" }[page] || page;
  const links = NAV.map(([href, name]) => `<a href="${href}" class="${href === cur ? "active" : ""}">${name}</a>`).join("");

  const header = $("site-header");
  if (header) header.outerHTML = `
    <header class="site-header"><div class="container bar">
      <a class="logo" href="index.html" aria-label="UniKG"><img src="assets/logo.svg" alt=""><span class="logo-text">Uni<b>KG</b></span></a>
      <div class="nav-wrap" id="navWrap">
      <nav class="nav" id="nav">${links}</nav>
      <div class="tools">
      <div class="lang"><button data-lang="ru">RU</button><button data-lang="ky">KG</button><button data-lang="en">EN</button></div>
      <button class="icon-btn" id="themeBtn" aria-label="Theme">◐</button>
      <button class="icon-btn" id="a11yBtn" aria-label="Accessibility">👁</button>
      ${DB.get().session ? `<a class="btn" href="cabinet.html">${T("Кабинет", "Кабинет", "Dashboard")}</a>` : `<a class="btn" href="login.html">${T("Войти", "Кирүү", "Sign in")}</a>`}
      </div></div>
      <button class="menu-btn" id="menuBtn" aria-label="Menu">☰</button>
      <div class="a11y-panel" id="a11yPanel" hidden>
        <b>${T("Версия для слабовидящих", "Начар көргөндөр үчүн", "Accessibility")}</b>
        <div class="a11y-row"><span>${T("Размер текста", "Тексттин өлчөмү", "Text size")}</span><button data-a="size-">A−</button><button data-a="size+">A+</button></div>
        <div class="a11y-row"><span>${T("Контраст", "Контраст", "Contrast")}</span>
          <button data-a="bw">${T("Чёрное на белом", "Агындагы кара", "Black on white")}</button>
          <button data-a="wb">${T("Белое на чёрном", "Караңгыдагы ак", "White on black")}</button></div>
        <div class="a11y-row"><button data-a="img">${T("Скрыть картинки", "Сүрөттөрдү жашыруу", "Hide images")}</button>
          <button data-a="reset">${T("Сбросить", "Баштапкы", "Reset")}</button></div>
      </div>
    </div></header><div class="scrim" id="scrim"></div>`;

  const footer = $("site-footer");
  if (footer) footer.outerHTML = `
    <footer class="site-footer"><div class="container">
      <div class="foot">
        <div><h4>UniKG</h4>${T("Платформа подачи документов в вузы Кыргызстана.", "Кыргызстандын ЖОЖдоруна документ тапшыруу платформасы.", "Document platform for Kyrgyzstan's universities.")}</div>
        <div><h4>${T("Разделы", "Бөлүмдөр", "Sections")}</h4>${links}</div>
        <div><h4>${T("Контакты", "Байланыш", "Contact")}</h4><a href="mailto:info@unikg.kg">info@unikg.kg</a><a href="tel:+996000000000">+996 000 000 000</a></div>
        <div><h4>${T("Соцсети", "Социалдык тармактар", "Social")}</h4><a href="#">Instagram</a><a href="#">Telegram</a><a href="#">WhatsApp</a></div>
      </div>
      <div class="copy">© 2026 UniKG</div>
    </div></footer>`;

  // Выдвижное меню на телефоне
  const toggleMenu = open => {
    $("navWrap").classList.toggle("open", open); $("scrim").classList.toggle("open", open);
    $("menuBtn").textContent = open ? "✕" : "☰"; document.body.style.overflow = open ? "hidden" : "";
  };
  $("menuBtn").addEventListener("click", () => toggleMenu(!$("navWrap").classList.contains("open")));
  $("scrim").addEventListener("click", () => toggleMenu(false));
  document.querySelectorAll("#nav a").forEach(a => a.addEventListener("click", () => toggleMenu(false)));

  // Нижняя панель для телефонов (показывается только на узких экранах)
  const tab = [["index.html", "🏠", T("Главная", "Башкы", "Home")], ["universities.html", "🎓", T("Вузы", "ЖОЖ", "Unis")],
    ["colleges.html", "🏫", T("Колледжи", "Колледж", "Colleges")], ["apply.html", "✍️", T("Заявка", "Арыз", "Apply")],
    [DB.get().session ? "cabinet.html" : "login.html", "👤", DB.get().session ? T("Кабинет", "Кабинет", "Profile") : T("Войти", "Кирүү", "Sign in")]];
  document.body.insertAdjacentHTML("beforeend", `<nav class="tabbar">${tab.map(([h, i, n]) => `<a href="${h}" class="${h === cur ? "active" : ""}"><span class="ic">${i}</span>${n}</a>`).join("")}</nav>`);
}

/* ---------- 3. ЯЗЫК (по умолчанию русский) ---------- */
function setLang(lang) {
  document.documentElement.dataset.lang = lang;
  document.documentElement.lang = lang;
  try { localStorage.setItem("unikg-lang", lang); } catch (e) {}
  document.querySelectorAll(".lang button").forEach(b => b.classList.toggle("active", b.dataset.lang === lang));
  document.querySelectorAll("option[data-ru]").forEach(o => { o.textContent = o.dataset[lang]; });
}
function initLang() {
  let saved = "ru";
  try { saved = localStorage.getItem("unikg-lang") || "ru"; } catch (e) {}
  document.querySelectorAll(".lang button").forEach(b => b.addEventListener("click", () => setLang(b.dataset.lang)));
  setLang(saved);
}

/* ---------- 4. ТЁМНАЯ / СВЕТЛАЯ ТЕМА ---------- */
function initTheme() {
  let mode = null;
  try { mode = localStorage.getItem("unikg-theme"); } catch (e) {}
  if (!mode) mode = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  const apply = m => { document.documentElement.dataset.theme = m; try { localStorage.setItem("unikg-theme", m); } catch (e) {} };
  apply(mode);
  $("themeBtn").addEventListener("click", () => apply(document.documentElement.dataset.theme === "dark" ? "light" : "dark"));
}

/* ---------- 5. ВЕРСИЯ ДЛЯ СЛАБОВИДЯЩИХ ---------- */
function initA11y() {
  let st = { size: 0, contrast: "", noimg: false };
  try { st = Object.assign(st, JSON.parse(localStorage.getItem("unikg-a11y"))); } catch (e) {}
  const root = document.documentElement;
  const apply = () => {
    root.dataset.size = st.size;
    if (st.contrast) root.dataset.contrast = st.contrast; else delete root.dataset.contrast;
    root.dataset.noimg = st.noimg ? "1" : "0";
    try { localStorage.setItem("unikg-a11y", JSON.stringify(st)); } catch (e) {}
  };
  apply();
  const panel = $("a11yPanel");
  $("a11yBtn").addEventListener("click", () => {
    $("navWrap").classList.remove("open"); $("scrim").classList.remove("open"); $("menuBtn").textContent = "☰"; document.body.style.overflow = "";
    panel.hidden = !panel.hidden;
  });
  panel.addEventListener("click", e => {
    const a = e.target.dataset.a;
    if (!a) return;
    if (a === "size+") st.size = Math.min(3, st.size + 1);
    if (a === "size-") st.size = Math.max(0, st.size - 1);
    if (a === "bw" || a === "wb") st.contrast = st.contrast === a ? "" : a;
    if (a === "img") st.noimg = !st.noimg;
    if (a === "reset") st = { size: 0, contrast: "", noimg: false };
    apply();
  });
}

/* ---------- 6. ГЛАВНАЯ ---------- */
function initHome() {
  if (!$("track")) return;
  $("bentoCount").textContent = UNIS.length;
  document.querySelector("[data-a11y]").addEventListener("click", () => $("a11yBtn").click());

  // Бегущая лента логотипов (10 вузов, список повторён для бесконечной прокрутки)
  const items = UNIS.slice(0, 10).map(u => `<div class="m-item">${logo(u)}</div>`).join("");
  $("track").innerHTML = items + items;

  // Три шага (данные в макетах — пример)
  const sample = `<div class="sample">${T("Пример", "Үлгү", "Example")}</div>`;
  const row = (a, b) => `<div class="m-row"><span>${a}</span><b>${b}</b></div>`;
  const pick = [["knu", "Информатика", "Информатика", "Computer science"], ["krsu", "Юриспруденция", "Укук таануу", "Law"], ["kgtu", "Информационные системы", "Маалымат системалары", "Information systems"]]
    .map(([id, ru, ky, en]) => { const u = UNIS.find(x => x.id === id);
      return `<div class="m-row"><span><b>${u.abbr}</b><br>${T(ru, ky, en)}</span><span>${t(CITIES[u.city])}</span></div>`; }).join("");
  $("flow").innerHTML = `
    <article class="card step-card"><span class="num">01</span>
      <h3>${T("Один профиль", "Бир профиль", "One profile")}</h3>
      <p>${T("Загрузите паспорт, аттестат и сертификат ОРТ один раз — данные подставятся в каждую заявку.", "Паспортту, аттестатты жана ЖРТ сертификатын бир жолу жүктөңүз — маалымат ар бир арызга кошулат.", "Upload your passport, diploma and ORT certificate once — they fill every application.")}</p>
      <div class="mock">${sample}
        ${row(T("Полное имя", "Толук аты-жөнү", "Full name"), "Айдана Асанова")}
        ${row(T("Аттестат", "Аттестат", "Diploma"), `<span class="ok">${T("Загружен", "Жүктөлдү", "Uploaded")} ✓</span>`)}
        ${row(T("Сертификат ОРТ", "ЖРТ сертификаты", "ORT certificate"), `<span class="ok">185 ✓</span>`)}
      </div>
      <small>${T("1 профиль", "1 профиль", "1 profile")} · ${UNIS.length} ${T("вузов", "ЖОЖ", "universities")}</small></article>
    <article class="card step-card"><span class="num">02</span>
      <h3>${T("Выберите вузы", "ЖОЖду тандаңыз", "Choose universities")}</h3>
      <p>${T("Сравнивайте программы и фильтруйте по городу, типу вуза и языку обучения.", "Программаларды салыштырып, шаар, ЖОЖдун түрү жана окуу тили боюнча чыпкалаңыз.", "Compare programs and filter by city, university type and language.")}</p>
      <div class="mock">${sample}${pick}</div></article>
    <article class="card step-card"><span class="num">03</span>
      <h3>${T("Следите за статусом", "Статусту көзөмөлдөңүз", "Track your status")}</h3>
      <p>${T("Актуальный статус заявки и уведомление, когда вуз опубликует решение.", "Арыздын азыркы статусу жана ЖОЖ чечимди жарыялаганда билдирме.", "Live application status and a notice when the university decides.")}</p>
      <div class="mock">${sample}<ol class="tl">
        <li>${T("Подано", "Тапшырылды", "Submitted")}<small>${T("15 июня", "15-июнь", "15 Jun")}</small></li>
        <li>${T("Документы проверены", "Документтер текшерилди", "Documents checked")}<small>${T("22 июня", "22-июнь", "22 Jun")}</small></li>
        <li>${T("Назначено собеседование", "Маектешүү дайындалды", "Interview scheduled")}<small>${T("5 июля", "5-июль", "5 Jul")}</small></li>
        <li class="wait">${T("Решение", "Чечим", "Decision")}<small>${T("Ожидается 20 августа", "20-августта күтүлөт", "Expected 20 Aug")}</small></li>
      </ol></div></article>`;

  // Документы: гражданин КР / иностранец
  const DOCS = {
    kg: { must: [
        [T("Паспорт или ID-карта", "Паспорт же ID-карта", "Passport or ID card"), T("Страница с фото, именем и датой рождения.", "Сүрөтү, аты-жөнү жана туулган күнү бар бет.", "The page with your photo, name and date of birth.")],
        [T("Аттестат или диплом колледжа", "Аттестат же колледж диплому", "School diploma or college diploma"), T("Документ о среднем общем или среднем профессиональном образовании.", "Орто жалпы же орто кесиптик билим тууралуу документ.", "Proof of secondary or secondary vocational education.")],
        [T("Сертификат ОРТ", "ЖРТ сертификаты", "ORT certificate"), T("Результат Общереспубликанского тестирования (электронный талон).", "Жалпы республикалык тестирлөөнүн жыйынтыгы (электрондук талон).", "Your national test result (electronic coupon).")]
      ], opt: [
        [T("Мед. справка 086-У", "086-У медициналык справка", "Medical certificate 086-U"), T("Вуз может запросить при зачислении.", "ЖОЖ кабыл алууда сурашы мүмкүн.", "A university may ask for it at enrolment.")],
        [T("Фото 3×4", "3×4 сүрөт", "3×4 photo"), T("Часто нужно для личного дела.", "Жеке иш үчүн көп керек болот.", "Often needed for your student file.")],
        [T("Документы на льготу", "Жеңилдик документтери", "Benefit documents"), T("Только если претендуете на льготы.", "Жеңилдикке дооматтансаңыз гана.", "Only if you claim a benefit.")]
      ], note: T("Оригиналы документов обычно сдают в вуз после зачисления. Если выбранный вуз попросит что-то ещё, мы скажем об этом в процессе. Список ориентировочный.", "Документтердин түп нускасын адатта ЖОЖго кабыл алынгандан кийин тапшырышат. Тандалган ЖОЖ башка нерсе сурашы мүмкүн. Тизме болжолдуу.", "Originals are usually handed to the university after enrolment. If your chosen university asks for more, we will tell you. The list is indicative.") },
    foreign: { must: [
        [T("Паспорт", "Паспорт", "Passport"), T("Действующий загранпаспорт.", "Жарактуу чет өлкөлүк паспорт.", "A valid passport.")],
        [T("Аттестат или диплом с переводом", "Которулган аттестат же диплом", "Diploma with translation"), T("Как правило, нужен нотариальный перевод и легализация (апостиль).", "Адатта нотариалдык котормо жана легалдаштыруу (апостиль) керек.", "Usually a notarised translation and legalisation (apostille) are required.")]
      ], opt: [
        [T("Медицинские справки", "Медициналык справкалар", "Medical certificates"), T("Обычно требуют справку о состоянии здоровья и об отсутствии ВИЧ.", "Адатта ден соолук жана ВИЧ жоктугу тууралуу справка сурашат.", "A health certificate and an HIV-negative certificate are usually requested.")],
        [T("Фото 3×4", "3×4 сүрөт", "3×4 photo"), T("Для личного дела и документов студента.", "Жеке иш үчүн.", "For your student file.")]
      ], note: T("Точный перечень для иностранцев определяет каждый вуз — уточняйте у приёмной комиссии.", "Чет элдиктер үчүн так тизмени ар бир ЖОЖ өзү аныктайт — кабыл алуу комиссиясынан тактаңыз.", "Each university sets its own list for international applicants — confirm with the admissions office.") }
  };
  const who = $("who");
  who.innerHTML = `<button data-who="kg" class="active">${T("Я гражданин КР", "Мен КР жараныгымын", "I am a citizen of Kyrgyzstan")}</button><button data-who="foreign">${T("Я иностранный абитуриент", "Мен чет өлкөлүк абитуриентмин", "I am an international applicant")}</button>`;
  const show = k => {
    const d = DOCS[k];
    $("docs").innerHTML = d.must.map(x => `<div class="doc"><b>${x[0]}</b><span class="d">${x[1]}</span></div>`).join("") +
      d.opt.map(x => `<div class="doc opt"><b>${x[0]}</b><span class="d">${x[1]}</span></div>`).join("");
    $("docNote").innerHTML = d.note;
    who.querySelectorAll("button").forEach(b => b.classList.toggle("active", b.dataset.who === k));
  };
  who.addEventListener("click", e => { if (e.target.dataset.who) show(e.target.dataset.who); });
  show("kg");

  // FAQ
  const FAQ = [
    [T("Какие университеты есть на UniKG?", "UniKG'де кайсы университеттер бар?", "Which universities are on UniKG?"),
     T("В Кыргызстане 85 вузов: 30 государственных и 55 частных. Каталог UniKG пополняется — начните со страницы «Вузы».", "Кыргызстанда 85 ЖОЖ бар: 30 мамлекеттик жана 55 жеке. UniKG каталогу толукталууда — «ЖОЖдор» бетинен баштаңыз.", "Kyrgyzstan has 85 universities: 30 state and 55 private. The UniKG catalog keeps growing — start on the Universities page.")],
    [T("Нужно ли знать язык обучения?", "Окуу тилин билүү керекпи?", "Do I need to know the language of instruction?"),
     T("Да, это зависит от программы: обучение идёт на русском, кыргызском или английском. В каталоге можно отфильтровать вузы по языку.", "Ооба, программага жараша: орус, кыргыз же англис тилинде. Каталогдо ЖОЖдорду тил боюнча чыпкалай аласыз.", "Yes, it depends on the program: Russian, Kyrgyz or English. You can filter the catalog by language.")],
    [T("Какие документы загружать?", "Кандай документтерди жүктөө керек?", "Which documents should I upload?"),
     T("Паспорт, аттестат (или диплом колледжа) и сертификат ОРТ. Полный список — в блоке «Перед началом».", "Паспорт, аттестат (же колледж диплому) жана ЖРТ сертификаты. Толук тизме — «Баштоодон мурун» блогунда.", "Passport, school or college diploma and ORT certificate. See the full list in “Before you start”.")],
    [T("Как подать заявку на государственный грант?", "Мамлекеттик грантка кантип арыз берем?", "How do I apply for a state grant?"),
     T("Конкурс на гранты проходит через официальный портал Министерства (student.edu.gov.kg). UniKG помогает выбрать вуз и подготовить документы.", "Гранттарга сынак Министрликтин расмий порталы аркылуу өтөт (student.edu.gov.kg). UniKG ЖОЖ тандоого жана документтерди даярдоого жардам берет.", "The grant contest runs through the Ministry's official portal (student.edu.gov.kg). UniKG helps you choose a university and prepare documents.")],
    [T("Сколько ждать решение?", "Чечимди канча күтөм?", "How long until a decision?"),
     T("Сроки задаёт приёмная комиссия вуза или Министерство; даты публикуются во время приёмной кампании.", "Мөөнөттү ЖОЖдун кабыл алуу комиссиясы же Министрлик белгилейт; күндөр кабыл алуу кампаниясында жарыяланат.", "Deadlines are set by the university or the Ministry and published during the admission campaign.")]
  ];
  $("faq").innerHTML = FAQ.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join("");
}

/* ---------- 7. КАТАЛОГ ВУЗОВ + ФИЛЬТРЫ ---------- */
function initUniversities() {
  const list = $("uniList");
  if (!list) return;

  list.innerHTML = UNIS.map((u, i) => `
    <article class="uni" data-i="${i}">
      <div class="uni-media">
        <img class="uni-photo" src="assets/photos/${u.id}-1.jpg" alt="${u.name}" loading="lazy" data-abbr="${u.abbr}">
        ${logo(u)}
        <div class="pills">${pills(u)}</div>
      </div>
      <div class="uni-body">
        <h3>${u.name}</h3>
        <div class="loc">${t(CITIES[u.city])}</div>
        ${u.note ? `<p class="note">${t(u.note)}</p>` : ""}
        <dl class="uni-meta">
          <div><dt>${T("Язык обучения", "Окуу тили", "Language")}</dt><dd>${langCodes(u)}</dd></div>
          <div><dt>${T("Стоимость в год", "Жылдык баасы", "Cost per year")}</dt><dd>${u.price ? u.price.toLocaleString("ru-RU") + " KGS" : "—"}</dd></div>
          <div><dt>${T("Основан", "Негизделген", "Founded")}</dt><dd>${u.founded || "—"}</dd></div>
        </dl>
        <a class="btn btn-sm" href="university.html?id=${u.id}">${T("Подробнее", "Кененирээк", "Details")} →</a>
      </div>
    </article>`).join("");

  $("cmpBody").innerHTML = UNIS.map(u => `<tr><td>${u.abbr}</td><td>${t(CITIES[u.city])}</td><td>${u.type ? TYPE[u.type] : "—"}</td><td>${langCodes(u)}</td><td>${u.price ? u.price.toLocaleString("ru-RU") : "—"}</td></tr>`).join("");

  const maxP = Math.max(0, ...UNIS.map(u => u.price || 0));
  const sel = (id, label, opts) => `<div><label for="${id}">${label}</label><select id="${id}">${opts.map(o => OPT(o[0], o[1], o[2], o[3])).join("")}</select></div>`;
  $("filters").innerHTML = `
    <h3 class="f-title">${T("Фильтры", "Чыпкалар", "Filters")}</h3>
    <div class="fgrid">
      <div><label for="q">${T("Поиск", "Издөө", "Search")}</label><input id="q" type="search"></div>
      ${sel("ftype", T("Тип вуза", "ЖОЖдун түрү", "Type"), [["all", "Все", "Баары", "All"], ["state", "Только государственные", "Мамлекеттик гана", "State only"], ["private", "Только частные", "Жеке гана", "Private only"]])}
      ${sel("fdir", T("Направление", "Багыт", "Field"), [["all", "Все", "Баары", "All"], ["med", "Только медицинские", "Медициналык гана", "Medical only"], ["non", "Только немедицинские", "Медициналык эмес", "Non-medical only"]])}
      ${sel("fcampus", T("Кампус", "Кампус", "Campus"), [["all", "Все", "Баары", "All"], ["intl", "Международные", "Эл аралык", "International"], ["local", "Местные", "Жергиликтүү", "Local"]])}
      <div><label>${T("Языки обучения", "Окуу тилдери", "Languages")}</label><div class="checks">
        <label><input type="checkbox" name="flang" value="en">EN</label><label><input type="checkbox" name="flang" value="ru">RU</label><label><input type="checkbox" name="flang" value="ky">KG</label></div></div>
      <div><label for="fprice">${T("Стоимость / год", "Баасы / жыл", "Cost / year")}${maxP ? ` — <span id="pval"></span>` : ""}</label>
        ${maxP ? `<input id="fprice" type="range" min="0" max="${maxP}" step="1000" value="${maxP}">` : ""}
        <div class="fnote">${maxP ? T("Вузы без данных о цене скрываются при активном фильтре.", "Баасы жок ЖОЖдор чыпка иштегенде жашырылат.", "Universities without price data are hidden while the filter is active.") : T("Данные о стоимости пока не заполнены.", "Баасы тууралуу маалымат азырынча жок.", "Price data is not filled in yet.")}</div></div>
    </div>
    <div class="chips" id="chips"><button class="active" data-city="all">${T("Все города", "Бардык шаарлар", "All cities")}</button>${Object.keys(CITIES).map(k => `<button data-city="${k}">${t(CITIES[k])}</button>`).join("")}</div>`;

  const f = { q: "", city: "all", type: "all", dir: "all", campus: "all", langs: [], price: null };
  const match = u =>
    (f.city === "all" || u.city === f.city) &&
    (f.type === "all" || u.type === f.type) &&
    (f.dir === "all" || u.med === (f.dir === "med")) &&
    (f.campus === "all" || u.intl === (f.campus === "intl")) &&
    (!f.langs.length || (u.langs && f.langs.some(l => u.langs.includes(l)))) &&
    (f.price === null || (u.price != null && u.price <= f.price)) &&
    `${u.abbr} ${u.name} ${u.addr || ""} ${Object.values(CITIES[u.city]).join(" ")}`.toLowerCase().includes(f.q);

  function apply() {
    let n = 0;
    list.querySelectorAll(".uni").forEach(card => { const ok = match(UNIS[card.dataset.i]); card.style.display = ok ? "" : "none"; if (ok) n++; });
    $("count").textContent = n;
    $("empty").style.display = n ? "none" : "block";
  }
  $("filters").addEventListener("input", e => {
    const el = e.target;
    if (el.id === "q") f.q = el.value.trim().toLowerCase();
    if (el.id === "ftype") f.type = el.value;
    if (el.id === "fdir") f.dir = el.value;
    if (el.id === "fcampus") f.campus = el.value;
    if (el.name === "flang") f.langs = [...document.querySelectorAll("[name=flang]:checked")].map(x => x.value);
    if (el.id === "fprice") { const v = +el.value; f.price = v < +el.max ? v : null; $("pval").textContent = v < +el.max ? "≤ " + v.toLocaleString("ru-RU") : "∞"; }
    apply();
  });
  $("filters").addEventListener("click", e => {
    const b = e.target.closest("[data-city]");
    if (!b) return;
    f.city = b.dataset.city;
    $("chips").querySelectorAll("button").forEach(x => x.classList.toggle("active", x === b));
    apply();
  });
  if ($("pval")) $("pval").textContent = "∞";
  const sb = $("filters"), ft = sb.querySelector(".f-title");
  if (matchMedia("(max-width: 900px)").matches) sb.classList.add("collapsed");
  ft.addEventListener("click", () => sb.classList.toggle("collapsed"));
  apply();
}


/* ---------- ПЛАШКИ, ТАБЛИЦА ДОКУМЕНТОВ, СТРАНИЦА ВУЗА ---------- */
const pills = u =>
  (u.type ? `<span class="pill-b pill-${u.type}">${TYPE[u.type]}</span>` : "") +
  (u.med ? `<span class="pill-b pill-med">${T("Медицинский", "Медициналык", "Medical")}</span>` : "") +
  (u.intl ? `<span class="pill-b pill-intl">${T("Международный", "Эл аралык", "International")}</span>` : "");

// статусы: req — обязательно (тёмный жирный), semi — обычно, opt — возможно / уточнить
const DOC_LBL = {
  req:   ["req",  T("Обязательно", "Милдеттүү", "Required")],
  semi:  ["semi", "Обычно требуется", "Адатта керек", "Usually required"],
  maybe: ["opt",  T("Возможно", "Мүмкүн", "Possibly")],
  ask:   ["opt",  T("Уточняйте у вуза", "ЖОЖдон тактаңыз", "Ask the university")],
  none:  ["opt",  "—"]
};
const DOC_ROWS = [
  [T("Паспорт или ID-карта", "Паспорт же ID-карта", "Passport or ID card"), T("Страница с фото, именем и датой рождения.", "Сүрөтү, аты-жөнү жана туулган күнү бар бет.", "The page with photo, name and date of birth."), "req", "req"],
  [T("Аттестат или диплом колледжа", "Аттестат же колледж диплому", "School or college diploma"), T("Иностранцам — с переводом и легализацией (апостиль).", "Чет элдиктерге — котормо жана легалдаштыруу (апостиль) менен.", "Foreign applicants: with translation and legalisation (apostille)."), "req", "req"],
  [T("Сертификат ОРТ", "ЖРТ сертификаты", "ORT certificate"), T("Результат Общереспубликанского тестирования.", "Жалпы республикалык тестирлөөнүн жыйынтыгы.", "National test result."), "req", "ask"],
  [T("Мед. справка 086-У", "086-У медициналык справка", "Medical certificate 086-U"), T("Вуз может запросить при зачислении.", "ЖОЖ кабыл алууда сурашы мүмкүн.", "A university may ask for it at enrolment."), "maybe", "semi"],
  [T("Справка об отсутствии ВИЧ", "ВИЧ жоктугу тууралуу справка", "HIV-negative certificate"), T("Обычно — для иностранных абитуриентов.", "Адатта — чет элдик абитуриенттер үчүн.", "Usually for international applicants."), "none", "semi"],
  [T("Фото 3×4", "3×4 сүрөт", "3×4 photo"), T("Для личного дела.", "Жеке иш үчүн.", "For the student file."), "maybe", "maybe"],
  [T("Документы на льготу", "Жеңилдик документтери", "Benefit documents"), T("Только если претендуете на льготы.", "Жеңилдикке дооматтансаңыз гана.", "Only if you claim a benefit."), "maybe", "none"]
];
function docsTable(rows = DOC_ROWS, heads = [T("Граждане КР", "КР жарандары", "Citizens of KG"), T("Иностранцы", "Чет элдиктер", "International")]) {
  const cell = k => `<td class="${DOC_LBL[k][0]}">${DOC_LBL[k][1]}</td>`;
  return `<div class="table-wrap"><table class="docs-table"><thead><tr>
    <th>${T("Документ", "Документ", "Document")}</th>
    <th>${heads[0]}</th>
    <th>${heads[1]}</th></tr></thead><tbody>` +
    rows.map(r => `<tr><td>${r[0]}<small>${r[1]}</small></td>${cell(r[2])}${cell(r[3])}</tr>`).join("") +
    `</tbody></table></div>
    <p class="fnote">${T("Точный перечень определяет приёмная комиссия вуза. Гранты распределяются через портал Министерства (student.edu.gov.kg).", "Так тизмени ЖОЖдун кабыл алуу комиссиясы аныктайт. Гранттар Министрликтин порталы аркылуу бөлүштүрүлөт (student.edu.gov.kg).", "The exact list is set by each university. State grants are allocated through the Ministry portal (student.edu.gov.kg).")}</p>`;
}

function initUniversityPage() {
  const box = $("uniPage");
  if (!box) return;
  const u = UNIS.find(x => x.id === new URLSearchParams(location.search).get("id"));
  const back = `<a class="back" href="universities.html">← ${T("Все вузы", "Бардык ЖОЖ", "All universities")}</a>`;
  if (!u) { box.innerHTML = back + `<p class="lead">${T("Вуз не найден.", "ЖОЖ табылган жок.", "University not found.")}</p>`; return; }
  document.title = "UniKG — " + u.abbr;
  const soon = `<p class="soon">${T("Информация скоро появится.", "Маалымат жакында чыгат.", "Information coming soon.")}</p>`;
  const shots = [1, 2, 3, 4].map(n => `<div class="shot"><img class="uni-photo" src="assets/photos/${u.id}-${n}.jpg" alt="${u.abbr} ${n}" data-abbr="${u.abbr}"></div>`).join("");
  const initials = n => n.split(" ").map(w => w[0]).join("").slice(0, 2);

  box.innerHTML = `
    ${back}
    <div class="gallery">${shots}</div>
    <div class="d-head">${logo(u)}<div><h1>${u.name}</h1><div class="loc">${t(CITIES[u.city])}${u.addr ? " · " + u.addr : ""}</div></div></div>
    <div class="d-pills">${pills(u)}</div>
    <div class="d-layout">
      <div class="d-main">
        <div class="card"><h2>${T("О университете", "Университет жөнүндө", "About")}</h2>${u.about ? `<p>${u.about}</p>` : soon}</div>
        <div class="card"><h2>${T("Достижения", "Жетишкендиктер", "Achievements")}</h2>${u.ach && u.ach.length ? `<ul class="ach">${u.ach.map(x => `<li>${x}</li>`).join("")}</ul>` : soon}</div>
        <div class="card"><h2>${T("Известные выпускники", "Белгилүү бүтүрүүчүлөр", "Notable alumni")}</h2>${u.alumni && u.alumni.length ? `<div class="alumni">${u.alumni.map(a => `<div class="person"><span class="avatar">${initials(a.n)}</span><div><b>${a.n}</b><span>${a.d}</span></div></div>`).join("")}</div>` : soon}</div>
      </div>
      <aside class="facts">
        <h3>${T("Коротко", "Кыскача", "Quick facts")}</h3>
        <dl>
          <div><dt>${T("Основан", "Негизделген", "Founded")}</dt><dd>${u.founded || "—"}</dd></div>
          <div><dt>${T("Тип", "Түрү", "Type")}</dt><dd>${u.type ? TYPE[u.type] : "—"}</dd></div>
          <div><dt>${T("Язык обучения", "Окуу тили", "Language")}</dt><dd>${langCodes(u)}</dd></div>
          <div><dt>${T("Стоимость в год", "Жылдык баасы", "Cost per year")}</dt><dd>${u.price ? u.price.toLocaleString("ru-RU") + " KGS" : "—"}</dd></div>
        </dl>
        <a class="btn" href="apply.html?add=${u.id}">${T("Подать документы", "Документ тапшыруу", "Apply")}</a>
      </aside>
    </div>
    <section style="margin-top:34px"><h2>${T("Какие документы нужны", "Кандай документтер керек", "Required documents")}</h2>${docsTable()}</section>`;
}

/* ---------- 8. КАЛЬКУЛЯТОР ОРТ ---------- */
function initCalculator() {
  const form = $("calc");
  if (!form) return;
  form.addEventListener("submit", e => {
    e.preventDefault();
    const score = Number($("score").value);
    $("calcResult").innerHTML = PROGRAMS.map(p => {
      let tag = `<span class="tag-n">${T("Не проходит", "Жетпейт", "Not enough")}</span>`;
      if (score >= p.budget) tag = `<span class="tag-b">${T("Бюджет", "Бюджет", "State-funded")}</span>`;
      else if (score >= p.contract) tag = `<span class="tag-c">${T("Контракт", "Контракт", "Contract")}</span>`;
      return `<div class="res-row"><span>${t(p)}</span>${tag}</div>`;
    }).join("");
  });
}

/* ---------- 9. ФОРМЫ И ВХОД ---------- */
function initForms() {
  document.querySelectorAll('input[type="file"]').forEach(inp => inp.addEventListener("change", () => {
    inp.closest(".file-row").querySelector(".fname").textContent = inp.files[0] ? inp.files[0].name : "";
  }));
  const reg = $("regForm");
  if (reg) reg.addEventListener("submit", e => { e.preventDefault(); $("regMsg").style.display = "block"; });

  const auth = $("auth");
  if (auth) {
    auth.querySelectorAll(".tabs button").forEach(b => b.addEventListener("click", () => {
      auth.dataset.mode = b.dataset.mode;
      auth.querySelectorAll(".tabs button").forEach(x => x.classList.toggle("active", x === b));
      auth.querySelectorAll(".only-up input").forEach(i => i.required = b.dataset.mode === "up");
    }));
  }
}

document.addEventListener("DOMContentLoaded", () => {
  buildLayout(); initLang(); initTheme(); initA11y();
  initHome(); initUniversities(); initUniversityPage(); initCalculator(); initForms();
  fixLogos(); fixPhotos();
});
