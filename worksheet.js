import { parseAnswer } from "./problems.js";
import { pickPicture, pictureSvg } from "./pictures.js";

function digitList(value) {
  return String(value).split("").map((d) => (d === "-" ? "−" : d));
}

function remainValue(step) {
  if (step.bringDown === null || step.bringDown === undefined) return step.remainder;
  return Number(`${step.remainder}${step.bringDown}`);
}

export function worksheetFields(problem) {
  if (problem.difficulty === "pictures") {
    return [{ id: "total", answer: problem.answer }];
  }
  if (problem.op === "mul") {
    const plan = planMultiplication(problem.a, problem.b);
    if (plan.partials.length > 1) {
      return [
        ...plan.partials.map((row, index) => ({ id: `partial-${index}`, answer: row.value })),
        { id: "total", answer: plan.total },
      ];
    }
    return [{ id: "total", answer: plan.total }];
  }
  if (problem.op === "div") {
    const plan = planDivision(problem.a, problem.b);
    const fields = [{ id: "quotient", answer: plan.quotient }];
    plan.steps.forEach((step, index) => {
      fields.push({ id: `product-${index}`, answer: step.product });
      fields.push({ id: `remain-${index}`, answer: remainValue(step) });
    });
    return fields;
  }
  if (problem.op === "add") {
    return [{ id: "total", answer: problem.a + problem.b }];
  }
  if (problem.op === "sub") {
    return [{ id: "total", answer: problem.a - problem.b }];
  }
  return [{ id: "total", answer: problem.answer }];
}

export function fieldsReady(fills) {
  return fills.length > 0 && fills.every((fill) => parseAnswer(fill) !== null);
}

export function fieldsMatch(fills, fields) {
  if (fills.length !== fields.length) return false;
  return fills.every((fill, index) => parseAnswer(fill) === fields[index].answer);
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

function markFill(el, { slot = null, active = false, reveal = false } = {}) {
  if (reveal || slot == null) return;
  el.classList.add("is-fill");
  if (active) el.classList.add("is-active");
  el.dataset.slot = String(slot);
  el.setAttribute("role", "button");
  el.setAttribute("aria-label", "Fill this line");
}

function row(cols, cells, { op = "", className = "", slot = null, active = false, reveal = false } = {}) {
  const wrap = document.createElement("div");
  wrap.className = `sheet-row ${className}`.trim();
  wrap.style.setProperty("--cols", String(cols));
  wrap.append(cell(op, "is-op"));
  for (const item of cells) {
    if (item instanceof HTMLElement) wrap.append(item);
    else wrap.append(cell(item));
  }
  markFill(wrap, { slot, active, reveal });
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

export function renderMultiplicationSheet(problem, { fills = [], active = 0, reveal = false } = {}) {
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

  let nextSlot = 0;
  if (plan.partials.length > 1) {
    for (const partial of plan.partials) {
      const slot = nextSlot;
      nextSlot += 1;
      const cells = reveal ? partial.cells : typedCells(fills[slot], plan.cols);
      root.append(
        row(plan.cols, cells, {
          op: partial.plus ? "+" : "",
          className: "is-partial",
          slot,
          active: active === slot,
          reveal,
        }),
      );
    }
    root.append(rule(plan.cols));
  }

  const totalSlot = nextSlot;
  const total = reveal ? plan.totalCells : typedCells(fills[totalSlot], plan.cols);
  root.append(
    row(plan.cols, total, {
      className: "is-total",
      slot: totalSlot,
      active: active === totalSlot,
      reveal,
    }),
  );
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

function divisionRow(cols, values, { op = "", arrow = "", className = "", slot = null, active = false, reveal = false } = {}) {
  const wrap = document.createElement("div");
  wrap.className = `div-digits ${className}`.trim();
  wrap.style.setProperty("--cols", String(cols));
  wrap.append(cell(op, "is-op"));
  for (const value of values) wrap.append(cell(value));
  wrap.append(cell(arrow, "is-arrow"));
  markFill(wrap, { slot, active, reveal });
  return wrap;
}

function placedFill(cols, typed, endIndex) {
  if (!typed || typed === "-" || typed === "−") return Array(cols).fill("");
  return placeDigits(cols, typed.replace("-", "−"), endIndex);
}

export function renderDivisionSheet(problem, { fills = [], active = 0, reveal = false } = {}) {
  const plan = planDivision(problem.a, problem.b);
  const cols = plan.digits.length;
  const root = document.createElement("div");
  root.className = "sheet sheet-div";
  root.dataset.op = "div";

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
    : padLeft(fills[0] && fills[0] !== "-" && fills[0] !== "−" ? digitList(String(fills[0]).replace("-", "−")) : [], cols);
  work.append(
    line(topSlots, { className: "is-quotient", slot: 0, active: active === 0, reveal }),
  );
  work.append(line(plan.digits, { className: "is-dividend", divisor: true }));

  let nextSlot = 1;
  for (const step of plan.steps) {
    const productSlot = nextSlot;
    nextSlot += 1;
    const productCells = reveal
      ? placeDigits(cols, step.product, step.endIndex)
      : placedFill(cols, fills[productSlot], step.endIndex);
    work.append(
      line(productCells, {
        op: "−",
        arrow: step.bringDown !== null ? "↓" : "",
        className: "is-sub",
        slot: productSlot,
        active: active === productSlot,
        reveal,
      }),
    );

    const remainSlot = nextSlot;
    nextSlot += 1;
    const remainEnd = step.bringDown !== null ? step.endIndex + 1 : step.endIndex;
    const remCells = reveal
      ? placeDigits(cols, step.remainder, step.endIndex)
      : placedFill(cols, fills[remainSlot], remainEnd);
    if (reveal && step.bringDown !== null) remCells[step.endIndex + 1] = String(step.bringDown);
    work.append(
      line(remCells, {
        className: "is-remain",
        slot: remainSlot,
        active: active === remainSlot,
        reveal,
      }),
    );
  }

  root.append(work);
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

function renderColumnSheet(problem, plan, { fills = [], active = 0, reveal = false, op, symbol }) {
  const root = document.createElement("div");
  root.className = "sheet";
  root.dataset.op = op;
  if (reveal) root.append(row(plan.cols, plan.carries, { className: "is-carry" }));
  root.append(row(plan.cols, plan.top));
  root.append(row(plan.cols, plan.bottom, { op: symbol }));
  root.append(rule(plan.cols));
  root.append(
    row(plan.cols, reveal ? plan.totalCells : typedCells(fills[0], plan.cols), {
      className: "is-total",
      slot: 0,
      active: active === 0,
      reveal,
    }),
  );
  return root;
}

export function renderAdditionSheet(problem, options = {}) {
  return renderColumnSheet(problem, planAddition(problem.a, problem.b), { ...options, op: "add", symbol: "+" });
}

export function renderSubtractionSheet(problem, options = {}) {
  return renderColumnSheet(problem, planSubtraction(problem.a, problem.b), { ...options, op: "sub", symbol: "−" });
}

function pictureNode(picture) {
  const item = document.createElement("span");
  item.className = "pic-item";
  item.setAttribute("aria-hidden", "true");
  item.innerHTML = pictureSvg(picture.id);
  return item;
}

function pictureCluster(count, picture) {
  const wrap = document.createElement("div");
  wrap.className = "pic-cluster";
  for (let i = 0; i < count; i += 1) wrap.append(pictureNode(picture));
  return wrap;
}

function pictureSide(count, picture, label) {
  const side = document.createElement("div");
  side.className = "pic-side";
  side.append(pictureCluster(count, picture));
  const number = document.createElement("p");
  number.className = "pic-num";
  number.textContent = String(label);
  side.append(number);
  return side;
}

export function renderPictureSheet(problem, { fills = [], active = 0, reveal = false } = {}) {
  const root = document.createElement("div");
  root.className = "sheet sheet-pic";
  root.dataset.op = problem.op;
  const picture = pickPicture(problem.key);
  const symbol = { add: "+", sub: "−", mul: "×", div: "÷" }[problem.op];

  const rowWrap = document.createElement("div");
  rowWrap.className = "pic-equation";

  if (problem.op === "mul") {
    const groups = document.createElement("div");
    groups.className = "pic-groups";
    for (let i = 0; i < problem.a; i += 1) groups.append(pictureCluster(problem.b, picture));
    const side = document.createElement("div");
    side.className = "pic-side";
    side.append(groups);
    const number = document.createElement("p");
    number.className = "pic-num";
    number.textContent = `${problem.a} × ${problem.b}`;
    side.append(number);
    rowWrap.append(side);
  } else if (problem.op === "div") {
    rowWrap.append(pictureSide(problem.a, picture, problem.a));
    const op = document.createElement("span");
    op.className = "pic-op";
    op.textContent = "÷";
    rowWrap.append(op);
    const groups = document.createElement("div");
    groups.className = "pic-side";
    const note = document.createElement("p");
    note.className = "pic-num";
    note.textContent = String(problem.b);
    groups.append(pictureCluster(problem.b, picture), note);
    rowWrap.append(groups);
  } else {
    rowWrap.append(pictureSide(problem.a, picture, problem.a));
    const op = document.createElement("span");
    op.className = "pic-op";
    op.textContent = symbol;
    rowWrap.append(op);
    rowWrap.append(pictureSide(problem.b, picture, problem.b));
  }

  const eq = document.createElement("span");
  eq.className = "pic-op";
  eq.textContent = "=";
  const answer = document.createElement("div");
  answer.className = "pic-answer";
  const typed = fills[0] ?? "";
  answer.textContent = reveal ? String(problem.answer) : typed && typed !== "-" ? typed : "";
  markFill(answer, { slot: 0, active: active === 0, reveal });
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
