export function creditsAnswer(correct, missed) {
  return Boolean(correct && !missed);
}

export function formatCorrectCount(correct, answered) {
  return `${Number(correct) || 0} / ${Number(answered) || 0}`;
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

export function resultsTimeMs(round, elapsed) {
  const spent = Math.max(0, Number(elapsed) || 0);
  if (!round?.timed) return spent;
  const cap = Number(round.durationMs);
  if (!Number.isFinite(cap) || cap < 0) return spent;
  return Math.min(spent, cap);
}

export function bestNote(improved, previous) {
  if (improved) return "New personal best for this mix.";
  if (previous) return `Personal best for this mix: ${previous}.`;
  return "No personal best yet.";
}
