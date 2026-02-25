const mongoose = require('mongoose');
const Experience = require('../models/experience');

// Use the exact database URL from the user's files
const DB_PATH = "mongodb+srv://root:aditya123@keepcoding.xp3rkci.mongodb.net/?retryWrites=true&w=majority&appName=KeepCoding";

const experiences = [
  // Adventure
  { title: "Himalayan Trekking Expedition", host: "Manoj Singh", category: "Adventure", price: 8500, duration: "3 days", location: "Manali, Himachal Pradesh", rating: 4.9, photoUrl: "https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=600", isPopular: true },
  { title: "White Water Rafting", host: "Ganga Riversports", category: "Adventure", price: 2500, duration: "4 hours", location: "Rishikesh, Uttarakhand", rating: 4.8, photoUrl: "https://images.pexels.com/photos/9508381/pexels-photo-9508381.jpeg?auto=compress&cs=tinysrgb&w=600", isPopular: true },
  { title: "Paragliding over Solang Valley", host: "SkyRiders", category: "Adventure", price: 3000, duration: "2 hours", location: "Manali, Himachal Pradesh", rating: 4.7, photoUrl: "https://images.pexels.com/photos/3411135/pexels-photo-3411135.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { title: "Jungle Safari & Camping", host: "WildTrails", category: "Adventure", price: 5500, duration: "2 days", location: "Jim Corbett, Uttarakhand", rating: 4.8, photoUrl: "https://images.pexels.com/photos/1319515/pexels-photo-1319515.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { title: "Scuba Diving Experience", host: "Andaman Aquatics", category: "Adventure", price: 6000, duration: "5 hours", location: "Havelock Island, Andaman", rating: 4.9, photoUrl: "https://images.pexels.com/photos/10123018/pexels-photo-10123018.jpeg?auto=compress&cs=tinysrgb&w=600", isPopular: true },

  // Food & Drink
  { title: "Street Food Tour", host: "Karan Verma", category: "Food & Drink", price: 1500, duration: "3 hours", location: "Old Delhi", rating: 4.8, photoUrl: "https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=600", isPopular: true },
  { title: "Authentic Rajasthani Cooking Class", host: "Meera Devi", category: "Food & Drink", price: 2000, duration: "4 hours", location: "Jaipur, Rajasthan", rating: 4.9, photoUrl: "https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=600", isPopular: true },
  { title: "Vineyard Tour & Wine Tasting", host: "Sula Estates", category: "Food & Drink", price: 3500, duration: "5 hours", location: "Nashik, Maharashtra", rating: 4.7, photoUrl: "https://images.pexels.com/photos/1105189/pexels-photo-1105189.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { title: "Kerala Spice Plantation Walk", host: "Rajesh K.", category: "Food & Drink", price: 1200, duration: "2 hours", location: "Munnar, Kerala", rating: 4.6, photoUrl: "https://images.pexels.com/photos/4033036/pexels-photo-4033036.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { title: "Midnight Biryani Trail", host: "Hyderabadi Foodies", category: "Food & Drink", price: 1800, duration: "3 hours", location: "Hyderabad, Telangana", rating: 4.8, photoUrl: "https://images.pexels.com/photos/12737656/pexels-photo-12737656.jpeg?auto=compress&cs=tinysrgb&w=600" },

  // Art & Culture
  { title: "Taj Mahal Guided Sunrise Tour", host: "Anwar Ali", category: "Art & Culture", price: 2500, duration: "4 hours", location: "Agra, UP", rating: 5.0, photoUrl: "https://images.pexels.com/photos/1603650/pexels-photo-1603650.jpeg?auto=compress&cs=tinysrgb&w=600", isPopular: true },
  { title: "Pottery Making Workshop", host: "Clay Arts Studio", category: "Art & Culture", price: 1500, duration: "3 hours", location: "Mumbai, Maharashtra", rating: 4.7, photoUrl: "https://images.pexels.com/photos/4196417/pexels-photo-4196417.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { title: "Heritage Walk of South Mumbai", host: "Mumbai Walks", category: "Art & Culture", price: 1200, duration: "2.5 hours", location: "Mumbai, Maharashtra", rating: 4.8, photoUrl: "https://images.pexels.com/photos/4180479/pexels-photo-4180479.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { title: "Classical Block Printing Class", host: "Anokhi Craft", category: "Art & Culture", price: 2000, duration: "4 hours", location: "Jaipur, Rajasthan", rating: 4.9, photoUrl: "https://images.pexels.com/photos/4222045/pexels-photo-4222045.jpeg?auto=compress&cs=tinysrgb&w=600", isPopular: true },
  { title: "Temple Architecture Tour", host: "South Indian History", category: "Art & Culture", price: 1800, duration: "3 hours", location: "Madurai, Tamil Nadu", rating: 4.8, photoUrl: "https://images.pexels.com/photos/14704383/pexels-photo-14704383.jpeg?auto=compress&cs=tinysrgb&w=600" },

  // Wellness
  { title: "Sunrise Yoga Retreat", host: "Asha Wellness", category: "Wellness", price: 1500, duration: "2 hours", location: "Rishikesh, Uttarakhand", rating: 4.9, photoUrl: "https://images.pexels.com/photos/1051838/pexels-photo-1051838.jpeg?auto=compress&cs=tinysrgb&w=600", isPopular: true },
  { title: "Ayurvedic Spa Day", host: "Kerala Ayurveda", category: "Wellness", price: 4500, duration: "6 hours", location: "Kochi, Kerala", rating: 4.8, photoUrl: "https://images.pexels.com/photos/3764568/pexels-photo-3764568.jpeg?auto=compress&cs=tinysrgb&w=600", isPopular: true },
  { title: "Vipassana Meditation Intro", host: "Dharma Center", category: "Wellness", price: 1000, duration: "3 hours", location: "Igatpuri, Maharashtra", rating: 4.7, photoUrl: "https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { title: "Holistic Sound Healing", host: "Mystic Chords", category: "Wellness", price: 2000, duration: "2 hours", location: "Goa, India", rating: 4.8, photoUrl: "https://images.pexels.com/photos/6265147/pexels-photo-6265147.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { title: "Forest Bathing & Mindfulness", host: "Nature Within", category: "Wellness", price: 1800, duration: "4 hours", location: "Coorg, Karnataka", rating: 4.9, photoUrl: "https://images.pexels.com/photos/808510/pexels-photo-808510.jpeg?auto=compress&cs=tinysrgb&w=600" },

  // Nature
  { title: "Tea Estate Walking Tour", host: "Tata Estates", category: "Nature", price: 1200, duration: "3 hours", location: "Darjeeling, West Bengal", rating: 4.8, photoUrl: "https://images.pexels.com/photos/1230157/pexels-photo-1230157.jpeg?auto=compress&cs=tinysrgb&w=600", isPopular: true },
  { title: "Backwaters Houseboat Cruise", host: "Kerala Tours", category: "Nature", price: 6500, duration: "Full day", location: "Alleppey, Kerala", rating: 4.9, photoUrl: "https://images.pexels.com/photos/6620573/pexels-photo-6620573.jpeg?auto=compress&cs=tinysrgb&w=600", isPopular: true },
  { title: "Bird Watching at Keoladeo", host: "Nature Sight", category: "Nature", price: 1500, duration: "4 hours", location: "Bharatpur, Rajasthan", rating: 4.6, photoUrl: "https://images.pexels.com/photos/326900/pexels-photo-326900.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { title: "Desert Camel Safari", host: "Thar Adventures", category: "Nature", price: 2500, duration: "5 hours", location: "Jaisalmer, Rajasthan", rating: 4.7, photoUrl: "https://images.pexels.com/photos/5431631/pexels-photo-5431631.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { title: "Bioluminescent Beach Walk", host: "Ocean Guides", category: "Nature", price: 2000, duration: "2 hours", location: "Gokarna, Karnataka", rating: 4.8, photoUrl: "https://images.pexels.com/photos/7454992/pexels-photo-7454992.jpeg?auto=compress&cs=tinysrgb&w=600" },

  // Music
  { title: "Tabla & Sitar Masterclass", host: "Pandit Ravi", category: "Music", price: 2500, duration: "2 hours", location: "Varanasi, UP", rating: 4.9, photoUrl: "https://images.pexels.com/photos/8157790/pexels-photo-8157790.jpeg?auto=compress&cs=tinysrgb&w=600", isPopular: true },
  { title: "Sufi Music Night", host: "Nizamuddin Dargah", category: "Music", price: 1000, duration: "3 hours", location: "New Delhi", rating: 4.8, photoUrl: "https://images.pexels.com/photos/10103099/pexels-photo-10103099.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { title: "Bollywood Dance Workshop", host: "Dance India", category: "Music", price: 1500, duration: "2.5 hours", location: "Mumbai, Maharashtra", rating: 4.7, photoUrl: "https://images.pexels.com/photos/270789/pexels-photo-270789.jpeg?auto=compress&cs=tinysrgb&w=600", isPopular: true },
  { title: "Carnatic Vocal Lesson", host: "Saraswati Iyer", category: "Music", price: 1200, duration: "1.5 hours", location: "Chennai, Tamil Nadu", rating: 4.8, photoUrl: "https://images.pexels.com/photos/8040003/pexels-photo-8040003.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { title: "Live Indie Music Gig Tour", host: "Gig Explorers", category: "Music", price: 2000, duration: "4 hours", location: "Pune, Maharashtra", rating: 4.6, photoUrl: "https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=600" },

  // Sports
  { title: "Surfing Lessons", host: "Mantra Surf Club", category: "Sports", price: 3000, duration: "2.5 hours", location: "Mangalore, Karnataka", rating: 4.8, photoUrl: "https://images.pexels.com/photos/8711422/pexels-photo-8711422.jpeg?auto=compress&cs=tinysrgb&w=600", isPopular: true },
  { title: "Cricket Coaching Session", host: "Sports Academy", category: "Sports", price: 1500, duration: "2 hours", location: "Bangalore, Karnataka", rating: 4.7, photoUrl: "https://images.pexels.com/photos/3628912/pexels-photo-3628912.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { title: "Mountain Biking Trail", host: "Himalayan MTB", category: "Sports", price: 2500, duration: "4 hours", location: "Shimla, Himachal Pradesh", rating: 4.9, photoUrl: "https://images.pexels.com/photos/1546035/pexels-photo-1546035.jpeg?auto=compress&cs=tinysrgb&w=600", isPopular: true },
  { title: "Scuba Certification Intro", host: "Dive India", category: "Sports", price: 5000, duration: "Half day", location: "Goa, India", rating: 4.8, photoUrl: "https://images.pexels.com/photos/10123018/pexels-photo-10123018.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { title: "Golf Course Access & Pro Tips", host: "Delhi Golf Club", category: "Sports", price: 4000, duration: "3 hours", location: "New Delhi", rating: 4.6, photoUrl: "https://images.pexels.com/photos/114979/pexels-photo-114979.jpeg?auto=compress&cs=tinysrgb&w=600" },

  // Nightlife
  { title: "Pub Crawl Adventure", host: "Party Masters", category: "Nightlife", price: 2500, duration: "4 hours", location: "Goa, India", rating: 4.8, photoUrl: "https://images.pexels.com/photos/1587927/pexels-photo-1587927.jpeg?auto=compress&cs=tinysrgb&w=600", isPopular: true },
  { title: "Rooftop Bar Hopping", host: "Mumbai Nights", category: "Nightlife", price: 3500, duration: "3 hours", location: "Mumbai, Maharashtra", rating: 4.7, photoUrl: "https://images.pexels.com/photos/331107/pexels-photo-331107.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { title: "Neon Bowling Night out", host: "Strike Zone", category: "Nightlife", price: 1500, duration: "2 hours", location: "Bangalore, Karnataka", rating: 4.6, photoUrl: "https://images.pexels.com/photos/4198522/pexels-photo-4198522.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { title: "Live Comedy Club Experience", host: "Laugh Store", category: "Nightlife", price: 1000, duration: "2 hours", location: "New Delhi", rating: 4.9, photoUrl: "https://images.pexels.com/photos/713149/pexels-photo-713149.jpeg?auto=compress&cs=tinysrgb&w=600", isPopular: true },
  { title: "Late Night Street Food Drive", host: "Night Riders", category: "Nightlife", price: 2000, duration: "3 hours", location: "Pune, Maharashtra", rating: 4.8, photoUrl: "https://images.pexels.com/photos/12737656/pexels-photo-12737656.jpeg?auto=compress&cs=tinysrgb&w=600" }
];

async function seedExperiences() {
  try {
    // Need this explicitly for TLS with Node 22+ to avoid SSL Handshake error on local dev vs Atlas mapping
    process.env.NODE_OPTIONS = '--tls-min-v1.0';
    
    await mongoose.connect(DB_PATH);
    console.log('Connected to MongoDB');

    const count = await Experience.countDocuments();
    if (count > 0) {
      console.log(`Already have ${count} experiences. Clearing...`);
      await Experience.deleteMany({});
    }

    const inserted = await Experience.insertMany(experiences);
    console.log(`\n✅ Added ${inserted.length} experiences!\n`);

    // Summary
    const categories = [...new Set(services.map(s => s.category))]; // We map experiences dynamically below
    const catsInDb = [...new Set(experiences.map(s => s.category))];
    catsInDb.forEach(cat => {
      const num = experiences.filter(s => s.category === cat).length;
      console.log(`  ${cat}: ${num} experiences`);
    });

    process.exit(0);
  } catch (err) {
    console.error('Error seeding experiences:', err);
    process.exit(1);
  }
}

seedExperiences();
