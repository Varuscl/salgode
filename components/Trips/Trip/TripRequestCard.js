/* eslint-disable react-native/no-inline-styles */
import React, { Component } from 'react'
import { StyleSheet, Platform, Linking } from 'react-native'
import { Card, View, Text, Button, CardItem } from 'native-base'
import Location from './Location'
import PropTypes from 'prop-types'
import Colors from '../../../constants/Colors'
import { Ionicons } from '@expo/vector-icons'

export default class TripRequestCard extends Component {
  constructor(props) {
    super(props)
    this.state = {
      passenger: null,
    }
    this.handleChangeStatus = this.handleChangeStatus.bind(this)
  }

  componentDidMount() {
    this.setState({
      passenger: this.props.passenger,
    })
  }

  dialCall(phoneNumber) {
    let link = ''
    if (Platform.OS === 'android') {
      link = `tel:${phoneNumber}`
    } else {
      link = `telprompt:${phoneNumber}`
    }
    Linking.openURL(link)
  }

  handleChangeStatus(status) {
    this.setState(prevState => {
      const passenger = prevState.passenger
      passenger.status = status
      return { passenger }
    })
    // TODO: connect to server
    // axios.fetch(api, status) or something like that :)
  }

  render() {
    return this.state.passenger != null ? (
      <Card style={styles.container}>
        <CardItem>
          <View style={styles.user}>
            <Ionicons
              name={Platform.OS === 'ios' ? 'ios-contact' : 'md-contact'}
              size={40}
            />
            <Text style={styles.userText}>{this.state.passenger.name}</Text>
          </View>
        </CardItem>

        <CardItem style={styles.locationContainer}>
          <Location color={'red'} location={this.state.passenger.start} />
          <Location
            color={Colors.tintColor}
            location={this.state.passenger.finish}
          />
        </CardItem>

        {this.state.passenger.status === 'pending' && (
          <CardItem style={styles.buttonsContainer}>
            <Button
              style={{ ...styles.buttonTrip, backgroundColor: '#0000FF' }}
              onPress={() => this.handleChangeStatus('accepted')}
            >
              <Text
                style={{
                  color: 'white',
                  fontSize: 15,
                  fontWeight: '700',
                  alignSelf: 'center',
                }}
              >
                Aceptar
              </Text>
            </Button>
            <Button
              bordered
              style={{ ...styles.buttonTrip, borderColor: '#0000FF' }}
              onPress={() => this.handleChangeStatus('rejected')}
            >
              <Text
                style={{
                  color: '#0000FF',
                  fontSize: 15,
                  fontWeight: '700',
                  alignSelf: 'center',
                }}
              >
                Rechazar
              </Text>
            </Button>
          </CardItem>
        )}

        {this.state.passenger.status === 'accepted' && (
          <View style={styles.buttonsContainer}>
            <Button
              style={{ ...styles.buttonTrip, backgroundColor: 'green' }}
              onPress={() => this.dialCall(this.state.passenger.phoneNumber)}
            >
              <Text
                style={{
                  color: 'white',
                  fontSize: 15,
                  fontWeight: '700',
                  alignSelf: 'center',
                }}
              >
                Contactar
              </Text>
            </Button>
          </View>
        )}

        {this.state.passenger.status === 'rejected' && (
          <View style={styles.buttonsContainer}>
            <Button style={{ ...styles.buttonTrip, backgroundColor: 'red' }}>
              <Text
                style={{
                  color: 'white',
                  fontSize: 15,
                  fontWeight: '700',
                  alignSelf: 'center',
                }}
              >
                Rechazado
              </Text>
            </Button>
          </View>
        )}
      </Card>
    ) : null
  }
}

TripRequestCard.propTypes = {
  passenger: PropTypes.object.isRequired,
}

const styles = StyleSheet.create({
  buttonTrip: {
    marginHorizontal: 10,
    textAlign: 'center',
  },
  buttonsContainer: {
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
  },
  container: {
    alignItems: 'flex-start',
    borderRadius: 20,
    flexDirection: 'column',
    padding: 15,
  },
  locationContainer: {
    alignItems: 'flex-start',
    flexDirection: 'column',
  },
  user: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  userText: {
    fontSize: 17,
    marginLeft: 15,
  },
})
