import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const AddCertificationInline = ({ setProfile, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    issuingOrganization: '',
    issueDate: '',
    credentialUrl: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [companySuggestions, setCompanySuggestions] = useState([]);
  const [isCompanyFocused, setIsCompanyFocused] = useState(false);
  const [isSearchingCompany, setIsSearchingCompany] = useState(false);

  const { title, issuingOrganization, issueDate, credentialUrl } = formData;

  useEffect(() => {
    const fetchCompanySuggestions = async () => {
      if (!issuingOrganization || issuingOrganization.length < 2) {
        setCompanySuggestions([]);
        return;
      }
      setIsSearchingCompany(true);
      try {
        const response = await fetch(`https://autocomplete.clearbit.com/v1/companies/suggest?query=${issuingOrganization}`);
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
  }, [issuingOrganization]);

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!title || !issuingOrganization || !issueDate) {
      return toast.error('Please fill required fields (Title, Organization, Date)');
    }
    
    setIsLoading(true);
    try {
      const { data } = await axios.put(`${import.meta.env.VITE_API_URL}/api/profile/certifications`, formData, { withCredentials: true });
      setProfile(data);
      toast.success('Certification added successfully!');
      if (onClose) onClose();
    } catch (err) {
      toast.error('Failed to add certification');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={isCompanyFocused ? "!overflow-visible" : "overflow-hidden"}
    >
      <div className="bg-[#1a1a1a] border border-white/10 rounded-xl mt-4 p-5">
        <h3 className="text-lg font-bold text-white mb-4">Add Certification</h3>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 relative">
              <label className="text-xs font-medium text-gray-400">Certification Name *</label>
              <input
                type="text"
                name="title"
                value={title}
                onChange={onChange}
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg py-2 px-3 text-white focus:border-[#00F0FF]/50 outline-none text-sm"
                placeholder="e.g. AWS Certified Solutions Architect"
                required
              />
            </div>

            <div className={`space-y-1.5 relative ${isCompanyFocused ? 'z-50' : ''}`}>
              <label className="text-xs font-medium text-gray-400">Issuing Organization *</label>
              <input
                type="text"
                name="issuingOrganization"
                value={issuingOrganization}
                onChange={onChange}
                onFocus={() => setIsCompanyFocused(true)}
                onBlur={() => setTimeout(() => setIsCompanyFocused(false), 200)}
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg py-2 px-3 text-white focus:border-[#00F0FF]/50 outline-none text-sm"
                placeholder="e.g. Amazon"
                required
              />
              {isCompanyFocused && (issuingOrganization.length >= 2) && (
                <div className="absolute z-10 w-full mt-1 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-48 overflow-y-auto overscroll-contain">
                  {isSearchingCompany ? (
                    <div className="px-4 py-3 text-xs text-gray-400">Searching...</div>
                  ) : companySuggestions.length > 0 ? (
                    companySuggestions.map((company, idx) => (
                      <div 
                        key={idx} 
                        className="px-4 py-2.5 flex items-center gap-3 hover:bg-[#00F0FF]/10 hover:text-white cursor-pointer transition-colors"
                        onClick={() => {
                          setFormData({ ...formData, issuingOrganization: company.name });
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 relative">
              <label className="text-xs font-medium text-gray-400">Issue Date *</label>
              <input
                type="date"
                name="issueDate"
                value={issueDate}
                onChange={onChange}
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg py-2 px-3 text-white focus:border-[#00F0FF]/50 outline-none text-sm [color-scheme:dark]"
                required
              />
            </div>

            <div className="space-y-1.5 relative">
              <label className="text-xs font-medium text-gray-400">Credential URL (Optional)</label>
              <input
                type="url"
                name="credentialUrl"
                value={credentialUrl}
                onChange={onChange}
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg py-2 px-3 text-white focus:border-[#00F0FF]/50 outline-none text-sm"
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default AddCertificationInline;
