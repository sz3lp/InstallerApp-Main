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
  const { data, error } = await supabase.rpc("convert_lead_to_client_and_job", {
    lead_id: leadId,
  });
  if (error) throw error;
  return data as string | null;
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
