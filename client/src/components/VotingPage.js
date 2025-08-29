import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Vote, CheckCircle, Users, BarChart3 } from 'lucide-react';
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
      const response = await axios.get('/api/vote/candidates');
      setCandidates(response.data);
    } catch (error) {
      toast.error('Failed to load candidates');
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

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {candidates.map((candidate) => (
            <motion.div
              key={candidate.id}
              variants={candidateVariants}
              className={`glass p-6 rounded-2xl cursor-pointer transition-all duration-300 ${
                selectedCandidate?.id === candidate.id
                  ? 'ring-2 ring-white/50 bg-white/20'
                  : 'hover:bg-white/10'
              }`}
              onClick={() => setSelectedCandidate(candidate)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-center">
                <div 
                  className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold"
                  style={{ backgroundColor: candidate.color }}
                >
                  {candidate.name.split(' ').map(n => n[0]).join('')}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {candidate.name}
                </h3>
                <p className="text-white/70 text-sm mb-2">
                  {candidate.party}
                </p>
                <p className="text-white/60 text-xs">
                  "{candidate.vision}"
                </p>
                {selectedCandidate?.id === candidate.id && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-4"
                  >
                    <CheckCircle className="w-6 h-6 text-green-400 mx-auto" />
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

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
      </motion.div>
    </div>
  );
};

export default VotingPage;