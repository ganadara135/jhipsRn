import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
import { Translate, openFile, byteSize, TextFormat } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootState } from 'app/shared/reducers';
import { getEntity } from './photo.reducer';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';

export interface IPhotoDetailProps extends StateProps, DispatchProps, RouteComponentProps<{ id: string }> {}

export const PhotoDetail = (props: IPhotoDetailProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const { photoEntity } = props;
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="photoDetailsHeading">
          <Translate contentKey="orgApp.photo.detail.title">Photo</Translate>
        </h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">
              <Translate contentKey="global.field.id">ID</Translate>
            </span>
          </dt>
          <dd>{photoEntity.id}</dd>
          <dt>
            <span id="title">
              <Translate contentKey="orgApp.photo.title">Title</Translate>
            </span>
          </dt>
          <dd>{photoEntity.title}</dd>
          <dt>
            <span id="description">
              <Translate contentKey="orgApp.photo.description">Description</Translate>
            </span>
          </dt>
          <dd>{photoEntity.description}</dd>
          <dt>
            <span id="image">
              <Translate contentKey="orgApp.photo.image">Image</Translate>
            </span>
          </dt>
          <dd>
            {photoEntity.image ? (
              <div>
                {photoEntity.imageContentType ? (
                  <a onClick={openFile(photoEntity.imageContentType, photoEntity.image)}>
                    <img src={`data:${photoEntity.imageContentType};base64,${photoEntity.image}`} style={{ maxHeight: '30px' }} />
                  </a>
                ) : null}
                <span>
                  {photoEntity.imageContentType}, {byteSize(photoEntity.image)}
                </span>
              </div>
            ) : null}
          </dd>
          <dt>
            <span id="taken">
              <Translate contentKey="orgApp.photo.taken">Taken</Translate>
            </span>
          </dt>
          <dd>{photoEntity.taken ? <TextFormat value={photoEntity.taken} type="date" format={APP_DATE_FORMAT} /> : null}</dd>
          <dt>
            <Translate contentKey="orgApp.photo.album">Album</Translate>
          </dt>
          <dd>{photoEntity.album ? photoEntity.album.title : ''}</dd>
          <dt>
            <Translate contentKey="orgApp.photo.tag">Tag</Translate>
          </dt>
          <dd>
            {photoEntity.tags
              ? photoEntity.tags.map((val, i) => (
                  <span key={val.id}>
                    <a>{val.name}</a>
                    {photoEntity.tags && i === photoEntity.tags.length - 1 ? '' : ', '}
                  </span>
                ))
              : null}
          </dd>
        </dl>
        <Button tag={Link} to="/photo" replace color="info" data-cy="entityDetailsBackButton">
          <FontAwesomeIcon icon="arrow-left" />{' '}
          <span className="d-none d-md-inline">
            <Translate contentKey="entity.action.back">Back</Translate>
          </span>
        </Button>
        &nbsp;
        <Button tag={Link} to={`/photo/${photoEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" />{' '}
          <span className="d-none d-md-inline">
            <Translate contentKey="entity.action.edit">Edit</Translate>
          </span>
        </Button>
      </Col>
    </Row>
  );
};

const mapStateToProps = ({ photo }: IRootState) => ({
  photoEntity: photo.entity,
});

const mapDispatchToProps = { getEntity };

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(PhotoDetail);
