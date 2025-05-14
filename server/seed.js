const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const users = [
    {
        flatNo: '101',
        consumerId: 'CID101',
        email: 'scbabai2704@gmail.com',
        phone: '9748278005',
        maintenanceAmount: 1500,
        lastPaidAt: null,
        role: 'user'
    },
    {
        flatNo: 'Flat 2E',
        consumerId: 'CID102',
        email: 'sugatachanda.cse2022@nsec.ac.in',
        phone: '9088193190',
        maintenanceAmount: 900,
        lastPaidAt: null,
        role: 'user'
    },
    {
        flatNo: '201',
        consumerId: 'CID201',
        email: 'gctitan1273@gmail.com',
        phone: '9002775208',
        maintenanceAmount: 1800,
        lastPaidAt: null,
        role: 'user'
    },
    {
        flatNo: 'N/A',
        consumerId: 'admin',
        email: 'scbabai2704@gmail.com',
        phone: '9748278005',
        maintenanceAmount: 1800,
        lastPaidAt: null,
        role: 'admin'
    }
];

async function seedUsers() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        await User.deleteMany(); // Clear existing users if needed
        await User.insertMany(users);
        console.log('✅ Users seeded successfully.');
        mongoose.disconnect();
    } catch (err) {
        console.error('❌ Error seeding users:', err);
        mongoose.disconnect();
    }
}

seedUsers();
