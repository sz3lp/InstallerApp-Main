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

  const { data: client } = await supabase
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

  await supabase.from("jobs").insert({
    clinic_name: lead.clinic_name,
    contact_name: lead.contact_name,
    contact_phone: lead.contact_phone,
    status: "created",
    client_id: client?.id ?? null,
    origin_lead_id: leadId,
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
    await convertLeadToClientAndJob(leadId);
  }
}
