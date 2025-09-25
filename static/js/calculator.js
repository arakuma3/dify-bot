const display = document.getElementById('display');
const keys = document.querySelector('.keys');

const state = {
  displayValue: '0',
  firstOperand: null,
  operator: null,
  waitingForSecondOperand: false,
  lastKeyType: null,
  isError: false,
};

function updateDisplay(value, { isError = false } = {}) {
  display.textContent = value;
  display.dataset.error = isError ? 'true' : 'false';
  state.isError = isError;
}

function resetAllState() {
  state.displayValue = '0';
  state.firstOperand = null;
  state.operator = null;
  state.waitingForSecondOperand = false;
  state.lastKeyType = null;
  state.isError = false;
}

function resetIfError() {
  if (!state.isError) {
    return false;
  }
  resetAllState();
  return true;
}

function prepareForNewNumber() {
  if (resetIfError()) {
    return;
  }
  if (state.lastKeyType === 'calculate') {
    state.displayValue = '0';
    state.firstOperand = null;
    state.operator = null;
    state.waitingForSecondOperand = false;
  }
}

function inputDigit(digit) {
  prepareForNewNumber();
  if (state.waitingForSecondOperand) {
    state.displayValue = digit;
    state.waitingForSecondOperand = false;
  } else {
    state.displayValue =
      state.displayValue === '0' ? digit : state.displayValue + digit;
  }
  state.lastKeyType = 'digit';
  updateDisplay(state.displayValue);
}

function inputDecimal() {
  prepareForNewNumber();
  if (state.waitingForSecondOperand) {
    state.displayValue = '0.';
    state.waitingForSecondOperand = false;
    updateDisplay(state.displayValue);
    state.lastKeyType = 'decimal';
    return;
  }

  if (!state.displayValue.includes('.')) {
    state.displayValue += '.';
    updateDisplay(state.displayValue);
  }
  state.lastKeyType = 'decimal';
}

function clearCalculator({ clearAll = false } = {}) {
  if (clearAll) {
    resetAllState();
    state.lastKeyType = 'clear';
  } else {
    state.displayValue = '0';
    state.waitingForSecondOperand = false;
    state.lastKeyType = 'clear';
  }
  updateDisplay(state.displayValue);
}

function toggleSign() {
  if (resetIfError()) {
    updateDisplay(state.displayValue);
  }
  const value = parseFloat(state.displayValue);
  if (Number.isNaN(value)) {
    return;
  }
  state.displayValue = (value * -1).toString();
  state.lastKeyType = 'sign';
  updateDisplay(state.displayValue);
}

function percentValue() {
  prepareForNewNumber();
  const value = parseFloat(state.displayValue);
  if (Number.isNaN(value)) {
    return;
  }
  let percent;
  const hasOperator = state.firstOperand !== null && state.operator !== null;
  if (hasOperator && state.waitingForSecondOperand) {
    percent = state.firstOperand / 100;
    state.waitingForSecondOperand = false;
  } else if (hasOperator) {
    percent = state.firstOperand * (value / 100);
  } else {
    percent = value / 100;
  }
  state.displayValue = formatResult(percent);
  const isFiniteResult = Number.isFinite(percent);
  updateDisplay(state.displayValue, { isError: !isFiniteResult });
  if (!isFiniteResult) {
    state.firstOperand = null;
    state.operator = null;
    state.waitingForSecondOperand = false;
  } else if (!state.operator || state.firstOperand === null) {
    state.firstOperand = parseFloat(state.displayValue);
  }
  state.lastKeyType = 'percent';
}

function backspace() {
  if (resetIfError()) {
    updateDisplay(state.displayValue);
    state.lastKeyType = 'backspace';
    return;
  }
  if (state.waitingForSecondOperand) {
    return;
  }
  if (state.displayValue.length === 1 || (state.displayValue.length === 2 && state.displayValue.startsWith('-'))) {
    state.displayValue = '0';
  } else {
    state.displayValue = state.displayValue.slice(0, -1);
  }
  state.lastKeyType = 'backspace';
  updateDisplay(state.displayValue);
}

function handleOperator(nextOperator) {
  if (resetIfError()) {
    updateDisplay(state.displayValue);
    return;
  }
  const inputValue = parseFloat(state.displayValue);

  if (Number.isNaN(inputValue)) {
    return;
  }

  if (state.operator && state.waitingForSecondOperand) {
    state.operator = nextOperator;
    return;
  }

  if (state.firstOperand === null) {
    state.firstOperand = inputValue;
  } else if (state.operator) {
    const result = calculate(state.firstOperand, inputValue, state.operator);
    const isFiniteResult = Number.isFinite(result);
    state.displayValue = formatResult(result);
    updateDisplay(state.displayValue, { isError: !isFiniteResult });
    if (!isFiniteResult) {
      state.firstOperand = null;
      state.operator = null;
      state.waitingForSecondOperand = false;
      state.lastKeyType = 'operator';
      return;
    }
    state.firstOperand = result;
  }

  state.waitingForSecondOperand = true;
  state.operator = nextOperator;
  state.lastKeyType = 'operator';
}

function calculate(firstOperand, secondOperand, operator) {
  if (!Number.isFinite(firstOperand) || !Number.isFinite(secondOperand)) {
    return NaN;
  }

  switch (operator) {
    case '+':
      return firstOperand + secondOperand;
    case '-':
      return firstOperand - secondOperand;
    case '*':
      return firstOperand * secondOperand;
    case '/':
      return secondOperand === 0 ? NaN : firstOperand / secondOperand;
    default:
      return secondOperand;
  }
}

function formatResult(result) {
  if (!Number.isFinite(result)) {
    return 'エラー';
  }

  const rounded = Math.round(result * 1e10) / 1e10;
  return rounded.toString().slice(0, 16);
}

function performCalculation() {
  if (state.isError) {
    return;
  }
  if (state.operator === null || state.waitingForSecondOperand) {
    return;
  }
  const secondOperand = parseFloat(state.displayValue);
  const result = calculate(state.firstOperand ?? 0, secondOperand, state.operator);
  state.displayValue = formatResult(result);
  updateDisplay(state.displayValue, { isError: !Number.isFinite(result) });
  state.firstOperand = Number.isFinite(result) ? result : null;
  state.operator = null;
  state.waitingForSecondOperand = false;
  state.lastKeyType = 'calculate';
}

function handleAction(action) {
  switch (action) {
    case 'clear':
      clearCalculator({ clearAll: true });
      break;
    case 'sign':
      toggleSign();
      break;
    case 'percent':
      percentValue();
      break;
    case 'decimal':
      inputDecimal();
      break;
    case 'calculate':
      performCalculation();
      break;
    case 'backspace':
      backspace();
      break;
    default:
      break;
  }
}

keys.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) {
    return;
  }

  const { action, operator } = target.dataset;

  if (action) {
    handleAction(action);
    return;
  }

  if (operator) {
    handleOperator(operator);
    return;
  }

  inputDigit(target.textContent.trim());
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Tab') {
    return;
  }

  if (/^[0-9]$/.test(event.key)) {
    event.preventDefault();
    inputDigit(event.key);
    return;
  }

  switch (event.key) {
    case '.':
      event.preventDefault();
      inputDecimal();
      break;
    case 'Enter':
    case '=':
      event.preventDefault();
      performCalculation();
      break;
    case 'Escape':
      event.preventDefault();
      clearCalculator({ clearAll: true });
      break;
    case 'Backspace':
      event.preventDefault();
      backspace();
      break;
    case '%':
      event.preventDefault();
      percentValue();
      break;
    case '+':
    case '-':
    case '*':
    case '/':
      event.preventDefault();
      handleOperator(event.key);
      break;
    default:
      break;
  }
});

updateDisplay(state.displayValue);
