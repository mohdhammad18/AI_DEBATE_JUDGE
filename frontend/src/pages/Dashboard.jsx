import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, debates } from "../api/api";
import { motion } from "framer-motion";
import { ArrowRight, PlusCircle, Trophy, BarChart3, History, Trash2, X } from "lucide-react";
import { toast } from "react-hot-toast";



export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [debateHistory, setDebateHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteModal, setDeleteModal] = useState({ show: false, debateId: null });
  const [isDeleting, setIsDeleting] = useState(false);

  const placeholderSummaries = [
  "A thought-provoking discussion on this topic.",
  "Explore the different sides of this complex issue.",
  "See how the arguments unfolded in this debate.",
  "A deep dive into the pros and cons.",
  "A spirited exchange of ideas.",
];


const getStablePlaceholderIndex = (id) => {
  let hash = 0;
  const str = String(id);
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  // Make it positive and get a value between 0 and 4
  return Math.abs(hash) % placeholderSummaries.length;
};

  const handleDelete = (e, debateId) => {
    e.stopPropagation();
    setDeleteModal({ show: true, debateId });
  };

  const confirmDelete = async () => {
    if (isDeleting) return;
    
    setIsDeleting(true);
    try {
      await debates.deleteDebate(deleteModal.debateId);
      setDebateHistory(debateHistory.filter(d => d._id !== deleteModal.debateId));
      toast.success("Debate deleted successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete debate");
    } finally {
      setIsDeleting(false);
      setDeleteModal({ show: false, debateId: null });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userData, debatesData] = await Promise.all([
          auth.getCurrentUser(),
          debates.getHistory(),
        ]);
        setUser(userData);
        setDebateHistory(debatesData);
      } catch (err) {
        setError("Failed to load dashboard data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Compute user stats
  const totalDebates = debateHistory.length;
  const sideAWins = debateHistory.filter((d) => d.winner === "Side A").length;
  const sideBWins = debateHistory.filter((d) => d.winner === "Side B").length;
  const winRate = totalDebates
    ? Math.round((Math.max(sideAWins, sideBWins) / totalDebates) * 100)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 py-10"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              Welcome, {user?.username || "Debater"}!
            </h1>
            <p className="mt-1 text-gray-500">
              Track your debates, see results, and start new challenges.
            </p>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/new-debate")}
            className="mt-6 sm:mt-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-medium shadow-md hover:bg-indigo-700 transition"
          >
            <PlusCircle size={18} /> New Debate
          </motion.button>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Stats Summary */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-12"
        >
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
            <div className="bg-indigo-100 text-indigo-600 p-3 rounded-xl">
              <History size={22} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Debates</p>
              <h3 className="text-2xl font-bold text-gray-900">{totalDebates}</h3>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
            <div className="bg-green-100 text-green-600 p-3 rounded-xl">
              <Trophy size={22} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Win Rate</p>
              <h3 className="text-2xl font-bold text-gray-900">{winRate}%</h3>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
            <div className="bg-blue-100 text-blue-600 p-3 rounded-xl">
              <BarChart3 size={22} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Winning Side</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {sideAWins > sideBWins ? "Side A (For) 🟣" : sideBWins > 0 ? "Side B (Against) 🔵" : "—"}
              </h3>
            </div>
          </div>
        </motion.div>

        {/* Debate History */}
        {debateHistory.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center mt-20 text-center"
          >
            <img
              src="https://illustrations.popsy.co/violet/empty-state.svg"
              alt="No debates"
              className="w-52 h-52 mb-6 opacity-90"
            />
            <h3 className="text-lg font-semibold text-gray-700">
              No debates yet
            </h3>
            <p className="text-gray-500 mt-1 mb-4">
              Start your first debate and watch your stats grow here.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/new-debate")}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg shadow-sm transition"
            >
              <PlusCircle size={16} /> Start a Debate
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {debateHistory.map((debate, i) => (
              <motion.div
                key={debate._id}
                whileHover={{ scale: 1.02, y: -3 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 hover:shadow-lg transition"
              >
                <div className="flex justify-between items-start mb-2">
                  <div
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      debate.winner === "Side A"
                        ? "bg-indigo-100 text-indigo-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    Winner : {debate.winner}
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, debate._id)}
                    className="p-1.5 hover:bg-red-50 rounded-full text-gray-400 hover:text-red-500 transition-colors"
                    title="Delete debate"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div 
                  className="cursor-pointer"
                  onClick={() => navigate(`/debates/${debate._id}`)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-800 w-60 line-clamp-2">
                      {debate.title || debate.topic}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">
                    {new Date(debate.createdAt).toLocaleDateString()} •{" "}
                    {new Date(debate.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>

                  <p className="text-gray-700 text-sm line-clamp-3 mb-4">
                    {debate.summary || placeholderSummaries[getStablePlaceholderIndex(debate._id)]}
                  </p>

                  <div className="flex items-center justify-between text-sm text-indigo-600 font-medium">
                    <span className="inline-flex items-center gap-1">
                      View Details <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteModal.show && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 relative shadow-xl"
            >
              <button
                onClick={() => setDeleteModal({ show: false, debateId: null })}
                className="absolute right-4 top-4 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <X size={20} />
              </button>
              
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                  <Trash2 className="text-red-600" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Delete Debate?</h3>
                <p className="text-gray-600 mt-2">
                  This action cannot be undone. The debate and all its data will be permanently removed.
                </p>
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteModal({ show: false, debateId: null })}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors"
                >
                  Delete Debate
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
