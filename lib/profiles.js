// Mock profiles. `likedMe` is SERVER-ONLY and must never be sent to the client.
const NAMES = ["Aanya","Rohan","Meera","Kabir","Isha","Arjun","Naina","Veer","Tara","Dev","Kiara","Aarav","Riya","Zayn","Sana","Ishaan","Diya","Rahul","Anika","Neil","Pooja","Karan","Myra","Yash","Sia","Aditya","Tanvi","Vihaan","Ira","Samar","Leela","Ayaan"];
const PLACES = ["IIT Delhi","Delhi University","Ghaziabad","Noida","Amity University","Jamia Millia","Gurugram","Ashoka University"];
const POOL = ["Music","Cricket","Coding","Travel","Photography","Anime","Chai","Football","Books","Cooking","Gaming","Hiking"];
const BIOS = [
  "Will trade playlists for snacks.",
  "Weekend trekker, weekday overthinker.",
  "Ask me about my unfinished side projects.",
  "Looking for someone to split a dessert with.",
  "Caffeine first, conversation second.",
  "Terrible at texting, great in person.",
  "Film nerd with strong opinions on endings.",
  "Always up for a late-night walk."
];
// Deliberately irregular so position gives nothing away.
export const LIKED_ME = [3, 7, 8, 14, 19, 25, 28];

export const PROFILES = NAMES.map((name, i) => ({
  id: i + 1,
  name,
  age: 19 + ((i * 7) % 10),
  photo: `https://picsum.photos/seed/coy${i + 1}/600/800`,
  bio: BIOS[i % BIOS.length],
  place: PLACES[(i * 3) % PLACES.length],
  interests: [0, 4, 8].map((k) => POOL[(i + k + Math.floor(i / 12)) % POOL.length]),
  likedMe: LIKED_ME.includes(i + 1),
}));

export const toPublic = ({ likedMe, ...rest }) => rest;
