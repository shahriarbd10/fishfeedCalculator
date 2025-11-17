// ===================== THEME TOGGLE =====================
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const body = document.body;

themeToggle.addEventListener('click', () => {
  const currentTheme = body.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  body.setAttribute('data-theme', newTheme);

  if (newTheme === 'dark') {
    themeIcon.classList.remove('fa-moon');
    themeIcon.classList.add('fa-sun');
  } else {
    themeIcon.classList.remove('fa-sun');
    themeIcon.classList.add('fa-moon');
  }
});

// ===================== DOM ELEMENTS =====================
const fishCards = document.querySelectorAll('.fish-card');
const fishSelectionPage = document.getElementById('fishSelectionPage');
const calculationPage = document.getElementById('calculationPage');
const calculationTitle = document.getElementById('calculationTitle');
const backButton = document.getElementById('backButton');
const resultDiv = document.getElementById('result');
const feedForm = document.getElementById('feedForm');
const totalFishInput = document.getElementById('totalFish');
const avgWeightInput = document.getElementById('avgWeight');
const weightHint = document.getElementById('weightHint');

let currentFishType = null;

// ===================== CONFIG PER FISH TYPE =====================
const fishConfigs = {
  carp: {
    minWeight: 1,
    maxWeight: 2000,
    label: "Average Weight per Fish (grams) (1–2000g)",
    calculator: calculateCarpFeed,
  },
  catfish: {
    minWeight: 1,
    maxWeight: 200,
    label: "Average Weight per Fish (grams) (1–200g)",
    calculator: calculateCatfishFeed,
  },
  tilapia: {
    minWeight: 1,
    maxWeight: 1000,
    label: "Average Weight per Fish (grams) (1–1000g)",
    calculator: calculateTilapiaFeed,
  },
  pangas: {
    minWeight: 1,
    maxWeight: 2000,
    label: "Average Weight per Fish (grams) (1–2000g)",
    calculator: calculatePangasFeed,
  },
  shrimp: {
    minWeight: 1,
    maxWeight: 200,
    label: "Average Weight per Fish (grams) (1–200g)",
    calculator: calculateShrimpFeed,
  },
  "tiger prawn": {
    minWeight: 1,
    maxWeight: 100,
    label: "Average Weight per Fish (grams) (1–100g)",
    calculator: calculateTigerPrawnFeed,
  },
};

// ===================== FISH SELECTION PAGE =====================
function toTitleCase(str) {
  return str
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

fishCards.forEach(card => {
  card.addEventListener('click', () => {
    const fishType = card.getAttribute('data-fish');
    currentFishType = fishType;

    const config = fishConfigs[fishType];
    if (!config) {
      console.error("No config found for fish type:", fishType);
      return;
    }

    calculationTitle.textContent = `${toTitleCase(fishType)} Feed Calculator`;

    // Reset form & result
    feedForm.reset();
    resultDiv.classList.add('hidden');
    resultDiv.innerHTML = "";

    // Set weight range & label
    avgWeightInput.min = config.minWeight;
    avgWeightInput.max = config.maxWeight;
    avgWeightInput.placeholder = `Between ${config.minWeight}–${config.maxWeight} g per fish`;
    document.getElementById('avgWeightLabel').textContent = config.label;
    weightHint.textContent = "";

    fishSelectionPage.classList.add('hidden');
    calculationPage.classList.remove('hidden');
  });
});

// ===================== BACK BUTTON =====================
backButton.addEventListener('click', () => {
  calculationPage.classList.add('hidden');
  fishSelectionPage.classList.remove('hidden');
  resultDiv.classList.add('hidden');
  resultDiv.innerHTML = "";
  currentFishType = null;
});

// ===================== HELPERS =====================
function formatFeed(feedG) {
  if (feedG >= 1000) {
    return `${(feedG / 1000).toFixed(1)} kg`;
  } else {
    return `${(Math.round(feedG * 10) / 10).toFixed(1)}g`;
  }
}

// Generic linear interpolation over (weight, feedPerFish) points
function interpolateFeed(avgWeight, points) {
  const pts = points.slice().sort((a, b) => a.weight - b.weight);

  // Below minimum: scale proportionally from first point
  if (avgWeight <= pts[0].weight) {
    const base = pts[0];
    return base.feed * (avgWeight / base.weight);
  }

  // Between points
  for (let i = 0; i < pts.length - 1; i++) {
    const p1 = pts[i];
    const p2 = pts[i + 1];

    if (avgWeight === p1.weight) return p1.feed;
    if (avgWeight === p2.weight) return p2.feed;

    if (avgWeight > p1.weight && avgWeight < p2.weight) {
      const t = (avgWeight - p1.weight) / (p2.weight - p1.weight);
      return p1.feed + t * (p2.feed - p1.feed);
    }
  }

  // Above maximum: return last point (we clamp input with max anyway)
  return pts[pts.length - 1].feed;
}

// ===================== CARP (EXISTING LOGIC) =====================
function calculateCarpFeed(totalFish, avgWeight) {
  if (avgWeight < 1 || avgWeight > 2000) {
    return { error: "Average weight must be between 1g and 2000g for Carp." };
  }
  if (totalFish < 1) {
    return { error: "Total number of fish must be at least 1." };
  }

  let dailyFeedG;

  if (totalFish === 1) {
    dailyFeedG = calculateSingleFeed(avgWeight);
  } else {
    if (avgWeight <= 100) {
      dailyFeedG = calculateSingleFeed(avgWeight) * totalFish;
    } else {
      // Per-fish cap 20g from 100–600g, then slight reduction
      let perFish =
        avgWeight <= 600
          ? 20
          : 20 - (avgWeight - 600) * 0.00142857; // slowly reduce
      perFish = Math.max(perFish, 18); // never below 18g/fish
      dailyFeedG = perFish * totalFish;
    }
  }

  const weeklyFeedG = dailyFeedG * 7;
  const dailyFeed = formatFeed(dailyFeedG);
  const weeklyFeed = formatFeed(weeklyFeedG);
  const times = avgWeight < 100 ? "3-4 times" : "2-3 times";

  return {
    daily_feed: dailyFeed,
    weekly_feed: weeklyFeed,
    times_to_apply_daily: times,
  };
}

// Single-fish carp curve (piecewise from your previous logic)
function calculateSingleFeed(avgWeight) {
  if (avgWeight < 20) {
    return 1.9 * (avgWeight / 20);
  } else if (avgWeight <= 100) {
    return 1.9 + 0.06375 * (avgWeight - 20);
  } else if (avgWeight <= 200) {
    return 7 + 0.033 * (avgWeight - 100);
  } else if (avgWeight <= 300) {
    return 10.3 + 0.032 * (avgWeight - 200);
  } else if (avgWeight <= 400) {
    return 13.5 + 0.033 * (avgWeight - 300);
  } else if (avgWeight <= 700) {
    return 16.8 + 0.01 * (avgWeight - 400);
  } else {
    const calculatedFeed = 19.8 - 0.0013846 * (avgWeight - 700);
    return Math.max(calculatedFeed, 18);
  }
}

// ===================== CATFISH =====================
// Points from your test data (daily feed per fish, grams)
const CATFISH_POINTS = [
  { weight: 40, feed: 2.5 },
  { weight: 60, feed: 2.7 },
  { weight: 70, feed: 2.8 },     // multi: 1000,70 → 2.8g/fish
  { weight: 80, feed: 2.9 },
  { weight: 100, feed: 3.097 },  // multi: 309.7/100
  { weight: 150, feed: 3.5 },
  { weight: 200, feed: 4.0 },
];

function calculateCatfishFeed(totalFish, avgWeight) {
  if (avgWeight < 1 || avgWeight > 200) {
    return { error: "Average weight must be between 1g and 200g for Catfish." };
  }
  if (totalFish < 1) {
    return { error: "Total number of fish must be at least 1." };
  }

  const perFish = interpolateFeed(avgWeight, CATFISH_POINTS);
  const dailyFeedG = perFish * totalFish;
  const weeklyFeedG = dailyFeedG * 7;

  const times = avgWeight < 70 ? "3-4 times" : "2-3 times";

  return {
    daily_feed: formatFeed(dailyFeedG),
    weekly_feed: formatFeed(weeklyFeedG),
    times_to_apply_daily: times,
  };
}

// ===================== TILAPIA =====================
const TILAPIA_POINTS = [
  { weight: 40, feed: 1.9 },
  { weight: 60, feed: 2.5 },
  { weight: 70, feed: 2.8 },      // multi: 1000,70
  { weight: 80, feed: 3.0 },
  { weight: 100, feed: 3.052 },   // multi: 305.2/100
  { weight: 150, feed: 3.2 },     // multi
  { weight: 200, feed: 3.27 },    // multi: 653.7/200 ≈ 3.2685
];

function calculateTilapiaFeed(totalFish, avgWeight) {
  if (avgWeight < 1 || avgWeight > 1000) {
    return { error: "Average weight must be between 1g and 1000g for Tilapia." };
  }
  if (totalFish < 1) {
    return { error: "Total number of fish must be at least 1." };
  }

  const perFish = interpolateFeed(avgWeight, TILAPIA_POINTS);
  const dailyFeedG = perFish * totalFish;
  const weeklyFeedG = dailyFeedG * 7;

  const times = avgWeight < 80 ? "3-4 times" : "2-3 times";

  return {
    daily_feed: formatFeed(dailyFeedG),
    weekly_feed: formatFeed(weeklyFeedG),
    times_to_apply_daily: times,
  };
}

// ===================== PANGAS =====================
const PANGAS_POINTS = [
  { weight: 40, feed: 1.8 },
  { weight: 60, feed: 2.3 },
  { weight: 70, feed: 2.5 },      // multi
  { weight: 80, feed: 2.8 },
  { weight: 100, feed: 3.26 },    // multi: 326.1/100
  { weight: 150, feed: 4.5 },     // multi
  { weight: 200, feed: 4.7 },     // single
  { weight: 300, feed: 5.0 },
  { weight: 400, feed: 5.3 },
  { weight: 500, feed: 5.6 },
  { weight: 600, feed: 5.9 },
  { weight: 800, feed: 6.5 },
  { weight: 1000, feed: 7.1 },
  { weight: 1200, feed: 7.6 },
  { weight: 1400, feed: 8.2 },
  { weight: 1600, feed: 8.8 },
  { weight: 1800, feed: 9.4 },
  { weight: 2000, feed: 10.0 },
];

function calculatePangasFeed(totalFish, avgWeight) {
  if (avgWeight < 1 || avgWeight > 2000) {
    return { error: "Average weight must be between 1g and 2000g for Pangas." };
  }
  if (totalFish < 1) {
    return { error: "Total number of fish must be at least 1." };
  }

  const perFish = interpolateFeed(avgWeight, PANGAS_POINTS);
  const dailyFeedG = perFish * totalFish;
  const weeklyFeedG = dailyFeedG * 7;

  const times = avgWeight < 200 ? "3-4 times" : "2-3 times";

  return {
    daily_feed: formatFeed(dailyFeedG),
    weekly_feed: formatFeed(weeklyFeedG),
    times_to_apply_daily: times,
  };
}

// ===================== SHRIMP =====================
const SHRIMP_POINTS = [
  { weight: 40, feed: 0.5 },
  { weight: 60, feed: 0.6 },
  { weight: 70, feed: 0.6163 },   // multi
  { weight: 80, feed: 0.6 },
  { weight: 100, feed: 0.705 },   // multi: 70.5/100
  { weight: 150, feed: 0.8524 },  // multi
  { weight: 200, feed: 1.0 },     // single & multi
];

function calculateShrimpFeed(totalFish, avgWeight) {
  if (avgWeight < 1 || avgWeight > 200) {
    return { error: "Average weight must be between 1g and 200g for Shrimp." };
  }
  if (totalFish < 1) {
    return { error: "Total number of shrimp must be at least 1." };
  }

  const perFish = interpolateFeed(avgWeight, SHRIMP_POINTS);
  const dailyFeedG = perFish * totalFish;
  const weeklyFeedG = dailyFeedG * 7;

  // Table shows "2-2 times" → basically 2 times/day
  const times = "2 times";

  return {
    daily_feed: formatFeed(dailyFeedG),
    weekly_feed: formatFeed(weeklyFeedG),
    times_to_apply_daily: times,
  };
}

// ===================== TIGER PRAWN =====================
const TIGER_POINTS = [
  { weight: 40, feed: 0.4 },
  { weight: 60, feed: 0.5 },
  { weight: 70, feed: 0.6092 },   // multi: 609.2/1000
  { weight: 80, feed: 0.7 },
  { weight: 100, feed: 0.8 },     // single & multi
];

function calculateTigerPrawnFeed(totalFish, avgWeight) {
  if (avgWeight < 1 || avgWeight > 100) {
    return { error: "Average weight must be between 1g and 100g for Tiger Prawn." };
  }
  if (totalFish < 1) {
    return { error: "Total number of prawn must be at least 1." };
  }

  const perFish = interpolateFeed(avgWeight, TIGER_POINTS);
  const dailyFeedG = perFish * totalFish;
  const weeklyFeedG = dailyFeedG * 7;

  const times = "2 times";

  return {
    daily_feed: formatFeed(dailyFeedG),
    weekly_feed: formatFeed(weeklyFeedG),
    times_to_apply_daily: times,
  };
}

// ===================== FORM SUBMIT =====================
feedForm.addEventListener('submit', function (e) {
  e.preventDefault();

  if (!currentFishType) {
    resultDiv.classList.remove('hidden');
    resultDiv.innerHTML = `<p class="error">Please select a fish type first.</p>`;
    return;
  }

  const config = fishConfigs[currentFishType];
  const totalFish = parseInt(totalFishInput.value, 10);
  const avgWeight = parseFloat(avgWeightInput.value);

  if (isNaN(totalFish) || isNaN(avgWeight)) {
    resultDiv.classList.remove('hidden');
    resultDiv.innerHTML = `<p class="error">Please enter valid numeric values.</p>`;
    return;
  }

  if (avgWeight < config.minWeight || avgWeight > config.maxWeight) {
    resultDiv.classList.remove('hidden');
    resultDiv.innerHTML = `<p class="error">
      Average weight must be between ${config.minWeight}g and ${config.maxWeight}g for this species.
    </p>`;
    return;
  }

  const calculator = config.calculator;
  const result = calculator(totalFish, avgWeight);

  resultDiv.classList.remove('hidden');

  if (result.error) {
    resultDiv.innerHTML = `<p class="error">${result.error}</p>`;
    return;
  }

  resultDiv.innerHTML = `
    <h3 style="color: var(--secondary-color); margin-top: 0;">Feed Requirement</h3>
    <p><strong>Daily Feed Quantity:</strong> ${result.daily_feed}</p>
    <p><strong>Weekly Feed Quantity:</strong> ${result.weekly_feed}</p>
    <p><strong>Times to Apply Daily:</strong> ${result.times_to_apply_daily}</p>
  `;
});
