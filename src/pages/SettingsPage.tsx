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
    <div className="space-y-10 pb-12">
      {/* Profile Header */}
      <div className="flex flex-col items-center text-center space-y-4 animate-slam">
        <div className="relative">
          <div className="h-28 w-28 rounded-full bg-secondary border-4 border-card shadow-2xl flex items-center justify-center text-white text-4xl font-bold">
            SM
          </div>
          <div className="absolute bottom-1 right-1 h-6 w-6 bg-primary border-2 border-card rounded-full shadow-sm" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-text-dark tracking-tight">Soumen Maity</h2>
          <p className="text-text-muted text-sm font-medium">soumenmaity2375@gmail.com</p>
        </div>
        <Button variant="secondary" size="sm" className="rounded-full px-8 shadow-sm">
          Edit Profile
        </Button>
      </div>

      {/* Settings List */}
      <div className="space-y-8">
        {settingsSections.map((section) => (
          <section key={section.title} className="space-y-4">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest px-6">
              {section.title}
            </h3>
            <div className="card overflow-hidden p-0 divide-y divide-border">
              {section.items.map((item) => (
                <div 
                  key={item.label} 
                  className="p-6 flex items-center justify-between group cursor-pointer hover:bg-background transition-all"
                >
                  <div className="flex items-center space-x-5">
                    <div className="h-12 w-12 bg-background text-text-muted rounded-2xl flex items-center justify-center border border-border shadow-inner group-hover:bg-card group-hover:text-secondary group-hover:shadow-sm transition-all">
                      <item.icon size={22} />
                    </div>
                    <span className="font-bold text-text-dark text-lg">{item.label}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-text-muted font-bold">{item.value}</span>
                    <ChevronRight size={20} className="text-border group-hover:text-text-muted transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Logout Button */}
      <div className="px-2">
        <Button variant="danger" className="w-full py-5 rounded-3xl shadow-sm">
          <LogOut size={22} className="mr-3" /> Sign Out
        </Button>
      </div>

      <p className="text-center text-[10px] text-text-muted font-bold uppercase tracking-widest opacity-50">
        Made with precision in Google AI Studio
      </p>
    </div>
  );
}
