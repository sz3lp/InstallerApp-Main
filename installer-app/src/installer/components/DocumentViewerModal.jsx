import React from "react";
import { FaFilePdf } from "react-icons/fa";
import ModalWrapper from "../components/ModalWrapper";

const DocumentViewerModal = ({ isOpen, onClose, documents = [] }) => {
  if (!isOpen) return null;

  const getUrl = (doc) => {
    if (doc.url) return doc.url;
    if (doc.path) {
      const base =
        process.env.VITE_SUPABASE_URL ||
        process.env.NEXT_PUBLIC_SUPABASE_URL ||
        "";
      return `${base}/storage/v1/object/public/documents/${doc.path}`;
    }
    return "#";
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose}>
      <h2 className="text-lg font-semibold mb-4">Uploaded Documents</h2>
      <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
        {documents.map((doc) => {
          const url = getUrl(doc);
          return (
            <div key={doc.id} className="bg-gray-50 rounded shadow p-3 space-y-2">
              <div className="flex items-center space-x-3">
                {doc.type === "image" ? (
                  <img
                    src={url}
                    alt={doc.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                ) : (
                  <FaFilePdf className="text-red-600 text-2xl" />
                )}
                <span className="font-medium">{doc.name}</span>
              </div>
              {doc.type === "image" ? (
                <img src={url} alt={doc.name} className="max-h-60 w-full object-contain rounded" />
              ) : (
                <object data={url} type="application/pdf" className="w-full h-60">
                  <p>
                    <a href={url} target="_blank" rel="noreferrer" className="text-green-600 underline">
                      Open PDF
                    </a>
                  </p>
                </object>
              )}
            </div>
          );
        })}
      </div>
    </ModalWrapper>
  );
};

export default DocumentViewerModal;
