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

describe('PhotoProcessed e2e test', () => {
  let startingEntitiesCount = 0;

  before(() => {
    cy.window().then(win => {
      win.sessionStorage.clear();
    });

    cy.clearCookies();
    cy.intercept('GET', '/api/photo-processeds*').as('entitiesRequest');
    cy.visit('');
    cy.login('admin', 'admin');
    cy.clickOnEntityMenuItem('photo-processed');
    cy.wait('@entitiesRequest').then(({ request, response }) => (startingEntitiesCount = response.body.length));
    cy.visit('/');
  });

  it('should load PhotoProcesseds', () => {
    cy.intercept('GET', '/api/photo-processeds*').as('entitiesRequest');
    cy.visit('/');
    cy.clickOnEntityMenuItem('photo-processed');
    cy.wait('@entitiesRequest');
    cy.getEntityHeading('PhotoProcessed').should('exist');
    if (startingEntitiesCount === 0) {
      cy.get(entityTableSelector).should('not.exist');
    } else {
      cy.get(entityTableSelector).should('have.lengthOf', startingEntitiesCount);
    }
    cy.visit('/');
  });

  it('should load details PhotoProcessed page', () => {
    cy.intercept('GET', '/api/photo-processeds*').as('entitiesRequest');
    cy.visit('/');
    cy.clickOnEntityMenuItem('photo-processed');
    cy.wait('@entitiesRequest');
    if (startingEntitiesCount > 0) {
      cy.get(entityDetailsButtonSelector).first().click({ force: true });
      cy.getEntityDetailsHeading('photoProcessed');
      cy.get(entityDetailsBackButtonSelector).should('exist');
    }
    cy.visit('/');
  });

  it('should load create PhotoProcessed page', () => {
    cy.intercept('GET', '/api/photo-processeds*').as('entitiesRequest');
    cy.visit('/');
    cy.clickOnEntityMenuItem('photo-processed');
    cy.wait('@entitiesRequest');
    cy.get(entityCreateButtonSelector).click({ force: true });
    cy.getEntityCreateUpdateHeading('PhotoProcessed');
    cy.get(entityCreateSaveButtonSelector).should('exist');
    cy.visit('/');
  });

  it('should load edit PhotoProcessed page', () => {
    cy.intercept('GET', '/api/photo-processeds*').as('entitiesRequest');
    cy.visit('/');
    cy.clickOnEntityMenuItem('photo-processed');
    cy.wait('@entitiesRequest');
    if (startingEntitiesCount > 0) {
      cy.get(entityEditButtonSelector).first().click({ force: true });
      cy.getEntityCreateUpdateHeading('PhotoProcessed');
      cy.get(entityCreateSaveButtonSelector).should('exist');
    }
    cy.visit('/');
  });

  /* this test is commented because it contains required relationships
  it('should create an instance of PhotoProcessed', () => {
    cy.intercept('GET', '/api/photo-processeds*').as('entitiesRequest');
    cy.visit('/');
    cy.clickOnEntityMenuItem('photo-processed');
    cy.wait('@entitiesRequest')
      .then(({ request, response }) => startingEntitiesCount = response.body.length);
    cy.get(entityCreateButtonSelector).click({force: true});
    cy.getEntityCreateUpdateHeading('PhotoProcessed');

    cy.get(`[data-cy="title"]`).type('SQL Generic 동', { force: true }).invoke('val').should('match', new RegExp('SQL Generic 동'));


    cy.get(`[data-cy="description"]`).type('../fake-data/blob/hipster.txt', { force: true }).invoke('val').should('match', new RegExp('../fake-data/blob/hipster.txt'));


    cy.get(`[data-cy="created"]`).type('2021-04-27T14:58').invoke('val').should('equal', '2021-04-27T14:58');

    cy.setFieldSelectToLastOfEntity('photo');

    cy.get(entityCreateSaveButtonSelector).click({force: true});
    cy.scrollTo('top', {ensureScrollable: false});
    cy.get(entityCreateSaveButtonSelector).should('not.exist');
    cy.intercept('GET', '/api/photo-processeds*').as('entitiesRequestAfterCreate');
    cy.visit('/');
    cy.clickOnEntityMenuItem('photo-processed');
    cy.wait('@entitiesRequestAfterCreate');
    cy.get(entityTableSelector).should('have.lengthOf', startingEntitiesCount + 1);
    cy.visit('/');
  });
  */

  /* this test is commented because it contains required relationships
  it('should delete last instance of PhotoProcessed', () => {
    cy.intercept('GET', '/api/photo-processeds*').as('entitiesRequest');
    cy.intercept('GET', '/api/photo-processeds/*').as('dialogDeleteRequest');
    cy.intercept('DELETE', '/api/photo-processeds/*').as('deleteEntityRequest');
    cy.visit('/');
    cy.clickOnEntityMenuItem('photo-processed');
    cy.wait('@entitiesRequest').then(({ request, response }) => {
      startingEntitiesCount = response.body.length;
      if (startingEntitiesCount > 0) {
        cy.get(entityTableSelector).should('have.lengthOf', startingEntitiesCount);
        cy.get(entityDeleteButtonSelector).last().click({force: true});
        cy.wait('@dialogDeleteRequest');
        cy.getEntityDeleteDialogHeading('photoProcessed').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click({force: true});
        cy.wait('@deleteEntityRequest');
        cy.intercept('GET', '/api/photo-processeds*').as('entitiesRequestAfterDelete');
        cy.visit('/');
        cy.clickOnEntityMenuItem('photo-processed');
        cy.wait('@entitiesRequestAfterDelete');
        cy.get(entityTableSelector).should('have.lengthOf', startingEntitiesCount - 1);
      }
      cy.visit('/');
    });
  });
  */
});
