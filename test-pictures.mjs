import { PICTURE_ITEMS, pickPicture, pictureSvg } from "./pictures.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const categories = new Set(PICTURE_ITEMS.map((item) => item.category));
assert(categories.has("fruit"), "fruit pictures");
assert(categories.has("toy"), "toy pictures");
assert(categories.has("school"), "school pictures");

for (const category of ["fruit", "toy", "school"]) {
  const count = PICTURE_ITEMS.filter((item) => item.category === category).length;
  assert(count >= 3, `enough ${category} pictures`);
}

for (const id of ["apple", "banana", "teddy", "ball", "pencil", "pen", "eraser", "crayon"]) {
  assert(PICTURE_ITEMS.some((item) => item.id === id), id);
}

for (const item of PICTURE_ITEMS) {
  const svg = pictureSvg(item.id);
  assert(svg.includes("<svg"), `${item.id} has svg`);
  assert(!/\p{Extended_Pictographic}/u.test(svg), `${item.id} is a drawing`);
}

const first = pickPicture("3add2");
const again = pickPicture("3add2");
assert(first.id === again.id, "same problem keeps the same picture");
assert(PICTURE_ITEMS.some((item) => item.id === first.id), "picked picture exists");

console.log("picture set checks passed");
