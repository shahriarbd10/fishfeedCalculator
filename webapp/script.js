// Theme toggle
const themeToggle = document.querySelector('.theme-toggle');
const themeIcon = document.getElementById('themeIcon');
const body = document.body;

themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark');
    if (body.classList.contains('dark')) {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
        body.setAttribute('data-theme', 'dark');
    } else {
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
        body.setAttribute('data-theme', 'light');
    }
});

// Fish selection page
const fishCards = document.querySelectorAll('.fish-card');
const fishSelectionPage = document.getElementById('fishSelectionPage');
const calculationPage = document.getElementById('calculationPage');
const calculationTitle = document.getElementById('calculationTitle');
const backButton = document.getElementById('backButton');
const resultDiv = document.getElementById('result');

fishCards.forEach(card => {
    card.addEventListener('click', () => {
        const fishType = card.getAttribute('data-fish');
        calculationTitle.textContent = `${fishType.charAt(0).toUpperCase() + fishType.slice(1)} Feed Calculator`;
        fishSelectionPage.classList.add('hidden');
        calculationPage.classList.remove('hidden');
    });
});

// Back button
backButton.addEventListener('click', () => {
    calculationPage.classList.add('hidden');
    fishSelectionPage.classList.remove('hidden');
    resultDiv.classList.add('hidden'); // Hide result box when going back
});

// Calculation logic
document.getElementById('feedForm').addEventListener('submit', function (e) {
    e.preventDefault();

    // Get input values
    const totalFish = parseInt(document.getElementById('totalFish').value);
    const avgWeight = parseFloat(document.getElementById('avgWeight').value);
    const fishType = calculationTitle.textContent.split(' ')[0].toLowerCase();

    // Calculate feed based on fish type
    let result;
    if (fishType === 'carp') {
        result = calculateCarpFeed(totalFish, avgWeight);
    } else {
        result = { error: "Calculation for this fish type is pending." };
    }

    // Display results
    resultDiv.classList.remove('hidden');
    if (result.error) {
        resultDiv.innerHTML = `<p class="error">${result.error}</p>`;
    } else {
        resultDiv.innerHTML = `
            <p><strong>Daily Feed Quantity:</strong> ${result.daily_feed}</p>
            <p><strong>Weekly Feed Quantity:</strong> ${result.weekly_feed}</p>
            <p><strong>Times to Apply Daily:</strong> ${result.times_to_apply_daily}</p>
        `;
    }
});

function calculateCarpFeed(totalFish, avgWeight) {
    if (avgWeight < 1 || avgWeight > 2000) {
        return { error: "Average weight must be between 1g and 2000g." };
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
            let perFish = avgWeight <= 600 ? 20 : 20 - (avgWeight - 600) * 0.00142857;
            perFish = Math.max(perFish, 18);
            dailyFeedG = perFish * totalFish;
        }
    }

    const weeklyFeedG = dailyFeedG * 7;

    function formatFeed(feedG) {
        if (feedG >= 1000) {
            return `${(feedG / 1000).toFixed(1)} kg`;
        } else {
            return `${Math.round(feedG * 10) / 10}g`;
        }
    }

    const dailyFeed = formatFeed(dailyFeedG);
    const weeklyFeed = formatFeed(weeklyFeedG);
    const times = avgWeight < 100 ? "3-4 times" : "2-3 times";

    return {
        daily_feed: dailyFeed,
        weekly_feed: weeklyFeed,
        times_to_apply_daily: times,
    };
}

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