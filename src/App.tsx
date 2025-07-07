import { useState } from "react";
import ResultsModal from './components/ResultsModal';
import ImageUploaderInput from './components/ImageUploaderInput';

const models = [
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

const METRICS = ["cosine", "euclidean", "euclidean_l2", "angular"];
const API_URL = 'https://e569-2001-4455-803f-e800-a1cd-a510-6234-45db.ngrok-free.app';
const THRESHOLD = '0.4';

export default function App() {
  const [imageOne, setImageOne] = useState<File | null>(null);
  const [imageTwo, setImageTwo] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState("VGG-Face");
  const [metric, setMetric] = useState("cosine");

  const IMAGES_INPUT = [
    { label: "Image One", file: imageOne, setFile: setImageOne },
    { label: "Image 2", file: imageTwo, setFile: setImageTwo },  
  ];

  const [matchResult, setMatchResult] = useState<{
    verified: boolean;
    similarity_percentage: number;
    distance: number;
    distance_metric: string;
    model: string;
    success: boolean;
    threshold: number;
  } | null>(null);

  const handleSubmit = async () => {
    if (!imageOne || !imageTwo) {
      alert("Please upload both images.");
      return;
    }

    const formData = new FormData();
    formData.append("image1", imageOne, imageOne.name);
    formData.append("image2", imageTwo, imageOne.name);
    formData.append("model", model);
    formData.append("distance_metric", metric);
    formData.append("threshold", THRESHOLD);
    
    //mock results
    // setMatchResult({
    //     "distance": 0.9603962434754376,
    //     "distance_metric": "cosine",
    //     "model": "VGG-Face",
    //     "similarity_percentage": 100,
    //     "success": true,
    //     "threshold": 0.4,
    //     "verified": true
    // });
    
    try {
      setLoading(true);
      setMatchResult(null);

      const formData = new FormData();
      
      formData.append("image1", imageOne, imageOne.name);
      formData.append("image2", imageTwo, imageTwo.name);
      formData.append("model", "VGG-Face");
      formData.append("distance_metric", "cosine");
      formData.append("threshold", "0.4");

      const response = await fetch(`${API_URL}/compare`, {
        method: 'POST',
        body: formData,
      });

      const text = await response.text();
      console.log('Raw response:', text);

      try {
        const result = JSON.parse(text);
        if (result.success) {
          setMatchResult(result);
        } else {
          alert('Face match failed or invalid response');
        }
      } catch (e) {
        console.error('Failed to parse response JSON', text);
        alert('Invalid server response. Check if ngrok server is running.');
      }
    } catch (err) {
      console.log('err', err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
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
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              {models.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Distance Metric
            </label>
            <select
              value={metric}
              onChange={(e) => setMetric(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              {METRICS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Upload Inputs */}
       <ImageUploaderInput inputs={IMAGES_INPUT} />

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="mt-6 w-full inline-flex justify-center items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-xl transition disabled:opacity-60"
        >
          {loading ? "Processing..." : "Verify Images"}
        </button>

        {/* Match Result */}
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
