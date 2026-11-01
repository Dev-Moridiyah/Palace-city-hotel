// Run with: npm run seed
// Populates the database with demo rooms, services and an admin account.
import dotenv from 'dotenv';
import connectDB from '../config/db.mjs';
import Room from '../models/Room.mjs';
import Service from '../models/Service.mjs';
import Admin from '../models/Admin.mjs';

dotenv.config();

const rooms = [
  {
    name: 'Emerald Standard Room',
    type: 'Standard',
    description:
      'A comfortable, well-appointed room featuring warm tones, a plush queen bed and everything you need for a relaxing stay in the heart of the city.',
    price: 85000,
    capacity: { adults: 2, children: 1 },
    bedType: 'Queen Bed',
    sizeSqm: 28,
    facilities: ['Free Wi-Fi', 'Air Conditioning', 'Flat-screen TV', 'Mini Fridge', 'Work Desk'],
    images: [
      'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=1200',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1200',
    ],
    totalRooms: 12,
    featured: true,
    rating: 4.6,
  },
  {
    name: 'Champagne Deluxe Room',
    type: 'Deluxe',
    description:
      'Spacious and elegant, the Deluxe Room offers a king-size bed, a seating area, and refined gold and cream furnishings for a truly comfortable stay.',
    price: 135000,
    capacity: { adults: 2, children: 2 },
    bedType: 'King Bed',
    sizeSqm: 36,
    facilities: ['Free Wi-Fi', 'Air Conditioning', 'Smart TV', 'Mini Bar', 'Bathtub', 'City View'],
    images: [
      'https://images.unsplash.com/photo-1590490359683-658d3d23f972?q=80&w=1200',
      'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?q=80&w=1200',
    ],
    totalRooms: 10,
    featured: true,
    rating: 4.8,
  },
  {
    name: 'Palace Executive Suite',
    type: 'Executive Suite',
    description:
      'A luxurious suite with a separate living area, floor-to-ceiling windows and premium in-room amenities designed for discerning travellers.',
    price: 220000,
    capacity: { adults: 3, children: 2 },
    bedType: 'King Bed + Sofa Bed',
    sizeSqm: 52,
    facilities: [
      'Free Wi-Fi',
      'Air Conditioning',
      'Smart TV',
      'Mini Bar',
      'Jacuzzi',
      'Butler Service',
      'City View',
    ],
    images: [
      'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=1200',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=1200',
    ],
    totalRooms: 6,
    featured: true,
    rating: 4.9,
  },
  {
    name: 'Presidential Grand Suite',
    type: 'Presidential Suite',
    description:
      'The pinnacle of Palace City Hotel luxury — a sprawling suite with a private dining area, panoramic views, and unmatched personal service.',
    price: 450000,
    capacity: { adults: 4, children: 2 },
    bedType: 'King Bed + 2 Queen Beds',
    sizeSqm: 90,
    facilities: [
      'Free Wi-Fi',
      'Private Dining',
      'Jacuzzi',
      'Butler Service',
      'Panoramic View',
      'Private Lounge',
    ],
    images: [
      'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?q=80&w=1200',
      'https://images.unsplash.com/photo-1591088398332-8a7791972843?q=80&w=1200',
    ],
    totalRooms: 2,
    featured: false,
    rating: 5,
  },
  {
    name: 'Garden Family Room',
    type: 'Family Room',
    description:
      'A spacious, family-friendly room with two queen beds, garden views and thoughtful touches for travelling with children.',
    price: 160000,
    capacity: { adults: 4, children: 2 },
    bedType: '2 Queen Beds',
    sizeSqm: 45,
    facilities: ['Free Wi-Fi', 'Air Conditioning', 'Smart TV', 'Garden View', 'Extra Storage'],
    images: [
      'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?q=80&w=1200',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1200',
    ],
    totalRooms: 8,
    featured: false,
    rating: 4.7,
  },
];

const services = [
  {
    name: 'Fine Dining Restaurant',
    description:
      'Savour globally inspired cuisine crafted by our executive chefs in an elegant, softly lit dining room.',
    icon: 'utensils',
  },
  {
    name: 'Rooftop Swimming Pool',
    description:
      'Unwind in our heated rooftop pool with panoramic views of the city skyline, open year-round.',
    icon: 'waves',
  },
  {
    name: 'High-Speed Wi-Fi',
    description: 'Stay connected with complimentary high-speed internet throughout the hotel.',
    icon: 'wifi',
  },
  {
    name: '24-Hour Room Service',
    description: 'Enjoy your favourite dishes and beverages delivered to your room at any hour.',
    icon: 'bell',
  },
  {
    name: 'Conference & Events',
    description:
      'Host meetings, weddings and celebrations in our fully equipped event spaces with dedicated planning staff.',
    icon: 'users',
  },
  {
    name: 'Valet Parking',
    description: 'Secure, complimentary valet parking for all overnight and event guests.',
    icon: 'car',
  },
  {
    name: 'Laundry & Dry Cleaning',
    description: 'Same-day laundry and dry-cleaning service available for all guests.',
    icon: 'shirt',
  },
  {
    name: 'Fitness Centre',
    description: 'A fully equipped, modern gym open 24 hours for all hotel guests.',
    icon: 'dumbbell',
  },
];

const importData = async () => {
  try {
    await connectDB();

    await Room.deleteMany();
    await Service.deleteMany();

    const roomsWithSlugs = rooms.map((room) => ({
      ...room,
      slug: room.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, ''),
    }));

    await Room.insertMany(roomsWithSlugs);
    await Service.insertMany(services);

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@palacecityhotel.com';
    const adminExists = await Admin.findOne({ email: adminEmail });

    if (!adminExists) {
      await Admin.create({
        name: 'Hotel Administrator',
        email: adminEmail,
        password: process.env.ADMIN_PASSWORD || 'ChangeMe123!',
        role: 'superadmin',
      });
    }

    console.log('Seed data imported successfully!');
    console.log(`Admin login -> email: ${adminEmail} / password: ${process.env.ADMIN_PASSWORD || 'ChangeMe123!'}`);
    process.exit();
  } catch (err) {
    console.error('Error importing seed data:', err);
    process.exit(1);
  }
};

importData();
