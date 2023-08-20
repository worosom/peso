import React from 'react'
import {
  View,
  Text,
  Pressable,
  Platform,
  Dimensions
} from 'react-native';
import MapView from 'react-native-maps'
import { Marker, Circle, Callout } from 'react-native-maps'
import debounce from 'lodash.debounce'
import MarkerIcon from './MarkerIcon.js'
import MyLocation from '../assets/my-location.svg'

const shadowStyle = {
  shadowColor: '#000',
  shadowOffset: {width: .125, height: .125},
  shadowOpacity: 1,
  shadowRadius: 2,
  backgroundColor: 'white'
}

export default class Map extends React.Component {
  constructor(props) {
    super(props)
    this.onTouch = debounce(props.onTouch, 16, {leading: true, trailing: false})
    this.initialRegion = {"latitude": 46.165484728584715, "latitudeDelta": 0.2637706968428404, "longitude": 6.1410642229020596, "longitudeDelta": 0.22025328129529953}
    this.state = {
      userLocation: null
    }
  }
  showUserLocation() {
    this.map.animateCamera({
      center: {
        latitude: this.state.userLocation.latitude,
        longitude: this.state.userLocation.longitude,
      }
    })
  }

  showAllMarkers(delay) {
    const fn = _ => {
      const {width, height} = Dimensions.get('window')
      const bottom = (width > height) ? height * .1 : height - height / 1.61803 + height * .0125
      const edgePadding = {
        top: height * .1,
        right: width * .1,
        bottom,
        left: width * .1
      }
      this.map?.fitToCoordinates(Object.values(this.props.data), {
        edgePadding,
        animated: true,
      })
    }
    if (delay) {
      setTimeout(fn, delay)
    } else {
      fn()
    }
  }

  markerBorderColor(identifier) {
    const geofence = this.props.data[identifier]
    if (
      identifier == this.props.activeGeofenceIdentifier ||
      identifier == this.props.visibleGeofenceIdentifier
    ) {
      if (geofence.download !== 0) {
        return '#FF00004D'
      }
    }
    switch (geofence.download) {
      case -1:
        return '#4582F4EC'
      case 0:
        return '#FFB72D'
      case 1:
        return '#00AA00'
    }
  }
  
  markerColor(identifier) {
    const geofence = this.props.data[identifier]
    if (
      identifier == this.props.activeGeofenceIdentifier ||
      identifier == this.props.visibleGeofenceIdentifier
    ) {
      if (geofence.download !== 0) {
        return '#FF00004D'
      }
    } else if (geofence.visited) {
      return '#FFFFFF7F'
    }
    switch (geofence.download) {
      case -1:
        return '#4582F47F'
      case 0:
        return '#FFB72D7F'
      case 1:
        return 'rgba(170, 255, 170, .3)'
    }
    return 'rgba(170, 255, 170, .3)'
  }

  markerIconColor(identifier) {
    const geofence = this.props.data[identifier]
    if (
      identifier == this.props.activeGeofenceIdentifier ||
      identifier == this.props.visibleGeofenceIdentifier
    ) {
      if (geofence.download !== 0) {
        return '#FF0000FD'
      }
    } else if (geofence.visited) {
      return '#00AA007F'
    }
    switch (geofence.download) {
      case -1:
        return '#4582F4FF'
      case 0:
        return '#FFB72DFF'
      case 1:
        return 'rgba(0, 180, 0, 1)'
    }
    return '#0A0'
  }

  render() {
    return (
      <>
      <MapView
        style={styles.map}
        ref={ref => this.map = ref}
        onMapReady={_ => this.showAllMarkers(1000)}
        initialRegion={this.initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={false}
        onPress={this.onTouch}
        onDoublePress={this.onTouch}
        onPanDrag={this.onTouch}
        onUserLocationChange={location => {
          this.setState({userLocation: location.nativeEvent.coordinate})
        }}
        customMapStyle={configMap.mapStyle}
      >
        {Object.values(this.props.data).map((geofence, i) => (
          <Marker
            key={`${i}-marker`}
            onPress={_ => this.props.onMarkerPress(geofence)}
            stopPropagation={true}
            coordinate={geofence}
            centerOffset={{x: 0, y: -18}}
            title={geofence.trackTitle}
            description={geofence.musicianName}
            tracksViewChanges={true}
            zIndex={1001 + i}
          >
            <MarkerIcon
              width={28}
              height={40}
              fillColor={this.markerIconColor(geofence.identifier)}/>
            <Callout 
              tooltip={true}>
              <View style={{width: 0, height: 0}}>
                <Text></Text>
              </View>
            </Callout>
          </Marker>
        ))
        }
        {Object.values(this.props.data).map((geofence, i) => (
          <Circle
            onPress={_  =>  this.props.onMarkerPress(geofence)}
            stopPropagation={true}
            key={`${i}-circle`}
            center={geofence}
            radius={geofence.radius}
            identifier={geofence.identifier}
            fillColor={this.markerColor(geofence.identifier)}
            tracksViewChanges={false}
            zIndex={1000}
            strokeWidth={2}
            strokeColor={this.markerBorderColor(geofence.identifier)}
          />
        ))
        }
      </MapView>
      { this.state.userLocation && (
      <View style={[styles.locateButton, shadowStyle]}>
        <Pressable
          style={{width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center'}}
          android_ripple={{color: 'B2DAD6'}}
          onPress={_ => this.showUserLocation()}>
          <MyLocation width={20} height={20}/>
        </Pressable>
      </View>
      )}
      </>
    )
  }
}


const configMap = {
  mapStyle: [
    {
      "elementType": "geometry",
      "stylers": [ { "color": "#ebe3cd" } ]
    },
    {
      "elementType": "labels.text.fill",
      "stylers": [ { "color": "#523735" } ]
    },
    {
      "elementType": "labels.text.stroke",
      "stylers": [ { "color": "#f5f1e6" } ]
    },
    {
      "featureType": "administrative",
      "elementType": "geometry",
      "stylers": [ { "visibility": "off" } ]
    },
    {
      "featureType": "administrative",
      "elementType": "geometry.stroke",
      "stylers": [ { "color": "#c9b2a6" } ]
    },
    {
      "featureType": "administrative.land_parcel",
      "elementType": "geometry.stroke",
      "stylers": [ { "color": "#dcd2be" } ]
    },
    {
      "featureType": "administrative.land_parcel",
      "elementType": "labels.text.fill",
      "stylers": [ { "color": "#ae9e90" } ]
    },
    {
      "featureType": "landscape.natural",
      "elementType": "geometry",
      "stylers": [ { "color": "#dfd2ae" } ]
    },
    {
      "featureType": "poi",
      "stylers": [ { "visibility": "off" } ]
    },
    {
      "featureType": "poi",
      "elementType": "geometry",
      "stylers": [ { "color": "#dfd2ae" } ]
    },
    {
      "featureType": "poi",
      "elementType": "labels.text.fill",
      "stylers": [ { "color": "#93817c" } ]
    },
    {
      "featureType": "poi.park",
      "elementType": "geometry.fill",
      "stylers": [ { "color": "#a5b076" } ]
    },
    {
      "featureType": "poi.park",
      "elementType": "labels.text.fill",
      "stylers": [ { "color": "#447530" } ]
    },
    {
      "featureType": "road",
      "elementType": "geometry",
      "stylers": [ { "color": "#f5f1e6" } ]
    },
    {
      "featureType": "road",
      "elementType": "labels.icon",
      "stylers": [ { "visibility": "off" } ]
    },
    {
      "featureType": "road.arterial",
      "elementType": "geometry",
      "stylers": [ { "color": "#fdfcf8" } ]
    },
    {
      "featureType": "road.highway",
      "elementType": "geometry",
      "stylers": [ { "color": "#f8c967" } ]
    },
    {
      "featureType": "road.highway",
      "elementType": "geometry.stroke",
      "stylers": [ { "color": "#e9bc62" } ]
    },
    {
      "featureType": "road.highway.controlled_access",
      "elementType": "geometry",
      "stylers": [ { "color": "#e98d58" } ]
    },
    {
      "featureType": "road.highway.controlled_access",
      "elementType": "geometry.stroke",
      "stylers": [ { "color": "#db8555" } ]
    },
    {
      "featureType": "road.local",
      "elementType": "labels.text.fill",
      "stylers": [ { "color": "#806b63" } ]
    },
    {
      "featureType": "transit",
      "stylers": [ { "visibility": "off" } ]
    },
    {
      "featureType": "transit.line",
      "elementType": "geometry",
      "stylers": [ { "color": "#dfd2ae" } ]
    },
    {
      "featureType": "transit.line",
      "elementType": "labels.text.fill",
      "stylers": [ { "color": "#8f7d77" } ]
    },
    {
      "featureType": "transit.line",
      "elementType": "labels.text.stroke",
      "stylers": [ { "color": "#ebe3cd" } ]
    },
    {
      "featureType": "transit.station",
      "elementType": "geometry",
      "stylers": [ { "color": "#dfd2ae" } ]
    },
    {
      "featureType": "water",
      "elementType": "geometry.fill",
      "stylers": [ { "color": "#b9d3c2" } ]
    },
    {
      "featureType": "water",
      "elementType": "labels.text.fill",
      "stylers": [ { "color": "#92998d" } ]
    }
  ],
}
