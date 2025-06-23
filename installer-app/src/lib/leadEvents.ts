export async function createCalendarInvite(leadId: string) {
  try {
    const res = await fetch('/api/calendar/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadId }),
    });
    if (!res.ok) {
      console.error('Failed to create calendar invite', res.status);
    }
  } catch (err) {
    console.error('Calendar invite error', err);
  }
}

export const sendCalendarInvite = createCalendarInvite;

export async function generateProposalDocument(
  leadId: string,
): Promise<Record<string, any> | null> {
  try {
    const { data, error } = await supabase
      .from('documents')
      .insert({ lead_id: leadId, type: 'proposal', name: 'Proposal.pdf' })
      .select()
      .single();
    if (error) throw error;
    return data as Record<string, any>;
  } catch (err) {
    console.error('Failed to generate proposal document', err);
    return null;
  }
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
  switch (status) {
    case 'appointment_scheduled':
      await createCalendarInvite(leadId);
      break;
    case 'proposal_sent':
      await generateProposalDocument(leadId);
      break;
    case 'won':
      await convertLeadToClientAndJob(leadId);
      break;
    default:
      break;
  }
}
