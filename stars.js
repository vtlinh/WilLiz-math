export const UNLIMITED_STAR_SET = 10;
export const STAR_ICON_CAP = 7;

export function progressStars(correct, total) {
  if (!total || total < 1 || correct < 1) return 0;
  return Math.min(5, Math.floor((correct / total) * 5));
}

export function unlimitedStars(attempts) {
  if (!Array.isArray(attempts) || attempts.length < UNLIMITED_STAR_SET) return 0;
  let stars = 0;
  for (let i = 0; i + UNLIMITED_STAR_SET <= attempts.length; i += UNLIMITED_STAR_SET) {
    let clean = true;
    for (let j = 0; j < UNLIMITED_STAR_SET; j += 1) {
      if (!attempts[i + j]) {
        clean = false;
        break;
      }
    }
    if (clean) stars += 1;
  }
  return stars;
}

export function compactStarCount(count) {
  return count > STAR_ICON_CAP;
}
