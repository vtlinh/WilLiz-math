export const UNLIMITED_STAR_SET = 10;
export const STAR_ICON_CAP = 7;

export function progressStars(correct, total) {
  if (!total || total < 1 || correct < 1) return 0;
  return Math.min(5, Math.floor((correct / total) * 5));
}

export function unlimitedStars(attempts) {
  if (!Array.isArray(attempts)) return 0;
  let stars = 0;
  let run = 0;
  for (const clean of attempts) {
    run = clean ? run + 1 : 0;
    if (run === UNLIMITED_STAR_SET) {
      stars += 1;
      run = 0;
    }
  }
  return stars;
}

export function compactStarCount(count) {
  return count > STAR_ICON_CAP;
}
