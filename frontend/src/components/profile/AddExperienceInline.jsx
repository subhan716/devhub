import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

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

const AddExperienceInline = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    from: '',
    to: '',
    current: false,
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [companySuggestions, setCompanySuggestions] = useState([]);
  const [isCompanyFocused, setIsCompanyFocused] = useState(false);
  const [isSearchingCompany, setIsSearchingCompany] = useState(false);
  const [isTitleFocused, setIsTitleFocused] = useState(false);

  let titleSuggestions = [];
  if (formData.title.trim().length > 0 && isTitleFocused) {
    const matches = statusOptions
      .filter(status => status.toLowerCase().includes(formData.title.toLowerCase()))
      .slice(0, 5);
    
    const exactMatch = matches.some(m => m.toLowerCase() === formData.title.toLowerCase());
    titleSuggestions = exactMatch ? matches : [formData.title, ...matches];
  }

  useEffect(() => {
    const fetchCompanySuggestions = async () => {
      if (!formData.company || formData.company.length < 2) {
        setCompanySuggestions([]);
        return;
      }
      setIsSearchingCompany(true);
      try {
        const response = await fetch(`https://autocomplete.clearbit.com/v1/companies/suggest?query=${formData.company}`);
        if (!response.ok) throw new Error('API Error');
        const data = await response.json();
        setCompanySuggestions(data);
      } catch (err) {
        console.error('Failed to fetch companies:', err);
      } finally {
        setIsSearchingCompany(false);
      }
    };

    const timer = setTimeout(() => {
      fetchCompanySuggestions();
    }, 300);

    return () => clearTimeout(timer);
  }, [formData.company]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked, to: checked ? '' : formData.to });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { data } = await axios.put('http://localhost:5000/api/profile/experience', formData, { withCredentials: true });
      onAdd(data); // Pass updated profile to parent
      toast.success('Experience added successfully!');
      onClose(); // Hide inline form
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add experience');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="overflow-hidden"
    >
      <div className="bg-[#1a1a1a] border border-white/10 rounded-xl mt-4 p-5">
        <h3 className="text-lg font-bold text-white mb-4">Add Experience</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 relative">
              <label className="text-xs font-medium text-gray-400">Job Title *</label>
              <input 
                type="text" 
                name="title" 
                value={formData.title} 
                onChange={handleChange}
                onFocus={() => setIsTitleFocused(true)}
                onBlur={() => setTimeout(() => setIsTitleFocused(false), 200)}
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg py-2 px-3 text-white focus:border-[#00F0FF]/50 outline-none text-sm" 
                required 
                placeholder="e.g. Senior Frontend Engineer" 
              />
              {titleSuggestions.length > 0 && isTitleFocused && (
                <div className="absolute z-10 w-full mt-1 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-48 overflow-y-auto">
                  {titleSuggestions.map((suggestion, idx) => (
                    <div 
                      key={idx} 
                      className="px-4 py-2.5 text-xs text-gray-300 hover:bg-[#00F0FF]/10 hover:text-white cursor-pointer transition-colors flex justify-between items-center"
                      onClick={() => {
                        setFormData({ ...formData, title: suggestion });
                        setIsTitleFocused(false);
                      }}
                    >
                      <span>{suggestion}</span>
                      {suggestion === formData.title && !statusOptions.includes(suggestion) && (
                        <span className="text-[#00F0FF] text-[10px]">Use as typed</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1.5 relative">
              <label className="text-xs font-medium text-gray-400">Company *</label>
              <input 
                type="text" 
                name="company" 
                value={formData.company} 
                onChange={handleChange}
                onFocus={() => setIsCompanyFocused(true)}
                onBlur={() => setTimeout(() => setIsCompanyFocused(false), 200)}
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg py-2 px-3 text-white focus:border-[#00F0FF]/50 outline-none text-sm" 
                required 
                placeholder="e.g. Google" 
              />
              {isCompanyFocused && (formData.company.length >= 2) && (
                <div className="absolute z-10 w-full mt-1 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-48 overflow-y-auto">
                  {isSearchingCompany ? (
                    <div className="px-4 py-3 text-xs text-gray-400">Searching...</div>
                  ) : companySuggestions.length > 0 ? (
                    companySuggestions.map((company, idx) => (
                      <div 
                        key={idx} 
                        className="px-4 py-2.5 flex items-center gap-3 hover:bg-[#00F0FF]/10 hover:text-white cursor-pointer transition-colors"
                        onClick={() => {
                          setFormData({ ...formData, company: company.name });
                          setIsCompanyFocused(false);
                        }}
                      >
                        {(company.logo || company.domain) ? (
                          <img 
                            src={company.logo || `https://logo.clearbit.com/${company.domain}`} 
                            alt={company.name} 
                            className="w-5 h-5 rounded object-contain bg-white" 
                            onError={(e) => {
                              if (!e.target.dataset.fallback) {
                                e.target.dataset.fallback = 'true';
                                e.target.src = `https://s2.googleusercontent.com/s2/favicons?domain=${company.domain}&sz=64`;
                              } else {
                                e.target.style.display = 'none';
                                if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                              }
                            }}
                          />
                        ) : null}
                        {(!company.logo && !company.domain) || true ? (
                          <div className={`w-5 h-5 rounded bg-gray-800 items-center justify-center text-[10px] text-white ${company.logo || company.domain ? 'hidden' : 'flex'}`}>
                            {company.name.charAt(0)}
                          </div>
                        ) : null}
                        <span className="text-sm text-gray-300">{company.name}</span>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-xs text-gray-400 flex justify-between items-center">
                      <span>No match found.</span>
                      <span className="text-[#00F0FF]">Will save as typed</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-400">Start Date *</label>
              <input type="date" name="from" value={formData.from} onChange={handleChange} className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg py-2 px-3 text-white focus:border-[#00F0FF]/50 outline-none text-sm" required style={{ colorScheme: 'dark' }} />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-400">End Date</label>
              <input type="date" name="to" value={formData.to} onChange={handleChange} disabled={formData.current} className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg py-2 px-3 text-white focus:border-[#00F0FF]/50 outline-none text-sm disabled:opacity-50" style={{ colorScheme: 'dark' }} />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer mt-2 w-max">
            <input type="checkbox" name="current" checked={formData.current} onChange={handleChange} className="w-4 h-4 rounded bg-[#0a0a0a] border-white/10 text-[#00F0FF] focus:ring-[#00F0FF]/50" />
            <span className="text-sm text-gray-300">I currently work here</span>
          </label>

          <div className="space-y-1.5 mt-4">
            <label className="text-xs font-medium text-gray-400">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows="3" className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg py-2 px-3 text-white focus:border-[#00F0FF]/50 outline-none text-sm resize-none" placeholder="What were your key responsibilities and achievements?"></textarea>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-4 py-2 bg-[#00F0FF] hover:bg-[#00F0FF]/90 text-black rounded-lg text-sm font-bold transition-colors disabled:opacity-50 cursor-pointer">
              <Save size={16} />
              {isSubmitting ? 'Saving...' : 'Save Experience'}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default AddExperienceInline;
