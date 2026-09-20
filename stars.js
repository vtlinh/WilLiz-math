export function progressStars(correct, total) {
  if (!total || total < 1 || correct < 1) return 0;
  return Math.min(5, Math.floor((correct / total) * 5));
}
