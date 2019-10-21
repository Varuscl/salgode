import React, { Component } from 'react'
import { ScrollView, StyleSheet, View, Text } from 'react-native'
import { connect } from 'react-redux'
import { loginUser } from '../redux/actions/user'
import { DatePicker, Button } from 'native-base'
import CardInput from '../components/CardInput'
import CardInputSelector from '../components/CardInputSelector'
import { setStartStop, setEndStop, setStops } from '../redux/actions/createtrip'

class CreateTripScreen extends Component {
  changeAddStopsScreen = () => {
    if (startStop && endStop){
      navigation.navigate('AddStopsScreen')
    } else {
      // TODO: show alert
      console.log("show alert, falta agregar inicio y fin")
    }
  }
  render() {
    const { navigation } = this.props
    const { startStop, endStop } = this.state
    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
        >
          <View style={styles.group}>
            <CardInputSelector
              text="#Donde"
              onSelect={item => this.props.setStartStop(item.parada)}
            />

            <CardInputSelector
              text="#A"
              onSelect={item => this.props.setEndStop(item.parada)}
            />
          </View>

          <View style={styles.group}>
            <CardInput
              text="Día"
              input={
                <DatePicker
                  defaultDate={new Date(2018, 4, 4)}
                  minimumDate={new Date(2018, 1, 1)}
                  locale={'es'}
                  modalTransparent={false}
                  animationType={'fade'}
                  androidMode={'default'}
                  placeHolderText="Select date"
                  textStyle={{ color: 'green' }}
                  placeHolderTextStyle={{ color: '#d3d3d3' }}
                  //   onDateChange={this.setDate}
                  disabled={false}
                />
              }
            />

            <CardInput
              text="Hora"
              input={
                <DatePicker
                  defaultDate={new Date(2018, 4, 4)}
                  minimumDate={new Date(2018, 1, 1)}
                  locale={'es'}
                  modalTransparent={false}
                  animationType={'fade'}
                  androidMode={'default'}
                  placeHolderText="Select date"
                  textStyle={{ color: 'green' }}
                  placeHolderTextStyle={{ color: '#d3d3d3' }}
                  //   onDateChange={this.setDate}
                  disabled={false}
                />
              }
            />
          </View>
        </ScrollView>

        <View>
          <Button
            block
            style={styles.addButton}
            disabled={startStop && endStop}
            onPress={this.changeAddStopsScreen}
          >
            <Text>Agrega una Parada</Text>
          </Button>
        </View>
      </View>
    )
  }
}

CreateTripScreen.navigationOptions = {
  header: null,
}

const styles = StyleSheet.create({
  addButton: {
    marginBottom: 25,
    marginLeft: 15,
    marginRight: 15,
    marginTop: 10,
  },
  container: {
    backgroundColor: '#fff',
    flex: 1,
  },

  contentContainer: {
    paddingTop: 30,
  },
  group: {
    marginBottom: 20,
    marginLeft: 20,
    marginRight: 20,
    marginTop: 20,
  },
})

const mapStateToProps = ({user, createTrip}) => {
  return {
    user: user,
    startStop: createTrip.startStop,
    endStop: createTrip.endStop,
  }
}

const mapDispatchToProps = {
  loginUser,
  setStartStop,
  setEndStop,
  setStops,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CreateTripScreen)
