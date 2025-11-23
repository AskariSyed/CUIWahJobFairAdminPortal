/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Building2, 
  MapPin, 
  Mail, 
  Plus, 
  Briefcase, 
  X,
  Globe,
  Loader2
} from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

// 🔧 CONFIGURATION: Backend Base URL
const BACKEND_URL = "https://localhost:7050"; 

const getLogoUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path; 
  return `${BACKEND_URL}${path}`; 
};

// ----------------------------------------------------------------------
// Modal: Add On-Spot Company
// ----------------------------------------------------------------------
const AddCompanyModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({ name: '', industry: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/admin/companies/onspot', formData);
      toast.success(`${formData.name} added successfully!`);
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to add company.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
      >
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-gray-800">Add On-Spot Company</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
            <input 
              type="text" 
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="e.g. Tech Solutions Inc."
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
            <select 
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
              value={formData.industry}
              onChange={(e) => setFormData({...formData, industry: e.target.value})}
              required
            >
              <option value="">Select Industry...</option>
              <option value="Software Development">Software Development</option>
              <option value="Artificial Intelligence">Artificial Intelligence</option>
              <option value="Engineering">Engineering</option>
              <option value="Telecommunications">Telecommunications</option>
              <option value="Business & Finance">Business & Finance</option>
            </select>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Company'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ----------------------------------------------------------------------
// Main Page Component
// ----------------------------------------------------------------------
const CompaniesList = () => {
  const navigate = useNavigate(); // Hook for navigation
  const [companies, setCompanies] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, totalCount: 0 });

  const fetchCompanies = async (page = 1) => {
    setLoading(true);
    try {
      // Backend returns { companies: [...], totalCount: ... }
      const res = await api.get(`/admin/companies?page=${page}&pageSize=50`); 
      
      setCompanies(res.data.companies || []); 
      setMeta({
        page: res.data.page,
        totalPages: res.data.totalPages,
        totalCount: res.data.totalCount
      });

    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch companies.");
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies(1);
  }, []);

  // Filter Logic
  const filteredCompanies = companies.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.industry?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Participating Companies</h1>
          <p className="text-gray-500 text-sm">Manage company registrations and room allocations.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm transition hover:-translate-y-0.5"
        >
          <Plus size={18} />
          Add On-Spot Company
        </button>
      </div>

      {/* Search & Stats Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Search */}
        <div className="lg:col-span-2 bg-white p-1.5 rounded-xl border shadow-sm flex items-center">
          <Search className="ml-3 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by company name or industry..." 
            className="w-full px-4 py-2 outline-none text-sm text-gray-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Quick Stat */}
        <div className="bg-indigo-50 rounded-xl border border-indigo-100 p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-indigo-600 uppercase">Total Registered</p>
            <p className="text-2xl font-bold text-indigo-900">{meta.totalCount}</p>
          </div>
          <div className="p-2 bg-white rounded-lg text-indigo-600">
            <Building2 size={24} />
          </div>
        </div>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence>
          {loading ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-xl border shadow-sm h-48 animate-pulse">
                <div className="h-12 w-12 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 w-3/4 mb-2 rounded"></div>
                <div className="h-3 bg-gray-200 w-1/2 rounded"></div>
              </div>
            ))
          ) : filteredCompanies.length > 0 ? (
            filteredCompanies.map((company) => (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={company.companyId}
                // 👇 Click Handler for Navigation
                onClick={() => navigate(`/admin/companies/${company.companyId}`)}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col relative overflow-hidden cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 group-hover:bg-indigo-50 transition-colors">
                    {company.logoUrl ? (
                      <img src={getLogoUrl(company.logoUrl)} alt="Logo" className="w-8 h-8 object-contain" />
                    ) : (
                      <Building2 className="text-gray-400 group-hover:text-indigo-400" size={24} />
                    )}
                  </div>
                  {company.roomName ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <MapPin size={12} className="mr-1" /> {company.roomName}
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Not Allocated
                    </span>
                  )}
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-indigo-600 transition-colors" title={company.name}>
                  {company.name}
                </h3>
                
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <Briefcase size={14} className="mr-1.5" />
                  {company.industry || 'General Industry'}
                </div>
                
                <div className="mt-auto pt-4 border-t border-gray-100 space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail size={14} className="mr-2 text-gray-400" />
                    <span className="truncate">{company.userEmail || 'No email provided'}</span>
                  </div>
                  {company.website && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Globe size={14} className="mr-2 text-gray-400" />
                      <span className="truncate">{company.website.replace(/^https?:\/\//, '')}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-16 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No companies found.</p>
              <p className="text-sm text-gray-400">Try adjusting your search or add a new company.</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Pagination Footer */}
      {!loading && meta.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
           <button 
             disabled={meta.page <= 1}
             onClick={() => fetchCompanies(meta.page - 1)}
             className="px-4 py-2 border rounded-lg bg-white text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
           >
             Previous
           </button>
           <span className="px-4 py-2 text-sm text-gray-600 flex items-center">
             Page {meta.page} of {meta.totalPages}
           </span>
           <button 
             disabled={meta.page >= meta.totalPages}
             onClick={() => fetchCompanies(meta.page + 1)}
             className="px-4 py-2 border rounded-lg bg-white text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
           >
             Next
           </button>
        </div>
      )}

      {/* Add Modal */}
      {isModalOpen && (
        <AddCompanyModal 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => fetchCompanies(1)} 
        />
      )}
    </div>
  );
};

export default CompaniesList;