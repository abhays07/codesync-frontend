import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

const defaultForm = {
  name: '',
  description: '',
  language: 'JavaScript',
  visibility: 'PUBLIC',
};

export default function EditProjectModal({ isOpen, onClose, onSubmit, submitting, initialData }) {
  const [form, setForm] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    visibility: initialData?.visibility || 'PUBLIC',
  });

  useEffect(() => {
    if (isOpen && initialData) {
      setForm({
        name: initialData.name || '',
        description: initialData.description || '',
        visibility: initialData.visibility || 'PUBLIC',
      });
    }
  }, [isOpen, initialData]);



  function handleFieldChange(event) {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit(form);
  }

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-lg rounded-2xl border border-[#535C91] bg-[#1B1A55]/95 p-6 shadow-2xl backdrop-blur-xl"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 180, damping: 18 }}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Edit Project Details</h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-md p-2 text-gray-300 transition hover:bg-[#070F2B] hover:text-white"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                name="name"
                value={form.name}
                onChange={handleFieldChange}
                placeholder="Project Name"
                required
                className="w-full rounded-lg border border-[#535C91] bg-[#070F2B] px-4 py-3 text-white outline-none transition focus:border-[#9290C3]"
              />

              <textarea
                name="description"
                value={form.description}
                onChange={handleFieldChange}
                placeholder="Description"
                rows={4}
                required
                className="w-full resize-none rounded-lg border border-[#535C91] bg-[#070F2B] px-4 py-3 text-white outline-none transition focus:border-[#9290C3]"
              />



              <div className="rounded-lg border border-[#535C91] bg-[#070F2B] p-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {['PUBLIC', 'PRIVATE'].map((visibilityOption) => (
                    <button
                      type="button"
                      key={visibilityOption}
                      onClick={() => setForm((prev) => ({ ...prev, visibility: visibilityOption }))}
                      className={`rounded-md px-3 py-2 font-medium transition ${
                        form.visibility === visibilityOption
                          ? 'bg-[#9290C3] text-[#070F2B]'
                          : 'bg-transparent text-gray-300 hover:bg-[#1B1A55]'
                      }`}
                    >
                      {visibilityOption}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-md border border-[#535C91] px-4 py-2 text-gray-200 transition hover:bg-[#070F2B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-md bg-[#9290C3] px-4 py-2 font-semibold text-[#070F2B] transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
