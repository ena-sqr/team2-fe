import { useEffect, useState, useCallback } from "react";
import ResultsModal from "./components/ResultsModal";
import ImageUploaderInput from "./components/ImageUploaderInput";
import AdvancedOptions from "./components/AdvancedOptions";
import { Cog6ToothIcon } from "@heroicons/react/24/solid";
import {
  getThresholdForModel,
  ModelsConfig,
  DistanceMetric,
} from "./utils/threshold";
import { fetcher } from "./api/fetcher";
import { mutate } from "./api/mutator";
import logo from "./paraforesightLogo.png";
import { useLocalStorage } from "./hooks";
import {
  API_URL,
  DEFAULT_DETECTOR,
  DEFAULT_METRIC,
  DEFAULT_MODEL,
  DEFAULT_THRESHOLD,
  MODELS,
  TABS,
} from "./const/config";
import { LivenessResult } from "./types/liveness-result";
import { AnalyzeFace } from "./types/analyze-face";

export default function App() {
  const [tab, setTab] = useState<"match" | "liveness" | "analyze">("match");

  const [imageOne, setImageOne] = useState<File | null>(null);
  const [imageTwo, setImageTwo] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState(DEFAULT_MODEL);
  const [metric, setMetric] = useState(DEFAULT_METRIC as DistanceMetric);
  const [threshold, setThreshold] = useState(DEFAULT_THRESHOLD);
  const [modelDescription, setModelDescription] = useState("");
  const [modelsConfig, setModelsConfig] = useState({} as ModelsConfig);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [detectorBackend, setDetectorBackend] = useState(DEFAULT_DETECTOR);
  const [detectorBackendFromAPI, setDetectorBackendFromAPI] = useState([]);
  const [apiUrl, setApiUrl] = useLocalStorage<string>("apiUrl", API_URL);
  const [liveness, setLiveness] = useState<LivenessResult | null>(null);
  const [analyze, setAnalyze] = useState<AnalyzeFace | null>(null);

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

  const SINGLE_IMAGE_INPUT = [
    { label: "Image", file: imageOne, setFile: setImageOne },
  ];

  const fetchModels = useCallback(async () => {
    try {
      setLoading(true);
      setMatchResult(null);

      const result = await fetcher<any>(`${apiUrl}/models`);
      setModelsConfig(result);

      setModel(result.recommended_model);
      setMetric(result.recommended_distance_metric as DistanceMetric);
      setModelDescription(
        result.models[result.recommended_model]?.description ?? ""
      );
      setDetectorBackendFromAPI(result.backends);
      try {
        setThreshold(
          result.models[result.recommended_model][
            result.recommended_distance_metric
          ] ?? ""
        );
      } catch (e) {
        setThreshold(DEFAULT_THRESHOLD);
      }
    } catch (err) {
      console.error("Error fetching models:", err);
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  useEffect(() => {
    setImageOne(null);
    setImageTwo(null);
    setMatchResult(null);
    setAnalyze(null);
    setLiveness(null);
  }, [tab]);

  useEffect(() => {
    setAnalyze(null);
    setLiveness(null);
  }, [imageOne]);

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
      formData.append("detector_backend", detectorBackend);

      const result = await mutate<any>(`${apiUrl}/compare`, {
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

  const handleLivenessCheck = async () => {
    if (!imageOne) {
      alert("Please upload an image.");
      return;
    }

    const formData = new FormData();
    formData.append("image", imageOne, imageOne.name);
    formData.append("detector_backend", detectorBackend);

    setLoading(true);
    try {
      const result = await mutate<any>(`${apiUrl}/liveness-check`, {
        method: "POST",
        body: formData,
      });
      setLiveness(result);
      setLoading(false);
    } catch (e) {
      console.error("Liveness error:", e);
    }
  };

  const handleAnalyzeCheck = async () => {
    if (!imageOne) {
      alert("Please upload an image.");
      return;
    }

    const formData = new FormData();
    formData.append("image", imageOne, imageOne.name);

    setLoading(true);
    try {
      const result = await mutate<any>(`${apiUrl}/analyze`, {
        method: "POST",
        body: formData,
      });
      setAnalyze(result.faces?.[0] ?? null);
      setLoading(false);
    } catch (e) {
      console.error("Analyze error:", e);
      setLoading(false);
    }
  };

  const renderLiveness = (result: LivenessResult | null) =>
    result ? (
      <div className="text-sm mt-1 text-center">
        <p>
          <span
            className={`font-semibold ${
              result.is_live ? "text-green-600" : "text-red-600"
            }`}
          >
            {result.is_live ? "Live" : "Spoofed"} (
            {(result.confidence * 100).toFixed(2)}%)
          </span>
        </p>
        <p className="text-xs text-gray-500">{result.message}</p>
      </div>
    ) : (
      <p className="text-sm text-gray-400">Checking liveness...</p>
    );

  const renderAnalyze = (face: AnalyzeFace | null) =>
    face ? (
      <div className="text-sm mt-2 text-center">
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
        <div className="text-sm mt-2 space-y-4 flex flex-col items-center">
          {/* Combined Probabilities Table */}
          <div className="overflow-x-auto">
            <table className="table-fixed text-sm border mt-1 text-center w-full max-w-2xl">
              <thead>
                <tr>
                  <th colSpan={3} className="text-center font-medium py-2">
                    Probabilities
                  </th>
                </tr>
                <tr>
                  <th className="px-4 py-2 border font-medium capitalize w-1/3">
                    Emotion
                  </th>
                  <th className="px-4 py-2 border font-medium capitalize w-1/3">
                    Gender
                  </th>
                  <th className="px-4 py-2 border font-medium capitalize w-1/3">
                    Race
                  </th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const emotionKeys = Object.keys(face.emotion.probabilities);
                  const genderKeys = Object.keys(face.gender.probabilities);
                  const raceKeys = Object.keys(face.race.probabilities);
                  const maxLen = Math.max(
                    emotionKeys.length,
                    genderKeys.length,
                    raceKeys.length
                  );

                  const getValue = (
                    obj: Record<string, number>,
                    key: string | undefined
                  ) =>
                    key && obj[key] !== undefined
                      ? `${obj[key].toFixed(2)}%`
                      : "-";

                  return Array.from({ length: maxLen }).map((_, i) => {
                    const emotionKey = emotionKeys[i];
                    const genderKey = genderKeys[i];
                    const raceKey = raceKeys[i];

                    return (
                      <tr key={i}>
                        <td className="px-4 py-2 border capitalize italic text-center w-1/3">
                          {emotionKey
                            ? `${emotionKey}: ${getValue(
                                face.emotion.probabilities,
                                emotionKey
                              )}`
                            : "-"}
                        </td>
                        <td className="px-4 py-2 border capitalize italic text-center w-1/3">
                          {genderKey
                            ? `${genderKey}: ${getValue(
                                face.gender.probabilities,
                                genderKey
                              )}`
                            : "-"}
                        </td>
                        <td className="px-4 py-2 border capitalize italic text-center w-1/3">
                          {raceKey
                            ? `${raceKey}: ${getValue(
                                face.race.probabilities,
                                raceKey
                              )}`
                            : "-"}
                        </td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    ) : (
      <p className="text-sm text-gray-400">Analyzing face...</p>
    );

  const handleModelChange = (value: string) => {
    setModel(value);
    const thresholdValue = getThresholdForModel(modelsConfig, value, metric);
    if (thresholdValue !== null) {
      setThreshold(thresholdValue.toString());
    }
    setModelDescription(modelsConfig.models[value]?.description ?? "");
  };

  const handleMetricsChange = (value: DistanceMetric) => {
    setMetric(value);
    const thresholdValue = getThresholdForModel(modelsConfig, model, value);
    if (thresholdValue !== null) {
      setThreshold(thresholdValue.toString());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-ai-pattern p-4">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={logo} alt="App Logo" className="custom-height" />
        </div>

        <div className="bg-gray-50 border border-gray-200 shadow-md rounded-2xl p-8">
          {/* Tabs */}
          <div className="flex justify-center mb-6 space-x-6">
            {TABS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`px-4 py-2 text-sm font-semibold border-b-2 transition ${
                  tab === key
                    ? "border-green-600 text-green-600"
                    : "border-transparent text-gray-500 hover:text-green-600"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === "match" && (
            <>
              <div className="grid gap-4 mb-6">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Face Recognition Model
                  </label>
                  <select
                    value={model}
                    onChange={(e) => handleModelChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {MODELS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    {modelDescription}
                  </p>
                </div>

                <button
                  onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                  className="flex items-center gap-2 text-sm text-green-600 hover:underline"
                >
                  <Cog6ToothIcon className="w-4 h-4" />
                  {showAdvancedOptions
                    ? "Hide Advanced Options"
                    : "Show Advanced Options"}
                </button>

                {showAdvancedOptions && (
                  <AdvancedOptions
                    metric={metric}
                    threshold={threshold}
                    detectorBackend={detectorBackend}
                    apiUrl={apiUrl}
                    detectorBackendFromAPI={detectorBackendFromAPI}
                    onMetricChange={handleMetricsChange}
                    onThresholdChange={setThreshold}
                    onDetectorBackendChange={setDetectorBackend}
                    onChangeApiUrl={setApiUrl}
                  />
                )}
              </div>

              <ImageUploaderInput inputs={IMAGES_INPUT} />

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="mt-6 w-full inline-flex justify-center items-center gap-2 bg-green-600 hover:bg-green-800 text-white font-semibold py-2 px-4 rounded-xl transition disabled:opacity-60"
              >
                {loading ? "Processing..." : "Verify Images"}
              </button>

              <ResultsModal
                matchResult={matchResult}
                imageOne={imageOne}
                imageTwo={imageTwo}
                onClose={() => setMatchResult(null)}
                apiUrl={apiUrl}
                detectorBackend={detectorBackend}
              />
            </>
          )}

          {tab === "liveness" && (
            <>
              <ImageUploaderInput inputs={SINGLE_IMAGE_INPUT} />
              {!loading && liveness && renderLiveness(liveness)}
              <button
                onClick={handleLivenessCheck}
                disabled={loading}
                className="mt-6 w-full inline-flex justify-center items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-xl transition disabled:opacity-60"
              >
                {loading ? "Processing..." : "Check Liveness"}
              </button>
              {!loading && liveness && (
                <button
                  onClick={() => {
                    setImageOne(null);
                  }}
                  disabled={loading}
                  className="mt-2 w-full inline-flex justify-center items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-xl transition disabled:opacity-60"
                >
                  Clear
                </button>
              )}
            </>
          )}

          {tab === "analyze" && (
            <>
              <ImageUploaderInput inputs={SINGLE_IMAGE_INPUT} />
              {!loading && analyze && renderAnalyze(analyze)}
              <button
                onClick={handleAnalyzeCheck}
                disabled={loading}
                className="mt-6 w-full inline-flex justify-center items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-xl transition disabled:opacity-60"
              >
                {loading ? "Processing..." : "Analyze"}
              </button>
              {!loading && analyze && (
                <button
                  onClick={() => {
                    setImageOne(null);
                  }}
                  disabled={loading}
                  className="mt-2 w-full inline-flex justify-center items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-xl transition disabled:opacity-60"
                >
                  Clear
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
