const mongoose = require('mongoose');
const Home = require('../models/home');
const Booking = require('../models/booking');

const DB_PATH = "mongodb+srv://root:aditya123@keepcoding.xp3rkci.mongodb.net/?retryWrites=true&w=majority&appName=KeepCoding";

async function seedAll() {
  try {
    await mongoose.connect(DB_PATH);
    console.log('Connected to MongoDB');

    // Seed sample homes first
    const existingHomes = await Home.find();
    let homes = existingHomes;

    if (existingHomes.length === 0) {
      console.log('No homes found. Creating sample homes...');
      homes = await Home.insertMany([
        {
          houseName: "Cozy Mountain Retreat",
          price: 2500,
          location: "Manali, Himachal Pradesh",
          rating: 4.8,
          photoUrl: "https://images.pexels.com/photos/2034335/pexels-photo-2034335.jpeg?cs=srgb&dl=architecture-building-chairs-2034335.jpg&fm=jpg",
          description: "A cozy mountain retreat with stunning views of the Himalayas. Perfect for a weekend getaway."
        },
        {
          houseName: "Beachfront Villa",
          price: 4500,
          location: "Goa, India",
          rating: 4.5,
          photoUrl: "https://images.pexels.com/photos/1268871/pexels-photo-1268871.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
          description: "Luxury beachfront villa with private pool and direct beach access."
        },
        {
          houseName: "Heritage Haveli",
          price: 3200,
          location: "Jaipur, Rajasthan",
          rating: 4.6,
          photoUrl: "https://images.pexels.com/photos/3225531/pexels-photo-3225531.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
          description: "A beautifully restored heritage haveli in the heart of the Pink City."
        },
        {
          houseName: "Lakeside Cottage",
          price: 1800,
          location: "Nainital, Uttarakhand",
          rating: 4.3,
          photoUrl: "https://images.pexels.com/photos/2581922/pexels-photo-2581922.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
          description: "A charming lakeside cottage with panoramic views of Naini Lake."
        }
      ]);
      console.log(`Created ${homes.length} sample homes`);
    } else {
      console.log(`Found ${existingHomes.length} existing homes`);
    }

    // Clear existing bookings
    await Booking.deleteMany({});
    console.log('Cleared existing bookings');

    // Create sample bookings
    const today = new Date();
    const sampleBookings = [
      {
        houseId: homes[0]._id,
        checkIn: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000),
        checkOut: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000),
        guests: 2
      },
      {
        houseId: homes[1 % homes.length]._id,
        checkIn: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
        checkOut: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000),
        guests: 4
      },
      {
        houseId: homes[2 % homes.length]._id,
        checkIn: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000),
        checkOut: new Date(today.getTime() + 18 * 24 * 60 * 60 * 1000),
        guests: 3
      }
    ];

    const created = await Booking.insertMany(sampleBookings);
    console.log(`\nSuccessfully created ${created.length} sample bookings:`);
    created.forEach((b, i) => {
      const home = homes.find(h => h._id.equals(b.houseId));
      console.log(`  ${i + 1}. ${home?.houseName} | ${b.checkIn.toDateString()} - ${b.checkOut.toDateString()} | ${b.guests} guests`);
    });

    process.exit(0);
  } catch (err) {
    console.error('Error seeding data:', err);
    process.exit(1);
  }
}

seedAll();
