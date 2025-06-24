/// <reference types="cypress" />

describe('Payment Edge Case Regression Tests', () => {
  const loginAdmin = () => {
    cy.visit('/login');
    cy.get('[data-cy="email-input"]').type('admin@example.com');
    cy.get('[data-cy="password-input"]').type('adminpassword');
    cy.get('[data-cy="login-button"]').click();
    cy.url().should('not.include', '/login');
  };

  let testInvoiceId;
  let zeroAmountInvoiceId;
  let overpayInvoiceId;

  before(() => {
    cy.exec('npm run create-test-invoice -- --amount 500 --status unpaid').then((result) => {
      testInvoiceId = result.stdout.trim();
      cy.log(`Test Invoice (500) ID: ${testInvoiceId}`);
    });
    cy.exec('npm run create-test-invoice -- --amount 0 --status unpaid').then((result) => {
      zeroAmountInvoiceId = result.stdout.trim();
      cy.log(`Zero Amount Invoice ID: ${zeroAmountInvoiceId}`);
    });
    cy.exec('npm run create-test-invoice -- --amount 100 --status unpaid').then((result) => {
      overpayInvoiceId = result.stdout.trim();
      cy.log(`Overpay Invoice (100) ID: ${overpayInvoiceId}`);
    });
  });

  beforeEach(() => {
    loginAdmin();
  });

  it('should prevent manual payment submission with missing required fields', () => {
    cy.visit(`/invoices/${testInvoiceId}`);
    cy.contains('Manual Payment Entry').should('be.visible');

    cy.get('#amount').type('100');
    cy.get('button[type="submit"]').contains('Log Payment').click();
    cy.contains('Please fill in all required fields: Amount, Method, Date.').should('be.visible');

    cy.get('#amount').clear();
    cy.get('#method').select('Cash');
    cy.get('button[type="submit"]').contains('Log Payment').click();
    cy.contains('Please fill in all required fields: Amount, Method, Date.').should('be.visible');

    cy.get('#amount').type('100');
    cy.get('#method').select('Cash');
    cy.get('#paymentDate').type('2025-01-01');
    cy.get('#amount').clear();
    cy.get('button[type="submit"]').contains('Log Payment').click();
    cy.contains('Please fill in all required fields: Amount, Method, Date.').should('be.visible');
  });

  it('should not allow submission of a $0 manual payment', () => {
    cy.visit(`/invoices/${zeroAmountInvoiceId}`);
    cy.contains('Manual Payment Entry').should('be.visible');

    cy.get('#amount').type('0');
    cy.get('#method').select('Cash');
    cy.get('#paymentDate').type('2025-06-23');

    cy.get('button[type="submit"]').contains('Log Payment').click();
    cy.contains('Please fill in all required fields: Amount, Method, Date.').should('be.visible');
    cy.contains('Failed to log payment').should('not.exist');
  });

  it('should correctly handle overpayment via manual entry', () => {
    cy.visit(`/invoices/${overpayInvoiceId}`);
    cy.contains('Balance Due: $100.00').should('be.visible');

    const overpaymentAmount = '200.00';
    cy.get('#amount').type(overpaymentAmount);
    cy.get('#method').select('Bank Transfer');
    cy.get('#paymentDate').type('2025-06-23');
    cy.get('button[type="submit"]').contains('Log Payment').click();

    cy.contains('Payment logged successfully!').should('be.visible');
    cy.reload();

    cy.contains('Balance Due: -$100.00').should('be.visible');
    cy.contains('Amount Paid: $200.00').should('be.visible');
    cy.contains('Payment History').should('be.visible');
    cy.contains('td', `$${parseFloat(overpaymentAmount).toFixed(2)}`).should('be.visible');
  });

  it('should ensure "Pay Now" button is not clickable if invoice is already paid', () => {
    cy.exec(`npm run set-invoice-status -- --invoiceId ${testInvoiceId} --status paid`).then(() => {
      cy.visit(`/invoices/${testInvoiceId}`);
      cy.contains('Status: paid').should('be.visible');
      cy.contains('Pay Now').should('not.exist');
    });
  });

  it('should display a manually created invoice correctly', () => {
    // Implementation placeholder for manual invoice creation test
  });
});
