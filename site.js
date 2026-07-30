// Standalone Apps Script web app; it addresses the sheet by id (see README).
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwARIYFsINER5Bg7HqwqnqjzZCW4qQkTIOfpDg4afc7lTtiQJa2E4iYxcX3KEpHlqsw/exec";

// The page declares a fixed 1120px viewport so phones get the laptop layout, which
// means a phone shrinks the whole page. Text can be pinch-zoomed, but the form has
// to stay usable, so hand the CSS the actual shrink factor to size it back up.
// Detection uses the device's SHORT edge, which does not change when the phone is
// rotated — screen.width alone reports ~915 on an Android in landscape and would
// wrongly look like a desktop.
const VIEWPORT_WIDTH = 900;

function sizeFormForScreen() {
  const root = document.documentElement;
  if (Math.min(screen.width, screen.height) > 600) {
    root.classList.remove("small-screen");
    return;
  }
  const factor = VIEWPORT_WIDTH / Math.max(screen.width, 320);
  root.style.setProperty("--form-scale-base", Math.min(factor, 3.4).toFixed(2));
  root.classList.add("small-screen");
}

sizeFormForScreen();
// Rotating changes the shrink factor, and the value is stale until we recompute.
addEventListener("orientationchange", () => setTimeout(sizeFormForScreen, 250));

const form = document.getElementById("interest-form");
const address = document.getElementById("address-fields");
const addrInputs = ["street", "postcode", "city"].map((n) => form.elements[n]);

// Address block appears (and becomes required) only for "send it by post".
form.addEventListener("change", () => {
  const post = form.elements.delivery.value === "post";
  address.hidden = !post;
  addrInputs.forEach((i) => (i.required = post));
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = form.querySelector("button[type=submit]");
  const data = Object.fromEntries(new FormData(form));
  data.page_lang = document.documentElement.lang;
  document.getElementById("form-error").hidden = true;
  if (data.website) return showThanks(); // honeypot: fake success, send nothing
  btn.disabled = true;
  btn.dataset.label = btn.textContent;
  btn.textContent = "…";
  try {
    const res = await fetch(SCRIPT_URL, { method: "POST", body: JSON.stringify(data) });
    const out = await res.json();
    if (!out.ok) throw new Error("script said not ok");
    showThanks();
  } catch {
    document.getElementById("form-error").hidden = false;
    btn.disabled = false;
    btn.textContent = btn.dataset.label;
  }
});

function showThanks() {
  form.hidden = true;
  // "Wil jij er eentje?" is a question they have just answered, so it goes too.
  form.closest(".signup").querySelector("h2").hidden = true;
  document.getElementById("form-thanks").hidden = false;
  confetti();
}

function confetti() {
  const c = document.createElement("canvas");
  c.className = "confetti";
  c.width = innerWidth;
  c.height = innerHeight;
  document.body.appendChild(c);
  const ctx = c.getContext("2d");
  const colors = ["#e74c3c", "#e67e22", "#f1c40f", "#2ecc71", "#3498db", "#9b59b6"];
  const parts = Array.from({ length: 300 }, () => ({
    x: c.width / 2, y: c.height * 0.6,
    vx: (Math.random() - 0.5) * 14, vy: -(Math.random() * 13 + 5),
    size: Math.random() * 7 + 4, rot: Math.random() * Math.PI,
    vr: (Math.random() - 0.5) * 0.3,
    color: colors[(Math.random() * colors.length) | 0],
  }));
  const t0 = performance.now();
  (function frame(t) {
    ctx.clearRect(0, 0, c.width, c.height);
    for (const p of parts) {
      p.vy += 0.25; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    }
    if (t - t0 < 3000) requestAnimationFrame(frame);
    else c.remove();
  })(t0);
}
