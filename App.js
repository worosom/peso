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
  Button,
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
      data: []
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
      
      fetch('https://pelerinage-sonore.net/peso.json')
      .then(response => response.json())
      .then(data => {
        console.log(JSON.stringify(data.geofence, undefined, 2))
        data = data.geofence.map(g => {
          return {
            ...g,
            paused: true,
            seek: 0,
            volume: 1,
            notifyOnEntry: true,
            notifyOnExit: true
          }
        })
        this.state.data = data
        console.log(this.state.data)
        this.setupGeofences();
      })
      .catch(error => console.error(error));


      if (!state.enabled) {
        BackgroundGeolocation.start(function() {
          console.log("[Start BackgroundGeolocation]");
        });
      }
    });
  }

  setupGeofences() {
    BackgroundGeolocation.addGeofences(this.state.data)
      .then(success => console.log('Added Geofences'))
      .catch(err => console.error(err))
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
        this.state.data = this.state.data.map((g, key) => {
          if (key == this.state.active_geofence) {
            return {
              ...g,
              paused: false
            }
          }
          return g
        })

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

      this.state.data = this.state.data.map((g, key) => {
        if (key == this.state.active_geofence) {
          return {
            ...g,
            volume: t
          }
        }
        return g
      })

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

        this.state.data = this.state.data.map((g, key) => {
          if (key == this.state.active_geofence) {
            return {
              ...g,
              paused: true
            }
          }
          return g
        })
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
              <Button onPress={() => BackgroundGeolocation.stop(() => this.fadeOut()) } title="Stop"/>
              <Button onPress={BackgroundGeolocation.start} title="Start"/>
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
