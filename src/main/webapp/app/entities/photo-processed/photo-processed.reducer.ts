import axios from 'axios';
import {
  parseHeaderForLinks,
  loadMoreDataWhenScrolled,
  ICrudGetAction,
  ICrudGetAllAction,
  ICrudPutAction,
  ICrudDeleteAction,
} from 'react-jhipster';

import { cleanEntity } from 'app/shared/util/entity-utils';
import { REQUEST, SUCCESS, FAILURE } from 'app/shared/reducers/action-type.util';

import { IPhotoProcessed, defaultValue } from 'app/shared/model/photo-processed.model';

export const ACTION_TYPES = {
  FETCH_PHOTOPROCESSED_LIST: 'photoProcessed/FETCH_PHOTOPROCESSED_LIST',
  FETCH_PHOTOPROCESSED: 'photoProcessed/FETCH_PHOTOPROCESSED',
  CREATE_PHOTOPROCESSED: 'photoProcessed/CREATE_PHOTOPROCESSED',
  UPDATE_PHOTOPROCESSED: 'photoProcessed/UPDATE_PHOTOPROCESSED',
  PARTIAL_UPDATE_PHOTOPROCESSED: 'photoProcessed/PARTIAL_UPDATE_PHOTOPROCESSED',
  DELETE_PHOTOPROCESSED: 'photoProcessed/DELETE_PHOTOPROCESSED',
  SET_BLOB: 'photoProcessed/SET_BLOB',
  RESET: 'photoProcessed/RESET',
};

const initialState = {
  loading: false,
  errorMessage: null,
  entities: [] as ReadonlyArray<IPhotoProcessed>,
  entity: defaultValue,
  links: { next: 0 },
  updating: false,
  totalItems: 0,
  updateSuccess: false,
};

export type PhotoProcessedState = Readonly<typeof initialState>;

// Reducer

export default (state: PhotoProcessedState = initialState, action): PhotoProcessedState => {
  switch (action.type) {
    case REQUEST(ACTION_TYPES.FETCH_PHOTOPROCESSED_LIST):
    case REQUEST(ACTION_TYPES.FETCH_PHOTOPROCESSED):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        loading: true,
      };
    case REQUEST(ACTION_TYPES.CREATE_PHOTOPROCESSED):
    case REQUEST(ACTION_TYPES.UPDATE_PHOTOPROCESSED):
    case REQUEST(ACTION_TYPES.DELETE_PHOTOPROCESSED):
    case REQUEST(ACTION_TYPES.PARTIAL_UPDATE_PHOTOPROCESSED):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        updating: true,
      };
    case FAILURE(ACTION_TYPES.FETCH_PHOTOPROCESSED_LIST):
    case FAILURE(ACTION_TYPES.FETCH_PHOTOPROCESSED):
    case FAILURE(ACTION_TYPES.CREATE_PHOTOPROCESSED):
    case FAILURE(ACTION_TYPES.UPDATE_PHOTOPROCESSED):
    case FAILURE(ACTION_TYPES.PARTIAL_UPDATE_PHOTOPROCESSED):
    case FAILURE(ACTION_TYPES.DELETE_PHOTOPROCESSED):
      return {
        ...state,
        loading: false,
        updating: false,
        updateSuccess: false,
        errorMessage: action.payload,
      };
    case SUCCESS(ACTION_TYPES.FETCH_PHOTOPROCESSED_LIST): {
      const links = parseHeaderForLinks(action.payload.headers.link);

      return {
        ...state,
        loading: false,
        links,
        entities: loadMoreDataWhenScrolled(state.entities, action.payload.data, links),
        totalItems: parseInt(action.payload.headers['x-total-count'], 10),
      };
    }
    case SUCCESS(ACTION_TYPES.FETCH_PHOTOPROCESSED):
      return {
        ...state,
        loading: false,
        entity: action.payload.data,
      };
    case SUCCESS(ACTION_TYPES.CREATE_PHOTOPROCESSED):
    case SUCCESS(ACTION_TYPES.UPDATE_PHOTOPROCESSED):
    case SUCCESS(ACTION_TYPES.PARTIAL_UPDATE_PHOTOPROCESSED):
      return {
        ...state,
        updating: false,
        updateSuccess: true,
        entity: action.payload.data,
      };
    case SUCCESS(ACTION_TYPES.DELETE_PHOTOPROCESSED):
      return {
        ...state,
        updating: false,
        updateSuccess: true,
        entity: {},
      };
    case ACTION_TYPES.SET_BLOB: {
      const { name, data, contentType } = action.payload;
      return {
        ...state,
        entity: {
          ...state.entity,
          [name]: data,
          [name + 'ContentType']: contentType,
        },
      };
    }
    case ACTION_TYPES.RESET:
      return {
        ...initialState,
      };
    default:
      return state;
  }
};

const apiUrl = 'api/photo-processeds';

// Actions

export const getEntities: ICrudGetAllAction<IPhotoProcessed> = (page, size, sort) => {
  const requestUrl = `${apiUrl}${sort ? `?page=${page}&size=${size}&sort=${sort}` : ''}`;
  return {
    type: ACTION_TYPES.FETCH_PHOTOPROCESSED_LIST,
    payload: axios.get<IPhotoProcessed>(`${requestUrl}${sort ? '&' : '?'}cacheBuster=${new Date().getTime()}`),
  };
};

export const getEntity: ICrudGetAction<IPhotoProcessed> = id => {
  const requestUrl = `${apiUrl}/${id}`;
  return {
    type: ACTION_TYPES.FETCH_PHOTOPROCESSED,
    payload: axios.get<IPhotoProcessed>(requestUrl),
  };
};

export const createEntity: ICrudPutAction<IPhotoProcessed> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.CREATE_PHOTOPROCESSED,
    payload: axios.post(apiUrl, cleanEntity(entity)),
  });
  return result;
};

export const updateEntity: ICrudPutAction<IPhotoProcessed> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.UPDATE_PHOTOPROCESSED,
    payload: axios.put(`${apiUrl}/${entity.id}`, cleanEntity(entity)),
  });
  return result;
};

export const partialUpdate: ICrudPutAction<IPhotoProcessed> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.PARTIAL_UPDATE_PHOTOPROCESSED,
    payload: axios.patch(`${apiUrl}/${entity.id}`, cleanEntity(entity)),
  });
  return result;
};

export const deleteEntity: ICrudDeleteAction<IPhotoProcessed> = id => async dispatch => {
  const requestUrl = `${apiUrl}/${id}`;
  const result = await dispatch({
    type: ACTION_TYPES.DELETE_PHOTOPROCESSED,
    payload: axios.delete(requestUrl),
  });
  return result;
};

export const setBlob = (name, data, contentType?) => ({
  type: ACTION_TYPES.SET_BLOB,
  payload: {
    name,
    data,
    contentType,
  },
});

export const reset = () => ({
  type: ACTION_TYPES.RESET,
});
