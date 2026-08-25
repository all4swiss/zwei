const EX = [
  { id: 1, name: "Ausfallschritte BOSU-Ball", cue: "jede Seite 1–2x", sets: [{ reps: 10 }, { reps: 10 }] },
  { id: 2, name: "Beinpresse horizontal", cue: "mehr als 45°", sets: [{ reps: 10, kg: 80 }, { reps: 10, kg: 80 }] },
  { id: 3, name: "Latzug", cue: "mittlerer schwarzer Griff", sets: [{ reps: 10, kg: 45 }, { reps: 10, kg: 45 }] },
  { id: 4, name: "Rudern, sitzend", cue: "Griff schmal, aufrecht, Schulterblätter", sets: [{ reps: 10, kg: 50 }, { reps: 10, kg: 50 }] },
  { id: 5, name: "Überzüge Maschine", cue: "Sitzhöhe 7. PDF stand 100 Wdh — Ist zählt, Soll hier 10.", sets: [{ reps: 10, kg: 45 }, { reps: 10, kg: 45 }] },
  { id: 6, name: "Außenrotation Kabelzug", cue: "", sets: [{ reps: 10, kg: 5 }] },
  { id: 7, name: "Langlauf", cue: "", sets: [{ reps: 10, kg: 10 }] },
  { id: 8, name: "Shrugs Kurzhantel", cue: "kreisen 10 zurück, 5 vor, 10 zurück", sets: [{ reps: 10, kg: 3 }] },
  { id: 9, name: "Trizepsstrecken Kabelzug Kordel", cue: "Arme am Oberkörper", sets: [{ reps: 10, kg: 15 }, { reps: 10, kg: 15 }] },
  { id: 10, name: "Scottcurls SZ-Stange", cue: "", sets: [{ reps: 10, kg: 10 }, { reps: 10, kg: 10 }] },
  { id: 11, name: "Bauchpresse", cue: "1. Satz mit Beine, 2. ohne", sets: [{ reps: 20, kg: 25 }, { reps: 20, kg: 25 }, { reps: 20, kg: 25 }] },
  { id: 12, name: "Brust Stretch stehend", cue: "kleiner – grosser Adler", sets: [{ reps: 7 }] }
];

const K = { sessions: "zwei-sessions", bp: "zwei-bp" };
const $ = (id) => document.getElementById(id);
function load(key) { try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; } }
function save(key, v) { localStorage.setItem(key, JSON.stringify(v)); }
function todayISO() {
  const d = new Date();
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return z.toISOString().slice(0, 10);
}
function weekKey(d) {
  const dt = new Date(d + "T12:00:00");
  const day = (dt.getDay() + 6) % 7;
  dt.setDate(dt.getDate() - day);
  return dt.toISOString().slice(0, 10);
}

function renderExercises() {
  const root = $("exercises");
  root.innerHTML = EX.map((e) => {
    const sets = e.sets.map((s, i) => {
      const kg = s.kg != null ? `<input data-e="${e.id}" data-s="${i}" data-f="kg" inputmode="decimal" value="${s.kg}">` : `<span></span>`;
      return `<div class="set">
        <input class="check" type="checkbox" data-e="${e.id}" data-s="${i}" data-f="done">
        <input data-e="${e.id}" data-s="${i}" data-f="reps" inputmode="numeric" value="${s.reps}">
        ${kg}
        <button class="btn small ghost" type="button" data-rest="${e.id}-${i}">Pause</button>
      </div>`;
    }).join("");
    return `<article class="card ex" data-ex="${e.id}">
      <h2>${e.id}. ${e.name}</h2>
      ${e.cue ? `<p class="cue">${e.cue}</p>` : ""}
      <div class="set" style="grid-template-columns:28px 1fr 1fr auto;font-size:12px;color:var(--muted)">
        <span></span><span>Wdh</span><span>${e.sets[0].kg != null ? "kg" : ""}</span><span></span>
      </div>
      ${sets}
    </article>`;
  }).join("");
}

function collectSession() {
  return EX.map((e) => ({
    id: e.id,
    name: e.name,
    sets: e.sets.map((s, i) => {
      const q = (f) => document.querySelector(`[data-e="${e.id}"][data-s="${i}"][data-f="${f}"]`);
      const done = q("done")?.checked || false;
      const reps = Number(q("reps")?.value || s.reps);
      const kgEl = q("kg");
      return { done, reps, kg: kgEl ? Number(kgEl.value) : null };
    })
  }));
}

function renderWeek() {
  const sessions = load(K.sessions);
  const wk = weekKey(todayISO());
  const n = sessions.filter((s) => weekKey(s.date) === wk).length;
  $("week").textContent = `${n} / 2 diese Woche`;
}

function renderTrainHist() {
  const sessions = load(K.sessions).slice().reverse().slice(0, 8);
  $("trainHist").innerHTML = sessions.length
    ? sessions.map((s) => {
        const done = s.quick ? "Heute zählt" : s.exercises.filter((e) => e.sets.some((x) => x.done)).length + " Übungen";
        return `<div>${s.date} · ${done}</div>`;
      }).join("")
    : "<div>Noch keine Einheit.</div>";
}

function bpToday() {
  return load(K.bp).some((r) => r.when.slice(0, 10) === todayISO());
}
function renderBpBanner() {
  $("bpBanner").hidden = bpToday();
}
function renderBpHist() {
  const rows = load(K.bp).slice().reverse();
  $("bpHist").innerHTML = rows.length
    ? rows.map((r) => {
        const t = r.when.replace("T", " ").slice(0, 16);
        const p = r.pulse ? ` · Puls ${r.pulse}` : "";
        const n = r.note ? ` · ${r.note}` : "";
        return `<div>${t} · ${r.sys} / ${r.dia}${p}${n}</div>`;
      }).join("")
    : "<div>Noch keine Messung.</div>";
}

function tab(name) {
  document.querySelectorAll(".panel").forEach((p) => p.classList.toggle("on", p.id === "panel-" + name));
  document.querySelectorAll("nav button").forEach((b) => b.classList.toggle("on", b.dataset.tab === name));
}

let timerId = null;
function startRest() {
  let left = 60;
  const box = $("timer");
  const n = $("timerN");
  const msg = $("timerMsg");
  box.classList.add("on");
  box.classList.remove("done");
  msg.textContent = "Pause";
  const tick = () => {
    const m = Math.floor(left / 60);
    const s = String(left % 60).padStart(2, "0");
    n.textContent = `${m}:${s}`;
    if (left <= 0) {
      clearInterval(timerId);
      box.classList.add("done");
      msg.textContent = "Pause fertig";
      n.textContent = "0:00";
      try { navigator.vibrate && navigator.vibrate([200, 80, 200]); } catch (_) {}
      return;
    }
    left -= 1;
  };
  tick();
  clearInterval(timerId);
  timerId = setInterval(tick, 1000);
}
function stopRest() {
  clearInterval(timerId);
  $("timer").classList.remove("on", "done");
}

function addSession(entry) {
  const sessions = load(K.sessions);
  sessions.push(entry);
  save(K.sessions, sessions);
  renderWeek();
  renderTrainHist();
}

document.querySelectorAll("nav button").forEach((b) => b.addEventListener("click", () => tab(b.dataset.tab)));
$("bpBannerBtn").addEventListener("click", () => tab("bp"));
$("timerSkip").addEventListener("click", stopRest);

$("exercises").addEventListener("click", (ev) => {
  const btn = ev.target.closest("[data-rest]");
  if (btn) startRest();
});
$("exercises").addEventListener("change", (ev) => {
  if (ev.target.dataset.f === "done" && ev.target.checked) startRest();
});

$("finish").addEventListener("click", () => {
  addSession({ date: todayISO(), at: new Date().toISOString(), exercises: collectSession() });
  alert("Einheit gespeichert.");
});
$("quick").addEventListener("click", () => {
  addSession({ date: todayISO(), at: new Date().toISOString(), quick: true });
  alert("Heute zählt.");
});

$("bpSave").addEventListener("click", () => {
  const sys = Number($("bpSys").value);
  const dia = Number($("bpDia").value);
  if (!sys || !dia) { alert("Systolisch und diastolisch eintragen."); return; }
  const rows = load(K.bp);
  rows.push({
    when: $("bpWhen").value || new Date().toISOString(),
    sys, dia,
    pulse: $("bpPulse").value ? Number($("bpPulse").value) : null,
    note: $("bpNote").value.trim()
  });
  save(K.bp, rows);
  $("bpSys").value = $("bpDia").value = $("bpPulse").value = $("bpNote").value = "";
  renderBpHist();
  renderBpBanner();
});

$("export").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify({ sessions: load(K.sessions), bp: load(K.bp) }, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "zwei-export.json";
  a.click();
});

function padLocal() {
  const d = new Date();
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  $("bpWhen").value = z.toISOString().slice(0, 16);
}

if ("serviceWorker" in navigator) navigator.serviceWorker.register("./sw.js").catch(() => {});
renderExercises();
padLocal();
renderWeek();
renderTrainHist();
renderBpHist();
renderBpBanner();
