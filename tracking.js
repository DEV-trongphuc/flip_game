let DATA;
let currentVersion = null;
let voucherChart = null;
let leadTrendChart = null;

async function loadData() {
  const res = await fetch(
    "https://script.google.com/macros/s/AKfycbysS95cseVSb9HUgINWjMHQik3rilXTqoPtyofeGBau7VChbrbXy7HiKLFuB339lGkl/exec"
  );
  const data = await res.json();
  DATA = data;

  renderStats(data);
  renderTable(data);
  renderVoucherChart(data);
  renderLeadTrendChart(data);
}

// ======================
// 📊 AUTO CHECK VERSION
const GITHUB_TOKEN =
  "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"; // 🔒 GitHub token ở bước trên
async function checkVersion() {
  try {
    const res = await fetch(
      "https://api.github.com/repos/DEV-trongphuc/flip_game/contents/version.txt.txt",
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          "Cache-Control": "no-cache",
        },
      }
    );
    const data = await res.json();
    const version = atob(data.content).trim();

    if (currentVersion === null) {
      currentVersion = version;
      await loadData();
    } else if (version !== currentVersion) {
      console.log("🔁 Có cập nhật mới, reload data...");
      currentVersion = version;
      await loadData();
    }
  } catch (err) {
    console.error("⚠️ Lỗi khi check version:", err);
  }
}
// Check mỗi 5s
setInterval(checkVersion, 10000);
checkVersion();

// ===============================
// 📊 RENDER STATS
// ===============================
function renderStats(data) {
  const totalCreated = data.length;
  const redeemNow = data.filter(
    (v) => v.voucher_name === "Free 1 Fried Gyoza"
  ).length;
  const redeemedAtRestaurant = data.filter(
    (v) => v.voucher_name !== "Free 1 Fried Gyoza" && v.is_used != ""
  ).length;
  const notRedeemed = data.filter(
    (v) =>
      v.voucher_name !== "Free 1 Fried Gyoza" &&
      (!v.is_used || v.is_used === false)
  ).length;

  document.querySelector("#spent span").textContent = totalCreated;
  document.querySelector("#reach span").textContent = redeemNow;
  document.querySelector("#message span").textContent = redeemedAtRestaurant;
  document.querySelector("#lead span").textContent = notRedeemed;
}

// ===============================
// 🍩 VOUCHER CHART
// ===============================
function renderVoucherChart(data) {
  const counts = {};
  data.forEach((v) => {
    const shortName = cleanVoucherName(v.voucher_name);
    counts[shortName] = (counts[shortName] || 0) + 1;
  });

  const labels = Object.keys(counts);
  const values = Object.values(counts);
  const total = values.reduce((a, b) => a + b, 0);

  const ctx = document.getElementById("voucher_chart").getContext("2d");

  if (voucherChart) voucherChart.destroy();

  voucherChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [
        {
          data: values,
          borderWidth: 2,
          backgroundColor: [
            "#a01812",
            "#bf4741",
            "#caa5a3",
            "#b4b4b4",
            "#023047",
          ],
        },
      ],
    },
    options: {
      cutout: "65%",
      animation: { duration: 600 },
      plugins: {
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const label = ctx.label || "";
              const val = ctx.parsed;
              const percent = ((val / total) * 100).toFixed(1);
              return `${label}: ${val} (${percent}%)`;
            },
          },
        },
        legend: {
          position: "right",
          labels: { color: "#333", font: { size: 13 } },
        },
      },
    },
  });
}

// ===============================
// 📈 TREND CHART
// ===============================
function renderLeadTrendChart(data) {
  const groupedByHour = {};
  data.forEach((v) => {
    const hour = new Date(v.Timestamp).getHours();
    groupedByHour[hour] = (groupedByHour[hour] || 0) + 1;
  });

  const labels = Object.keys(groupedByHour)
    .sort((a, b) => a - b)
    .map((h) => `${h}:00`);
  const values = labels.map((label) => groupedByHour[parseInt(label)] || 0);

  const ctx = document.getElementById("leadTrendChart").getContext("2d");

  if (leadTrendChart) leadTrendChart.destroy();

  leadTrendChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Voucher Created per Hour",
          data: values,
          borderWidth: 3,
          tension: 0.3,
          fill: true,
          borderColor: "#981913",
          backgroundColor: "rgba(251, 8, 0, 0.2)",
          pointRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      animation: { duration: 600 },
      scales: {
        x: { grid: { display: false }, ticks: { color: "#444" } },
        y: { beginAtZero: true, ticks: { stepSize: 1, color: "#444" } },
      },
      plugins: { legend: { display: false } },
    },
  });
}

// ===============================
// 🧾 TABLE + FILTER
// ===============================
function cleanVoucherName(name) {
  return name.replace(/^Free\s*(a|1)?\s*/i, "").trim();
}

function renderTable(data) {
  const table = document.querySelector("#main_table");
  if (!table) {
    console.warn("⚠️ Không tìm thấy #main_table trong DOM.");
    return;
  }

  let tbody = table.querySelector("tbody");
  if (!tbody) {
    tbody = document.createElement("tbody");
    table.appendChild(tbody);
  }

  tbody.innerHTML = "";

  data.forEach((item) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
        <td>${new Date(item.Timestamp).toLocaleString("vi-VN")}</td>
        <td>${item.phone}</td>
        <td>${item.name}</td>
        <td>${cleanVoucherName(item.voucher_name)}</td>
        <td>${item.is_used}</td>
      `;
    tbody.appendChild(tr);
  });

  const count = document.querySelector(".loaded_count");
  if (count) count.textContent = data.length;
}

const searchInput = document.querySelector(".dom_search");
const filterBtn = document.getElementById("find_data");

function filterTable() {
  const keyword = searchInput.value.trim().toLowerCase();
  const filtered = DATA.filter(
    (d) =>
      d.phone.toLowerCase().includes(keyword) ||
      d.name.toLowerCase().includes(keyword)
  );
  renderTable(filtered);
}

searchInput.addEventListener("input", filterTable);
filterBtn.addEventListener("click", filterTable);
