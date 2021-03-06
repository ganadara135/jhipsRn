import {
  entityTableSelector,
  entityDetailsButtonSelector,
  entityDetailsBackButtonSelector,
  entityCreateButtonSelector,
  entityCreateSaveButtonSelector,
  entityEditButtonSelector,
  entityDeleteButtonSelector,
  entityConfirmDeleteButtonSelector,
} from '../../support/entity';

describe('Photo e2e test', () => {
  let startingEntitiesCount = 0;

  before(() => {
    cy.window().then(win => {
      win.sessionStorage.clear();
    });

    cy.clearCookies();
    cy.intercept('GET', '/api/photos*').as('entitiesRequest');
    cy.visit('');
    cy.login('admin', 'admin');
    cy.clickOnEntityMenuItem('photo');
    cy.wait('@entitiesRequest').then(({ request, response }) => (startingEntitiesCount = response.body.length));
    cy.visit('/');
  });

  it('should load Photos', () => {
    cy.intercept('GET', '/api/photos*').as('entitiesRequest');
    cy.visit('/');
    cy.clickOnEntityMenuItem('photo');
    cy.wait('@entitiesRequest');
    cy.getEntityHeading('Photo').should('exist');
    if (startingEntitiesCount === 0) {
      cy.get(entityTableSelector).should('not.exist');
    } else {
      cy.get(entityTableSelector).should('have.lengthOf', startingEntitiesCount);
    }
    cy.visit('/');
  });

  it('should load details Photo page', () => {
    cy.intercept('GET', '/api/photos*').as('entitiesRequest');
    cy.visit('/');
    cy.clickOnEntityMenuItem('photo');
    cy.wait('@entitiesRequest');
    if (startingEntitiesCount > 0) {
      cy.get(entityDetailsButtonSelector).first().click({ force: true });
      cy.getEntityDetailsHeading('photo');
      cy.get(entityDetailsBackButtonSelector).should('exist');
    }
    cy.visit('/');
  });

  it('should load create Photo page', () => {
    cy.intercept('GET', '/api/photos*').as('entitiesRequest');
    cy.visit('/');
    cy.clickOnEntityMenuItem('photo');
    cy.wait('@entitiesRequest');
    cy.get(entityCreateButtonSelector).click({ force: true });
    cy.getEntityCreateUpdateHeading('Photo');
    cy.get(entityCreateSaveButtonSelector).should('exist');
    cy.visit('/');
  });

  it('should load edit Photo page', () => {
    cy.intercept('GET', '/api/photos*').as('entitiesRequest');
    cy.visit('/');
    cy.clickOnEntityMenuItem('photo');
    cy.wait('@entitiesRequest');
    if (startingEntitiesCount > 0) {
      cy.get(entityEditButtonSelector).first().click({ force: true });
      cy.getEntityCreateUpdateHeading('Photo');
      cy.get(entityCreateSaveButtonSelector).should('exist');
    }
    cy.visit('/');
  });

  it('should create an instance of Photo', () => {
    cy.intercept('GET', '/api/photos*').as('entitiesRequest');
    cy.visit('/');
    cy.clickOnEntityMenuItem('photo');
    cy.wait('@entitiesRequest').then(({ request, response }) => (startingEntitiesCount = response.body.length));
    cy.get(entityCreateButtonSelector).click({ force: true });
    cy.getEntityCreateUpdateHeading('Photo');

    cy.get(`[data-cy="title"]`)
      .type('throughput Customer Up-sized', { force: true })
      .invoke('val')
      .should('match', new RegExp('throughput Customer Up-sized'));

    cy.get(`[data-cy="description"]`)
      .type('../fake-data/blob/hipster.txt', { force: true })
      .invoke('val')
      .should('match', new RegExp('../fake-data/blob/hipster.txt'));

    cy.setFieldImageAsBytesOfEntity('image', 'integration-test.png', 'image/png');

    cy.get(`[data-cy="taken"]`).type('2021-04-11T07:47').invoke('val').should('equal', '2021-04-11T07:47');

    cy.setFieldSelectToLastOfEntity('album');

    cy.setFieldSelectToLastOfEntity('tag');

    cy.get(entityCreateSaveButtonSelector).click({ force: true });
    cy.scrollTo('top', { ensureScrollable: false });
    cy.get(entityCreateSaveButtonSelector).should('not.exist');
    cy.intercept('GET', '/api/photos*').as('entitiesRequestAfterCreate');
    cy.visit('/');
    cy.clickOnEntityMenuItem('photo');
    cy.wait('@entitiesRequestAfterCreate');
    cy.get(entityTableSelector).should('have.lengthOf', startingEntitiesCount + 1);
    cy.visit('/');
  });

  it('should delete last instance of Photo', () => {
    cy.intercept('GET', '/api/photos*').as('entitiesRequest');
    cy.intercept('GET', '/api/photos/*').as('dialogDeleteRequest');
    cy.intercept('DELETE', '/api/photos/*').as('deleteEntityRequest');
    cy.visit('/');
    cy.clickOnEntityMenuItem('photo');
    cy.wait('@entitiesRequest').then(({ request, response }) => {
      startingEntitiesCount = response.body.length;
      if (startingEntitiesCount > 0) {
        cy.get(entityTableSelector).should('have.lengthOf', startingEntitiesCount);
        cy.get(entityDeleteButtonSelector).last().click({ force: true });
        cy.wait('@dialogDeleteRequest');
        cy.getEntityDeleteDialogHeading('photo').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click({ force: true });
        cy.wait('@deleteEntityRequest');
        cy.intercept('GET', '/api/photos*').as('entitiesRequestAfterDelete');
        cy.visit('/');
        cy.clickOnEntityMenuItem('photo');
        cy.wait('@entitiesRequestAfterDelete');
        cy.get(entityTableSelector).should('have.lengthOf', startingEntitiesCount - 1);
      }
      cy.visit('/');
    });
  });
});
