function getTodayDate() {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yyyy = now.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}
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
      // localStorage.setItem("chicken_time", timeNow);

      // Hiển thị voucher
      mainVoucher.classList.add("active");
      mainInfo.classList.remove("active");
    } else {
      alert("⏰ Hết giờ rồi. Chơi lại nha!");
      resetGame();
    }
  }, 500);
}

// ---------------------
// Khi vào trang
// ---------------------
window.addEventListener("DOMContentLoaded", () => {
  const gameData = JSON.parse(localStorage.getItem("game_data") || "null");

  const mainInfo = document.querySelector(".main_info");
  const mainVoucher = document.querySelector(".main_voucher");

  // 🕐 Chuẩn hóa ngày -> yyyy-mm-dd dạng local
  const formatDate = (d) => {
    const date = new Date(d);
    date.setHours(0, 0, 0, 0);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // 🕐 Chuyển "dd/mm/yyyy" → timestamp local (0h00)
  const parseDMY = (str) => {
    const [dd, mm, yyyy] = str.split("/").map(Number);
    const d = new Date(yyyy, mm - 1, dd);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  };

  // 🕐 Hôm nay, hôm qua, và ngày giới hạn
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const limitDate = new Date(2025, 10, 17); // 17/11/2025 (month 10 = November)
  limitDate.setHours(0, 0, 0, 0);

  if (gameData?.reward) {
    const { reward, email, lastplay } = gameData;

    const lastPlayTime = parseDMY(lastplay);
    const yesterdayTime = yesterday.getTime();
    const todayTime = today.getTime();

    console.log(
      "🕐 today:",
      formatDate(today),
      "| yesterday:",
      formatDate(yesterday),
      "| lastplay:",
      lastplay
    );

    // ✅ Nếu hôm nay >= 17/11/2025 → chỉ hiện quà, không cho chơi
    if (todayTime >= limitDate.getTime()) {
      showReward(mainVoucher, mainInfo, reward, email);
      return;
    }

    // ✅ Nếu lastplay = hôm qua → reset quà, cho chơi lại
    if (lastPlayTime === yesterdayTime) {
      localStorage.setItem("game_data", JSON.stringify(gameData));
      mainInfo.classList.remove("active");
      mainVoucher.classList.remove("active");
      // showGame(); // bật nếu có
      return;
    }

    // ✅ Nếu đã có phần thưởng → hiện voucher
    showReward(mainVoucher, mainInfo, reward, email);
  } else {
    // ✅ Chưa có gì → KHÔNG hỏi info, chỉ hiện game
    mainInfo.classList.remove("active");
    mainVoucher.classList.remove("active");
    // showGame();
  }

  // ✅ Hàm hiển thị quà
  function showReward(mainVoucher, mainInfo, reward, email) {
    const freeItem = mainVoucher.querySelector(".free_item");
    const rewardText = mainVoucher.querySelector(
      ".text.center:first-of-type b.main_clr"
    );
    const emailText = mainVoucher.querySelector(".text.center:nth-of-type(2)");
    const claimBtn = document.getElementById("claimRewardBtn");

    freeItem.src = reward.img;
    rewardText.textContent = reward.name;

    if (email) {
      // Đã có email => hiện dòng voucher đã gửi
      emailText.style.display = "block";
      emailText.innerHTML = `Voucher ${reward.name} has been sent to your email <span class="email">${email}</span>`;
      claimBtn.style.display = "none";

      // ✅ đổi ảnh cảm ơn + toggle text
      const cgraImg = mainVoucher.querySelector(".cgra");
      cgraImg.src = "./assets/imgs/thankyou.png";
      mainVoucher.querySelector(".will_none").style.display = "none";
      mainVoucher.querySelector(".will_show").style.display = "block";
    } else {
      // Chưa có email => ẩn dòng text, hiện nút nhận quà
      emailText.style.display = "none";
      claimBtn.style.display = "inline-block";
    }

    mainVoucher.classList.add("active");
    mainInfo.classList.remove("active");

    // Khi bấm “Nhận quà” → mở form info
    claimBtn.onclick = () => {
      mainVoucher.classList.remove("active");
      mainInfo.classList.add("active");
    };
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
  let name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const email = document.getElementById("mail").value.trim();

  if (!email) {
    alert("Please enter Email");
    return;
  }

  // Nếu chưa nhập name thì lấy phần đầu email
  if (!name && email.includes("@")) {
    name = email
      .split("@")[0]
      .replace(/[^a-zA-Z0-9]/g, " ") // bỏ ký tự lạ
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  // Lấy data cũ trong localStorage
  const gameData = JSON.parse(localStorage.getItem("game_data") || "{}");

  // Cập nhật thêm info người chơi
  gameData.name = name;
  gameData.phone = phone;
  gameData.email = email;

  // Lưu lại
  localStorage.setItem("game_data", JSON.stringify(gameData));

  // 🚀 Gửi request đến API MoMo
  if (gameData.email) sendVoucherToMomo(gameData, gameData.reward);

  // Chuyển giao diện
  mainInfo.classList.remove("active");
  mainVoucher.classList.add("active");
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
    name: "Free 01 Buta Don",
    img: "./assets/compress_voucher/voucher1.jpg",
    attribution: {
      linkKey: "cfd64d7a-a3a2-4025-a6f7-d328681f21fc",
      utm_tracking_id: "8fd9b332-a867-4038-9f94-7928fa046e17",
      slug: "aburi-en-vietnam-j00cc",
      id: "ff7aa6ba-2864-45c2-b0ec-0092c553776b",
    },
  },
  {
    id: 2,
    name: "Free 01 Kiwami Tonkotsu Ramen",
    img: "./assets/compress_voucher/voucher2.jpg",
    attribution: {
      linkKey: "88dbf8e4-df42-4207-bd6f-822c1a2c10aa",
      utm_tracking_id: "780e4de2-912f-47ea-9907-42d303f492e3",
      slug: "aburi-en-vietnam-j00cc",
      id: "943a1c87-82f0-4c34-a910-fd60963c5f85",
    },
  },
  {
    id: 3,
    name: "20% OFF on total Food Menu",
    img: "./assets/compress_voucher/voucher3.jpg",
    attribution: {
      linkKey: "57172460-b7dc-44ab-ae17-ffe4f1415b47",
      utm_tracking_id: "e2b7ce35-885a-49ca-b38f-2bfb9e2858da",
      slug: "aburi-en-vietnam-j00cc",
      id: "273f0eaa-1ec5-44e1-a5eb-bb13755ad77f",
    },
  },
  {
    id: 4,
    name: "30% OFF on Sushi & Sashimi Set (16 kinds)",
    img: "./assets/compress_voucher/voucher4.jpg",
    attribution: {
      linkKey: "ff52d57a-7e1a-40f7-87fb-10e19eed8838",
      utm_tracking_id: "fdd921b4-8862-41df-94e4-e2769510e572",
      slug: "aburi-en-vietnam-j00cc",
      id: "78890396-aeab-4d2d-a982-70368a047b2f",
    },
  },
  {
    id: 5,
    name: "Discount 200.000đ for dining",
    img: "./assets/compress_voucher/voucher5.jpg",
    attribution: {
      linkKey: "fcc2071f-0e35-443c-929f-a30303531b16",
      utm_tracking_id: "ea408fae-9040-4a3e-9433-a6975db64747",
      slug: "aburi-en-vietnam-j00cc",
      id: "be5e1379-0c29-475f-84a6-6b7ca8068118",
    },
  },
  {
    id: 6,
    name: "Discount 500.000đ for dining",
    img: "./assets/compress_voucher/voucher6.jpg",
    attribution: {
      linkKey: "5313a7cc-34ab-483a-af47-aceabb762126",
      utm_tracking_id: "57518064-3063-47a1-8ad9-9992959057c0",
      slug: "aburi-en-vietnam-j00cc",
      id: "e065e53e-2223-47d7-8e57-3e588e564b6d",
    },
  },
];

// spinBtn.addEventListener("click", () => {
//   if (isSpinning) return;
//   isSpinning = true;
//   spinBtn.style.display = "none";

//   // random kết quả theo tỉ lệ
//   const rand = Math.random() * 100;
//   let result;
//   if (rand < 10) result = 1; // 10%
//   else if (rand < 40) result = 2; // 30%
//   else if (rand < 70) result = 3; // 30%
//   else result = 4; // 30%

//   const resultAngles = {
//     1: 20,
//     2: 65,
//     3: 155,
//     4: 110,
//   };

//   const extraSpin = 360 * 5;
//   const finalAngle = extraSpin + resultAngles[result];

//   // reset và xoay
//   wheel.style.transition = "transform 4.5s";
//   wheel.style.transform = `rotate(${finalAngle}deg)`;

//   // sau khi quay xong
//   setTimeout(() => {
//     const reward = vouchers.find((v) => v.id === result);
//     if (reward) {
//       // ✅ Lưu vào localStorage
//       const userData = JSON.parse(localStorage.getItem("game_data") || "{}");
//       userData.reward = reward;
//       userData.lastplay = getTodayDate();
//       localStorage.setItem("game_data", JSON.stringify(userData));
//       showVoucher(reward, userData.email);
//       console.log(userData);

//       // ✅ (Tuỳ chọn) Gửi lên Google Form
//       // if (userData.phone && userData.email) {
//       //   fetch(
//       //     "https://docs.google.com/forms/u/0/d/e/1FAIpQLSfwx7VWvPgOPnVtCm9WGruZF9z4HL6Yklyv0pCYPVe4M3QYvA/formResponse",
//       //     {
//       //       method: "POST",
//       //       mode: "no-cors",
//       //       headers: { "Content-Type": "application/x-www-form-urlencoded" },
//       //       body: new URLSearchParams({
//       //         "entry.122304316": userData.phone,
//       //         "entry.648445093": userData.email,
//       //         "entry.1894009205": reward.name,
//       //       }),
//       //     }
//       //   );
//       // }
//     }

//     isSpinning = false;
//   }, 5000);
// });
function spinWheel() {
  if (isSpinning) return;
  isSpinning = true;
  spinBtn.style.display = "none";

  const userData = JSON.parse(localStorage.getItem("game_data") || "{}");
  const previousRewardId = userData?.reward?.id;

  // Lọc voucher chưa trúng
  const available = vouchers.filter((v) => v.id !== previousRewardId);

  // Random kết quả
  const randIndex = Math.floor(Math.random() * available.length);
  const reward = available[randIndex];

  // Quay bánh xe
  const resultAngles = { 1: 246, 2: 285, 3: 104, 4: 332, 5: 154, 6: 198 };
  const finalAngle = 360 * 5 + (resultAngles[reward.id] || 0);
  wheel.style.transition = "transform 4.5s";
  wheel.style.transform = `rotate(${finalAngle}deg)`;

  setTimeout(() => {
    userData.reward = reward;
    userData.lastplay = getTodayDate();
    localStorage.setItem("game_data", JSON.stringify(userData));

    if (userData.email) sendVoucherToMomo(userData, reward);
    else showVoucher(reward, userData.email);

    isSpinning = false;
  }, 4500);
}
spinBtn.addEventListener("click", () => {
  spinWheel();
});
function sendVoucherToMomo(user, reward) {
  const payload = {
    name: user.name || "-",
    email: user.email,
    phoneNumber: user.phone || "000",
    sourceType: "DIRECT_LINK",
    attribution: reward.attribution,
    timezoneOffset: new Date().getTimezoneOffset(),
    optin: false,
  };

  // 📨 gửi song song 2 fetch
  const momoPromise = fetch(
    `https://sg-be-for-cp-api.momos.io/api/v1/momos/vouchers/${reward.attribution.id}/dispense`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  ).then((res) => res.json());

  const formPromise = fetch(
    "https://docs.google.com/forms/u/0/d/e/1FAIpQLSfwx7VWvPgOPnVtCm9WGruZF9z4HL6Yklyv0pCYPVe4M3QYvA/formResponse",
    {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        "entry.122304316": user.name,
        "entry.648445093": user.email,
        "entry.1894009205": reward.name, // 👈 nhớ có reward.name nha
      }),
    }
  );

  // 🧩 chạy song song luôn
  return Promise.all([momoPromise, formPromise])
    .then(([data]) => {
      if (data?.errorMessage?.includes("Invalid Email")) {
        alert("❌ Email không hợp lệ, vui lòng nhập lại!");
        user.email = "";
        localStorage.setItem("game_data", JSON.stringify(user));
        document.querySelector(".main_voucher").classList.remove("active");
        document.querySelector(".main_info").classList.add("active");
      } else {
        showThankYou(user, reward);
      }
    })
    .catch(() => {
      showThankYou(user, reward);
    });
}

function showThankYou(user, reward) {
  const mainVoucher = document.querySelector(".main_voucher");
  const freeItem = mainVoucher.querySelector(".free_item");
  const rewardText = mainVoucher.querySelector(".text.center b.main_clr");
  const emailText = mainVoucher.querySelector(".text.center:nth-of-type(2)");
  const claimBtn = document.getElementById("claimRewardBtn");
  const cgraImg = mainVoucher.querySelector(".cgra");

  freeItem.src = reward.img;
  rewardText.textContent = reward.name;
  emailText.style.display = "block";
  emailText.innerHTML = `Voucher ${reward.name} has been sent to your email <span class="email">${user.email}</span>`;
  claimBtn.style.display = "none";

  cgraImg.src = "./assets/imgs/thankyou.png";
  mainVoucher.querySelector(".will_none").style.display = "none";
  mainVoucher.querySelector(".will_show").style.display = "block";
  mainVoucher.classList.add("active");
  document.querySelector(".main_info").classList.remove("active");
}
// window.addEventListener("load", () => {
//   const saved = JSON.parse(localStorage.getItem("game_data") || "{}");
//   if (saved.reward) {
//     showVoucher(saved.reward, saved.email);
//   }
// });
function showVoucher(reward, mail) {
  const mainVoucher = document.querySelector(".main_voucher");
  const freeItem = mainVoucher.querySelector(".free_item");
  const rewardText = mainVoucher.querySelector(".text.center b.main_clr");
  const emailText = mainVoucher.querySelector(".text.center:nth-of-type(2)");
  const claimBtn = document.getElementById("claimRewardBtn");

  // Hiển thị thông tin giải thưởng
  freeItem.src = reward.img;
  rewardText.textContent = reward.name;

  // Ẩn dòng email (chưa gửi)
  emailText.style.display = "none";

  // Hiện khối voucher + nút nhận
  mainVoucher.classList.add("active");
  claimBtn.style.display = "inline-block";

  // Khi người chơi bấm Nhận quà
  claimBtn.onclick = () => {
    mainVoucher.classList.remove("active");
    mainInfo.classList.add("active"); // Hiện form nhập info
  };
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
welcome.style.display = "none";
document.addEventListener("DOMContentLoaded", () => {
  const bgMusic = new Audio("./assets/mp3/nhacnen.mp3");
  bgMusic.loop = true;
  bgMusic.volume = 0.4; // âm lượng nhẹ cho dễ chịu
  bgMusic.play().catch(() => {
    console.log("⚠️ User chưa tương tác, nhạc sẽ phát sau khi click đầu tiên");
  });
  const wheel = document.querySelector(".main_spin .wheel");
  // Delay nhẹ để có hiệu ứng mượt
  setTimeout(() => {
    wheel.style.transform = "rotate(-60deg)";
  }, 200);
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
