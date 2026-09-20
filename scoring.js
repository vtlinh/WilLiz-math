export function creditsAnswer(correct, missed) {
  return Boolean(correct && !missed);
}

export function missMessage(problem) {
  if (problem?.difficulty === "pictures") {
    return `Not quite. ${problem.prompt} = ${problem.answer}`;
  }
  if (problem?.op === "div" || problem?.op === "mul" || problem?.op === "add" || problem?.op === "sub") {
    return "Not quite.";
  }
  return `Not quite. ${problem.prompt} = ${problem.answer}`;
}
