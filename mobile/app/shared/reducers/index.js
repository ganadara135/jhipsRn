import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist';

import configureStore from './create-store';
import rootSaga from '../sagas';
import ReduxPersist from '../../config/redux-persist';

/* ------------- Assemble The Reducers ------------- */
export const reducers = combineReducers({
  appState: require('./app-state.reducer').reducer,
  users: require('./user.reducer').reducer,
  albums: require('../../modules/entities/album/album.reducer').reducer,
  photos: require('../../modules/entities/photo/photo.reducer').reducer,
  tags: require('../../modules/entities/tag/tag.reducer').reducer,
  // jhipster-react-native-redux-store-import-needle
  account: require('./account.reducer').reducer,
  login: require('../../modules/login/login.reducer').reducer,
  register: require('../../modules/account/register/register.reducer').reducer,
  changePassword: require('../../modules/account/password/change-password.reducer').reducer,
  forgotPassword: require('../../modules/account/password-reset/forgot-password.reducer').reducer,
});

export default () => {
  let finalReducers = reducers;
  // If rehydration is on use persistReducer otherwise default combineReducers
  if (ReduxPersist.active) {
    const persistConfig = ReduxPersist.storeConfig;
    finalReducers = persistReducer(persistConfig, reducers);
  }

  let { store, sagasManager, sagaMiddleware } = configureStore(finalReducers, rootSaga);

  if (module.hot) {
    module.hot.accept(() => {
      const nextRootReducer = require('./index').reducers;
      store.replaceReducer(nextRootReducer);

      const newYieldedSagas = require('../sagas').default;
      sagasManager.cancel();
      sagasManager.done.then(() => {
        sagasManager = sagaMiddleware.run(newYieldedSagas);
      });
    });
  }

  return store;
};
