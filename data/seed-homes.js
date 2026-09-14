require('dotenv').config();
const mongoose = require('mongoose');
const Home = require('../models/home');

const DB_PATH = process.env.MONGODB_URI || "mongodb+srv://root:aditya123@keepcoding.xp3rkci.mongodb.net/?retryWrites=true&w=majority&appName=KeepCoding";
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80";

const homes = [
  // --- DELHI ---
  {
    houseName: "Lutyens Heritage Villa & Garden",
    price: 9500,
    location: "Delhi, NCR",
    rating: 4.9,
    photoUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    description: "A prestigious colonial-era villa set amidst sprawling lawns in Central Delhi. Features high ceilings, antique furniture, and private chef services."
  },
  {
    houseName: "Hauz Khas Bohemian Terrace Loft",
    price: 4200,
    location: "Delhi, NCR",
    rating: 4.7,
    photoUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
    description: "Chic studio apartment overlooking the ancient Hauz Khas fort lake. Walking distance to boutique cafes and art galleries."
  },
  {
    houseName: "Chhatarpur Farmstay & Pool Sanctuary",
    price: 12500,
    location: "Delhi, NCR",
    rating: 4.95,
    photoUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
    description: "Luxurious 4-bedroom farmhouse with a private swimming pool, landscaped gardens, and open courtyard for family gatherings."
  },
  {
    houseName: "South Ex Modern Penthouse",
    price: 6800,
    location: "Delhi, NCR",
    rating: 4.6,
    photoUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
    description: "Sleek duplex penthouse with a private wrap-around terrace and city skyline views in the heart of South Delhi."
  },

  // --- MUMBAI ---
  {
    houseName: "Bandra Sea-Facing Luxury Penthouse",
    price: 14500,
    location: "Mumbai, Maharashtra",
    rating: 4.98,
    photoUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
    description: "Ultra-modern sea-facing penthouse in Bandra Bandstand with panoramic Arabian Sea views, designer interiors, and rooftop plunge pool."
  },
  {
    houseName: "Colaba Art Deco Heritage Flat",
    price: 6200,
    location: "Mumbai, Maharashtra",
    rating: 4.8,
    photoUrl: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=800&q=80",
    description: "High-ceilinged 1930s Art Deco apartment near the Gateway of India. Beautiful teakwood balcony and vintage charm."
  },
  {
    houseName: "Juhu Sunset Beachfront Studio",
    price: 5500,
    location: "Mumbai, Maharashtra",
    rating: 4.75,
    photoUrl: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80",
    description: "Cozy beachfront studio overlooking Juhu Beach. Step out directly onto the sand and enjoy breathtaking ocean sunsets."
  },
  {
    houseName: "Marine Drive Promenade Suite",
    price: 8800,
    location: "Mumbai, Maharashtra",
    rating: 4.88,
    photoUrl: "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=800&q=80",
    description: "Elegant apartment situated along the Queen's Necklace. Offers front-row views of Marine Drive and South Mumbai vibes."
  },

  // --- GOA ---
  {
    houseName: "Candolim Sunset Beach Villa",
    price: 8500,
    location: "Goa, India",
    rating: 4.92,
    photoUrl: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80",
    description: "Stunning 3-bedroom villa with private infinity pool, tropical garden, and 2-minute walk to Candolim beach."
  },
  {
    houseName: "Fontainhas Portuguese Heritage House",
    price: 4900,
    location: "Goa, India",
    rating: 4.85,
    photoUrl: "https://images.unsplash.com/photo-1600607687644-c7171b42498b?auto=format&fit=crop&w=800&q=80",
    description: "Restored 18th-century Portuguese bungalow in Panjim's colorful Latin Quarter. Features red tile roofs and traditional courtyard."
  },
  {
    houseName: "Anjuna Cliffside Ocean View Estate",
    price: 11000,
    location: "Goa, India",
    rating: 5.0,
    photoUrl: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80",
    description: "Exclusive cliff-top estate overlooking the Arabian Sea with private sun decks, infinity pool, and outdoor barbecue lounge."
  },
  {
    houseName: "Palolem Tropical Palms Cottage",
    price: 3200,
    location: "Goa, India",
    rating: 4.65,
    photoUrl: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=800&q=80",
    description: "Rustic-luxe eco-cottage tucked amidst coconut groves near South Goa's quiet Palolem bay."
  },

  // --- MANALI ---
  {
    houseName: "Himalayan Snow Peak Cedar Cabin",
    price: 3800,
    location: "Manali, Himachal Pradesh",
    rating: 4.86,
    photoUrl: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80",
    description: "Handcrafted pine wooden cabin with stone fireplace, heated blankets, and unobstructed snow peak views of Solang Valley."
  },
  {
    houseName: "Naggar Apple Orchard Farmstay",
    price: 2900,
    location: "Manali, Himachal Pradesh",
    rating: 4.78,
    photoUrl: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=800&q=80",
    description: "Peaceful homestay inside a blooming apple orchard overlooking the Beas River valley."
  },
  {
    houseName: "Old Manali Riverside Chalet",
    price: 4500,
    location: "Manali, Himachal Pradesh",
    rating: 4.9,
    photoUrl: "https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=800&q=80",
    description: "Charming wooden chalet right next to the gushing river stream in Old Manali. Close to trendy mountain cafes."
  },
  {
    houseName: "Solang Valley Mountain Sanctuary",
    price: 6400,
    location: "Manali, Himachal Pradesh",
    rating: 4.82,
    photoUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80",
    description: "Spacious multi-bedroom alpine lodge equipped with glass balconies and stargazing skylights."
  },

  // --- JAIPUR ---
  {
    houseName: "Royal Heritage Haveli Suite",
    price: 7800,
    location: "Jaipur, Rajasthan",
    rating: 4.94,
    photoUrl: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80",
    description: "Experience royal living in a 150-year-old restored Jaipur Haveli featuring fresco walls, arch courtyards, and marble bath."
  },
  {
    houseName: "Amber Fort View Palace Villa",
    price: 9200,
    location: "Jaipur, Rajasthan",
    rating: 4.91,
    photoUrl: "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?auto=format&fit=crop&w=800&q=80",
    description: "Luxury property nestled at the foot of Maota Lake with direct rooftop views of illuminated Amber Fort."
  },
  {
    houseName: "Pink City Courtyard Cottage",
    price: 3600,
    location: "Jaipur, Rajasthan",
    rating: 4.7,
    photoUrl: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=800&q=80",
    description: "Cozy ethnic cottage inside the walled Pink City, decorated with hand-block printed linens and brass lamps."
  },
  {
    houseName: "Civil Lines Garden Estate",
    price: 5400,
    location: "Jaipur, Rajasthan",
    rating: 4.8,
    photoUrl: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=800&q=80",
    description: "Serene oasis in prime Jaipur neighborhood with lush lawns, peacock visits, and a private pool."
  },

  // --- BANGALORE ---
  {
    houseName: "Indiranagar Minimalist Penthouse",
    price: 5800,
    location: "Bangalore, Karnataka",
    rating: 4.85,
    photoUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
    description: "Sleek Scandinavian-style penthouse with private rooftop garden in Bangalore's food and shopping hub."
  },
  {
    houseName: "Cubbon Park Green View Suite",
    price: 4900,
    location: "Bangalore, Karnataka",
    rating: 4.75,
    photoUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
    description: "Quiet green sanctuary surrounded by bamboo foliage, minutes away from MG Road and Cubbon Park."
  },
  {
    houseName: "Koramangala Luxury Duplex",
    price: 6500,
    location: "Bangalore, Karnataka",
    rating: 4.88,
    photoUrl: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80",
    description: "Spacious modern duplex featuring ultra-fast Wi-Fi, ergonomic work pods, and smart home automation."
  },
  {
    houseName: "Whitefield Palm Grove Villa",
    price: 7200,
    location: "Bangalore, Karnataka",
    rating: 4.8,
    photoUrl: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=800&q=80",
    description: "Gated luxury villa with private lawn, swimming pool access, and tranquil suburban atmosphere."
  },

  // --- HYDERABAD ---
  {
    houseName: "Jubilee Hills Grand Mansion",
    price: 11500,
    location: "Hyderabad, Telangana",
    rating: 4.96,
    photoUrl: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=800&q=80",
    description: "Opulent mansion in Hyderabad's most exclusive hill district. Private cinema hall, pool, and courtyard fountain."
  },
  {
    houseName: "Banjara Hills Garden Villa",
    price: 7900,
    location: "Hyderabad, Telangana",
    rating: 4.84,
    photoUrl: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80",
    description: "Lush tropical retreat surrounded by granite rock formations and private flower gardens."
  },
  {
    houseName: "Old City Nawabi Courtyard House",
    price: 4300,
    location: "Hyderabad, Telangana",
    rating: 4.72,
    photoUrl: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
    description: "Authentic Hyderabadi heritage home near Charminar with traditional jali woodwork and authentic Biryani dining experience."
  },
  {
    houseName: "Hitec City Skyline Apartment",
    price: 5100,
    location: "Hyderabad, Telangana",
    rating: 4.78,
    photoUrl: "https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&w=800&q=80",
    description: "High-rise executive apartment offering sweeping views of Durgam Cheruvu lake and the IT corridor."
  },

  // --- RISHIKESH ---
  {
    houseName: "Ganges Riverfront Eco Cottage",
    price: 3400,
    location: "Rishikesh, Uttarakhand",
    rating: 4.88,
    photoUrl: "https://images.unsplash.com/photo-12440471?auto=format&fit=crop&w=800&q=80",
    description: "Serene bamboo and stone cottage directly on the banks of holy river Ganges with private yoga deck."
  },
  {
    houseName: "Tapovan Mountain View Studio",
    price: 2400,
    location: "Rishikesh, Uttarakhand",
    rating: 4.68,
    photoUrl: "https://images.unsplash.com/photo-1506059612708-99d6c258160e?auto=format&fit=crop&w=800&q=80",
    description: "Cozy retreat tucked in Tapovan hills near Laxman Jhula. Perfect base for yoga enthusiasts and digital nomads."
  },
  {
    houseName: "Himalayan Foothills Wellness Sanctuary",
    price: 6800,
    location: "Rishikesh, Uttarakhand",
    rating: 4.93,
    photoUrl: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80",
    description: "Luxury wellness resort villa offering organic farm meals, Ayurvedic spa treatments, and meditation dome."
  },
  {
    houseName: "Laxman Jhula Riverside Haven",
    price: 3900,
    location: "Rishikesh, Uttarakhand",
    rating: 4.76,
    photoUrl: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80",
    description: "Traditional stone dwelling with panoramic views of the Ganges suspension bridge and evening Ganga Aarti."
  },

  // --- UDAIPUR ---
  {
    houseName: "Lake Pichola Sunset Palace Villa",
    price: 10800,
    location: "Udaipur, Rajasthan",
    rating: 4.97,
    photoUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80",
    description: "Exquisite heritage villa on the banks of Lake Pichola with direct views of City Palace and Jag Mandir."
  },
  {
    houseName: "Aravalli Hillside Farmstay",
    price: 3800,
    location: "Udaipur, Rajasthan",
    rating: 4.8,
    photoUrl: "https://images.unsplash.com/photo-1592595896616-c37162298647?auto=format&fit=crop&w=800&q=80",
    description: "Peaceful organic farmstay located in a tranquil Aravalli valley, featuring swimming pool and home-cooked Rajasthani thalis."
  },
  {
    houseName: "Fatehsagar Lakefront Residence",
    price: 7400,
    location: "Udaipur, Rajasthan",
    rating: 4.89,
    photoUrl: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80",
    description: "Boutique lakefront home with glass windows facing Fatehsagar Lake and Neemach Mata hill."
  },
  {
    houseName: "Royal Courtyard Haveli",
    price: 5200,
    location: "Udaipur, Rajasthan",
    rating: 4.74,
    photoUrl: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80",
    description: "Charming Mewari-style home featuring traditional jharokhas, marble flooring, and rooftop restaurant."
  },

  // --- SHIMLA ---
  {
    houseName: "Mall Road Colonial Peak Chalet",
    price: 4900,
    location: "Shimla, Himachal Pradesh",
    rating: 4.83,
    photoUrl: "https://images.unsplash.com/photo-1544984243-ec57ea16fe25?auto=format&fit=crop&w=800&q=80",
    description: "British-era wooden cottage situated near Shimla Mall Road with grand fireplace and pine forest garden."
  },
  {
    houseName: "Mashobra Deodar Forest Hideaway",
    price: 5600,
    location: "Shimla, Himachal Pradesh",
    rating: 4.91,
    photoUrl: "https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=800&q=80",
    description: "Secluded retreat surrounded by dense deodar trees in Mashobra, offering apple orchard walks and mountain solitude."
  },
  {
    houseName: "Kufri Snowline Horizon Lodge",
    price: 4100,
    location: "Shimla, Himachal Pradesh",
    rating: 4.7,
    photoUrl: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80",
    description: "High-altitude wooden lodge in Kufri with sweeping views of the snow-clad Himalayan range."
  },
  {
    houseName: "Shimla Heritage Hilltop Bungalow",
    price: 6800,
    location: "Shimla, Himachal Pradesh",
    rating: 4.88,
    photoUrl: "https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=800&q=80",
    description: "Restored 1920s hill station bungalow featuring vintage bay windows and private fir tree lawn."
  },

  // --- PUNE ---
  {
    houseName: "Koregaon Park Luxury Garden Flat",
    price: 4600,
    location: "Pune, Maharashtra",
    rating: 4.82,
    photoUrl: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80",
    description: "Tree-canopied apartment in Koregaon Park near Osho Ashram with private balcony and modern design."
  },
  {
    houseName: "Lavasa Waterfront Villa",
    price: 6900,
    location: "Pune, Maharashtra",
    rating: 4.75,
    photoUrl: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80",
    description: "Italian-style waterfront villa in Lavasa valley with private deck, kayaks, and serene lake views."
  },
  {
    houseName: "Lonavala Ghats Mist Retreat",
    price: 8200,
    location: "Pune, Maharashtra",
    rating: 4.89,
    photoUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
    description: "Monsoon villa nestled on Western Ghats hilltops with private swimming pool and waterfall view."
  },
  {
    houseName: "Kalyani Nagar Executive Residence",
    price: 5200,
    location: "Pune, Maharashtra",
    rating: 4.79,
    photoUrl: "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=800&q=80",
    description: "Spacious urban apartment in prime Kalyani Nagar with rooftop swimming pool and gym access."
  },

  // --- CHENNAI ---
  {
    houseName: "ECR Oceanfront Luxury Villa",
    price: 9800,
    location: "Chennai, Tamil Nadu",
    rating: 4.93,
    photoUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
    description: "Sprawling East Coast Road oceanfront residence with private lawn extending to Bay of Bengal waters."
  },
  {
    houseName: "Mylapore Heritage Courtyard House",
    price: 3900,
    location: "Chennai, Tamil Nadu",
    rating: 4.74,
    photoUrl: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=800&q=80",
    description: "Traditional Tamil thinnai style home near Kapaleeshwarar Temple with wooden pillars and quiet courtyard."
  },
  {
    houseName: "Marina Breeze Penthouse",
    price: 5500,
    location: "Chennai, Tamil Nadu",
    rating: 4.81,
    photoUrl: "https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=800&q=80",
    description: "Modern high-rise penthouse with direct sea breeze and sweeping views of Marina Beach coastline."
  },
  {
    houseName: "Mahabalipuram Coastal Sanctuary",
    price: 7400,
    location: "Chennai, Tamil Nadu",
    rating: 4.87,
    photoUrl: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80",
    description: "Boutique resort villa near UNESCO shore temple site with private swimming pool and palm gardens."
  },

  // --- KOLKATA ---
  {
    houseName: "Ballygunge Colonial Mansion Suite",
    price: 4800,
    location: "Kolkata, West Bengal",
    rating: 4.84,
    photoUrl: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
    description: "Stately British Raj heritage home in South Kolkata with high ceilings, four-poster beds, and classic library."
  },
  {
    houseName: "Park Street Vintage Heritage Flat",
    price: 3600,
    location: "Kolkata, West Bengal",
    rating: 4.76,
    photoUrl: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=800&q=80",
    description: "Charming apartment right on historic Park Street, steps away from Kolkata's legendary restaurants and bakeries."
  },
  {
    houseName: "Howrah Riverfront Terrace Penthouse",
    price: 5900,
    location: "Kolkata, West Bengal",
    rating: 4.88,
    photoUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
    description: "Terrace home directly overlooking Hooghly river with front-row view of illuminated Howrah Bridge."
  },
  {
    houseName: "Salt Lake Modern Garden Duplex",
    price: 4300,
    location: "Kolkata, West Bengal",
    rating: 4.71,
    photoUrl: "https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&w=800&q=80",
    description: "Quiet green neighborhood home in Salt Lake Sector 1, featuring private lawn and spacious sunlit bedrooms."
  },

  // --- KERALA ---
  {
    houseName: "Alleppey Luxury Backwater Houseboat",
    price: 7800,
    location: "Alleppey, Kerala",
    rating: 4.95,
    photoUrl: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80",
    description: "Traditional Kettuvallam houseboat converted into a luxury floating villa with air-conditioned bedrooms and private chef."
  },
  {
    houseName: "Munnar Misty Tea Estate Villa",
    price: 5200,
    location: "Munnar, Kerala",
    rating: 4.91,
    photoUrl: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80",
    description: "Charming planter's bungalow surrounded by rolling green tea plantations and misty Western Ghats peaks."
  },
  {
    houseName: "Varkala Cliffside Ocean View Chalet",
    price: 4600,
    location: "Varkala, Kerala",
    rating: 4.86,
    photoUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
    description: "Perched high on Varkala's famous red cliffs, offering sunset views over Papanasam beach and sound of crashing waves."
  },
  {
    houseName: "Wayanad Rainforest Treehouse Retreat",
    price: 6400,
    location: "Wayanad, Kerala",
    rating: 4.97,
    photoUrl: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80",
    description: "Eco-friendly luxury treehouse built 40 feet above the ground in lush Wayanad rainforest with natural spring pool."
  }
];

async function seedHomes() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(DB_PATH);
    console.log('✅ Connected to MongoDB successfully');

    const initialCount = await Home.countDocuments();
    console.log(`Current total homes in DB before seed: ${initialCount}`);

    let upsertedCount = 0;
    let updatedCount = 0;

    for (const rawHome of homes) {
      // Fallback image check
      const photoUrl = (rawHome.photoUrl && rawHome.photoUrl.trim()) ? rawHome.photoUrl.trim() : DEFAULT_IMAGE;
      
      const homeData = {
        ...rawHome,
        photoUrl
      };

      const result = await Home.updateOne(
        { houseName: homeData.houseName, location: homeData.location },
        { $set: homeData },
        { upsert: true, runValidators: true }
      );

      if (result.upsertedCount > 0) {
        upsertedCount++;
      } else if (result.modifiedCount > 0) {
        updatedCount++;
      }
    }

    const finalCount = await Home.countDocuments();
    console.log(`\n🎉 Seed process completed successfully!`);
    console.log(`- New homes added: ${upsertedCount}`);
    console.log(`- Existing homes updated: ${updatedCount}`);
    console.log(`- Total homes in database: ${finalCount}`);

    // Summary of locations
    const locations = await Home.distinct('location');
    console.log(`\n📍 Locations in database (${locations.length}):`);
    locations.forEach(loc => console.log(`   - ${loc}`));

    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding homes:', err);
    process.exit(1);
  }
}

seedHomes();
