import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

export default function CTA() {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-[2.5rem] shadow-2xl p-12 text-center border border-gray-100 relative overflow-hidden"
        >
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#27C4E1]/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#00BFFF]/10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />

          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold text-[#545E63] mb-6">
              Ready to get started?
            </h2>
            <p className="text-[#8A8F93] text-lg max-w-2xl mx-auto mb-10">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Elementum purus, nam dictumst dui egestas sed. Elit curabitur nam vitae mi.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/contact')}
              className="bg-[#27C4E1] hover:bg-[#00BFFF] text-white px-10 py-4 rounded-full text-lg font-semibold shadow-lg shadow-[#27C4E1]/25 transition-all"
            >
              Contact Us
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
