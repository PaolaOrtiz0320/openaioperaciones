// =========================
// Configuración
// =========================
// Pon aquí tu Webhook de n8n cuando lo tengas. Si lo dejas vacío, NO enviará nada.
const WEBHOOK_URL = "https://paoortiz0311.app.n8n.cloud/webhook-test/bc6b83e8-9c44-44a0-8e46-5bcda551daab"; // Ej.: "https://tu-instancia.n8n.cloud/webhook/abcd1234"

// =========================
// Utilidades
// =========================
const $ = (sel) => document.querySelector(sel);

function buildPayload() {
  const ip = $("#ipPublica").value || "";
  const a = $("#operandoA").value;
  const b = $("#operandoB").value;
  const userText = $("#userText").value || "";
  const ts = new Date().toISOString();

  return {
    source: "frontend-demo",
    ip_publica: ip,
    operando_a: a === "" ? null : Number(a),
    operando_b: b === "" ? null : Number(b),
    user_message: userText,
    timestamp: ts
  };
}

function showPreview() {
  const payload = buildPayload();
  $("#preview").textContent = JSON.stringify(payload, null, 2);
  $("#tsPreview").textContent = payload.timestamp;
}

async function detectIP() {
  try {
    const r = await fetch("https://api.ipify.org?format=json");
    const j = await r.json();
    $("#ipPublica").value = j.ip || "";
  } catch (e) {
    $("#ipPublica").value = "";
    console.warn("No se pudo obtener IP pública:", e);
  }
}

// =========================
/** Inicio */
// =========================
(async () => {
  await detectIP();
  showPreview();

  // Previsualizar
  $("#btnPreview").addEventListener("click", showPreview);

  // Enviar (opcional)
  $("#calc-form").addEventListener("submit", async (ev) => {
    ev.preventDefault();

    // Validación simple de números
    const form = ev.currentTarget;
    if (!form.checkValidity()) {
      ev.stopPropagation();
      form.classList.add("was-validated");
      return;
    }

    const estado = $("#estado");
    const respuesta = $("#respuesta");
    respuesta.textContent = "";

    const payload = buildPayload();
    showPreview();

    if (!WEBHOOK_URL) {
      estado.textContent = "No se envió: agrega tu WEBHOOK_URL para enviar a n8n.";
      return;
    }

    estado.textContent = "Enviando...";
    try {
      const r = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const text = await r.text();
      estado.textContent = `HTTP ${r.status}`;
      respuesta.textContent = text;
    } catch (e) {
      estado.textContent = "Error al enviar.";
      respuesta.textContent = String(e);
    }
  });
})();
