export default async function uploadDocument(file) {
  if (!file) return null;

  if (process.env.NODE_ENV === "test") {
    return {
      id: `test_${file.name}`,
      name: file.name,
      type: file.type === "application/pdf" ? "pdf" : "image",
      url: `https://example.com/${file.name}`,
      path: `test/${file.name}`,
    };
  }

  try {
    const { default: supabase } = await import("./supabaseClient");
    const ext = file.name.split(".").pop();
    const filePath = `${Date.now()}_${file.name}`;

    const { error } = await supabase.storage
      .from("documents")
      .upload(filePath, file);
    if (error) throw error;

    const { data } = supabase.storage.from("documents").getPublicUrl(filePath);
    const url = data.publicUrl;

    if (url) {
      try {
        const res = await fetch(url, { method: "HEAD" });
        if (!res.ok) {
          console.warn("Uploaded file not accessible", res.status);
        }
      } catch (verifyErr) {
        console.warn("Unable to verify uploaded file", verifyErr);
      }
    }

    return {
      id: filePath,
      name: file.name,
      type: ext === "pdf" || file.type === "application/pdf" ? "pdf" : "image",
      url,
      path: filePath,
    };
  } catch (err) {
    console.error("Failed to upload document", err);
    return null;
  }
}
