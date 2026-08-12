import { create } from 'zustand';

const useFeedStore = create((set, get) => ({
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
    posts: state.posts.map(p => p._id === updatedPost._id ? updatedPost : p)
  })),
  
  resetFeed: () => set({ posts: [], page: 1, hasMore: true, isInitialized: false })
}));

export default useFeedStore;
