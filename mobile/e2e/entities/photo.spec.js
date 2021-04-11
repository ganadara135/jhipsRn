const jestExpect = require('expect');
const {
  reloadApp,
  loginAsUser,
  logout,
  goBack,
  tapFirstElementByLabel,
  openAndTapDrawerMenuItemByLabel,
  waitThenTapButton,
  waitForElementToBeVisibleById,
  setDateTimePickerValue,
  scrollTo,
} = require('../utils');

describe('Photo Screen Tests', () => {
  beforeEach(async () => {
    await reloadApp();
    await loginAsUser();
    await navigateToPhotoScreen();
  });

  const navigateToPhotoScreen = async () => {
    await openAndTapDrawerMenuItemByLabel('Entities');
    await waitForElementToBeVisibleById('entityScreenScrollList');
    await scrollTo('photoEntityScreenButton', 'entityScreenScrollList');
    await element(by.id('photoEntityScreenButton')).tap();
    await waitForElementToBeVisibleById('photoScreen');
  };

  it('should allow you to create, update, and delete the Photo entity', async () => {
    await expect(element(by.id('photoScreen'))).toBeVisible();

    // create
    await tapFirstElementByLabel(' New ');
    await waitForElementToBeVisibleById('photoEditScrollView');
    await scrollTo('titleInput', 'photoEditScrollView');
    await element(by.id('titleInput')).replaceText('Direct');
    await scrollTo('descriptionInput', 'photoEditScrollView');
    await element(by.id('descriptionInput')).replaceText('long-text-blob-content');
    await scrollTo('imageInput', 'photoEditScrollView');
    await element(by.id('imageInput')).replaceText('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
    await scrollTo('imageContentTypeInput', 'photoEditScrollView');
    await element(by.id('imageContentTypeInput')).replaceText('image/gif');
    await scrollTo('takenInput', 'photoEditScrollView');
    await setDateTimePickerValue('takenInput', '2021-04-11T07:22:00+09:00', 'ISO8601');
    await element(by.id('photoEditScrollView')).swipe('down', 'slow');
    await scrollTo('submitButton', 'photoEditScrollView');
    await waitThenTapButton('submitButton');

    // view - validate the creation
    await waitForElementToBeVisibleById('photoDetailScrollView');
    await scrollTo('title', 'photoDetailScrollView');
    await expect(element(by.id('title'))).toHaveLabel('Direct');
    await scrollTo('description', 'photoDetailScrollView');
    await expect(element(by.id('description'))).toHaveLabel('long-text-blob-content');
    await scrollTo('image', 'photoDetailScrollView');
    await expect(element(by.id('image'))).toBeVisible();
    await scrollTo('taken', 'photoDetailScrollView');
    const takenCreateAttributes = await element(by.id('taken')).getAttributes();
    jestExpect(Date.parse(takenCreateAttributes.label)).toEqual(Date.parse('2021-04-11T07:22:00+09:00'));

    // update
    await scrollTo('photoEditButton', 'photoDetailScrollView');
    await tapFirstElementByLabel('Photo Edit Button');
    await waitForElementToBeVisibleById('photoEditScrollView');
    await scrollTo('titleInput', 'photoEditScrollView');
    await element(by.id('titleInput')).replaceText('Direct');
    await scrollTo('descriptionInput', 'photoEditScrollView');
    await element(by.id('descriptionInput')).replaceText('long-text-blob-content-2');
    await scrollTo('imageInput', 'photoEditScrollView');
    await element(by.id('imageInput')).replaceText('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
    await scrollTo('imageContentTypeInput', 'photoEditScrollView');
    await element(by.id('imageContentTypeInput')).replaceText('image/gif');
    await scrollTo('takenInput', 'photoEditScrollView');
    await setDateTimePickerValue('takenInput', '2021-04-11T01:05:00+09:00', 'ISO8601');
    await element(by.id('photoEditScrollView')).swipe('down', 'slow');
    await scrollTo('submitButton', 'photoEditScrollView');
    await waitThenTapButton('submitButton');

    // view - validate the update
    await waitForElementToBeVisibleById('photoDetailScrollView');
    await scrollTo('title', 'photoDetailScrollView');
    await expect(element(by.id('title'))).toHaveLabel('Direct');
    await scrollTo('description', 'photoDetailScrollView');
    await expect(element(by.id('description'))).toHaveLabel('long-text-blob-content-2');
    await scrollTo('image', 'photoDetailScrollView');
    await expect(element(by.id('image'))).toBeVisible();
    await scrollTo('taken', 'photoDetailScrollView');
    const takenUpdateAttributes = await element(by.id('taken')).getAttributes();
    jestExpect(Date.parse(takenUpdateAttributes.label)).toEqual(Date.parse('2021-04-11T01:05:00+09:00'));

    // delete
    await scrollTo('photoDeleteButton', 'photoDetailScrollView');
    await tapFirstElementByLabel('Photo Delete Button');
    await waitForElementToBeVisibleById('photoDeleteModal');
    await waitThenTapButton('deleteButton');
    await waitForElementToBeVisibleById('photoScreen');

    // logout
    await goBack();
    await waitForElementToBeVisibleById('entityScreenScrollList');
    await logout();
  });
});
