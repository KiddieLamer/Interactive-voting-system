import React, { useState, useEffect } from 'react';
import { LogOut, Vote, CheckCircle, Users, Star, Award, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';

const VotingPageModern = ({ user, token, socket, onLogout }) => {
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [totalVotes, setTotalVotes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [hoveredCandidate, setHoveredCandidate] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCandidates();
    checkVotingStatus();

    socket.on('vote-update', (votes) => {
      setTotalVotes(Object.values(votes).reduce((sum, v) => sum + v.count, 0));
    });

    return () => {
      socket.off('vote-update');
    };
  }, [socket]);

  const fetchCandidates = async () => {
    try {
      const response = await axios.get('/api/vote/candidates');
      setCandidates(response.data);
      setLoading(false);
    } catch (error) {
      toast.error('Gagal memuat data kandidat');
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

      toast.success(`Suara berhasil diberikan untuk ${selectedCandidate.name}!`, {
        icon: '🎉',
        duration: 3000,
      });

      setHasVoted(true);
      setTotalVotes(response.data.totalVotes);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Gagal memberikan suara');
    } finally {
      setVoting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="relative">
          <div className="w-32 h-32 rounded-full border-4 border-purple-400 border-t-transparent animate-spin"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Vote className="w-12 h-12 text-white animate-pulse" />
          </div>
          <p className="text-white text-center mt-8 text-xl">Memuat Sistem Voting...</p>
        </div>
      </div>
    );
  }

  if (hasVoted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-12 text-center max-w-lg w-full">
          <div className="relative mb-8">
            <div className="w-32 h-32 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mx-auto flex items-center justify-center animate-bounce">
              <Award className="w-16 h-16 text-white" />
            </div>
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full animate-ping"></div>
            <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-orange-400 rounded-full animate-pulse"></div>
          </div>
          
          <h2 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            SUARA TERSIMPAN! ✨
          </h2>
          <p className="text-white/80 text-lg mb-8">
            Terima kasih telah berpartisipasi dalam demokrasi digital!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate('/results')}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 px-6 rounded-2xl font-bold text-lg hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Star className="inline w-6 h-6 mr-2" />
              Lihat Hasil
            </button>
            <button
              onClick={onLogout}
              className="flex-1 bg-white/20 backdrop-blur-sm text-white py-4 px-6 rounded-2xl font-bold text-lg hover:bg-white/30 transition-all duration-300 border border-white/30"
            >
              <LogOut className="inline w-6 h-6 mr-2" />
              Keluar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Floating particles */}
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 10}s`,
            animationDuration: `${5 + Math.random() * 5}s`
          }}
        />
      ))}

      {/* Header */}
      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 animate-gradient">
                VOTE 2024 ⚡
              </h1>
              <p className="text-white/80 text-xl mt-2">
                Hai <span className="text-yellow-400 font-bold">{user?.name}</span>, pilih masa depan!
              </p>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl px-6 py-4">
                <div className="text-center">
                  <div className="text-yellow-400 text-sm font-medium">Total Suara</div>
                  <div className="text-white text-3xl font-bold flex items-center justify-center">
                    <Users className="w-6 h-6 mr-2" />
                    {totalVotes}
                  </div>
                </div>
              </div>
              
              <button
                onClick={onLogout}
                className="bg-red-500/80 backdrop-blur-sm hover:bg-red-500 text-white px-6 py-4 rounded-2xl font-bold transition-all duration-300 hover:scale-105 flex items-center"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Keluar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          {/* Intro */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Pilih Pemimpin Masa Depan 🚀
            </h2>
            <p className="text-white/70 text-lg max-w-2xl mx-auto">
              Setiap suara adalah harapan. Pilih dengan hati, putuskan dengan akal.
            </p>
          </div>

          {/* Candidates */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {candidates.map((candidate, index) => (
              <div
                key={candidate.id}
                className={`group relative transition-all duration-500 hover:scale-105 ${
                  selectedCandidate?.id === candidate.id ? 'scale-105' : ''
                }`}
                onMouseEnter={() => setHoveredCandidate(candidate.id)}
                onMouseLeave={() => setHoveredCandidate(null)}
              >
                {/* Card */}
                <div className={`relative bg-white/10 backdrop-blur-xl border-2 rounded-3xl overflow-hidden transition-all duration-500 ${
                  selectedCandidate?.id === candidate.id 
                    ? 'border-yellow-400 shadow-2xl shadow-yellow-400/50' 
                    : 'border-white/20 hover:border-white/40'
                }`}>
                  
                  {/* Status Badge */}
                  {selectedCandidate?.id === candidate.id && (
                    <div className="absolute top-4 left-4 z-20 bg-yellow-400 text-black px-4 py-2 rounded-full text-sm font-bold animate-bounce">
                      ⭐ TERPILIH
                    </div>
                  )}

                  {/* Photo Container */}
                  <div className="relative h-80 overflow-hidden">
                    <img
                      src={candidate.image}
                      alt={candidate.name}
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div 
                      className="w-full h-full flex items-center justify-center text-white text-6xl font-bold hidden transition-all duration-700 group-hover:scale-110"
                      style={{ background: `linear-gradient(135deg, ${candidate.color}AA, ${candidate.color}FF)` }}
                    >
                      {candidate.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                    
                    {/* Hover effect */}
                    <div className={`absolute inset-0 bg-gradient-to-t from-purple-600/30 to-transparent transition-opacity duration-300 ${
                      hoveredCandidate === candidate.id ? 'opacity-100' : 'opacity-0'
                    }`}></div>
                  </div>

                  {/* Content */}
                  <div className="p-6 relative">
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">
                        {candidate.name}
                      </h3>
                      <p className="text-purple-300 font-medium mb-3">
                        {candidate.party}
                      </p>
                      <p className="text-white/70 text-sm leading-relaxed">
                        "{candidate.vision}"
                      </p>
                    </div>
                    
                    <button
                      onClick={() => setSelectedCandidate(candidate)}
                      className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 flex items-center justify-center ${
                        selectedCandidate?.id === candidate.id
                          ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black shadow-lg'
                          : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white'
                      }`}
                    >
                      {selectedCandidate?.id === candidate.id ? (
                        <>
                          <CheckCircle className="w-6 h-6 mr-2" />
                          DIPILIH ✨
                        </>
                      ) : (
                        <>
                          <Zap className="w-6 h-6 mr-2" />
                          PILIH
                        </>
                      )}
                    </button>
                  </div>

                  {/* Animated border */}
                  <div className={`absolute inset-0 rounded-3xl border-2 border-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 opacity-0 group-hover:opacity-30 transition-opacity duration-300`} 
                       style={{ mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', maskComposite: 'subtract' }}></div>
                </div>
              </div>
            ))}
          </div>

          {/* Vote Confirmation */}
          {selectedCandidate && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-center animate-fade-in">
                <div className="mb-6">
                  <Zap className="w-16 h-16 text-yellow-400 mx-auto mb-4 animate-bounce" />
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Konfirmasi Pilihan Anda
                  </h3>
                  <p className="text-white/80 text-lg">
                    Anda memilih <span className="text-yellow-400 font-bold">{selectedCandidate.name}</span>
                  </p>
                  <p className="text-white/60 text-sm mt-2">
                    dari {selectedCandidate.party}
                  </p>
                </div>
                
                <div className="bg-red-500/20 border border-red-400/50 rounded-2xl p-4 mb-6">
                  <p className="text-red-300 text-sm font-medium">
                    ⚠️ PERHATIAN: Keputusan ini tidak dapat diubah setelah dikonfirmasi!
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => setSelectedCandidate(null)}
                    className="flex-1 bg-white/20 backdrop-blur-sm text-white py-4 px-6 rounded-2xl font-bold text-lg hover:bg-white/30 transition-all duration-300 border border-white/30"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleVote}
                    disabled={voting}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-6 rounded-2xl font-bold text-lg hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-50 flex items-center justify-center"
                  >
                    {voting ? (
                      <>
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Memproses...
                      </>
                    ) : (
                      <>
                        <Vote className="w-6 h-6 mr-2" />
                        BERIKAN SUARA! 🗳️
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VotingPageModern;