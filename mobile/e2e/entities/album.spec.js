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

describe('Album Screen Tests', () => {
  beforeEach(async () => {
    await reloadApp();
    await loginAsUser();
    await navigateToAlbumScreen();
  });

  const navigateToAlbumScreen = async () => {
    await openAndTapDrawerMenuItemByLabel('Entities');
    await waitForElementToBeVisibleById('entityScreenScrollList');
    await scrollTo('albumEntityScreenButton', 'entityScreenScrollList');
    await element(by.id('albumEntityScreenButton')).tap();
    await waitForElementToBeVisibleById('albumScreen');
  };

  it('should allow you to create, update, and delete the Album entity', async () => {
    await expect(element(by.id('albumScreen'))).toBeVisible();

    // create
    await tapFirstElementByLabel(' New ');
    await waitForElementToBeVisibleById('albumEditScrollView');
    await scrollTo('titleInput', 'albumEditScrollView');
    await element(by.id('titleInput')).replaceText('Granite');
    await scrollTo('descriptionInput', 'albumEditScrollView');
    await element(by.id('descriptionInput')).replaceText('long-text-blob-content');
    await scrollTo('createdInput', 'albumEditScrollView');
    await setDateTimePickerValue('createdInput', '2021-04-11T05:20:00+09:00', 'ISO8601');
    await element(by.id('albumEditScrollView')).swipe('down', 'slow');
    await scrollTo('submitButton', 'albumEditScrollView');
    await waitThenTapButton('submitButton');

    // view - validate the creation
    await waitForElementToBeVisibleById('albumDetailScrollView');
    await scrollTo('title', 'albumDetailScrollView');
    await expect(element(by.id('title'))).toHaveLabel('Granite');
    await scrollTo('description', 'albumDetailScrollView');
    await expect(element(by.id('description'))).toHaveLabel('long-text-blob-content');
    await scrollTo('created', 'albumDetailScrollView');
    const createdCreateAttributes = await element(by.id('created')).getAttributes();
    jestExpect(Date.parse(createdCreateAttributes.label)).toEqual(Date.parse('2021-04-11T05:20:00+09:00'));

    // update
    await scrollTo('albumEditButton', 'albumDetailScrollView');
    await tapFirstElementByLabel('Album Edit Button');
    await waitForElementToBeVisibleById('albumEditScrollView');
    await scrollTo('titleInput', 'albumEditScrollView');
    await element(by.id('titleInput')).replaceText('Granite');
    await scrollTo('descriptionInput', 'albumEditScrollView');
    await element(by.id('descriptionInput')).replaceText('long-text-blob-content-2');
    await scrollTo('createdInput', 'albumEditScrollView');
    await setDateTimePickerValue('createdInput', '2021-04-11T05:15:00+09:00', 'ISO8601');
    await element(by.id('albumEditScrollView')).swipe('down', 'slow');
    await scrollTo('submitButton', 'albumEditScrollView');
    await waitThenTapButton('submitButton');

    // view - validate the update
    await waitForElementToBeVisibleById('albumDetailScrollView');
    await scrollTo('title', 'albumDetailScrollView');
    await expect(element(by.id('title'))).toHaveLabel('Granite');
    await scrollTo('description', 'albumDetailScrollView');
    await expect(element(by.id('description'))).toHaveLabel('long-text-blob-content-2');
    await scrollTo('created', 'albumDetailScrollView');
    const createdUpdateAttributes = await element(by.id('created')).getAttributes();
    jestExpect(Date.parse(createdUpdateAttributes.label)).toEqual(Date.parse('2021-04-11T05:15:00+09:00'));

    // delete
    await scrollTo('albumDeleteButton', 'albumDetailScrollView');
    await tapFirstElementByLabel('Album Delete Button');
    await waitForElementToBeVisibleById('albumDeleteModal');
    await waitThenTapButton('deleteButton');
    await waitForElementToBeVisibleById('albumScreen');

    // logout
    await goBack();
    await waitForElementToBeVisibleById('entityScreenScrollList');
    await logout();
  });
});
