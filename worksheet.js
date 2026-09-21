import { SYMBOLS, parseAnswer } from "./problems.js";
import { pickPicture, pictureSvg } from "./pictures.js";

function digitList(value) {
  return String(value).split("").map((d) => (d === "-" ? "−" : d));
}

export function worksheetFields(problem) {
  if (problem.difficulty === "pictures" || problem.difficulty === "easy") {
    return [{ id: "total", answer: problem.answer }];
  }
  if (problem.op === "mul") {
    return planMultiplication(problem.a, problem.b).slots;
  }
  if (problem.op === "div") {
    return planDivision(problem.a, problem.b).slots;
  }
  if (problem.op === "add") {
    return planAddition(problem.a, problem.b).slots;
  }
  if (problem.op === "sub") {
    return planSubtraction(problem.a, problem.b).slots;
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

export function worksheetSections(fields) {
  if (!fields.length) return [[]];
  if (!fields.some((field) => field.step != null)) {
    return [fields.map((_, index) => index)];
  }
  const max = Math.max(...fields.map((field) => field.step ?? 0));
  return Array.from({ length: max + 1 }, (_, step) =>
    fields.filter((field) => (field.step ?? 0) === step).map((field) => field.index ?? fields.indexOf(field)),
  ).filter((group) => group.length);
}

function padLeft(chars, cols) {
  const list = [...chars];
  if (list.length > cols) return list.slice(-cols);
  return Array.from({ length: cols - list.length }, () => "").concat(list);
}

function timesDigitSteps(value, digit) {
  const source = String(value).split("").map(Number);
  const steps = [];
  let incoming = 0;
  for (let i = source.length - 1; i >= 0; i -= 1) {
    const n = source[i] * digit + incoming;
    const write = n % 10;
    const carryOut = Math.floor(n / 10);
    steps.push({ sourceIndex: i, write, carryOut });
    incoming = carryOut;
  }
  return { steps, leftover: incoming, sourceLen: source.length };
}

function timesDigit(value, digit) {
  const { steps, leftover, sourceLen } = timesDigitSteps(value, digit);
  const carries = Array(sourceLen).fill(0);
  for (const step of steps) {
    if (step.sourceIndex > 0) carries[step.sourceIndex - 1] = step.carryOut;
  }
  return {
    product: value * digit,
    leftover,
    carries,
  };
}

function pushSlot(slots, field) {
  slots.push({
    ...field,
    unit: "cell",
    index: slots.length,
    answer: field.answer,
  });
}

function appendProductSlots(slots, { a, digit, shift, cols, line, step = 0 }) {
  const { steps, leftover, sourceLen } = timesDigitSteps(a, digit);
  for (let i = 0; i < steps.length; i += 1) {
    const item = steps[i];
    const resultCol = cols - sourceLen + item.sourceIndex - shift;
    const carryCol = cols - sourceLen + item.sourceIndex - 1;
    pushSlot(slots, {
      id: `${line}-d${item.sourceIndex}`,
      kind: "digit",
      line,
      step,
      col: resultCol,
      answer: item.write,
    });
    if (item.carryOut && i < steps.length - 1) {
      pushSlot(slots, {
        id: `${line}-c${item.sourceIndex}`,
        kind: "carry",
        line,
        step,
        col: carryCol,
        answer: item.carryOut,
      });
    }
  }
  if (leftover) {
    const last = steps.at(-1);
    pushSlot(slots, {
      id: `${line}-lead`,
      kind: "digit",
      line,
      step,
      col: cols - sourceLen + last.sourceIndex - shift - 1,
      answer: leftover,
    });
  }
}

function appendAdditionSlots(slots, values, cols, line, step = 0, { includeCarries = true } = {}) {
  const rows = values.map((value) => padLeft(digitList(value), cols).map((d) => (d === "" || d === "−" ? 0 : Number(d))));
  let carry = 0;
  for (let col = cols - 1; col >= 0; col -= 1) {
    const sum = rows.reduce((total, row) => total + row[col], 0) + carry;
    const write = sum % 10;
    const next = Math.floor(sum / 10);
    pushSlot(slots, {
      id: `${line}-d${col}`,
      kind: "digit",
      line,
      step,
      col,
      answer: write,
    });
    if (includeCarries && next && col > 0) {
      pushSlot(slots, {
        id: `${line}-c${col}`,
        kind: "carry",
        line,
        step,
        col: col - 1,
        answer: next,
      });
    }
    carry = next;
  }
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
    slots: multiplicationSlots(a, b, cols, partials, total),
  };
}

function multiplicationSlots(a, b, cols, partials, total) {
  const slots = [];
  if (partials.length > 1) {
    for (const [index, partial] of partials.entries()) {
      appendProductSlots(slots, {
        a,
        digit: partial.digit,
        shift: partial.shift,
        cols,
        line: `partial-${index}`,
        step: index,
      });
    }
    appendAdditionSlots(
      slots,
      partials.map((row) => row.value),
      cols,
      "total",
      partials.length,
    );
  } else {
    appendProductSlots(slots, {
      a,
      digit: Number(b),
      shift: 0,
      cols,
      line: "total",
      step: 0,
    });
  }
  return slots;
}

export function displayDigit(value) {
  if (value === 0 || value === "0") return "0";
  if (value === "" || value == null) return "";
  return String(value);
}

function cell(text, className = "") {
  const span = document.createElement("span");
  span.className = `sheet-cell ${className}`.trim();
  span.textContent = displayDigit(text);
  return span;
}

function markFill(el, { slot = null, active = false, reveal = false, label = "Fill this line" } = {}) {
  if (reveal || slot == null) return;
  el.classList.add("is-fill");
  if (active) el.classList.add("is-active");
  el.dataset.slot = String(slot);
  el.setAttribute("role", "button");
  el.setAttribute("aria-label", label);
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

function emptyCols(cols) {
  return Array(cols).fill("");
}

function slotKindClass(kind) {
  if (kind === "carry") return "is-carry-digit";
  if (kind === "bring") return "is-bring-digit";
  if (kind === "product") return "is-product-digit";
  if (kind === "remain") return "is-remain-digit";
  return "";
}

function slotLabel(kind) {
  if (kind === "carry") return "Fill this carry";
  if (kind === "bring") return "Fill this bring-down";
  if (kind === "product") return "Fill this multiply digit";
  if (kind === "remain") return "Fill this subtract digit";
  return "Fill this digit";
}

function slotCell(field, fills, active, reveal, { locked = false } = {}) {
  const shown = reveal ? String(field.answer) : fills[field.index] ?? "";
  const el = cell(shown, slotKindClass(field.kind));
  markFill(el, {
    slot: locked ? null : field.index,
    active: !locked && active === field.index,
    reveal,
    label: slotLabel(field.kind),
  });
  return el;
}

function cellsFromSlots(cols, fields, fills, active, reveal, { section = Infinity } = {}) {
  const visible = fields.filter((field) => (field.step ?? 0) <= section);
  const byCol = new Map(visible.map((field) => [field.col, field]));
  return emptyCols(cols).map((_, col) => {
    const field = byCol.get(col);
    if (!field) return "";
    return slotCell(field, fills, active, reveal, { locked: !reveal && (field.step ?? 0) < section });
  });
}

export function multiplicationCarryStack(slots, section = Infinity) {
  const lines = [];
  const seen = new Set();
  for (const field of slots) {
    if (field.kind !== "carry" || (field.step ?? 0) > section) continue;
    if (seen.has(field.line)) continue;
    seen.add(field.line);
    lines.push(field.line);
  }
  return lines.reverse();
}

function appendCarryLine(root, cols, slots, { line, fills, active, reveal, section = Infinity }) {
  const carries = slots.filter((field) => field.line === line && field.kind === "carry");
  if (!carries.length) return;
  root.append(
    row(cols, cellsFromSlots(cols, carries, fills, active, reveal, { section }), { className: "is-carry" }),
  );
}

function appendDigitLine(root, cols, slots, { line, op = "", className = "", fills, active, reveal, section = Infinity }) {
  const digits = slots.filter((field) => field.line === line && field.kind === "digit");
  root.append(
    row(cols, cellsFromSlots(cols, digits, fills, active, reveal, { section }), {
      op,
      className,
    }),
  );
}

export function renderMultiplicationSheet(problem, { fills = [], active = 0, reveal = false, section = Infinity } = {}) {
  const plan = planMultiplication(problem.a, problem.b);
  const root = document.createElement("div");
  root.className = "sheet";
  root.dataset.op = "mul";
  const maxSection = reveal ? Infinity : section;

  for (const line of multiplicationCarryStack(plan.slots, maxSection)) {
    appendCarryLine(root, plan.cols, plan.slots, {
      line,
      fills,
      active,
      reveal,
      section: maxSection,
    });
  }
  root.append(row(plan.cols, plan.top));
  root.append(row(plan.cols, plan.mul, { op: "×" }));
  root.append(rule(plan.cols));

  if (plan.partials.length > 1) {
    for (const [index, partial] of plan.partials.entries()) {
      if (!reveal && index > section) continue;
      appendDigitLine(root, plan.cols, plan.slots, {
        line: `partial-${index}`,
        op: partial.plus ? "+" : "",
        className: "is-partial",
        fills,
        active,
        reveal,
        section,
      });
    }
    if (reveal || section >= plan.partials.length) root.append(rule(plan.cols));
  }

  if (reveal || plan.partials.length <= 1 || section >= plan.partials.length) {
    appendDigitLine(root, plan.cols, plan.slots, {
      line: "total",
      className: "is-total",
      fills,
      active,
      reveal,
      section,
    });
  }
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

  const plan = {
    dividend,
    divisor,
    digits,
    quotient: dividend / divisor,
    quotientSlots,
    steps,
  };
  plan.slots = divisionSlots(plan);
  return plan;
}

function placedNumberSlots(slots, { value, endIndex, idPrefix, kind, line, step = 0 }) {
  const digits = String(value).split("").map(Number);
  const start = endIndex - digits.length + 1;
  digits.forEach((digit, index) => {
    pushSlot(slots, {
      id: `${idPrefix}-${index}`,
      kind,
      line,
      step,
      col: start + index,
      answer: digit,
    });
  });
}

function divisionSlots(plan) {
  const slots = [];
  plan.steps.forEach((step, index) => {
    pushSlot(slots, {
      id: `q-${index}`,
      kind: "digit",
      line: "quotient",
      step: index,
      col: step.endIndex,
      answer: step.q,
    });
    placedNumberSlots(slots, {
      value: step.product,
      endIndex: step.endIndex,
      idPrefix: `p-${index}`,
      kind: "product",
      line: `product-${index}`,
      step: index,
    });
    placedNumberSlots(slots, {
      value: step.remainder,
      endIndex: step.endIndex,
      idPrefix: `r-${index}`,
      kind: "remain",
      line: `remain-${index}`,
      step: index,
    });
    if (step.bringDown !== null) {
      pushSlot(slots, {
        id: `b-${index}`,
        kind: "bring",
        line: `remain-${index}`,
        step: index,
        col: step.endIndex + 1,
        answer: step.bringDown,
      });
    }
  });
  return slots;
}

function divisionRow(cols, values, { op = "", arrow = "", className = "" } = {}) {
  const wrap = document.createElement("div");
  wrap.className = `div-digits ${className}`.trim();
  wrap.style.setProperty("--cols", String(cols));
  wrap.append(cell(op, "is-op"));
  for (const value of values) {
    if (value instanceof HTMLElement) wrap.append(value);
    else wrap.append(cell(value));
  }
  wrap.append(cell(arrow, "is-arrow"));
  return wrap;
}

export function renderDivisionSheet(problem, { fills = [], active = 0, reveal = false, section = Infinity } = {}) {
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

  const lineSlots = (name) => plan.slots.filter((field) => field.line === name);
  work.append(
    line(cellsFromSlots(cols, lineSlots("quotient"), fills, active, reveal, { section }), {
      className: "is-quotient",
    }),
  );
  work.append(line(plan.digits, { className: "is-dividend", divisor: true }));

  for (const [index, step] of plan.steps.entries()) {
    if (!reveal && index > section) continue;
    work.append(
      line(cellsFromSlots(cols, lineSlots(`product-${index}`), fills, active, reveal, { section }), {
        op: "−",
        arrow: step.bringDown !== null ? "↓" : "",
        className: "is-sub",
      }),
    );
    work.append(
      line(cellsFromSlots(cols, lineSlots(`remain-${index}`), fills, active, reveal, { section }), {
        className: "is-remain",
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
  const slots = [];
  appendAdditionSlots(slots, [a, b], cols, "total");
  return {
    cols,
    top,
    bottom,
    carries,
    total,
    totalCells: padLeft(digitList(total), cols),
    slots,
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
  const plan = {
    cols,
    top,
    bottom,
    carries,
    total,
    totalCells: padLeft(digitList(total), cols),
  };
  plan.slots = subtractionSlots(plan);
  return plan;
}

function subtractionSlots(plan) {
  const slots = [];
  for (let col = plan.cols - 1; col >= 0; col -= 1) {
    if (plan.carries[col]) {
      pushSlot(slots, {
        id: `total-c${col}`,
        kind: "carry",
        line: "total",
        step: 0,
        col,
        answer: Number(plan.carries[col]),
      });
    }
    const digit = plan.totalCells[col];
    if (digit !== "" && digit != null) {
      pushSlot(slots, {
        id: `total-d${col}`,
        kind: "digit",
        line: "total",
        step: 0,
        col,
        answer: Number(digit),
      });
    }
  }
  return slots;
}

function renderColumnSheet(problem, plan, { fills = [], active = 0, reveal = false, section = Infinity, op, symbol }) {
  const root = document.createElement("div");
  root.className = "sheet";
  root.dataset.op = op;
  const maxSection = reveal ? Infinity : section;
  appendCarryLine(root, plan.cols, plan.slots, {
    line: "total",
    fills,
    active,
    reveal,
    section: maxSection,
  });
  root.append(row(plan.cols, plan.top));
  root.append(row(plan.cols, plan.bottom, { op: symbol }));
  root.append(rule(plan.cols));
  appendDigitLine(root, plan.cols, plan.slots, {
    line: "total",
    className: "is-total",
    fills,
    active,
    reveal,
    section: maxSection,
  });
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
  const pictured = problem.op === "mul" ? problem.a * problem.b : problem.op === "add" ? problem.a + problem.b : problem.a;
  if (pictured > 36) root.dataset.picDensity = "tight";
  else if (pictured > 16) root.dataset.picDensity = "compact";
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

function renderInlineProblem(problem, { fills = [], active = 0, reveal = false } = {}) {
  const root = document.createElement("div");
  root.className = "problem-inline";
  const symbol = SYMBOLS[problem.op] ?? "";
  const width = String(Math.abs(problem.answer)).length;
  const typed = fills[0] ?? "";
  const blank = document.createElement("span");
  blank.className = "inline-blank";
  blank.style.minWidth = `${Math.max(width, 1)}ch`;
  if (reveal) {
    blank.textContent = String(problem.answer);
  } else if (typed && typed !== "-" && typed !== "−") {
    blank.textContent = typed;
  } else {
    blank.textContent = "_".repeat(Math.max(width, 1));
    blank.classList.add("is-placeholder");
  }
  markFill(blank, { slot: 0, active: active === 0, reveal, label: "Fill the answer" });
  root.append(
    document.createTextNode(`${problem.a} ${symbol} ${problem.b} = `),
    blank,
  );
  return root;
}

export function renderProblemView(problem, options = {}) {
  if (problem.difficulty === "pictures") return renderPictureSheet(problem, options);
  if (problem.difficulty === "easy") return renderInlineProblem(problem, options);
  if (problem.op === "mul") return renderMultiplicationSheet(problem, options);
  if (problem.op === "div") return renderDivisionSheet(problem, options);
  if (problem.op === "add") return renderAdditionSheet(problem, options);
  if (problem.op === "sub") return renderSubtractionSheet(problem, options);
  const text = document.createElement("div");
  text.className = "problem-inline";
  text.textContent = options.reveal ? `${problem.prompt} = ${problem.answer}` : problem.prompt;
  return text;
}
