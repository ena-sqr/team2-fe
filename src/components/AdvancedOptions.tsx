import { DistanceMetric } from "../utils/threshold";
import { distanceMetricDescriptions } from "../utils/metrics";

interface Props {
  metric: DistanceMetric;
  threshold: string;
  detectorBackend: string;
  detectorBackendFromAPI: string[];
  apiUrl: string;
  onMetricChange: (value: DistanceMetric) => void;
  onThresholdChange: (value: string) => void;
  onDetectorBackendChange: (value: string) => void;
  onChangeApiUrl: (value: string) => void;
}

const METRICS = ["cosine", "euclidean", "euclidean_l2"];

export default function AdvancedOptions({
  metric,
  threshold,
  apiUrl,
  detectorBackend,
  detectorBackendFromAPI,
  onMetricChange,
  onThresholdChange,
  onDetectorBackendChange,
  onChangeApiUrl
}: Props) {
  return (
    <div className="grid gap-4">
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">
          Distance Metric
        </label>
        <select
          value={metric}
          onChange={(e) => onMetricChange(e.target.value as DistanceMetric)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
        >
          {METRICS.map((m) => (
            <option key={m} value={m}>{m}</option>
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
          onChange={(e) => onThresholdChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
        />
        <p className="mt-1 text-xs text-gray-500">
          Maximum distance allowed between faces to consider them a match.
          Lower values mean stricter matching.
        </p>
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">
          Detector Backend 
        </label>
        <select
          value={detectorBackend || ''}
          onChange={(e) => onDetectorBackendChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option key='' value=''></option>
          {detectorBackendFromAPI.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">
          In DeepFace, this refers to the face detection algorithm that the library uses to locate faces within an image.
        </p>
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">
          (Dev Mode) API URL:
        </label>
        <input
          type="text"
          value={apiUrl}
          onChange={(e) => onChangeApiUrl(e.target.value)}
          placeholder="https://your-api-url.com"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
      </div>
    </div>
  );
}
