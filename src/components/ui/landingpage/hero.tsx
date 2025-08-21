
"use client"
import { useState } from "react";
import { Button } from "@/components/ui/button";

function validateEmail(email: string) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
}

export default function Hero() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/waitinglist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setEmail("");
      } else {
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[70vh] py-20 px-2 overflow-hidden bg-white">
      {/* Animated gradient background */}
      <div className="absolute inset-0 z-0 animate-gradient bg-gradient-to-r from-blue-400 via-purple-300 to-pink-400 opacity-30 blur-2xl" style={{ pointerEvents: 'none' }} />
      {/* Optional SVG doodle backgrounds */}
      <svg className="absolute left-0 bottom-0 w-1/3 max-w-xs opacity-60 pointer-events-none" viewBox="0 0 300 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 100 Q60 20 120 80 T220 100" stroke="#111" strokeWidth="3" fill="none"/>
        <circle cx="40" cy="110" r="8" fill="#111"/>
        <rect x="180" y="90" width="18" height="8" fill="#111" rx="4"/>
      </svg>
      <svg className="absolute right-0 top-0 w-1/3 max-w-xs opacity-60 pointer-events-none" viewBox="0 0 300 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M280 20 Q240 100 180 40 T80 20" stroke="#111" strokeWidth="3" fill="none"/>
        <circle cx="260" cy="30" r="8" fill="#111"/>
        <rect x="100" y="30" width="18" height="8" fill="#111" rx="4"/>
      </svg>
      <div className="relative z-10 flex flex-col items-center w-full max-w-xl mx-auto text-center">
        <div className="text-xs font-semibold tracking-widest text-gray-500 mb-4 uppercase">CONNECT DEVELOPERS & STUDENTS</div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-gray-900">
          Build amazing projects with <span className="text-primary">Cofundry</span>.
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-8">
          Connect with talented developers and students to bring your project ideas to life. Post projects, find team members, and collaborate on innovative solutions.
        </p>
        <div className="font-medium text-gray-700 mb-4">
          {/* Join Blake, Zack, and 2,165 others on the waitlist. */}
        </div>
        {/* <form onSubmit={handleSubmit} className="w-full flex flex-col sm:flex-row gap-3 items-center justify-center mb-2">
          <input
            placeholder="Enter your email"
            className="flex-1 px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-base bg-white"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={loading || success}
          />
          <Button type="submit" className="w-full sm:w-auto px-8 py-3 text-base font-semibold bg-blue-100 text-blue-900 hover:bg-blue-200" disabled={loading || success}>
            {loading ? "Joining..." : success ? "Joined!" : "Request access"}
          </Button>
        </form>
        {success && (
          <div className="text-green-600 font-medium mt-2">Thank you for joining! We'll notify you when we launch.</div>
        )}
        {error && (
          <div className="text-red-600 font-medium mt-2">{error}</div>
        )} */}
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center mt-4 mb-2">
          <Button className="px-8 py-3 text-base font-semibold" asChild>
            <a href="/register">Get Started</a>
          </Button>
          <Button variant="outline" className="px-8 py-3 text-base font-semibold" asChild>
            <a href="#learn-more">Learn More</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
