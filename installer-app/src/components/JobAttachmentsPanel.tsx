import React, { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";

interface Attachment {
  name: string;
  url: string;
}

interface JobAttachmentsPanelProps {
  jobId: string;
}

export default function JobAttachmentsPanel({ jobId }: JobAttachmentsPanelProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  useEffect(() => {
    const fetchAttachments = async () => {
      const { data, error } = await supabase.storage
        .from("documents")
        .list(jobId, { limit: 100 });

      if (error) {
        console.error(error);
        return;
      }

      const urls = await Promise.all(
        (data ?? []).map(async (file) => {
          const { data: signed } = await supabase.storage
            .from("documents")
            .createSignedUrl(`${jobId}/${file.name}`, 3600);
          return { name: file.name, url: signed?.signedUrl || "#" };
        })
      );

      setAttachments(urls);
    };

    fetchAttachments();
  }, [jobId]);

  if (!attachments.length) return <p className="text-sm italic">No documents uploaded.</p>;

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold">Job Attachments</h2>
      <ul className="space-y-1">
        {attachments.map((file) => (
          <li key={file.name}>
            <a
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline text-sm"
            >
              {file.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
