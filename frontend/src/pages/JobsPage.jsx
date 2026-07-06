import { useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, MapPin, Search, DollarSign, Clock, Building2, BookmarkPlus, ExternalLink } from 'lucide-react';

const DUMMY_JOBS = [
  {
    id: 1,
    title: 'Senior Frontend Engineer',
    company: 'Vercel',
    logo: 'https://logo.clearbit.com/vercel.com',
    location: 'Remote, US',
    type: 'Full-time',
    salary: '$140k - $180k',
    postedAt: '2h ago',
    tags: ['React', 'Next.js', 'TypeScript']
  },
  {
    id: 2,
    title: 'Backend Developer',
    company: 'Stripe',
    logo: 'https://logo.clearbit.com/stripe.com',
    location: 'San Francisco, CA',
    type: 'Full-time',
    salary: '$160k - $210k',
    postedAt: '5h ago',
    tags: ['Node.js', 'PostgreSQL', 'AWS']
  },
  {
    id: 3,
    title: 'Full Stack Engineer',
    company: 'Supabase',
    logo: 'https://logo.clearbit.com/supabase.com',
    location: 'Remote, Global',
    type: 'Full-time',
    salary: '$130k - $160k',
    postedAt: '1d ago',
    tags: ['React', 'PostgreSQL', 'Go']
  },
  {
    id: 4,
    title: 'Mobile Engineer (React Native)',
    company: 'Discord',
    logo: 'https://logo.clearbit.com/discord.com',
    location: 'San Francisco, CA',
    type: 'Full-time',
    salary: '$150k - $190k',
    postedAt: '2d ago',
    tags: ['React Native', 'TypeScript', 'iOS']
  }
];

const JobsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header & Search */}
      <div className="bg-[#111] border border-white/5 rounded-2xl p-6 shadow-lg">
        <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <Briefcase className="text-[#00F0FF]" /> Developer Jobs
        </h1>
        <p className="text-gray-400 mb-6 text-sm">Find your next role at top tech companies.</p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="text-gray-500" size={20} />
            </div>
            <input 
              type="text" 
              placeholder="Search by job title, skill, or company..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#00F0FF]/50 focus:ring-1 focus:ring-[#00F0FF]/50 transition-all"
            />
          </div>
          <button className="px-8 py-3 bg-gradient-to-r from-[#00F0FF] to-[#8A2BE2] text-white font-bold rounded-xl hover:opacity-90 transition-opacity cursor-pointer">
            Search
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {['All Jobs', 'Remote', 'Frontend', 'Backend', 'Full Stack'].map((filter, index) => (
          <button 
            key={index}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${index === 0 ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-white/5'}`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        {DUMMY_JOBS.map((job, index) => (
          <motion.div 
            key={job.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-[#111] border border-white/5 rounded-2xl p-5 shadow-lg hover:border-[#00F0FF]/30 hover:shadow-[0_0_20px_rgba(0,240,255,0.05)] transition-all group"
          >
            <div className="flex items-start gap-4">
              <img 
                src={job.logo} 
                alt={job.company} 
                className="w-14 h-14 rounded-xl object-contain bg-white p-2"
                onError={(e) => { e.target.src = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'; }}
              />
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-lg font-bold text-white group-hover:text-[#00F0FF] transition-colors cursor-pointer">
                    {job.title}
                  </h3>
                  <button className="text-gray-500 hover:text-white transition-colors cursor-pointer p-1">
                    <BookmarkPlus size={20} />
                  </button>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-4 mt-2">
                  <span className="flex items-center gap-1.5 font-medium text-gray-300">
                    <Building2 size={16} /> {job.company}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin size={16} /> {job.location}
                  </span>
                  <span className="flex items-center gap-1.5 text-green-400">
                    <DollarSign size={16} /> {job.salary}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={16} /> {job.postedAt}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2 flex-wrap">
                    {job.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-white/5 text-gray-300 rounded-lg text-xs font-medium border border-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <button className="flex items-center gap-2 text-sm font-semibold text-[#00F0FF] bg-[#00F0FF]/10 hover:bg-[#00F0FF]/20 px-4 py-2 rounded-lg transition-colors cursor-pointer ml-4">
                    Apply <ExternalLink size={16} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default JobsPage;
