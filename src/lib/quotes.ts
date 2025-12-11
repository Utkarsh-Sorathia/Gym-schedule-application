// Motivational gym quotes
export const gymQuotes = [
    "The only bad workout is the one that didn't happen!",
    "Your body can stand almost anything. It's your mind you have to convince.",
    "The pain you feel today will be the strength you feel tomorrow.",
    "Don't wish for it, work for it!",
    "Success starts with self-discipline.",
    "The hard days are the best because that's when champions are made.",
    "Push yourself because no one else is going to do it for you.",
    "Great things never come from comfort zones.",
    "Dream it. Wish it. Do it.",
    "Success doesn't come from what you do occasionally, it comes from what you do consistently.",
    "Wake up with determination. Go to bed with satisfaction.",
    "Do something today that your future self will thank you for.",
    "Little progress is still progress.",
    "Believe in yourself and all that you are.",
    "You are stronger than you think!",
    "Make yourself proud!",
    "The body achieves what the mind believes.",
    "Strive for progress, not perfection.",
    "Every workout counts!",
    "Today's workout is tomorrow's warm-up.",
];

export function getRandomQuote(): string {
    return gymQuotes[Math.floor(Math.random() * gymQuotes.length)];
}

export function getDayName(): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
}
