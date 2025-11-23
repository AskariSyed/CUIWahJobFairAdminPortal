/* eslint-disable no-unused-vars */
import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  DoorOpen, 
  LogOut, 
  Menu, 
  X 
} from 'lucide-react';
import { useState } from 'react';
import { Settings } from 'lucide-react';
import { TrendingUp } from 'lucide-react';
import { MessageSquare } from 'lucide-react';
import { Bell } from 'lucide-react';

// ----------------------------------
// Helper: Sidebar Item Component
// ----------------------------------
const SidebarItem = ({ to, icon: Icon, label, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center space-x-3 px-6 py-3.5 transition-all duration-200 group ${
        isActive 
          ? 'bg-indigo-50 text-indigo-600 border-r-4 border-indigo-600' 
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`
    }
  >
    <Icon size={20} className="transition-colors group-hover:text-indigo-600" />
    <span className="font-medium">{label}</span>
  </NavLink>
);

// ----------------------------------
// Main Layout Component
// ----------------------------------
const AdminLayout = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Logout Logic
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.clear();
      navigate('/');
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      
      {/* 1. Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 2. Sidebar Navigation */}
      <aside 
        className={`
          fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white shadow-xl lg:shadow-none transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo Area */}
        <div className="h-20 flex items-center px-8 border-b border-gray-100">
          <div className="flex items-center gap-2 text-indigo-600">
            <div className="p-2 bg-indigo-600 rounded-lg">
               <LayoutDashboard className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-gray-800">JobFair<span className="text-indigo-600">Admin</span></span>
          </div>
          {/* Close Button (Mobile) */}
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="ml-auto lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Navigation Links */}
        <nav className="flex-1 py-6 space-y-1 overflow-y-auto">
          <div className="px-6 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Overview</div>
          
          <SidebarItem 
            to="/admin/dashboard" 
            icon={LayoutDashboard} 
            label="Dashboard" 
            onClick={() => setIsSidebarOpen(false)}
          />
          
          <div className="px-6 mt-8 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Management</div>
          
          <SidebarItem 
            to="/admin/students" 
            icon={Users} 
            label="Students" 
            onClick={() => setIsSidebarOpen(false)}
          />
          <SidebarItem 
            to="/admin/companies" 
            icon={Building2} 
            label="Companies" 
            onClick={() => setIsSidebarOpen(false)}
          />
          <SidebarItem 
            to="/admin/rooms" 
            icon={DoorOpen} 
            label="Rooms & Allocation" 
            onClick={() => setIsSidebarOpen(false)}
          />
          <SidebarItem 
  to="/admin/analytics" 
  icon={TrendingUp} 
  label="Analytics" 
  onClick={() => setIsSidebarOpen(false)}
/>
<SidebarItem 
  to="/admin/setup" 
  icon={Settings} 
  label="Job Fair Setup" 
  onClick={() => setIsSidebarOpen(false)}
/>
<SidebarItem 
  to="/admin/feedback" 
  icon={MessageSquare} 
  label="Employer Feedback" 
  onClick={() => setIsSidebarOpen(false)}
/>
<SidebarItem 
  to="/admin/notices" 
  icon={Bell} 
  label="Notice Board" 
  onClick={() => setIsSidebarOpen(false)}
/>
        </nav>
        

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* 3. Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        
        {/* Top Header */}
        <header className="bg-white shadow-sm h-20 flex items-center justify-between px-4 lg:px-8 z-10">
          <div className="flex items-center gap-4">
            {/* Hamburger Menu (Mobile) */}
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-lg lg:text-xl font-semibold text-gray-800 hidden sm:block">
              Administrator Portal
            </h2>
          </div>

          {/* Admin Profile Snippet */}
          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-800">Admin User</p>
              <p className="text-xs text-gray-500">Super Administrator</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-indigo-100 border-2 border-indigo-200 flex items-center justify-center text-indigo-700 font-bold shadow-sm">
              A
            </div>
          </div>
          <div className="px-6 mt-8 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">System</div>


        </header>

        {/* Page Content (Dynamic) */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-gray-50 scroll-smooth">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
    
  );
};

export default AdminLayout;