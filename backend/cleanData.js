const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const Post = require('./src/models/Post');

const cleanDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');

    const posts = await Post.find({});
    
    let updated = 0;
    for (let post of posts) {
      const actualLikesCount = post.likes ? post.likes.length : 0;
      const actualRepostsCount = post.reposts ? post.reposts.length : 0;
      
      let needsUpdate = false;
      if (post.likesCount !== actualLikesCount) {
        post.likesCount = actualLikesCount;
        needsUpdate = true;
      }
      
      if (post.repostsCount !== actualRepostsCount) {
        post.repostsCount = actualRepostsCount;
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        await post.save();
        updated++;
      }
    }
    
    console.log(`Data cleanup completed! Updated ${updated} posts.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

cleanDb();
