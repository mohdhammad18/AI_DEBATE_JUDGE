import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { debates } from "../api/api";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  Brain,
  ArrowLeft,
  Loader2,
  Plus,
  Pencil,
  Check,
  Edit3,
  Clock,
} from "lucide-react";
import Timer from "../components/Timer";

export default function NewDebate() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    topic: "",
    numPoints: 1,
    sideA: [],
    sideB: [],
    timeEnabled: false,
    timePerSide: 300, // 5 minutes in seconds
  });
  const [turn, setTurn] = useState("A");
  const [inputValue, setInputValue] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState({ A: 0, B: 0 });
  const [initialTimeSet, setInitialTimeSet] = useState(false);

  // Initialize timers when entering step 2
  useEffect(() => {
    if (step === 2 && formData.timeEnabled && !initialTimeSet) {
      setTimeRemaining({
        A: formData.timePerSide,
        B: formData.timePerSide,
      });
      setInitialTimeSet(true);
    }
  }, [step, formData.timeEnabled, formData.timePerSide, initialTimeSet]);

  // Derived progress
  const totalRounds = formData.numPoints * 2;
  const currentCount = formData.sideA.length + formData.sideB.length;
  const progress = Math.floor((currentCount / totalRounds) * 100);

  const handleChange = (e) => {
    console.log(e.target);
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "numPoints" ? parseInt(value) : value,
    });
  };

  const handleAddArgument = (isTimeUp = false) => {
    if (!isTimeUp && !inputValue.trim()) {
      toast.error("Please enter a valid argument.");
      return;
    }

    const updated = { ...formData };
    const nextTurn = turn === "A" ? "B" : "A";
    const currentTime = timeRemaining[turn];

    if (turn === "A") {
      updated.sideA.push(
        inputValue.trim() || "Time expired before argument completion"
      );
      setTurn(nextTurn);
    } else {
      updated.sideB.push(
        inputValue.trim() || "Time expired before argument completion"
      );
      setTurn(nextTurn);
      setCurrentIndex((i) => i + 1);
    }

    setFormData(updated);
    setInputValue("");

    if (
      updated.sideA.length === formData.numPoints &&
      updated.sideB.length === formData.numPoints
    ) {
      toast.success("All arguments added! Review before submission.");
      setStep(3);
    } else if (isTimeUp && formData.timeEnabled) {
      if (currentTime <= 0) {
        toast.error(`Time's up for Side ${turn}! No time remaining.`);
      } else {
        toast.warning("Time's up for this argument! Moving to next turn.");
      }
    }
  };

  const handleEditArgument = (side, index, newValue) => {
    if (formData.timeEnabled) {
      const currentTime = timeRemaining[side];
      if (currentTime <= 0) {
        toast.error(`Cannot edit - Side ${side} has no time remaining!`);
        return;
      }
    }

    const updated = { ...formData };
    if (side === "A") updated.sideA[index] = newValue;
    else updated.sideB[index] = newValue;
    setFormData(updated);
  };

  const handleSubmit = async () => {
    setLoading(true);
    const toastId = toast.loading("AI is judging your debate...");
    try {
      // Join array of arguments into single string for each side
      const payload = {
        topic: formData.topic,
        sideA: formData.sideA.join(" "), // Combine all arguments for side A
        sideB: formData.sideB.join(" "), // Combine all arguments for side B
        timeEnabled: formData.timeEnabled,
        timePerSide: formData.timePerSide,
      };
      const data = await debates.submitDebate(payload);
      toast.dismiss(toastId);
      toast.success("Debate judged successfully!");
      // Navigate to the debate details page
      navigate(`/debates/${data.debate.id}`);
    } catch (err) {
      toast.dismiss(toastId);
      toast.error(err.response?.data?.message || "Failed to judge debate.");
    } finally {
      setLoading(false);
    }
  };

  const resetDebate = () => {
    setStep(1);
    setFormData({
      topic: "",
      numPoints: 3,
      sideA: [],
      sideB: [],
      timeEnabled: false,
      timePerSide: 300,
    });
    setTurn("A");
    setResult(null);
    setCurrentIndex(0);
    setEditMode(false);
    setTimeRemaining({ A: 0, B: 0 });
    setInitialTimeSet(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-white py-12"
    >
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Brain className="text-indigo-600" size={26} /> New Debate
          </h1>
          <button
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
          >
            <ArrowLeft size={16} /> Back
          </button>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Setup */}
          {step === 1 && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white shadow-md rounded-2xl border border-gray-100 p-6 space-y-6"
            >
              <h2 className="text-xl font-semibold text-gray-900">
                Debate Configuration
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Enter the 'Debate Topic'
                </label>
                <input
                  type="text"
                  name="topic"
                  value={formData.topic}
                  onChange={handleChange}
                  placeholder="Should AI replace human judges?"
                  className="mt-2 w-full rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 p-3 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Number of Arguments (1–15)
                </label>
                <input
                  type="number"
                  name="numPoints"
                  min="1"
                  max="15"
                  value={formData.numPoints}
                  onChange={handleChange}
                  className="mt-2 w-32 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 p-2 text-sm"
                />
              </div>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="timeEnabled"
                    name="timeEnabled"
                    checked={formData.timeEnabled}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        timeEnabled: e.target.checked,
                      })
                    }
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                  />
                  <label
                    htmlFor="timeEnabled"
                    className="ml-2 block text-sm font-medium text-gray-700"
                  >
                    Enable Time Limit for Arguments
                  </label>
                </div>
                {formData.timeEnabled && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Time per Side (in minutes)
                    </label>
                    <input
                      type="number"
                      name="timePerSide"
                      min="1"
                      max="15"
                      value={Math.floor(formData.timePerSide / 60)}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          timePerSide: e.target.value * 60,
                        })
                      }
                      className="mt-2 w-32 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 p-2 text-sm"
                    />
                  </div>
                )}
              </div>
              <div className="flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() =>
                    formData.topic.trim()
                      ? setStep(2)
                      : toast.error("Enter a topic first")
                  }
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium shadow-sm"
                >
                  Start Debate →
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Add Arguments */}
          {step === 2 && (
            <motion.div
              key="arguments"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white shadow-md rounded-2xl border border-gray-100 p-6 space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  Round {Math.ceil(currentCount / 2) + 1}
                </h2>
                <div className="flex items-center gap-6">
                  {formData.timeEnabled && (
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-indigo-600 font-medium">
                          Side A:
                        </span>
                        <Timer
                          remainingTime={timeRemaining.A}
                          isActive={turn === "A"}
                          onTimeUpdate={(time) =>
                            setTimeRemaining((prev) => ({ ...prev, A: time }))
                          }
                          onTimeUp={() =>
                            turn === "A" && handleAddArgument(true)
                          }
                          className="text-sm font-medium"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-blue-600 font-medium">
                          Side B:
                        </span>
                        <Timer
                          remainingTime={timeRemaining.B}
                          isActive={turn === "B"}
                          onTimeUpdate={(time) =>
                            setTimeRemaining((prev) => ({ ...prev, B: time }))
                          }
                          onTimeUp={() =>
                            turn === "B" && handleAddArgument(true)
                          }
                          className="text-sm font-medium"
                        />
                      </div>
                    </div>
                  )}
                  <span className="text-sm text-gray-500">
                    {currentCount}/{totalRounds}
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="flex items-center justify-between">
                <p className="text-gray-700 font-medium">
                  Now:{" "}
                  {turn === "A" ? "🟣 Side A (For)" : "🔵 Side B (Against)"}
                </p>
                {formData.timeEnabled && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock size={14} />
                    Time remaining
                  </div>
                )}
              </div>

              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={`Enter argument for Side ${turn}`}
                className="w-full rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 p-3 text-sm min-h-[100px]"
              />
              <div className="flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddArgument}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium shadow-sm"
                >
                  <Plus size={18} /> Add Argument
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Review */}
          {step === 3 && !result && (
            <motion.div
              key="review"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white shadow-md rounded-2xl border border-gray-100 p-6 space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Review & Edit
                </h2>
                <div className="flex items-center gap-4">
                  {formData.timeEnabled && editMode && (
                    <div className="flex items-center gap-4 mr-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-indigo-600 font-medium">
                          Side A:
                        </span>
                        <Timer
                          remainingTime={timeRemaining.A}
                          isActive={editMode}
                          onTimeUpdate={(time) =>
                            setTimeRemaining((prev) => ({ ...prev, A: time }))
                          }
                          onTimeUp={() => {
                            setEditMode(false);
                            toast.error(
                              "Time's up for Side A! Editing disabled."
                            );
                          }}
                          className="text-sm font-medium"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-blue-600 font-medium">
                          Side B:
                        </span>
                        <Timer
                          remainingTime={timeRemaining.B}
                          isActive={editMode}
                          onTimeUpdate={(time) =>
                            setTimeRemaining((prev) => ({ ...prev, B: time }))
                          }
                          onTimeUp={() => {
                            setEditMode(false);
                            toast.error(
                              "Time's up for Side B! Editing disabled."
                            );
                          }}
                          className="text-sm font-medium"
                        />
                      </div>
                    </div>
                  )}
                  <button
                    onClick={() => {
                      if (formData.timeEnabled) {
                        const sideATime = timeRemaining.A;
                        const sideBTime = timeRemaining.B;
                        if (sideATime <= 0 || sideBTime <= 0) {
                          toast.error(
                            "Cannot edit - one or both sides have no time remaining!"
                          );
                          return;
                        }
                      }
                      setEditMode(!editMode);
                    }}
                    className="flex items-center gap-1 text-indigo-600 text-sm font-medium"
                  >
                    {editMode ? (
                      <>
                        <Check size={16} /> Done Editing
                      </>
                    ) : (
                      <>
                        <Edit3 size={16} /> Edit
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                {["A", "B"].map((side) => (
                  <div key={side}>
                    <h3
                      className={`text-lg font-medium ${
                        side === "A" ? "text-indigo-700" : "text-red-700"
                      }`}
                    >
                      Side {side === "A" ? "A (For)" : "B (Against)"}
                    </h3>
                    {formData[`side${side}`].map((arg, i) => (
                      <div key={i} className="mt-3">
                        {editMode ? (
                          <textarea
                            value={arg}
                            onChange={(e) =>
                              handleEditArgument(side, i, e.target.value)
                            }
                            className="w-full border rounded-xl p-2 text-sm focus:ring-2 focus:ring-indigo-500 scroll-auto"
                          />
                        ) : (
                          <p className="bg-gray-50 p-2 rounded-md text-sm">
                            {arg}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setStep(2)}
                  className="text-gray-700 hover:text-gray-900"
                >
                  ← Back
                </button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  disabled={loading}
                  className={`px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 flex items-center gap-2 ${
                    loading ? "opacity-50" : ""
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={18} /> Judging...
                    </>
                  ) : (
                    <>Judge Debate</>
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Results */}
          {step === 4 && result && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white shadow-md rounded-2xl border border-gray-100 p-6 space-y-6"
            >
              <h2 className="text-xl font-semibold text-gray-900">
                🏆 Debate Results
              </h2>

              <p className="text-gray-700">
                <strong>Topic:</strong> {formData.topic}
              </p>

              <div className="grid sm:grid-cols-2 gap-6">
                {/* 🟣 Side A */}
                <div className="bg-indigo-50 rounded-xl p-5">
                  <h3 className="text-lg font-semibold text-indigo-700 mb-3">
                    🟣 Side A (For)
                  </h3>
                  <strong className="text-sm text-gray-800 mb-2">
                    Arguments Submitted:
                  </strong>
                  <ul className="list-decimal list-inside space-y-2 mt-2 mb-4">
                    {formData.sideB.map((arg, i) => (
                      <li
                        key={i}
                        className="text-sm text-gray-700 bg-white p-2 rounded-md border border-gray-200"
                      >
                        {arg}
                      </li>
                    ))}
                  </ul>
                  <p className="text-sm text-gray-800">
                    <strong>Pursuasiveness Score:</strong>{" "}
                    {result.debate.scoreA ?? "N/A"}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    <strong>Justification:</strong>{" "}
                    {result.debate.feedback?.sideA_feedback?.justification ||
                      "No justification provided."}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    <strong>Improvements:</strong>{" "}
                    {result.debate.feedback?.sideA_feedback?.improvements ||
                      "No improvements suggested."}
                  </p>
                </div>

                {/* 🔵 Side B */}
                <div className="bg-red-50 rounded-xl p-5">
                  <h3 className="text-lg font-semibold text-red-700 mb-3">
                    🔵 Side B (Against)
                  </h3>
                  <p className="text-sm text-gray-800 mb-2">
                    <strong>Argument:</strong>{" "}
                    {result.debate.sideB || formData.sideB.join(" ")}
                  </p>
                  <p className="text-sm text-gray-800">
                    <strong>Pursuasiveness Score:</strong>{" "}
                    {result.debate.scoreB ?? "N/A"}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    <strong>Justification:</strong>{" "}
                    {result.debate.feedback?.sideB_feedback?.justification ||
                      "No justification provided."}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    <strong>Improvements:</strong>{" "}
                    {result.debate.feedback?.sideB_feedback?.improvements ||
                      "No improvements suggested."}
                  </p>
                </div>
              </div>

              {/* Winner Section */}
              <div className="mt-6 bg-white p-4 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500 uppercase mb-1">Winner</p>
                <p className="text-lg font-semibold text-indigo-700">
                  {result.debate.winner}
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={resetDebate}
                  className="px-4 py-2 rounded-xl text-sm text-gray-700 hover:bg-gray-100"
                >
                  New Debate
                </button>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
                >
                  Back to Dashboard
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
