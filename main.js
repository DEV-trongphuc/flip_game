const gameBlock = document.querySelector(".game_block");
const timerCount = document.querySelector(".timer_count");
const timerBar = document.querySelector(".timer_bar::after"); // ❌ không chọn pseudo được
const timerBarEl = document.querySelector(".timer_bar"); // ✅ chọn thẻ chính

function updateTimerBar(progress) {
  // progress = từ 1 (đầy) -> 0 (hết)
  timerBarEl.style.setProperty("--progress", progress);
}

const TOTAL_TIME = 20;
let timeLeft = TOTAL_TIME;
let firstCard = null;
let secondCard = null;
let lock = false;
let matched = 0;
let timer;

const animalImgs = [
  "./assets/card/card (1).png",
  "./assets/card/card (4).png",
  "./assets/card/card (6).png",
  "./assets/card/card (3).png",
  // "./assets/card/card (5).png",
  // "./assets/card/card (6).png",
];
const vouchersIMG = [
  "./assets/vouchers/voucher (1).png",
  "./assets/vouchers/voucher (3).png",
  "./assets/vouchers/voucher (4).png",
  "./assets/vouchers/voucher (5).png",
];

// 👉 Nhân đôi & trộn ngẫu nhiên
let cards = [...animalImgs, ...animalImgs]
  .sort(() => Math.random() - 0.5)
  .map((src, i) => ({
    id: i,
    src,
    flipped: false,
    matched: false,
  }));
// function renderCardsIntro() {
//   gameBlock.innerHTML = ""; // Xóa tất cả thẻ cũ nếu có

//   cards.forEach((card, index) => {
//     const img = document.createElement("img");
//     img.classList.add("card_item");
//     img.src = "./assets/imgs/card_back.png";
//     img.style.opacity = "0";
//     img.style.transform = "scale(0)";
//     img.style.transition = "transform 0.4s, opacity 0.4s";

//     // click từng thẻ
//     img.addEventListener("click", () => handleClick(index));

//     gameBlock.appendChild(img);

//     // Animation xuất hiện lần lượt
//     setTimeout(() => {
//       img.style.opacity = "1";
//       img.style.transform = "scale(1)";
//     }, index * 100); // lệch nhau 100ms
//   });
// }

function renderCards(firstRender = false) {
  gameBlock.querySelectorAll("img").forEach((img, index) => {
    const card = cards[index];
    img.src =
      card.flipped || card.matched ? card.src : "./assets/imgs/card_back.png";
    if (card.matched) {
      img.classList.add("matched");
    } else {
      img.classList.remove("matched");
    }
    // trạng thái match
    img.style.setProperty("opacity", card.matched ? "0" : "1", "important");

    // trạng thái flip
    img.style.transform = card.flipped ? "rotateY(180deg)" : "rotateY(0deg)";
    img.style.transition = "transform 0.4s, opacity 0.4s";

    // animation lần đầu
    if (firstRender) {
      img.style.opacity = "0";
      img.style.transform = "scale(0)";
      setTimeout(() => {
        img.style.setProperty("opacity", card.matched ? "0" : "1", "important");
        img.style.transform = "scale(1)";
      }, index * 100);
    }
  });
}

// Xử lý khi click 1 thẻ
function handleClick(index) {
  if (lock) return;
  const card = cards[index];
  if (card.flipped || card.matched) return;

  card.flipped = true;
  // 🔈 Âm thanh lật thẻ
  const flipSound = new Audio("./assets/mp3/flipcard-91468.mp3");
  flipSound.volume = 1;
  flipSound.play();

  renderCards();

  if (!firstCard) {
    firstCard = card;
    return;
  }

  secondCard = card;
  lock = true;

  setTimeout(() => {
    if (firstCard.src === secondCard.src) {
      firstCard.matched = secondCard.matched = true;
      matched += 2;

      // 👉 Thêm hiệu ứng mờ dần khi match
      const imgs = gameBlock.querySelectorAll("img");
      [firstCard.id, secondCard.id].forEach((id) => {
        const img = imgs[id];
        img.style.transition = "opacity 0.5s ease";
        setTimeout(() => (img.style.opacity = "0"), 300);
      });

      if (matched === cards.length) endGame(true);
    } else {
      firstCard.flipped = secondCard.flipped = false;
    }
    firstCard = secondCard = null;
    lock = false;
    renderCards();
  }, 800);
}

// Đếm ngược
function startTimer() {
  timer = setInterval(() => {
    timeLeft--;
    timerCount.textContent = `${timeLeft}s`;

    const progress = timeLeft / TOTAL_TIME;
    document
      .querySelector(".timer_bar")
      .style.setProperty("--progress", progress);

    if (timeLeft <= 0) {
      clearInterval(timer);
      endGame(false);
    }
  }, 1000);
}

// Các biến DOM
// ---------------------
const mainInfo = document.querySelector(".main_info");
const mainVoucher = document.querySelector(".main_voucher");
const timeGetEl = document.querySelector(".main_voucher .time_get");

// ---------------------
// Hàm format ngày giờ
// ---------------------
function getFormattedTime() {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yyyy = now.getFullYear();
  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

// ---------------------
// Khi thắng game
// ---------------------
function endGame(win) {
  clearInterval(timer);
  setTimeout(() => {
    if (win) {
      const timeNow = getFormattedTime();
      timeGetEl.textContent = timeNow;

      // Lưu thời gian thắng
      localStorage.setItem("chicken_time", timeNow);

      // Hiển thị voucher
      mainVoucher.classList.add("active");
      mainInfo.classList.remove("active");
    } else {
      alert("⏰ Time's up. Play again!");
      resetGame();
    }
  }, 500);
}

// ---------------------
// Khi vào trang
// ---------------------
window.addEventListener("DOMContentLoaded", () => {
  const bgMusic = new Audio("./assets/mp3/nhacnen.mp3");
  bgMusic.loop = true;
  bgMusic.volume = 0.4; // âm lượng nhẹ cho dễ chịu
  bgMusic.play().catch(() => {
    console.log("⚠️ User chưa tương tác, nhạc sẽ phát sau khi click đầu tiên");
  });
  const chickenTime = localStorage.getItem("chicken_time");
  const gameData = localStorage.getItem("game_data");

  // ✅ Hàm lấy ngày hiện tại dạng dd/mm/yyyy
  function getTodayDate() {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, "0");
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const yyyy = now.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  // ✅ Lấy ngày trong chickenTime (nếu có)
  let chickenDate = null;
  if (chickenTime) {
    chickenDate = chickenTime.split(" ")[0]; // "11/06/2025"
  }

  const today = getTodayDate();

  // ✅ Nếu có chickenTime nhưng qua ngày mới thì reset để chơi lại
  if (chickenDate && chickenDate !== today) {
    localStorage.removeItem("chicken_time");
    localStorage.removeItem("reward_data");
    // Nếu mày có lưu các biến khác liên quan game, reset ở đây luôn
  }

  // ✅ Sau khi check xong thì đọc lại
  const validChickenTime = localStorage.getItem("chicken_time");

  if (validChickenTime) {
    // ✅ Nếu đã có gà → show voucher
    timeGetEl.textContent = validChickenTime;
    mainVoucher.classList.add("active");
    mainInfo.classList.remove("active");
  } else if (gameData) {
    // ✅ Có game_data nhưng chưa có gà → ẩn info, cho chơi tiếp
    mainInfo.classList.remove("active");
    mainVoucher.classList.remove("active");
    // showGame(); // nếu có hàm này
  } else {
    // ✅ Chưa có gì → hiện form thu thập info
    // mainInfo.classList.add("active");
    mainVoucher.classList.remove("active");
  }
});

// ---------------------
// Giữ nguyên game_data
// ---------------------
function saveGameData(newData) {
  const oldData = JSON.parse(localStorage.getItem("game_data")) || {};
  const merged = { ...oldData, ...newData };
  localStorage.setItem("game_data", JSON.stringify(merged));
}

function resetGame() {
  firstCard = null;
  secondCard = null;
  lock = false;
  matched = 0;
  timeLeft = TOTAL_TIME;
  cards = [...animalImgs, ...animalImgs]
    .sort(() => Math.random() - 0.5)
    .map((src, i) => ({
      id: i,
      src,
      flipped: false,
      matched: false,
    }));
  renderCards();
  startTimer();
}

// Gán click cho từng thẻ sẵn trong HTML của mày
gameBlock.querySelectorAll("img").forEach((img, i) => {
  img.addEventListener("click", () => handleClick(i));
});

// Bắt đầu game
// startTimer();
const welcome = document.querySelector(".main_welcome");
const startBtn = document.getElementById("startBtn");
const gameFlip = document.querySelector(".main_game_flip");

gameFlip.style.display = "none"; // ẩn game trước

const submitBtn = document.querySelector(".submit_btn");
const status = document.getElementById("status");
const mainSpin = document.querySelector(".main_spin");

submitBtn.addEventListener("click", () => {
  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const email = document.getElementById("mail").value.trim();

  if (!name || !phone || !email) {
    alert("Please enter complete information");
    return;
  }

  // Kiểm tra định dạng email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert("Please enter a valid email");
    return;
  }

  // Kiểm tra định dạng sdt (cho phép số, +, -, (), khoảng trắng)
  const phoneRegex = /^[+()\d\s-]{6,20}$/;
  if (!phoneRegex.test(phone)) {
    alert("Please enter a valid phone number");
    return;
  }

  const data = { name, phone, email };
  localStorage.setItem("game_data", JSON.stringify(data));

  mainInfo.classList.remove("active");
  // mainSpin.classList.add("active");
});

const spinBtn = document.getElementById("spin_btn");
const wheel = document.querySelector(".wheel");
const voucherBox = document.querySelector(".main_voucher");
const voucherText = voucherBox.querySelector(".text");
const voucherImg = voucherBox.querySelectorAll("img")[1]; // ảnh voucher (ảnh thứ 2)
const voucherCode = voucherBox.querySelectorAll("img")[2]; // ảnh voucher (ảnh thứ 2)

let isSpinning = false;

const vouchers = [
  {
    id: 1,
    name: "Free a Chura Nigiri Set",
    img: "./assets/vouchers/voucher (3).png",
    at: "En Group, 116 Pasteur",
    date: "30/11/2025",
  },
  {
    id: 2,
    name: "Free 1 Kiwami Tonkotsu Ramen",
    img: "./assets/vouchers/voucher (4).png",
    at: "Kiwami, 116 Pasteur",
    date: "30/11/2025",
  },
  {
    id: 3,
    name: "Free 1 Premium Hoho Don",
    img: "./assets/vouchers/voucher (5).png",
    at: "Aburi-EN 116 Pasteur",
    date: "30/11/2025",
  },
  {
    id: 4,
    name: "Free 1 Fried Gyoza",
    img: "./assets/vouchers/voucher (1).png",
    at: "The Waterbomb 2025",
    date: "Redeem NOW",
  },
];

spinBtn.addEventListener("click", () => {
  if (isSpinning) return;
  isSpinning = true;
  spinBtn.style.display = "none";

  // random kết quả theo tỉ lệ
  const rand = Math.random() * 100;
  let result;
  if (rand < 10) result = 1; // 10%
  else if (rand < 40) result = 2; // 30%
  else if (rand < 70) result = 3; // 30%
  else result = 4; // 30%

  const resultAngles = {
    1: 20,
    2: 65,
    3: 155,
    4: 110,
  };

  const extraSpin = 360 * 5;
  const finalAngle = extraSpin + resultAngles[result];

  // reset và xoay
  wheel.style.transition = "transform 4.5s";
  wheel.style.transform = `rotate(${finalAngle}deg)`;

  // sau khi quay xong
  setTimeout(() => {
    const reward = vouchers.find((v) => v.id === result);
    console.log(reward);
    if (reward) {
      // ✅ Lưu vào localStorage
      const userData = JSON.parse(localStorage.getItem("game_data") || "{}");
      userData.reward = reward;
      localStorage.setItem("game_data", JSON.stringify(userData));

      // ✅ Hiển thị phần thưởng
      showVoucher(reward, userData.email);

      // ✅ (Tuỳ chọn) Gửi lên Google Form
      if (userData.phone && userData.email) {
        fetch(
          "https://docs.google.com/forms/u/0/d/e/1FAIpQLSfwx7VWvPgOPnVtCm9WGruZF9z4HL6Yklyv0pCYPVe4M3QYvA/formResponse",
          {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              "entry.122304316": userData.phone,
              "entry.648445093": userData.email,
              "entry.1894009205": reward.name,
            }),
          }
        );
      }
    }

    isSpinning = false;
  }, 5000);
});
// window.addEventListener("load", () => {
//   const saved = JSON.parse(localStorage.getItem("game_data") || "{}");
//   if (saved.reward) {
//     showVoucher(saved.reward, saved.email);
//   }
// });
function showVoucher(reward, mail) {
  voucherCode.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://flip-game-gules.vercel.app/?code=${mail}`;
  voucherBox.classList.add("active");
  voucherImg.src = reward.img;
  voucherText.innerHTML = `
      <p>${reward.name}</p>
      <p><b>At:</b> ${reward.at}</p>
      <p><b>Date:</b> ${reward.date}</p>
    `;
}

// ✅ Hàm preload ảnh (trả về Promise khi tất cả ảnh load xong)
function preloadImages(imagePaths) {
  return new Promise((resolve) => {
    let loadedCount = 0;
    const total = imagePaths.length;

    if (total === 0) {
      resolve(); // không có ảnh thì resolve luôn
      return;
    }

    imagePaths.forEach((path) => {
      const img = new Image();
      img.onload = img.onerror = () => {
        loadedCount++;
        if (loadedCount === total) {
          resolve();
        }
      };
      img.src = path;
    });
  });
}
Promise.all([preloadImages(animalImgs), preloadImages(vouchersIMG)]).then(
  () => {
    startBtn.addEventListener("click", () => {
      welcome.style.animation = "slideOut 0.5s ease forwards";
      setTimeout(() => {
        welcome.style.display = "none";
        gameFlip.style.display = "flex";
        gameFlip.classList.add("active");
        renderCards(true);
        // ✅ Bắt đầu đếm thời gian khi vào game
      }, 800);
      setTimeout(() => {
        startTimer();
      }, 2500);
    });
  }
);
document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  if (!code) return;

  const voucherBox = document.querySelector(".main_voucher_check");
  const voucherImg = voucherBox.querySelector("img");
  const voucherText = voucherBox.querySelector(".text");

  voucherBox.classList.add("active");

  // Hàm fetch và render trạng thái voucher
  async function fetchVoucher() {
    voucherImg.src = "./assets/imgs/voucher.png";
    voucherText.innerHTML = `
      <p><b>Voucher:</b> Checking...</p>
      <p><b>Status:</b> Please wait</p>
    `;

    try {
      const res = await fetch(
        `https://script.google.com/macros/s/AKfycbysS95cseVSb9HUgINWjMHQik3rilXTqoPtyofeGBau7VChbrbXy7HiKLFuB339lGkl/exec?email=${encodeURIComponent(
          code
        )}`
      );
      const data = await res.json();

      if (!data || data.error) {
        voucherText.innerHTML = `
          <p><b>Voucher:</b> Không tìm thấy thông tin voucher</p>
          <p><b>Status:</b> ❌ Không hợp lệ</p>
        `;
        return null;
      }

      const used = data.is_used && data.is_used !== "";
      const dateStr = used ? data.is_used : "30/11/2025";

      voucherText.innerHTML = `
        <p><b>Voucher:</b> ${data.voucher_name}</p>
        <p><b>Phone:</b> ${data.phone || "-"}</p>
        <p><b>Email:</b> ${data.email || "-"}</p>
        <p class="${used ? "inactive" : "active"}">
          <b>Status:</b> 
          <i class="fa-solid fa-circle"></i> ${used ? "Used" : "Available"}
        </p>
        <p><b>Date:</b> ${dateStr}</p>
        <p class="check_btn ${used ? "disable" : ""}">
          ${used ? "REDEEMED" : "CONFIRM"}
        </p>
      `;
      return data;
    } catch (err) {
      console.error("❌ Lỗi khi fetch voucher:", err);
      voucherText.innerHTML = `
        <p><b>Voucher:</b> Lỗi kết nối</p>
        <p><b>Status:</b> ⚠️ Vui lòng thử lại</p>
      `;
      return null;
    }
  }

  // Lần đầu fetch
  fetchVoucher().then((data) => {
    if (!data) return;
    const used = data.is_used && data.is_used !== "";
    const newBtn = voucherText.querySelector(".check_btn");
    if (!used && newBtn) {
      newBtn.addEventListener("click", async () => {
        newBtn.classList.add("disable");
        newBtn.textContent = "REDEEMED";

        try {
          await fetch(
            `https://script.google.com/macros/s/AKfycbysS95cseVSb9HUgINWjMHQik3rilXTqoPtyofeGBau7VChbrbXy7HiKLFuB339lGkl/exec`,
            {
              method: "POST",
              mode: "no-cors",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: code }),
            }
          );

          console.log("✅ Gửi xác nhận redeem thành công (no-cors)");

          // sau khi redeem xong, fetch lại để cập nhật trạng thái
          setTimeout(fetchVoucher, 500); // delay 0.5s để server cập nhật
        } catch (err) {
          console.error("❌ Lỗi khi redeem voucher:", err);
          alert("❌ Lỗi khi redeem, thử lại!");
          newBtn.classList.remove("disable");
          newBtn.textContent = "CONFIRM";
        }
      });
    }
  });
});
