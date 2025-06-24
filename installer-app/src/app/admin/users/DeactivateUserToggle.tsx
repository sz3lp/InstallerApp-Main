import React, { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

interface Props {
  userId: string;
}

const DeactivateUserToggle: React.FC<Props> = ({ userId }) => {
  const [disabled, setDisabled] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("disabled")
        .eq("user_id", userId)
        .maybeSingle();
      if (error) {
        setError(error.message);
      } else {
        setDisabled(data?.disabled ?? false);
      }
      setLoading(false);
    };
    fetchStatus();
  }, [userId]);

  const toggle = async () => {
    const newValue = !disabled;
    setDisabled(newValue);
    await supabase.rpc("set_user_disabled", {
      p_user_id: userId,
      p_disabled: newValue,
    });
  };

  if (loading) return <span>...</span>;
  if (error) return <span className="text-red-600">{error}</span>;

  return (
    <label className="inline-flex items-center gap-2 cursor-pointer">
      <input type="checkbox" checked={!disabled} onChange={toggle} />
      <span>{disabled ? "Disabled" : "Active"}</span>
    </label>
  );
};

export default DeactivateUserToggle;
