import React, { createRef } from 'react';
import { ActivityIndicator, Text, View, Platform, Button, Image } from 'react-native';
import { connect } from 'react-redux';
import * as Yup from 'yup';

import PhotoActions from './photo.reducer';
import AlbumActions from '../album/album.reducer';
import TagActions from '../tag/tag.reducer';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import FormButton from '../../../shared/components/form/jhi-form-button';
import FormField from '../../../shared/components/form/jhi-form-field';
import Form from '../../../shared/components/form/jhi-form';
import { useDidUpdateEffect } from '../../../shared/util/use-did-update-effect';
import styles from './photo-styles';


import * as ImagePicker from 'expo-image-picker';
import ParseDataUri from 'parse-data-uri';
import base64 from 'react-native-base64'

// set up validation schema for the form
const validationSchema = Yup.object().shape({
  title: Yup.string().required(),
  image: Yup.string().required(),
});

function PhotoEditScreen(props) {
  const {
    getPhoto,
    updatePhoto,
    route,
    photo,
    fetching,
    updating,
    errorUpdating,
    updateSuccess,
    navigation,
    reset,
    getAllAlbums,
    albumList,
    getAllTags,
    tagList,
  } = props;

  const [formValue, setFormValue] = React.useState();
  const [error, setError] = React.useState('');
  const [imageChanged, setImage] = React.useState(null);
  const [imageChangedData, setImageData] = React.useState(null);
  const [imageChangedMediatype, setImageMediaType] = React.useState(null);

  const isNewEntity = !(route.params && route.params.entityId);

  React.useEffect(() => {
    if (!isNewEntity) {
      getPhoto(route.params.entityId);
    } else {
      reset();
    }
  }, [isNewEntity, getPhoto, route, reset]);

  React.useEffect(() => {
    if (isNewEntity) {
      setFormValue(entityToFormValue({}));
    } else if (!fetching) {
      setFormValue(entityToFormValue(photo));
    }
  }, [photo, fetching, isNewEntity, imageChangedMediatype]);

  // fetch related entities
  React.useEffect(() => {
    getAllAlbums();
    getAllTags();
  }, [getAllAlbums, getAllTags]);

  useDidUpdateEffect(() => {
    if (updating === false) {
      if (errorUpdating) {
        setError(errorUpdating && errorUpdating.detail ? errorUpdating.detail : 'Something went wrong updating the entity');
      } else if (updateSuccess) {
        setError('');
        isNewEntity ? navigation.replace('PhotoDetail', { entityId: photo?.id }) : navigation.pop();
      }
    }
  }, [updateSuccess, errorUpdating, navigation]);



  React.useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          alert('Sorry, we need camera roll permissions to make this work!');
        }
      }      
    })();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      // aspect: [4, 3],
      quality: 1,
    });

    console.log(result);
    console.log("chk result : ", result.base64);
    
    // var test = ParseDataUri(result.uri);
    // console.log('test : ', test)
    // console.log('test : ', test.mimeType)
    // console.log('test 2 : ', base64.encodeFromByteArray(test.data))

    if (!result.cancelled) {        
      setImage(result.uri);
      let rawData = ParseDataUri(result.uri);

      console.log('rawdata', rawData)
      
      setImageMediaType(rawData.mimeType)
      setImageData(base64.encodeFromByteArray(rawData.data))

      console.log('imageChangedData', imageChangedData)
      console.log('imageChangedMediatype', imageChangedMediatype)
    }
  };

  const onSubmit = (data, imageChangedData, imageChangedMediatype) => updatePhoto(formValueToEntity(data, imageChangedData, imageChangedMediatype));
  // const onSubmit = (data) => updatePhoto(formValueToEntity(data));

  if (fetching) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const formRef = createRef();
  const titleRef = createRef();
  const descriptionRef = createRef();
  const imageRef = createRef();
  const imageContentTypeRef = createRef();
  const takenRef = createRef();
  const albumRef = createRef();
  const tagsRef = createRef();

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView
        enableResetScrollToCoords={false}
        testID="photoEditScrollView"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={styles.paddedScrollView}>
        {!!error && <Text style={styles.errorText}>{error}</Text>}
        {formValue && (
          <Form initialValues={formValue} validationSchema={validationSchema} onSubmit={()=>onSubmit(formValue,imageChangedData,imageChangedMediatype)} ref={formRef}>
            <FormField
              name="title"
              ref={titleRef}
              label="Title"
              placeholder="Enter Title"
              testID="titleInput"
              inputType="text"
              autoCapitalize="none"
              onSubmitEditing={() => descriptionRef.current?.focus()}
            />
            <FormField
              name="description"
              ref={descriptionRef}
              label="Description"
              placeholder="Enter Description"
              testID="descriptionInput"
              inputType="text"
              onSubmitEditing={() => imageRef.current?.focus()}
            />
            <FormField
              name="image"
              ref={imageRef}
              label="Image"              
              testID="imageInput"
              inputType="image-base64"
              contentType={photo.imageContentType}
              onSubmitEditing={() => imageContentTypeRef.current?.focus()}
            />
            {/* <Text>여기에 이미지 수정버튼 달기, Expo ImagePicker 바로 넣어 보기</Text> */}
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Button title="Pick an image from camera roll" onPress={pickImage} />
              {imageChanged && <Image source={{ uri: imageChanged }} style={{ width: 100, height: 100 }}/>}              
            </View>
            <FormField
              name="imageContentType"
              ref={imageContentTypeRef}
              label="Image Content Type"
              placeholder="Enter Image Content Type"
              testID="imageContentTypeInput"
              inputType="text"
              autoCapitalize="none"
              onSubmitEditing={() => takenRef.current?.focus()}
            />
            <FormField name="taken" ref={takenRef} label="Taken" placeholder="Enter Taken" testID="takenInput" inputType="datetime" />
            <FormField
              name="album"
              inputType="select-one"
              ref={albumRef}
              listItems={albumList}
              listItemLabelField="title"
              label="Album"
              placeholder="Select Album"
              testID="albumSelectInput"
            />
            <FormField
              name="tags"
              inputType="select-multiple"
              ref={tagsRef}
              listItems={tagList}
              listItemLabelField="name"
              label="Tag"
              placeholder="Select Tag"
              testID="tagSelectInput"
            />

            <FormButton title={'Save'} testID={'submitButton'} />
          </Form>
        )}
      </KeyboardAwareScrollView>
    </View>
  );
}

// convenience methods for customizing the mapping of the entity to/from the form value
const entityToFormValue = (value) => {
  if (!value) {
    return {};
  }
  return {
    id: value.id ?? null,
    title: value.title ?? null,
    description: value.description ?? null,
    image: value.image ?? null,
    imageContentType: value.imageContentType ?? null,
    taken: value.taken ?? null,
    album: value.album && value.album.id ? value.album.id : null,
    tags: value.tags?.map((i) => i.id),
  };
};
const formValueToEntity = (value,imageData,imageMediatype) => {
  // console.log("chk formValueToEntity() 111 : ", value)
  // console.log("chk formValueToEntity() 222 : ", imageChanged)
  console.log(" in formValueToEntity() value.image ", value.image)
  console.log(" in formValueToEntity() imageData ", imageData)  
  console.log(" in formValueToEntity() imageMediatype ", imageMediatype)  
  const entity = {
    id: value.id ?? null,
    title: value.title ?? null,
    description: value.description ?? null,
    // image: value.image ?? null,
    image: imageData !== null ? imageData : value.image,
    // imageContentType: value.imageContentType ?? null,
    imageContentType: imageMediatype !== null ? imageMediatype : value.imageContentType,
    taken: value.taken ?? null,
  };
  console.log("entity value : ", entity.image)
  entity.album = value.album ? { id: value.album } : null;
  entity.tags = value.tags.map((id) => ({ id }));
  return entity;
};

const mapStateToProps = (state) => {
  return {
    albumList: state.albums.albumList ?? [],
    tagList: state.tags.tagList ?? [],
    photo: state.photos.photo,
    fetching: state.photos.fetchingOne,
    updating: state.photos.updating,
    updateSuccess: state.photos.updateSuccess,
    errorUpdating: state.photos.errorUpdating,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    getAllAlbums: (options) => dispatch(AlbumActions.albumAllRequest(options)),
    getAllTags: (options) => dispatch(TagActions.tagAllRequest(options)),
    getPhoto: (id) => dispatch(PhotoActions.photoRequest(id)),
    getAllPhotos: (options) => dispatch(PhotoActions.photoAllRequest(options)),
    updatePhoto: (photo) => dispatch(PhotoActions.photoUpdateRequest(photo)),
    reset: () => dispatch(PhotoActions.photoReset()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PhotoEditScreen);
