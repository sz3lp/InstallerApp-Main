/// <reference types="cypress" />

describe('End-to-End ERP Transactional Flow (Quote -> Invoice -> Payment)', () => {
  // Helper function for logging in
  const login = (role) => {
    cy.visit('/login'); // Assuming a login page
    if (role === 'sales') {
      cy.get('[data-cy="email-input"]').type('sales@example.com');
      cy.get('[data-cy="password-input"]').type('salespassword');
    } else if (role === 'admin') {
      cy.get('[data-cy="email-input"]').type('admin@example.com');
      cy.get('[data-cy="password-input"]').type('adminpassword');
    } else if (role === 'client') {
      // For client, we might need a specific client login or direct link to their invoice
      // For E2E, we'll assume a direct invoice link for now or a generic client login
      cy.get('[data-cy="email-input"]').type('client@example.com');
      cy.get('[data-cy="password-input"]').type('clientpassword');
    }
    cy.get('[data-cy="login-button"]').click();
    cy.url().should('not.include', '/login');
  };

  it('should successfully complete the Quote -> Invoice -> Payment flow', () => {
    let quoteId;
    let invoiceId;

    // 1. Log in as Sales, create and submit a quote
    login('sales');
    cy.visit('/quotes/new'); // Assuming a new quote creation page
    cy.get('[data-cy="quote-client-name"]').type('Test Client E2E');
    cy.get('[data-cy="quote-item-description-0"]').type('E2E Service 1');
    cy.get('[data-cy="quote-item-price-0"]').type('500');
    cy.get('[data-cy="add-item-button"]').click();
    cy.get('[data-cy="quote-item-description-1"]').type('E2E Product 2');
    cy.get('[data-cy="quote-item-price-1"]').type('250');
    cy.get('[data-cy="create-quote-button"]').click();
    cy.url().should('include', '/quotes/');
    cy.url().then(url => {
      quoteId = url.split('/').pop(); // Extract quote ID from URL
      cy.log(`Created Quote ID: ${quoteId}`);
    });
    cy.get('[data-cy="submit-quote-button"]').click();
    cy.contains('Quote submitted for approval').should('be.visible');
    cy.contains('Status: Pending Approval').should('be.visible');
    cy.wait(1000); // Wait for potential UI updates

    // 2. Log in as Admin, approve the quote and generate invoice
    cy.clearCookies(); // Clear sales session
    login('admin');
    cy.visit(`/quotes/${quoteId}`);
    cy.contains('Status: Pending Approval').should('be.visible');
    cy.get('[data-cy="approve-quote-button"]').click();
    cy.contains('Quote approved successfully').should('be.visible');
    cy.contains('Status: Approved').should('be.visible');
    cy.wait(1000); // Wait for job creation if async

    cy.get('[data-cy="generate-invoice-button"]').click();
    cy.contains('Invoice generated successfully').should('be.visible');
    cy.url().should('include', '/invoices/');
    cy.url().then(url => {
      invoiceId = url.split('/').pop(); // Extract invoice ID from URL
      cy.log(`Generated Invoice ID: ${invoiceId}`);
    });

    // Confirm line items & totals appear
    cy.contains('E2E Service 1').should('be.visible');
    cy.contains('$500.00').should('be.visible');
    cy.contains('E2E Product 2').should('be.visible');
    cy.contains('$250.00').should('be.visible');
    cy.contains('Total: $750.00').should('be.visible');
    cy.contains('Balance Due: $750.00').should('be.visible');
    cy.contains('Status: unpaid').should('be.visible'); // Initial status

    // 3. Log in as Client, pay via “Pay Now” button
    cy.clearCookies(); // Clear admin session
    cy.visit(`/invoices/${invoiceId}`);
    cy.contains('Pay Now').should('be.visible');

    cy.window().then((win) => {
      cy.stub(win, 'fetch').callsFake((url, options) => {
        if (url.includes('initiate_stripe_payment') && options.method === 'POST') {
          return Promise.resolve({
            json: () => Promise.resolve({ stripeSessionUrl: 'https://mock-stripe.com/checkout/session_id_mock' })
          });
        }
        return win.fetch.wrappedMethod(url, options);
      }).as('fetchStub');
      cy.stub(win.location, 'href').as('locationHrefStub');
    });

    cy.get('[data-cy="pay-now-button"]').click();
    cy.get('@fetchStub').should('have.been.calledOnce');
    cy.get('@locationHrefStub').should('have.been.calledWith', 'https://mock-stripe.com/checkout/session_id_mock');

    cy.wait(2000);
    cy.reload();

    // 4. Reload invoice and confirm status and payment history
    cy.contains('Status: paid').should('be.visible', { timeout: 10000 });
    cy.contains('Amount Paid: $750.00').should('be.visible');
    cy.contains('Balance Due: $0.00').should('be.visible');
    cy.contains('Payment History').should('be.visible');
    cy.contains('$750.00').should('be.visible');
    cy.contains('Stripe').should('be.visible');
  });
});
