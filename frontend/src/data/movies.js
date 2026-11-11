// TEMPORARY MOCK DATA — used only when VITE_API_URL is not configured.
// Replace by connecting a real backend; see src/services/movieService.js.
import ironDominion from "@/assets/posters/iron-dominion.jpg";
import eventHorizon from "@/assets/posters/event-horizon.jpg";
import lostKingdom from "@/assets/posters/lost-kingdom.jpg";
import skyPals from "@/assets/posters/sky-pals.jpg";
import hollowHouse from "@/assets/posters/hollow-house.jpg";
import roadTripped from "@/assets/posters/road-tripped.jpg";
import lastNocturne from "@/assets/posters/last-nocturne.jpg";
import silentWitness from "@/assets/posters/silent-witness.jpg";
import theDeep from "@/assets/posters/the-deep.jpg";
import midnightHeist from "@/assets/posters/midnight-heist.jpg";
import neonProtocol from "@/assets/posters/neon-protocol.jpg";
import summerOfUs from "@/assets/posters/summer-of-us.jpg";
import stormblade from "@/assets/posters/stormblade.jpg";
import crownOfAsh from "@/assets/posters/crown-of-ash.jpg";
import ghostSignal from "@/assets/posters/ghost-signal.jpg";
import avengersEndgame from "@/assets/posters/avengers-endgame.jpg";
import spiderMan from "@/assets/posters/spider-man.jpg";
import featuredBanner from "@/assets/featured-banner.jpg";

export const GENRES = [
  "All Movies",
  "Action",
  "Adventure",
  "Comedy",
  "Drama",
  "Thriller",
  "Sci-Fi",
  "Animation",
  "Horror",
];

export const CITIES = [
  "Mumbai",
  "Delhi NCR",
  "Bengaluru",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Pune",
  "Ahmedabad",
  "Jaipur",
  "Kochi",
];

export const SHOWTIMES = ["10:15 AM", "1:30 PM", "4:45 PM", "7:30 PM", "10:40 PM"];

export const CINEMAS = [
  "LUMIÈRE Grand — IMAX Laser",
  "LUMIÈRE Royale — VIP Recliner",
  "LUMIÈRE Atmos — Dolby 360",
];

export const FEATURED = {
  id: "astral-frontier",
  title: "The Astral Frontier",
  backdrop: featuredBanner,
  genres: ["Sci-Fi", "Adventure"],
  duration: "2h 38m",
  releaseDate: "Now in IMAX",
  year: 2026,
  rating: 8.9,
  age: "UA 13+",
  description:
    "Stranded on a dying moon beneath a ringed giant, a lone pilot must cross a thousand miles of red desert to bring humanity's last signal home.",
};

export const MOVIES = [
  {
    id: "avengers-endgame",
    title: "Avengers: Endgame",
    poster: avengersEndgame,
    genres: ["Action", "Sci-Fi", "Adventure"],
    duration: "3h 02m",
    language: "English",
    rating: 8.4,
    age: "UA 13+",
    year: 2026,
    status: "now",
    trending: true,
    description:
      "After the devastating events of Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more to reverse Thanos' actions and restore balance to the universe.",
  },
  {
    id: "spider-man",
    title: "Spider-Man: No Way Home",
    poster: spiderMan,
    genres: ["Action", "Adventure", "Sci-Fi"],
    duration: "2h 28m",
    language: "English",
    rating: 8.2,
    age: "UA 13+",
    year: 2026,
    status: "now",
    trending: true,
    description:
      "With Spider-Man's identity now revealed, Peter asks Doctor Strange for help. When a spell goes wrong, dangerous foes from other worlds start to appear, forcing Peter to discover what it truly means to be Spider-Man.",
  },
  {
    id: "iron-dominion",
    title: "Iron Dominion",
    poster: ironDominion,
    genres: ["Action", "Thriller"],
    duration: "2h 21m",
    language: "English",
    rating: 8.4,
    age: "UA 16+",
    year: 2026,
    status: "now",
    trending: true,
    description:
      "A disgraced soldier returns to a city ruled by the regime he once served — and starts a war to take it back.",
  },
  {
    id: "event-horizon-zero",
    title: "Event Horizon Zero",
    poster: eventHorizon,
    genres: ["Sci-Fi", "Adventure"],
    duration: "2h 44m",
    language: "English",
    rating: 9.1,
    age: "UA 13+",
    year: 2026,
    status: "now",
    trending: true,
    description:
      "An astronaut drifts toward a black hole carrying the only message that can save her crew from collapse.",
  },
  {
    id: "lost-kingdom",
    title: "Lost Kingdom",
    poster: lostKingdom,
    genres: ["Adventure", "Action"],
    duration: "2h 12m",
    language: "English",
    rating: 7.9,
    age: "U",
    year: 2026,
    status: "now",
    trending: true,
    description:
      "A team of explorers chases a golden legend across collapsing bridges, hidden jungles and ancient traps.",
  },
  {
    id: "sky-pals",
    title: "Sky Pals",
    poster: skyPals,
    genres: ["Animation", "Comedy"],
    duration: "1h 38m",
    language: "English",
    rating: 8.2,
    age: "U",
    year: 2026,
    status: "now",
    description:
      "A fox, a robot and a nervous penguin sail a paper boat across the clouds to find their way home.",
  },
  {
    id: "the-hollow-house",
    title: "The Hollow House",
    poster: hollowHouse,
    genres: ["Horror", "Thriller"],
    duration: "1h 52m",
    language: "English",
    rating: 7.6,
    age: "A",
    year: 2026,
    status: "now",
    trending: true,
    description:
      "A family moves into a Victorian home where one window never goes dark — and something waits behind it.",
  },
  {
    id: "road-tripped",
    title: "Road Tripped",
    poster: roadTripped,
    genres: ["Comedy"],
    duration: "1h 46m",
    language: "Hindi",
    rating: 7.4,
    age: "UA 7+",
    year: 2026,
    status: "now",
    description:
      "Three friends, one tiny car and zero plans on a chaotic cross-country trip to a wedding they're late for.",
  },
  {
    id: "last-nocturne",
    title: "Last Nocturne",
    poster: lastNocturne,
    genres: ["Drama"],
    duration: "2h 05m",
    language: "English",
    rating: 8.8,
    age: "UA 13+",
    year: 2026,
    status: "now",
    description:
      "A legendary pianist prepares one final concert while confronting the memories he composed to forget.",
  },
  {
    id: "silent-witness",
    title: "Silent Witness",
    poster: silentWitness,
    genres: ["Thriller", "Drama"],
    duration: "2h 02m",
    language: "Tamil",
    rating: 8.5,
    age: "UA 16+",
    year: 2026,
    status: "now",
    trending: true,
    description:
      "A detective realises the only witness to a murder might be the version of himself he left behind.",
  },
  {
    id: "the-deep",
    title: "The Deep",
    poster: theDeep,
    genres: ["Adventure", "Drama"],
    duration: "1h 58m",
    language: "English",
    rating: 8.7,
    age: "U",
    year: 2026,
    status: "now",
    description:
      "A free diver forms an unlikely bond with a glowing humpback whale in the deepest trench on Earth.",
  },
  {
    id: "midnight-heist",
    title: "Midnight Heist",
    poster: midnightHeist,
    genres: ["Action", "Thriller", "Comedy"],
    duration: "2h 09m",
    language: "Telugu",
    rating: 8.0,
    age: "UA 13+",
    year: 2026,
    status: "now",
    trending: true,
    description:
      "Four strangers, one impossible vault and a single night to pull off the greatest casino robbery ever.",
  },
  {
    id: "neon-protocol",
    title: "Neon Protocol",
    poster: neonProtocol,
    genres: ["Sci-Fi", "Action"],
    releaseDate: "12 Dec 2026",
    language: "English",
    rating: null,
    age: "UA 13+",
    year: 2026,
    status: "soon",
    description:
      "When a city-sized mech wakes up without orders, one engineer must decide who it should obey.",
  },
  {
    id: "stormblade",
    title: "Stormblade",
    poster: stormblade,
    genres: ["Action", "Drama"],
    releaseDate: "19 Dec 2026",
    language: "Japanese",
    rating: null,
    age: "A",
    year: 2026,
    status: "soon",
    description:
      "A masterless samurai wields a blade forged from lightning to defend the castle that exiled him.",
  },
  {
    id: "crown-of-ash",
    title: "Crown of Ash",
    poster: crownOfAsh,
    genres: ["Adventure", "Drama"],
    releaseDate: "25 Dec 2026",
    language: "English",
    rating: null,
    age: "UA 16+",
    year: 2026,
    status: "soon",
    description:
      "A young queen rides against a dragon-backed empire to reclaim a kingdom already in flames.",
  },
  {
    id: "ghost-signal",
    title: "Ghost Signal",
    poster: ghostSignal,
    genres: ["Horror", "Sci-Fi"],
    releaseDate: "09 Jan 2027",
    language: "English",
    rating: null,
    age: "A",
    year: 2027,
    status: "soon",
    description:
      "An arctic radio station receives a broadcast from a team that vanished forty years ago.",
  },
  {
    id: "summer-of-us",
    title: "Summer of Us",
    poster: summerOfUs,
    genres: ["Drama"],
    releaseDate: "14 Feb 2027",
    language: "English",
    rating: null,
    age: "UA 7+",
    year: 2027,
    status: "soon",
    description:
      "Two strangers share one golden summer on the Mediterranean coast before life pulls them apart.",
  },
];
