import { Link } from 'react-router-dom';
import { Twitter, Linkedin, Facebook, Instagram } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#F6F7F9] pt-20 pb-10 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">
          
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-6 inline-block">
              <div className="flex items-center">
                <span className="text-3xl font-bold tracking-tight text-[#545E63]">fin</span>
                <span className="text-3xl font-bold tracking-tight text-[#27C4E1]">thesia</span>
              </div>
            </Link>
            <p className="text-[#8A8F93] mb-8 max-w-sm">
              Empowering people to take control of their financial lives through technology, education and guidance.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[#545E63] hover:text-[#27C4E1] hover:border-[#27C4E1] transition-colors shadow-sm">
                <Twitter size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[#545E63] hover:text-[#27C4E1] hover:border-[#27C4E1] transition-colors shadow-sm">
                <Linkedin size={18} />
              </a>
              <a href="https://www.facebook.com/finthesia" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[#545E63] hover:text-[#27C4E1] hover:border-[#27C4E1] transition-colors shadow-sm">
                <Facebook size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[#545E63] hover:text-[#27C4E1] hover:border-[#27C4E1] transition-colors shadow-sm">
                <Instagram size={18} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-[#545E63] mb-6">Company</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-[#8A8F93] hover:text-[#27C4E1] transition-colors">Pricing</a></li>
              <li><a href="#" className="text-[#8A8F93] hover:text-[#27C4E1] transition-colors">Quick Start</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-[#545E63] mb-6">Product</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-[#8A8F93] hover:text-[#27C4E1] transition-colors">Features</a></li>
              <li><a href="#" className="text-[#8A8F93] hover:text-[#27C4E1] transition-colors">Platform</a></li>
              <li><a href="#" className="text-[#8A8F93] hover:text-[#27C4E1] transition-colors">Pricing</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-[#545E63] mb-6">Support</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-[#8A8F93] hover:text-[#27C4E1] transition-colors">FAQ</a></li>
              <li><a href="#" className="text-[#8A8F93] hover:text-[#27C4E1] transition-colors">Privacy Policy</a></li>
              <li><Link to="/docs" className="text-[#8A8F93] hover:text-[#27C4E1] transition-colors">API & Docs</Link></li>
              <li><Link to="/docs" className="text-[#8A8F93] hover:text-[#27C4E1] transition-colors">Developers</Link></li>
              <li><a href="#" className="text-[#8A8F93] hover:text-[#27C4E1] transition-colors">Terms & Conditions</a></li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-gray-200 text-center">
          <p className="text-[#8A8F93] text-sm">
            © {currentYear} Finthesia. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
