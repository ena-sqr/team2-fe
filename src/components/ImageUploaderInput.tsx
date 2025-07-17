import React from "react";
import { ArrowUpTrayIcon, XMarkIcon } from "@heroicons/react/24/solid";

interface ImageInput {
  label: string;
  file: File | null;
  setFile: (file: File | null) => void;
}

interface Props {
  inputs: ImageInput[];
}

const ImageUploaderInput: React.FC<Props> = ({ inputs }) => {
  const filesUploaded = inputs.length;

  const gridCols =
    filesUploaded === 1 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2";

  return (
    <div className={`grid ${gridCols} gap-6`}>
      {inputs.map((input, idx) => (
        <div key={idx}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload {input.label}
          </label>
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-green-600 rounded-xl w-full px-4 py-6 bg-green-50 hover:bg-green-100 cursor-pointer transition">
            <ArrowUpTrayIcon className="w-6 h-6 mb-2 text-green-800" />
            <span className="text-sm font-medium text-green-700">
              Click to upload
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => input.setFile(e.target.files?.[0] ?? null)}
              className="hidden"
            />
          </label>

          {input.file && (
            <div className="mt-3 relative rounded-xl overflow-hidden shadow group bg-white">
              <img
                src={URL.createObjectURL(input.file)}
                alt={`${input.label} Preview`}
                className="w-full h-auto max-h-96 object-contain rounded-xl"
              />
              <button
                onClick={() => input.setFile(null)}
                className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-white/80 hover:bg-white rounded-full shadow text-gray-600 hover:text-red-600 transition-opacity opacity-0 group-hover:opacity-100"
                aria-label={`Remove ${input.label}`}
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ImageUploaderInput;
