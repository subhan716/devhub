import { create } from 'zustand';

const useFeedStore = create((set) => ({
  posts: [],
  page: 1,
  hasMore: true,
  isInitialized: false,
  
  setPosts: (newPosts) => set({ posts: newPosts, isInitialized: true }),
  
  appendPosts: (newPosts) => set((state) => {
    const existingIds = new Set(state.posts.map(p => p._id || p.id));
    const uniqueNew = newPosts.filter(p => !existingIds.has(p._id || p.id));
    const combined = [...state.posts, ...uniqueNew];
    // Keep max 100 posts in memory to guarantee zero browser heap bloat
    const bounded = combined.length > 100 ? combined.slice(combined.length - 100) : combined;
    return { posts: bounded };
  }),
  
  incrementPage: () => set((state) => ({ page: state.page + 1 })),
  
  setHasMore: (hasMore) => set({ hasMore }),
  
  removePost: (postId) => set((state) => ({
    posts: state.posts.filter(p => p._id !== postId)
  })),

  updatePostInFeed: (updatedPost) => set((state) => ({
    posts: state.posts.map(p => {
      if (p._id === updatedPost._id) return { ...p, ...updatedPost };
      if (p.originalPost && p.originalPost._id === updatedPost._id) {
        return { ...p, originalPost: { ...p.originalPost, ...updatedPost } };
      }
      return p;
    })
  })),

  optimisticLikePost: (postId, userId) => {
    let previousPost = null;
    set((state) => ({
      posts: state.posts.map(p => {
        if (p._id === postId) {
          previousPost = { ...p };
          const hasLiked = p.likes?.includes(userId);
          const newLikes = hasLiked
            ? p.likes.filter(id => id !== userId)
            : [...(p.likes || []), userId];
          const newCount = hasLiked 
            ? Math.max(0, (p.likesCount || 1) - 1) 
            : (p.likesCount || 0) + 1;
          
          return { ...p, likes: newLikes, likesCount: newCount };
        }
        if (p.originalPost && p.originalPost._id === postId) {
          if (!previousPost) previousPost = { ...p.originalPost };
          const hasLiked = p.originalPost.likes?.includes(userId);
          const newLikes = hasLiked
            ? p.originalPost.likes.filter(id => id !== userId)
            : [...(p.originalPost.likes || []), userId];
          const newCount = hasLiked 
            ? Math.max(0, (p.originalPost.likesCount || 1) - 1) 
            : (p.originalPost.likesCount || 0) + 1;
          return { ...p, originalPost: { ...p.originalPost, likes: newLikes, likesCount: newCount } };
        }
        return p;
      })
    }));
    return previousPost; 
  },

  optimisticRepostPost: (postId, userId) => {
    let previousPost = null;
    set((state) => ({
      posts: state.posts.map(p => {
        if (p._id === postId) {
          previousPost = { ...p };
          const hasReposted = p.reposts?.includes(userId);
          const newReposts = hasReposted
            ? p.reposts.filter(id => id !== userId)
            : [...(p.reposts || []), userId];
          const newCount = hasReposted
            ? Math.max(0, (p.repostsCount || 1) - 1)
            : (p.repostsCount || 0) + 1;
          
          return { ...p, reposts: newReposts, repostsCount: newCount };
        }
        if (p.originalPost && p.originalPost._id === postId) {
          if (!previousPost) previousPost = { ...p.originalPost };
          const hasReposted = p.originalPost.reposts?.includes(userId);
          const newReposts = hasReposted
            ? p.originalPost.reposts.filter(id => id !== userId)
            : [...(p.originalPost.reposts || []), userId];
          const newCount = hasReposted
            ? Math.max(0, (p.originalPost.repostsCount || 1) - 1)
            : (p.originalPost.repostsCount || 0) + 1;
          return { ...p, originalPost: { ...p.originalPost, reposts: newReposts, repostsCount: newCount } };
        }
        return p;
      })
    }));
    return previousPost;
  },

  optimisticUpdateCommentsCount: (postId, diff) => {
    set((state) => ({
      posts: state.posts.map(p => {
        if (p._id === postId) {
          return { ...p, commentsCount: Math.max(0, (p.commentsCount || 0) + diff) };
        }
        if (p.originalPost && p.originalPost._id === postId) {
          return { ...p, originalPost: { ...p.originalPost, commentsCount: Math.max(0, (p.originalPost.commentsCount || 0) + diff) } };
        }
        return p;
      })
    }));
  },
  revertPostUpdate: (originalPost) => set((state) => ({
    posts: state.posts.map(p => p._id === originalPost._id ? originalPost : p)
  })),
  
  resetFeed: () => set({ posts: [], page: 1, hasMore: true, isInitialized: false })
}));

export default useFeedStore;
