const EX = [
  { id: 1, name: "Ausfallschritte BOSU-Ball", cue: "jede Seite 1–2x", sets: [{ reps: 10 }, { reps: 10 }] },
  { id: 2, name: "Beinpresse horizontal", cue: "mehr als 45°", sets: [{ reps: 10, kg: 80 }, { reps: 10, kg: 80 }] },
  { id: 3, name: "Latzug", cue: "mittlerer schwarzer Griff", sets: [{ reps: 10, kg: 45 }, { reps: 10, kg: 45 }] },
  { id: 4, name: "Rudern, sitzend", cue: "Griff schmal, aufrecht, Schulterblätter", sets: [{ reps: 10, kg: 50 }, { reps: 10, kg: 50 }] },
  { id: 5, name: "Überzüge Maschine", cue: "Sitzhöhe 7. Ist zählt, Soll 10.", sets: [{ reps: 10, kg: 45 }, { reps: 10, kg: 45 }] },
  { id: 6, name: "Außenrotation Kabelzug", cue: "", sets: [{ reps: 10, kg: 5 }] },
  { id: 7, name: "Langlauf", cue: "", sets: [{ reps: 10, kg: 10 }] },
  { id: 8, name: "Shrugs Kurzhantel", cue: "kreisen 10 zurück, 5 vor, 10 zurück", sets: [{ reps: 25, kg: 3 }] },
  { id: 9, name: "Trizepsstrecken Kabelzug Kordel", cue: "Arme am Oberkörper", sets: [{ reps: 10, kg: 15 }, { reps: 10, kg: 15 }] },
  { id: 10, name: "Scottcurls SZ-Stange", cue: "", sets: [{ reps: 10, kg: 10 }, { reps: 10, kg: 10 }] },
  { id: 11, name: "Bauchpresse", cue: "1. Satz mit Beine, 2. ohne", sets: [{ reps: 20, kg: 25 }, { reps: 20, kg: 25 }, { reps: 20, kg: 25 }] },
  { id: 12, name: "Brust Stretch stehend", cue: "kleiner – grosser Adler", sets: [{ reps: 7 }] }
];

const K = { sessions: "zwei-sessions", bp: "zwei-bp", notes: "zwei-notes" };
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

let idx = 0;
const live = EX.map((e) => ({
  ...e,
  sets: e.sets.map((s) => ({ ...s, done: false })),
  note: ""
}));

function renderRail() {
  $("rail").innerHTML = live.map((e, i) => {
    const did = e.sets.some((s) => s.done);
    const cls = i === idx ? "dot on" : did ? "dot did" : "dot";
    return `<button type="button" class="${cls}" data-i="${i}">${e.id}</button>`;
  }).join("");
}

function renderNow() {
  const e = live[idx];
  $("nowK").textContent = `Übung ${idx + 1} von ${live.length}`;
  $("nowName").textContent = e.name;
  $("nowCue").textContent = e.cue || "Wie es sich anfühlt, zählt.";
  $("nowNote").value = e.note;
  const hasKg = e.sets.some((s) => s.kg != null);
  $("nowSets").innerHTML = e.sets.map((s, i) => {
    const kg = hasKg
      ? `<div><label>kg</label><input data-s="${i}" data-f="kg" inputmode="decimal" value="${s.kg ?? ""}"></div>`
      : "";
    return `<div class="set ${hasKg ? "" : "nkg"}>
      <div><label>Wdh</label><input data-s="${i}" data-f="reps" inputmode="numeric" value="${s.reps}"></div>
      ${kg}
      <button type="button" class="done ${s.done ? "on" : ""}" data-done="${i}">${s.done ? "ok" : "satz"}</button>
    </div>`;
  }).join("");
  renderRail();
}

function collectSession() {
  return live.map((e) => ({
    id: e.id,
    name: e.name,
    note: e.note,
    sets: e.sets.map((s) => ({ done: !!s.done, reps: Number(s.reps), kg: s.kg == null || s.kg === "" ? null : Number(s.kg) }))
  }));
}

function renderWeek() {
  const n = load(K.sessions).filter((s) => weekKey(s.date) === weekKey(todayISO())).length;
  $("week").textContent = `${n} / 2`;
}
function renderTrainHist() {
  const sessions = load(K.sessions).slice().reverse().slice(0, 6);
  $("trainHist").innerHTML = sessions.length
    ? sessions.map((s) => {
        const done = s.quick ? "Heute zählt" : (s.exercises || []).filter((e) => (e.sets || []).some((x) => x.done)).length + " Übungen";
        return `<div>${s.date} · ${done}${s.note ? " · " + s.note : ""}</div>`;
      }).join("")
    : "<div>Noch keine Einheit.</div>";
}
function bpToday() {
  return load(K.bp).some((r) => String(r.when).slice(0, 10) === todayISO());
}
function renderBpChip() {
  const chip = $("bpChip");
  chip.textContent = bpToday() ? "BD ok" : "BD";
  chip.classList.toggle("warn", !bpToday());
}
function renderBpHist() {
  const rows = load(K.bp).slice().reverse();
  $("bpHist").innerHTML = rows.length
    ? rows.map((r) => {
        const t = String(r.when).replace("T", " ").slice(0, 16);
        const p = r.pulse ? ` · ${r.pulse}` : "";
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
  box.classList.add("on");
  box.classList.remove("done");
  $("timerMsg").textContent = "Pause";
  const tick = () => {
    $("timerN").textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`;
    if (left <= 0) {
      clearInterval(timerId);
      box.classList.add("done");
      $("timerMsg").textContent = "Weiter, wenn du willst";
      try { navigator.vibrate && navigator.vibrate([180, 60, 180]); } catch (_) {}
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
$("bpChip").addEventListener("click", () => tab("bp"));
$("timerSkip").addEventListener("click", stopRest);
$("rail").addEventListener("click", (ev) => {
  const b = ev.target.closest("[data-i]");
  if (!b) return;
  live[idx].note = $("nowNote").value;
  idx = Number(b.dataset.i);
  renderNow();
});
$("prev").addEventListener("click", () => {
  live[idx].note = $("nowNote").value;
  idx = (idx + live.length - 1) % live.length;
  renderNow();
});
$("next").addEventListener("click", () => {
  live[idx].note = $("nowNote").value;
  idx = (idx + 1) % live.length;
  renderNow();
});
$("skip").addEventListener("click", () => {
  live[idx].note = $("nowNote").value || "übersprungen";
  idx = Math.min(idx + 1, live.length - 1);
  renderNow();
});
$("nowNote").addEventListener("input", () => { live[idx].note = $("nowNote").value; });
$("nowSets").addEventListener("input", (ev) => {
  const f = ev.target.dataset.f;
  const i = Number(ev.target.dataset.s);
  if (f === "reps") live[idx].sets[i].reps = ev.target.value;
  if (f === "kg") live[idx].sets[i].kg = ev.target.value;
});
$("nowSets").addEventListener("click", (ev) => {
  const b = ev.target.closest("[data-done]");
  if (!b) return;
  const i = Number(b.dataset.done);
  live[idx].sets[i].done = !live[idx].sets[i].done;
  renderNow();
  if (live[idx].sets[i].done) startRest();
});

$("finish").addEventListener("click", () => {
  live[idx].note = $("nowNote").value;
  addSession({ date: todayISO(), at: new Date().toISOString(), exercises: collectSession() });
  alert("Einheit gespeichert.");
});
$("quick").addEventListener("click", () => {
  addSession({ date: todayISO(), at: new Date().toISOString(), quick: true, note: $("nowNote").value });
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
  renderBpChip();
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
renderNow();
padLocal();
renderWeek();
renderTrainHist();
renderBpHist();
renderBpChip();
