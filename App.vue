<template>
  <view class="container">
    <touchable-opacity
      :on-press="toggleGeolocation"
      class="switch">
      <text
        class="switch__label">
        Geolocation
      </text>
      <switch
        class="switch__switch"
        :on-value-change="toggleGeolocation"
        :value="backgroundGeolocationRunning"/>
    </touchable-opacity>
    <touchable-opacity
      :on-press="toggleSattelite"
      class="switch">
      <text class="switch__label">
      Sattelite view
      </text>
      <switch
        class="switch__switch"
        :on-value-change="toggleSattelite"
        :value="satteliteView">
      </switch>
    </touchable-opacity>
    <view class="info">
      <text v-if="backgroundGeolocationRunning">
      {{idle_player && idle_player.isPlaying ? 'idle' : activeGeofenceTitle}}
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
        v-for="geofence in data"
        :ref="`circle-${geofence.identifier}`"
        :center="geofence"
        :radius="geofence.radius"
        :fillColor="markerColor(geofence.identifier)"
        :zIndex="3"
        :strokeWidth="1"
        strokeColor="gray"
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
      data: {},
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
      satteliteView: false,
      idle_player: null
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
      const colors = {}
      Object.keys(this.data).map(identifier => {
        colors[identifier] = this.markerColor(identifier)
      })
      return colors
    }
  },
  watch: {
    player() {
      this.$forceUpdate()
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
          this.data = {}
          data.geofence.map((g, i) => {
            this.data[g.identifier] = {
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
  },
  beforeDestroy() {
    BackgroundGeolocation.removeGeofences()
    this.stopGeolocation()
    this.idle_player.stop(_ => this.idle_player.destroy())
    if (this.player) {
      this.player.stop(_ => this.player.destroy())
    }
  },
  methods: {
    setupGeofences() {
      BackgroundGeolocation.addGeofences(Object.values(this.data))
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
      if (this.idle_player) {
        this.idle_player.pause()
      }
      if (this.player) {
        this.player.stop(_ => {
          this.player.destroy(_ => {this.player = null; this.fadeIn()})
        })
        return
      }
      this.player = new Player(this.uri, this.playbackOptions)
      this.player.volume = 0
      this.player.play(_ => {
        this.isFading = true
        this.doFadeIn(duration, end)
        this.$forceUpdate()
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
    doFadeOut(duration, end) {
      const fn = () => {
        let current = new Date().getTime(),
          remaining = end - current,
          t = remaining / duration

        if (t <= 0) {
          this.isFading = false

          this.idle_player.seek(0, _ => {
            this.idle_player.looping = true
            this.idle_player.play(_ => {
              this.player.pause(_ => {
                this.activeGeofence = null
                this.$forceUpdate()
              })
            })
          })
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
        if (this.idle_player) {
          this.idle_player.pause()
        }
        if (this.player) {
          this.fadeOut()
        }
      })
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
    },
    markerColor(identifier) {
      if (identifier == this.activeGeofence) {
        return 'rgba(128, 128, 255, .5)'
      }
      return 'rgba(255, 0, 0, .5)'
    }
  }
}
</script>

<style>
.container {
  background-color: white;
  padding-top: 75;
  align-items: stretch;
  justify-content: center;
  flex: 1;
}

.switch {
  flex-direction: row;
  width: 100%;
  height: 50;
  align-items: center;
  border-bottom-width: 1;
  border-bottom-color: #cccccccc;
  padding-left: 20;
  padding-right: 20;
}

.switch__label {
  padding: 2;
  width: 50%;
}

.switch__switch {
  width: 50%;
}

.info {
  flex-direction: row;
  width: 100%;
  height: 50;
  align-items: center;
  justify-content: center;
}

.map {
  width: 100%;
  height: 100%;
}
</style>
