export type Difficulty = "Beginner" | "Intermediate" | "Advanced";

export interface Sign {
  id: string;
  name: string;
  emoji: string;
  category: string;
  difficulty: Difficulty;
  description: string;
  steps: string[];
  mistakes: string[];
  tips: string[];
  practiceCount: number;
  accuracy: number;
  practised: boolean;
}

export const SIGNS: Sign[] = [
  {
    id: "hello",
    name: "Hello",
    emoji: "👋",
    category: "Greetings",
    difficulty: "Beginner",
    description:
      "A warm open-hand greeting used across Singapore Sign Language conversations to start a chat.",
    steps: [
      "Bring your dominant hand up beside your forehead, palm facing forward.",
      "Keep your fingers together and relaxed.",
      "Move the hand outward in a small arc away from your head.",
      "Finish with a friendly smile — expression is part of the sign.",
    ],
    mistakes: [
      "Hand held too low, near the chin instead of the forehead.",
      "Fingers spread wide apart.",
      "Moving the whole arm instead of the forearm.",
    ],
    tips: ["Relax your shoulders", "Keep the movement small and smooth", "Face the camera directly"],
    practiceCount: 24,
    accuracy: 92,
    practised: true,
  },
  {
    id: "water",
    name: "Water",
    emoji: "💧",
    category: "Daily Needs",
    difficulty: "Beginner",
    description: "A handy everyday sign for asking for a drink of water.",
    steps: [
      "Form a 'W' shape with three fingers up.",
      "Bring the index finger side toward your chin.",
      "Tap the chin lightly twice.",
      "Keep your other hand relaxed at your side.",
    ],
    mistakes: ["Tapping the lips instead of the chin", "Using four fingers", "Tapping too hard"],
    tips: ["Two light taps is enough", "Keep the wrist steady"],
    practiceCount: 18,
    accuracy: 84,
    practised: true,
  },
  {
    id: "help",
    name: "Help",
    emoji: "🤝",
    category: "Daily Needs",
    difficulty: "Beginner",
    description: "An important safety sign to request assistance from someone nearby.",
    steps: [
      "Make a fist with your dominant hand, thumb pointing up.",
      "Rest the fist on your flat open non-dominant palm.",
      "Lift both hands upward together a short distance.",
      "Keep eye contact while signing.",
    ],
    mistakes: [
      "Thumb tucked inside the fist.",
      "Lifting only the top hand.",
      "Holding hands too close to the body.",
    ],
    tips: ["Both hands move as one unit", "Keep the supporting palm flat"],
    practiceCount: 11,
    accuracy: 71,
    practised: true,
  },
  {
    id: "eat",
    name: "Eat",
    emoji: "🍚",
    category: "Food",
    difficulty: "Beginner",
    description: "Used to talk about meals, hunger, or inviting someone to eat together.",
    steps: [
      "Pinch your fingertips together as if holding a small snack.",
      "Bring the fingertips toward your mouth.",
      "Tap gently near the lips twice.",
      "Keep the elbow low and comfortable.",
    ],
    mistakes: ["Opening the hand mid-way", "Touching the nose instead of the mouth"],
    tips: ["Think of bringing food to your mouth", "Small, repeated motion"],
    practiceCount: 15,
    accuracy: 88,
    practised: true,
  },
  {
    id: "thank-you",
    name: "Thank You",
    emoji: "🙏",
    category: "Greetings",
    difficulty: "Beginner",
    description: "A polite sign to show appreciation after someone helps you.",
    steps: [
      "Place the fingertips of your flat hand near your chin.",
      "Palm faces inward toward you.",
      "Move the hand forward and slightly down toward the person.",
      "Add a nod and a smile.",
    ],
    mistakes: ["Starting from the forehead (that reads differently)", "Rushing the outward motion"],
    tips: ["Move toward the person you thank", "Facial expression matters"],
    practiceCount: 21,
    accuracy: 95,
    practised: true,
  },
  {
    id: "friend",
    name: "Friend",
    emoji: "🧑‍🤝‍🧑",
    category: "People",
    difficulty: "Intermediate",
    description: "Two hooked index fingers linking together, like two people connected.",
    steps: [
      "Hook both index fingers into curved shapes.",
      "Link the dominant finger over the other.",
      "Swap so the other finger sits on top.",
      "Keep the hands at chest height.",
    ],
    mistakes: ["Only hooking once", "Fingers too straight", "Hands drifting below the chest"],
    tips: ["Alternate the hooking twice", "Keep it in your signing space"],
    practiceCount: 7,
    accuracy: 64,
    practised: true,
  },
  {
    id: "family",
    name: "Family",
    emoji: "👨‍👩‍👧",
    category: "People",
    difficulty: "Intermediate",
    description: "A circular sign showing a group of people belonging together.",
    steps: [
      "Form the letter 'F' with both hands.",
      "Start with the hands touching in front of you.",
      "Circle both hands outward and around.",
      "Bring the pinky sides together to close the circle.",
    ],
    mistakes: ["Circle too large", "Hands not meeting at the end"],
    tips: ["Draw a neat, small circle", "Keep both hands level"],
    practiceCount: 5,
    accuracy: 58,
    practised: true,
  },
  {
    id: "school",
    name: "School",
    emoji: "🏫",
    category: "Places",
    difficulty: "Intermediate",
    description: "Two clapping flat hands, like a teacher calling the class to attention.",
    steps: [
      "Hold your non-dominant hand flat, palm up.",
      "Clap your dominant flat hand on top.",
      "Repeat the clap twice.",
      "Keep the motion crisp and light.",
    ],
    mistakes: ["Clapping with cupped hands", "Only one clap"],
    tips: ["Light, quick taps", "Keep the base hand still"],
    practiceCount: 3,
    accuracy: 52,
    practised: true,
  },
  {
    id: "sorry",
    name: "Sorry",
    emoji: "😔",
    category: "Greetings",
    difficulty: "Beginner",
    description: "A circular motion over the chest to express apology.",
    steps: [
      "Make a fist with your dominant hand.",
      "Place it over the centre of your chest.",
      "Rub in a slow circular motion.",
      "Show an apologetic facial expression.",
    ],
    mistakes: ["Rubbing too fast", "Using an open palm"],
    tips: ["Slow circles read as sincere", "Match your face to the message"],
    practiceCount: 0,
    accuracy: 0,
    practised: false,
  },
  {
    id: "toilet",
    name: "Toilet",
    emoji: "🚻",
    category: "Daily Needs",
    difficulty: "Beginner",
    description: "A practical everyday sign for asking where the toilet is.",
    steps: [
      "Form the letter 'T' with your dominant hand.",
      "Hold it up at shoulder height.",
      "Shake the hand side to side a few times.",
      "Keep the elbow tucked in.",
    ],
    mistakes: ["Shaking up and down", "Thumb hidden behind fingers"],
    tips: ["Small, quick shakes", "Keep the handshape clear"],
    practiceCount: 0,
    accuracy: 0,
    practised: false,
  },
  {
    id: "learn",
    name: "Learn",
    emoji: "📚",
    category: "School",
    difficulty: "Intermediate",
    description: "Taking knowledge from a page and placing it into your head.",
    steps: [
      "Hold your non-dominant hand flat like an open book.",
      "Grab from the palm with your dominant fingertips.",
      "Lift the closed fingertips toward your forehead.",
      "Touch lightly at the temple.",
    ],
    mistakes: ["Not closing the fingers when lifting", "Touching the top of the head"],
    tips: ["Grab, then lift", "One smooth movement"],
    practiceCount: 2,
    accuracy: 45,
    practised: false,
  },
  {
    id: "again",
    name: "Again",
    emoji: "🔁",
    category: "Conversation",
    difficulty: "Beginner",
    description: "Useful for asking someone to repeat what they just signed.",
    steps: [
      "Hold your non-dominant hand flat, palm up.",
      "Curve your dominant hand into a bent shape.",
      "Rotate it over and touch the flat palm.",
      "Repeat once if needed.",
    ],
    mistakes: ["Flat dominant hand instead of bent", "Missing the palm contact"],
    tips: ["The contact point matters", "Keep the base hand steady"],
    practiceCount: 9,
    accuracy: 77,
    practised: true,
  },
  {
    id: "understand",
    name: "Understand",
    emoji: "💡",
    category: "Conversation",
    difficulty: "Advanced",
    description: "A small flick near the forehead, like a lightbulb switching on.",
    steps: [
      "Make a fist near your temple, index finger tucked.",
      "Flick the index finger upward.",
      "Keep the rest of the hand still.",
      "Raise your eyebrows to show comprehension.",
    ],
    mistakes: ["Whole hand opening", "Flicking too far from the head"],
    tips: ["Only the index finger moves", "Keep it close to the temple"],
    practiceCount: 1,
    accuracy: 38,
    practised: false,
  },
  {
    id: "name",
    name: "Name",
    emoji: "🪪",
    category: "Conversation",
    difficulty: "Intermediate",
    description: "Tapping two fingers together, used when introducing yourself.",
    steps: [
      "Extend the index and middle fingers on both hands.",
      "Cross the dominant fingers over the other.",
      "Tap twice at the crossing point.",
      "Keep hands in front of your chest.",
    ],
    mistakes: ["Using three fingers", "Tapping only once"],
    tips: ["Crisp double tap", "Fingers stay straight"],
    practiceCount: 6,
    accuracy: 69,
    practised: true,
  },
  {
    id: "good-morning",
    name: "Good Morning",
    emoji: "🌅",
    category: "Greetings",
    difficulty: "Intermediate",
    description: "A two-part sign combining 'good' and a rising sun motion.",
    steps: [
      "Touch your flat hand to your chin for 'good'.",
      "Lower it onto your other open palm.",
      "Rest your non-dominant arm across your body.",
      "Raise your dominant forearm like a rising sun.",
    ],
    mistakes: ["Skipping the 'good' portion", "Raising the arm too quickly"],
    tips: ["Two clear parts", "Let the sun rise slowly"],
    practiceCount: 4,
    accuracy: 61,
    practised: true,
  },
  {
    id: "please",
    name: "Please",
    emoji: "🫶",
    category: "Greetings",
    difficulty: "Beginner",
    description: "A polite circular rub on the chest when making a request.",
    steps: [
      "Place your flat open palm on your chest.",
      "Rub in a smooth circular motion.",
      "Keep the fingers together.",
      "Pair it with a gentle expression.",
    ],
    mistakes: ["Using a fist (that reads as 'sorry')", "Circles too wide"],
    tips: ["Open palm, not a fist", "Slow and steady"],
    practiceCount: 0,
    accuracy: 0,
    practised: false,
  },
];

export const CATEGORIES = ["Greetings", "Daily Needs", "Food", "People", "Places", "School", "Conversation"];

export const COACH_LINES = [
  "Ready hands? Let's learn something new today!",
  "Great attempt! That was smooth.",
  "Your streak is growing!",
  "Keep both hands visible.",
  "Mistakes help you learn.",
  "You beat your best score!",
];

export interface SessionEntry {
  id: string;
  date: string;
  mode: string;
  score: number;
  accuracy: number;
  duration: string;
  signsCompleted: number;
}

export const SESSION_HISTORY: SessionEntry[] = [
  { id: "s1", date: "Mon, 20 Jul", mode: "Arcade", score: 1840, accuracy: 91, duration: "6m 12s", signsCompleted: 14 },
  { id: "s2", date: "Sun, 19 Jul", mode: "Practice", score: 960, accuracy: 84, duration: "9m 40s", signsCompleted: 11 },
  { id: "s3", date: "Sat, 18 Jul", mode: "Arcade", score: 2110, accuracy: 88, duration: "7m 02s", signsCompleted: 17 },
  { id: "s4", date: "Fri, 17 Jul", mode: "Daily Challenge", score: 1420, accuracy: 79, duration: "4m 55s", signsCompleted: 9 },
  { id: "s5", date: "Thu, 16 Jul", mode: "Practice", score: 780, accuracy: 73, duration: "8m 18s", signsCompleted: 8 },
  { id: "s6", date: "Wed, 15 Jul", mode: "Arcade", score: 1650, accuracy: 86, duration: "6m 44s", signsCompleted: 13 },
];

export const WEEKLY_ACCURACY = [
  { day: "Mon", value: 72 },
  { day: "Tue", value: 78 },
  { day: "Wed", value: 86 },
  { day: "Thu", value: 73 },
  { day: "Fri", value: 79 },
  { day: "Sat", value: 88 },
  { day: "Sun", value: 91 },
];

export const DAILY_MINUTES = [
  { day: "Mon", value: 12 },
  { day: "Tue", value: 8 },
  { day: "Wed", value: 18 },
  { day: "Thu", value: 6 },
  { day: "Fri", value: 14 },
  { day: "Sat", value: 22 },
  { day: "Sun", value: 16 },
];

export const RECENT_ACTIVITY = [
  { id: "a1", icon: "🏅", title: "Earned the 7-day streak badge", time: "Today, 9:12am" },
  { id: "a2", icon: "🎯", title: "Practised “Thank You” with 95% accuracy", time: "Today, 8:50am" },
  { id: "a3", icon: "🕹️", title: "Arcade session — 1,840 points", time: "Yesterday, 7:30pm" },
  { id: "a4", icon: "📚", title: "Added “Family” to favourites", time: "Yesterday, 6:04pm" },
];

export const BADGES = [
  { id: "b1", label: "7-Day Streak", emoji: "🔥", earned: true },
  { id: "b2", label: "First 10 Signs", emoji: "🌟", earned: true },
  { id: "b3", label: "Combo Master", emoji: "⚡", earned: true },
  { id: "b4", label: "Perfect Wave", emoji: "🏆", earned: false },
  { id: "b5", label: "Library Explorer", emoji: "🗺️", earned: false },
];
