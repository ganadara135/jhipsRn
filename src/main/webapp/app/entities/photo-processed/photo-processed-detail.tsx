import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
import { Translate, byteSize, TextFormat } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootState } from 'app/shared/reducers';
import { getEntity } from './photo-processed.reducer';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';

export interface IPhotoProcessedDetailProps extends StateProps, DispatchProps, RouteComponentProps<{ id: string }> {}

export const PhotoProcessedDetail = (props: IPhotoProcessedDetailProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const { photoProcessedEntity } = props;
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="photoProcessedDetailsHeading">
          <Translate contentKey="orgApp.photoProcessed.detail.title">PhotoProcessed</Translate>
        </h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">
              <Translate contentKey="global.field.id">ID</Translate>
            </span>
          </dt>
          <dd>{photoProcessedEntity.id}</dd>
          <dt>
            <span id="title">
              <Translate contentKey="orgApp.photoProcessed.title">Title</Translate>
            </span>
          </dt>
          <dd>{photoProcessedEntity.title}</dd>
          <dt>
            <span id="description">
              <Translate contentKey="orgApp.photoProcessed.description">Description</Translate>
            </span>
          </dt>
          <dd>{photoProcessedEntity.description}</dd>
          <dt>
            <span id="created">
              <Translate contentKey="orgApp.photoProcessed.created">Created</Translate>
            </span>
          </dt>
          <dd>
            {photoProcessedEntity.created ? <TextFormat value={photoProcessedEntity.created} type="date" format={APP_DATE_FORMAT} /> : null}
          </dd>
          <dt>
            <Translate contentKey="orgApp.photoProcessed.photo">Photo</Translate>
          </dt>
          <dd>{photoProcessedEntity.photo ? photoProcessedEntity.photo.id : ''}</dd>
        </dl>
        <Button tag={Link} to="/photo-processed" replace color="info" data-cy="entityDetailsBackButton">
          <FontAwesomeIcon icon="arrow-left" />{' '}
          <span className="d-none d-md-inline">
            <Translate contentKey="entity.action.back">Back</Translate>
          </span>
        </Button>
        &nbsp;
        <Button tag={Link} to={`/photo-processed/${photoProcessedEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" />{' '}
          <span className="d-none d-md-inline">
            <Translate contentKey="entity.action.edit">Edit</Translate>
          </span>
        </Button>
      </Col>
    </Row>
  );
};

const mapStateToProps = ({ photoProcessed }: IRootState) => ({
  photoProcessedEntity: photoProcessed.entity,
});

const mapDispatchToProps = { getEntity };

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(PhotoProcessedDetail);
