const mongoose = require('mongoose');
const Home = require('../models/home');

const DB_PATH = "mongodb+srv://root:aditya123@keepcoding.xp3rkci.mongodb.net/?retryWrites=true&w=majority&appName=KeepCoding";

const homes = [
  {
    houseName: "Sunset Ridge Farmstay",
    price: 2800,
    location: "Udaipur, Rajasthan",
    rating: 4.7,
    photoUrl: "https://images.pexels.com/photos/2581922/pexels-photo-2581922.jpeg?auto=compress&cs=tinysrgb&w=800",
    description: "A charming farmstay overlooking the Aravalli hills with stunning sunset views."
  },
  {
    houseName: "Tropical Paradise Villa",
    price: 5500,
    location: "Goa, India",
    rating: 4.9,
    photoUrl: "https://images.pexels.com/photos/1488327/pexels-photo-1488327.jpeg?auto=compress&cs=tinysrgb&w=800",
    description: "Luxurious beachfront villa with private pool and tropical garden."
  },
  {
    houseName: "Mountain View Cabin",
    price: 1600,
    location: "Manali, Himachal Pradesh",
    rating: 4.5,
    photoUrl: "https://images.pexels.com/photos/803975/pexels-photo-803975.jpeg?auto=compress&cs=tinysrgb&w=800",
    description: "Cozy wooden cabin with panoramic mountain views and a fireplace."
  },
  {
    houseName: "Royal Heritage Suite",
    price: 7200,
    location: "Jaipur, Rajasthan",
    rating: 4.8,
    photoUrl: "https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg?auto=compress&cs=tinysrgb&w=800",
    description: "Stay in a beautifully restored heritage palace with royal Rajasthani hospitality."
  },
  {
    houseName: "Seaside Cottage",
    price: 3100,
    location: "Pondicherry, India",
    rating: 4.6,
    photoUrl: "https://images.pexels.com/photos/2476632/pexels-photo-2476632.jpeg?auto=compress&cs=tinysrgb&w=800",
    description: "A French-colonial cottage steps away from the beach promenade."
  },
  {
    houseName: "Treehouse Retreat",
    price: 4200,
    location: "Wayanad, Kerala",
    rating: 4.9,
    photoUrl: "https://images.pexels.com/photos/1587300/pexels-photo-1587300.jpeg?auto=compress&cs=tinysrgb&w=800",
    description: "Unique treehouse experience surrounded by lush tea plantations."
  },
  {
    houseName: "Houseboat Deluxe",
    price: 6000,
    location: "Alleppey, Kerala",
    rating: 4.7,
    photoUrl: "https://images.pexels.com/photos/2549018/pexels-photo-2549018.jpeg?auto=compress&cs=tinysrgb&w=800",
    description: "Traditional Kerala houseboat cruise through serene backwaters."
  },
  {
    houseName: "Snow Peak Lodge",
    price: 3500,
    location: "Shimla, Himachal Pradesh",
    rating: 4.4,
    photoUrl: "https://images.pexels.com/photos/754268/pexels-photo-754268.jpeg?auto=compress&cs=tinysrgb&w=800",
    description: "A cozy lodge with snow-capped mountain views and warm interiors."
  },
  {
    houseName: "Desert Camp Luxury",
    price: 4800,
    location: "Jaisalmer, Rajasthan",
    rating: 4.8,
    photoUrl: "https://images.pexels.com/photos/2835436/pexels-photo-2835436.jpeg?auto=compress&cs=tinysrgb&w=800",
    description: "Glamping under the stars in the Thar desert with camel rides."
  },
  {
    houseName: "Riverside Bamboo Hut",
    price: 1900,
    location: "Rishikesh, Uttarakhand",
    rating: 4.6,
    photoUrl: "https://images.pexels.com/photos/2440471/pexels-photo-2440471.jpeg?auto=compress&cs=tinysrgb&w=800",
    description: "Eco-friendly bamboo hut by the Ganges, perfect for yoga and rafting."
  },
  {
    houseName: "Colonial Bungalow",
    price: 3800,
    location: "Ooty, Tamil Nadu",
    rating: 4.5,
    photoUrl: "https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg?auto=compress&cs=tinysrgb&w=800",
    description: "A charming British-era bungalow in the Nilgiri hills with a rose garden."
  },
  {
    houseName: "Cliffside Ocean View",
    price: 8500,
    location: "Goa, India",
    rating: 5.0,
    photoUrl: "https://images.pexels.com/photos/2507010/pexels-photo-2507010.jpeg?auto=compress&cs=tinysrgb&w=800",
    description: "Premium cliffside villa with infinity pool overlooking the Arabian Sea."
  },
  {
    houseName: "Pine Forest Chalet",
    price: 2200,
    location: "Kasol, Himachal Pradesh",
    rating: 4.3,
    photoUrl: "https://images.pexels.com/photos/147411/italy-mountains-dawn-daybreak-147411.jpeg?auto=compress&cs=tinysrgb&w=800",
    description: "A peaceful wooden chalet nestled in the Parvati Valley pine forests."
  },
  {
    houseName: "Lavender Fields Estate",
    price: 4000,
    location: "Coorg, Karnataka",
    rating: 4.7,
    photoUrl: "https://images.pexels.com/photos/1179156/pexels-photo-1179156.jpeg?auto=compress&cs=tinysrgb&w=800",
    description: "Sprawling estate surrounded by coffee plantations and misty hills."
  },
  {
    houseName: "Urban Skyline Penthouse",
    price: 9500,
    location: "Mumbai, Maharashtra",
    rating: 4.9,
    photoUrl: "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800",
    description: "Luxury penthouse with floor-to-ceiling city views and rooftop terrace."
  },
  {
    houseName: "Tea Garden Homestay",
    price: 1500,
    location: "Darjeeling, West Bengal",
    rating: 4.6,
    photoUrl: "https://images.pexels.com/photos/2259917/pexels-photo-2259917.jpeg?auto=compress&cs=tinysrgb&w=800",
    description: "Wake up to Kanchenjunga views and fresh Darjeeling tea every morning."
  }
];

async function seedHomes() {
  try {
    await mongoose.connect(DB_PATH);
    console.log('Connected to MongoDB');

    const count = await Home.countDocuments();
    console.log(`Current homes in database: ${count}`);

    const inserted = await Home.insertMany(homes);
    console.log(`\n✅ Added ${inserted.length} new homes!\n`);

    const total = await Home.countDocuments();
    console.log(`Total homes now: ${total}`);

    process.exit(0);
  } catch (err) {
    console.error('Error seeding homes:', err);
    process.exit(1);
  }
}

seedHomes();
