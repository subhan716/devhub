require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const run = async () => {
  const args = process.argv.slice(2);
  const email = args[0] ? args[0].toLowerCase().trim() : null;
  const password = args[1] || null;
  const name = args[2] || 'Super Admin';

  if (!email) {
    console.log('\n❌ Error: Please provide an email address!');
    console.log('Usage:');
    console.log('  node src/scripts/createSuperAdmin.js <email> [password] [name]\n');
    console.log('Example:');
    console.log('  node src/scripts/createSuperAdmin.js owner@devhub.com SecretPass123 "Subhan Admin"\n');
    process.exit(1);
  }

  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.log('❌ Error: MONGO_URI is missing in backend/.env');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log(' Connected to MongoDB...');

    let user = await User.findOne({ email });

    if (user) {
      // User exists -> Elevate role to super_admin
      user.role = 'super_admin';
      user.isVerified = true;
      user.isVerifiedBadge = true;
      user.isSuspended = false;
      if (password) {
        user.passwordHash = password; // pre-save hook will hash it
      }
      await user.save();
      console.log(`\n🎉 SUCCESS: Existing user "${user.name}" (${user.email}) is now a SUPER_ADMIN!`);
    } else {
      // User does not exist -> Create new super_admin account
      if (!password) {
        console.log('\n❌ Error: For a new user, please provide a password.');
        console.log('Usage: node src/scripts/createSuperAdmin.js <email> <password> [name]\n');
        process.exit(1);
      }

      user = new User({
        name,
        email,
        passwordHash: password, // pre-save hook hashes it
        role: 'super_admin',
        isVerified: true,
        isVerifiedBadge: true,
      });

      await user.save();
      console.log(`\n🎉 SUCCESS: New SUPER_ADMIN account created successfully!`);
      console.log(`Email: ${user.email}`);
      console.log(`Role: ${user.role}`);
    }

    console.log('\nYou can now log in at http://localhost:5174/login with these credentials.\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to create/elevate Super Admin:', error.message);
    process.exit(1);
  }
};

run();
