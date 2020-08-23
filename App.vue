<template>
  <view class="container">
  <view class="switch">
  <text class="switch__label">
  Geolocation {{backgroundGeolocationRunning ? 'on' : 'off'}}
  </text>
  <switch
    class="switch__switch"
    :on-value-change="toggleGeolocation"
    :value="backgroundGeolocationRunning">
  </switch>
  </view>
  <view class="switch">
  <text class="switch__label">
  Sattelite view
  </text>
  <switch
    class="switch__switch"
    :on-value-change="toggleSattelite"
    :value="satteliteView">
  </switch>
  </view>
  <view class="info">
  <text>
  {{activeGeofenceTitle}}
  </text>
  </view>
  <MapView
    ref="map"
    class="map"
    :region="mapRegion"
    :mapType="satteliteView ? 'hybrid' : 'standard'"
    showsUserLocation
    showsMyLocationButton>
  <Circle
    v-for="geofence, i in data"
    :ref="`circle-${i}`"
    :center="geofence"
    :radius="geofence.radius"
    :fillColor="markerColors[i]"
    :zIndex="3"
    :strokeWidth="1"
    strokeColor="red"
    />
  </MapView>
  </view>
</template>

<script>
import BackgroundGeolocation from "react-native-background-geolocation";
import {
  Player,
  Recorder,
  MediaStates
} from '@react-native-community/audio-toolkit';
import MapView from 'react-native-maps';
import { Marker, Circle } from 'react-native-maps';
import { config } from './src/BackgroundGeolocation.js'


export default {
  components: {MapView, Marker, Circle},
  data() {
    return {
      activeGeofence: null,
      rewindGap: 7,
      isFading: false,
      requestId: null,
      data: [],
      playbackOptions: {
        continuesToPlayInBackground: true,
        autoDestroy: false,
        mixWithOthers: true
      },
      backgroundGeolocationRunning: false,
      userCoordinate: null,
      mapRegion: {
        latitude: 52.516360,
        longitude: 13.344096,
        latitudeDelta: 0.0092,
        longitudeDelta: 0.0042
      },
      satteliteView: false
    }
  },
  computed: {
    activeGeofenceTitle() {
      if (this.activeGeofence) {
        return this.data[this.activeGeofence].title
      }
    },
    uri() {
      return this.data[this.activeGeofence].uri
    },
    markerColors() {
      return this.data.map((geofence, i) => {
        if (geofence.identifier == this.activeGeofence) {
          return 'rgba(33, 33, 255, .5)'
        }
        return 'rgba(255, 0, 0, .5)'
      })
    }
  },
  mounted() {
    BackgroundGeolocation.onLocation(this.onLocation, this.onError)

    // BackgroundGeolocation.onMotionChange(this.onMotionChange);
    // BackgroundGeolocation.onActivityChange(this.onActivityChange);
    // BackgroundGeolocation.onProviderChange(this.onProviderChange);

    BackgroundGeolocation.onGeofence((event) => this.onGeofence(event, this));
    this.idle_player = new Player('https://pelerinage-sonore.net/media/peso/7.mp3', this.playbackOptions)
    this.idle_player.looping = true
    this.idle_player.volume = .4
    this.idle_player.play()
  
    this.player = null

    BackgroundGeolocation.ready(config, (state) => {
      console.log("[BackgroundGeolocation is configured and ready]");
      this.backgroundGeolocationRunning = true

      fetch('https://pelerinage-sonore.net/peso.json')
        .then(response => response.json())
        .then(data => {
          data = data.geofence.map(g => {
            return {
              ...g,
              notifyOnEntry: true,
              notifyOnExit: true,
            }
          })
          this.data = data
          // console.log(this.data)
          console.log(this.players)
          this.setupGeofences()
        })
        .catch(error => console.error(error));


      if (!state.enabled) {
        BackgroundGeolocation.start(function() {
          console.log("[Start BackgroundGeolocation]");
        });
      }
    });
  },
  beforeDestroy() {
    this.idle_player.destroy()
    if (this.player) {
      this.player.destroy()
    }
  },
  methods: {
    setupGeofences() {
      BackgroundGeolocation.addGeofences(this.data)
        .then(success => console.log('Added Geofences'))
        .catch(err => console.error(err))
    },
    onGeofence(geofence, self) {
      console.log('[geofence]', geofence.action, geofence.identifier);

      if (Object.keys(self.data).indexOf(geofence.identifier) < 0) {
        return
      }
      if(this.isFading){
        cancelAnimationFrame(this.requestId)
      }

      if ('ENTER' == geofence.action) {
        this.mapRegion = {
          ...this.mapRegion,
          ...geofence
        }
        self.activeGeofence = geofence.identifier
        self.fadeIn()
      } else {
        self.fadeOut()
      }
    },
    onLocation(event) {
      this.userCoordinate = event.coords
      this.mapRegion = {
        ...this.mapRegion,
        ...this.userCoordinate
      }
    },
    fadeIn() {
      let duration = 3000,
        end = new Date().getTime() + duration
      this.idle_player.stop()
      if (this.player) {
        this.player.destroy()
      }
      this.player = new Player(this.uri, this.playbackOptions)
      this.player.volume = 0
      this.player.play(_ => {
        this.isFading = true
        this.doFadeIn(duration, end)
      })
    },
    doFadeIn(duration, end) {
      const fn = () => {
        let current = new Date().getTime(),
          remaining = end - current,
          t = 1 - remaining / duration

        if(t >= 1){
          this.isFading = false
          return
        }

        this.player.volume = t

        this.doFadeIn(duration, end)
      }
      this.requestId = requestAnimationFrame(fn)
    },
    fadeOut() {
      let duration = 5000,
        end = new Date().getTime() + duration

      this.isFading = true

      this.doFadeOut(duration, end)
    },
    doFadeOut (duration, end) {
      const fn = () => {
        let current = new Date().getTime(),
          remaining = end - current,
          t = remaining / duration

        if (t <= 0) {
          this.isFading = false

          this.player.stop()
          this.activeGeofence = null
          return
        }
        this.player.volume = t

        this.doFadeOut(duration, end)
      }

      this.requestId = requestAnimationFrame(fn)
    },
    startGeolocation() {
      BackgroundGeolocation.start(() => {
        this.backgroundGeolocationRunning = true
      })
      this.idle_player.play()
    },
    stopGeolocation() {
      BackgroundGeolocation.stop(() => {
        this.backgroundGeolocationRunning = false
      })
      this.idle_player.pause()
      if (this.player) {
        this.player.stop()
      }
    },
    toggleGeolocation() {
      if (this.backgroundGeolocationRunning) {
        this.stopGeolocation()
      } else {
        this.startGeolocation()
      }
    },
    toggleSattelite() {
      this.satteliteView = !this.satteliteView
    }
  }
}
</script>

<style>
.container {
  padding-top: 40;
  background-color: white;
  align-items: center;
  justify-content: center;
  flex: 1;
}

.switch {
  flex-direction: row;
}

.switch__label {
  text-align: right;
  padding: 2;
}

.map {
  width: 100%;
  height: 100%;
}
</style>
