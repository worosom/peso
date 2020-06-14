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
import Video from 'react-native-video';


export default class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      active_geofence: null,
      data: {
        '0': {
          'uri': 'http://dispatchwork.info/peso/0.mp3',
          'title': 't10',
          'paused': true
        },
        '1': {
          'uri': 'http://dispatchwork.info/peso/1.mp3',
          'title': 'spektrum',
          'paused': true
        },
        '2': {
          'uri': 'http://dispatchwork.info/peso/2.mp3',
          'title': 'hornstr',
          'paused': true
        },
        '3': {
          'uri': 'http://dispatchwork.info/peso/3.mp3',
          'title': 'wartenburg',
          'paused': true
        },
        '4': {
          'uri': 'http://dispatchwork.info/peso/4.mp3',
          'title': 'gretchen',
          'paused': true
        },
        '5': {
          'uri': 'http://dispatchwork.info/peso/5.mp3',
          'title': 'obentraut',
          'paused': true
        },
        '6': {
          'uri': 'http://dispatchwork.info/peso/6.mp3',
          'title': 'ruhldorfer',
          'paused': true
        },
        '7': {
          'uri': 'http://dispatchwork.info/peso/7.mp3',
          'title': 'hasenheide',
          'paused': true
        }
      }
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
      startOnBoot: true,                // <-- Auto start tracking when device is powered-up.
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
        identifier: "0", // atelier
        radius: 50,
        latitude: 52.498187,
        longitude: 13.386352,
        notifyOnEntry: true,
        notifyOnExit: true
      },
      {
        identifier: "1", // spektrum
        radius: 50,
        latitude: 52.498702,
        longitude: 13.380206,
        notifyOnEntry: true,
        notifyOnExit: true
      },
      {
        identifier: "2", // rose
        radius: 50,
        latitude: 52.494036,
        longitude: 13.380801,
        notifyOnEntry: true,
        notifyOnExit: true
      },
      {
        identifier: "3", // grossbeerenstr
        radius: 50,
        latitude: 52.496129,
        longitude: 13.384344,
        notifyOnEntry: true,
        notifyOnExit: true
      },
      {
        identifier: "4", // gretchen
        radius: 50,
        latitude: 52.496321,
        longitude: 13.387177,
        notifyOnEntry: true,
        notifyOnExit: true
      },
      {
        identifier: "5", // obentraut
        radius: 50,
        latitude: 52.497328,
        longitude: 13.379923,
        notifyOnEntry: true,
        notifyOnExit: true
      },
      {
        identifier: "6", // ruhldorfer
        radius: 50,
        latitude: 52.497594,
        longitude: 13.388207,
        notifyOnEntry: true,
        notifyOnExit: true
      },
      {
        identifier: "7", // hasenheide
        radius: 50,
        latitude: 52.487623,
        longitude: 13.414109,
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
    if (Object.keys(this.state.data).indexOf(geofence.identifier) < 0) {
      return
    }
    if ('ENTER' == geofence.action) {
      self.state.active_geofence = geofence.identifier
      self.state.data[geofence.identifier].paused = false;
    } else {
      self.state.active_geofence = null
      self.state.data[geofence.identifier].paused = true;
    }
    self.forceUpdate()
  }
  getVideoProps() {
    const active = this.state.data[this.state.active_geofence]
    if (active) {
      return active
    } else {
      return {
        identifier: "-1",
        title: 'None'
      }
    }
  }
  render() {
    const active = this.getVideoProps()
    console.log(active)
    return (
      <>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView>
          <ScrollView>
            <View>
              <Text>{active.title}</Text>
              <Video source={{uri: active.uri}}   // Can be a URL or a local file.
                audioOnly={true}
                controls={true}
                playInBackground={true}
                paused={active.paused}
                ref={(ref) => {
                  this.player = ref
                }} />
            </View>
          </ScrollView>
        </SafeAreaView>
      </>
    );
  }
};
