import { useState, useEffect } from 'react';
import { MapPin, Briefcase, Link as LinkIcon, Calendar, Edit3, Image, Heart, Repeat2, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/profile/me');
        setProfile(data);
      } catch (error) {
        toast.error('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00F0FF]"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center text-gray-500 py-20 bg-[#111] rounded-2xl border border-white/5 max-w-3xl mx-auto">
        <h2 className="text-xl font-bold text-white mb-2">Profile Not Found</h2>
        <p>Please setup your profile to view this page.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-20">
      {/* Cover & Avatar Header */}
      <div className="relative rounded-2xl overflow-hidden mb-8 border border-white/10 bg-[#111]">
        {/* Cover Photo */}
        <div className="h-48 w-full bg-gradient-to-r from-[#00F0FF]/20 via-[#8A2BE2]/20 to-[#00F0FF]/10 relative">
          <div className="absolute inset-0 bg-black/20"></div>
          <button className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/80 rounded-full transition-colors cursor-pointer text-white">
            <Edit3 size={16} />
          </button>
        </div>

        {/* Profile Info Overlay */}
        <div className="px-6 pb-6 relative">
          <div className="flex justify-between items-end -mt-16 mb-4">
            <div className="relative">
              <img 
                src={profile.user?.avatar?.url || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'} 
                alt="Profile" 
                className="w-32 h-32 rounded-full border-4 border-[#111] object-cover bg-[#111]"
              />
              <button className="absolute bottom-0 right-0 p-2 bg-[#00F0FF] text-black rounded-full hover:bg-white transition-colors cursor-pointer shadow-lg">
                <Image size={14} />
              </button>
            </div>
            <button className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full font-medium transition-colors cursor-pointer border border-white/10">
              Edit Profile
            </button>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white leading-tight">{profile.user?.name}</h1>
            <p className="text-[#00F0FF] font-medium text-sm mt-1">{profile.status}</p>
          </div>

          <p className="text-gray-300 mt-4 text-sm max-w-2xl leading-relaxed">
            {profile.bio || 'No bio provided.'}
          </p>

          {/* Quick Info */}
          <div className="flex flex-wrap gap-4 mt-5 text-sm text-gray-400">
            {profile.company && (
              <div className="flex items-center gap-1.5">
                <Briefcase size={16} /> {profile.company}
              </div>
            )}
            {profile.location && (
              <div className="flex items-center gap-1.5">
                <MapPin size={16} /> {profile.location}
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Calendar size={16} /> Joined {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently'}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Details */}
        <div className="md:col-span-1 space-y-6">
          {/* Skills */}
          {profile.skills && profile.skills.length > 0 && (
            <div className="bg-[#111] border border-white/5 rounded-2xl p-5 shadow-lg">
              <h3 className="text-white font-bold mb-4">Tech Stack</h3>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map(skill => (
                  <span key={skill} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-gray-300">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Social Links */}
          <div className="bg-[#111] border border-white/5 rounded-2xl p-5 shadow-lg">
            <h3 className="text-white font-bold mb-4">Links</h3>
            <div className="space-y-3">
              {profile.githubusername && (
                <a href={`https://github.com/${profile.githubusername}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors cursor-pointer text-sm">
                  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                  github.com/{profile.githubusername}
                </a>
              )}
              {profile.socialLinks?.website && (
                <a href={profile.socialLinks.website} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-gray-400 hover:text-[#00F0FF] transition-colors cursor-pointer text-sm">
                  <LinkIcon size={18} /> Personal Website
                </a>
              )}
              {profile.socialLinks?.twitter && (
                <a href={profile.socialLinks.twitter} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-gray-400 hover:text-[#1DA1F2] transition-colors cursor-pointer text-sm">
                  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                  Twitter
                </a>
              )}
              {profile.socialLinks?.linkedin && (
                <a href={profile.socialLinks.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-gray-400 hover:text-[#0A66C2] transition-colors cursor-pointer text-sm">
                  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                  LinkedIn
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Posts Tab (Dummy for now) */}
        <div className="md:col-span-2">
          <div className="bg-[#111] border border-white/5 rounded-2xl p-5 shadow-lg">
            <h3 className="text-white font-bold mb-6 border-b border-white/10 pb-4">Recent Activity</h3>
            
            {/* Dummy Post */}
            <div className="flex flex-col gap-4 border-b border-white/5 pb-6">
              <div className="flex justify-between items-start">
                <div className="flex gap-3">
                  <img 
                    src={profile.user?.avatar?.url || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'} 
                    alt="Profile" 
                    className="w-10 h-10 rounded-full object-cover border border-white/10 cursor-pointer"
                  />
                  <div className="flex flex-col leading-tight cursor-pointer">
                    <span className="text-white font-medium text-sm">{profile.user?.name}</span>
                    <span className="text-xs text-gray-500 mt-0.5">2 days ago</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-200">
                Just updated my portfolio using React and Framer Motion! The animations are buttery smooth. 🚀
              </p>
              <div className="flex items-center gap-6 mt-2 text-xs font-medium text-gray-400">
                <button className="flex items-center gap-2 hover:text-[#00F0FF] transition-colors cursor-pointer">
                  <Heart size={16} /> 12
                </button>
                <button className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
                  <MessageCircle size={16} /> 3
                </button>
                <button className="flex items-center gap-2 hover:text-[#8A2BE2] transition-colors cursor-pointer">
                  <Repeat2 size={16} /> 0
                </button>
              </div>
            </div>

            <div className="text-center text-sm text-gray-500 pt-6">
              More posts will appear here once the feed backend is connected.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
