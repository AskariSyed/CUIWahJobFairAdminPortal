/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useMemo } from 'react';
import { 
  Users, Upload, Download, Plus, Trash2, 
  Search, ArrowUpDown, RotateCcw, FileText
} from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ----------------------------------------------------------------------
// Helper: Status Badge (Updated for C# Enum)
// ----------------------------------------------------------------------
const RoomStatusBadge = ({ status }) => {
  // C# Enum: 0=Vacant, 1=TentativelyAlloted, 2=Alloted
  const styles = {
    0: 'bg-emerald-100 text-emerald-700 border-emerald-200', // Vacant
    1: 'bg-amber-100 text-amber-700 border-amber-200',      // Tentative
    2: 'bg-indigo-100 text-indigo-700 border-indigo-200',   // Alloted
  };
  
  const labels = { 
    0: 'Vacant', 
    1: 'Tentative', 
    2: 'Allocated' 
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${styles[status] || styles[0]}`}>
      {labels[status] || 'Unknown'}
    </span>
  );
};

// ----------------------------------------------------------------------
// Helper: Add Room Modal
// ----------------------------------------------------------------------
const AddRoomModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({ roomName: '', capacity: 30 });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/admin/rooms', formData);
      toast.success('Room added successfully');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to add room");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
        <div className="p-5 border-b bg-gray-50">
          <h3 className="font-bold text-gray-800">Add New Room</h3>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Room Name</label>
            <input type="text" required className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. C-14" value={formData.roomName} onChange={e => setFormData({...formData, roomName: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
            <input type="number" required min="1" className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.capacity} onChange={e => setFormData({...formData, capacity: parseInt(e.target.value)})} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">{loading ? 'Saving...' : 'Save Room'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// Main Page Component
// ----------------------------------------------------------------------
const RoomsManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [allocatingRoomId, setAllocatingRoomId] = useState(null);

  const [filters, setFilters] = useState({
    minCapacity: '',
    maxCapacity: '',
    status: 'all', 
    search: ''
  });
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [roomsRes, companiesRes] = await Promise.all([
        api.get('/admin/rooms'),
        api.get('/admin/companies')
      ]);
      setRooms(roomsRes.data);
      setCompanies(companiesRes.data);
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 2. Process Rooms (Filter + Sort)
  const processedRooms = useMemo(() => {
    let result = [...rooms];

    if (filters.search) {
      const term = filters.search.toLowerCase();
      result = result.filter(r => r.roomName.toLowerCase().includes(term));
    }
    if (filters.minCapacity) result = result.filter(r => r.capacity >= parseInt(filters.minCapacity));
    if (filters.maxCapacity) result = result.filter(r => r.capacity <= parseInt(filters.maxCapacity));
    
    // ✅ UPDATED FILTER LOGIC
    if (filters.status !== 'all') {
      const statusMap = { 
        'vacant': 0, 
        'tentative': 1, 
        'allocated': 2 
      };
      result = result.filter(r => r.status === statusMap[filters.status]);
    }

    result.sort((a, b) => {
      let comparison = 0;
      if (sortConfig.key === 'name') {
        comparison = a.roomName.localeCompare(b.roomName, undefined, { numeric: true, sensitivity: 'base' });
      } else if (sortConfig.key === 'capacity') {
        comparison = a.capacity - b.capacity;
      } else if (sortConfig.key === 'status') {
        comparison = a.status - b.status;
      }
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [rooms, filters, sortConfig]);

  // --- PDF Generation Logic ---
  const downloadPdfReport = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.setTextColor(79, 70, 229);
    doc.text("Room Allocation Status Report", 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);

    // ✅ UPDATED STATS CALCULATION
    const total = processedRooms.length;
    const vacant = processedRooms.filter(r => r.status === 0).length;
    const tentative = processedRooms.filter(r => r.status === 1).length;
    const allocated = processedRooms.filter(r => r.status === 2).length;

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Total: ${total}  |  Vacant: ${vacant}  |  Tentative: ${tentative}  |  Allocated: ${allocated}`, 14, 40);

    // Table Data
    const tableData = processedRooms.map(r => {
      let statusText = "Vacant";
      if (r.status === 1) statusText = "Tentative";
      if (r.status === 2) statusText = "Allocated";

      return [
        r.roomName,
        r.capacity,
        statusText,
        r.companyName || '-'
      ];
    });

    autoTable(doc, {
      startY: 45,
      head: [['Room Name', 'Capacity', 'Status', 'Allocated To']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229] },
      styles: { fontSize: 10 },
      didParseCell: function (data) {
        if (data.section === 'body' && data.column.index === 2) {
          const status = data.cell.raw;
          if (status === 'Vacant') data.cell.styles.textColor = [16, 185, 129]; // Green
          if (status === 'Tentative') data.cell.styles.textColor = [245, 158, 11]; // Amber
          if (status === 'Allocated') data.cell.styles.textColor = [79, 70, 229]; // Indigo
        }
      }
    });

    doc.save('Rooms_Allocation_Report.pdf');
    toast.success("Report downloaded successfully!");
  };

  // --- Actions ---
  const handleAllocate = async (roomId, companyId) => {
    if (!companyId) return;
    try {
      await api.put(`/admin/rooms/assign-company?companyId=${companyId}&roomId=${roomId}`);
      toast.success("Room allocated!");
      fetchData();
      setAllocatingRoomId(null);
    } catch (error) {
      toast.error(error.response?.data || "Allocation failed");
    }
  };

  const handleDeallocate = async (roomId) => {
    if (!window.confirm("Remove company from this room?")) return;
    try {
      await api.put(`/admin/rooms/${roomId}/remove-company`);
      toast.success("Room vacated.");
      fetchData();
    } catch (error) {
      toast.error("Failed to remove company");
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    const toastId = toast.loading("Uploading...");
    try {
      await api.post('/admin/rooms/bulk-upload', formData, { headers: { 'Content-Type': 'multipart/form-data' }});
      toast.success("Upload complete!", { id: toastId });
      fetchData();
    } catch (error) {
      toast.error("Upload failed.", { id: toastId });
    }
  };

  const downloadTemplate = async () => {
    try {
      const response = await api.get('/admin/rooms/download', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Rooms_Template.xlsx');
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      toast.error("Download failed");
    }
  };

  const clearFilters = () => {
    setFilters({ minCapacity: '', maxCapacity: '', status: 'all', search: '' });
    setSortConfig({ key: 'name', direction: 'asc' });
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Room Allocation</h1>
          <p className="text-gray-500 text-sm">Manage venue capacity and company assignments.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={downloadPdfReport} className="px-3 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg hover:bg-indigo-100 text-sm font-medium flex items-center transition">
            <FileText size={16} className="mr-2" /> PDF Report
          </button>
          <button onClick={downloadTemplate} className="px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium flex items-center transition">
            <Download size={16} className="mr-2" /> Template
          </button>
          <label className="px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium flex items-center cursor-pointer transition">
            <Upload size={16} className="mr-2" /> Bulk Upload 
            <input type="file" accept=".csv, .xlsx" className="hidden" onChange={handleFileUpload} />
          </label>
          <button onClick={() => setShowAddModal(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium flex items-center shadow-sm transition">
            <Plus size={18} className="mr-1" /> Add Room
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col lg:flex-row gap-4 items-end lg:items-center justify-between">
        <div className="flex flex-wrap gap-3 w-full lg:w-auto">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input type="text" placeholder="Search Room..." className="pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-36" value={filters.search} onChange={e => setFilters({...filters, search: e.target.value})} />
          </div>
          <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-gray-50">
            <span className="text-xs font-medium text-gray-500 uppercase">Seats &ge;</span>
            <input type="number" placeholder="0" className="w-12 bg-transparent outline-none text-sm font-bold text-gray-700" value={filters.minCapacity} onChange={e => setFilters({...filters, minCapacity: e.target.value})} />
          </div>
          <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-gray-50">
            <span className="text-xs font-medium text-gray-500 uppercase">Seats &le;</span>
            <input type="number" placeholder="Max" className="w-12 bg-transparent outline-none text-sm font-bold text-gray-700" value={filters.maxCapacity} onChange={e => setFilters({...filters, maxCapacity: e.target.value})} />
          </div>
          
          {/* ✅ UPDATED DROPDOWN OPTIONS */}
          <select className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white" value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}>
            <option value="all">All Statuses</option>
            <option value="vacant">Vacant Only</option>
            <option value="tentative">Tentative Only</option>
            <option value="allocated">Allocated Only</option>
          </select>
        </div>
        
        <div className="flex gap-3 items-center w-full lg:w-auto justify-end">
          <div className="flex items-center gap-2">
            <ArrowUpDown size={16} className="text-gray-400" />
            <select className="text-sm font-medium text-gray-700 bg-transparent outline-none cursor-pointer hover:text-indigo-600" value={`${sortConfig.key}-${sortConfig.direction}`} onChange={(e) => { const [key, direction] = e.target.value.split('-'); setSortConfig({ key, direction }); }}>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="capacity-desc">Capacity (High-Low)</option>
              <option value="capacity-asc">Capacity (Low-High)</option>
              <option value="status-asc">Status</option>
            </select>
          </div>
          <button onClick={clearFilters} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition" title="Reset Filters"><RotateCcw size={18} /></button>
        </div>
      </div>

      <p className="text-sm text-gray-500">Showing <strong>{processedRooms.length}</strong> rooms</p>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? <p>Loading rooms...</p> : processedRooms.map((room) => (
          <div key={room.roomId} className={`relative bg-white rounded-xl border shadow-sm p-6 transition-all ${room.status === 2 ? 'border-l-4 border-l-indigo-500' : room.status === 1 ? 'border-l-4 border-l-amber-400' : 'border-l-4 border-l-emerald-400'}`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{room.roomName}</h3>
                <div className="flex items-center gap-2 mt-1"><Users size={14} className="text-gray-400" /><span className="text-sm text-gray-500 font-bold">{room.capacity} Seats</span></div>
              </div>
              <RoomStatusBadge status={room.status} />
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100">
              {room.status === 2 ? ( // Allocated
                <div className="flex justify-between items-center bg-indigo-50 p-3 rounded-lg">
                  <div><p className="text-xs text-indigo-600 font-semibold uppercase">Occupied By</p><p className="font-medium text-indigo-900 truncate max-w-[150px]">{room.companyName}</p></div>
                  <button onClick={() => handleDeallocate(room.roomId)} className="p-2 bg-white text-red-500 hover:text-red-700 rounded-md shadow-sm transition"><Trash2 size={16} /></button>
                </div>
              ) : (
                <div>
                  {allocatingRoomId === room.roomId ? (
                    <div className="flex gap-2 animate-fade-in">
                      <select className="flex-1 text-sm border rounded-lg px-2 py-1 outline-none" onChange={(e) => handleAllocate(room.roomId, e.target.value)} defaultValue="">
                        <option value="" disabled>Select Company</option>
                        {companies.filter(c => !c.roomName).map(c => <option key={c.companyId} value={c.companyId}>{c.name}</option>)}
                      </select>
                      <button onClick={() => setAllocatingRoomId(null)} className="text-gray-500 hover:text-gray-700">✕</button>
                    </div>
                  ) : (
                    <button onClick={() => setAllocatingRoomId(room.roomId)} className="w-full py-2 border border-dashed border-gray-300 text-gray-500 rounded-lg hover:bg-gray-50 hover:text-indigo-600 transition flex items-center justify-center gap-2 text-sm font-medium"><Plus size={16} /> Assign Company</button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        {processedRooms.length === 0 && <div className="col-span-full text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-500">No rooms match your filters.</div>}
      </div>

      {showAddModal && <AddRoomModal onClose={() => setShowAddModal(false)} onSuccess={fetchData} />}
    </div>
  );
};

export default RoomsManagement;