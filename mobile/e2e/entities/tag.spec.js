const {
  reloadApp,
  loginAsUser,
  logout,
  goBack,
  tapFirstElementByLabel,
  openAndTapDrawerMenuItemByLabel,
  waitThenTapButton,
  waitForElementToBeVisibleById,
  scrollTo,
} = require('../utils');

describe('Tag Screen Tests', () => {
  beforeEach(async () => {
    await reloadApp();
    await loginAsUser();
    await navigateToTagScreen();
  });

  const navigateToTagScreen = async () => {
    await openAndTapDrawerMenuItemByLabel('Entities');
    await waitForElementToBeVisibleById('entityScreenScrollList');
    await scrollTo('tagEntityScreenButton', 'entityScreenScrollList');
    await element(by.id('tagEntityScreenButton')).tap();
    await waitForElementToBeVisibleById('tagScreen');
  };

  it('should allow you to create, update, and delete the Tag entity', async () => {
    await expect(element(by.id('tagScreen'))).toBeVisible();

    // create
    await tapFirstElementByLabel(' New ');
    await waitForElementToBeVisibleById('tagEditScrollView');
    await scrollTo('nameInput', 'tagEditScrollView');
    await element(by.id('nameInput')).replaceText('revolutionize Alabama');
    await element(by.id('tagEditScrollView')).swipe('down', 'slow');
    await scrollTo('submitButton', 'tagEditScrollView');
    await waitThenTapButton('submitButton');

    // view - validate the creation
    await waitForElementToBeVisibleById('tagDetailScrollView');
    await scrollTo('name', 'tagDetailScrollView');
    await expect(element(by.id('name'))).toHaveLabel('revolutionize Alabama');

    // update
    await scrollTo('tagEditButton', 'tagDetailScrollView');
    await tapFirstElementByLabel('Tag Edit Button');
    await waitForElementToBeVisibleById('tagEditScrollView');
    await scrollTo('nameInput', 'tagEditScrollView');
    await element(by.id('nameInput')).replaceText('revolutionize Alabama');
    await element(by.id('tagEditScrollView')).swipe('down', 'slow');
    await scrollTo('submitButton', 'tagEditScrollView');
    await waitThenTapButton('submitButton');

    // view - validate the update
    await waitForElementToBeVisibleById('tagDetailScrollView');
    await scrollTo('name', 'tagDetailScrollView');
    await expect(element(by.id('name'))).toHaveLabel('revolutionize Alabama');

    // delete
    await scrollTo('tagDeleteButton', 'tagDetailScrollView');
    await tapFirstElementByLabel('Tag Delete Button');
    await waitForElementToBeVisibleById('tagDeleteModal');
    await waitThenTapButton('deleteButton');
    await waitForElementToBeVisibleById('tagScreen');

    // logout
    await goBack();
    await waitForElementToBeVisibleById('entityScreenScrollList');
    await logout();
  });
});
