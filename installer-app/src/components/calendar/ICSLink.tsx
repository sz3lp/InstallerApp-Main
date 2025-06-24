import React, { useEffect, useState } from "react";
import { SZButton } from "../ui/SZButton";

interface ICSLinkProps {
  installerId: string;
  label?: string;
}

function bufferToHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function createToken(installerId: string, secret: string) {
  const exp = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(`${installerId}-${exp}`)
  );
  const sigHex = bufferToHex(signature);
  return `${exp}-${sigHex}`;
}

export default function ICSLink({ installerId, label = "Download ICS" }: ICSLinkProps) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const secret = (process.env as any).VITE_CALENDAR_TOKEN_SECRET;
    if (!secret || !installerId) return;
    createToken(installerId, secret).then((token) => {
      setUrl(`/api/calendar/${installerId}?token=${token}`);
    });
  }, [installerId]);

  const handleClick = () => {
    if (!url) return;
    const link = document.createElement("a");
    link.href = url;
    link.download = "schedule.ics";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <SZButton onClick={handleClick} disabled={!url}>
      {label}
    </SZButton>
  );
}
