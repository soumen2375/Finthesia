import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Showcase from '../components/Showcase';
import Workflow from '../components/Workflow';
import CTA from '../components/CTA';
import Footer from '../components/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F6F7F9] font-sans selection:bg-[#27C4E1] selection:text-white">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Showcase />
        <Workflow />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
