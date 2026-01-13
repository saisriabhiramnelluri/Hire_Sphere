import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import Student from './src/models/Student.js';
import Recruiter from './src/models/Recruiter.js';
import Drive from './src/models/Drive.js';
import Application from './src/models/Application.js';
import Offer from './src/models/Offer.js';
import Notification from './src/models/Notification.js';

// Load environment variables
dotenv.config();

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected for Seeding');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

// NOTE: Password hashing is handled automatically by the User model's pre-save hook
// Do NOT hash passwords manually before passing to User.create()

// Seed Data
const seedData = async () => {
  try {
    // Clear ALL existing data
    console.log('🗑️  Clearing ALL existing data...');
    await Notification.deleteMany({});
    await Offer.deleteMany({});
    await Application.deleteMany({});
    await Drive.deleteMany({});
    await Student.deleteMany({});
    await Recruiter.deleteMany({});
    await User.deleteMany({});
    console.log('✅ All existing data cleared');

    // ==================== ADMIN USER ====================
    console.log('👤 Creating Admin...');
    const admin = await User.create({
      email: 'admin@college.edu',
      password: 'Admin@123',
      role: 'admin',
      isVerified: true,
    });
    console.log('✅ Admin created:', admin.email);

    // ==================== STUDENT USERS ====================
    console.log('👨‍🎓 Creating Students...');

    // Student 1
    const student1User = await User.create({
      email: 'rahul.sharma@college.edu',
      password: 'Student@123',
      role: 'student',
      isVerified: true,
    });

    await Student.create({
      userId: student1User._id,
      firstName: 'Rahul',
      lastName: 'Sharma',
      studentId: 'CS2021001',
      phone: '9876543210',
      email: 'rahul.sharma@college.edu',
      dateOfBirth: new Date('2003-05-15'),
      gender: 'male',
      branch: 'Computer Science',
      batch: 2025,
      currentSemester: 8,
      cgpa: 8.5,
      tenthMarks: 92.5,
      twelfthMarks: 88.0,
      activeBacklogs: 0,
      totalBacklogs: 0,
      skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Python'],
      address: {
        street: '123 MG Road',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560001',
        country: 'India',
      },
      linkedIn: 'https://linkedin.com/in/rahulsharma',
      github: 'https://github.com/rahulsharma',
      resumes: [],
      placementStatus: {
        isPlaced: false,
      },
    });
    console.log('✅ Student 1 created:', student1User.email);

    // Student 2
    const student2User = await User.create({
      email: 'priya.patel@college.edu',
      password: 'Student@123',
      role: 'student',
      isVerified: true,
    });

    await Student.create({
      userId: student2User._id,
      firstName: 'Priya',
      lastName: 'Patel',
      studentId: 'IT2021025',
      phone: '9876543211',
      email: 'priya.patel@college.edu',
      dateOfBirth: new Date('2003-08-22'),
      gender: 'female',
      branch: 'Information Technology',
      batch: 2026,
      currentSemester: 8,
      cgpa: 9.2,
      tenthMarks: 95.0,
      twelfthMarks: 91.5,
      activeBacklogs: 0,
      totalBacklogs: 0,
      skills: ['Java', 'Spring Boot', 'MySQL', 'AWS', 'Docker'],
      address: {
        street: '456 Park Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        country: 'India',
      },
      linkedIn: 'https://linkedin.com/in/priyapatel',
      github: 'https://github.com/priyapatel',
      resumes: [],
      placementStatus: {
        isPlaced: false,
      },
    });
    console.log('✅ Student 2 created:', student2User.email);

    // ==================== RECRUITER USERS ====================
    console.log('👔 Creating Recruiters...');

    // Recruiter 1 - Tech Company
    const recruiter1User = await User.create({
      email: 'hr@techcorp.com',
      password: 'Recruiter@123',
      role: 'recruiter',
      isVerified: true,
    });

    await Recruiter.create({
      userId: recruiter1User._id,
      companyName: 'TechCorp Solutions',
      companyWebsite: 'https://techcorp.com',
      companyDescription: 'TechCorp Solutions is a leading software development company specializing in enterprise solutions, cloud computing, and AI/ML technologies. We serve Fortune 500 clients worldwide.',
      industry: 'Information Technology',
      companySize: '501-1000',
      headquarters: {
        city: 'Bangalore',
        state: 'Karnataka',
        country: 'India',
      },
      contactPerson: {
        firstName: 'Amit',
        lastName: 'Verma',
        designation: 'HR Manager',
        phone: '9876543220',
        alternateEmail: 'amit.verma@techcorp.com',
      },
      isApproved: true,
      approvedAt: new Date(),
      documents: [],
    });
    console.log('✅ Recruiter 1 created:', recruiter1User.email);

    // Recruiter 2 - Finance Company
    const recruiter2User = await User.create({
      email: 'recruitment@financeplus.com',
      password: 'Recruiter@123',
      role: 'recruiter',
      isVerified: true,
    });

    await Recruiter.create({
      userId: recruiter2User._id,
      companyName: 'FinancePlus Global',
      companyWebsite: 'https://financeplus.com',
      companyDescription: 'FinancePlus Global is a multinational financial services company providing investment banking, wealth management, and retail banking services across 30 countries.',
      industry: 'Banking & Finance',
      companySize: '1000+',
      headquarters: {
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
      },
      contactPerson: {
        firstName: 'Sneha',
        lastName: 'Reddy',
        designation: 'Talent Acquisition Lead',
        phone: '9876543221',
        alternateEmail: 'sneha.reddy@financeplus.com',
      },
      isApproved: true,
      approvedAt: new Date(),
      documents: [],
    });
    console.log('✅ Recruiter 2 created:', recruiter2User.email);

    console.log('\n🎉 Database Seeding Completed Successfully!');
    console.log('\n📋 Test Login Credentials:');
    console.log('═══════════════════════════════════════════════════════');
    console.log('\n👨‍💼 ADMIN:');
    console.log('   Email: admin@college.edu');
    console.log('   Password: Admin@123');
    console.log('\n👨‍🎓 STUDENT 1:');
    console.log('   Email: rahul.sharma@college.edu');
    console.log('   Password: Student@123');
    console.log('   Student ID: CS2021001');
    console.log('   Branch: Computer Science');
    console.log('   CGPA: 8.5');
    console.log('   Semester: 8');
    console.log('\n👨‍🎓 STUDENT 2:');
    console.log('   Email: priya.patel@college.edu');
    console.log('   Password: Student@123');
    console.log('   Student ID: IT2021025');
    console.log('   Branch: Information Technology');
    console.log('   CGPA: 9.2');
    console.log('   Semester: 8');
    console.log('\n👔 RECRUITER 1 (TechCorp Solutions):');
    console.log('   Email: hr@techcorp.com');
    console.log('   Password: Recruiter@123');
    console.log('   Company: TechCorp Solutions');
    console.log('   Industry: IT');
    console.log('   Status: ✅ Approved');
    console.log('\n👔 RECRUITER 2 (FinancePlus Global):');
    console.log('   Email: recruitment@financeplus.com');
    console.log('   Password: Recruiter@123');
    console.log('   Company: FinancePlus Global');
    console.log('   Industry: Banking & Finance');
    console.log('   Status: ✅ Approved');
    console.log('═══════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Seeding Error:', error.message);
    console.error(error);
    throw error;
  }
};

// Run Seeding
const runSeeder = async () => {
  try {
    await connectDB();
    await seedData();
    console.log('✅ Seeding completed. Disconnecting...');
    await mongoose.connection.close();
    console.log('👋 Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Fatal Error:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Execute
runSeeder();
