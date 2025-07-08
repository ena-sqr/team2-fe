/* eslint-disable jsx-a11y/img-redundant-alt */
import React, { useEffect, useState } from "react";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";
import { mutate } from "../api/mutator";

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

interface LivenessResult {
  is_live: boolean;
  confidence: number;
  message: string;
  success: boolean;
}

interface AnalyzeFace {
  age: number;
  gender: { dominant: string };
  race: { dominant: string };
  emotion: { dominant: string };
}

const ResultsModal: React.FC<ResultsModalProps> = ({
  matchResult,
  imageOne,
  imageTwo,
  onClose,
  apiUrl,
  detectorBackend
}) => {
  const [livenessOne, setLivenessOne] = useState<LivenessResult | null>(null);
  const [livenessTwo, setLivenessTwo] = useState<LivenessResult | null>(null);
  const [analyzeOne, setAnalyzeOne] = useState<AnalyzeFace | null>(null);
  const [analyzeTwo, setAnalyzeTwo] = useState<AnalyzeFace | null>(null);

  const runLivenessCheck = async (image: File, setResult: (r: LivenessResult) => void) => {
    const formData = new FormData();
    formData.append("image", image, image.name);
    formData.append("detector_backend", detectorBackend);

    try {
       const result = await mutate<any>(`${apiUrl}/liveness-check`, {
        method: "POST",
        body: formData,
      });
      setResult(result);
    } catch (e) {
      console.error("Liveness error:", e);
    }
  };

  const runAnalyzeCheck = async (image: File, setResult: (r: AnalyzeFace | null) => void) => {
    const formData = new FormData();
    formData.append("image", image, image.name);

    try {
        const result = await mutate<any>(`${apiUrl}/analyze`, {
        method: "POST",
        body: formData,
      });
      setResult(result.faces?.[0] ?? null);
    } catch (e) {
      console.error("Analyze error:", e);
    }
  };

  useEffect(() => {
    if (imageOne) {
      runLivenessCheck(imageOne, setLivenessOne);
      runAnalyzeCheck(imageOne, setAnalyzeOne);
    }
    if (imageTwo) {
      runLivenessCheck(imageTwo, setLivenessTwo);
      runAnalyzeCheck(imageTwo, setAnalyzeTwo);
    }
  }, [imageOne, imageTwo]);

  if (!matchResult) return null;

  const renderLiveness = (result: LivenessResult | null) =>
    result ? (
      <div className="text-sm mt-1 text-left">
        <p>
          <span className="font-medium">Liveness:</span>{" "}
          <span
            className={`font-semibold ${
              result.is_live ? "text-green-600" : "text-red-600"
            }`}
          >
            {result.is_live ? "Live" : "Spoofed"} ({(result.confidence * 100).toFixed(2)}%)
          </span>
        </p>
        <p className="text-xs text-gray-500">{result.message}</p>
      </div>
    ) : (
      <p className="text-sm text-gray-400">Checking liveness...</p>
    );

  const renderAnalyze = (face: AnalyzeFace | null) =>
    face ? (
      <div className="text-sm mt-2 text-left">
        <p>
          <span className="font-medium">Age:</span> {face.age}
        </p>
        <p>
          <span className="font-medium">Gender:</span> {face.gender.dominant}
        </p>
        <p>
          <span className="font-medium">Race:</span> {face.race.dominant}
        </p>
        <p>
          <span className="font-medium">Emotion:</span> {face.emotion.dominant}
        </p>
      </div>
    ) : (
      <p className="text-sm text-gray-400">Analyzing face...</p>
    );

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
                <div className="px-4">{renderLiveness(livenessOne)}</div>
                <div className="px-4">{renderAnalyze(analyzeOne)}</div>
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
                <div className="px-4">{renderLiveness(livenessTwo)}</div>
                <div className="px-4">{renderAnalyze(analyzeTwo)}</div>
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
