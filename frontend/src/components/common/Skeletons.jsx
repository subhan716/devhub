import React from 'react';

// Generic Shimmer Base (Adaptive Light Slate / Dark Obsidian)
export const Shimmer = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-200 dark:bg-white/5 rounded ${className}`} />
);

export const PostSkeleton = () => (
  <div className="bg-white dark:bg-[#111] rounded-2xl p-5 mb-6 border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none">
    <div className="flex justify-between items-start mb-4">
      <div className="flex gap-3 w-full">
        <Shimmer className="w-10 h-10 rounded-full" />
        <div className="flex flex-col gap-2 w-1/3 pt-1">
          <Shimmer className="h-3 w-full" />
          <Shimmer className="h-2 w-2/3" />
        </div>
      </div>
    </div>
    
    <div className="flex flex-col gap-2 mb-4">
      <Shimmer className="h-3 w-full" />
      <Shimmer className="h-3 w-5/6" />
      <Shimmer className="h-3 w-4/6" />
    </div>

    <Shimmer className="h-48 w-full rounded-xl mb-4" />

    <div className="flex items-center gap-6 pt-4 border-t border-slate-100 dark:border-white/5">
      <Shimmer className="h-5 w-16 rounded-full" />
      <Shimmer className="h-5 w-16 rounded-full" />
      <Shimmer className="h-5 w-16 rounded-full" />
    </div>
  </div>
);

export const ChatListSkeleton = () => (
  <div className="flex items-center gap-3 p-3 w-full">
    <Shimmer className="w-12 h-12 rounded-full flex-shrink-0" />
    <div className="flex flex-col gap-2 w-full pt-1">
      <div className="flex justify-between w-full">
        <Shimmer className="h-3 w-1/2" />
        <Shimmer className="h-2 w-8" />
      </div>
      <Shimmer className="h-2 w-3/4" />
    </div>
  </div>
);

export const MessageSkeleton = ({ isOwn }) => (
  <div className={`flex w-full ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
    {!isOwn && <Shimmer className="w-8 h-8 rounded-full mr-2 flex-shrink-0" />}
    <Shimmer className={`h-10 rounded-2xl ${isOwn ? 'w-1/3' : 'w-1/2'}`} />
  </div>
);

export const ConnectionSkeleton = () => (
  <div className="bg-white dark:bg-[#111] rounded-2xl p-5 border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none flex flex-col items-center text-center">
    <Shimmer className="w-20 h-20 rounded-full mb-3" />
    <Shimmer className="h-4 w-3/4 mb-2" />
    <Shimmer className="h-3 w-1/2 mb-4" />
    <Shimmer className="h-9 w-full rounded-full" />
  </div>
);

export const ProfileHeaderSkeleton = () => (
  <div className="relative">
    <Shimmer className="w-full h-48 md:h-64 rounded-b-3xl" />
    <div className="px-4 sm:px-8 max-w-5xl mx-auto -mt-16 sm:-mt-20 relative z-10">
      <div className="bg-white dark:bg-[#111] rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-2xl border border-slate-200 dark:border-white/10 flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start text-center md:text-left">
        <Shimmer className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-slate-100 dark:border-[#111]" />
        <div className="flex-1 mt-2 md:mt-6 w-full flex flex-col items-center md:items-start gap-3">
          <Shimmer className="h-8 w-1/2" />
          <Shimmer className="h-4 w-3/4" />
          <div className="flex gap-4 mt-2">
            <Shimmer className="h-8 w-24 rounded-full" />
            <Shimmer className="h-8 w-24 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const CommentSkeleton = () => (
  <div className="flex gap-3 mb-5">
    <Shimmer className="w-9 h-9 rounded-full flex-shrink-0" />
    <div className="flex-1 space-y-2 pt-1">
      <Shimmer className="h-3 w-1/4" />
      <Shimmer className="h-10 w-full rounded-2xl rounded-tl-none" />
      <div className="flex gap-4">
        <Shimmer className="h-2 w-8" />
        <Shimmer className="h-2 w-12" />
      </div>
    </div>
  </div>
);

export const PageSkeleton = () => (
  <div className="bg-slate-50 dark:bg-[#050505] min-h-[100dvh] text-slate-900 dark:text-white flex flex-col overflow-hidden w-full absolute inset-0 z-50">
    {/* Navbar Skeleton */}
    <div className="h-16 border-b border-slate-200 dark:border-white/5 flex items-center justify-between px-4 sm:px-6 lg:px-8 w-full bg-white dark:bg-[#050505]">
      <div className="flex items-center gap-4">
        <Shimmer className="w-8 h-8 rounded-xl" />
        <Shimmer className="w-24 h-6 hidden sm:block" />
      </div>
      <div className="flex-1 max-w-xl px-4 hidden md:block">
        <Shimmer className="w-full h-10 rounded-lg" />
      </div>
      <div className="flex items-center gap-4">
        <Shimmer className="w-8 h-8 rounded-full hidden sm:block" />
        <Shimmer className="w-8 h-8 rounded-full hidden sm:block" />
        <Shimmer className="w-10 h-10 rounded-full" />
      </div>
    </div>

    {/* Main Body Skeleton */}
    <div className="flex-1 max-w-7xl mx-auto w-full flex">
      {/* Sidebar Skeleton (Hidden on mobile) */}
      <div className="hidden lg:flex w-64 flex-col gap-4 py-6 pr-6 border-r border-slate-200 dark:border-white/5">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="flex items-center gap-4 p-3">
            <Shimmer className="w-6 h-6 rounded-md" />
            <Shimmer className="h-4 w-32" />
          </div>
        ))}
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1 w-full p-4 sm:p-6 flex flex-col gap-6">
        <div className="bg-white dark:bg-[#111] rounded-2xl p-5 mb-2 border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none flex gap-4">
           <Shimmer className="w-12 h-12 rounded-full flex-shrink-0" />
           <Shimmer className="flex-1 h-12 rounded-xl" />
        </div>
        {[1, 2].map(i => (
          <PostSkeleton key={`post-${i}`} />
        ))}
      </div>

      {/* Right Sidebar Skeleton (Hidden on smaller screens) */}
      <div className="hidden xl:flex w-80 flex-col gap-6 py-6 pl-6 border-l border-slate-200 dark:border-white/5">
        <div className="bg-white dark:bg-[#111] rounded-2xl p-5 border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none flex flex-col gap-4">
          <Shimmer className="h-4 w-1/2 mb-2" />
          {[1, 2, 3].map(i => (
            <div key={`sug-${i}`} className="flex items-center gap-3">
              <Shimmer className="w-10 h-10 rounded-full flex-shrink-0" />
              <div className="flex flex-col gap-2 flex-1">
                <Shimmer className="h-3 w-3/4" />
                <Shimmer className="h-2 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);
