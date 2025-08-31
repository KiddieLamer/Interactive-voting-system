import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Vote, CheckCircle, Users, BarChart3, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';

const VotingPage = ({ user, token, socket, onLogout }) => {
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [totalVotes, setTotalVotes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCandidateDetail, setSelectedCandidateDetail] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCandidates();
    checkVotingStatus();

    socket.on('vote-update', (votes) => {
      setTotalVotes(Object.values(votes).reduce((sum, v) => sum + v.count, 0));
    });

    socket.on('new-vote', (data) => {
      toast.success(`New vote cast for ${data.candidate}!`, {
        icon: '🗳️',
      });
    });

    return () => {
      socket.off('vote-update');
      socket.off('new-vote');
    };
  }, [socket]);

  const fetchCandidates = async () => {
    try {
      console.log('Fetching candidates...');
      const response = await axios.get('/api/vote/candidates');
      console.log('Candidates response:', response.data);
      console.log('Response status:', response.status);
      if (response.data && Array.isArray(response.data)) {
        setCandidates(response.data);
        console.log('Candidates set:', response.data.length);
      } else {
        console.error('Invalid response format:', response.data);
        toast.error('Invalid data format received');
      }
    } catch (error) {
      console.error('Error fetching candidates:', error);
      console.error('Error details:', error.response);
      toast.error('Failed to load candidates: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const checkVotingStatus = async () => {
    try {
      const response = await axios.get('/api/vote/status', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHasVoted(response.data.hasVoted);
      setTotalVotes(response.data.totalVotes);
    } catch (error) {
      console.error('Failed to check voting status');
    }
  };

  const handleVote = async () => {
    if (!selectedCandidate) return;

    setVoting(true);
    try {
      const response = await axios.post(
        '/api/vote/cast',
        { candidateId: selectedCandidate.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`Vote cast for ${selectedCandidate.name}!`, {
        icon: '🎉',
        duration: 5000,
      });

      setHasVoted(true);
      setTotalVotes(response.data.totalVotes);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to cast vote');
    } finally {
      setVoting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const candidateVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass p-8 rounded-2xl text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading candidates...</p>
        </div>
      </div>
    );
  }

  if (hasVoted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass p-8 rounded-2xl text-center max-w-md w-full"
        >
          <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4">
            Vote Cast Successfully! 🎉
          </h2>
          <p className="text-white/80 mb-6">
            Thank you for participating in the democratic process.
          </p>
          <div className="flex space-x-3">
            <button
              onClick={() => navigate('/results')}
              className="btn-primary flex-1 py-3"
            >
              <BarChart3 className="inline w-5 h-5 mr-2" />
              View Results
            </button>
            <button
              onClick={onLogout}
              className="btn-secondary flex-1 py-3"
            >
              <LogOut className="inline w-5 h-5 mr-2" />
              Logout
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        <div className="glass p-6 rounded-2xl mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Welcome, {user?.name}! 👋
              </h1>
              <p className="text-white/80">
                Choose your candidate carefully. You can only vote once.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-white/60 text-sm">Total Votes</div>
                <div className="text-2xl font-bold text-white">
                  <Users className="inline w-5 h-5 mr-1" />
                  {totalVotes}
                </div>
              </div>
              <button
                onClick={onLogout}
                className="btn-secondary"
              >
                <LogOut className="inline w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="candidates-scroll"
          >
          {candidates.length === 0 && !loading ? (
            <div className="text-white text-center py-8 w-full">
              <p>No candidates available</p>
              <p className="text-sm mt-2">Candidates length: {candidates.length}</p>
              <p className="text-sm">Loading: {loading.toString()}</p>
            </div>
          ) : candidates.length === 0 && loading ? (
            <div className="text-white text-center py-8 w-full">
              <p>Loading candidates...</p>
            </div>
          ) : null}
          {candidates.map((candidate) => (
            <motion.div
              key={candidate.id}
              variants={candidateVariants}
              className={`bg-white rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-300 relative group flex-shrink-0 min-w-[280px] max-w-[280px] overflow-hidden ${
                selectedCandidate?.id === candidate.id
                  ? 'ring-4 ring-yellow-400 shadow-yellow-400/30 transform scale-105'
                  : 'hover:scale-102'
              }`}
              style={{ scrollSnapAlign: 'start' }}
            >
              {/* Header with candidate color */}
              <div 
                className="h-3 w-full"
                style={{ backgroundColor: candidate.color }}
              />
              
              {/* Photo Section - Large poster style */}
              <div className="relative p-6 pb-4">
                <div className="relative w-full h-48 rounded-2xl overflow-hidden shadow-lg">
                  <img
                    src={candidate.image}
                    alt={candidate.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div 
                    className="w-full h-full flex items-center justify-center text-white text-4xl font-bold hidden"
                    style={{ backgroundColor: candidate.color }}
                  >
                    {candidate.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  
                  {/* Info button overlay */}
                  <button
                    onClick={() => {
                      setSelectedCandidateDetail(candidate);
                      setShowDetailModal(true);
                    }}
                    className="absolute top-3 right-3 bg-white/90 text-gray-700 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                  
                  {/* Selected badge */}
                  {selectedCandidate?.id === candidate.id && (
                    <div className="absolute top-3 left-3 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-sm font-bold flex items-center shadow-lg">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      DIPILIH
                    </div>
                  )}
                </div>
              </div>

              {/* Details Section */}
              <div className="px-6 pb-6 text-center">
                <h3 className="text-xl font-bold text-gray-800 mb-2 leading-tight">
                  {candidate.name}
                </h3>
                <p className="text-gray-600 text-sm mb-3 font-medium">
                  {candidate.party}
                </p>
                <p className="text-gray-500 text-xs leading-relaxed mb-4 line-clamp-3">
                  "{candidate.vision}"
                </p>
                
                <button
                  onClick={() => setSelectedCandidate(candidate)}
                  className={`w-full py-3 px-4 rounded-xl font-bold transition-all duration-200 flex items-center justify-center transform hover:scale-105 ${
                    selectedCandidate?.id === candidate.id
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 shadow-xl'
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg'
                  }`}
                >
                  {selectedCandidate?.id === candidate.id ? (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      TERPILIH
                    </>
                  ) : (
                    <>
                      <Vote className="w-5 h-5 mr-2" />
                      PILIH
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ))}
          </motion.div>
        </div>

        <AnimatePresence>
          {selectedCandidate && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="glass p-6 rounded-2xl text-center"
            >
              <h3 className="text-xl font-semibold text-white mb-4">
                Confirm Your Vote
              </h3>
              <p className="text-white/80 mb-6">
                You are about to vote for{' '}
                <span className="font-semibold text-white">
                  {selectedCandidate.name}
                </span>{' '}
                from {selectedCandidate.party}.
                <br />
                <span className="text-red-300 text-sm">
                  ⚠️ This action cannot be undone!
                </span>
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setSelectedCandidate(null)}
                  className="btn-secondary px-8 py-3"
                >
                  Cancel
                </button>
                <motion.button
                  onClick={handleVote}
                  disabled={voting}
                  className="btn-primary px-8 py-3"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {voting ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Casting Vote...
                    </div>
                  ) : (
                    <>
                      <Vote className="inline w-5 h-5 mr-2" />
                      Cast My Vote
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showDetailModal && selectedCandidateDetail && (
            <CandidateDetailModal
              candidate={selectedCandidateDetail}
              onClose={() => {
                setShowDetailModal(false);
                setSelectedCandidateDetail(null);
              }}
              onSelect={() => {
                setSelectedCandidate(selectedCandidateDetail);
                setShowDetailModal(false);
                setSelectedCandidateDetail(null);
              }}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

const CandidateDetailModal = ({ candidate, onClose, onSelect }) => {
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
        <div className="text-center mb-6">
          <img
            src={candidate.image}
            alt={candidate.name}
            className="w-32 h-32 rounded-full mx-auto object-cover mb-4"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div 
            className="w-32 h-32 rounded-full mx-auto flex items-center justify-center text-white text-4xl font-bold mb-4 hidden"
            style={{ backgroundColor: candidate.color }}
          >
            {candidate.name.split(' ').map(n => n[0]).join('')}
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">{candidate.name}</h2>
          <p className="text-white/80 text-lg mb-4">{candidate.party}</p>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-white mb-3 flex items-center">
              <div 
                className="w-4 h-4 rounded-full mr-3"
                style={{ backgroundColor: candidate.color }}
              />
              Visi
            </h3>
            <p className="text-white/80 text-lg leading-relaxed">
              {candidate.vision}
            </p>
          </div>

          {candidate.mission && (
            <div>
              <h3 className="text-xl font-semibold text-white mb-3 flex items-center">
                <div 
                  className="w-4 h-4 rounded-full mr-3"
                  style={{ backgroundColor: candidate.color }}
                />
                Misi
              </h3>
              <p className="text-white/80 leading-relaxed whitespace-pre-line">
                {candidate.mission}
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-white/20">
          <button
            onClick={onClose}
            className="btn-secondary px-6 py-3"
          >
            Tutup
          </button>
          <button
            onClick={onSelect}
            className="btn-primary px-6 py-3"
          >
            <Vote className="inline w-5 h-5 mr-2" />
            Pilih Kandidat Ini
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default VotingPage;