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
  }
}
