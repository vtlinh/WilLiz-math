function digitList(value) {
  return String(value).split("").map((d) => (d === "-" ? "−" : d));
}

function padLeft(chars, cols) {
  const list = [...chars];
  if (list.length > cols) return list.slice(-cols);
  return Array.from({ length: cols - list.length }, () => "").concat(list);
}

function timesDigit(value, digit) {
  const source = String(value).split("").map(Number);
  const carries = Array(source.length).fill(0);
  const out = [];
  let carry = 0;
  for (let i = source.length - 1; i >= 0; i -= 1) {
    const n = source[i] * digit + carry;
    out.unshift(n % 10);
    carry = Math.floor(n / 10);
    if (i > 0) carries[i - 1] = carry;
  }
  if (carry) out.unshift(carry);
  return {
    product: Number(out.join("")) || 0,
    carries,
  };
}

export function planMultiplication(a, b) {
  const mulDigits = String(b).split("").map(Number);
  const partials = mulDigits
    .slice()
    .reverse()
    .map((digit, shift) => {
      const { product, carries } = timesDigit(a, digit);
      const value = product * 10 ** shift;
      return { digit, shift, value, text: String(value), carries };
    });

  const total = a * b;
  const cols = Math.max(
    String(a).length,
    String(b).length,
    String(total).length,
    ...partials.map((row) => row.text.length),
  );

  return {
    a,
    b,
    cols,
    top: padLeft(digitList(a), cols),
    mul: padLeft(digitList(b), cols),
    mulCarries: padLeft(
      (partials[0]?.carries ?? []).map((n) => (n ? String(n) : "")),
      cols,
    ),
    partials: partials.map((row, index) => ({
      ...row,
      cells: padLeft(digitList(row.text), cols),
      plus: index > 0,
    })),
    total,
    totalCells: padLeft(digitList(total), cols),
  };
}

function cell(text, className = "") {
  const span = document.createElement("span");
  span.className = `sheet-cell ${className}`.trim();
  span.textContent = text || "";
  return span;
}

function row(cols, cells, { op = "", className = "" } = {}) {
  const wrap = document.createElement("div");
  wrap.className = `sheet-row ${className}`.trim();
  wrap.style.setProperty("--cols", String(cols));
  wrap.append(cell(op, "is-op"));
  for (const item of cells) {
    if (item instanceof HTMLElement) wrap.append(item);
    else wrap.append(cell(item));
  }
  return wrap;
}

function rule(cols) {
  const line = document.createElement("div");
  line.className = "sheet-rule";
  line.style.setProperty("--cols", String(cols));
  return line;
}

function typedCells(value, cols) {
  if (!value || value === "-" || value === "−") return padLeft([], cols);
  return padLeft(digitList(value.replace("-", "−")), cols);
}

export function renderMultiplicationSheet(problem, { typed = "", reveal = false } = {}) {
  const plan = planMultiplication(problem.a, problem.b);
  const root = document.createElement("div");
  root.className = "sheet";
  root.dataset.op = "mul";

  const eq = document.createElement("p");
  eq.className = "sheet-eq";
  eq.textContent = reveal ? `${problem.a} × ${problem.b} = ${plan.total}` : `${problem.a} × ${problem.b} =`;
  root.append(eq);

  if (reveal) {
    root.append(row(plan.cols, plan.mulCarries, { className: "is-carry" }));
  }

  root.append(row(plan.cols, plan.top));
  root.append(row(plan.cols, plan.mul, { op: "×" }));
  root.append(rule(plan.cols));

  if (plan.partials.length > 1) {
    for (const partial of plan.partials) {
      const cells = reveal ? partial.cells : padLeft([], plan.cols);
      root.append(row(plan.cols, cells, { op: partial.plus ? "+" : "", className: "is-partial" }));
    }
    root.append(rule(plan.cols));
  }

  const total = reveal ? plan.totalCells : typedCells(typed, plan.cols);
  root.append(row(plan.cols, total, { className: "is-total" }));
  return root;
}

export function planDivision(dividend, divisor) {
  const digits = String(dividend).split("").map(Number);
  const quotientSlots = Array(digits.length).fill("");
  const steps = [];
  let remainder = 0;
  let started = false;

  for (let i = 0; i < digits.length; i += 1) {
    remainder = remainder * 10 + digits[i];
    const q = Math.floor(remainder / divisor);
    if (!started && q === 0 && i < digits.length - 1) {
      continue;
    }
    started = true;
    const product = q * divisor;
    const next = remainder - product;
    steps.push({
      take: remainder,
      q,
      product,
      remainder: next,
      endIndex: i,
      bringDown: i < digits.length - 1 ? digits[i + 1] : null,
    });
    quotientSlots[i] = String(q);
    remainder = next;
  }

  return {
    dividend,
    divisor,
    digits,
    quotient: dividend / divisor,
    quotientSlots,
    steps,
    table: Array.from({ length: 9 }, (_, index) => {
      const n = index + 1;
      return { n, value: n * divisor };
    }),
  };
}

function placeDigits(length, text, endIndex) {
  const cells = Array(length).fill("");
  const digits = String(text).split("");
  const start = endIndex - digits.length + 1;
  digits.forEach((digit, index) => {
    const at = start + index;
    if (at >= 0 && at < length) cells[at] = digit;
  });
  return cells;
}

function divisionRow(cols, values, { op = "", arrow = "", className = "" } = {}) {
  const wrap = document.createElement("div");
  wrap.className = `div-digits ${className}`.trim();
  wrap.style.setProperty("--cols", String(cols));
  wrap.append(cell(op, "is-op"));
  for (const value of values) wrap.append(cell(value));
  wrap.append(cell(arrow, "is-arrow"));
  return wrap;
}

export function renderDivisionSheet(problem, { typed = "", reveal = false } = {}) {
  const plan = planDivision(problem.a, problem.b);
  const cols = plan.digits.length;
  const root = document.createElement("div");
  root.className = "sheet sheet-div";
  root.dataset.op = "div";

  const table = document.createElement("ol");
  table.className = "div-table";
  const used = new Set(plan.steps.map((step) => step.q).filter(Boolean));
  for (const entry of plan.table) {
    const item = document.createElement("li");
    item.textContent = `${entry.n} – ${entry.value}`;
    if (reveal && used.has(entry.n)) item.classList.add("is-used");
    table.append(item);
  }

  const work = document.createElement("div");
  work.className = "div-work";

  const line = (values, options = {}) => {
    const wrap = document.createElement("div");
    wrap.className = "div-line";
    const label = document.createElement("span");
    label.className = options.divisor ? "div-divisor" : "div-divisor is-spacer";
    label.textContent = String(plan.divisor);
    wrap.append(label, divisionRow(cols, values, options));
    return wrap;
  };

  const topSlots = reveal
    ? plan.quotientSlots
    : padLeft(typed && typed !== "-" && typed !== "−" ? digitList(typed.replace("-", "−")) : [], cols);
  work.append(line(topSlots, { className: "is-quotient" }));
  work.append(line(plan.digits, { className: "is-dividend", divisor: true }));

  if (reveal) {
    for (const step of plan.steps) {
      work.append(
        line(placeDigits(cols, step.product, step.endIndex), {
          op: "−",
          arrow: step.bringDown !== null ? "↓" : "",
          className: "is-sub",
        }),
      );
      const remCells = placeDigits(cols, step.remainder, step.endIndex);
      if (step.bringDown !== null) remCells[step.endIndex + 1] = String(step.bringDown);
      work.append(line(remCells, { className: "is-remain" }));
    }
  }

  root.append(table, work);
  return root;
}

export function planAddition(a, b) {
  const total = a + b;
  const cols = Math.max(String(a).length, String(b).length, String(total).length);
  const top = padLeft(digitList(a), cols);
  const bottom = padLeft(digitList(b), cols);
  const carries = Array(cols).fill("");
  let carry = 0;
  for (let i = cols - 1; i >= 0; i -= 1) {
    const n = Number(top[i] || 0) + Number(bottom[i] || 0) + carry;
    carry = Math.floor(n / 10);
    if (i > 0 && carry) carries[i - 1] = String(carry);
  }
  return {
    cols,
    top,
    bottom,
    carries,
    total,
    totalCells: padLeft(digitList(total), cols),
  };
}

export function planSubtraction(a, b) {
  const total = a - b;
  const cols = Math.max(String(a).length, String(b).length, String(Math.abs(total)).length);
  const top = padLeft(digitList(a), cols);
  const bottom = padLeft(digitList(b), cols);
  const carries = Array(cols).fill("");
  let borrow = 0;
  for (let i = cols - 1; i >= 0; i -= 1) {
    let topDigit = Number(top[i] || 0) - borrow;
    const bot = Number(bottom[i] || 0);
    if (topDigit < bot) {
      topDigit += 10;
      borrow = 1;
      carries[i] = "1";
    } else {
      borrow = 0;
    }
  }
  return {
    cols,
    top,
    bottom,
    carries,
    total,
    totalCells: padLeft(digitList(total), cols),
  };
}

function renderColumnSheet(problem, plan, { typed = "", reveal = false, op, symbol }) {
  const root = document.createElement("div");
  root.className = "sheet";
  root.dataset.op = op;
  if (reveal) root.append(row(plan.cols, plan.carries, { className: "is-carry" }));
  root.append(row(plan.cols, plan.top));
  root.append(row(plan.cols, plan.bottom, { op: symbol }));
  root.append(rule(plan.cols));
  root.append(row(plan.cols, reveal ? plan.totalCells : typedCells(typed, plan.cols), { className: "is-total" }));
  return root;
}

export function renderAdditionSheet(problem, options = {}) {
  return renderColumnSheet(problem, planAddition(problem.a, problem.b), { ...options, op: "add", symbol: "+" });
}

export function renderSubtractionSheet(problem, options = {}) {
  return renderColumnSheet(problem, planSubtraction(problem.a, problem.b), { ...options, op: "sub", symbol: "−" });
}

const PICTURE_ICONS = ["🍐", "🍎", "🍋", "🍊", "🍇", "🍑", "⭐", "🫐"];

function pictureIcon(problem) {
  const seed = [...String(problem.key)].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return PICTURE_ICONS[seed % PICTURE_ICONS.length];
}

function pictureCluster(count, icon) {
  const wrap = document.createElement("div");
  wrap.className = "pic-cluster";
  for (let i = 0; i < count; i += 1) {
    const item = document.createElement("span");
    item.className = "pic-item";
    item.textContent = icon;
    wrap.append(item);
  }
  return wrap;
}

function pictureSide(count, icon, label) {
  const side = document.createElement("div");
  side.className = "pic-side";
  side.append(pictureCluster(count, icon));
  const number = document.createElement("p");
  number.className = "pic-num";
  number.textContent = String(label);
  side.append(number);
  return side;
}

export function renderPictureSheet(problem, { typed = "", reveal = false } = {}) {
  const root = document.createElement("div");
  root.className = "sheet sheet-pic";
  root.dataset.op = problem.op;
  const icon = pictureIcon(problem);
  const symbol = { add: "+", sub: "−", mul: "×", div: "÷" }[problem.op];

  const rowWrap = document.createElement("div");
  rowWrap.className = "pic-equation";

  if (problem.op === "mul") {
    const groups = document.createElement("div");
    groups.className = "pic-groups";
    for (let i = 0; i < problem.a; i += 1) groups.append(pictureCluster(problem.b, icon));
    const side = document.createElement("div");
    side.className = "pic-side";
    side.append(groups);
    const number = document.createElement("p");
    number.className = "pic-num";
    number.textContent = `${problem.a} × ${problem.b}`;
    side.append(number);
    rowWrap.append(side);
  } else if (problem.op === "div") {
    rowWrap.append(pictureSide(problem.a, icon, problem.a));
    const op = document.createElement("span");
    op.className = "pic-op";
    op.textContent = "÷";
    rowWrap.append(op);
    const groups = document.createElement("div");
    groups.className = "pic-side";
    const note = document.createElement("p");
    note.className = "pic-num";
    note.textContent = String(problem.b);
    groups.append(pictureCluster(problem.b, icon), note);
    rowWrap.append(groups);
  } else {
    rowWrap.append(pictureSide(problem.a, icon, problem.a));
    const op = document.createElement("span");
    op.className = "pic-op";
    op.textContent = symbol;
    rowWrap.append(op);
    rowWrap.append(pictureSide(problem.b, icon, problem.b));
  }

  const eq = document.createElement("span");
  eq.className = "pic-op";
  eq.textContent = "=";
  const answer = document.createElement("div");
  answer.className = "pic-answer";
  answer.textContent = reveal ? String(problem.answer) : typed && typed !== "-" ? typed : "";
  rowWrap.append(eq, answer);
  root.append(rowWrap);
  return root;
}

export function renderProblemView(problem, options = {}) {
  if (problem.difficulty === "pictures") return renderPictureSheet(problem, options);
  if (problem.op === "mul") return renderMultiplicationSheet(problem, options);
  if (problem.op === "div") return renderDivisionSheet(problem, options);
  if (problem.op === "add") return renderAdditionSheet(problem, options);
  if (problem.op === "sub") return renderSubtractionSheet(problem, options);
  const text = document.createElement("div");
  text.className = "problem-inline";
  text.textContent = options.reveal ? `${problem.prompt} = ${problem.answer}` : problem.prompt;
  return text;
}
