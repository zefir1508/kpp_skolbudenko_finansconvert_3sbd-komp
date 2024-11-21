const apiUrl = 'https://open.er-api.com/v6/latest/';
const fromCurrency = document.getElementById('fromCurrency');
const toCurrency = document.getElementById('toCurrency');
const amount = document.getElementById('amount');
const result = document.getElementById('result');
const convertBtn = document.getElementById('convertBtn');
const rateChart = document.getElementById('rateChart').getContext('2d');
const ratesList = document.getElementById('ratesTable').getElementsByTagName('tbody')[0];
const refreshRatesBtn = document.getElementById('refreshRates');

let chartInstance;

// Популярні валюти
const currencyNames = {
  USD: 'Долар США (США)',
  EUR: 'Євро (Єврозона)',
  UAH: 'Гривня (Україна)',
  GBP: 'Фунт стерлінгів (Великобританія)',
  JPY: 'Єна (Японія)',
  CAD: 'Канадський долар (Канада)',
  AUD: 'Австралійський долар (Австралія)',
  CHF: 'Швейцарський франк (Швейцарія)',
  CNY: 'Юань (Китай)',
};

async function loadCurrencies() {
  try {
    const response = await fetch(apiUrl + 'USD');
    const data = await response.json();
    const currencies = Object.keys(data.rates);

    // Додаємо лише популярні валюти
    const popularCurrencies = ['USD', 'EUR', 'UAH', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY'];

    popularCurrencies.forEach(currency => {
      const option1 = document.createElement('option');
      option1.value = currency;
      option1.textContent = `${currency} - ${currencyNames[currency] || currency}`;

      const option2 = option1.cloneNode(true);

      fromCurrency.appendChild(option1);
      toCurrency.appendChild(option2);
    });

    fromCurrency.value = 'USD';
    toCurrency.value = 'UAH';
  } catch (error) {
    console.error('Помилка завантаження валют:', error);
  }
}

async function convertCurrency() {
  const from = fromCurrency.value;
  const to = toCurrency.value;
  const amountValue = parseFloat(amount.value);
  if (isNaN(amountValue) || amountValue <= 0) {
    result.textContent = 'Будь ласка, введіть коректну суму.';
    return;
  }

  try {
    const response = await fetch(apiUrl + from);
    const data = await response.json();
    const rate = data.rates[to];
    const convertedAmount = (amountValue * rate).toFixed(2);
    result.textContent = `${amountValue} ${from} = ${convertedAmount} ${to}`;

    updateChart(from, to);
  } catch (error) {
    console.error('Помилка конвертації:', error);
    result.textContent = 'Сталася помилка при конвертації.';
  }
}

async function loadRates() {
  try {
    const response = await fetch(apiUrl + 'USD');
    const data = await response.json();
    const rates = data.rates;

    ratesList.innerHTML = '';

    const popularCurrencies = ['USD', 'EUR', 'UAH', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY'];
    popularCurrencies.forEach(currency => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${currency}</td>
        <td>${rates[currency]}</td>
      `;
      ratesList.appendChild(row);
    });
  } catch (error) {
    console.error('Помилка завантаження курсів:', error);
  }
}

function updateChart(from, to) {
  if (chartInstance) {
    chartInstance.destroy();
  }

  const labels = ['USD', 'EUR', 'UAH', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY'];
  const rates = labels.map(currency => {
    return fetch(apiUrl + currency)
      .then(response => response.json())
      .then(data => data.rates[from]);
  });

  Promise.all(rates).then(data => {
    chartInstance = new Chart(rateChart, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: `Курс ${from} до інших валют`,
          data,
          borderColor: '#d57ae8',
          fill: false,
        }]
      }
    });
  });
}

function switchTabs(tab) {
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(t => t.classList.remove('active'));

  document.getElementById('converterTab').style.display = 'none';
  document.getElementById('ratesTab').style.display = 'none';
  document.getElementById('infoTab').style.display = 'none';

  if (tab === 'converter') {
    document.getElementById('converterTab').style.display = 'block';
  } else if (tab === 'rates') {
    document.getElementById('ratesTab').style.display = 'block';
  } else if (tab === 'info') {
    document.getElementById('infoTab').style.display = 'block';
  }
}

document.getElementById('tabConverter').addEventListener('click', () => switchTabs('converter'));
document.getElementById('tabRates').addEventListener('click', () => switchTabs('rates'));
document.getElementById('tabInfo').addEventListener('click', () => switchTabs('info'));

convertBtn.addEventListener('click', convertCurrency);
refreshRatesBtn.addEventListener('click', loadRates);
document.getElementById('backToConverter').addEventListener('click', () => switchTabs('converter'));
document.getElementById('backToInfo').addEventListener('click', () => switchTabs('info'));

loadCurrencies();
loadRates();
