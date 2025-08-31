import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, Award, RefreshCw, ArrowLeft, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ResultsPage = ({ socket }) => {
  const [results, setResults] = useState([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [activeVoters, setActiveVoters] = useState(0);
  const [loading, setLoading] = useState(true);
  const [recentVotes, setRecentVotes] = useState([]);
  const [isLive, setIsLive] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchResults();

    socket.on('vote-update', (votes) => {
      updateResults(votes);
    });

    socket.on('new-vote', (data) => {
      setRecentVotes(prev => [data, ...prev.slice(0, 4)]);
      setIsLive(true);
      setTimeout(() => setIsLive(false), 2000);
    });

    const interval = setInterval(() => {
      fetchResults();
    }, 30000);

    return () => {
      socket.off('vote-update');
      socket.off('new-vote');
      clearInterval(interval);
    };
  }, [socket]);

  const fetchResults = async () => {
    try {
      const response = await axios.get('/api/vote/results');
      setResults(response.data.results.map(r => ({
        ...r,
        percentage: response.data.totalVotes > 0 ? ((r.votes / response.data.totalVotes) * 100).toFixed(1) : 0
      })));
      setTotalVotes(response.data.totalVotes);
      setActiveVoters(response.data.activeVoters);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch results');
      setLoading(false);
    }
  };

  const updateResults = (votes) => {
    const newResults = Object.entries(votes).map(([id, data]) => ({
      candidateId: parseInt(id),
      candidate: data.candidate,
      votes: data.count,
      color: data.color,
      image: data.image,
      percentage: 0
    }));

    const total = newResults.reduce((sum, r) => sum + r.votes, 0);
    const resultsWithPercentage = newResults.map(r => ({
      ...r,
      percentage: total > 0 ? ((r.votes / total) * 100).toFixed(1) : 0
    }));

    setResults(resultsWithPercentage);
    setTotalVotes(total);
  };

  const winner = results.length > 0 ? results.reduce((prev, current) => 
    prev.votes > current.votes ? prev : current
  ) : null;

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

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass p-8 rounded-2xl text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto"
      >
        <motion.div
          variants={itemVariants}
          className="glass p-6 rounded-2xl mb-8"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
                📊 Live Results
                {isLive && (
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="ml-3 px-2 py-1 bg-red-500 text-white text-xs rounded-full"
                  >
                    <Activity className="inline w-3 h-3 mr-1" />
                    LIVE
                  </motion.span>
                )}
              </h1>
              <p className="text-white/80">
                Real-time voting results and statistics
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/auth')}
                className="btn-secondary"
              >
                <ArrowLeft className="inline w-4 h-4 mr-2" />
                Back
              </button>
              <button
                onClick={fetchResults}
                className="btn-primary"
              >
                <RefreshCw className="inline w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-dark p-4 rounded-xl text-center">
              <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{totalVotes}</div>
              <div className="text-white/60 text-sm">Total Votes</div>
            </div>
            <div className="glass-dark p-4 rounded-xl text-center">
              <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{activeVoters}</div>
              <div className="text-white/60 text-sm">Voters Participated</div>
            </div>
            <div className="glass-dark p-4 rounded-xl text-center">
              <Award className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {winner ? `${winner.percentage}%` : '0%'}
              </div>
              <div className="text-white/60 text-sm">Leading</div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <motion.div
            variants={itemVariants}
            className="glass p-6 rounded-2xl"
          >
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              📊 Vote Distribution
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={results}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="candidate" 
                  tick={{ fill: 'white', fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fill: 'white', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.8)', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
                <Bar dataKey="votes" fill="#667eea" radius={[4, 4, 0, 0]}>
                  {results.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="glass p-6 rounded-2xl"
          >
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              🥧 Vote Share
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={results}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ candidate, percentage }) => 
                    percentage > 5 ? `${candidate}: ${percentage}%` : ''
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="votes"
                >
                  {results.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.8)', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2"
          >
            <div className="glass p-6 rounded-2xl">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                🏆 Candidate Rankings
              </h2>
              <div className="space-y-4">
                {results
                  .sort((a, b) => b.votes - a.votes)
                  .map((candidate, index) => (
                    <motion.div
                      key={candidate.candidateId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="glass-dark p-4 rounded-xl"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="relative mr-4">
                            <img
                              src={candidate.image}
                              alt={candidate.candidate}
                              className="w-12 h-12 rounded-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                            <div 
                              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold hidden"
                              style={{ backgroundColor: candidate.color }}
                            >
                              #{index + 1}
                            </div>
                            <div 
                              className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white"
                              style={{ backgroundColor: candidate.color }}
                            >
                              #{index + 1}
                            </div>
                          </div>
                          <div>
                            <h3 className="font-semibold text-white">
                              {candidate.candidate}
                            </h3>
                            <p className="text-white/60 text-sm">
                              {candidate.votes} votes • {candidate.percentage}%
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="w-32 bg-white/20 rounded-full h-2">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${candidate.percentage}%` }}
                              transition={{ duration: 1, delay: index * 0.1 }}
                              className="h-2 rounded-full"
                              style={{ backgroundColor: candidate.color }}
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="lg:col-span-1"
          >
            <div className="glass p-6 rounded-2xl">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                🔔 Recent Activity
              </h2>
              <div className="space-y-3">
                <AnimatePresence>
                  {recentVotes.length > 0 ? (
                    recentVotes.map((vote, index) => (
                      <motion.div
                        key={`${vote.timestamp}-${index}`}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="glass-dark p-3 rounded-lg text-sm"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-green-400 font-medium">
                              New vote
                            </span>
                            <div className="text-white/80">
                              for <span className="font-medium">{vote.candidate}</span>
                            </div>
                          </div>
                          <div className="text-white/60 text-xs">
                            {new Date(vote.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center text-white/60 py-8">
                      No recent activity
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default ResultsPage;