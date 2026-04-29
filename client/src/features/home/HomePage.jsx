import { motion } from 'framer-motion';
import { ArrowRight, Terminal, GitBranch, MessageSquareCode, ShieldCheck, Box, Zap, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import AnimatedGridBackground from '../../components/ui/AnimatedGridBackground';

const features = [
  {
    icon: Terminal,
    title: 'Sandbox Execution',
    description: 'Execute Java, Python, and Node.js in isolated, resource-limited Docker containers with sub-second latency.',
  },
  {
    icon: GitBranch,
    title: 'Version Control',
    description: 'Point-in-time snapshots with SHA-256 integrity and Myers-algorithm diffing for seamless collaboration.',
  },
  {
    icon: Users,
    title: 'Live Co-editing',
    description: 'WebSocket-powered rooms with synchronized cursors and unique participant color-coding.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function HomePage() {
  return (
    <main className="relative min-h-[calc(100vh-65px)] overflow-hidden px-4 py-12 sm:px-6 lg:px-8">
      <AnimatedGridBackground />

      <section className="relative mx-auto max-w-7xl space-y-24">
        {/* HERO SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="rounded-3xl border border-[#535C91]/70 bg-[#1B1A55]/45 p-8 backdrop-blur-xl sm:p-16 text-center lg:text-left flex flex-col lg:flex-row items-center gap-12 shadow-2xl"
        >
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#535C91] bg-[#070F2B]/70 px-4 py-1.5 text-xs font-semibold tracking-wider text-[#9290C3] shadow-inner">
               <Zap size={14} className="text-yellow-400" />
               DISTRIBUTED MICROSERVICES ARCHITECTURE
            </div>
            <h1 className="text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
              Compile. Collaborate. <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#9290C3] to-white">Conquer.</span>
            </h1>
            <p className="max-w-2xl text-base text-gray-300 sm:text-lg font-light leading-relaxed">
              A high-performance cloud IDE powered by 11 isolated microservices. Build faster with purpose, clarity, and true collaborative power.
            </p>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="inline-block mt-4">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-xl border border-[#9290C3] bg-[#9290C3]/95 px-8 py-4 text-sm font-bold uppercase tracking-wide text-[#070F2B] shadow-[0_0_30px_rgba(146,144,195,0.4)] transition hover:bg-[#9290C3]"
              >
                Start Coding Environment
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* STATISTICAL METRIC BAR */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center lg:justify-between items-center gap-8 py-6 px-10 rounded-2xl bg-[#070F2B]/60 border border-[#535C91]/40 backdrop-blur-md shadow-lg"
        >
          <div className="flex items-center gap-3 text-sm font-medium text-gray-400 tracking-wide uppercase"><Box size={18} className="text-[#9290C3]" /> 11 Distributed Microservices</div>
          <div className="hidden lg:block w-px h-6 bg-[#535C91]/50" />
          <div className="flex items-center gap-3 text-sm font-medium text-gray-400 tracking-wide uppercase"><ShieldCheck size={18} className="text-[#9290C3]" /> Isolated Docker Sandboxes</div>
          <div className="hidden lg:block w-px h-6 bg-[#535C91]/50" />
          <div className="flex items-center gap-3 text-sm font-medium text-gray-400 tracking-wide uppercase"><GitBranch size={18} className="text-[#9290C3]" /> 256-bit Code Hashing</div>
          <div className="hidden lg:block w-px h-6 bg-[#535C91]/50" />
          <div className="flex items-center gap-3 text-sm font-medium text-gray-400 tracking-wide uppercase"><Zap size={18} className="text-[#9290C3]" /> Real-time Syncing</div>
        </motion.div>

        {/* EDITOR PREVIEW MOCKUP */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="rounded-2xl border border-[#535C91]/60 bg-[#1B1A55]/45 backdrop-blur-xl shadow-2xl overflow-hidden"
        >
          {/* Mac-style Window Header */}
          <div className="flex items-center gap-2 px-4 py-3 bg-[#070F2B]/80 border-b border-[#535C91]/50">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <div className="ml-4 text-xs font-mono text-gray-400">~/CodeSync/Main.java</div>
          </div>
          
          <div className="flex h-80 sm:h-96">
            {/* Sidebar Mock */}
            <div className="hidden sm:flex w-48 flex-col border-r border-[#535C91]/30 bg-[#070F2B]/40 p-4 font-mono text-xs text-gray-400">
               <div className="font-bold text-gray-300 mb-3">EXPLORER</div>
               <div className="space-y-2">
                 <div className="flex items-center gap-2 text-[#9290C3] bg-[#535C91]/20 px-2 py-1 rounded">
                   <Box size={14} /> Main.java
                 </div>
                 <div className="flex items-center gap-2 px-2 py-1 hover:text-gray-300">
                   <Box size={14} /> utils.js
                 </div>
                 <div className="flex items-center gap-2 px-2 py-1 hover:text-gray-300">
                   <Box size={14} /> package.json
                 </div>
               </div>
            </div>
            
            {/* Code Editor Mock */}
            <div className="flex-1 p-6 font-mono text-sm sm:text-base leading-loose text-gray-300 bg-[#070F2B]/60 relative overflow-hidden">
               <div className="flex text-gray-500 mb-2">1 &nbsp;&nbsp;<span className="text-pink-400">public class</span> <span className="text-yellow-200">Main</span> {'{'}</div>
               <div className="flex text-gray-500 mb-2">2 &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-pink-400">public static void</span> <span className="text-blue-300">main</span>(String[] args) {'{'}</div>
               <div className="flex text-gray-500 mb-2">
                  3 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;System.out.<span className="text-blue-300">println</span>(<span className="text-green-300">"Starting Docker execution..."</span>);
                  {/* Remote Cursor 1 */}
                  <span className="inline-flex items-center animate-pulse ml-1 border-l-2 border-blue-500">
                     <span className="absolute -top-6 -ml-2 bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded shadow">Abhay</span>
                  </span>
               </div>
               <div className="flex text-gray-500 mb-2">
                  4 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-pink-400">int</span> latency = <span className="text-orange-300">12</span>;
                  {/* Remote Cursor 2 */}
                  <span className="inline-flex items-center animate-pulse ml-2 border-l-2 border-emerald-500">
                     <span className="absolute -top-6 -ml-2 bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded shadow">Mentor</span>
                  </span>
               </div>
               <div className="flex text-gray-500 mb-2">5 &nbsp;&nbsp;&nbsp;&nbsp;{'}'}</div>
               <div className="flex text-gray-500 mb-2">6 {'}'}</div>
            </div>
          </div>
        </motion.div>

        {/* FEATURES GRID */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 gap-6 lg:grid-cols-3"
        >
          {features.map(({ icon: Icon, title, description }) => (
            <motion.article
              key={title}
              variants={itemVariants}
              className="rounded-2xl border border-[#535C91] bg-[#1B1A55]/65 p-8 backdrop-blur-lg transition-all duration-300 hover:bg-[#1B1A55]/90 hover:shadow-[0_0_20px_rgba(146,144,195,0.2)] hover:-translate-y-1"
            >
              <div className="mb-6 inline-flex rounded-xl bg-[#070F2B]/60 p-3 ring-1 ring-[#535C91]/50 shadow-inner">
                <Icon className="h-6 w-6 text-[#9290C3]" />
              </div>
              <h2 className="mb-3 text-xl font-bold text-white tracking-wide">{title}</h2>
              <p className="text-base leading-relaxed text-gray-400">{description}</p>
            </motion.article>
          ))}
        </motion.div>

        {/* COLLABORATIVE FLOW (MENTOR-MENTEE) */}
        <motion.div 
           initial={{ opacity: 0, y: 40 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center rounded-3xl bg-gradient-to-br from-[#1B1A55]/40 to-[#070F2B]/80 border border-[#535C91]/50 p-8 sm:p-12"
        >
           <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#9290C3]/10 px-3 py-1 text-xs font-bold tracking-widest text-[#9290C3] uppercase">
                 Peer-to-Peer Loop
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
                 Review code <span className="text-[#9290C3]">inline</span>.
              </h2>
              <p className="text-lg text-gray-400 font-light leading-relaxed">
                 Inline code reviews on specific line numbers. Give and receive feedback directly in the gutter. Form durable learning loops around real project work without leaving the editor.
              </p>
           </div>
           
           <div className="relative h-64 rounded-xl border border-[#535C91]/40 bg-[#070F2B] p-6 shadow-2xl flex flex-col justify-center">
              <div className="flex text-gray-500 font-mono text-sm mb-4">
                 12 &nbsp;&nbsp;<span className="text-pink-400">const</span> <span className="text-blue-300">executeTask</span> = () <span className="text-pink-400">=&gt;</span> {'{'}
              </div>
              
              {/* Floating Comment Bubble Mock */}
              <motion.div 
                 initial={{ opacity: 0, scale: 0.9 }}
                 whileInView={{ opacity: 1, scale: 1 }}
                 viewport={{ once: true }}
                 className="relative z-10 ml-8 max-w-sm rounded-lg border border-[#535C91] bg-[#1B1A55] p-4 shadow-xl"
              >
                 <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold text-white shrink-0">M</div>
                    <div>
                       <div className="flex items-baseline gap-2">
                          <span className="text-sm font-bold text-white">Mentor</span>
                          <span className="text-[10px] text-gray-400">Just now</span>
                       </div>
                       <p className="text-sm text-gray-300 mt-1">
                          Consider wrapping this in a try-catch block to handle Docker daemon timeouts!
                       </p>
                    </div>
                 </div>
              </motion.div>
              
              <div className="flex text-gray-500 font-mono text-sm mt-4">
                 13 &nbsp;&nbsp;&nbsp;&nbsp;dockerClient.<span className="text-blue-300">start</span>();
              </div>
           </div>
        </motion.div>

        {/* CALL TO ACTION SECTION */}
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex flex-col items-center text-center pb-12"
        >
            <h2 className="text-3xl font-black text-white sm:text-5xl tracking-tight">Ready to deploy?</h2>
            <p className="mt-4 max-w-xl text-lg text-gray-400 font-light">Join the next generation of cloud-native collaboration.</p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="mt-8">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-xl border border-[#9290C3] bg-white px-8 py-4 text-base font-bold uppercase tracking-wide text-[#070F2B] transition hover:bg-gray-200 shadow-xl shadow-white/10"
              >
                Deploy Your First Project
                <ArrowRight className="h-5 w-5" />
              </Link>
            </motion.div>
        </motion.div>
      </section>
    </main>
  );
}
