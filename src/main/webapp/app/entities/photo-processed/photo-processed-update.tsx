import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col, Label } from 'reactstrap';
import { AvFeedback, AvForm, AvGroup, AvInput, AvField } from 'availity-reactstrap-validation';
import { setFileData, byteSize, Translate, translate } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IRootState } from 'app/shared/reducers';

import { IPhoto } from 'app/shared/model/photo.model';
import { getEntities as getPhotos } from 'app/entities/photo/photo.reducer';
import { getEntity, updateEntity, createEntity, setBlob, reset } from './photo-processed.reducer';
import { IPhotoProcessed } from 'app/shared/model/photo-processed.model';
import { convertDateTimeFromServer, convertDateTimeToServer, displayDefaultDateTime } from 'app/shared/util/date-utils';
import { mapIdList } from 'app/shared/util/entity-utils';

export interface IPhotoProcessedUpdateProps extends StateProps, DispatchProps, RouteComponentProps<{ id: string }> {}

export const PhotoProcessedUpdate = (props: IPhotoProcessedUpdateProps) => {
  const [isNew] = useState(!props.match.params || !props.match.params.id);

  const { photoProcessedEntity, photos, loading, updating } = props;

  const { description } = photoProcessedEntity;

  const handleClose = () => {
    props.history.push('/photo-processed');
  };

  useEffect(() => {
    if (!isNew) {
      props.getEntity(props.match.params.id);
    }

    props.getPhotos();
  }, []);

  const onBlobChange = (isAnImage, name) => event => {
    setFileData(event, (contentType, data) => props.setBlob(name, data, contentType), isAnImage);
  };

  const clearBlob = name => () => {
    props.setBlob(name, undefined, undefined);
  };

  useEffect(() => {
    if (props.updateSuccess) {
      handleClose();
    }
  }, [props.updateSuccess]);

  const saveEntity = (event, errors, values) => {
    values.created = convertDateTimeToServer(values.created);

    if (errors.length === 0) {
      const entity = {
        ...photoProcessedEntity,
        ...values,
        photo: photos.find(it => it.id.toString() === values.photoId.toString()),
      };

      if (isNew) {
        props.createEntity(entity);
      } else {
        props.updateEntity(entity);
      }
    }
  };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="orgApp.photoProcessed.home.createOrEditLabel" data-cy="PhotoProcessedCreateUpdateHeading">
            <Translate contentKey="orgApp.photoProcessed.home.createOrEditLabel">Create or edit a PhotoProcessed</Translate>
          </h2>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md="8">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <AvForm model={isNew ? {} : photoProcessedEntity} onSubmit={saveEntity}>
              {!isNew ? (
                <AvGroup>
                  <Label for="photo-processed-id">
                    <Translate contentKey="global.field.id">ID</Translate>
                  </Label>
                  <AvInput id="photo-processed-id" type="text" className="form-control" name="id" required readOnly />
                </AvGroup>
              ) : null}
              <AvGroup>
                <Label id="titleLabel" for="photo-processed-title">
                  <Translate contentKey="orgApp.photoProcessed.title">Title</Translate>
                </Label>
                <AvField id="photo-processed-title" data-cy="title" type="text" name="title" />
              </AvGroup>
              <AvGroup>
                <Label id="descriptionLabel" for="photo-processed-description">
                  <Translate contentKey="orgApp.photoProcessed.description">Description</Translate>
                </Label>
                <AvInput id="photo-processed-description" data-cy="description" type="textarea" name="description" />
              </AvGroup>
              <AvGroup>
                <Label id="createdLabel" for="photo-processed-created">
                  <Translate contentKey="orgApp.photoProcessed.created">Created</Translate>
                </Label>
                <AvInput
                  id="photo-processed-created"
                  data-cy="created"
                  type="datetime-local"
                  className="form-control"
                  name="created"
                  placeholder={'YYYY-MM-DD HH:mm'}
                  value={isNew ? displayDefaultDateTime() : convertDateTimeFromServer(props.photoProcessedEntity.created)}
                />
              </AvGroup>
              <AvGroup>
                <Label for="photo-processed-photo">
                  <Translate contentKey="orgApp.photoProcessed.photo">Photo</Translate>
                </Label>
                <AvInput id="photo-processed-photo" data-cy="photo" type="select" className="form-control" name="photoId">
                  <option value="" key="0" />
                  {photos
                    ? photos.map(otherEntity => (
                        <option value={otherEntity.id} key={otherEntity.id}>
                          {otherEntity.id}
                        </option>
                      ))
                    : null}
                </AvInput>
              </AvGroup>
              <Button tag={Link} id="cancel-save" to="/photo-processed" replace color="info">
                <FontAwesomeIcon icon="arrow-left" />
                &nbsp;
                <span className="d-none d-md-inline">
                  <Translate contentKey="entity.action.back">Back</Translate>
                </span>
              </Button>
              &nbsp;
              <Button color="primary" id="save-entity" data-cy="entityCreateSaveButton" type="submit" disabled={updating}>
                <FontAwesomeIcon icon="save" />
                &nbsp;
                <Translate contentKey="entity.action.save">Save</Translate>
              </Button>
            </AvForm>
          )}
        </Col>
      </Row>
    </div>
  );
};

const mapStateToProps = (storeState: IRootState) => ({
  photos: storeState.photo.entities,
  photoProcessedEntity: storeState.photoProcessed.entity,
  loading: storeState.photoProcessed.loading,
  updating: storeState.photoProcessed.updating,
  updateSuccess: storeState.photoProcessed.updateSuccess,
});

const mapDispatchToProps = {
  getPhotos,
  getEntity,
  updateEntity,
  setBlob,
  createEntity,
  reset,
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(PhotoProcessedUpdate);
