/* =========================================================
   UniKG — blog.js
   Только поиск и фильтр по категориям.
   Карточки, статьи и картинки написаны прямо в HTML.
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  // подсветить «Блог» в меню (и на страницах статей)
  const nav = document.querySelector('#nav a[href="blog.html"]');
  if (nav) nav.classList.add("active");

  const grid = document.getElementById("blGrid");
  if (!grid) return;                                   // мы на странице статьи
  const cards = [...grid.querySelectorAll(".bl-card")];
  const q = document.getElementById("blQ");
  const chips = document.getElementById("blChips");
  let cat = "all";

  function apply() {
    const text = q.value.trim().toLowerCase();
    let first = true, shown = 0;
    cards.forEach(c => {
      const ok = (cat === "all" || c.dataset.cat === cat) && c.dataset.search.includes(text);
      c.style.display = ok ? "" : "none";
      c.classList.toggle("is-first", ok && first);     // первая видимая карточка — большая
      if (ok) { first = false; shown++; }
    });
    document.getElementById("blEmpty").style.display = shown ? "none" : "block";
  }

  q.addEventListener("input", apply);
  chips.addEventListener("click", e => {
    const b = e.target.closest("button");
    if (!b) return;
    cat = b.dataset.cat;
    chips.querySelectorAll("button").forEach(x => x.classList.toggle("active", x === b));
    apply();
  });
  apply();
});
