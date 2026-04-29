import { motion } from 'framer-motion';

function Orb({ className, duration, delay }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0.2, scale: 0.9 }}
      animate={{ opacity: [0.2, 0.4, 0.2], scale: [0.9, 1.08, 0.9] }}
      transition={{ duration, repeat: Infinity, delay, ease: 'easeInOut' }}
    />
  );
}

export default function AnimatedGridBackground() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(146,144,195,0.25),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(83,92,145,0.25),transparent_45%),linear-gradient(135deg,#070F2B_0%,#131845_45%,#1B1A55_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(146,144,195,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(146,144,195,0.15)_1px,transparent_1px)] bg-[size:40px_40px] opacity-60" />
      <Orb className="absolute -left-12 top-1/4 h-52 w-52 rounded-full bg-[#9290C3]/30 blur-[100px]" duration={8} delay={0.6} />
      <Orb className="absolute right-8 top-8 h-60 w-60 rounded-full bg-[#535C91]/40 blur-[100px]" duration={9} delay={0.2} />
      <Orb className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-[#9290C3]/25 blur-[100px]" duration={10} delay={0.4} />
    </div>
  );
}
