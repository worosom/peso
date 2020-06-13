/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
} from 'react-native';

import BackgroundGeolocation from "react-native-background-geolocation";

export default class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      active_geofence: 'None'
    }
  }
  componentDidMount() {
    ////
    // 1.    Wire up event-listeners
    //

    // This handler fires whenever bgGeo receives a location update.
    BackgroundGeolocation.onLocation(this.onLocation, this.onError);

    // This handler fires when movement states changes (stationary->moving; moving->stationary)
    BackgroundGeolocation.onMotionChange(this.onMotionChange);

    // This event fires when a change in motion activity is detected
    BackgroundGeolocation.onActivityChange(this.onActivityChange);

    // This event fires when the user toggles location-services authorization
    BackgroundGeolocation.onProviderChange(this.onProviderChange);

    BackgroundGeolocation.onGeofence((event) => this.onGeofence(event, this));

    ////
    // 2.    Execute #ready method (required)
    //
    BackgroundGeolocation.ready({
      // Geolocation Config
      desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
      distanceFilter: 10,
      // Activity Recognition
      stopTimeout: 1,
      // Application config
      debug: true, // <-- enable this hear sounds for background-geolocation life-cycle.
      logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
      stopOnTerminate: false,     // <-- Allow the background-service to continue tracking when user closes the app.
      startOnBoot: false,                // <-- Auto start tracking when device is powered-up.
      // HTTP / SQLite config
      url: 'http://yourserver.com/locations',
      batchSync: false,             // <-- [Default: false] Set true to sync locations to server in a single HTTP request.
      autoSync: false,                 // <-- [Default: true] Set true to sync each location to server as it arrives.
      headers: {                            // <-- Optional HTTP headers
        "X-FOO": "bar"
      },
      params: {                             // <-- Optional HTTP params
        "auth_token": "maybe_your_server_authenticates_via_token_YES?"
      }
    }, (state) => {
      console.log("- BackgroundGeolocation is configured and ready: ", state.enabled);
      this.setupGeofences();

      if (!state.enabled) {
        ////
        // 3. Start tracking!
        //
        BackgroundGeolocation.start(function() {
          console.log("- Start success");
        });
      }
    });
  }

  setupGeofences() {
    BackgroundGeolocation.addGeofences([
      {
        identifier: "0",
        radius: 200,
        latitude: 52.498187,
        longitude: 13.386352,
        notifyOnEntry: true,
      },
      {
        identifier: "2",
        radius: 200,
        latitude: 52.494036,
        longitude: 13.380801,
        notifyOnEntry: true,
      },
      {
        identifier: "1",
        radius: 200,
        latitude: 52.498702,
        longitude: 13.380206,
        notifyOnEntry: true,
      },
      {
        identifier: "studio_front",
        radius: 20,
        latitude: 52.498294,
        longitude: 13.386076,
        notifyOnEntry: true,
        notifyOnExit: true
      },
      {
        identifier: "studio_back",
        radius: 20,
        latitude: 52.497639, 
        longitude: 13.386440,
        notifyOnEntry: true,
        notifyOnExit: true
      }
    ]).then(success => console.log('Added Geofences')).catch(err => console.error(err))
  }

  // You must remove listeners when your component unmounts
  componentWillUnmount() {
    BackgroundGeolocation.removeListeners();
  }
  onLocation(location) {
    console.log('[location] -', location);
  }
  onError(error) {
    console.warn('[location] ERROR -', error);
  }
  onActivityChange(event) {
    console.log('[activitychange] -', event);    // eg: 'on_foot', 'still', 'in_vehicle'
  }
  onProviderChange(provider) {
    console.log('[providerchange] -', provider.enabled, provider.status);
  }
  onMotionChange(event) {
    console.log('[motionchange] -', event.isMoving, event.location);
  }
  onGeofence(geofence, self) {
    console.log("[geofence] ", geofence.identifier, geofence.action);
    self.state.active_geofence = geofence.identifier
    self.forceUpdate()
  }
  render() {
    const active = this.state.active_geofence
    return (
      <>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView>
          <ScrollView
            contentInsetAdjustmentBehavior="automatic">
            <View>
              <Text>{active}</Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </>
    );
  }
};
