import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SZInput } from "../../components/ui/SZInput";
import { SZButton } from "../../components/ui/SZButton";
import supabase from "../../lib/supabaseClient";

const LeadForm: React.FC = () => {
  const navigate = useNavigate();
  const [lead, setLead] = useState({
    name: "",
    email: "",
    phone: "",
    source: "",
  });
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
  }>({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (key: string, value: string) => {
    setLead((l) => ({ ...l, [key]: value }));
  };

  const validate = () => {
    const errs: { name?: string; email?: string; phone?: string } = {};
    if (!lead.name.trim()) errs.name = "Required";
    if (!lead.email.trim()) errs.email = "Required";
    if (!lead.phone.trim()) errs.phone = "Required";
    return errs;
  };

  const handleSubmit = async () => {
    const v = validate();
    if (Object.keys(v).length) {
      setErrors(v);
      return;
    }
    setErrors({});
    setSubmitting(true);
    await supabase.from("leads").insert({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      source: lead.source || null,
      status: "new",
    });
    setSubmitting(false);
    navigate("/crm/leads");
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-3">
      <h1 className="text-2xl font-bold">New Lead</h1>
      <SZInput
        id="name"
        label="Name"
        value={lead.name}
        onChange={(v) => handleChange("name", v)}
        error={errors.name}
      />
      <SZInput
        id="email"
        label="Email"
        value={lead.email}
        onChange={(v) => handleChange("email", v)}
        error={errors.email}
      />
      <SZInput
        id="phone"
        label="Phone"
        value={lead.phone}
        onChange={(v) => handleChange("phone", v)}
        error={errors.phone}
      />
      <SZInput
        id="source"
        label="Source"
        value={lead.source}
        onChange={(v) => handleChange("source", v)}
      />
      <SZButton onClick={handleSubmit} isLoading={submitting} fullWidth>
        Save Lead
      </SZButton>
    </div>
  );
};

export default LeadForm;
