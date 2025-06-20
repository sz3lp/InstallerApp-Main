import React from "react";
import { FaFilePdf } from "react-icons/fa";
import ModalWrapper from "../components/ModalWrapper";

const DocumentViewerModal = ({ isOpen, onClose, documents = [] }) => {
  if (!isOpen) return null;

  const getUrl = (doc) => {
    if (doc.url) return doc.url;
    if (doc.path) {
      const base = process.env.VITE_SUPABASE_URL || "";
      return `${base}/storage/v1/object/public/documents/${doc.path}`;
    }
    return "#";
  };

  const openDoc = (doc) => {
    const url = getUrl(doc);
    window.open(url, "_blank");
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose}>
      <h2 className="text-lg font-semibold mb-4">Uploaded Documents</h2>
      <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
        {documents.map((doc) => {
          const url = getUrl(doc);
          return (
            <div
              key={doc.id}
              className="bg-gray-50 rounded shadow p-3 flex items-center justify-between"
            >
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
              <button
                onClick={() => openDoc(doc)}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:opacity-90 active:scale-95"
              >
                {doc.type === "pdf" ? "Open PDF" : "View"}
              </button>
            </div>
          );
        })}
      </div>
    </ModalWrapper>
  );
};

export default DocumentViewerModal;
