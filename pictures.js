export const PICTURE_ITEMS = [
  { id: "apple", category: "fruit", label: "apple" },
  { id: "banana", category: "fruit", label: "banana" },
  { id: "strawberry", category: "fruit", label: "strawberry" },
  { id: "orange", category: "fruit", label: "orange" },
  { id: "grapes", category: "fruit", label: "grapes" },
  { id: "pear", category: "fruit", label: "pear" },
  { id: "watermelon", category: "fruit", label: "watermelon" },
  { id: "teddy", category: "toy", label: "teddy bear" },
  { id: "ball", category: "toy", label: "ball" },
  { id: "car", category: "toy", label: "toy car" },
  { id: "duck", category: "toy", label: "rubber duck" },
  { id: "block", category: "toy", label: "building block" },
  { id: "balloon", category: "toy", label: "balloon" },
  { id: "pencil", category: "school", label: "pencil" },
  { id: "pen", category: "school", label: "pen" },
  { id: "eraser", category: "school", label: "eraser" },
  { id: "crayon", category: "school", label: "crayon" },
];

const MARKUP = {
  apple: `
    <ellipse cx="16" cy="19" rx="10" ry="10.2" fill="#e23c3c"/>
    <ellipse cx="12" cy="16.5" rx="3.2" ry="4.2" fill="#f28b8b" opacity=".7"/>
    <path d="M16 8.2c.2 3.4 0 5.4 0 5.4" fill="none" stroke="#6b3a1a" stroke-width="1.7" stroke-linecap="round"/>
    <path d="M16.4 9.4c2.4-.4 4.2-2 4.6-3.6-2.8.1-4.8 1.7-5.2 3.8z" fill="#3f9a4e"/>
  `,
  banana: `
    <path d="M8 9c9-6 18.5-1 19.5 9.2-6.4-1.4-12.2 1-16.2 6.2-1.6 2-3.8 3-5 1.6C5.6 20 6.4 13.6 8 9z" fill="#f5c518"/>
    <path d="M9.2 10.2c7.6-4.6 15.2-1.2 16.4 6" fill="none" stroke="#e0a40a" stroke-width="1.3" stroke-linecap="round"/>
    <path d="M7.2 8.2c1.2-1 2.6-.4 2.8.8-.8.2-2 .6-2.8.8-.2-.6-.4-1.2 0-1.6z" fill="#c9842a"/>
  `,
  strawberry: `
    <path d="M16 28c-7.4-3.4-10.6-10.4-8.6-16.2C9 8.4 13 7.4 16 9.2c3-1.8 7-.8 8.6 2.6 2 5.8-1.2 12.8-8.6 16.2z" fill="#e23c3c"/>
    <circle cx="12.5" cy="16" r=".8" fill="#f6d36a"/>
    <circle cx="16.8" cy="14.6" r=".8" fill="#f6d36a"/>
    <circle cx="19.4" cy="18.2" r=".8" fill="#f6d36a"/>
    <circle cx="13.8" cy="20.4" r=".8" fill="#f6d36a"/>
    <circle cx="17.6" cy="22.2" r=".8" fill="#f6d36a"/>
    <path d="M10.4 9.6c2.2 1.4 3.8 1.6 5.6.4 1.8 1.2 3.4 1 5.6-.4-1.6 2.4-3.6 3.6-5.6 3.6s-4-1.2-5.6-3.6z" fill="#3f9a4e"/>
  `,
  orange: `
    <circle cx="16" cy="18" r="10" fill="#f08a24"/>
    <path d="M16 9.2c2.8 3.4 2.8 7.4 0 10.8-2.8-3.4-2.8-7.4 0-10.8z" fill="#f6b15a" opacity=".7"/>
    <path d="M16 8.4c.1 2.6 0 3.8 0 3.8" fill="none" stroke="#6b3a1a" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M16.2 8.8c2.2-.2 3.6-1.6 3.8-3-2.4 0-4 1.4-4.4 3.2z" fill="#3f9a4e"/>
  `,
  grapes: `
    <circle cx="16" cy="13.2" r="3.3" fill="#7b4db0"/>
    <circle cx="12.4" cy="16.8" r="3.3" fill="#8a5cc2"/>
    <circle cx="19.6" cy="16.8" r="3.3" fill="#6a3d9e"/>
    <circle cx="14.2" cy="21.6" r="3.2" fill="#7b4db0"/>
    <circle cx="18.4" cy="21.4" r="3.2" fill="#8a5cc2"/>
    <path d="M16 6.4c.2 2.8 0 4.2 0 4.2" fill="none" stroke="#6b3a1a" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M16.2 7.2c2-.2 3.2-1.4 3.4-2.6-2.2 0-3.6 1.2-3.8 2.8z" fill="#3f9a4e"/>
  `,
  pear: `
    <path d="M16 7.6c3.2 2.2 4.6 5.2 4.2 8.2-.2 1.8.8 3.8 1.8 5.8 1.4 3-1 7.2-6 7.2s-7.4-4.2-6-7.2c1-2 2-4 1.8-5.8-.4-3 1-6 4.2-8.2z" fill="#8fbf3a"/>
    <ellipse cx="13.4" cy="20" rx="2.4" ry="3.2" fill="#c5e06a" opacity=".7"/>
    <path d="M16 6.6c.1 2.8 0 4.2 0 4.2" fill="none" stroke="#6b3a1a" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M16.2 7.2c2-.3 3.4-1.6 3.6-3-2.4.1-4 1.4-4.2 3.2z" fill="#3f9a4e"/>
  `,
  watermelon: `
    <path d="M5.6 12.8c6.8 12.4 14.2 12.4 20.8 0-7.2 2.2-13.6 2.2-20.8 0z" fill="#3f9a4e"/>
    <path d="M7.4 13.4c5.8 10.2 11.6 10.2 17.2 0-6 1.8-11.2 1.8-17.2 0z" fill="#f4f0ea"/>
    <path d="M8.8 13.8c4.8 8.4 9.6 8.4 14.4 0-5 1.4-9.4 1.4-14.4 0z" fill="#e23c3c"/>
    <circle cx="13" cy="17.4" r=".7" fill="#2a241c"/>
    <circle cx="16.2" cy="18.6" r=".7" fill="#2a241c"/>
    <circle cx="19.2" cy="17.2" r=".7" fill="#2a241c"/>
  `,
  teddy: `
    <circle cx="8.6" cy="11.2" r="4.2" fill="#b56a32"/>
    <circle cx="23.4" cy="11.2" r="4.2" fill="#b56a32"/>
    <circle cx="8.6" cy="11.2" r="2.2" fill="#e7b07a"/>
    <circle cx="23.4" cy="11.2" r="2.2" fill="#e7b07a"/>
    <circle cx="16" cy="18" r="9" fill="#c47a3c"/>
    <ellipse cx="16" cy="21.4" rx="4.2" ry="3.2" fill="#e7b07a"/>
    <circle cx="13" cy="16.4" r="1.1" fill="#3a2a1c"/>
    <circle cx="19" cy="16.4" r="1.1" fill="#3a2a1c"/>
    <ellipse cx="16" cy="19.2" rx="1.3" ry="1" fill="#3a2a1c"/>
  `,
  ball: `
    <circle cx="16" cy="16" r="10.2" fill="#f08a24"/>
    <path d="M16 5.8c3.6 3.2 5.4 7.2 5.4 10.2S19.6 23 16 26.2C12.4 23 10.6 19 10.6 16s1.8-7 5.4-10.2z" fill="#3d8adf"/>
    <path d="M6.4 16h19.2" fill="none" stroke="#f4ead8" stroke-width="1.5"/>
    <path d="M8.2 10.4c5 2 10.6 2 15.6 0" fill="none" stroke="#f4ead8" stroke-width="1.3"/>
    <path d="M8.2 21.6c5-2 10.6-2 15.6 0" fill="none" stroke="#f4ead8" stroke-width="1.3"/>
  `,
  car: `
    <path d="M6.4 18.2 9 12.4c.6-1.2 1.6-1.8 3-1.8h8.4c1.3 0 2.3.7 2.9 1.8l2.3 5.8z" fill="#3d8adf"/>
    <rect x="4.6" y="17.6" width="22.8" height="5.2" rx="1.6" fill="#245ea8"/>
    <rect x="10.2" y="12" width="4.2" height="3.6" rx=".6" fill="#d7ecff"/>
    <rect x="16.2" y="12" width="5" height="3.6" rx=".6" fill="#d7ecff"/>
    <circle cx="10.2" cy="23.4" r="2.6" fill="#2a241c"/>
    <circle cx="10.2" cy="23.4" r="1.1" fill="#d7d0c4"/>
    <circle cx="21.8" cy="23.4" r="2.6" fill="#2a241c"/>
    <circle cx="21.8" cy="23.4" r="1.1" fill="#d7d0c4"/>
  `,
  duck: `
    <ellipse cx="16.4" cy="20.4" rx="8.4" ry="6.2" fill="#f5c518"/>
    <circle cx="22.6" cy="12.6" r="5.2" fill="#f5c518"/>
    <path d="M26.8 13.2c2.6.2 3.8 1.2 3.8 2.2s-1.4 1.6-3.6 1.4c-1 0-1.6-.4-1.8-1.2.8-.6 1.4-1.6 1.6-2.4z" fill="#f08a24"/>
    <circle cx="24.2" cy="11.4" r=".9" fill="#2a241c"/>
    <ellipse cx="13.2" cy="21.2" rx="2.4" ry="1.6" fill="#f6d36a"/>
  `,
  block: `
    <path d="M8 12.4 16 8.2l8 4.2-8 4.4z" fill="#f08a24"/>
    <path d="M8 12.4v9.2l8 4.4v-9.2z" fill="#e23c3c"/>
    <path d="M16 16.8v9.2l8-4.4v-9.2z" fill="#3d8adf"/>
  `,
  balloon: `
    <ellipse cx="16" cy="13.2" rx="7.4" ry="9" fill="#e23c3c"/>
    <ellipse cx="13.4" cy="10.6" rx="2.2" ry="3" fill="#f28b8b" opacity=".75"/>
    <path d="M16 22.2 14.6 24.4h2.8z" fill="#c12f2f"/>
    <path d="M16 24.2c0 4.2 1.6 5.8 0 7.2" fill="none" stroke="#6b3a1a" stroke-width="1.3" stroke-linecap="round"/>
  `,
  pencil: `
    <path d="M9.2 25.6 6.4 28l1.6-3.4z" fill="#e7b07a"/>
    <path d="M11.2 23.4 8 26.6l2.4-1.2 2.2-2.2z" fill="#f08a24"/>
    <path d="M24.6 6.6 11.2 23.4l4.6 3.2L28 11z" fill="#f5c518"/>
    <path d="M26.2 5.4c1.2 1 1.6 2 .8 3l-2.4 2.8-3.4-2.4 2.2-3c.8-1 1.6-1.4 2.8-.4z" fill="#f2a0b4"/>
    <path d="M13.2 20.2 23 8.8" fill="none" stroke="#e0a40a" stroke-width="1.1"/>
  `,
  pen: `
    <path d="M8.6 25.8 6.6 28.2l2.2-2.8z" fill="#d7d0c4"/>
    <path d="M23.8 6.8 10.2 23.6l4.2 3.2L26.8 11z" fill="#3d8adf"/>
    <path d="M25.6 5.6c1.2.8 1.6 1.8.8 2.8l-2 2.4-3-2.2 1.8-2.4c.7-1 1.4-1.4 2.4-.6z" fill="#245ea8"/>
    <path d="M11.4 22.4 22.6 9.2" fill="none" stroke="#6aa4e6" stroke-width="1.1"/>
    <path d="M10.2 23.6 8.6 25.8l2.6 2 1.6-2.2z" fill="#f08a24"/>
  `,
  eraser: `
    <rect x="5.4" y="11.2" width="21.2" height="10.4" rx="2.4" fill="#f2a0b4"/>
    <rect x="14.8" y="11.2" width="6.4" height="10.4" fill="#f4ead8"/>
    <path d="M15 12.2h5.8M15 20.6h5.8" fill="none" stroke="#d7c7a8" stroke-width="1"/>
    <rect x="5.4" y="11.2" width="21.2" height="10.4" rx="2.4" fill="none" stroke="#d47b90" stroke-width="1"/>
  `,
  crayon: `
    <path d="M16 5.4 12.6 9.4h6.8z" fill="#e23c3c"/>
    <rect x="12.4" y="9.2" width="7.2" height="15.6" rx="1.2" fill="#f06a6a"/>
    <rect x="12.4" y="12.4" width="7.2" height="3.2" fill="#e23c3c"/>
    <rect x="13.2" y="24.6" width="5.6" height="3.2" rx="1" fill="#f4ead8"/>
  `,
};

function svgWrap(inner) {
  return `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${inner}</svg>`;
}

export function pictureSvg(id) {
  const inner = MARKUP[id];
  if (!inner) throw new Error(`Unknown picture: ${id}`);
  return svgWrap(inner);
}

export function pickPicture(key) {
  const seed = [...String(key)].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return PICTURE_ITEMS[seed % PICTURE_ITEMS.length];
}
