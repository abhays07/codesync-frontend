import { motion } from 'framer-motion';
import { ArrowRight, Network, UsersRound, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import AnimatedGridBackground from '../../components/ui/AnimatedGridBackground';

const features = [
  {
    icon: Network,
    title: 'Microservices Architecture',
    description: 'Built with scalable service boundaries for auth, projects, and collaboration workloads.',
  },
  {
    icon: UsersRound,
    title: 'Peer-to-Peer Mentorship',
    description: 'Match developers with mentors and form durable learning loops around real project work.',
  },
  {
    icon: Sparkles,
    title: 'Real-time Collaboration',
    description: 'Coordinate commits, code reviews, and pair sessions in one synchronized workspace.',
  },
];

export default function HomePage() {
  return (
    <main className="relative min-h-[calc(100vh-65px)] overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
      <AnimatedGridBackground />

      <section className="relative mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="rounded-3xl border border-[#535C91]/70 bg-[#1B1A55]/45 p-8 backdrop-blur-xl sm:p-12"
        >
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#535C91] bg-[#070F2B]/70 px-3 py-1 text-xs font-medium tracking-wider text-[#9290C3]">
            MODERN COLLABORATION PLATFORM
          </p>
          <h1 className="max-w-4xl text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
            Collaborate. Code. Ship.
          </h1>
          <p className="mt-5 max-w-2xl text-sm text-gray-200 sm:text-base">
            A calm, high-performance environment for mentorship and engineering excellence. Build faster with purpose, clarity, and composure.
          </p>

          <motion.div
            className="mt-8"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-xl border border-[#9290C3] bg-[#9290C3]/95 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-[#070F2B] shadow-[0_0_40px_rgba(146,144,195,0.35)] transition hover:bg-[#9290C3]"
            >
              Start Coding Now
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </motion.div>

        <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, description }, index) => (
            <motion.article
              key={title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 + index * 0.08 }}
              className="rounded-2xl border border-[#535C91] bg-[#1B1A55]/65 p-6 backdrop-blur-lg"
              whileHover={{ y: -4, scale: 1.01 }}
            >
              <Icon className="mb-4 h-6 w-6 text-[#9290C3]" />
              <h2 className="mb-2 text-lg font-semibold text-white">{title}</h2>
              <p className="text-sm text-gray-300">{description}</p>
            </motion.article>
          ))}
        </div>
      </section>
    </main>
  );
}
