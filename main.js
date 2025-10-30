const gameBlock = document.querySelector(".game_block");
const timerCount = document.querySelector(".timer_count");
const timerBar = document.querySelector(".timer_bar::after"); // ❌ không chọn pseudo được
const timerBarEl = document.querySelector(".timer_bar"); // ✅ chọn thẻ chính

function updateTimerBar(progress) {
  // progress = từ 1 (đầy) -> 0 (hết)
  timerBarEl.style.setProperty("--progress", progress);
}

const TOTAL_TIME = 90;
let timeLeft = TOTAL_TIME;
let firstCard = null;
let secondCard = null;
let lock = false;
let matched = 0;
let timer;

// 🐶 Danh sách hình động vật mẫu (10 cặp)
const animalImgs = [
  "./assets/card/card (1).png",
  "./assets/card/card (2).png",
  "./assets/card/card (3).png",
  "./assets/card/card (4).png",
  "./assets/card/card (5).png",
  "./assets/card/card (6).png",
  "./assets/card/card (7).png",
  "./assets/card/card (8).png",
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
const mainInfo = document.querySelector(".main_info");

function endGame(win) {
  clearInterval(timer);
  setTimeout(() => {
    if (win) {
      mainInfo.classList.add("active");
    } else {
      alert("⏰ Hết giờ rồi. Chơi lại nha!");
      resetGame(); // không reset ngay, để người chơi quay xong mới reset nếu muốn
    }
  }, 500);
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
  const phone = document.getElementById("phone").value.trim();
  const email = document.getElementById("mail").value.trim();

  if (!phone || !email) {
    alert("Please enter complete information");
    return;
  }

  const data = { phone, email };
  localStorage.setItem("game_data", JSON.stringify(data));
  mainInfo.classList.remove("active");
  mainSpin.classList.add("active");
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

  const extraSpin = 360 * 4;
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
  voucherCode.src =
    "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Example";
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
