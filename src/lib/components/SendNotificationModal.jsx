import React, { useState } from 'react';
import { X, Bell, Send, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../api';

const SendNotificationModal = ({ isOpen, onClose, studentId = null, studentName = "All Students" }) => {
  const [formData, setFormData] = useState({ title: '', body: '' });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (studentId) {
        // Single Student Notification
        await api.post(`/admin/students/${studentId}/notify`, formData);
        toast.success(`Notification sent to ${studentName}`);
      } else {
        // Broadcast to All
        const res = await api.post('/admin/students/notify-all', formData);
        toast.success(`Sent: ${res.data.successCount} Success`);
      }
      onClose();
      setFormData({ title: '', body: '' }); // Reset form
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to send notification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <div className="flex items-center gap-2 text-indigo-600">
            <Bell size={20} />
            <h3 className="font-bold text-gray-800">Send Notification</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="bg-blue-50 text-blue-700 text-xs p-3 rounded-lg font-medium">
            To: <span className="font-bold">{studentId ? studentName : "📢 ALL STUDENTS"}</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input 
              type="text" 
              required
              placeholder="e.g. Interview Schedule Updated"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea 
              required
              rows="4"
              placeholder="Type your message here..."
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition resize-none"
              value={formData.body}
              onChange={(e) => setFormData({...formData, body: e.target.value})}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              {loading ? 'Sending...' : 'Send Now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SendNotificationModal;