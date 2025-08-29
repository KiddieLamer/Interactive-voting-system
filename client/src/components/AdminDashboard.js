import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Users, TrendingUp, Download, RotateCcw, 
  AlertTriangle, Activity, Server, Clock, LogOut, 
  Eye, EyeOff, RefreshCw, Database
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const AdminDashboard = ({ token, socket, onLogout }) => {
  const [stats, setStats] = useState({
    results: [],
    totalVotes: 0,
    activeVoters: 0,
    pendingOTPs: 0,
    serverUptime: 0
  });
  const [loading, setLoading] = useState(true);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [realTimeUpdates, setRealTimeUpdates] = useState(true);
  const [systemHealth, setSystemHealth] = useState('healthy');

  useEffect(() => {
    fetchStats();

    if (realTimeUpdates) {
      socket.on('vote-update', () => {
        fetchStats();
      });

      socket.on('new-vote', () => {
        setSystemHealth('active');
        setTimeout(() => setSystemHealth('healthy'), 3000);
      });
    }

    const interval = setInterval(() => {
      fetchStats();
    }, 30000);

    return () => {
      socket.off('vote-update');
      socket.off('new-vote');
      clearInterval(interval);
    };
  }, [socket, realTimeUpdates]);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch admin statistics');
      if (error.response?.status === 403) {
        toast.error('Admin access required');
        onLogout();
      }
      setLoading(false);
    }
  };

  const handleResetVotes = async () => {
    try {
      await axios.post('/api/admin/reset-votes', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('All votes have been reset successfully');
      setStats(prev => ({
        ...prev,
        results: [],
        totalVotes: 0,
        activeVoters: 0
      }));
      setShowConfirmReset(false);
    } catch (error) {
      toast.error('Failed to reset votes');
    }
  };

  const handleExportResults = async () => {
    try {
      const response = await axios.get('/api/admin/export-results', {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `voting-results-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Results exported successfully');
    } catch (error) {
      toast.error('Failed to export results');
    }
  };

  const formatUptime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const getSystemHealthColor = () => {
    switch (systemHealth) {
      case 'active': return 'text-green-400';
      case 'healthy': return 'text-blue-400';
      default: return 'text-gray-400';
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
          <p className="text-white text-lg">Loading admin dashboard...</p>
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
                <Shield className="mr-3 text-blue-400" />
                Admin Dashboard
              </h1>
              <p className="text-white/80 flex items-center">
                System Status: 
                <span className={`ml-2 flex items-center ${getSystemHealthColor()}`}>
                  <Activity className="w-4 h-4 mr-1" />
                  {systemHealth.charAt(0).toUpperCase() + systemHealth.slice(1)}
                </span>
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setRealTimeUpdates(!realTimeUpdates)}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  realTimeUpdates 
                    ? 'bg-green-500/20 text-green-400 border border-green-400/30' 
                    : 'bg-gray-500/20 text-gray-400 border border-gray-400/30'
                }`}
              >
                {realTimeUpdates ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
                {realTimeUpdates ? 'Live Updates On' : 'Live Updates Off'}
              </button>
              <button
                onClick={onLogout}
                className="btn-secondary"
              >
                <LogOut className="inline w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="glass-dark p-4 rounded-xl text-center">
              <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{stats.totalVotes}</div>
              <div className="text-white/60 text-sm">Total Votes</div>
            </div>
            <div className="glass-dark p-4 rounded-xl text-center">
              <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{stats.activeVoters}</div>
              <div className="text-white/60 text-sm">Active Voters</div>
            </div>
            <div className="glass-dark p-4 rounded-xl text-center">
              <Database className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{stats.pendingOTPs}</div>
              <div className="text-white/60 text-sm">Pending OTPs</div>
            </div>
            <div className="glass-dark p-4 rounded-xl text-center">
              <Server className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <div className="text-lg font-bold text-white">
                {formatUptime(stats.serverUptime)}
              </div>
              <div className="text-white/60 text-sm">Server Uptime</div>
            </div>
            <div className="glass-dark p-4 rounded-xl text-center">
              <Clock className="w-8 h-8 text-orange-400 mx-auto mb-2" />
              <div className="text-sm font-bold text-white">
                {new Date().toLocaleTimeString()}
              </div>
              <div className="text-white/60 text-sm">Current Time</div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2 glass p-6 rounded-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">Detailed Results</h2>
              <button
                onClick={fetchStats}
                className="btn-secondary text-sm"
              >
                <RefreshCw className="inline w-4 h-4 mr-1" />
                Refresh
              </button>
            </div>
            <div className="space-y-4">
              {stats.results.length > 0 ? (
                stats.results
                  .sort((a, b) => b.votes - a.votes)
                  .map((candidate, index) => {
                    const percentage = stats.totalVotes > 0 
                      ? ((candidate.votes / stats.totalVotes) * 100).toFixed(1) 
                      : 0;
                    return (
                      <motion.div
                        key={candidate.candidateId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="glass-dark p-4 rounded-xl"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <div 
                              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold mr-4"
                              style={{ backgroundColor: candidate.color }}
                            >
                              #{index + 1}
                            </div>
                            <div>
                              <h3 className="font-semibold text-white">
                                {candidate.candidate}
                              </h3>
                              <p className="text-white/60 text-sm">
                                {candidate.votes} votes • {percentage}%
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-white">
                              {candidate.votes}
                            </div>
                          </div>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 1, delay: index * 0.1 }}
                            className="h-2 rounded-full"
                            style={{ backgroundColor: candidate.color }}
                          />
                        </div>
                      </motion.div>
                    );
                  })
              ) : (
                <div className="text-center text-white/60 py-8">
                  No votes cast yet
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="space-y-6"
          >
            <div className="glass p-6 rounded-2xl">
              <h2 className="text-xl font-semibold text-white mb-4">Admin Actions</h2>
              <div className="space-y-4">
                <button
                  onClick={handleExportResults}
                  className="btn-primary w-full py-3"
                  disabled={stats.totalVotes === 0}
                >
                  <Download className="inline w-5 h-5 mr-2" />
                  Export Results
                </button>
                
                <button
                  onClick={() => setShowConfirmReset(true)}
                  className="w-full py-3 px-4 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                  disabled={stats.totalVotes === 0}
                >
                  <RotateCcw className="inline w-5 h-5 mr-2" />
                  Reset All Votes
                </button>
              </div>
            </div>

            <div className="glass p-6 rounded-2xl">
              <h2 className="text-xl font-semibold text-white mb-4">System Info</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">Platform</span>
                  <span className="text-white">Web Application</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Version</span>
                  <span className="text-white">v1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Environment</span>
                  <span className="text-white">Production</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Security</span>
                  <span className="text-green-400">🔒 Secured</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <AnimatePresence>
          {showConfirmReset && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowConfirmReset(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="glass p-8 rounded-2xl max-w-md w-full"
                onClick={e => e.stopPropagation()}
              >
                <div className="text-center">
                  <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-4">
                    Confirm Reset
                  </h3>
                  <p className="text-white/80 mb-6">
                    Are you sure you want to reset all votes? This action cannot be undone and will:
                  </p>
                  <ul className="text-left text-white/70 text-sm mb-6 space-y-2">
                    <li>• Delete all cast votes ({stats.totalVotes} votes)</li>
                    <li>• Reset voter eligibility ({stats.activeVoters} voters)</li>
                    <li>• Clear all voting statistics</li>
                  </ul>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setShowConfirmReset(false)}
                      className="btn-secondary flex-1 py-3"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleResetVotes}
                      className="flex-1 py-3 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Reset All Votes
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;