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

export function renderProblemView(problem, options = {}) {
  if (problem.op === "mul") return renderMultiplicationSheet(problem, options);
  const text = document.createElement("div");
  text.className = "problem-inline";
  text.textContent = options.reveal ? `${problem.prompt} = ${problem.answer}` : problem.prompt;
  return text;
}
