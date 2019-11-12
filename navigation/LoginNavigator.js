import { createStackNavigator } from 'react-navigation'

import { LoginScreen, RecoverPasswordScreen, SignupScreen } from '../screens'
import ImageSignupForm from '../components/Login/ImageSignupForm'
import TermScreen from '../screens/TermScreen'
import PrivacyScreen from '../screens/PrivacyScreen'

export default createStackNavigator(
  {
    Login: LoginScreen,
    Signup: SignupScreen,
    SignupImages: ImageSignupForm,
    RecoverPassword: RecoverPasswordScreen,
    Terms: TermScreen,
    Privacy: PrivacyScreen,
  },
  {
    navigationOptions: {
      header: null,
    },
  }
)
