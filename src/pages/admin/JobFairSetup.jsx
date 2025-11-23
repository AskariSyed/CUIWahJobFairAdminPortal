import React, { useState } from 'react';
import { Calendar, CheckCircle, AlertCircle, Plus } from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

const JobFairSetup = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    semester: '',
    date: '',
    isActive: true
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Matches AdminController.cs [HttpPost("jobfairs")]
      await api.post('/admin/jobfairs', {
        semester: formData.semester,
        date: new Date(formData.date).toISOString(), // Ensure ISO format
        isActive: formData.isActive
      });

      toast.success("Job Fair created and activated!");
      // Optional: Reset form or redirect
      setFormData({ semester: '', date: '', isActive: true });
      
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data || "Failed to create Job Fair");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Event Setup</h1>
        <p className="text-gray-500 text-sm">Create and activate a new Job Fair event.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
          <Calendar className="text-indigo-600" size={24} />
          <h2 className="font-semibold text-gray-800">New Job Fair Details</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          {/* Semester Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Semester / Title</label>
            <input 
              type="text" 
              required
              placeholder="e.g. Spring 2025 or Fall Recruitment Drive"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              value={formData.semester}
              onChange={(e) => setFormData({...formData, semester: e.target.value})}
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Event Date</label>
            <input 
              type="date" 
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none transition"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
            />
          </div>

          {/* Active Status Info */}
          <div className="bg-blue-50 p-4 rounded-lg flex gap-3 items-start">
            <AlertCircle className="text-blue-600 shrink-0 mt-0.5" size={20} />
            <div className="text-sm text-blue-800">
              <p className="font-semibold">Note on Activation</p>
              <p className="mt-1">
                Creating a new Job Fair with <strong>Active</strong> status will automatically deactivate any previous Job Fairs. 
                All new Room and Company data will be linked to this event.
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex items-center justify-center py-4 px-6 rounded-lg shadow-lg shadow-indigo-500/20 text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all font-semibold disabled:opacity-70"
          >
            {loading ? 'Creating Event...' : 'Create & Activate Job Fair'}
          </button>

        </form>
      </div>
    </div>
  );
};

export default JobFairSetup;