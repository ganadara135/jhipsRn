import React from 'react';
import { Switch } from 'react-router-dom';

import ErrorBoundaryRoute from 'app/shared/error/error-boundary-route';

import PhotoProcessed from './photo-processed';
import PhotoProcessedDetail from './photo-processed-detail';
import PhotoProcessedUpdate from './photo-processed-update';
import PhotoProcessedDeleteDialog from './photo-processed-delete-dialog';

const Routes = ({ match }) => (
  <>
    <Switch>
      <ErrorBoundaryRoute exact path={`${match.url}/new`} component={PhotoProcessedUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id/edit`} component={PhotoProcessedUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id`} component={PhotoProcessedDetail} />
      <ErrorBoundaryRoute path={match.url} component={PhotoProcessed} />
    </Switch>
    <ErrorBoundaryRoute exact path={`${match.url}/:id/delete`} component={PhotoProcessedDeleteDialog} />
  </>
);

export default Routes;
