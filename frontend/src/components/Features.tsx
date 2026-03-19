import { motion } from 'motion/react';
import { Target, Activity, DollarSign, ShieldCheck, Zap, Cloud } from 'lucide-react';

const features = [
  {
    icon: Target,
    title: 'Smart Budgeting',
    description: 'All powerful tools to help you track spending and stay on track.',
  },
  {
    icon: Activity,
    title: 'Personal Advisory',
    description: 'Get recommendations based on your goals and spending patterns.',
  },
  {
    icon: DollarSign,
    title: 'Asset Management',
    description: 'Optimization for your investments with our intelligent portfolio management.',
  },
  {
    icon: ShieldCheck,
    title: 'Value for Money',
    description: 'Low fees and transparent costs to help you build wealth efficiently.',
  },
  {
    icon: Zap,
    title: 'Faster Response',
    description: 'Instant notifications and updates on market shifts and anomalies.',
  },
  {
    icon: Cloud,
    title: 'Cloud Support',
    description: 'Access your financial data securely from anywhere, anytime on any device.',
  }
];

export default function Features() {
  return (
    <section className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-[#545E63]"
          >
            Why Choose Finthesia?
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)' }}
              className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm transition-all text-center group"
            >
              <div className="w-14 h-14 mx-auto bg-[#27C4E1]/10 rounded-full flex items-center justify-center text-[#27C4E1] group-hover:bg-[#27C4E1] group-hover:text-white transition-colors mb-6">
                <feature.icon size={24} />
              </div>
              <h3 className="text-xl font-bold text-[#545E63] mb-3">{feature.title}</h3>
              <p className="text-[#8A8F93] leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
