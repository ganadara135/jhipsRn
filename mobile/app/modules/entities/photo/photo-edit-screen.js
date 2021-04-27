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
import SeamlessImmutable from 'seamless-immutable';

// set up validation schema for the form
const validationSchema = Yup.object().shape({
  title: Yup.string().required(),
  // image: Yup.string().required(),
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
  // const [imageChanged, setImage] = React.useState(null);  
  // const [imageChangedMediatype, setImageMediaType] = React.useState(null);

  const isNewEntity = !(route.params && route.params.entityId);

  // const [isNew] = useState(!props.match.params || !props.match.params.id);
  // const { photoEntity, albums, tags, loading, updating } = props;
  // const { description, image, imageContentType } = photoEntity;
  // const { description, image, imageContentType } = photo;
  console.log('photo  : ', photo);
  console.log('isNewEntity : ', isNewEntity);
  console.log('formValue : ', formValue);
  // console.log('albumList : ', albumList);
  console.log('tagList : ', tagList);
  

  React.useEffect(() => {
    if (!isNewEntity) {
       getPhoto(route.params.entityId);
    } else {
       reset();
    }
  }, [isNewEntity, getPhoto, route, reset]);

  React.useEffect(() => {
    //console.log("chk 얼마나 호출되는지")
    if (isNewEntity) {
      // reset();
      setFormValue(entityToFormValue({}));
    } else if (!fetching) {
      // console.log("9999999999999999")
      setFormValue(entityToFormValue(photo));
    }
  // }, [fetching]);
  }, [photo, fetching, isNewEntity]);

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


  const imageRef = createRef();


  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      // aspect: [4, 3],
      quality: 1,
    });    

    if (!result.cancelled) {               
      let rawData = ParseDataUri(result.uri);      
      // setImageMediaType(rawData.mimeType)
      // setImage(base64.encodeFromByteArray(rawData.data))
      console.log("tags.map : ", formValue.tags.map((id) => id))
      console.log("tags.length : ", formValue?.tags.length)

      setFormValue(entityToFormValue({
        id: formValue?.id ?? null,
        title: formValue?.title ?? null,
        description: formValue?.description ?? null,
        taken: formValue?.taken ?? null,
        album: formValue?.album ?? null,
        tags: formValue?.tags.length > 0 ? formValue.tags.map((id) => {return {id: id}}) : [],
        image : base64.encodeFromByteArray(rawData.data),
        imageContentType: rawData.mimeType
      }));      
    }
  };

  
  // const onSubmit = (data, imageChangedData, imageChangedMediatype) => updatePhoto(formValueToEntity(data, imageChangedData, imageChangedMediatype));
  // const onSubmit = (data) => updatePhoto(formValueToEntity(date));
    const onSubmit = (data) => updatePhoto(formValueToEntity(    
    console.log('onSubmit data : ', data) || {
      id: formValue?.id ?? null,
      title: data.title ? data.title : formValue.title,
      description: data.description ? data.description : formValue.description,
      image: formValue.image ? formValue.image : data.image,
      imageContentType: formValue.imageContentType ? formValue.imageContentType : data.imageContentType,
      taken: formValue.taken ? formValue.taken : data.taken,
      album: data.album ? {id : data.album} : (formValue.album ? formValue.album : null),
      tags: data.tags ? data.tags.map((tag) =>  {
        return {id : tag}
      }) : [],        
    }));

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
  
  const imageContentTypeRef = createRef();
  const takenRef = createRef();
  const albumRef = createRef();
  const tagsRef = createRef();

  // const itemsKcod = [
  //   // this is the parent or 'item'
  //   {
  //     name: 'Fruits',
  //     id: 0,
  //     // these are the children or 'sub items'
  //     children: [
  //       {
  //         name: 'Apple',
  //         id: 10,
  //       },
  //       {
  //         name: 'Strawberry',
  //         id: 17,
  //       },
  //       {
  //         name: 'Pineapple',
  //         id: 13,
  //       },
  //       {
  //         name: 'Banana',
  //         id: 14,
  //       },
  //       {
  //         name: 'Watermelon',
  //         id: 15,
  //       },
  //       {
  //         name: 'Kiwi fruit',
  //         id: 16,
  //       },
  //     ],
  //   },

  // ];

  // console.log('itemsKcod : ', itemsKcod)
  // const tmp = tagList.concat();
  // console.log("tmp : ", tmp)
  // console.log("Array.isArray(tmp) : ", Array.isArray(tmp))
  // var muTmp = SeamlessImmutable.asMutable(tmp);
  // console.log("muTmp : ", muTmp);

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
          <Form initialValues={formValue} validationSchema={validationSchema}  onSubmit={onSubmit} ref={formRef}>
          {/* //onSubmit={ () => onSubmit(formValue,imageChangedData,imageChangedMediatype)} ref={formRef}> */}
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
            {/* <Text>여기에 이미지 수정버튼 달기, Expo ImagePicker 바로 넣어 보기</Text> */}
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Button title="Pick an image from camera roll" onPress={pickImage} />              
            </View> 

           {!formValue.image ? <FormField
              name="image"
              ref={imageRef}
              label="Image"              
              testID="imageInput"
              inputType="image-base64"
              contentType={photo.imageContentType}
              onSubmitEditing={() => imageContentTypeRef.current?.focus()}
            /> : <Image source={{
              uri:`data:${formValue.imageContentType};base64,${formValue.image}`}} 
              style={{ width: 200, height: 200 }}/> }   

            {formValue.imageContentType && <FormField
              name="imageContentType"
              ref={imageContentTypeRef}
              label="Image Content Type"
              placeholder="Enter Image Content Type"
              testID="imageContentTypeInput"
              inputType="text"
              autoCapitalize="none"
              onSubmitEditing={() => takenRef.current?.focus()}
              visable={false}
            />}
            
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
              //listItems={{id:0, name:"Tag", children:{...tagList}}}
              listItems={tagList}
              // listItems={itemsKcod[0].children}              
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
  console.log("chk entityToFormValue() value : ", value)  
  if (!value) {
    return {};
  }
  console.log("check tags.length : ", value.tags?.length)
  const entity = {
    id: value.id ?? null,
    title: value.title ?? null,
    description: value.description ?? null,
    image: value.image ?? null,
    imageContentType: value.imageContentType ?? null,
    taken: value.taken ?? null,
    album: value.album?.id ? value.album.id : value.album,
    // 임시로 간단히 처리하기 위해서 막아 놓음, 이미 값이 들어있는 tags 가 있으면 children  을 못 찾는 버그 발생
    tags: value.tags?.length > 0 ? value.tags.map((tag) => tag.id ) : value.tags,
    // tags: []
  };
  console.log('entityToFormValue return : ', entity);
  return entity;
};
const formValueToEntity = (value) => {
  console.log("chk formValueToEntity() : ", value)
  const entity = {
    id: value?.id ?? null,
    title: value.title ?? null,
    description: value.description ?? null,
    image: value.image ?? null,    
    imageContentType: value.imageContentType ?? null,
    taken: value.taken ?? null,
  };  
  entity.album = value.album ? value.album : null;
  entity.tags = value.tags !== undefined ? value.tags.map((id) => id) : [];
  console.log("chk return entity : ", entity)
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
    // 테스트 용도로 만들어 놓고 사용 안함
    setBlob: (imageData, contentType) => dispatch(PhotoActions.setBlob(imageData,contentType))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PhotoEditScreen);
