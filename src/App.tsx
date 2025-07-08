import { useEffect, useState } from "react";
import ResultsModal from "./components/ResultsModal";
import ImageUploaderInput from "./components/ImageUploaderInput";
import {
  getThresholdForModel,
  ModelsConfig,
  DistanceMetric,
} from "./utils/threshold";
import { distanceMetricDescriptions } from "./utils/metrics";
import { fetcher } from "./api/fetcher";
import { mutate } from "./api/mutator";

const DEFAULT_MODEL = "VGG-Face";
const DEFAULT_METRIC = "cosine";
const DEFAULT_THRESHOLD = "0.68";

const MODELS = [
  "VGG-Face",
  "Facenet",
  "Facenet512",
  "OpenFace",
  "DeepFace",
  "DeepID",
  "ArcFace",
  "Dlib",
  "SFace",
  "GhostFaceNet",
  "Buffalo_L",
];

const METRICS = ["cosine", "euclidean", "euclidean_l2"];

export default function App() {
  const [imageOne, setImageOne] = useState<File | null>(null);
  const [imageTwo, setImageTwo] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState(DEFAULT_MODEL);
  const [metric, setMetric] = useState(DEFAULT_METRIC as DistanceMetric);
  const [threshold, setThreshold] = useState(DEFAULT_THRESHOLD);
  const [modelDescription, setModelDescription] = useState("");
  const [modelsConfig, setModelsConfig] = useState({} as ModelsConfig);

  const [matchResult, setMatchResult] = useState<{
    verified: boolean;
    similarity_percentage: number;
    distance: number;
    distance_metric: string;
    model: string;
    success: boolean;
    threshold: number;
  } | null>(null);

  const IMAGES_INPUT = [
    { label: "First Image", file: imageOne, setFile: setImageOne },
    { label: "Second Image", file: imageTwo, setFile: setImageTwo },
  ];

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      setLoading(true);
      setMatchResult(null);

      const result = await fetcher<any>("/models");
      console.log("Parsed Models:", result);
      setModelsConfig(result);

      setModel(result.recommended_model);
      setMetric(result.recommended_distance_metric as DistanceMetric);
      setModelDescription(
        result.models[result.recommended_model]?.description ?? ""
      );
    } catch (err) {
      console.error("Error fetching models:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!imageOne || !imageTwo) {
      alert("Please upload both images.");
      return;
    }

    const numericThreshold = parseFloat(threshold);
    if (isNaN(numericThreshold)) {
      alert("Please enter a valid numeric threshold.");
      return;
    }

    try {
      setLoading(true);
      setMatchResult(null);

      const formData = new FormData();
      formData.append("image1", imageOne, imageOne.name);
      formData.append("image2", imageTwo, imageTwo.name);
      formData.append("model", model);
      formData.append("distance_metric", metric);
      formData.append("threshold", threshold);

      const result = await mutate<any>("compare", {
        method: "POST",
        body: formData,
      });

      if (result.success) {
        setMatchResult(result);
      } else {
        alert("Face match failed. Please upload valid images.");
      }
    } catch (err) {
      console.error("Error during comparison:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleModelChange = (value: string) => {
    setModel(value);

    // Use current selected metric
    const thresholdValue = getThresholdForModel(modelsConfig, value, metric);

    if (thresholdValue !== null) {
      setThreshold(thresholdValue.toString());
    }

    setModelDescription(modelsConfig.models[value]?.description ?? "");
  };

  const handleMetricsChange = (value: DistanceMetric) => {
    setMetric(value as DistanceMetric);

    // Use current selected metric
    const thresholdValue = getThresholdForModel(modelsConfig, model, value);

    if (thresholdValue !== null) {
      setThreshold(thresholdValue.toString());
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white border border-gray-200 shadow-md rounded-3xl p-8 w-full max-w-xl">
        <h1 className="text-3xl font-semibold text-center text-gray-800 mb-6">
          Face Match Validator
        </h1>

        <div className="grid gap-4 mb-6">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Face Recognition Model
            </label>
            <select
              value={model}
              onChange={(e) => {
                handleModelChange(e.target.value);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              {MODELS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">{modelDescription}</p>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Distance Metric
            </label>
            <select
              value={metric}
              onChange={(e) => {
                handleMetricsChange(e.target.value as DistanceMetric);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              {METRICS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {distanceMetricDescriptions[metric]}
            </p>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Threshold
            </label>
            <input
              type="number"
              min={0}
              max={1}
              step={0.01}
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Maximum distance allowed between faces to consider them a match.
              Lower values mean stricter matching.
            </p>
          </div>
        </div>

        <ImageUploaderInput inputs={IMAGES_INPUT} />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="mt-6 w-full inline-flex justify-center items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-xl transition disabled:opacity-60"
        >
          {loading ? "Processing..." : "Verify Images"}
        </button>

        <ResultsModal
          matchResult={matchResult}
          imageOne={imageOne}
          imageTwo={imageTwo}
          onClose={() => setMatchResult(null)}
        />
      </div>
    </div>
  );
}
