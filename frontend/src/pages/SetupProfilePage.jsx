import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Code, GitBranch, TerminalSquare, Building, ArrowRight, UserCircle, X, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

// Predefined Skills for Autocomplete
const COMMON_SKILLS = [
  'HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Next.js', 'Vue.js', 'Angular', 'Svelte',
  'Node.js', 'Express', 'NestJS', 'Python', 'Django', 'Flask', 'FastAPI', 'Java', 'Spring Boot', 
  'C++', 'C#', '.NET', 'Go', 'Rust', 'Ruby', 'Ruby on Rails', 'PHP', 'Laravel', 'Swift', 'Kotlin',
  'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Cassandra', 'Elasticsearch', 'Firebase', 'Supabase',
  'Docker', 'Kubernetes', 'Terraform', 'AWS', 'Azure', 'GCP', 'Jenkins', 'GitHub Actions',
  'GraphQL', 'REST API', 'Tailwind CSS', 'Sass', 'Figma', 'Git', 'Linux', 'Bash', 'Web3', 'Solidity'
];

const MAX_SKILLS = 10;
const MAX_BIO_LENGTH = 160;

const SetupProfilePage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Form State
  const [formData, setFormData] = useState({
    status: '',
    company: '',
    githubusername: '',
    bio: ''
  });

  // Custom State for Skills (Tags)
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [skillSuggestions, setSkillSuggestions] = useState([]);

  // Custom State for Custom Select Dropdown
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const statusOptions = [
    'Software Engineer', 'Frontend Developer', 'Backend Developer', 'Mobile Developer',
    'Product Manager', 'Project Manager', 'Scrum Master',
    'Graphic Designer', 'UI/UX Designer', 'Art Director',
    'Data Scientist', 'Machine Learning Engineer', 'Data Analyst',
    'Digital Marketer', 'SEO Specialist', 'Content Creator', 'Writer / Editor',
    'CEO / Founder', 'Entrepreneur', 'Business Owner',
    'Sales / Business Dev', 'Human Resources (HR)', 'Recruiter',
    'Finance / Accounting', 'Operations Manager',
    'Cybersecurity Analyst', 'DevOps Engineer', 'Cloud Architect',
    'QA Engineer', 'Student / Learner', 'Educator / Teacher', 'Other'
  ];

  // Clearbit Autocomplete State
  const [suggestions, setSuggestions] = useState([]);
  const [isSearchingCompany, setIsSearchingCompany] = useState(false);
  const [isCompanyFocused, setIsCompanyFocused] = useState(false);
  const [selectedCompanyDomain, setSelectedCompanyDomain] = useState(null);

  // Handle outside clicks for dropdowns
  const statusDropdownRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
        setIsStatusDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch from Clearbit
  useEffect(() => {
    const fetchCompanies = async () => {
      if (formData.company.length < 2) {
        setSuggestions([]);
        return;
      }
      setIsSearchingCompany(true);
      try {
        const res = await axios.get(`https://autocomplete.clearbit.com/v1/companies/suggest?query=${formData.company}`);
        setSuggestions(res.data);
      } catch (err) {
        setSuggestions([]);
      } finally {
        setIsSearchingCompany(false);
      }
    };

    const debounce = setTimeout(() => {
      fetchCompanies();
    }, 300);

    return () => clearTimeout(debounce);
  }, [formData.company]);

  // Handle Skills Filtering
  useEffect(() => {
    if (skillInput.trim().length > 0) {
      const filtered = COMMON_SKILLS.filter(
        skill => skill.toLowerCase().includes(skillInput.toLowerCase()) && !selectedSkills.includes(skill)
      );
      setSkillSuggestions(filtered.slice(0, 5)); // Show top 5
    } else {
      setSkillSuggestions([]);
    }
  }, [skillInput, selectedSkills]);

  const handleChange = (e) => {
    let value = e.target.value;

    // Smart formatting for GitHub Username (Extracts username from URL or @handle)
    if (e.target.name === 'githubusername') {
      // Extract from https://github.com/username or github.com/username/repo
      value = value.replace(/^(?:https?:\/\/)?(?:www\.)?github\.com\/([^/]+).*$/i, '$1');
      // Remove @ symbol if present
      value = value.replace(/^@/, '');
      // Remove spaces
      value = value.trim();
    }

    // Clear selected company logo if user starts editing the name again
    if (e.target.name === 'company') {
      setSelectedCompanyDomain(null);
    }
    
    // Bio character limit logic
    if (e.target.name === 'bio' && value.length > MAX_BIO_LENGTH) {
      return;
    }
    
    setFormData({ ...formData, [e.target.name]: value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: null });
  };

  const handleCompanySelect = (companyName, domain) => {
    setFormData({ ...formData, company: companyName });
    setSelectedCompanyDomain(domain);
    setSuggestions([]);
    setIsCompanyFocused(false);
  };

  const addSkill = (skill) => {
    if (selectedSkills.length >= MAX_SKILLS) {
      toast.error(`You can only add up to ${MAX_SKILLS} skills.`);
      setErrors({ ...errors, skills: `Maximum ${MAX_SKILLS} skills allowed.` });
      return;
    }
    
    if (!selectedSkills.includes(skill)) {
      setSelectedSkills([...selectedSkills, skill]);
      setErrors({ ...errors, skills: null });
    }
    setSkillInput('');
    setSkillSuggestions([]);
  };

  const removeSkill = (skillToRemove) => {
    setSelectedSkills(selectedSkills.filter(skill => skill !== skillToRemove));
    if (errors.skills) setErrors({ ...errors, skills: null });
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      
      const typedSkill = skillInput.trim().toLowerCase();
      const exactMatch = COMMON_SKILLS.find(s => s.toLowerCase() === typedSkill);
      
      if (exactMatch) {
        addSkill(exactMatch);
      } else if (skillSuggestions.length > 0) {
        addSkill(skillSuggestions[0]);
      } else {
        toast.error('Please select a valid technical skill from the list.');
      }
    }
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.status) newErrors.status = 'Professional status is required to join the network.';
    if (selectedSkills.length === 0) newErrors.skills = 'Please add at least one technical skill.';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    // Optional Github username validation (no spaces, standard github format)
    if (formData.githubusername && !/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i.test(formData.githubusername)) {
      newErrors.githubusername = 'Invalid GitHub username format';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (step === 1) {
      if (!validateStep1()) return;
      setStep(2);
      return;
    }

    if (!validateStep2()) {
      toast.error("Please fix the validation errors before deploying.");
      return;
    }

    submitProfile({ ...formData, skills: selectedSkills.join(', ') });
  };

  const handleSkipStep1 = () => {
    // Submit completely empty profile
    submitProfile({ status: '', skills: '' });
  };

  const handleSkipStep2 = () => {
    // Submit with only Step 1 data
    submitProfile({ status: formData.status, skills: selectedSkills.join(', ') });
  };

  const submitProfile = async (submissionData) => {
    setIsSubmitting(true);
    try {
      await axios.post('http://localhost:5000/api/profile', submissionData);
      toast.success('Profile deployed successfully!');
      navigate('/feed'); 
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to deploy profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-[#00F0FF]/30 scrollbar-track-transparent">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] left-[10%] w-[30%] h-[30%] rounded-full bg-[#00F0FF]/10 blur-[100px]" />
        <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] rounded-full bg-[#8A2BE2]/10 blur-[100px]" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-2xl relative z-10">
        <div className="flex justify-center items-center gap-2 mb-6">
          <TerminalSquare className="text-[#00F0FF]" size={32} />
          <span className="text-3xl font-bold text-white tracking-tight">
            Dev<span className="text-[#00F0FF]">Hub</span>
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm font-medium text-gray-400 mb-2 px-1">
            <span className={step >= 1 ? 'text-[#00F0FF]' : ''}>1. Developer Identity</span>
            <span className={step >= 2 ? 'text-[#00F0FF]' : ''}>2. Background & Social</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-[#00F0FF] to-[#8A2BE2] h-2 rounded-full transition-all duration-500"
              style={{ width: step === 1 ? '50%' : '100%' }}
            />
          </div>
        </div>

        <motion.div 
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white/[0.02] py-8 px-4 shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-white/10 sm:rounded-2xl sm:px-10 backdrop-blur-xl min-h-[450px]"
        >
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">
              {step === 1 ? 'Initialize Your Workspace' : 'Link Your Environment'}
            </h2>
            <p className="text-gray-400 text-sm">
              {step === 1 ? "Let's get some basic information to set up your developer profile." : "Add some optional details to make your profile stand out."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8" noValidate>
            {step === 1 && (
              <>
                {/* Custom Select Dropdown */}
                <div className="relative" ref={statusDropdownRef}>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Professional Status <span className="text-[#00F0FF]">*</span>
                  </label>
                  <div 
                    onClick={() => {
                      setIsStatusDropdownOpen(!isStatusDropdownOpen);
                      setErrors({ ...errors, status: null });
                    }}
                    className={`relative rounded-md shadow-sm cursor-pointer ${errors.status ? 'ring-1 ring-red-500' : ''}`}
                  >
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Briefcase className={errors.status ? "text-red-500" : "text-gray-500"} size={18} />
                    </div>
                    <div className={`block w-full pl-10 pr-10 py-3 border ${errors.status ? 'border-red-500 bg-red-500/5' : isStatusDropdownOpen ? 'border-[#00F0FF]/50 ring-1 ring-[#00F0FF]/50' : 'border-white/10'} rounded-lg bg-black/50 text-white transition-all sm:text-sm`}>
                      {formData.status || <span className="text-gray-600">* Select Professional Status</span>}
                    </div>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <ChevronDown className={`text-gray-500 transition-transform ${isStatusDropdownOpen ? 'rotate-180' : ''}`} size={18} />
                    </div>
                  </div>
                  {errors.status && <p className="mt-1 text-xs text-red-500">{errors.status}</p>}
                  
                  <AnimatePresence>
                    {isStatusDropdownOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="absolute z-50 w-full mt-2 bg-[#111] border border-white/10 rounded-lg shadow-2xl py-1 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-[#00F0FF]/30 scrollbar-track-transparent"
                      >
                        {statusOptions.map((option) => (
                          <div
                            key={option}
                            onClick={() => {
                              setFormData({ ...formData, status: option });
                              setIsStatusDropdownOpen(false);
                            }}
                            className={`px-4 py-2 text-sm cursor-pointer transition-colors ${formData.status === option ? 'bg-[#00F0FF]/10 text-[#00F0FF]' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}
                          >
                            {option}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Custom Tags Input */}
                <div>
                  <div className="flex justify-between items-end mb-1">
                    <label className="block text-sm font-medium text-gray-300">
                      Tech Stack (Skills) <span className="text-[#00F0FF]">*</span>
                    </label>
                    <span className={`text-xs ${selectedSkills.length >= MAX_SKILLS ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
                      {selectedSkills.length}/{MAX_SKILLS} Added
                    </span>
                  </div>
                  
                  {/* Selected Tags Display */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedSkills.map((skill) => (
                      <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        key={skill} 
                        className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#00F0FF]/20 to-[#8A2BE2]/20 border border-white/10 text-white text-sm"
                      >
                        {skill}
                        <button type="button" onClick={() => removeSkill(skill)} className="hover:text-[#FF0055] transition-colors ml-1">
                          <X size={14} />
                        </button>
                      </motion.div>
                    ))}
                  </div>

                  <div className={`relative rounded-md shadow-sm ${errors.skills ? 'ring-1 ring-red-500 rounded-lg' : ''}`}>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Code className={errors.skills ? "text-red-500" : "text-gray-500"} size={18} />
                    </div>
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={handleSkillKeyDown}
                      disabled={selectedSkills.length >= MAX_SKILLS}
                      className={`block w-full pl-10 pr-3 py-3 border ${errors.skills ? 'border-red-500 bg-red-500/5' : 'border-white/10'} rounded-lg bg-black/50 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#00F0FF]/50 transition-all sm:text-sm disabled:opacity-50`}
                      placeholder={selectedSkills.length >= MAX_SKILLS ? "Skill limit reached" : "Type a skill and press Enter (e.g. React, Node.js)"}
                      autoComplete="off"
                    />

                    {/* Skill Suggestions Dropdown */}
                    <AnimatePresence>
                      {skillSuggestions.length > 0 && selectedSkills.length < MAX_SKILLS && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          className="absolute z-40 w-full mt-2 bg-[#111] border border-white/10 rounded-lg shadow-2xl max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-[#00F0FF]/30 scrollbar-track-transparent"
                        >
                          {skillSuggestions.map((skill) => (
                            <div
                              key={skill}
                              onClick={() => addSkill(skill)}
                              className="px-4 py-3 hover:bg-white/5 cursor-pointer transition-colors border-b border-white/5 last:border-0 text-white text-sm"
                            >
                              Add <span className="font-bold text-[#00F0FF]">{skill}</span>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  {errors.skills && <p className="mt-1 text-xs text-red-500">{errors.skills}</p>}
                </div>
              </>
            )}

            {step === 2 && (
              <>
                {/* Organization with Clearbit Autocomplete */}
                <div className="relative z-30">
                  <label className="block text-sm font-medium text-gray-300 mb-1">Current Workspace</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      {selectedCompanyDomain ? (
                        <img 
                          src={`https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${selectedCompanyDomain}&size=128`} 
                          alt="Company Logo" 
                          className="w-5 h-5 rounded object-contain bg-white/10 p-0.5" 
                        />
                      ) : (
                        <Building className="text-gray-500" size={18} />
                      )}
                    </div>
                    <input
                      name="company"
                      type="text"
                      value={formData.company}
                      onChange={handleChange}
                      onFocus={() => setIsCompanyFocused(true)}
                      onBlur={() => setTimeout(() => setIsCompanyFocused(false), 200)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          setIsCompanyFocused(false);
                        }
                      }}
                      className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-lg bg-black/50 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#00F0FF]/50 transition-all sm:text-sm"
                      placeholder="e.g. Google, MIT, or Freelance"
                      autoComplete="off"
                    />
                  </div>
                  
                  {/* Autocomplete Dropdown */}
                  <AnimatePresence>
                    {isCompanyFocused && formData.company.length > 1 && (suggestions.length > 0 || !isSearchingCompany) && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="absolute w-full mt-2 bg-[#111] border border-white/10 rounded-lg shadow-2xl max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-[#00F0FF]/30 scrollbar-track-transparent"
                      >
                        {suggestions.length > 0 ? (
                          suggestions.map((suggestion) => (
                            <div
                              key={suggestion.domain}
                              onClick={() => handleCompanySelect(suggestion.name, suggestion.domain)}
                              className="flex items-center gap-3 p-3 hover:bg-white/5 cursor-pointer transition-colors border-b border-white/5 last:border-0"
                            >
                              <img 
                                src={`https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${suggestion.domain}&size=128`} 
                                alt={suggestion.name} 
                                className="w-6 h-6 rounded object-contain bg-white/10 p-0.5" 
                              />
                              <div>
                                <div className="text-white text-sm font-medium">{suggestion.name}</div>
                                <div className="text-gray-500 text-xs">{suggestion.domain}</div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div 
                            className="p-4 text-sm text-gray-400 text-center cursor-pointer hover:bg-white/5 transition-colors"
                            onClick={() => setSuggestions([])}
                          >
                            <span className="block mb-1">Company not found in global directory.</span>
                            <span className="text-white font-medium">Press <kbd className="bg-white/10 px-2 py-0.5 rounded text-[#00F0FF]">Enter</kbd> to keep "{formData.company}"</span>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="relative z-20">
                  <label className="block text-sm font-medium text-gray-300 mb-1">GitHub Username</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <GitBranch className={errors.githubusername ? "text-red-500" : "text-gray-500"} size={18} />
                    </div>
                    <input
                      name="githubusername"
                      type="text"
                      value={formData.githubusername}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-3 py-3 border ${errors.githubusername ? 'border-red-500 focus:ring-red-500' : 'border-white/10 focus:ring-[#00F0FF]/50'} rounded-lg bg-black/50 text-white placeholder-gray-600 focus:outline-none focus:ring-2 transition-all sm:text-sm`}
                      placeholder="e.g. torvalds or https://github.com/..."
                    />
                  </div>
                  {errors.githubusername && <p className="mt-1 text-xs text-red-500">{errors.githubusername}</p>}
                </div>

                <div className="relative z-10">
                  <div className="flex justify-between items-end mb-1">
                    <label className="block text-sm font-medium text-gray-300">Short Bio</label>
                    <span className="text-xs text-gray-500">{formData.bio.length}/{MAX_BIO_LENGTH}</span>
                  </div>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute top-3 left-3 pointer-events-none">
                      <UserCircle className="text-gray-500" size={18} />
                    </div>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      rows={3}
                      className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-lg bg-black/50 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#00F0FF]/50 transition-all sm:text-sm resize-none"
                      placeholder="Tell us a little about yourself"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-4 pt-4 mt-auto">
              {step === 1 && (
                <button
                  type="button"
                  onClick={handleSkipStep1}
                  className="flex-1 py-3 px-4 border border-white/10 rounded-lg text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  Skip Onboarding
                </button>
              )}
              {step === 2 && (
                <>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 px-4 border border-white/20 rounded-lg text-sm font-bold text-white hover:bg-white/5 transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleSkipStep2}
                    className="flex-1 py-3 px-4 border border-white/10 rounded-lg text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                  >
                    Skip for now
                  </button>
                </>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`${step === 1 ? 'flex-[2]' : 'flex-[2]'} flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-black bg-gradient-to-r from-[#00F0FF] to-[#8A2BE2] hover:opacity-90 focus:outline-none transition-all disabled:opacity-50`}
              >
                {step === 1 ? (
                  <>Continue <ArrowRight size={18} /></>
                ) : (
                  <>{isSubmitting ? 'Deploying Profile...' : 'Complete Setup'} <ArrowRight size={18} /></>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default SetupProfilePage;
