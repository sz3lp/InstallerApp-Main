import React from "react";
import supabase from "../../lib/supabaseClient";
import { useAuth } from "../../lib/hooks/useAuth";
import { toast } from "react-hot-toast";

interface OnboardingPanelProps {
  onComplete: () => void;
}

const OnboardingPanel: React.FC<OnboardingPanelProps> = ({ onComplete }) => {
  const { user, role } = useAuth();

  if (!user || role === "Admin") return null;

  const handleComplete = async () => {
    const { error } = await supabase
      .from("profiles")
      .update({ onboarded: true })
      .eq("user_id", user.id);
    if (error) {
      console.error("Error updating onboarding status", error);
      toast.error("Failed to complete onboarding. Please try again.");
    } else {
      toast.success("Welcome to SentientZone!");
      onComplete();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
    >
      <div className="bg-white p-6 rounded shadow-md w-96 text-center space-y-4">
        <h2 className="text-xl font-semibold">Welcome to SentientZone!</h2>
        <p>Let's get you set up quickly.</p>
        <div className="space-x-2">
          <button
            onClick={handleComplete}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Get Started
          </button>
          <button
            onClick={onComplete}
            className="px-4 py-2 border rounded"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPanel;
