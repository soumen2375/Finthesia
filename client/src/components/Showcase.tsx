import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

const showcases = [
  {
    title: 'It is the most advanced digital marketing and it company.',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Consectetur tristique eget vel eu, tempus eu eros scelerisque lacus. Neque mauris et nec ac egestas ultrices commodo, consectetur volutpat iaculis. Consequat sit in lacus egestas, tempus ac at accumsan in. In ultricies nunc auctor tellus. Adipiscing sed sed sed odio.',
    link: '#',
    imageSide: 'right',
  },
  {
    title: 'It is a privately owned Information and cyber security company',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Consectetur tristique eget vel eu, tempus eu eros scelerisque lacus. Neque mauris et nec ac egestas ultrices commodo, consectetur volutpat iaculis. Consequat sit in lacus egestas, tempus ac at accumsan in. In ultricies nunc auctor tellus. Adipiscing sed sed sed odio.',
    link: '#',
    imageSide: 'left',
  },
  {
    title: "It's a team of experienced and skilled people with distributions",
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Consectetur tristique eget vel eu, tempus eu eros scelerisque lacus. Neque mauris et nec ac egestas ultrices commodo, consectetur volutpat iaculis. Consequat sit in lacus egestas, tempus ac at accumsan in. In ultricies nunc auctor tellus. Adipiscing sed sed sed odio.',
    link: '#',
    imageSide: 'right',
  },
  {
    title: 'A company standing different from others',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Consectetur tristique eget vel eu, tempus eu eros scelerisque lacus. Neque mauris et nec ac egestas ultrices commodo, consectetur volutpat iaculis. Consequat sit in lacus egestas, tempus ac at accumsan in. In ultricies nunc auctor tellus. Adipiscing sed sed sed odio.',
    link: '#',
    imageSide: 'left',
  }
];

export default function Showcase() {

  const Mockup = () => (
    <div className="w-full h-64 md:h-80 bg-white rounded-2xl shadow-xl shadow-[#27C4E1]/5 border border-gray-100 flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
        <div className="h-4 w-32 bg-gray-100 rounded" />
        <div className="flex gap-2">
          <div className="h-4 w-4 rounded-full bg-gray-200" />
          <div className="h-4 w-4 rounded-full bg-gray-200" />
        </div>
      </div>
      <div className="flex items-end gap-3 h-32 w-full px-8 opacity-50">
        <div className="w-1/5 bg-[#27C4E1] h-1/3 rounded-t" />
        <div className="w-1/5 bg-[#00BFFF] h-1/2 rounded-t" />
        <div className="w-1/5 bg-gray-200 h-2/3 rounded-t" />
        <div className="w-1/5 bg-[#27C4E1] h-3/4 rounded-t" />
        <div className="w-1/5 bg-[#545E63] h-full rounded-t" />
      </div>
      <div className="absolute bottom-4 right-4 bg-white p-2 md:p-4 rounded-xl shadow-lg border border-gray-50 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#00C853]/10" />
        <div>
          <div className="h-2 w-16 bg-gray-200 rounded mb-1" />
          <div className="h-3 w-20 bg-gray-300 rounded" />
        </div>
      </div>
    </div>
  );

  return (
    <section className="py-24 bg-[#F6F7F9]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-32">
        {showcases.map((block, index) => (
          <div 
            key={index}
            className={`flex flex-col ${block.imageSide === 'left' ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12 lg:gap-24`}
          >
            <motion.div 
              initial={{ opacity: 0, x: block.imageSide === 'right' ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="w-full lg:w-1/2"
            >
              <h3 className="text-3xl md:text-4xl font-bold text-[#545E63] mb-6 leading-tight">
                {block.title}
              </h3>
              <p className="text-[#8A8F93] leading-relaxed mb-8 text-lg">
                {block.description}
              </p>
              <a href={block.link} className="inline-flex items-center text-[#27C4E1] font-medium hover:text-[#00BFFF] transition-colors group">
                Check it out
                <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="w-full lg:w-1/2 relative"
            >
              <Mockup />
            </motion.div>
          </div>
        ))}
      </div>
    </section>
  );
}
