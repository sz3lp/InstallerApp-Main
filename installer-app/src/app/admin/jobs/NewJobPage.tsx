import React, { useState } from "react";
import { SZInput } from "../../../components/ui/SZInput";
import { SZButton } from "../../../components/ui/SZButton";
import { useJobs } from "../../../lib/hooks/useJobs";

const NewJobPage: React.FC = () => {
  const { createJob } = useJobs();
  const [clinic, setClinic] = useState("");
  const [contact, setContact] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    try {
      await createJob({
        clinic_name: clinic,
        contact_name: contact,
        contact_phone: phone,
      });
      setClinic("");
      setContact("");
      setPhone("");
      alert("Job created");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">New Job</h1>
      <SZInput
        id="clinic"
        label="Clinic Name"
        value={clinic}
        onChange={setClinic}
      />
      <SZInput
        id="contact"
        label="Contact Name"
        value={contact}
        onChange={setContact}
      />
      <SZInput
        id="phone"
        label="Contact Phone"
        value={phone}
        onChange={setPhone}
      />
      <SZButton onClick={handleCreate} isLoading={loading}>
        Create
      </SZButton>
    </div>
  );
};

export default NewJobPage;
