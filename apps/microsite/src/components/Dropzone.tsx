import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";

export interface DropzoneProps {
  uploadedFiles: File[];
  setUploadedFiles: (files: File[]) => void;
}

const acceptedFileTypes = {
  'image/*': ['.jpg', '.jpeg', '.png', '.heic', '.heif']
};

const Dropzone: React.FC<DropzoneProps> = ({ uploadedFiles, setUploadedFiles }) => {
  const onDrop = useCallback(
    (accepted: File[]) => {
      const remaining = 5 - uploadedFiles.length;
      if (remaining <= 0) return;
      const validFiles = accepted.slice(0, remaining);
      setUploadedFiles([...uploadedFiles, ...validFiles]);
    },
    [uploadedFiles, setUploadedFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes,
    multiple: true,
    maxFiles: 5,
  });

  const removeFile = (index: number) => {
    const updated = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(updated);
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className="flex flex-col items-center justify-center border-2 border-dashed border-gray-400 rounded-md p-6 bg-white hover:border-primary transition cursor-pointer"
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the files here ...</p>
        ) : (
          <p>Drag 'n' drop some photos here, or click to select (up to 5)</p>
        )}
      </div>

      {uploadedFiles.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {uploadedFiles.map((file, idx) => {
            const url = URL.createObjectURL(file);
            return (
              <div key={idx} className="relative group">
                <img
                  src={url}
                  alt={file.name}
                  className="w-full h-24 object-cover rounded"
                />
                <button
                  type="button"
                  onClick={() => removeFile(idx)}
                  className="absolute top-1 right-1 bg-white bg-opacity-70 rounded-full p-1 text-red-600 hover:bg-opacity-100"
                >
                  &times;
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dropzone;
