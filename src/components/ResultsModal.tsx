/* eslint-disable jsx-a11y/img-redundant-alt */
import React from "react";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";

interface MatchResult {
  verified: boolean;
  similarity_percentage: number;
}

interface ResultsModalProps {
  matchResult: MatchResult | null;
  imageOne: File | null;
  imageTwo: File | null;
  onClose: () => void;
  apiUrl: string;
  detectorBackend: string;
}

const ResultsModal: React.FC<ResultsModalProps> = ({
  matchResult,
  imageOne,
  imageTwo,
  onClose,
  apiUrl,
  detectorBackend
}) => {

  if (!matchResult) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-3xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-lg font-bold"
        >
          ✕
        </button>

        {/* Title */}
        <h2 className="text-2xl font-semibold text-center mb-4 text-gray-800">
          Results
        </h2>

        {/* Image Previews + Liveness + Analyze */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* First Image */}
          <div className="text-center">
            <p className="mb-2 font-medium text-gray-600">First Image</p>
            {imageOne && (
              <>
                <img
                  src={URL.createObjectURL(imageOne)}
                  alt="First Image"
                  className="rounded-xl mx-auto max-h-64 object-cover shadow"
                />
              </>
            )}
          </div>

          {/* Second Image */}
          <div className="text-center">
            <p className="mb-2 font-medium text-gray-600">Second Image</p>
            {imageTwo && (
              <>
                <img
                  src={URL.createObjectURL(imageTwo)}
                  alt="Second Image"
                  className="rounded-xl mx-auto max-h-64 object-cover shadow"
                />
              </>
            )}
          </div>
        </div>

        {/* Match Status */}
        <div className="text-center mb-1">
          <div
            className={`inline-flex items-center gap-2 text-xl font-semibold ${
              matchResult.verified ? "text-green-600" : "text-red-600"
            }`}
          >
            {matchResult.verified ? (
              <>
                <CheckCircleIcon className="w-6 h-6" />
                Verified Match: {matchResult.similarity_percentage}%
              </>
            ) : (
              <>
                <XCircleIcon className="w-6 h-6" />
                Not Verified Match: {matchResult.similarity_percentage}%
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsModal;
