import { StyleSheet } from 'react-native';

import { ApplicationStyles } from '../../../shared/themes';

export default StyleSheet.create({
  ...ApplicationStyles.screen,
  ...ApplicationStyles.entity,
  ...ApplicationStyles.entityDeleteModal,
  
  imageBlob: {
    width: 200,
    height: 200,
  },
});
