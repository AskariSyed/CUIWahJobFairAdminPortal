import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Filter, Eye, BookOpen, Award, XCircle, Bell
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import SendNotificationModal from '../../lib/components/SendNotificationModal';
import api, { BACKEND_URL } from '../../lib/api';

// 🔧 CONFIGURATION

const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path; 
  // Now it uses the central configuration
  return `${BACKEND_URL}${path}`; 
};

const StudentsList = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, totalCount: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Notification Modal State
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);

  // Fetch Students (Accepts page AND search query)
  const fetchStudents = async (page = 1, search = '') => {
    setLoading(true);
    try {
      // Append search param if it exists
      const query = search ? `&search=${encodeURIComponent(search)}` : '';
      const res = await api.get(`/admin/students?page=${page}&pageSize=15${query}`);
      
      setStudents(res.data.students);
      setMeta({
        page: res.data.page,
        totalPages: res.data.totalPages,
        totalCount: res.data.totalCount
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  // Initial Load
  useEffect(() => {
    fetchStudents(1, searchTerm);
  }, []);

  // Handler: When user types
  const handleSearch = (e) => {
    e.preventDefault(); 
    fetchStudents(1, searchTerm);
  };

  // Handler: Clear search
  const clearSearch = () => {
    setSearchTerm('');
    fetchStudents(1, '');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Directory</h1>
          <p className="text-gray-500 text-sm">View profiles, FYPs, and academic details.</p>
        </div>
        
        <div className="flex flex-wrap gap-2 w-full sm:w-auto items-center">
          
          {/* Notify All Button */}
          <button 
            onClick={() => setIsNotifyModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 shadow-sm transition"
          >
            <Bell size={16} /> Notify All
          </button>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="relative flex-1 sm:w-64">
            <input 
              type="text" 
              placeholder="Search name, reg no..." 
              className="pl-9 pr-8 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-full shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            
            {searchTerm && (
              <button 
                type="button" 
                onClick={clearSearch}
                className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
              >
                <XCircle size={16} />
              </button>
            )}
          </form>

          <button 
            onClick={() => fetchStudents(1, searchTerm)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm transition"
          >
            Search
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Student</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Reg No</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Dept</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">CGPA</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">FYP Title</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-center">Stats</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                 [...Array(5)].map((_, i) => (
                   <tr key={i} className="animate-pulse">
                      <td colSpan="7" className="px-6 py-4"><div className="h-10 bg-gray-100 rounded w-full"></div></td>
                   </tr>
                 ))
              ) : students.length > 0 ? (
                students.map((s) => (
                  <tr key={s.studentId} className="hover:bg-gray-50 transition-colors">
                    {/* Name & Pic */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0 overflow-hidden">
                          {s.profilePicUrl ? (
                            <img src={getImageUrl(s.profilePicUrl)} className="w-full h-full object-cover" alt={s.name} />
                          ) : (
                            s.name?.charAt(0)
                          )}
                        </div>
                        <div>
                           <p className="font-medium text-gray-900">{s.name}</p>
                           <p className="text-xs text-gray-500 truncate max-w-[150px]">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-600">{s.registrationNo}</td>
                    <td className="px-6 py-4"><span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs">{s.department}</span></td>
                    <td className="px-6 py-4"><span className={`font-bold ${s.cgpa >= 3.0 ? 'text-emerald-600' : 'text-gray-600'}`}>{s.cgpa?.toFixed(2)}</span></td>
                    <td className="px-6 py-4 max-w-xs text-sm text-gray-600 truncate" title={s.fypTitle}>{s.fypTitle || '-'}</td>
                    <td className="px-6 py-4 text-center">
                       <div className="flex justify-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1" title="Projects"><BookOpen size={12}/> {s.totalProjects}</span>
                          <span className="flex items-center gap-1" title="Achievements"><Award size={12}/> {s.totalAchievements}</span>
                       </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => navigate(`/admin/students/${s.studentId}`)} 
                        className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 p-2 rounded-lg hover:bg-indigo-100 transition"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-16 text-center text-gray-500">
                    <p>No students found matching <strong>"{searchTerm}"</strong></p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Showing Page {meta.page} of {meta.totalPages}
            </span>
            <div className="flex gap-2">
                <button 
                  onClick={() => fetchStudents(meta.page - 1, searchTerm)} 
                  disabled={meta.page <= 1} 
                  className="px-4 py-2 border rounded-lg bg-white text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button 
                  onClick={() => fetchStudents(meta.page + 1, searchTerm)} 
                  disabled={meta.page >= meta.totalPages} 
                  className="px-4 py-2 border rounded-lg bg-white text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
            </div>
         </div>
      </div>

      {/* Notification Modal */}
      <SendNotificationModal 
        isOpen={isNotifyModalOpen} 
        onClose={() => setIsNotifyModalOpen(false)} 
      />
    </div>
  );
};

export default StudentsList;