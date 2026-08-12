import { create } from 'zustand';

const useFeedStore = create((set) => ({
  posts: [],
  page: 1,
  hasMore: true,
  isInitialized: false,
  
  setPosts: (newPosts) => set({ posts: newPosts, isInitialized: true }),
  
  appendPosts: (newPosts) => set((state) => ({ 
    posts: [...state.posts, ...newPosts] 
  })),
  
  incrementPage: () => set((state) => ({ page: state.page + 1 })),
  
  setHasMore: (hasMore) => set({ hasMore }),
  
  removePost: (postId) => set((state) => ({
    posts: state.posts.filter(p => p._id !== postId)
  })),

  updatePostInFeed: (updatedPost) => set((state) => ({
    posts: state.posts.map(p => p._id === updatedPost._id ? { ...p, ...updatedPost } : p)
  })),

  optimisticLikePost: (postId, userId) => {
    let previousPost = null;
    set((state) => ({
      posts: state.posts.map(p => {
        if (p._id === postId) {
          previousPost = { ...p }; // Clone for backup
          const hasLiked = p.likes.includes(userId);
          return {
            ...p,
            likes: hasLiked ? p.likes.filter(id => id !== userId) : [userId, ...p.likes],
            likesCount: hasLiked ? Math.max(0, p.likesCount - 1) : p.likesCount + 1
          };
        }
        return p;
      })
    }));
    return previousPost; // Return the exact backup so it can be reverted if API fails
  },

  optimisticRepostPost: (postId) => {
    let previousPost = null;
    set((state) => ({
      posts: state.posts.map(p => {
        if (p._id === postId) {
          previousPost = { ...p };
          return { ...p, repostsCount: (p.repostsCount || 0) + 1 };
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
