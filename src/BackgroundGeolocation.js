import BackgroundGeolocation from "react-native-background-geolocation";

export const config = {
  desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
  distanceFilter: 0,
  stopTimeout: 15,
  debug: false, // <-- enable this hear sounds for background-geolocation life-cycle.
  logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
  stopOnTerminate: true,     // <-- Allow the background-service to continue tracking when user closes the app.
  startOnBoot: false,                // <-- Auto start tracking when device is powered-up.
  forceReoloadOnGeofence: true,
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
}
