import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const degreeOptions = [
  'High School Diploma', 'GED', 'Associate of Arts (A.A.)', 'Associate of Science (A.S.)', 
  'Associate of Applied Science (A.A.S.)', 'Bachelor of Arts (B.A.)', 'Bachelor of Science (B.S.)',
  'Bachelor of Fine Arts (B.F.A.)', 'Bachelor of Architecture (B.Arch.)', 'Bachelor of Business Administration (B.B.A.)',
  'Bachelor of Computer Science (B.Comp.Sc.)', 'Bachelor of Engineering (B.Eng.)',
  'Bachelor of Technology (B.Tech.)', 'Bachelor of Information Technology (B.I.T.)',
  'Bachelor of Medicine, Bachelor of Surgery (MBBS)', 'Master of Arts (M.A.)', 
  'Master of Science (M.S.)', 'Master of Business Administration (M.B.A.)',
  'Master of Fine Arts (M.F.A.)', 'Master of Public Health (M.P.H.)',
  'Master of Engineering (M.Eng.)', 'Master of Technology (M.Tech.)',
  'Master of Computer Applications (M.C.A.)', 'Doctor of Philosophy (Ph.D.)',
  'Juris Doctor (J.D.)', 'Doctor of Medicine (M.D.)', 'Doctor of Education (Ed.D.)',
  'Doctor of Business Administration (D.B.A.)', 'Postgraduate Certificate', 
  'Postgraduate Diploma', 'Bootcamp Certificate', 'Professional Certificate',
  'Diploma in Engineering', 'Advanced Diploma', 'Higher National Diploma (HND)'
];

const fieldOfStudyOptions = [
  'Computer Science', 'Software Engineering', 'Information Technology',
  'Data Science', 'Artificial Intelligence', 'Cybersecurity',
  'Business Administration', 'Marketing', 'Finance', 'Accounting',
  'Graphic Design', 'UI/UX Design', 'Mathematics', 'Physics', 'Biology',
  'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering'
];

const AddEducationInline = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    school: '',
    degree: '',
    fieldOfStudy: '',
    from: '',
    to: '',
    current: false,
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [schoolSuggestions, setSchoolSuggestions] = useState([]);
  const [isSchoolFocused, setIsSchoolFocused] = useState(false);
  const [isSearchingSchool, setIsSearchingSchool] = useState(false);
  const [isDegreeFocused, setIsDegreeFocused] = useState(false);
  const [isFieldFocused, setIsFieldFocused] = useState(false);

  let degreeSuggestions = [];
  if (formData.degree.trim().length > 0 && isDegreeFocused) {
    const matches = degreeOptions
      .filter(d => d.toLowerCase().includes(formData.degree.toLowerCase()))
      .slice(0, 5);
    const exactMatch = matches.some(m => m.toLowerCase() === formData.degree.toLowerCase());
    degreeSuggestions = exactMatch ? matches : [formData.degree, ...matches];
  }

  let fieldSuggestions = [];
  if (formData.fieldOfStudy.trim().length > 0 && isFieldFocused) {
    const matches = fieldOfStudyOptions
      .filter(f => f.toLowerCase().includes(formData.fieldOfStudy.toLowerCase()))
      .slice(0, 5);
    const exactMatch = matches.some(m => m.toLowerCase() === formData.fieldOfStudy.toLowerCase());
    fieldSuggestions = exactMatch ? matches : [formData.fieldOfStudy, ...matches];
  }

  useEffect(() => {
    const fetchSchoolSuggestions = async () => {
      if (!formData.school || formData.school.length < 3) {
        setSchoolSuggestions([]);
        return;
      }
      setIsSearchingSchool(true);
      try {
        const response = await fetch(`http://universities.hipolabs.com/search?name=${formData.school}`);
        if (!response.ok) throw new Error('API Error');
        const data = await response.json();
        // The API returns an array, sometimes very large, so we limit to top 15 results
        setSchoolSuggestions(data.slice(0, 15));
      } catch (err) {
        console.error('Failed to fetch universities:', err);
      } finally {
        setIsSearchingSchool(false);
      }
    };

    const timer = setTimeout(() => {
      fetchSchoolSuggestions();
    }, 400);

    return () => clearTimeout(timer);
  }, [formData.school]);

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
      const { data } = await axios.put('http://localhost:5000/api/profile/education', formData, { withCredentials: true });
      onAdd(data);
      toast.success('Education added successfully!');
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add education');
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
        <h3 className="text-lg font-bold text-white mb-4">Add Education</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 relative">
              <label className="text-xs font-medium text-gray-400">School / University *</label>
              <input 
                type="text" 
                name="school" 
                value={formData.school} 
                onChange={handleChange}
                onFocus={() => setIsSchoolFocused(true)}
                onBlur={() => setTimeout(() => setIsSchoolFocused(false), 200)}
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg py-2 px-3 text-white focus:border-[#00F0FF]/50 outline-none text-sm" 
                required 
                placeholder="e.g. MIT" 
              />
              {isSchoolFocused && (formData.school.length >= 3) && (
                <div className="absolute z-10 w-full mt-1 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-48 overflow-y-auto">
                  {isSearchingSchool ? (
                    <div className="px-4 py-3 text-xs text-gray-400">Searching...</div>
                  ) : schoolSuggestions.length > 0 ? (
                    schoolSuggestions.map((school, idx) => (
                      <div 
                        key={idx} 
                        className="px-4 py-2.5 flex flex-col hover:bg-[#00F0FF]/10 hover:text-white cursor-pointer transition-colors"
                        onClick={() => {
                          setFormData({ ...formData, school: school.name });
                          setIsSchoolFocused(false);
                        }}
                      >
                        <span className="text-sm text-gray-300 font-medium">{school.name}</span>
                        <span className="text-[10px] text-gray-500">{school.country}</span>
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

            <div className="space-y-1.5 relative">
              <label className="text-xs font-medium text-gray-400">Degree *</label>
              <input 
                type="text" 
                name="degree" 
                value={formData.degree} 
                onChange={handleChange}
                onFocus={() => setIsDegreeFocused(true)}
                onBlur={() => setTimeout(() => setIsDegreeFocused(false), 200)}
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg py-2 px-3 text-white focus:border-[#00F0FF]/50 outline-none text-sm" 
                required 
                placeholder="e.g. Bachelor of Science" 
              />
              {degreeSuggestions.length > 0 && isDegreeFocused && (
                <div className="absolute z-10 w-full mt-1 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-48 overflow-y-auto">
                  {degreeSuggestions.map((suggestion, idx) => (
                    <div 
                      key={idx} 
                      className="px-4 py-2.5 text-xs text-gray-300 hover:bg-[#00F0FF]/10 hover:text-white cursor-pointer transition-colors flex justify-between items-center"
                      onClick={() => {
                        setFormData({ ...formData, degree: suggestion });
                        setIsDegreeFocused(false);
                      }}
                    >
                      <span>{suggestion}</span>
                      {suggestion === formData.degree && !degreeOptions.includes(suggestion) && (
                        <span className="text-[#00F0FF] text-[10px]">Use as typed</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1.5 relative">
              <label className="text-xs font-medium text-gray-400">Field of Study *</label>
              <input 
                type="text" 
                name="fieldOfStudy" 
                value={formData.fieldOfStudy} 
                onChange={handleChange}
                onFocus={() => setIsFieldFocused(true)}
                onBlur={() => setTimeout(() => setIsFieldFocused(false), 200)}
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg py-2 px-3 text-white focus:border-[#00F0FF]/50 outline-none text-sm" 
                required 
                placeholder="e.g. Computer Science" 
              />
              {fieldSuggestions.length > 0 && isFieldFocused && (
                <div className="absolute z-10 w-full mt-1 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-48 overflow-y-auto">
                  {fieldSuggestions.map((suggestion, idx) => (
                    <div 
                      key={idx} 
                      className="px-4 py-2.5 text-xs text-gray-300 hover:bg-[#00F0FF]/10 hover:text-white cursor-pointer transition-colors flex justify-between items-center"
                      onClick={() => {
                        setFormData({ ...formData, fieldOfStudy: suggestion });
                        setIsFieldFocused(false);
                      }}
                    >
                      <span>{suggestion}</span>
                      {suggestion === formData.fieldOfStudy && !fieldOfStudyOptions.includes(suggestion) && (
                        <span className="text-[#00F0FF] text-[10px]">Use as typed</span>
                      )}
                    </div>
                  ))}
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

          <label className="flex items-center gap-3 cursor-pointer mt-2 w-max group">
            <div className="relative">
              <input
                type="checkbox"
                name="current"
                checked={formData.current}
                onChange={handleChange}
                className="sr-only"
              />
              <div className={`w-10 h-5 rounded-full transition-all duration-300 ${formData.current ? 'bg-[#00F0FF]/30 border border-[#00F0FF]/60' : 'bg-white/10 border border-white/20'}`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full shadow transition-all duration-300 ${formData.current ? 'translate-x-5 bg-[#00F0FF] shadow-[0_0_8px_rgba(0,240,255,0.6)]' : 'translate-x-0.5 bg-gray-500'}`} />
              </div>
            </div>
            <span className={`text-sm font-medium transition-colors duration-200 ${formData.current ? 'text-[#00F0FF]' : 'text-gray-400 group-hover:text-gray-300'}`}>
              I currently study here
            </span>
          </label>

          <div className="space-y-1.5 mt-4">
            <label className="text-xs font-medium text-gray-400">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows="3" className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg py-2 px-3 text-white focus:border-[#00F0FF]/50 outline-none text-sm resize-none" placeholder="Extracurricular activities, societies, etc."></textarea>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-4 py-2 bg-[#00F0FF] hover:bg-[#00F0FF]/90 text-black rounded-lg text-sm font-bold transition-colors disabled:opacity-50 cursor-pointer">
              <Save size={16} />
              {isSubmitting ? 'Saving...' : 'Save Education'}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default AddEducationInline;
