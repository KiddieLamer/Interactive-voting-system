import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Save } from 'lucide-react';

const CandidateEditModal = ({ candidate, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: candidate.name,
    party: candidate.party,
    vision: candidate.vision,
    mission: candidate.mission || '',
    color: candidate.color
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(candidate.id, formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass p-8 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-semibold text-white">
            Edit Candidate
          </h3>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Nama Lengkap
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
              required
            />
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Partai Politik
            </label>
            <input
              type="text"
              value={formData.party}
              onChange={(e) => handleChange('party', e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
              required
            />
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Visi
            </label>
            <input
              type="text"
              value={formData.vision}
              onChange={(e) => handleChange('vision', e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
              required
            />
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Misi
            </label>
            <textarea
              value={formData.mission}
              onChange={(e) => handleChange('mission', e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 h-32 resize-none"
              placeholder="Masukkan misi kandidat..."
            />
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Warna Tema
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="color"
                value={formData.color}
                onChange={(e) => handleChange('color', e.target.value)}
                className="w-12 h-12 bg-transparent border border-white/20 rounded-lg cursor-pointer"
              />
              <input
                type="text"
                value={formData.color}
                onChange={(e) => handleChange('color', e.target.value)}
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                placeholder="#4F46E5"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-white/20">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary px-6 py-3"
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn-primary px-6 py-3"
            >
              <Save className="inline w-5 h-5 mr-2" />
              Simpan Perubahan
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default CandidateEditModal;