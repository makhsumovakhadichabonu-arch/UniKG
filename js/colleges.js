const priceText = c => {
  const f = n => n.toLocaleString("ru-RU");
  const cur = c.cur === "USD" ? "$" : T("сом", "сом", "KGS");
  if (c.min && c.max) return `${f(c.min)}–${f(c.max)} ${cur}`;
  return `${T("от", "баштап", "from")} ${f(c.min)} ${cur}`;
};
const dirPills = c => (c.tags || []).slice(0, 3).map(k => `<span class="pill-b pill-col">${t(DIRECTIONS[k])}</span>`).join("");

function initColleges() {
  const list = $("colList");
  if (!list) return;

  list.innerHTML = COLLEGES.map((c, i) => `
    <article class="uni col" data-i="${i}">
      <div class="uni-media">
        <img class="uni-photo" src="assets/photos/${c.id}-1.jpg" alt="${c.name}" loading="lazy" data-abbr="${c.abbr}">
        ${logo(c)}
        <div class="pills">${dirPills(c)}</div>
      </div>
      <div class="uni-body">
        <h3>${c.name}</h3>
        <div class="loc">${c.addr}</div>
        <p class="note">${c.about}</p>
        <dl class="uni-meta">
          <div><dt>${T("Стоимость в год", "Жылдык баасы", "Cost per year")}</dt><dd class="price">${priceText(c)}</dd></div>
          <div><dt>${T("Основан", "Негизделген", "Founded")}</dt><dd>${c.founded || "—"}</dd></div>
        </dl>
        <a class="btn btn-sm" href="college.html?id=${c.id}">${T("Подробнее", "Кененирээк", "Details")} →</a>
      </div>
    </article>`).join("");

  // Фильтры сверху: поиск, направление, цена
  const D = Object.keys(DIRECTIONS).map(k => OPT(k, DIRECTIONS[k].ru, DIRECTIONS[k].ky, DIRECTIONS[k].en)).join("");
  $("colFilters").innerHTML = `
    <div class="cf-search"><label for="cq">${T("Поиск колледжа", "Колледж издөө", "Search a college")}</label>
      <input id="cq" type="search" autocomplete="off"></div>
    <div><label for="cdir">${T("Направление", "Багыт", "Field")}</label>
      <select id="cdir">${OPT("all", "Все направления", "Бардык багыттар", "All fields")}${D}</select></div>
    <div><label for="cprice">${T("Стоимость в год", "Жылдык баасы", "Cost per year")}</label>
      <select id="cprice">${OPT("0", "Любая", "Каалаган", "Any")}${OPT("30000", "до 30 000 сом", "30 000 сомго чейин", "up to 30,000 KGS")}${OPT("40000", "до 40 000 сом", "40 000 сомго чейин", "up to 40,000 KGS")}${OPT("50000", "до 50 000 сом", "50 000 сомго чейин", "up to 50,000 KGS")}</select></div>`;

  const f = { q: "", dir: "all", price: 0 };
  function apply() {
    let n = 0;
    list.querySelectorAll(".uni").forEach(card => {
      const c = COLLEGES[card.dataset.i];
      const ok = (f.dir === "all" || c.tags.includes(f.dir)) &&
        (!f.price || (c.cur === "KGS" && c.min <= f.price)) &&
        `${c.name} ${c.abbr} ${c.addr} ${c.about}`.toLowerCase().includes(f.q);
      card.style.display = ok ? "" : "none";
      if (ok) n++;
    });
    $("count").textContent = n;
    $("empty").style.display = n ? "none" : "block";
  }
  $("colFilters").addEventListener("input", e => {
    if (e.target.id === "cq") f.q = e.target.value.trim().toLowerCase();
    if (e.target.id === "cdir") f.dir = e.target.value;
    if (e.target.id === "cprice") f.price = +e.target.value;
    apply();
  });
  apply();
}

// Документы для колледжей: колонки — «на базе 9 класса» / «на базе 11 класса»
const COL_DOC_ROWS = [
  [T("Паспорт или ID-карта", "Паспорт же ID-карта", "Passport or ID card"), T("Данные с фото, ФИО и датой рождения.", "Сүрөтү, аты-жөнү жана туулган күнү бар бет.", "Page with photo, name and date of birth."), "req", "req"],
  [T("Аттестат", "Аттестат", "School certificate"), T("9 класс — об основном общем, 11 класс — о среднем общем образовании.", "9-класс — негизги, 11-класс — орто жалпы билим тууралуу.", "Basic (grade 9) or secondary (grade 11) education."), "req", "req"],
  [T("Сертификат ОРТ", "ЖРТ сертификаты", "ORT certificate"), T("С 2026 года обязателен при поступлении на базе 11 класса.", "2026-жылдан 11-класстын базасында милдеттүү.", "Required from 2026 for entry after grade 11."), "ask", "req"],
  [T("Мед. справка 086-У", "086-У медициналык справка", "Medical certificate 086-U"), T("Колледж может запросить при зачислении.", "Колледж кабыл алууда сурашы мүмкүн.", "May be requested at enrolment."), "maybe", "maybe"],
  [T("Фото 3×4", "3×4 сүрөт", "3×4 photo"), T("Для личного дела.", "Жеке иш үчүн.", "For the student file."), "maybe", "maybe"]
];

function initCollegePage() {
  const box = $("colPage");
  if (!box) return;
  const c = COLLEGES.find(x => x.id === new URLSearchParams(location.search).get("id"));
  const back = `<a class="back" href="colleges.html">← ${T("Все колледжи", "Бардык колледждер", "All colleges")}</a>`;
  if (!c) { box.innerHTML = back + `<p class="lead">${T("Колледж не найден.", "Колледж табылган жок.", "College not found.")}</p>`; return; }
  document.title = "UniKG — " + c.abbr;
  const shots = [1, 2, 3, 4].map(n => `<div class="shot"><img class="uni-photo" src="assets/photos/${c.id}-${n}.jpg" alt="${c.abbr} ${n}" data-abbr="${c.abbr}"></div>`).join("");
  box.innerHTML = `
    ${back}
    <div class="gallery">${shots}</div>
    <div class="d-head">${logo(c)}<div><h1>${c.name}</h1><div class="loc">${c.addr}</div></div></div>
    <div class="d-pills">${dirPills(c)}</div>
    <div class="d-layout">
      <div class="d-main">
        <div class="card"><h2>${T("О колледже", "Колледж жөнүндө", "About")}</h2><p>${c.about}</p>
          ${c.base ? `<p><b class="hl">${T("Сроки обучения:", "Окуу мөөнөтү:", "Study time:")}</b> ${c.base}</p>` : ""}
          ${c.warn ? `<p class="warn-box">⚠️ ${c.warn}</p>` : ""}</div>
      </div>
      <aside class="facts">
        <h3>${T("Коротко", "Кыскача", "Quick facts")}</h3>
        <dl>
          <div><dt>${T("Стоимость в год", "Жылдык баасы", "Cost per year")}</dt><dd class="price">${priceText(c)}</dd></div>
          <div><dt>${T("Основан", "Негизделген", "Founded")}</dt><dd>${c.founded || "—"}</dd></div>
          <div><dt>${T("Адрес", "Дарек", "Address")}</dt><dd>${c.addr}</dd></div>
        </dl>
        <a class="btn" href="apply.html?add=${c.id}">${T("Подать документы", "Документ тапшыруу", "Apply")}</a>
      </aside>
    </div>
    <section style="margin-top:34px"><h2>${T("Какие документы нужны", "Кандай документтер керек", "Required documents")}</h2>
      ${docsTable(COL_DOC_ROWS, [T("На базе 9 класса", "9-класстын базасында", "After grade 9"), T("На базе 11 класса", "11-класстын базасында", "After grade 11")])}</section>`;
}

document.addEventListener("DOMContentLoaded", () => { initColleges(); initCollegePage(); fixLogos(); fixPhotos(); });
