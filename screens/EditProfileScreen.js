import React from 'react'
import Constants from 'expo-constants'
import { Entypo } from '@expo/vector-icons'
import {
  StyleSheet,
  KeyboardAvoidingView,
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  AsyncStorage,
} from 'react-native'
import {
  Button,
  Form,
  Input,
  Item,
  Label,
  Text,
  Content,
  View,
  Icon,
  CheckBox,
  Thumbnail,
} from 'native-base'
import { withNavigation } from 'react-navigation'
import * as Permissions from 'expo-permissions'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { connect } from 'react-redux'
import { Ionicons } from '@expo/vector-icons'
import { Camera } from 'expo-camera'
import PropTypes from 'prop-types'
import * as Permissions from 'expo-permissions'

import {
  updateUser,
  signoutUser,
  getUserCar,
  uploadImageUser,
  createVehicle,
} from '../redux/actions/user'
import Layout from '../constants/Layout'
import Colors from '../constants/Colors'
import PhotoTaker from '../components/Login/PhotoTaker'
import CameraModal from '../components/Login/CameraModal'
import {
  formatPhone,
  maxLengthPhone,
  notWrongPhone,
  validPhone,
  notWrongPlate,
} from '../utils/input'
import * as ImagePicker from 'expo-image-picker'

const getText = destination => {
  switch (destination) {
    case 'licenseFront':
      return 'Licencia de conducir frontal'
    case 'licenseBack':
      return 'Licencia de conducir trasera'
    default:
      return ''
  }
}

function validateName(str) {
  if (typeof str !== 'string') {
    return false
  }
  str = str.trim()

  if (str.length < 'Al'.length) {
    return false
  }
  if (str.length >= 256) {
    return false
  }

  // letters, dash, space
  return /^[ A-Za-zÁÉÍÓÚÑÜáéíóúñü]+$/g.test(str)
}

function validatePlate(str) {
  if (typeof str !== 'string') {
    return false
  }
  str = str.trim()

  const pattern = new RegExp('\\b([A-Z]{2}([A-Z]|[0-9]){2}[0-9]{2})\\b', 'gi')

  return pattern.test(str)
}

function validateColor(str) {
  if (typeof str !== 'string') {
    return false
  }
  str = str.trim()

  if (str.length < 'azul'.length) {
    return false
  }
  if (str.length >= 256) {
    return false
  }

  // letters, dash, space, parenthesis
  return /^[- A-Za-z()ÁÉÍÓÚÑÜáéíóúñü]+$/g.test(str) || str === ''
}

function validateBrand(str) {
  if (typeof str !== 'string') {
    return false
  }
  str = str.trim()

  if (str.length < 'BMW'.length) {
    return false
  }
  if (str.length >= 256) {
    return false
  }

  // letters, numbers, dash, space, parenthesis
  return /^[- A-Za-z\d()ÁÉÍÓÚÑÜáéíóúñü]+$/g.test(str) || str === ''
}

function validateModel(str) {
  return validateBrand(str)
}

const Field = ({ field }) => {
  const [isEditing, setIsEditing] = React.useState(false)
  const [hasBeenBlurred, setHasBeenBlurred] = React.useState(false)

  const validity = field.validate(field.value)
    ? 'valid'
    : isEditing
    ? 'partial'
    : hasBeenBlurred
    ? 'invalid'
    : 'partial'

  return (
    <Item
      key={field.label}
      inlineLabel
      regular
      style={{
        ...styles.item,
        backgroundColor:
          field.editable !== undefined && !field.editable ? '#C0C0C0' : '#FFF',
      }}
      success={validity === 'valid'}
      error={validity === 'invalid'}
    >
      <Label style={styles.label}>{field.label}</Label>
      <Input
        style={styles.input}
        onChangeText={value => {
          field.setValue(value)
          setIsEditing(true)
        }}
        onEndEditing={() => {
          setIsEditing(false)
          setHasBeenBlurred(true)
        }}
        value={field.value}
        placeholder={field.placeholder}
        secureTextEntry={field.isSecure}
        keyboardType={field.keyboardType || 'default'}
        maxLength={field.maxLength ? field.maxLength(field.value) : undefined}
        editable={field.editable}
      />
      {validity === 'valid' ? (
        <Icon name="checkmark-circle" style={styles.checkMark} />
      ) : validity === 'invalid' ? (
        <Icon name="close-circle" />
      ) : null}
    </Item>
  )
}
Field.propTypes = {
  field: PropTypes.exact({
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    setValue: PropTypes.func.isRequired,
    validate: PropTypes.func.isRequired,
    isSecure: PropTypes.bool,
    keyboardType: PropTypes.oneOf([
      'default',
      'number-pad',
      'decimal-pad',
      'numeric',
      'email-address',
      'phone-pad',
    ]),
  }).isRequired,
}

const EditProfileScreen = props => {
  // const { navigation } = props

  const [name, setName] = React.useState('')
  const [lastName, setLastName] = React.useState('')
  const [phone, setPhone] = React.useState('')
  // const [password, setPassword] = React.useState('')
  const [hasCar, setHasCar] = React.useState(false)
  const [carPlate, setCarPlate] = React.useState('')
  const [carColor, setCarColor] = React.useState('')
  const [carBrand, setCarBrand] = React.useState('')
  const [carModel, setCarModel] = React.useState('')
  const [avatar, setAvatar] = React.useState(props.user.avatar)

  const [isLoading, setIsLoading] = React.useState(true)
  // eslint-disable-next-line no-unused-vars
  const [loadErr, setLoadErr] = React.useState(null)

  // eslint-disable-next-line no-unused-vars
  const [isSaving, setIsSaving] = React.useState(false)
  // eslint-disable-next-line no-unused-vars
  const [saveErr, setSaveErr] = React.useState(null)
  const [isCameraOn, setIsCameraOn] = React.useState(false)
  const [hasCameraPermission, setHasCameraPermission] = React.useState(false)
  const [destination, setDestination] = React.useState('licenseFront')
  const [licenseFront, setLicenseFront] = React.useState(
    props.user.license && props.user.license.front
  )
  const [frontSubmit, setFrontSubmit] = React.useState('')
  const [licenseBack, setLicenseBack] = React.useState(
    props.user.license && props.user.license.back
  )
  const [backSubmit, setBackSubmit] = React.useState('')
  const [isUploadingLicense, setIsUploadingLicense] = React.useState(false)
  const [isSavingCar, setIsSavingCar] = React.useState(false)
  const [canSubmitCar, setCanSubmitCar] = React.useState(false)

  // duplicate code -> goes in utils
  const requestCameraPermission = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA)
    setHasCameraPermission(status === 'granted')
  }

  const commonFields = [
    { label: 'Nombre', value: name, setValue: setName, validate: validateName },
    {
      label: 'Apellido',
      value: lastName,
      setValue: setLastName,
      validate: validateName,
    },
    {
      label: 'Teléfono',
      value: phone,
      maxLength: maxLengthPhone,
      setValue: value => {
        if (notWrongPhone(value)) {
          setPhone(formatPhone(value))
        }
      },
      validate: validPhone,
      keyboardType: 'phone-pad',
      placeholder: '+56 9 9999 9999',
    },
  ]
  const carFields = [
    {
      label: 'Patente',
      value: carPlate ? carPlate.toUpperCase() : carPlate,
      setValue: value => {
        if (notWrongPlate(value)) {
          setCarPlate(value)
        }
      },
      validate: validatePlate,
      editable: canSubmitCar,
      placeholder: 'AABB99',
    },
    {
      label: 'Color',
      value: carColor,
      setValue: setCarColor,
      validate: validateColor,
      editable: canSubmitCar,
      placeholder: 'Negro',
    },
    {
      label: 'Marca',
      value: carBrand,
      setValue: setCarBrand,
      validate: validateBrand,
      editable: canSubmitCar,
      placeholder: 'Toyota',
    },
    {
      label: 'Modelo',
      value: carModel,
      setValue: setCarModel,
      validate: validateModel,
      editable: canSubmitCar,
      placeholder: 'Corolla',
    },
  ]

  const user = {
    name,
    lastName,
    phone,
    car: {
      plate: carPlate,
      color: carColor,
      brand: carBrand,
      model: carModel,
    },
  }

  const isValidUser = () => {
    const validFields = [...commonFields].every(field =>
      field.validate(field.value)
    )
    return validFields
  }

  const isValidCar = () => {
    const validFields = [...carFields].every(field =>
      field.validate(field.value)
    )
    return validFields
  }

  React.useEffect(() => {
    const stateUser = props.user
    const user = {
      name: stateUser.name,
      lastName: stateUser.lastName,
      phone: stateUser.phone,
    }
    if (stateUser.vehicles && stateUser.vehicles.length !== 0) {
      props.getUserCar(stateUser.token, stateUser.vehicles[0].vehicle_id)
    } else {
      setCanSubmitCar(true)
    }
    setName(user.name)
    setLastName(user.lastName)
    setPhone(user.phone)
    setIsLoading(false)
  }, [])

  React.useEffect(() => {
    const { car } = props.user
    if (car && car.vehicle_attributes && car.vehicle_identification) {
      const {
        vehicle_color,
        vehicle_brand,
        vehicle_model,
      } = car.vehicle_attributes
      const { identification_id } = car.vehicle_identification
      setCarBrand(vehicle_brand)
      setCarColor(vehicle_color)
      setCarModel(vehicle_model)
      setCarPlate(identification_id)
      setHasCar(true)
    }
  }, [props.user.car])

  React.useEffect(() => {
    if (saveErr != null) {
      Alert.alert(
        'Error al cargar usuario',
        JSON.stringify(loadErr, null, '  ')
      )
    }
  }, [loadErr])

  React.useEffect(() => {
    if (hasCar) {
      requestCameraPermission()
    }
  }, [hasCar])

  const saveUser = async () => {
    setIsLoading(true)
    const response = await props.updateUser(props.user.token, {
      first_name: user.name,
      last_name: user.lastName,
      phone: user.phone,
    })
    setIsLoading(false)
    if (response.error) {
      Alert.alert(
        'Error actualizando datos',
        'Hubo un problema actualizando tu informacion. Por favor intentalo de nuevo.'
      )
    } else {
      Alert.alert('Actualización exitosa', 'Informacion actualizada con exito')
    }
  }

  const onPressSaveProfile = React.useCallback(() => {
    saveUser()
  }, [user])

  React.useEffect(() => {
    if (saveErr != null) {
      Alert.alert(
        'Error al guardar perfil',
        JSON.stringify(saveErr, null, '  ')
      )
    }
  }, [saveErr])

  if (isLoading) {
    return (
      <View>
        <ActivityIndicator size="large" color="blue" marginTop={20} />
      </View>
    )
  }
  
  const _pickImage = async () => {
    if (Constants.platform.ios) {
      const { status_roll } = await Permissions.askAsync(
        Permissions.CAMERA_ROLL
      )
      if (status_roll !== 'granted') {
        alert('Necesitamos permiso para poder acceder a tus cámara y biblioteca de imágenes.')
      }
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [3, 3],
      base64: true,
    })

    if (!result.cancelled) {
      setAvatar(result.uri)
      uploadImageUser(result.base64)
    }
  }

  const onTakePicture = (photo, photoUri, dest) => {
    switch (dest) {
      case 'licenseFront':
        setLicenseFront(photoUri)
        setFrontSubmit(photo)
        break
      case 'licenseBack':
        setLicenseBack(photoUri)
        setBackSubmit(photo)
        break
      default:
        break
    }
  }

  const openCamera = dest => {
    setDestination(dest)
    setIsCameraOn(true)
  }

  const closeCamera = () => {
    setIsCameraOn(false)
  }

  const onPressSaveLicense = async () => {
    setIsUploadingLicense(true)
    setIsLoading(true)
    const frontIdUrl = await props.uploadImage(frontSubmit)
    const backIdUrl = await props.uploadImage(backSubmit)
    const response = await props.updateUser(props.user.token, {
      user_identifications: {
        driver_license_image_front: frontIdUrl,
        driver_license_image_back: backIdUrl,
      },
    })
    setIsLoading(false)
    setFrontSubmit('')
    setBackSubmit('')
    setIsUploadingLicense(false)
    if (response.error) {
      Alert.alert(
        'Error actualizando datos',
        'Hubo un problema actualizando tu informacion. Por favor intentalo de nuevo.'
      )
    } else {
      Alert.alert('Actualización exitosa', 'Solicitud enviada con éxito')
    }
  }

  const onPressSaveCar = async () => {
    const { token, email } = props.user
    setIsSavingCar(true)
    setIsLoading(true)
    const response = await props.createVehicle(token, {
      nickname: `Vehicle ${email}`,
      type: 'car',
      seats: '0',
      color: carColor,
      vehicle_identification: {
        type: 'license_plate',
        identification: carPlate.toUpperCase(),
        country: 'Chile',
      },
      vehicle_attributes: {
        brand: carBrand,
        model: carModel,
      },
    })
    setIsLoading(false)
    setIsSaving(false)
    if (response.error) {
      Alert.alert(
        'Error ingresando el vehículo',
        'Hubo un problema al intentar ingresar tu vehículo. Por favor intentalo de nuevo.'
      )
    } else {
      setCanSubmitCar(false)
      Alert.alert('Ingreso exitoso', 'Tu vehículo fue ingresado exitosamente')
    }
  }

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.flex1}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <Content>
          <View style={{ minHeight: Dimensions.get('window').height }}>
            <View style={styles.row}>
              <TouchableWithoutFeedback
                disabled={isSaving || !isValidUser()}
                onPress={_pickImage}
              >
                <View>
                  <View style={styles.profilePhoto}>
                    {avatar ? (
                      <Thumbnail source={{ uri: avatar }} large />
                    ) : (
                      <MaterialCommunityIcons
                        name="face-profile"
                        color="gray"
                        size={photoSize}
                      />
                    )}
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Text style={styles.buttonText}>Editar foto</Text>
                    <Entypo name="edit" style={{ marginLeft: 4 }} />
                  </View>
                </View>
              </TouchableWithoutFeedback>
              <View style={styles.readonlyFieldsContainer}>
                <View style={styles.readonlyField}>
                  <Text style={[styles.label, styles.readonlyFieldText]}>
                    Celular
                  </Text>
                  <Text style={styles.readonlyFieldText}>{phone}</Text>
                </View>
                <Button
                  small
                  block
                  borderRadius={10}
                  style={styles.button}
                  disabled={true}
                  onPress={() => {}}
                >
                  <Text style={styles.buttonText}>Cambiar contraseña</Text>
                </Button>
              </View>
            </View>
            <Form style={styles.form}>
              {commonFields.map(field => (
                <Field key={field.label} field={field} validity="partial" />
              ))}
              <Button
                block
                borderRadius={10}
                style={styles.blueButton}
                disabled={isSaving || !isValidUser()}
                onPress={onPressSaveProfile}
                color={'#0000FF'}
              >
                <Text style={styles.buttonText}>Guardar cambios</Text>
              </Button>
              <TouchableOpacity
                style={styles.rowCenter}
                onPress={() => setHasCar(!hasCar)}
              >
                <CheckBox
                  color={Colors.textGray}
                  checked={hasCar}
                  onPress={() => setHasCar(!hasCar)}
                />
                <Text style={styles.checkboxLabel}>Tengo Vehículo</Text>
              </TouchableOpacity>
              {hasCar ? (
                <>
                  <View style={styles.headerTextContainer}>
                    <Text style={styles.headerText}>Licencia de conducir</Text>
                  </View>
                  {hasCameraPermission && (
                    <CameraModal
                      closeCamera={closeCamera}
                      onGetSelfie={onTakePicture}
                      isCameraOn={isCameraOn}
                      destination={destination}
                      cameraType={Camera.Constants.Type.back}
                      text={getText(destination)}
                    />
                  )}
                  <PhotoTaker
                    openCamera={openCamera}
                    setImage={'licenseFront'}
                    selfie={licenseFront}
                    iconName="vcard-o"
                    iconType="FontAwesome"
                    size={60}
                    buttonText="Tomar Frente de Licencia"
                  />
                  <PhotoTaker
                    openCamera={openCamera}
                    setImage={'licenseBack'}
                    selfie={licenseBack}
                    iconName="vcard-o"
                    iconType="FontAwesome"
                    size={60}
                    buttonText="Tomar Atrás de Licencia"
                  />
                  <Button
                    block
                    borderRadius={10}
                    style={styles.blueButton}
                    disabled={isUploadingLicense || !frontSubmit || !backSubmit}
                    onPress={onPressSaveLicense}
                    color={'#0000FF'}
                  >
                    <Text style={styles.buttonText}>Solicitar revisión</Text>
                  </Button>
                  <View style={styles.headerTextContainer}>
                    <Text style={styles.headerText}>Datos Vehículo</Text>
                  </View>
                  {canSubmitCar ? (
                    <View style={styles.headerTextContainer}>
                      <Text style={styles.warning}>
                        Advertencia: los datos del vehículo no podrán ser
                        modificados una vez ingresados
                      </Text>
                    </View>
                  ) : (
                    <></>
                  )}
                  {carFields.map(field => (
                    <Field key={field.label} field={field} validity="partial" />
                  ))}
                  {canSubmitCar ? (
                    <Button
                      block
                      borderRadius={10}
                      style={styles.blueButton}
                      disabled={!canSubmitCar || !isValidCar()}
                      onPress={onPressSaveCar}
                      color={'#0000FF'}
                    >
                      <Text style={styles.buttonText}>Ingresar Vehículo</Text>
                    </Button>
                  ) : (
                    <></>
                  )}
                </>
              ) : (
                <></>
              )}
            </Form>
          </View>
          {hasCar && <View style={styles.artificialKeyboardPadding} />}
        </Content>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  )
}

EditProfileScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
    lastName: PropTypes.string.isRequired,
    phone: PropTypes.string.isRequired,
    userId: PropTypes.string.isRequired,
    token: PropTypes.string.isRequired,
    car: PropTypes.shape({
      plate: PropTypes.string,
      color: PropTypes.string,
      brand: PropTypes.string,
      model: PropTypes.string,
    }),
  }),
  updateUser: PropTypes.func.isRequired,
  signOut: PropTypes.func.isRequired,
}

const mapStateToProps = state => ({
  user: state.user,
})

const mapDispatchToProps = dispatch => ({
  updateUser: (authToken, data) => dispatch(updateUser(authToken, data)),
  uploadImage: base64string => dispatch(uploadImageUser(base64string)),
  signOut: () => dispatch(signoutUser()),
  getUserCar: (token, carId) => dispatch(getUserCar(token, carId)),
  createVehicle: (token, data) => dispatch(createVehicle(token, data)),
})

const photoSize = 96

const styles = StyleSheet.create({
  artificialKeyboardPadding: { height: 600 },
  blueButton: {
    marginBottom: 30,
    marginTop: 20,
  },
  button: {
    marginTop: 20,
  },
  buttonText: {
    fontSize: 14,
  },
  checkMark: {
    color: '#33C534',
  },
  checkboxLabel: {
    color: Colors.textGray,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 15,
  },
  flex1: {
    flex: 1,
  },
  form: {
    alignItems: 'center',
    height: 250,
    margin: 15,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    marginLeft: 5,
  },
  headerTextContainer: {
    alignSelf: 'flex-start',
    marginTop: 30,
  },
  input: {
    fontSize: 14,
    height: 40,
    width: Layout.window.width * 0.85,
  },
  item: {
    borderColor: 'black',
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  label: {
    color: '#8c8c8c',
    fontSize: 14,
  },
  logout: {
    marginRight: 8,
  },
  profilePhoto: {
    alignItems: 'center',
    borderColor: 'gray',
    borderRadius: photoSize / 2,
    borderWidth: 1,
    height: photoSize,
    justifyContent: 'center',
    marginHorizontal: 16,
    marginVertical: 16,
    width: photoSize,
  },
  readonlyField: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  readonlyFieldText: {
    fontSize: 14,
    paddingHorizontal: 8,
  },
  readonlyFieldsContainer: {
    marginTop: 20,
    paddingHorizontal: 12,
  },
  row: {
    flexDirection: 'row',
  },
  rowCenter: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  warning: {
    color: 'red',
    marginBottom: 10,
  },
})

const _SignOutC = props => (
  <TouchableOpacity
    onPress={() =>
      Alert.alert('Salir', '¿Deseas cerrar sesión?', [
        {
          text: 'Si',
          onPress: () => {
            AsyncStorage.removeItem('@userToken')
            AsyncStorage.removeItem('@userId')
            // eslint-disable-next-line react/prop-types
            props.navigation.navigate('Login')
            // eslint-disable-next-line react/prop-types
            props.signOut()
          },
        },
        { text: 'No', style: 'cancel' },
      ])
    }
  >
    <View style={styles.logout}>
      <Ionicons
        name={Platform.OS === 'ios' ? 'ios-log-out' : 'md-log-out'}
        size={25}
      />
    </View>
  </TouchableOpacity>
)

const SignOutC = connect(
  null,
  mapDispatchToProps
)(_SignOutC)

EditProfileScreen.navigationOptions = ({ navigation }) => ({
  title: 'Editar perfil',
  headerRight: <SignOutC navigation={navigation} />,
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withNavigation(EditProfileScreen))
