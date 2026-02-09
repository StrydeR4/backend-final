function setAuth(token, role, email) {
  localStorage.setItem("token", token);
  localStorage.setItem("role", role);
  localStorage.setItem("email", email);
}
function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("email");
}
function getToken() { return localStorage.getItem("token"); }
function getRole() { return localStorage.getItem("role"); }
function getEmail() { return localStorage.getItem("email"); }

async function apiFetch(path, { method = "GET", body } = {}) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }

  if (!res.ok) {
    const msg = data && data.message ? data.message : `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

function $(id) { return document.getElementById(id); }
function msg(el, text, ok = true) {
  if (!el) return;
  el.textContent = text || "";
  el.className = ok ? "small ok" : "small danger";
}

function syncHeader() {
  const token = getToken();
  const role = getRole();
  const email = getEmail();

  const who = $("who");
  if (who) who.textContent = token ? `Logged in: ${email} (${role})` : "Not logged in";

  const logoutBtn = $("logoutBtn");
  if (logoutBtn) logoutBtn.style.display = token ? "inline-block" : "none";

  const adminLink = $("adminLink");
  if (adminLink) adminLink.style.display = token && role === "admin" ? "inline-block" : "none";
}

async function register(email, password) {
  await apiFetch("/auth/register", { method: "POST", body: { email, password } });
}
async function login(email, password) {
  const data = await apiFetch("/auth/login", { method: "POST", body: { email, password } });
  setAuth(data.token, data.role, data.email || email);
}
function logout() {
  clearAuth();
  syncHeader();
}

async function loadProductsIntoIndex() {
  const root = $("products");
  root.innerHTML = "<div class='muted'>Loading...</div>";

  const products = await apiFetch("/products");
  if (!products.length) {
    root.innerHTML = "<div class='muted'>No products yet. (Admin must add products.)</div>";
    return;
  }

  root.innerHTML = "";
  for (const p of products) {
    const reviews = await apiFetch(`/products/${p._id}/reviews`);

    const card = document.createElement("div");
    card.className = "card";

    const reviewsHtml = reviews.length
      ? reviews.map(r => `
        <div class="small">
          <b>${escapeHtml(r.authorName)}</b> (${r.rating}/5) — ${escapeHtml(r.text || "")}
          <span class="muted"> • ${new Date(r.createdAt).toLocaleString()}</span>
        </div>
      `).join("")
      : `<div class="muted small">No reviews yet</div>`;

    card.innerHTML = `
      <div class="top">
        <div>
          <h3 style="margin:0">${escapeHtml(p.name)} <span class="muted small">by ${escapeHtml(p.brand)}</span></h3>
          <div class="muted small">ID: ${p._id}</div>
        </div>
        <div>
          <b>${p.price}</b>
          <div class="muted small">${escapeHtml(p.category || "lifestyle")} • sizes ${p.sizeRange?.min ?? 0}-${p.sizeRange?.max ?? 0}</div>
        </div>
      </div>

      <hr style="border:none;border-top:1px solid #eee;margin:12px 0"/>

      <h4 style="margin:0 0 8px 0">Reviews</h4>
      <div>${reviewsHtml}</div>

      <div style="margin-top:12px">
        <h4 style="margin:0 0 8px 0">Add review</h4>
        <div class="row">
          <input id="a-${p._id}" placeholder="Author name" />
          <input id="r-${p._id}" placeholder="Rating (1-5)" type="number" min="1" max="5" />
        </div>
        <div style="margin-top:8px">
          <textarea id="t-${p._id}" placeholder="Text (optional)"></textarea>
        </div>
        <div class="row" style="margin-top:8px">
          <button data-pid="${p._id}" class="addReviewBtn">Send review</button>
          <span class="muted small">Login required.</span>
        </div>
      </div>
    `;

    root.appendChild(card);
  }

  document.querySelectorAll(".addReviewBtn").forEach(btn => {
    btn.addEventListener("click", async () => {
      try {
        const token = getToken();
        if (!token) return alert("Login first");

        const productId = btn.getAttribute("data-pid");
        const authorName = $(`a-${productId}`).value.trim();
        const rating = Number($(`r-${productId}`).value);
        const text = $(`t-${productId}`).value;

        await apiFetch(`/products/${productId}/reviews`, {
          method: "POST",
          body: { authorName, rating, text }
        });

        await loadProductsIntoIndex();
      } catch (e) {
        alert(e.message);
      }
    });
  });
}

function initIndex() {
  syncHeader();

  $("registerBtn").addEventListener("click", async () => {
    try {
      const email = $("email").value.trim();
      const password = $("password").value;
      await register(email, password);
      msg($("authMsg"), "Registered! Now login.", true);
    } catch (e) {
      msg($("authMsg"), e.message, false);
    }
  });

  $("loginBtn").addEventListener("click", async () => {
    try {
      const email = $("email").value.trim();
      const password = $("password").value;
      await login(email, password);
      syncHeader();
      msg($("authMsg"), "Logged in!", true);
      await loadProductsIntoIndex();
    } catch (e) {
      msg($("authMsg"), e.message, false);
    }
  });

  $("logoutBtn").addEventListener("click", () => {
    logout();
    msg($("authMsg"), "Logged out.", true);
  });

  $("refreshBtn").addEventListener("click", loadProductsIntoIndex);

  loadProductsIntoIndex();
}

async function loadProductsIntoAdmin() {
  const tbody = $("rows");
  tbody.innerHTML = `<tr><td colspan="4" class="muted">Loading...</td></tr>`;

  const products = await apiFetch("/products");
  if (!products.length) {
    tbody.innerHTML = `<tr><td colspan="4" class="muted">No products yet</td></tr>`;
    return;
  }

  tbody.innerHTML = "";
  for (const p of products) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>
        <b>${escapeHtml(p.name)}</b><br/>
        <span class="muted small">${escapeHtml(p.brand)}</span><br/>
        <span class="muted small">${p._id}</span>
      </td>
      <td><b>${p.price}</b></td>
      <td class="small">
        ${escapeHtml(p.category || "lifestyle")}<br/>
        sizes ${p.sizeRange?.min ?? 0}-${p.sizeRange?.max ?? 0}
      </td>
      <td>
        <button data-id="${p._id}" class="delBtn">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  }

  document.querySelectorAll(".delBtn").forEach(btn => {
    btn.addEventListener("click", async () => {
      try {
        const id = btn.getAttribute("data-id");
        if (!confirm("Delete this product?")) return;
        await apiFetch(`/products/${id}`, { method: "DELETE" });
        msg($("adminMsg"), "Deleted.", true);
        await loadProductsIntoAdmin();
      } catch (e) {
        msg($("adminMsg"), e.message, false);
      }
    });
  });
}

function initAdmin() {
  syncHeader();

  const role = getRole();
  if (!getToken() || role !== "admin") {
    alert("Admin only. Login as admin first.");
    window.location.href = "/";
    return;
  }

  $("logoutBtn").addEventListener("click", () => {
    logout();
    window.location.href = "/";
  });

  $("addProductBtn").addEventListener("click", async () => {
    try {
      const body = {
        name: $("pName").value.trim(),
        brand: $("pBrand").value.trim(),
        price: Number($("pPrice").value),
        category: $("pCategory").value,
        sizeRange: {
          min: Number($("pMin").value || 0),
          max: Number($("pMax").value || 0),
        }
      };

      await apiFetch("/products", { method: "POST", body });
      msg($("adminMsg"), "Product created!", true);

      $("pName").value = "";
      $("pBrand").value = "";
      $("pPrice").value = "";
      $("pMin").value = "";
      $("pMax").value = "";

      await loadProductsIntoAdmin();
    } catch (e) {
      msg($("adminMsg"), e.message, false);
    }
  });

  $("refreshBtn").addEventListener("click", loadProductsIntoAdmin);

  loadProductsIntoAdmin();
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, s => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[s]));
}
