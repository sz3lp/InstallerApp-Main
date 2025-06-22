
export async function sendCalendarInvite(leadId: string) {
  console.log("Send calendar invite for", leadId);
}

export async function generateQuote(leadId: string) {
  console.log("Generate quote for", leadId);
}

export async function prepareInvoice(leadId: string) {
  console.log("Prepare invoice for", leadId);
}

export async function handleLeadEvent(leadId: string, status: string) {
  if (status === 'appointment_scheduled') {
    await sendCalendarInvite(leadId);
  }
  if (status === 'proposal_sent') {
    await generateQuote(leadId);
  }
  if (status === 'won') {
    await prepareInvoice(leadId);

export async function createCalendarInvite(leadId: string) {
  console.log("Create calendar invite for", leadId);
}

export const sendCalendarInvite = createCalendarInvite;

export async function generateProposalDocument(leadId: string) {
  console.log("Generate proposal document for", leadId);
}

export const generateQuote = generateProposalDocument;

import supabase from "./supabaseClient";

export async function convertLeadToClientAndJob(leadId: string) {
  const { data: lead } = await supabase
    .from("leads")
    .select(
      "clinic_name, contact_name, contact_email, contact_phone, address"
    )
    .eq("id", leadId)
    .single();
  if (!lead) return;

  const { data: existing } = await supabase
    .from("clients")
    .select("id")
    .eq("name", lead.clinic_name)
    .single();

  let clientId: string | null = null;

  if (existing) {
    clientId = existing.id;
    await supabase
      .from("clients")
      .update({
        address: lead.address,
        primary_contact: lead.contact_name,
        phone: lead.contact_phone,
        email: lead.contact_email,
      })
      .eq("id", existing.id);
  } else {
    const { data: newClient } = await supabase
      .from("clients")
      .insert({
        name: lead.clinic_name,
        address: lead.address,
        primary_contact: lead.contact_name,
        phone: lead.contact_phone,
        email: lead.contact_email,
      })
      .select()
      .single();
    clientId = newClient?.id ?? null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.from("jobs").insert({
    clinic_name: lead.clinic_name,
    contact_name: lead.contact_name,
    contact_phone: lead.contact_phone,
    address: lead.address,
    status: "created",
    client_id: clientId,
    origin_lead_id: leadId,
    template_type: "SentientZone Installation",
    created_by: user?.id ?? null,
  });
}

export const prepareInvoice = convertLeadToClientAndJob;

export async function handleLeadEvent(leadId: string, status: string) {
  if (status === 'appointment_scheduled') {
    await createCalendarInvite(leadId);
  }
  if (status === 'proposal_sent') {
    await generateProposalDocument(leadId);
  }
  if (status === 'won') {
    // conversion handled manually

  }
}
