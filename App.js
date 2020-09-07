import React from 'react'
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  Button,
  StatusBar
} from 'react-native';
import BackgroundGeolocation from "react-native-background-geolocation";
import {
  Player,
  Recorder,
  MediaStates
} from '@react-native-community/audio-toolkit';
import MapView from 'react-native-maps';
import { Marker, Circle } from 'react-native-maps';
import { config } from './src/BackgroundGeolocation.js'
import { configMap } from './src/Map.js'

function onGeofence(geofence, self) {
  console.log('[geofence]', geofence.action, geofence.identifier);

  if (Object.keys(self.state.data).indexOf(geofence.identifier) < 0) {
    return
  }
  if(self.state.isFading){
    cancelAnimationFrame(self.state.requestId)
  }

  if ('ENTER' == geofence.action) {
    self.state.mapRegion = {
      ...self.state.mapRegion,
      ...geofence
    }
    self.activeGeofence = geofence.identifier
    self.fadeIn()
  } else {
    self.fadeOut()
  }
}

function onLocation(event, self) {
  console.log('OnLocation')
  self.state.userCoordinate = event.coords
  self.state.mapRegion = {
    ...self.state.mapRegion,
    ...self.state.userCoordinate
  }
}

export default class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      activeGeofence: null,
      rewindGap: 7,
      isFading: false,
      requestId: null,
      data: {},
      playbackOptions: {
        continuesToPlayInBackground: true,
        autoDestroy: false,
        mixWithOthers: true
      },
      backgroundGeolocationRunning: false,
      downloadRunning: false,
      userCoordinate: null,
      mapRegion: {
        latitude: 52.516360,
        longitude: 13.344096,
        latitudeDelta: 0.0092,
        longitudeDelta: 0.0042
      },
      satteliteView: false,
      idle_player: null,
      player: null
    }
  }
  componentDidMount() {
    BackgroundGeolocation.onLocation((event) => onLocation(event, this), console.log)

    // BackgroundGeolocation.onMotionChange(this.onMotionChange);
    // BackgroundGeolocation.onActivityChange(this.onActivityChange);
    // BackgroundGeolocation.onProviderChange(this.onProviderChange);

    BackgroundGeolocation.onGeofence((event) => onGeofence(event, this));
    this.state.idle_player = new Player('https://pelerinage-sonore.net/media/peso/7.mp3', this.state.playbackOptions)
    this.state.idle_player.looping = true
    this.state.idle_player.volume = .4
    this.state.idle_player.play()

    BackgroundGeolocation.ready(config, (state) => {
      console.log("[BackgroundGeolocation is configured and ready]");
      this.state.backgroundGeolocationRunning = true

      fetch('https://pelerinage-sonore.net/peso.json')
        .then(response => response.json())
        .then(data => {
          this.state.data = {}
          data.geofence.map((g, i) => {
            this.state.data[g.identifier] = {
              ...g,
              notifyOnEntry: true,
              notifyOnExit: true,
            }
          })
          // console.log(this.data)
          this.setupGeofences()
        })
        .catch(error => console.error(error));


      if (!state.enabled) {
        BackgroundGeolocation.start(function() {
          console.log("[Start BackgroundGeolocation]");
        });
      }
    });
  }
  componentWillUnmount() {
    BackgroundGeolocation.removeGeofences()
    this.stopGeolocation()
    this.state.idle_player.stop(_ => this.state.idle_player.destroy())
    if (this.state.player) {
      this.state.player.stop(_ => this.state.player.destroy())
    }
  }
  setupGeofences() {
    BackgroundGeolocation.addGeofences(Object.values(this.state.data))
      .then(success => console.log('Added Geofences'))
      .catch(err => console.error(err))
  }
  fadeIn() {
    let duration = 3000,
      end = new Date().getTime() + duration
    if (this.state.idle_player) {
      this.state.idle_player.pause()
    }
    if (this.state.player) {
      this.state.player.stop(_ => {
        this.state.player.destroy(_ => {this.state.player = null; this.fadeIn()})
      })
      return
    }
    this.state.player = new Player(this.state.uri, this.state.playbackOptions)
    this.state.player.volume = 0
    this.state.player.play(_ => {
      this.state.isFading = true
      this.doFadeIn(this, duration, end)
    })
  }
  doFadeIn(self, duration, end) {
    const fn = () => {
      let current = new Date().getTime(),
        remaining = end - current,
        t = 1 - remaining / duration

      if(t >= 1){
        self.state.isFading = false
        return
      }

      self.state.player.volume = t

      self.doFadeIn(self, duration, end)
    }
    self.state.requestId = requestAnimationFrame(fn)
  }
  fadeOut() {
    let duration = 5000,
      end = new Date().getTime() + duration

    this.state.isFading = true

    this.doFadeOut(this, duration, end)
  }
  doFadeOut(self, duration, end) {
    const fn = () => {
      let current = new Date().getTime(),
        remaining = end - current,
        t = remaining / duration

      if (t <= 0) {
        self.state.isFading = false

        self.state.idle_player.seek(0, _ => {
          self.state.idle_player.looping = true
          self.state.idle_player.play(_ => {
            self.state.player.pause(_ => {
              self.state.activeGeofence = null
            })
          })
        })
        return
      }
      self.state.player.volume = t

      self.doFadeOut(self, duration, end)
    }

    this.state.requestId = requestAnimationFrame(fn)
  }
  startGeolocation() {
    BackgroundGeolocation.start(() => {
      this.state.backgroundGeolocationRunning = true
    })
    this.state.idle_player.play()
  }
  stopGeolocation() {
    BackgroundGeolocation.stop(() => {
      this.state.backgroundGeolocationRunning = false
      if (this.state.idle_player) {
        this.state.idle_player.pause()
      }
      if (this.state.player) {
        this.fadeOut()
      }
    })
  }
  offlineStorage() {
    if (this.state.downloadRunning) {
      //
    } else {
      //
    }
  }
  toggleGeolocation() {
    if (this.state.backgroundGeolocationRunning) {
      this.stopGeolocation()
    } else {
      this.startGeolocation()
    }
  }
  toggleSattelite() {
    this.state.satteliteView = !this.state.satteliteView
  }
  markerColor(identifier) {
    if (identifier == this.state.activeGeofence) {
      return 'rgba(255, 0, 0, .5)'
    }
    return 'rgba(225, 225, 225, .7)'
  }
  geofenceRadius(radius) {
    return radius / 2
  }
  getMapStyle() {
    return configMap.mapStyle
  }
  activeGeofenceTitle() {
    if (this.state.activeGeofence) {
      return this.state.data[this.state.activeGeofence].title
    }
  }
  uri() {
    return this.state.data[this.state.activeGeofence].uri
  }
  markerColors() {
    const colors = {}
    Object.keys(this.state.data).map(identifier => {
      colors[identifier] = this.markerColor(identifier)
    })
    return colors
  }
  render() {
    console.log("[render]")

    return (
      <>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView>
          <ScrollView>
            <View style={styles.container}>
              <Text>peso</Text>
              <Text>{this.activeGeofenceTitle()}</Text>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: 37.78825,
                  longitude: -122.4324,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                }}
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    height: '100%'
  },
  map: {
    width: '100%',
    height: '100%'
  }
});
