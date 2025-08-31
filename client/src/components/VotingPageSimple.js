import React, { useState, useEffect } from 'react';
import { LogOut, Vote, CheckCircle, Users, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';

const VotingPageSimple = ({ user, token, socket, onLogout }) => {
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [totalVotes, setTotalVotes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalCandidate, setModalCandidate] = useState(null);
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

      toast.success(`Berhasil memilih ${selectedCandidate.name}!`, {
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

  const showCandidateDetail = (candidate) => {
    setModalCandidate(candidate);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data kandidat...</p>
        </div>
      </div>
    );
  }

  if (hasVoted) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Suara Berhasil Diberikan! 🎉
          </h2>
          <p className="text-gray-600 mb-6">
            Terima kasih telah berpartisipasi dalam pemilihan ini.
          </p>
          <div className="flex space-x-3">
            <button
              onClick={() => navigate('/results')}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Lihat Hasil
            </button>
            <button
              onClick={onLogout}
              className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Sistem Pemilihan Online
              </h1>
              <p className="text-gray-600">Selamat datang, {user?.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-sm text-gray-500">Total Suara</div>
                <div className="text-xl font-bold text-blue-600 flex items-center">
                  <Users className="w-5 h-5 mr-1" />
                  {totalVotes}
                </div>
              </div>
              <button
                onClick={onLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Pilih Kandidat Anda
          </h2>
          <p className="text-gray-600">
            Klik pada kandidat untuk melihat detail, lalu tekan tombol "Pilih" untuk memberikan suara.
          </p>
        </div>

        {/* Candidates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {candidates.map((candidate) => (
            <div
              key={candidate.id}
              className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-200 hover:shadow-lg ${
                selectedCandidate?.id === candidate.id
                  ? 'ring-2 ring-blue-500 shadow-lg'
                  : ''
              }`}
            >
              {/* Photo */}
              <div className="relative">
                <img
                  src={candidate.image}
                  alt={candidate.name}
                  className="w-full h-48 object-cover cursor-pointer"
                  onClick={() => showCandidateDetail(candidate)}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div 
                  className="w-full h-48 flex items-center justify-center text-white text-4xl font-bold hidden cursor-pointer"
                  style={{ backgroundColor: candidate.color }}
                  onClick={() => showCandidateDetail(candidate)}
                >
                  {candidate.name.split(' ').map(n => n[0]).join('')}
                </div>
                
                {/* Info button */}
                <button
                  onClick={() => showCandidateDetail(candidate)}
                  className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-all"
                >
                  <Eye className="w-4 h-4" />
                </button>

                {/* Selected badge */}
                {selectedCandidate?.id === candidate.id && (
                  <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                    TERPILIH
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-800 mb-1">
                  {candidate.name}
                </h3>
                <p className="text-gray-600 text-sm mb-2">
                  {candidate.party}
                </p>
                <p className="text-gray-500 text-xs mb-4 line-clamp-2">
                  "{candidate.vision}"
                </p>
                
                <button
                  onClick={() => setSelectedCandidate(candidate)}
                  className={`w-full py-2 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center ${
                    selectedCandidate?.id === candidate.id
                      ? 'bg-green-600 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {selectedCandidate?.id === candidate.id ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Terpilih
                    </>
                  ) : (
                    <>
                      <Vote className="w-4 h-4 mr-2" />
                      Pilih
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Vote Button */}
        {selectedCandidate && (
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Konfirmasi Pilihan Anda
            </h3>
            <p className="text-gray-600 mb-4">
              Anda akan memberikan suara untuk{' '}
              <span className="font-semibold text-gray-800">
                {selectedCandidate.name}
              </span>{' '}
              dari {selectedCandidate.party}.
            </p>
            <p className="text-red-600 text-sm mb-6">
              ⚠️ Keputusan ini tidak dapat diubah!
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setSelectedCandidate(null)}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleVote}
                disabled={voting}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center"
              >
                {voting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Memproses...
                  </>
                ) : (
                  <>
                    <Vote className="w-4 h-4 mr-2" />
                    Berikan Suara
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && modalCandidate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <img
                  src={modalCandidate.image}
                  alt={modalCandidate.name}
                  className="w-20 h-20 rounded-full object-cover mr-4"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center text-white text-xl font-bold mr-4 hidden"
                  style={{ backgroundColor: modalCandidate.color }}
                >
                  {modalCandidate.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {modalCandidate.name}
                  </h2>
                  <p className="text-gray-600">{modalCandidate.party}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Visi
                  </h3>
                  <p className="text-gray-600">{modalCandidate.vision}</p>
                </div>

                {modalCandidate.mission && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      Misi
                    </h3>
                    <p className="text-gray-600 whitespace-pre-line">
                      {modalCandidate.mission}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Tutup
                </button>
                <button
                  onClick={() => {
                    setSelectedCandidate(modalCandidate);
                    setShowModal(false);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Vote className="w-4 h-4 mr-2" />
                  Pilih Kandidat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VotingPageSimple;