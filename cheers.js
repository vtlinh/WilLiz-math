export const CORRECT_CHEERS = [
  "Nice. That’s right.",
  "Awesome!",
  "You got it!",
  "Way to go!",
  "Super job!",
  "Brilliant!",
  "Nailed it!",
  "Spot on!",
  "Fantastic!",
  "Great thinking!",
  "Math star!",
  "Boom! Correct!",
  "Excellent!",
  "You’re on fire!",
  "Perfect!",
  "Wonderful!",
  "Right on!",
  "Terrific!",
  "Bravo!",
  "Keep it up!",
  "Amazing work!",
  "That’s the one!",
  "Smart move!",
  "Outstanding!",
  "High five!",
  "Super smart!",
  "Exactly right!",
  "Crushed it!",
  "Number ninja!",
  "Magnificent!",
  "Sharp thinking!",
  "Yes! Correct!",
  "Well done!",
  "Totally right!",
  "Superb!",
  "Ace answer!",
  "Like a pro!",
  "Clever you!",
  "Hooray!",
  "Top marks!",
  "Fabulous!",
  "Math wizard!",
  "Splendid!",
  "Rock star!",
  "So good!",
  "Right again!",
  "Marvelous!",
  "Champion work!",
  "Look at you go!",
  "Woo-hoo!",
];

export function shuffled(items, random = Math.random) {
  const copy = items.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function cheerDeck(cheers = CORRECT_CHEERS, random = Math.random) {
  let deck = [];
  let last = "";
  return {
    next() {
      if (!deck.length) {
        deck = shuffled(cheers, random);
        if (deck.length > 1 && deck[deck.length - 1] === last) {
          [deck[0], deck[deck.length - 1]] = [deck[deck.length - 1], deck[0]];
        }
      }
      last = deck.pop();
      return last;
    },
  };
}

export const CHEER_STYLES = ["trophy", "rainbow", "stars", "rocket", "medal", "sunrise", "sprout"];

function answers(count) {
  return `${count} correct answer${count === 1 ? "" : "s"}`;
}

export const RESULT_CHEERS = {
  perfect: [
    { style: "trophy", title: "Perfect round!", line: ({ name }) => `${name} got every single one right.` },
    { style: "rainbow", title: "Flawless!", line: ({ name, correct }) => `${correct} for ${correct}. ${name} didn’t miss once.` },
    { style: "stars", title: "Superstar!", line: ({ name }) => `Not one miss. ${name}, you shine.` },
    { style: "rocket", title: "Out of this world!", line: ({ name, correct }) => `${name} went ${correct} for ${correct}.` },
  ],
  great: [
    { style: "medal", title: "Brilliant work!", line: ({ name, correct }) => `${name} banked ${answers(correct)}.` },
    { style: "rocket", title: "Blast off!", line: ({ name, correct }) => `${name} is flying with ${answers(correct)}.` },
    { style: "stars", title: "Shining bright!", line: ({ name, correct }) => `${answers(correct)} for ${name}. Almost perfect!` },
    { style: "trophy", title: "Champion effort!", line: ({ name, correct }) => `${name} scored ${answers(correct)}.` },
  ],
  good: [
    { style: "sunrise", title: "Great job!", line: ({ name, correct }) => `${name} got ${answers(correct)}. Keep climbing.` },
    { style: "medal", title: "Well done!", line: ({ name, correct }) => `${name} banked ${answers(correct)}.` },
    { style: "rainbow", title: "Nice going!", line: ({ name, correct }) => `${answers(correct)} for ${name}. Getting stronger!` },
  ],
  growing: [
    { style: "sprout", title: "You’re growing!", line: ({ name, correct }) => `${name} got ${answers(correct)}. Every try helps.` },
    { style: "sunrise", title: "Good effort!", line: ({ name, correct }) => `${name} banked ${answers(correct)}. Keep practicing.` },
    { style: "rocket", title: "Engines warming up!", line: ({ name, correct }) => `${answers(correct)} for ${name}. Next round, lift off!` },
  ],
  warmup: [
    { style: "sprout", title: "Thanks for practicing!", line: ({ name }) => `${name} is warmed up. Try one more pass.` },
    { style: "sunrise", title: "Fresh start next time!", line: ({ name }) => `Every mathlete starts somewhere, ${name}.` },
  ],
};

export function resultTier({ answered = 0, correct = 0 } = {}) {
  if (!answered || !correct) return "warmup";
  if (correct >= answered) return "perfect";
  const ratio = correct / answered;
  if (ratio >= 0.8) return "great";
  if (ratio >= 0.5) return "good";
  return "growing";
}

export function resultCheer({ name = "", answered = 0, correct = 0 } = {}, random = Math.random) {
  const tier = resultTier({ answered, correct });
  const options = RESULT_CHEERS[tier];
  const pick = options[Math.floor(random() * options.length) % options.length];
  return { tier, style: pick.style, title: pick.title, headline: pick.line({ name, correct, answered }) };
}
