/**
 * Pèlerinage Sonore
 * … it will be great.
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

  player;

  constructor(props) {
    super(props)
    this.state = {
      title: "Pèlerinage Sonore",
      active_geofence: null,
      rewindGap: 7,
      isFading: false,
      requestId: null, 
      data: {
        '0': {
          'uri': 'http://dispatchwork.info/peso/0.mp3',
          'title': 't10',
          'paused': true,
          'seek': 0,
          'volume': 1
        },
        '1': {
          'uri': 'http://dispatchwork.info/peso/1.mp3',
          'title': 'spektrum',
          'paused': true,
          'seek': 0,
          'volume': 1
        },
        '2': {
          'uri': 'http://dispatchwork.info/peso/2.mp3',
          'title': 'hornstr',
          'paused': true,
          'seek': 0,
          'volume': 1
        },
        '3': {
          'uri': 'http://dispatchwork.info/peso/3.mp3',
          'title': 'wartenburg',
          'paused': true,
          'seek': 0,
          'volume': 1
        },
        '4': {
          'uri': 'http://dispatchwork.info/peso/4.mp3',
          'title': 'gretchen',
          'paused': true,
          'seek': 0,
          'volume': 1
        },
        '5': {
          'uri': 'http://dispatchwork.info/peso/5.mp3',
          'title': 'obentraut',
          'paused': true,
          'seek': 0,
          'volume': 1
        },
        '6': {
          'uri': 'http://dispatchwork.info/peso/6.mp3',
          'title': 'ruhldorfer',
          'paused': true,
          'seek': 0,
          'volume': 1
        },
        '7': {
          'uri': 'http://dispatchwork.info/peso/4.mp3',
          'title': 'Maison Grill',
          'paused': true,
          'seek': 0,
          'volume': 1
        },
        '8': {
          'uri': 'http://dispatchwork.info/peso/7.mp3',
          'title': 'Conseil',
          'paused': true,
          'seek': 0,
          'volume': 1
        },
        '9': {
          'uri': 'http://dispatchwork.info/peso/9.mp3',
          'title': 'Rue de l\'Instruction 16-2',
          'paused': true,
          'seek': 0,
          'volume': 1
        }
      }
    }
  }
  componentDidMount() {
    BackgroundGeolocation.onLocation(this.onLocation, this.onError);
    
    BackgroundGeolocation.onMotionChange(this.onMotionChange);
    BackgroundGeolocation.onActivityChange(this.onActivityChange);
    BackgroundGeolocation.onProviderChange(this.onProviderChange);

    BackgroundGeolocation.onGeofence((event) => this.onGeofence(event, this));

    BackgroundGeolocation.ready({
      desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
      distanceFilter: 10,
      stopTimeout: 1,
      debug: false, // <-- enable this hear sounds for background-geolocation life-cycle.
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
      console.log("[BackgroundGeolocation is configured and ready]", state.enabled);
      
      fetch('https://dispatchwork.info/peso/peso-data.json')
      .then(response => response.json())
      .then(data => {
        console.log(JSON.stringify(data.geofence, undefined, 2))
        console.log(data.geofence)
      })
      .catch(error => console.error(error));

      this.setupGeofences();

      if (!state.enabled) {
        BackgroundGeolocation.start(function() {
          console.log("[Start BackgroundGeolocation]");
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
        identifier: "7", // johnny 1
        radius: 50,
        latitude: 50.838116, 
        longitude: 4.328454,
        notifyOnEntry: true,
        notifyOnExit: true
      },
      {
        identifier: "8", // johnny 2
        radius: 50,
        latitude: 50.839077,
        longitude: 4.329575,
        notifyOnEntry: true,
        notifyOnExit: true
      },
      {
        identifier: "9", // johnny 3
        radius: 50,
        latitude: 50.839294,
        longitude: 4.326032,
        notifyOnEntry: true,
        notifyOnExit: true
      },
    ]).then(success => console.log('Added Geofences')).catch(err => console.error(err))
  }
  componentWillUnmount() {
    BackgroundGeolocation.removeListeners();
  }
  onLocation(location) {
    console.log('[location]', location);
  }
  onError(error) {
    console.warn('[location] ERROR', error);
  }
  onActivityChange(event) {
    console.log('[activitychange]', event);    // eg: 'on_foot', 'still', 'in_vehicle'
  }
  onProviderChange(provider) {
    console.log('[providerchange]', provider);
  }
  onMotionChange(event) {
    console.log('[motionchange]', event.isMoving, event.location);
  }
  onGeofence(geofence, self) {
    console.log('[geofence]', geofence.action, geofence.identifier);

    if (Object.keys(this.state.data).indexOf(geofence.identifier) < 0) {
      return
    }
    if(this.state.isFading){
      cancelAnimationFrame(this.state.requestId)
    }

    if ('ENTER' == geofence.action) {
      self.state.active_geofence = geofence.identifier
      self.state.data[geofence.identifier].paused = false

      this.fadeIn()
    } else {
      this.fadeOut()
    }
  }
  getVideoProps() {
    const active = this.state.data[this.state.active_geofence]
    if (active) {
      return active
    } else {
      return {
        identifier: "-1",
        title: 'None',
        uri: '.'
      }
    }
  }
  onVideoStart(data) {
    let activeSeek = this.state.data[this.state.active_geofence].seek,
        rewindSeek = (activeSeek >= this.state.rewindGap) ? activeSeek-this.state.rewindGap : data.currentTime
    
    this.player.seek(rewindSeek)
  }
  onVideoProgress(data) {
    if (Object.keys(this.state.data).indexOf(this.state.active_geofence) < 0) {
      return
    }
    
    this.state.data[this.state.active_geofence].seek = data.currentTime
  }
  onVideoEnd(data) {
    this.player.seek(0)
  }
  fadeIn() {
    let duration = 3000,
        end = new Date().getTime() + duration
    
    this.state.isFading = true

    this.doFadeIn(duration, end)
  }

  doFadeIn(duration, end) {
    const fn = () => {
      let current = new Date().getTime(),
          remaining = end - current,
          t = 1 - remaining / duration

          if(t >= 1){
            this.state.isFading = false
            return
          }

          this.state.data[this.state.active_geofence].volume = t

          this.forceUpdate()
          this.doFadeIn(duration, end)
    }
    this.state.requestId = requestAnimationFrame(fn)
  }

  fadeOut() {
    let duration = 5000,
        end = new Date().getTime() + duration

    this.state.isFading = true

    this.doFadeOut(duration, end)
  }

  doFadeOut (duration, end) {
    const fn = () => {
      let current = new Date().getTime(),
          remaining = end - current,
          t = remaining / duration

      if (t <= 0) {
        this.state.isFading = false
        this.state.data[this.state.active_geofence].paused = true
        this.state.active_geofence = null
        this.forceUpdate()
        return
      }
      this.state.data[this.state.active_geofence].volume = t

      this.forceUpdate()
      this.doFadeOut (duration, end)
    }

    this.state.requestId = requestAnimationFrame(fn)
  }

  render() {
    const active = this.getVideoProps()
    console.log("[render]", active)

    return (
      <>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView>
          <ScrollView>
            <View>
              <Text>{active.title}</Text>

              <Video 
                source={{uri: active.uri}}
                audioOnly={true}
                controls={true}
                playInBackground={true}
                playWhenInactive={true}
                paused={active.paused}
                volume={active.volume}
                ref={ref=>{this.player=ref}}
                onLoad={this.onVideoStart.bind(this)}
                onProgress={this.onVideoProgress.bind(this)}
                onEnd={this.onVideoEnd.bind(this)}
                />
            </View>
          </ScrollView>
        </SafeAreaView>
      </>
    );
  }
};
