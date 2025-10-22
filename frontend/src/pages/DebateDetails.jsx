import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { debates } from "../api/api";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { ArrowLeft, Scale, Star, MessageSquare } from "lucide-react";

export default function DebateDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [debate, setDebate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDebate = async () => {
      try {
        const data = await debates.getDebate(id);
        setDebate(data);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load debate");
        console.error("Error fetching debate:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDebate();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-50 via-white to-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!debate) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-indigo-50 via-white to-white p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Debate Not Found</h2>
        <button
          onClick={() => navigate("/dashboard")}
          className="text-indigo-600 hover:text-indigo-800 flex items-center gap-2"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 py-16"
    >
      <div className="max-w-5xl mx-auto px-6 space-y-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Scale className="text-indigo-600 w-7 h-7" />
            <h1 className="text-3xl font-bold text-gray-900">Debate Evaluation</h1>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium transition"
          >
            <ArrowLeft size={18} /> Back
          </button>
        </div>

        {/* Topic Card */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/70 backdrop-blur-md shadow-md border border-gray-100 rounded-2xl p-8 flex items-center "
        >
          <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2 mb-3">
            <MessageSquare className="text-indigo-600 w-6 h-6" /> Topic : <span className="text-gray-600">{debate.topic}</span>
          </h2>
        </motion.div>

        {/* Arguments Grid */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="grid sm:grid-cols-2 gap-8"
        >
          {/* Side A */}
          <div className="bg-white/60 backdrop-blur-lg border border-indigo-100 rounded-2xl shadow-sm hover:shadow-md transition p-6">
            <h3 className="text-lg font-semibold text-indigo-800 mb-3">Side A</h3>
            <p className="text-gray-700 mb-4 text-sm leading-relaxed">{debate.sideA}</p>
            <div className="space-y-3">
              <p className="text-sm font-medium text-indigo-700 flex items-center gap-2">
                <Star className="w-4 h-4 text-indigo-500" />
                Score: <span className="font-bold">{debate.scoreA}/100</span>
              </p>
              <div className="bg-indigo-50 rounded-xl p-3">
                <p className="text-xs text-gray-500 uppercase mb-1">Justification</p>
                <p className="text-sm text-gray-700">
                  {debate.feedback.sideA_feedback.justification}
                </p>
              </div>
              <div className="bg-indigo-50 rounded-xl p-3">
                <p className="text-xs text-gray-500 uppercase mb-1">Improvements</p>
                <p className="text-sm text-gray-700">
                  {debate.feedback.sideA_feedback.improvements}
                </p>
              </div>
            </div>
          </div>

          {/* Side B */}
          <div className="bg-white/60 backdrop-blur-lg border border-blue-100 rounded-2xl shadow-sm hover:shadow-md transition p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">Side B</h3>
            <p className="text-gray-700 mb-4 text-sm leading-relaxed">{debate.sideB}</p>
            <div className="space-y-3">
              <p className="text-sm font-medium text-blue-700 flex items-center gap-2">
                <Star className="w-4 h-4 text-blue-500" />
                Score: <span className="font-bold">{debate.scoreB}/100</span>
              </p>
              <div className="bg-blue-50 rounded-xl p-3">
                <p className="text-xs text-gray-500 uppercase mb-1">Justification</p>
                <p className="text-sm text-gray-700">
                  {debate.feedback.sideB_feedback.justification}
                </p>
              </div>
              <div className="bg-blue-50 rounded-xl p-3">
                <p className="text-xs text-gray-500 uppercase mb-1">Improvements</p>
                <p className="text-sm text-gray-700">
                  {debate.feedback.sideB_feedback.improvements}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Verdict Card */}
        <motion.div
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-gradient-to-r from-indigo-100 via-blue-50 to-indigo-100 border border-indigo-200 shadow-md rounded-2xl p-8 text-center"
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Final Verdict</h3>
          <p className="text-3xl font-extrabold text-indigo-700 mb-2">
            🏆 Winner: {debate.winner}
          </p>
          <p className="text-sm text-gray-600">
            Judged on {new Date(debate.createdAt).toLocaleString()}
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
