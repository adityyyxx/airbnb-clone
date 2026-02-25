const mongoose = require('mongoose');
const Service = require('../models/service');

const DB_PATH = "mongodb+srv://root:aditya123@keepcoding.xp3rkci.mongodb.net/?retryWrites=true&w=majority&appName=KeepCoding";

const services = [
  // Photography
  { serviceName: "Portrait Photography Session", provider: "Rahul Sharma", category: "Photography", price: 3500, location: "New Delhi, India", rating: 4.9, photoUrl: "https://images.pexels.com/photos/3379934/pexels-photo-3379934.jpeg?auto=compress&cs=tinysrgb&w=600", isPopular: true },
  { serviceName: "Wedding Photography", provider: "Priya Studios", category: "Photography", price: 15000, location: "Mumbai, Maharashtra", rating: 5.0, photoUrl: "https://images.pexels.com/photos/3014856/pexels-photo-3014856.jpeg?auto=compress&cs=tinysrgb&w=600", isPopular: true },
  { serviceName: "Food Photography", provider: "Ankit Clicks", category: "Photography", price: 2500, location: "Bangalore, Karnataka", rating: 4.7, photoUrl: "https://images.pexels.com/photos/1264210/pexels-photo-1264210.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { serviceName: "Travel Photography Tour", provider: "Wanderlens Studio", category: "Photography", price: 5000, location: "Jaipur, Rajasthan", rating: 4.8, photoUrl: "https://images.pexels.com/photos/1051075/pexels-photo-1051075.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { serviceName: "Product Photography", provider: "Lens Craft", category: "Photography", price: 4000, location: "Pune, Maharashtra", rating: 4.6, photoUrl: "https://images.pexels.com/photos/821652/pexels-photo-821652.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { serviceName: "Candid Event Photography", provider: "SnapMoments", category: "Photography", price: 8000, location: "Chennai, Tamil Nadu", rating: 4.9, photoUrl: "https://images.pexels.com/photos/2608517/pexels-photo-2608517.jpeg?auto=compress&cs=tinysrgb&w=600", isPopular: true },
  { serviceName: "Maternity Photoshoot", provider: "GlowCapture", category: "Photography", price: 6000, location: "Hyderabad, Telangana", rating: 4.8, photoUrl: "https://images.pexels.com/photos/3662770/pexels-photo-3662770.jpeg?auto=compress&cs=tinysrgb&w=600" },

  // Chefs
  { serviceName: "Private Italian Dinner", provider: "Chef Marco", category: "Chefs", price: 4500, location: "Mumbai, Maharashtra", rating: 4.9, photoUrl: "https://images.pexels.com/photos/2544829/pexels-photo-2544829.jpeg?auto=compress&cs=tinysrgb&w=600", isPopular: true },
  { serviceName: "Indian Thali Experience", provider: "Chef Sunita", category: "Chefs", price: 2000, location: "New Delhi, India", rating: 4.8, photoUrl: "https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=600", isPopular: true },
  { serviceName: "Sushi Masterclass", provider: "Chef Tanaka", category: "Chefs", price: 6000, location: "Bangalore, Karnataka", rating: 5.0, photoUrl: "https://images.pexels.com/photos/2098085/pexels-photo-2098085.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { serviceName: "BBQ & Grill Night", provider: "Chef Vikram", category: "Chefs", price: 3500, location: "Goa, India", rating: 4.7, photoUrl: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { serviceName: "Vegan Feast", provider: "Chef Meera", category: "Chefs", price: 3000, location: "Pune, Maharashtra", rating: 4.6, photoUrl: "https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { serviceName: "Dessert Workshop", provider: "Baker Neha", category: "Chefs", price: 2500, location: "Jaipur, Rajasthan", rating: 4.9, photoUrl: "https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg?auto=compress&cs=tinysrgb&w=600", isPopular: true },
  { serviceName: "South Indian Breakfast", provider: "Chef Lakshmi", category: "Chefs", price: 1500, location: "Chennai, Tamil Nadu", rating: 4.8, photoUrl: "https://images.pexels.com/photos/1410236/pexels-photo-1410236.jpeg?auto=compress&cs=tinysrgb&w=600" },

  // Massage
  { serviceName: "Deep Tissue Massage", provider: "Wellness by Anu", category: "Massage", price: 2500, location: "New Delhi, India", rating: 4.8, photoUrl: "https://images.pexels.com/photos/3757952/pexels-photo-3757952.jpeg?auto=compress&cs=tinysrgb&w=600", isPopular: true },
  { serviceName: "Ayurvedic Massage", provider: "Kerala Wellness", category: "Massage", price: 3000, location: "Kochi, Kerala", rating: 5.0, photoUrl: "https://images.pexels.com/photos/3764568/pexels-photo-3764568.jpeg?auto=compress&cs=tinysrgb&w=600", isPopular: true },
  { serviceName: "Thai Massage", provider: "Serenity Spa", category: "Massage", price: 3500, location: "Mumbai, Maharashtra", rating: 4.7, photoUrl: "https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { serviceName: "Aromatherapy Session", provider: "Bliss Touch", category: "Massage", price: 2800, location: "Bangalore, Karnataka", rating: 4.6, photoUrl: "https://images.pexels.com/photos/3188/love-romantic-bath-candlelight.jpg?auto=compress&cs=tinysrgb&w=600" },
  { serviceName: "Hot Stone Therapy", provider: "ZenBody", category: "Massage", price: 4000, location: "Goa, India", rating: 4.9, photoUrl: "https://images.pexels.com/photos/3865792/pexels-photo-3865792.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { serviceName: "Couples Massage", provider: "TranquilTouch", category: "Massage", price: 5000, location: "Udaipur, Rajasthan", rating: 4.8, photoUrl: "https://images.pexels.com/photos/3760262/pexels-photo-3760262.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { serviceName: "Foot Reflexology", provider: "HealFeet", category: "Massage", price: 1500, location: "Pune, Maharashtra", rating: 4.5, photoUrl: "https://images.pexels.com/photos/5240677/pexels-photo-5240677.jpeg?auto=compress&cs=tinysrgb&w=600" },

  // Training
  { serviceName: "Yoga and Embodiment", provider: "Julia", category: "Training", price: 2200, location: "Rishikesh, Uttarakhand", rating: 5.0, photoUrl: "https://images.pexels.com/photos/3822906/pexels-photo-3822906.jpeg?auto=compress&cs=tinysrgb&w=600", isPopular: true },
  { serviceName: "High-energy Workouts", provider: "Trainer Vicky", category: "Training", price: 1800, location: "Mumbai, Maharashtra", rating: 4.8, photoUrl: "https://images.pexels.com/photos/4162487/pexels-photo-4162487.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { serviceName: "Personal Fitness Coaching", provider: "FitPro Raj", category: "Training", price: 3000, location: "New Delhi, India", rating: 4.7, photoUrl: "https://images.pexels.com/photos/4164761/pexels-photo-4164761.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { serviceName: "Pilates Session", provider: "CoreStrength", category: "Training", price: 2500, location: "Bangalore, Karnataka", rating: 4.9, photoUrl: "https://images.pexels.com/photos/4056535/pexels-photo-4056535.jpeg?auto=compress&cs=tinysrgb&w=600", isPopular: true },
  { serviceName: "Meditation & Breathwork", provider: "InnerCalm", category: "Training", price: 1500, location: "Pune, Maharashtra", rating: 4.8, photoUrl: "https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { serviceName: "CrossFit Training", provider: "IronWill Gym", category: "Training", price: 2000, location: "Hyderabad, Telangana", rating: 4.6, photoUrl: "https://images.pexels.com/photos/3253501/pexels-photo-3253501.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { serviceName: "Zumba Dance Fitness", provider: "DanceFit Studio", category: "Training", price: 1200, location: "Chennai, Tamil Nadu", rating: 4.7, photoUrl: "https://images.pexels.com/photos/3775566/pexels-photo-3775566.jpeg?auto=compress&cs=tinysrgb&w=600" },

  // Make-up
  { serviceName: "Bridal Makeup", provider: "GlamByPreeti", category: "Make-up", price: 8000, location: "New Delhi, India", rating: 5.0, photoUrl: "https://images.pexels.com/photos/457702/pexels-photo-457702.jpeg?auto=compress&cs=tinysrgb&w=600", isPopular: true },
  { serviceName: "Party Glam Look", provider: "BeautyBar", category: "Make-up", price: 3500, location: "Mumbai, Maharashtra", rating: 4.8, photoUrl: "https://images.pexels.com/photos/2661256/pexels-photo-2661256.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { serviceName: "Natural Everyday Makeup", provider: "SoftGlow", category: "Make-up", price: 2000, location: "Bangalore, Karnataka", rating: 4.6, photoUrl: "https://images.pexels.com/photos/2113855/pexels-photo-2113855.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { serviceName: "Editorial Makeup", provider: "AvantGarde", category: "Make-up", price: 5000, location: "Pune, Maharashtra", rating: 4.9, photoUrl: "https://images.pexels.com/photos/3373716/pexels-photo-3373716.jpeg?auto=compress&cs=tinysrgb&w=600", isPopular: true },

  // Hair
  { serviceName: "Blowout & Styling", provider: "Hair by Simran", category: "Hair", price: 1500, location: "New Delhi, India", rating: 4.7, photoUrl: "https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { serviceName: "Bridal Hair Design", provider: "TressArt", category: "Hair", price: 5000, location: "Mumbai, Maharashtra", rating: 4.9, photoUrl: "https://images.pexels.com/photos/3065209/pexels-photo-3065209.jpeg?auto=compress&cs=tinysrgb&w=600", isPopular: true },
  { serviceName: "Hair Color & Highlights", provider: "ColorCrew", category: "Hair", price: 3500, location: "Bangalore, Karnataka", rating: 4.8, photoUrl: "https://images.pexels.com/photos/3993467/pexels-photo-3993467.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { serviceName: "Men's Grooming & Cut", provider: "SharpEdge", category: "Hair", price: 1200, location: "Chennai, Tamil Nadu", rating: 4.6, photoUrl: "https://images.pexels.com/photos/1813272/pexels-photo-1813272.jpeg?auto=compress&cs=tinysrgb&w=600" },

  // Spa treatments
  { serviceName: "Luxury Facial Treatment", provider: "GlowSpa", category: "Spa treatments", price: 3500, location: "Mumbai, Maharashtra", rating: 4.9, photoUrl: "https://images.pexels.com/photos/3985329/pexels-photo-3985329.jpeg?auto=compress&cs=tinysrgb&w=600", isPopular: true },
  { serviceName: "Body Scrub & Wrap", provider: "PureBliss Spa", category: "Spa treatments", price: 4000, location: "Goa, India", rating: 4.8, photoUrl: "https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { serviceName: "Detox & Cleanse Package", provider: "Wellness Hub", category: "Spa treatments", price: 5500, location: "Kochi, Kerala", rating: 5.0, photoUrl: "https://images.pexels.com/photos/3188/love-romantic-bath-candlelight.jpg?auto=compress&cs=tinysrgb&w=600", isPopular: true },

  // Catering
  { serviceName: "Wedding Catering", provider: "Royal Feast", category: "Catering", price: 25000, location: "New Delhi, India", rating: 4.9, photoUrl: "https://images.pexels.com/photos/587741/pexels-photo-587741.jpeg?auto=compress&cs=tinysrgb&w=600", isPopular: true },
  { serviceName: "Corporate Event Catering", provider: "BizBites", category: "Catering", price: 15000, location: "Bangalore, Karnataka", rating: 4.7, photoUrl: "https://images.pexels.com/photos/5638732/pexels-photo-5638732.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { serviceName: "Birthday Party Buffet", provider: "HappyBelly", category: "Catering", price: 8000, location: "Mumbai, Maharashtra", rating: 4.8, photoUrl: "https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=600" },
];

async function seedServices() {
  try {
    await mongoose.connect(DB_PATH);
    console.log('Connected to MongoDB');

    const count = await Service.countDocuments();
    if (count > 0) {
      console.log(`Already have ${count} services. Clearing...`);
      await Service.deleteMany({});
    }

    const inserted = await Service.insertMany(services);
    console.log(`\n✅ Added ${inserted.length} services!\n`);

    // Summary
    const categories = [...new Set(services.map(s => s.category))];
    categories.forEach(cat => {
      const num = services.filter(s => s.category === cat).length;
      console.log(`  ${cat}: ${num} services`);
    });

    process.exit(0);
  } catch (err) {
    console.error('Error seeding services:', err);
    process.exit(1);
  }
}

seedServices();
