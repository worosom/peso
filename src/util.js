import RNFetchBlob from 'rn-fetch-blob'

export const dirs = RNFetchBlob.fs.dirs

export function pathFromUri(uri) {
  const name = uri.split('/').slice(-1)[0]
  return dirs.DocumentDir + name
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

  if ('ENTER' == geofence.action) {
    self.state.activeGeofenceIdentifier = geofence.identifier
    self.play()
  } else if (geofence.identifier == self.state.activeGeofenceIdentifier) {
    self.stop()
  }
  self.forceUpdate()
}

export function idleMessage() {
  return ['Idle', 'Waiting', 'Sleeping', 'Chillin\'', 'Pause'][Math.floor(Math.random() * 5)]
}

export async function fetchGeofences() {
  const response = await fetch('https://pelerinage-sonore.net/peso.json')
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
