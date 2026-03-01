import React from 'react';
import { 
  User, 
  Bell, 
  Shield, 
  Database, 
  LogOut, 
  ChevronRight,
  Smartphone,
  Info
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';

const settingsSections = [
  {
    title: 'Account',
    items: [
      { icon: User, label: 'Profile Information', value: 'Soumen Maity' },
      { icon: Bell, label: 'Notifications', value: 'Enabled' },
      { icon: Shield, label: 'Security & Privacy', value: 'Strong' },
    ]
  },
  {
    title: 'Application',
    items: [
      { icon: Database, label: 'Data Management', value: '1.2 MB' },
      { icon: Smartphone, label: 'PWA Settings', value: 'Installed' },
      { icon: Info, label: 'About Finthesia', value: 'v1.0.0' },
    ]
  }
];

export default function SettingsPage() {
  return (
    <div className="space-y-8 pb-8">
      {/* Profile Header */}
      <div className="flex flex-col items-center text-center space-y-3 animate-slam">
        <div className="h-24 w-24 rounded-full bg-blue-600 border-4 border-white shadow-xl flex items-center justify-center text-white text-3xl font-bold">
          SM
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Soumen Maity</h2>
          <p className="text-slate-500 text-sm font-medium">soumenmaity2375@gmail.com</p>
        </div>
        <Button variant="secondary" size="sm" className="rounded-full px-6">
          Edit Profile
        </Button>
      </div>

      {/* Settings List */}
      <div className="space-y-6">
        {settingsSections.map((section) => (
          <section key={section.title} className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-4">
              {section.title}
            </h3>
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
              {section.items.map((item, i) => (
                <div 
                  key={item.label} 
                  className={cn(
                    "p-5 flex items-center justify-between group cursor-pointer hover:bg-slate-50 transition-colors",
                    i !== section.items.length - 1 && "border-b border-slate-50"
                  )}
                >
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 bg-slate-50 text-slate-500 rounded-xl flex items-center justify-center group-hover:bg-white group-hover:text-blue-600 transition-colors">
                      <item.icon size={20} />
                    </div>
                    <span className="font-bold text-slate-900">{item.label}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-slate-400 font-medium">{item.value}</span>
                    <ChevronRight size={18} className="text-slate-300" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Logout Button */}
      <div className="px-4">
        <Button variant="danger" className="w-full py-4 rounded-3xl bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 shadow-none">
          <LogOut size={20} className="mr-2" /> Sign Out
        </Button>
      </div>

      <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
        Made with precision in Google AI Studio
      </p>
    </div>
  );
}
