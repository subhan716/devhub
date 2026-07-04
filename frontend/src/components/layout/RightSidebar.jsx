import { Link } from 'react-router-dom';

const RightSidebar = () => {
  const suggestedUsers = [
    {
      name: 'Sarah Kim',
      handle: '@sarah_k',
      avatar: 'https://cdn.pixabay.com/photo/2018/01/06/09/25/hijab-3064633_1280.jpg',
      skills: ['React', 'TypeScript', 'GraphQL'],
    },
    {
      name: 'Leo Wang',
      handle: '@leow',
      avatar: 'https://cdn.pixabay.com/photo/2016/11/18/19/07/happy-1836445_1280.jpg',
      skills: ['Node.js', 'AWS', 'Go'],
    },
    {
      name: 'Ava Garcia',
      handle: '@avag',
      avatar: 'https://cdn.pixabay.com/photo/2017/12/31/15/56/portrait-3052641_1280.jpg',
      skills: ['Python', 'AI', 'ML'],
    },
  ];

  return (
    <div className="w-80 h-screen fixed right-0 top-0 border-l border-white/5 bg-[#0a0a0a] pt-24 pb-6 px-6 hidden lg:block overflow-y-auto scrollbar-none">
      <div className="bg-[#111] border border-white/5 rounded-2xl p-5 shadow-lg">
        <h3 className="text-white font-semibold mb-6">Suggested to Follow</h3>
        
        <div className="flex flex-col gap-6">
          {suggestedUsers.map((user) => (
            <div key={user.handle} className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-white/10" />
                  <div className="flex flex-col">
                    <span className="text-white text-sm font-medium">{user.name}</span>
                    <span className="text-gray-500 text-xs">{user.handle}</span>
                  </div>
                </div>
                <button className="px-4 py-1.5 bg-[#00F0FF]/10 text-[#00F0FF] hover:bg-[#00F0FF]/20 text-xs font-semibold rounded-full transition-colors border border-[#00F0FF]/20">
                  Follow
                </button>
              </div>
              <div className="flex flex-wrap gap-2 pl-13">
                {user.skills.map((skill) => (
                  <span key={skill} className="px-2 py-0.5 border border-white/10 rounded-full text-[10px] text-gray-400 bg-white/5">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Footer Links */}
      <div className="mt-8 flex flex-wrap gap-x-4 gap-y-2 px-2 text-[11px] text-gray-600">
        <Link to="#" className="hover:text-gray-400 transition-colors">About</Link>
        <Link to="#" className="hover:text-gray-400 transition-colors">Accessibility</Link>
        <Link to="#" className="hover:text-gray-400 transition-colors">Help Center</Link>
        <Link to="#" className="hover:text-gray-400 transition-colors">Privacy & Terms</Link>
        <Link to="#" className="hover:text-gray-400 transition-colors">Advertising</Link>
        <div className="w-full mt-2">© 2026 DevHub Corporation</div>
      </div>
    </div>
  );
};

export default RightSidebar;
