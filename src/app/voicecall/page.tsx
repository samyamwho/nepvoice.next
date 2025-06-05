"use client";

import React, { useState } from "react";
import {
  AudioWaveform,
  ChevronDown,
  ChevronRight,
  Phone,
  BarChart2,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "@/components/shared/Sidebar";
import TypingText from "@/components/shared/TypingText"; 
// import AudioDashboard from "./audiodashboard";


const CALL_BOT_ENDPOINT = process.env.NEXT_PUBLIC_CALL_BOT_ENDPOINT;

const Audiocall: React.FC = () => {
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [schedule, setSchedule] = useState("");
  const [bank, setBank] = useState("");
  const [status, setStatus] = useState("");
  const [showDashboard, setShowDashboard] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!CALL_BOT_ENDPOINT) {
      toast.error("API endpoint is not configured. Please contact support.");
      setStatus("✗ Configuration error");
      return;
    }

    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!number.trim()) {
      toast.error("Please enter your phone number");
      return;
    }
    if (!schedule.trim()) {
      toast.error("Please enter schedule time");
      return;
    }
    if (!bank) {
      toast.error("Please select a bank or service");
      return;
    }

    const phoneRegex = /^[9][6-8]\d{8}$/;
    if (!phoneRegex.test(number)) {
      toast.error("Please enter a valid Nepal phone number");
      return;
    }

    setStatus("Sending request...");

    try {
      const response = await fetch(CALL_BOT_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          number: number,
          schedule: parseInt(schedule) || 0,
          bank: bank,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Call scheduled successfully:", data);
        setStatus("✓ Call scheduled successfully!");
        toast.success(
          "Call scheduled successfully! You will receive a call shortly."
        );

        setName("");
        setNumber("");
        setSchedule("");
        setBank("");

        setTimeout(() => setStatus(""), 3000);
      } else {
        // Handle HTTP errors (e.g., 4xx, 5xx)
        const errorData = await response.text(); // Try to get error message from body
        console.error("Server error:", response.status, errorData);
        if (response.status === 500) {
          toast.error(
            "Sorry, something went wrong on the server. Please try again later."
          );
        } else {
          toast.error(
            `Error: ${response.statusText || `Server responded with ${response.status}`}`
          );
        }
        setStatus("✗ Failed to schedule call");
      }
    } catch (error) {
      // Handle network errors or other issues (e.g., JSON parsing if response.ok but not JSON)
      console.error("Request failed:", error);
      toast.error(
        "Request failed. Please check your internet connection or try again."
      );
      setStatus("✗ Failed to schedule call");
    }
  };

  return (
    <div className="flex min-h-screen font-[Avenir] bg-gray-50 overflow-hidden">
      <Sidebar />

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={{ zIndex: 9999 }} // Keep zIndex high for toasts
        toastStyle={{
          minWidth: "200px",
          maxWidth: "300px",
          fontSize: "12px",
          padding: "8px 12px",
          borderRadius: "6px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
          marginTop: "0.5rem",
          marginRight: "0.5rem",
        }}
      />

      <div className="flex-1 flex flex-col h-screen w-full overflow-y-auto">
        <header className="w-full flex justify-between items-center p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl text-gray-800 font-custom ml-5">
              Nep Voice: Voice Call Automation
            </h1>
            <ChevronRight size={16} />
          </div>

          <button
            onClick={() => setShowDashboard(!showDashboard)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#000000] text-white hover:bg-[#2b2a2a] transition-colors"
          >
            <BarChart2 size={18} />
            {showDashboard ? "Close Dashboard" : "Dashboard"}
          </button>
        </header>

        {showDashboard ? (
          <AudioDashboard />
        ) : (
          <div
            className="flex-1 flex justify-center items-center p-6"
            style={{
              background:
                "linear-gradient(135deg, #e0f7fa 0%, #ffffff 100%)",
              backgroundImage: `
                radial-gradient(circle at 20% 20%, rgba(0, 136, 204, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, rgba(0, 136, 204, 0.1) 0%, transparent 50%)
              `,
            }}
          >
            <div className="max-w-md w-full text-center">
              <h1 className="text-6xl font-medium text-black leading-tight">
                Get a call from <br />
                <TypingText />
              </h1>
              <p className="mt-6 text-gray-500 text-3xl">
                Built for Outbound.
              </p>
              <p className="mt-2 text-gray-500 text-lg">
                Personalized Calls at Scale
              </p>

              <div className="mt-6 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2">
                  <Phone size={20} className="text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-800">
                    Test Audio of our Voice Calls
                  </h2>
                </div>

                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  <input
                    type="text"
                    placeholder="What shall I call you?"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <span className="px-4 py-2 text-gray-500 border-r border-gray-300">
                      +977
                    </span>
                    <input
                      type="tel"
                      placeholder="Enter your phone number"
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                      className="w-full text-black px-4 py-2 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <input
                    type="number"
                    placeholder="Schedule (in minutes)"
                    value={schedule}
                    onChange={(e) => setSchedule(e.target.value)}
                    className="w-full px-4 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="relative w-full">
                    <select
                      value={bank}
                      onChange={(e) => setBank(e.target.value)}
                      className="appearance-none w-full px-4 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="" disabled>
                        Select a Bank or Service
                      </option>
                      <option value="global">Global IME</option>
                      <option value="nabil">Nabil Bank</option>
                      <option value="bnb">
                        Bangladesh Nepal Bank (BNB)
                      </option>
                      <option value="shikhar">Shikhar Insurance</option>
                      <option value="worldlink">WorldLink</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    </div>
                  </div>

                  {status && (
                    <div
                      className={`text-sm ${
                        status.includes("✓")
                          ? "text-green-500"
                          : status.includes("✗")
                          ? "text-red-500"
                          : "text-blue-500"
                      }`}
                    >
                      {status}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-gray-700 to-gray-900 text-gray-200 rounded-lg font-semibold flex items-center justify-center gap-2 hover:from-gray-600 hover:to-gray-800 transition-all"
                  >
                    <AudioWaveform />
                    Get a Call
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Audiocall;