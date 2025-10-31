const vouchersIMG = [
  "./assets/img_vouchers/voucher_img1 (1).png",
  "./assets/img_vouchers/voucher_img1 (2).png",
  "./assets/img_vouchers/voucher_img1 (3).png",
  "./assets/img_vouchers/voucher_img1 (4).png",
];
let DATA;
let currentVersion = null;
let voucherChart = null;
let leadTrendChart = null;
let firstLoad = true; // chỉ active lần đầu

async function loadData() {
  if (firstLoad) {
    document.querySelector(".loading")?.classList.add("active");
  }

  const res = await fetch(
    "https://script.google.com/macros/s/AKfycbysS95cseVSb9HUgINWjMHQik3rilXTqoPtyofeGBau7VChbrbXy7HiKLFuB339lGkl/exec"
  );
  const data = await res.json();
  DATA = data;

  renderStats(data);
  renderTable(data);
  renderVoucherChart(data);
  renderLeadTrendChart(data);

  if (firstLoad) {
    document.querySelector(".loading")?.classList.remove("active");
    firstLoad = false; // chỉ lần đầu
  }
}

// ======================
// 📊 AUTO CHECK VERSION
async function checkVersion() {
  try {
    const url = `https://dev-trongphuc.github.io/flip_game/version.txt.txt?v=${Date.now()}`;
    const res = await fetch(url, { cache: "no-store" });
    const version = await res.text();
    const trimmed = version.trim();
    console.log("📦 Version fetch về:", trimmed);

    if (currentVersion === null) {
      currentVersion = trimmed;
      await loadData();
    } else if (trimmed !== currentVersion) {
      console.log("🔁 Có cập nhật mới, reload data...");
      currentVersion = trimmed;
      await loadData();
    }
  } catch (err) {
    console.error("⚠️ Lỗi khi check version:", err);
  }
}

// Check mỗi 5s
setInterval(checkVersion, 5000);
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
  if (!data || !Array.isArray(data)) return;

  const ctx = document.getElementById("voucher_chart");
  if (!ctx) return;
  const c2d = ctx.getContext("2d");

  // ❌ Xóa chart cũ
  if (window.voucher_chart_instance) {
    window.voucher_chart_instance.destroy();
    window.voucher_chart_instance = null;
  }

  // 🔹 Đếm số lượng voucher
  const counts = {};
  data.forEach((v) => {
    const shortName = cleanVoucherName(v.voucher_name);
    counts[shortName] = (counts[shortName] || 0) + 1;
  });

  const vouchers = Object.keys(counts);
  const values = Object.values(counts);
  if (!vouchers.length) return;

  // 🔸 Voucher nhiều nhất
  const [maxVoucher] = Object.entries(counts).reduce((a, b) =>
    a[1] > b[1] ? a : b
  );

  // 🎨 Gradient vàng & xám
  const gradientGold = c2d.createLinearGradient(0, 0, 0, 300);
  gradientGold.addColorStop(0, "rgba(212,0,0,1)");
  gradientGold.addColorStop(1, "rgba(212,0,0,0.4)");

  const gradientGray = c2d.createLinearGradient(0, 0, 0, 300);
  gradientGray.addColorStop(0, "rgba(210,210,210,0.9)");
  gradientGray.addColorStop(1, "rgba(160,160,160,0.4)");

  const bgColors = vouchers.map((v) =>
    v === maxVoucher ? gradientGold : gradientGray
  );

  // 🔹 Map voucher → image

  const voucherImages = {};
  vouchers.forEach((v, i) => {
    const img = new Image();
    img.src = vouchersIMG[i % vouchersIMG.length]; // nếu ít hình hơn voucher thì lặp lại
    voucherImages[v] = img;
  });

  window.voucher_chart_instance = new Chart(c2d, {
    type: "bar",
    data: {
      labels: vouchers,
      datasets: [
        {
          label: "Count",
          data: values,
          backgroundColor: bgColors,
          borderRadius: 8,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: { left: 10, right: 10, bottom: 30 } },
      animation: { duration: 600, easing: "easeOutQuart" },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (c) =>
              `Count: ${c.raw} (${(
                (c.raw / values.reduce((a, b) => a + b, 0)) *
                100
              ).toFixed(1)}%)`,
          },
        },
        datalabels: {
          anchor: "end",
          align: "end",
          offset: 2,
          font: { size: 11, weight: "600" },
          color: "#555",
          formatter: (v) => (v > 0 ? v : ""),
        },
      },
      scales: {
        x: {
          grid: {
            color: "rgba(0,0,0,0.03)",
            drawBorder: true,
            borderColor: "rgba(0,0,0,0.05)",
          },
          ticks: {
            display: false, // ẩn text, hiển thị ảnh
          },
        },
        y: {
          beginAtZero: true,
          grid: {
            color: "rgba(0,0,0,0.03)",
            drawBorder: true,
            borderColor: "rgba(0,0,0,0.05)",
          },
          ticks: { display: false },
          suggestedMax: Math.max(...values) * 1.1,
        },
      },
    },
    plugins: [
      ChartDataLabels,
      {
        id: "xAxisImages",
        afterDraw: (chart) => {
          const xAxis = chart.scales.x;
          const ctx = chart.ctx;
          xAxis.ticks.forEach((tick, index) => {
            const label = chart.data.labels[index];
            const img = voucherImages[label];
            if (img && img.complete) {
              const x = xAxis.getPixelForTick(index);
              const y = xAxis.bottom + 0; // cách trục 5px
              const size = 30;
              ctx.drawImage(img, x - size / 2, y, size, size);
            }
          });
        },
      },
    ],
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
  if (!table) return console.warn("⚠️ Không tìm thấy #main_table trong DOM.");

  let tbody = table.querySelector("tbody");
  if (!tbody) {
    tbody = document.createElement("tbody");
    table.appendChild(tbody);
  }
  tbody.innerHTML = "";

  // Tạo map voucher → image
  const voucherMap = {};
  const uniqueVouchers = [
    ...new Set(data.map((item) => cleanVoucherName(item.voucher_name))),
  ];
  uniqueVouchers.forEach((v, i) => {
    voucherMap[v] = vouchersIMG[i % vouchersIMG.length];
  });

  data.forEach((item) => {
    const voucherName = cleanVoucherName(item.voucher_name);
    const voucherImg = voucherMap[voucherName];

    // 🔹 Check trạng thái
    let statusText = item.is_used;
    let disableBtn = !!item.is_used; // nếu đã dùng thì disable

    // 🔹 Nếu voucherName chứa "Fried Gyoza"
    if (voucherName.includes("Fried Gyoza")) {
      statusText = "REDEEMED IN EVENT";
      disableBtn = true;
    }

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${new Date(item.Timestamp).toLocaleString("vi-VN")}</td>
      <td>${item.email || ""}</td>
      <td>${item.phone || ""}</td>
      <td>
        <img src="${voucherImg}" alt="${voucherName}" style="width:30px; height:30px; vertical-align:middle; margin-right:5px;">
        ${voucherName}
      </td>
      <td>
        <p class="${disableBtn ? "disable" : ""}">${statusText}</p>
      </td>
      <td>
        <p class="use-btn ${disableBtn ? "disable" : ""}" >
          <i class="fa-solid fa-ticket"></i>
        </p>
      </td>
    `;
    tbody.appendChild(tr);
  });

  const count = document.querySelector(".loaded_count");
  if (count) count.textContent = data.length;
}

// ------------------ Filter ------------------
const searchInput = document.querySelector(".dom_search");
const filterBtn = document.getElementById("find_data");

function filterTable() {
  const keyword = searchInput.value.trim().toLowerCase();
  const filtered = DATA.filter((d) => {
    const phone = d.phone ? String(d.phone).toLowerCase() : "";
    const email = d.email ? String(d.email).toLowerCase() : "";
    return phone.includes(keyword) || email.includes(keyword);
  });
  renderTable(filtered);
}

searchInput.addEventListener("input", filterTable);
filterBtn.addEventListener("click", filterTable);

function setupRedeemButtons() {
  document.querySelectorAll(".dom_campaign_filter div p").forEach((p) => {
    if (p.textContent.trim().toUpperCase() === "USE") {
      p.addEventListener("click", async () => {
        const newBtn = p;
        const voucherText = p.closest("div").nextElementSibling;
        const phone = voucherText
          ?.querySelector("p[data-type='phone']")
          ?.textContent?.trim();
        const email = voucherText
          ?.querySelector("p[data-type='email']")
          ?.textContent?.trim();
        const status = voucherText
          ?.querySelector("p[data-type='status']")
          ?.textContent?.trim();

        if (status && status.toUpperCase().includes("USED")) {
          alert("⚠️ Voucher đã sài rồi!");
          return;
        }

        // đổi button
        newBtn.classList.add("disable");
        newBtn.textContent = "REDEEMED";

        try {
          await fetch(
            "https://script.google.com/macros/s/AKfycbysS95cseVSb9HUgINWjMHQik3rilXTqoPtyofeGBau7VChbrbXy7HiKLFuB339lGkl/exec",
            {
              method: "POST",
              mode: "no-cors",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, phone }),
            }
          );
          console.log("✅ Gửi xác nhận redeem thành công (no-cors)");
          alert("✅ Redeem thành công!");

          // update status + date tạm thời
          if (voucherText) {
            voucherText.querySelector("p[data-type='status']").textContent =
              "USED";
            voucherText.querySelector("p[data-type='date']").textContent =
              new Date().toLocaleDateString("vi-VN");
          }

          // sau 2s đổi lại button về USE
          setTimeout(() => {
            newBtn.classList.remove("disable");
            newBtn.textContent = "USE";
          }, 2000);
        } catch (err) {
          console.error("❌ Lỗi khi fetch voucher:", err);
          alert("❌ Lỗi khi redeem, thử lại!");
          newBtn.classList.remove("disable");
          newBtn.textContent = "USE";
        }
      });
    }
  });
}
// ------------------ Filter ------------------

function filterTable() {
  const keyword = searchInput.value.trim().toLowerCase();
  const filtered = DATA.filter((d) => {
    const phone = d.phone ? String(d.phone).toLowerCase() : "";
    const email = d.email ? String(d.email).toLowerCase() : "";
    return phone.includes(keyword) || email.includes(keyword);
  });
  renderTable(filtered);
}

searchInput.addEventListener("input", filterTable);
filterBtn.addEventListener("click", filterTable);
