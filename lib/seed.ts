import type { AppDatabase } from "@/lib/db";
import type { PublicProfile } from "@/lib/types";

type SeedRow = [
  id: string,
  name: string,
  age: number,
  bio: string,
  cityOrCollege: string,
  interests: string[],
  photoIndex: number,
];

const seedRows: SeedRow[] = [
  ["p01", "Maya", 24, "Always ordering one more plate for the table.", "Brooklyn, NY", ["Food spots", "Ceramics", "Long walks"], 12],
  ["p02", "Jordan", 26, "Weekend cyclist, weekday playlist maker.", "Queens, NY", ["Cycling", "Live music", "Coffee"], 13],
  ["p03", "Priya", 23, "I take my bookstore recommendations seriously.", "NYU", ["Books", "Museums", "Cooking"], 14],
  ["p04", "Theo", 25, "Looking for someone to split the crossword with.", "Manhattan, NY", ["Crosswords", "Film", "Bakeries"], 15],
  ["p05", "Leila", 27, "Usually outside if the weather is even a little nice.", "Brooklyn, NY", ["Hiking", "Plants", "Natural wine"], 16],
  ["p06", "Evan", 22, "Amateur pasta maker. The kitchen survives most nights.", "Columbia", ["Pasta", "Running", "Jazz"], 17],
  ["p07", "Sofia", 25, "I know a quiet corner in every crowded city.", "Brooklyn, NY", ["Photography", "Travel", "Tennis"], 18],
  ["p08", "Noah", 28, "Can recommend a movie for any kind of Tuesday.", "NYU", ["Cinema", "Cooking", "Dogs"], 19],
  ["p09", "Amara", 24, "Learning to make my own little traditions.", "Queens, NY", ["Dance", "Museums", "Matcha"], 20],
  ["p10", "Ravi", 26, "In town for the dumplings, staying for the people.", "Manhattan, NY", ["Dumplings", "Climbing", "Podcasts"], 21],
  ["p11", "Clara", 22, "Slow mornings, long novels, very fast walks.", "Brooklyn, NY", ["Reading", "Running", "Art"], 22],
  ["p12", "Miles", 29, "My best plans begin with 'let's see where we end up'.", "Columbia", ["Road trips", "Guitar", "Food"], 23],
  ["p13", "Aisha", 25, "Collecting tiny joys and good soup recipes.", "Queens, NY", ["Cooking", "Gardening", "Comedy"], 24],
  ["p14", "Ben", 23, "Will happily be the designated museum reader.", "NYU", ["Art", "Basketball", "Coffee"], 25],
  ["p15", "Nina", 28, "A little competitive at board games, never at brunch.", "Brooklyn, NY", ["Board games", "Yoga", "Travel"], 26],
  ["p16", "Leo", 24, "Here for a good story and a better taco.", "Manhattan, NY", ["Tacos", "Theater", "Running"], 27],
  ["p17", "Zara", 26, "I bring a book to the park and forget to read it.", "Brooklyn, NY", ["Parks", "Books", "Baking"], 28],
  ["p18", "Owen", 27, "Trying every neighborhood's best breakfast sandwich.", "Queens, NY", ["Brunch", "Cycling", "Music"], 29],
  ["p19", "Mei", 23, "Florals, film photos, and friends around the table.", "Columbia", ["Flowers", "Photography", "Cooking"], 30],
  ["p20", "Sam", 25, "A good walk fixes most things.", "Brooklyn, NY", ["Walking", "Podcasts", "Design"], 31],
  ["p21", "Elena", 29, "I plan trips around the local market.", "Manhattan, NY", ["Travel", "Markets", "Painting"], 32],
  ["p22", "Kai", 22, "Practicing being bad at pottery in public.", "NYU", ["Pottery", "Skating", "Ramen"], 33],
  ["p23", "Grace", 24, "A soft spot for old movies and new restaurants.", "Queens, NY", ["Old movies", "Food", "Museums"], 34],
  ["p24", "Andre", 28, "Every playlist has at least one Stevie Wonder song.", "Brooklyn, NY", ["Music", "Basketball", "Cooking"], 35],
  ["p25", "Lucy", 21, "I make excellent picnic sandwiches. This is useful.", "Columbia", ["Picnics", "Drawing", "Tennis"], 36],
  ["p26", "Mateo", 27, "More likely to be at a gallery than a club.", "Manhattan, NY", ["Art", "Architecture", "Coffee"], 37],
  ["p27", "Imani", 25, "Dancing in the kitchen is a valid workout.", "Brooklyn, NY", ["Dance", "Cooking", "Sewing"], 38],
  ["p28", "Felix", 23, "Always down for a bookstore detour.", "Queens, NY", ["Books", "Climbing", "Film"], 39],
  ["p29", "Hana", 26, "My camera roll is 80% my friends laughing.", "NYU", ["Photography", "Travel", "Tea"], 40],
  ["p30", "Dylan", 24, "I have a very strong opinion about dumplings.", "Brooklyn, NY", ["Dumplings", "Music", "Running"], 41],
  ["p31", "Talia", 28, "Sunday farmer's market, no matter the forecast.", "Manhattan, NY", ["Markets", "Plants", "Yoga"], 42],
  ["p32", "Arjun", 25, "Teaching myself piano one song at a time.", "Columbia", ["Piano", "Food", "Hiking"], 43],
  ["p33", "Ruby", 22, "I keep a running list of tiny neighborhood cafes.", "Queens, NY", ["Coffee", "Writing", "Biking"], 44],
  ["p34", "Caleb", 30, "Good at parallel parking and making breakfast.", "Brooklyn, NY", ["Cooking", "Comedy", "Soccer"], 45],
  ["p35", "Sana", 24, "Making my way through every public garden.", "Manhattan, NY", ["Gardens", "Books", "Sushi"], 46],
  ["p36", "Ezra", 27, "The best plans leave a little room for wandering.", "NYU", ["Travel", "Jazz", "Bouldering"], 47],
];

export const seedProfiles: PublicProfile[] = seedRows.map(
  ([id, name, age, bio, cityOrCollege, interests, photoIndex]) => ({
    id,
    name,
    age,
    photo_url: `https://i.pravatar.cc/900?img=${photoIndex}`,
    bio,
    city_or_college: cityOrCollege,
    interests,
  }),
);

const seededLikes = ["p01", "p02", "p03", "p04", "p05", "p06", "p07", "p08", "p09"];
const seededPasses = ["p10", "p11", "p12"];

function insertSeedData(db: AppDatabase): void {
  const insertProfile = db.prepare(`
    INSERT OR IGNORE INTO profiles
      (id, name, age, photo_url, bio, city_or_college, interests)
    VALUES (@id, @name, @age, @photo_url, @bio, @city_or_college, @interests)
  `);

  for (const profile of seedProfiles) {
    insertProfile.run({
      ...profile,
      interests: JSON.stringify(profile.interests),
    });
  }

  const insertSwipe = db.prepare(`
    INSERT OR IGNORE INTO swipes (swiper_id, target_id, direction)
    VALUES (?, 'me', ?)
  `);
  for (const id of seededLikes) insertSwipe.run(id, "like");
  for (const id of seededPasses) insertSwipe.run(id, "pass");
}

export function seedDatabase(db: AppDatabase): void {
  db.transaction(() => insertSeedData(db))();
}

export function resetDatabase(db: AppDatabase): void {
  db.transaction(() => {
    db.exec("DELETE FROM matches; DELETE FROM swipes;");
    insertSeedData(db);
  })();
}
