(function () {
  "use strict";

  const creditsDisplay = document.getElementById("credits-display");
  let credits = 500;

  function updateCredits() {
    creditsDisplay.textContent = String(credits);
    dealButton.disabled = roundActive || credits < blackjackBet;
    hitButton.disabled = !roundActive;
    standButton.disabled = !roundActive;
    spinButton.disabled = spinning || credits < slotBet;
  }

  const suits = ["♠", "♥", "♦", "♣"];
  let deck = [];
  let playerHand = [];
  let dealerHand = [];
  let blackjackBet = 40;
  let roundActive = false;

  const dealerHandElement = document.getElementById("dealer-hand");
  const playerHandElement = document.getElementById("player-hand");
  const dealerScoreElement = document.getElementById("dealer-score");
  const playerScoreElement = document.getElementById("player-score");
  const blackjackMessage = document.getElementById("blackjack-message");
  const dealButton = document.getElementById("deal-button");
  const hitButton = document.getElementById("hit-button");
  const standButton = document.getElementById("stand-button");

  function createDeck() {
    deck = [];
    suits.forEach(function (suit) {
      for (let value = 1; value <= 13; value += 1) {
        deck.push({ value: value, suit: suit });
      }
    });
    for (let index = deck.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [deck[index], deck[swapIndex]] = [deck[swapIndex], deck[index]];
    }
  }

  function drawCard() {
    return deck.pop();
  }

  function cardLabel(card) {
    if (card.value === 1) return "A";
    if (card.value === 11) return "J";
    if (card.value === 12) return "Q";
    if (card.value === 13) return "K";
    return String(card.value);
  }

  function handValue(hand) {
    let total = 0;
    let aces = 0;
    hand.forEach(function (card) {
      if (card.value === 1) {
        aces += 1;
        total += 11;
      } else {
        total += Math.min(card.value, 10);
      }
    });
    while (total > 21 && aces > 0) {
      total -= 10;
      aces -= 1;
    }
    return total;
  }

  function renderHand(element, hand, hideHoleCard) {
    element.replaceChildren();
    hand.forEach(function (card, index) {
      const faceDown = hideHoleCard && index === 1;
      const cardElement = document.createElement("div");
      cardElement.className = "playing-card" + (faceDown ? " card-face-down" : "") +
        (!faceDown && (card.suit === "♥" || card.suit === "♦") ? " card-red" : "");
      if (faceDown) {
        cardElement.setAttribute("aria-label", "Face-down card");
        cardElement.textContent = "✳";
      } else {
        cardElement.setAttribute("aria-label", cardLabel(card) + " " + card.suit);
        const corner = document.createElement("span");
        corner.className = "card-corner";
        corner.textContent = cardLabel(card) + card.suit;
        const suit = document.createElement("span");
        suit.className = "card-suit";
        suit.textContent = card.suit;
        cardElement.append(corner, suit);
      }
      element.append(cardElement);
    });
  }

  function renderBlackjack() {
    renderHand(dealerHandElement, dealerHand, roundActive && dealerHand.length > 1);
    renderHand(playerHandElement, playerHand, false);
    dealerScoreElement.textContent = dealerHand.length === 0
      ? "–"
      : roundActive ? String(handValue([dealerHand[0]])) + "+" : String(handValue(dealerHand));
    playerScoreElement.textContent = playerHand.length === 0 ? "–" : String(handValue(playerHand));
    updateCredits();
  }

  function finishRound(message, payout) {
    credits += payout;
    roundActive = false;
    blackjackMessage.textContent = message;
    renderBlackjack();
  }

  function dealerTurn() {
    while (handValue(dealerHand) < 17) dealerHand.push(drawCard());
    const playerScore = handValue(playerHand);
    const dealerScore = handValue(dealerHand);
    if (dealerScore > 21 || playerScore > dealerScore) {
      finishRound("You win. Your bet is back, plus a matching payout.", blackjackBet * 2);
    } else if (playerScore === dealerScore) {
      finishRound("A push. Your bet comes back to you.", blackjackBet);
    } else {
      finishRound("Dealer wins this hand. The next one is yours.", 0);
    }
  }

  document.querySelectorAll("[data-blackjack-bet]").forEach(function (button) {
    button.addEventListener("click", function () {
      if (roundActive) return;
      blackjackBet = Number(button.dataset.blackjackBet);
      document.querySelectorAll("[data-blackjack-bet]").forEach(function (option) {
        const selected = option === button;
        option.classList.toggle("is-selected", selected);
        option.setAttribute("aria-pressed", String(selected));
      });
      updateCredits();
    });
  });

  dealButton.addEventListener("click", function () {
    if (roundActive || credits < blackjackBet) return;
    createDeck();
    credits -= blackjackBet;
    playerHand = [drawCard(), drawCard()];
    dealerHand = [drawCard(), drawCard()];
    roundActive = true;
    blackjackMessage.textContent = "Your move. Hit for a card or stand on this hand.";
    renderBlackjack();
    const playerNatural = handValue(playerHand) === 21;
    const dealerNatural = handValue(dealerHand) === 21;
    if (playerNatural && dealerNatural) finishRound("Double blackjack. Your bet comes back.", blackjackBet);
    else if (playerNatural) finishRound("Blackjack! Your 3:2 payout is on its way.", blackjackBet * 2.5);
    else if (dealerNatural) finishRound("Dealer has blackjack. Try another hand.", 0);
  });

  hitButton.addEventListener("click", function () {
    if (!roundActive) return;
    playerHand.push(drawCard());
    if (handValue(playerHand) > 21) finishRound("Bust. The dealer takes this hand.", 0);
    else {
      blackjackMessage.textContent = "Your move. Hit for a card or stand on this hand.";
      renderBlackjack();
    }
  });

  standButton.addEventListener("click", function () {
    if (!roundActive) return;
    roundActive = false;
    dealerTurn();
  });

  const slotSymbols = ["🐚", "🌊", "🪸", "🐟", "⭐", "🦪"];
  const pearl = "🦪";
  const reels = [
    document.getElementById("reel-one"),
    document.getElementById("reel-two"),
    document.getElementById("reel-three")
  ];
  const slotsMessage = document.getElementById("slots-message");
  const spinButton = document.getElementById("spin-button");
  let slotBet = 10;
  let spinning = false;

  document.querySelectorAll("[data-slot-bet]").forEach(function (button) {
    button.addEventListener("click", function () {
      if (spinning) return;
      slotBet = Number(button.dataset.slotBet);
      document.querySelectorAll("[data-slot-bet]").forEach(function (option) {
        const selected = option === button;
        option.classList.toggle("is-selected", selected);
        option.setAttribute("aria-pressed", String(selected));
      });
      updateCredits();
    });
  });

  spinButton.addEventListener("click", function () {
    if (spinning || credits < slotBet) return;
    spinning = true;
    credits -= slotBet;
    updateCredits();
    slotsMessage.textContent = "The tide is turning…";
    reels.forEach(function (reel) {
      reel.classList.add("is-spinning");
      reel.textContent = "·";
    });

    const result = reels.map(function () {
      return slotSymbols[Math.floor(Math.random() * slotSymbols.length)];
    });

    result.forEach(function (symbol, index) {
      window.setTimeout(function () {
        reels[index].textContent = symbol;
        reels[index].classList.remove("is-spinning");
        if (index !== reels.length - 1) return;

        const allMatch = result[0] === result[1] && result[1] === result[2];
        const pair = result[0] === result[1] || result[1] === result[2] || result[0] === result[2];
        if (allMatch) {
          const multiplier = result[0] === pearl ? 12 : 5;
          credits += slotBet * multiplier;
          slotsMessage.textContent = result[0] === pearl
            ? "Pearl jackpot! " + slotBet * multiplier + " credits are yours."
            : "Three in a row! " + slotBet * multiplier + " credits are yours.";
        } else if (pair) {
          credits += slotBet;
          slotsMessage.textContent = "A little return from the reef. Your bet is back.";
        } else {
          slotsMessage.textContent = "The current takes this spin. Give it another go.";
        }
        spinning = false;
        updateCredits();
      }, 450 + index * 380);
    });
  });

  const canvas = document.getElementById("ocean-canvas");
  const context = canvas.getContext("2d");
  let sceneWidth = 0;
  let sceneHeight = 0;
  let pixelRatio = 1;

  function resizeScene() {
    const bounds = canvas.getBoundingClientRect();
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    sceneWidth = bounds.width;
    sceneHeight = bounds.height;
    canvas.width = Math.round(sceneWidth * pixelRatio);
    canvas.height = Math.round(sceneHeight * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  }

  function drawShark(x, y, scale, drift) {
    context.save();
    context.translate(x, y + Math.sin(drift) * 5);
    context.scale(scale, scale);
    context.fillStyle = "rgba(12, 49, 51, 0.72)";
    context.beginPath();
    context.moveTo(-76, 0);
    context.bezierCurveTo(-52, -23, 24, -23, 54, -7);
    context.lineTo(82, -34);
    context.lineTo(77, -5);
    context.lineTo(104, 10);
    context.lineTo(78, 8);
    context.lineTo(54, 7);
    context.bezierCurveTo(22, 27, -48, 23, -76, 0);
    context.closePath();
    context.fill();
    context.beginPath();
    context.moveTo(-8, -18);
    context.lineTo(13, -46);
    context.lineTo(24, -17);
    context.closePath();
    context.fill();
    context.beginPath();
    context.moveTo(15, 11);
    context.lineTo(32, 30);
    context.lineTo(38, 9);
    context.closePath();
    context.fill();
    context.fillStyle = "rgba(223, 239, 211, 0.52)";
    context.beginPath();
    context.arc(-58, -4, 1.8, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }

  function drawSwimmer(x, y, drift) {
    context.save();
    context.translate(x, y + Math.sin(drift) * 4);
    context.rotate(-0.06);
    context.fillStyle = "rgba(15, 44, 44, 0.84)";
    context.beginPath();
    context.ellipse(6, 0, 45, 13, 0, 0, Math.PI * 2);
    context.fill();
    context.beginPath();
    context.moveTo(24, -5);
    context.quadraticCurveTo(47, -8, 68, -21);
    context.lineTo(73, -17);
    context.quadraticCurveTo(57, -1, 31, 4);
    context.closePath();
    context.fill();
    context.beginPath();
    context.moveTo(24, 5);
    context.quadraticCurveTo(49, 13, 67, 25);
    context.lineTo(72, 21);
    context.quadraticCurveTo(53, 5, 28, -1);
    context.closePath();
    context.fill();
    context.fillStyle = "#ec9071";
    context.beginPath();
    context.ellipse(-31, -2, 15, 13, 0, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#eff4d8";
    context.beginPath();
    context.ellipse(-35, -4, 7, 3, 0, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = "#f2ae72";
    context.lineWidth = 6;
    context.lineCap = "round";
    context.beginPath();
    context.moveTo(-13, -7);
    context.quadraticCurveTo(-25, -24, -47, -19);
    context.stroke();
    context.beginPath();
    context.moveTo(-13, 7);
    context.quadraticCurveTo(-26, 22, -45, 19);
    context.stroke();
    context.strokeStyle = "#213e3b";
    context.lineWidth = 5;
    context.beginPath();
    context.moveTo(-19, -10);
    context.lineTo(-45, -19);
    context.moveTo(-19, 10);
    context.lineTo(-43, 20);
    context.stroke();
    context.restore();
  }

  function drawOcean(timestamp) {
    if (!sceneWidth || !sceneHeight) {
      window.requestAnimationFrame(drawOcean);
      return;
    }
    const time = timestamp * 0.00035;
    const width = sceneWidth;
    const height = sceneHeight;
    const water = context.createLinearGradient(0, 0, width * 0.2, height);
    water.addColorStop(0, "#82c6b6");
    water.addColorStop(0.26, "#328f81");
    water.addColorStop(0.65, "#17635e");
    water.addColorStop(1, "#104343");
    context.fillStyle = water;
    context.fillRect(0, 0, width, height);

    const glow = context.createRadialGradient(width * 0.47, height * 0.1, 5, width * 0.47, height * 0.1, height * 0.82);
    glow.addColorStop(0, "rgba(224, 225, 160, 0.28)");
    glow.addColorStop(1, "rgba(224, 225, 160, 0)");
    context.fillStyle = glow;
    context.fillRect(0, 0, width, height);

    for (let ray = 0; ray < 7; ray += 1) {
      const rayX = width * (0.12 + ray * 0.14) + Math.sin(time + ray) * 18;
      const rayWidth = 13 + (ray % 3) * 9;
      const beam = context.createLinearGradient(rayX, 0, rayX - 25, height * 0.8);
      beam.addColorStop(0, "rgba(255, 242, 188, 0.13)");
      beam.addColorStop(1, "rgba(255, 242, 188, 0)");
      context.fillStyle = beam;
      context.beginPath();
      context.moveTo(rayX - rayWidth, 0);
      context.lineTo(rayX + rayWidth, 0);
      context.lineTo(rayX + rayWidth * 2 - 25, height * 0.82);
      context.lineTo(rayX - rayWidth * 2 - 25, height * 0.82);
      context.closePath();
      context.fill();
    }

    context.fillStyle = "rgba(241, 238, 193, 0.6)";
    context.beginPath();
    context.moveTo(0, 0);
    for (let x = 0; x <= width; x += 8) {
      context.lineTo(x, 12 + Math.sin(x * 0.025 + time * 8) * 3);
    }
    context.lineTo(width, 0);
    context.closePath();
    context.fill();

    const reef = context.createLinearGradient(0, height * 0.78, 0, height);
    reef.addColorStop(0, "rgba(19, 62, 52, 0)");
    reef.addColorStop(1, "rgba(13, 43, 38, 0.78)");
    context.fillStyle = reef;
    context.fillRect(0, height * 0.76, width, height * 0.24);

    drawShark(width * (0.79 - ((time * 0.028) % 0.6)), height * 0.36, Math.max(0.57, width / 650), time * 2.2);
    drawShark(width * (0.98 - ((time * 0.019 + 0.45) % 0.72)), height * 0.66, Math.max(0.34, width / 940), time * 1.5 + 2);
    drawSwimmer(width * 0.46 + Math.sin(time * 1.2) * 6, height * 0.44, time * 2.5);

    for (let bubble = 0; bubble < 16; bubble += 1) {
      const offset = (time * 12 + bubble * 39) % height;
      const bubbleX = width * (0.1 + ((bubble * 53) % 83) / 100) + Math.sin(time * 2 + bubble) * 9;
      context.strokeStyle = "rgba(226, 246, 221, " + (0.22 + (bubble % 3) * 0.1) + ")";
      context.lineWidth = 1;
      context.beginPath();
      context.arc(bubbleX, height - offset, 1.5 + (bubble % 3), 0, Math.PI * 2);
      context.stroke();
    }
    window.requestAnimationFrame(drawOcean);
  }

  resizeScene();
  window.addEventListener("resize", resizeScene);
  window.requestAnimationFrame(drawOcean);
  renderBlackjack();
  updateCredits();
})();
