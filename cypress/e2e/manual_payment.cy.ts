/// <reference types="cypress" />

describe('Manual Payment Entry and History Visibility', () => {
  const loginAdmin = () => {
    cy.visit('/login');
    cy.get('[data-cy="email-input"]').type('admin@example.com');
    cy.get('[data-cy="password-input"]').type('adminpassword');
    cy.get('[data-cy="login-button"]').click();
    cy.url().should('not.include', '/login');
  };

  let testInvoiceId;

  before(() => {
    cy.exec('npm run create-test-invoice').then((result) => {
      testInvoiceId = result.stdout.trim();
      cy.log(`Created test invoice ID: ${testInvoiceId}`);
    });
  });

  beforeEach(() => {
    loginAdmin();
    cy.visit(`/invoices/${testInvoiceId}`);
    cy.contains('Manual Payment Entry').should('be.visible');
  });

  it('should allow admin to log a manual payment and see it in history', () => {
    const paymentAmount = '150.00';
    const paymentMethod = 'Cash';
    const referenceNumber = 'CASH-001';
    const paymentDate = '2025-06-23';

    cy.get('#amount').clear().type(paymentAmount);
    cy.get('#method').select(paymentMethod);
    cy.get('#referenceNumber').clear().type(referenceNumber);
    cy.get('#paymentDate').clear().type(paymentDate);

    cy.get('button[type="submit"]').contains('Log Payment').click();
    cy.contains('Payment logged successfully!').should('be.visible');

    cy.contains('Payment History').should('be.visible');
    cy.get('table').within(() => {
      cy.contains('td', `$${parseFloat(paymentAmount).toFixed(2)}`)
        .parent('tr')
        .within(() => {
          cy.contains('td', new Date(paymentDate).toLocaleDateString()).should('be.visible');
          cy.contains('td', paymentMethod).should('be.visible');
          cy.contains('td', referenceNumber).should('be.visible');
        });
    });

    cy.reload();
    cy.contains(`Amount Paid: $${parseFloat(paymentAmount).toFixed(2)}`).should('be.visible');
  });

  it('should show "No payments found" if no payments exist', () => {
    cy.contains('No payments found for this invoice.').should('be.visible');
    cy.get('table').should('not.exist');
  });
});
