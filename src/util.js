import RNFetchBlob from 'rn-fetch-blob'
import TrackPlayer, { State } from 'react-native-track-player'

export const dirs = RNFetchBlob.fs.dirs

export function pathFromUri(uri) {
  const name = uri.split('/').slice(-1)[0]
  return dirs.CacheDir + '/' + name
}

export async function download(uri) {
  const path = pathFromUri(uri)

  const file_exists = await RNFetchBlob.fs.exists(path)
  let res;
  if (file_exists) {
    res = {
      path() { return path },
      cancel: _ => _
    }
  }
  else {
    res = await RNFetchBlob
      .config({
        path,
        fileCache: true
      })
      .fetch('GET', uri)
      .progress({ count: 25 }, (received, total) => {
        console.log(path.split('/').slice(-1)[0], received / total)
      })
  }
  return res
}

export function onGeofence(geofence, self) {
  console.log('[geofence]', geofence.action, geofence.identifier);

  if (Object.keys(self.state.data).indexOf(geofence.identifier) < 0) {
    return
  }

  if ('ENTER' === geofence.action) {
    self.state.activeGeofenceIdentifier = geofence.identifier
    self.play()
  } else if (geofence.identifier === self.state.activeGeofenceIdentifier) {
    self.stop()
  }
  self.forceUpdate()
}

/**
 * Calculates the haversine distance between point A, and B.
 * @param {number[]} latlngA [lat, lng] point A
 * @param {number[]} latlngB [lat, lng] point B
 * @param {boolean} isMiles If we are using miles, else km.
 */
const haversineDistance = ([lat1, lon1], [lat2, lon2], isMiles = false) => {
  lat1 = Number(lat1)
  lat2 = Number(lat2)
  lon1 = Number(lon1)
  lon2 = Number(lon2)
  const toRadian = angle => (Math.PI / 180) * angle;
  const distance = (a, b) => (Math.PI / 180) * (a - b);
  const RADIUS_OF_EARTH_IN_KM = 6371;

  const dLat = distance(lat2, lat1);
  const dLon = distance(lon2, lon1);

  lat1 = toRadian(lat1);
  lat2 = toRadian(lat2);

  // Haversine Formula
  const a =
    Math.pow(Math.sin(dLat / 2), 2) +
    Math.pow(Math.sin(dLon / 2), 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.asin(Math.sqrt(a));

  let finalDistance = RADIUS_OF_EARTH_IN_KM * c;

  if (isMiles) {
    finalDistance /= 1.60934;
  }

  return finalDistance * 1000;
};

const geofences = {}

export function onLocation(geolocation) {
  if (!geolocation.coords) {
    return
  }
  const data = Object.values(this.state.data)
  const a = [geolocation.coords.latitude, geolocation.coords.longitude]
  const distances = data.map(marker => haversineDistance(a, [marker.latitude, marker.longitude]))
  const activeMarkers = distances.map(
    (distance, i) => distance < data[i].radius,
  )
  const indices = activeMarkers.flatMap((bool, index) => bool ? index : [])
  if (indices.length) {
    const identifier = data[indices[0]].identifier
    if (this.state.activeGeofenceIdentifier === identifier) {
      return
    } else {
      if (this.state.activeGeofenceIdentifier !== null) {
        this.stop()
      }
      this.state.activeGeofenceIdentifier = identifier
      this.play()
      return
    }
  } else {
    this.stop()
    return
  }
}

export const onMotionChange = (event, self) => {
  self.state.isMoving = event.isMoving
}

export function idleMessage() {
  return ['Idle', 'Waiting', 'Sleeping', 'Chillin\'', 'Pause'][Math.floor(Math.random() * 5)]
}

export async function fetchGeofences() {
  const response = await fetch('https://pelerinage-sonore.netlify.app/peso.json')
  return await response.json()
}

export function errors(error) {
  switch(error) {
    case 'TypeError: Network request failed':
      return {
        title: 'No network connection.',
        body: 'The app requires WiFi or mobile data to start for the first time.'
      }
    case 'networkError':
      return {
        title: 'Network connection lost.',
        body: 'Please find WiFi and activate Offline Mode or make sure that you have mobile data reception to stream the audio.'
      }
    default:
      return {
        title: error,
        body: ''
      }
  }
}
