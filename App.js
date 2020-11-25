import React from 'react'
import {
  SafeAreaView,
  ScrollView,
  Dimensions,
  View,
  Text,
  Pressable,
  Button,
  Switch,
  AppState,
  ActivityIndicator,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage'
import NetInfo from '@react-native-community/netinfo'
import BackgroundGeolocation from 'react-native-background-geolocation'
import { config } from './src/backgroundGeolocation.js'
import { Player, PlaybackCategories } from '@react-native-community/audio-toolkit'
import RNFetchBlob from 'rn-fetch-blob'
import FitImage from 'react-native-fit-image'
import configMap from './src/components/Map.js'
import styles from './src/styles.js'
import {
  dirs,
  pathFromUri,
  download,
  onLocation,
  idleMessage,
  fetchGeofences,
  errors
} from './src/util.js'
import Map from './src/components/Map.js'
import OfflineMode from './src/components/OfflineMode.js'
import AppInfo from './src/components/Info.js'
import ErrorMessage from './src/components/Error.js'

const computeInfoHeight = () => {
  const windowHeight = Dimensions.get('window').height
  return windowHeight - windowHeight / 1.61803
}


const shadowStyle = {
  shadowColor: '#000',
  shadowOffset: {width: .125, height: .125},
  shadowOpacity: .25,
  shadowRadius: .7,
}


export default class App extends React.Component {
  constructor(props) {
    super(props)
    this.player = new Player()
    this.appStateChange = state => state == 'active' && this.forceUpdate()
    this.playbackOptions = {
      continuesToPlayInBackground: true,
      autoDestroy: false,
      wakeLock: true,
      mixWithOthers: true,
      category: PlaybackCategories.Playback
    }
    this.state = {
      geofencesLoaded: false,
      geofencesLoading: false,
      backgroundGeolocationRunning: false,
      downloading: false,
      downloadingAll: false,
      activeGeofenceIdentifier: null,
      activeGeofenceDistance: null,
      data: {},
      errorMessage: null,
      idleMessage: idleMessage(),
      showAppInfo: true
    }
  }
  componentDidMount() {
    BackgroundGeolocation.onLocation((event) => onLocation(event, this));
    AppState.addEventListener('change', this.appStateChange)
    NetInfo.addEventListener(netState => {
      if (this.state.geofencesLoaded) {
        if (!netState.isConnected && !this.state.storageState) {
          this.setState({'errorMessage': errors('networkError')})
          this.stopGeolocation()
        } else if (netState.isConnected) {
          this.setState({'errorMessage': null})
        }
      }
    })
    const loadFromStorage = _ => {
      AsyncStorage.getItem('@data')
        .then(data => JSON.parse(data))
        .then(data => {
          if (data) {
            this.setState({geofencesLoading: false})
            this.setup(data)
          } else {
            this.setState({'errorMessage': errors('TypeError: Network request failed')})
          }
        })
        .catch(err => this.setState({'errorMessage': errors(String(err))}))
    }
    NetInfo.addEventListener(netState => {
      if (!this.state.geofencesLoaded && !this.state.geofencesLoading) {
        this.setState({geofencesLoading: true})
        if (netState && netState.isConnected) {
          fetchGeofences().then(data => {
            this.setState({geofencesLoading: false, errorMessage: null})
            this.setup(data)
            AsyncStorage.setItem('@data', JSON.stringify(data))
          }).catch(err => {
            this.setState({
              geofencesLoading: false,
              errorMessage: errors('networkError')
            }, _ => {
              loadFromStorage()
            })
          })
        } else {
          loadFromStorage()
          this.setState({geofencesLoading: false, errorMessage: errors('networkError')})
        }
      }
    })
  }
  setup(data) {
    BackgroundGeolocation.ready(config, (state) => {
      console.log("[BackgroundGeolocation is configured and ready]");
      data.geofence.map((g, i) => {
        this.state.data[g.identifier] = {
          ...g,
          longitude: Number(g.longitude),
          latitude: Number(g.latitude),
          radius: Platform.OS === 'ios' ? Math.max(200, Number(g.radius)) : Number(g.radius),
          notifyOnEntry: true,
          notifyOnExit: true,
          download: -1,
          visited: false
        }
        const path = pathFromUri(g.uri)
        RNFetchBlob.fs.exists(path).then(exists => {
          this.setData(g.identifier, 'download', exists ? 1 : -1)
          let downloaded = Object.values(this.state.data).map(g => g.download == 1)
          downloaded = downloaded.every(_ => _)
          if (downloaded) {
            this.setState({storageState: true})
            this.setState({'errorMessage': null})
          }
        })
      })
      this.setState({geofencesLoaded: true})
    })
  }
  componentWillUnmount() {
    AppState.removeEventListener('change', this.appStateChange)
    this.stopGeolocation()
    if (this.player) {
      this.player.stop()
      this.player.destroy()
    }
  }
  play() {
    if (!this.state.activeGeofenceIdentifier) {
      console.log('Active geofence is null')
      return
    }

    const identifier = this.state.activeGeofenceIdentifier
    const downloadState = this.state.data[identifier].download
    if (downloadState == 0) {
      return
    }
    this.player.destroy(_ => {
      if (!this.state.activeGeofenceIdentifier) {
        console.log('Active geofence is null')
        return
      }
      const uri = this.activeGeofence().uri
      if (this.activeGeofence().download == -1) {
        this.setData(identifier, 'download', 0)
        this.setState({'downloading': true})
      }
      download(uri).then(res => {
        const path = res.path()
        console.log('Downloaded', path)
        this.setData(identifier, 'download', 1)
        this.setState({'downloading': false})
        if (this.allDownloaded()) {
          this.setState({storageState: true})
        }
        if (this.state.activeGeofenceIdentifier) {
          this.player = new Player((Platform.OS === 'ios' ? 'file://' : '') + path, this.playbackOptions)
          this.player.play(_ => {
            console.log('Playing', path)
            this.setData(identifier, 'visited', true)
          })
        }
      }).catch(err => {
        this.setData(identifier, 'visited', false)
        this.setData(identifier, 'download', -1)
        this.setState({'downloading': false})
      })
    })
  }
  stop(cb) {
    this.player.pause(_ => {
      this.setState({activeGeofenceIdentifier: null})
      cb && cb()
    })
  }
  startGeolocation() {
    const start = _ => {
      BackgroundGeolocation.start(_ => {
        console.log('Started Geolocation')
        BackgroundGeolocation.changePace(true, _ => {
          console.log('- plugin is now tracking')
        })
        this.setState({backgroundGeolocationRunning: true})
        AsyncStorage.setItem('@geolocationAlertShown', 'true')
      })
    }
    AsyncStorage.getItem('@geolocationAlertShown').then(val => {
      if (val !== null) {
        start()
      } else {
        Alert.alert(
          'Background Geolocation',
          'This app collects location data to enable audio playback in geneva even when the app is closed or not in use.',
          [
            {
              text: 'Cancel',
              style: 'cancel'
            },
            {
              text: 'Enable tracking',
              onPress: start
            }
          ], {cancelable: true})
      }
    })
  }
  stopGeolocation(cb) {
    this.stop(_ => {
      BackgroundGeolocation.stop().then(_ => {
        console.log('Stopped Geolocation')
        this.setState({backgroundGeolocationRunning: false})
        cb && cb()
      })
    })
  }
  allDownloaded() {
    let downloaded = Object.values(this.state.data).map(g => g.download == 1)
    return downloaded.every(_ => _)
  }
  downloadAll() {
    this.setState({storageState: true})
    this.stop(_ => {
      this.setState({downloadingAll: true})
      const backgroundGeolocationRunning = this.state.backgroundGeolocationRunning
      if (backgroundGeolocationRunning)
        this.stopGeolocation()
      Object.values(this.state.data).map(geofence => {
        if (this.state.activeGeofenceIdentifier == geofence.identifier) {
          return
        }
        this.setData(geofence.identifier, 'download', 0)
        download(geofence.uri)
          .then(_ => {
            this.setData(geofence.identifier, 'download', 1)
            const downloaded = this.allDownloaded()
            if (downloaded) {
              if (backgroundGeolocationRunning) {
                this.startGeolocation()
              }
              this.setState({downloadingAll: false})
            }
          })
          .catch(err => {
            this.setState({
              storageState: false,
              downloadingAll: false,
              errorMessage: errors('networkError')
            })
          })
      })
    })
  }
  downloadAllAlert() {
    Alert.alert(
      'Download size ~100 Megabytes',
      'WiFi connection recommended.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Continue',
          onPress: _ => this.downloadAll()
        }
      ], {cancelable: true})
  }
  deleteAll() {
    this.setState({storageState: false})
    Object.values(this.state.data).map(geofence => {
      if (this.state.activeGeofenceIdentifier == geofence.identifier) {
        return
      }
      const path = pathFromUri(geofence.uri)
      RNFetchBlob.fs.exists(path).then(exists => {
        exists && RNFetchBlob.fs.unlink(path)
          .then(_ => {
            console.log(`Deleted ${path}`)
            this.setData(geofence.identifier, 'download', -1)
          })
      })
    })
    NetInfo.fetch().then(netState => {
      if (!netState.isConnected) {
        this.setState({'errorMessage': errors('networkError')})
        this.stopGeolocation()
      }
    })
    this.forceUpdate()
  }
  deleteAllAlert() {
    Alert.alert(
      'Warning',
      'Delete all downloads?',
      [
        {
          text: 'No',
          style: 'cancel'
        },
        {
          text: 'Yes',
          onPress: _ => this.deleteAll()
        }
      ], {cancelable: true})
  }
  setData(identifier, key, value) {
    this.setState(previousState => {
      const data = { ...previousState.data }
      data[identifier] = {
        ...data[identifier]
      }
      data[identifier][key] = value
      return { data }
    })
  }
  enableStorage(netStatus) {
    if (netStatus.isConnected) {
      if (netStatus.type !== 'wifi') {
        this.downloadAllAlert()
      } else {
        this.downloadAll()
      }
    }
  }
  toggleStorage() {
    NetInfo.fetch().then(netStatus => {
      if (this.state.storageState) {
        this.deleteAllAlert()
      } else {
        this.enableStorage(netStatus)
      }
    })
  }
  toggleGeolocation() {
    if (this.state.backgroundGeolocationRunning) {
      this.stopGeolocation()
    } else {
      this.setState({idleMessage: idleMessage()})
      this.startGeolocation()
    }
  }
  geofenceRadius(radius) {
    return radius / 2
  }
  getMapStyle() {
    return configMap.mapStyle
  }
  activeGeofence() {
    return this.state.data[this.state.activeGeofenceIdentifier]
  }
  getInfo() {
    let res = {}
    if (this.state.activeGeofenceIdentifier) {
      res = this.activeGeofence()
    } else {
      const keys = ['trackTitle',
        'musicianName', 'address', 'sculptureTitle', 'artistName', 'year']
      keys.map(key => res[key] = '')
      res.trackTitle = this.state.idleMessage
    }
    return res
  }
  downloadThumbColor() {
    if (this.state.downloadingAll) {
      return '#FFB72D7F'
    }
    return this.state.storageState ? '#0A0' : '#ccc'
  }
  render() {
    if (!this.state.geofencesLoaded) {
      return (
        <View style={styles.splashscreen}>
          <View style={{position: 'absolute', top: 0, left: 0, height: '50%', width: '100%', backgroundColor: '#d0ccad'}}></View>
          <View style={{width: '100%'}}>
            <FitImage
              originalWidth={512}
              originalHeight={512}
              source={require('./src/assets/ACCUEIL_512PX.png')}/>
            <View style={{padding: 40}}>
              <ErrorMessage
                splash={true}
                title={this.state.errorMessage && this.state.errorMessage.title}
                body={this.state.errorMessage && this.state.errorMessage.body}/>
            </View>
          </View>
          { !this.state.errorMessage && (
            <ActivityIndicator
              style={{position: 'absolute', bottom: 40, right: 40}}
              size="large" color="#FFB72D"/>
          )}
        </View>
      )
    }
    const info = this.getInfo()
    return (
      <SafeAreaView>
        <View style={styles.container}>
          <Map
            data={this.state.data}
            ref={ref => this.map = ref}
            activeGeofenceIdentifier={this.state.activeGeofenceIdentifier}
            onTouch={_ => this.setState({showAppInfo: false})}
          />
          <View style={styles.header}>
            <View style={styles.appTitleContainer}>
              <Pressable
                style={[styles.appTitle, shadowStyle]}
                android_ripple={{color: 'B2DAD6'}}
                onPress={_ => this.map.showAllMarkers()}>
                <Text style={{fontWeight: 'bold', fontSize: 20}}>Belvédère Sonore Geneva</Text>
              </Pressable>
            </View>
            <OfflineMode
              onPress={_ => this.toggleStorage()}
              color={this.downloadThumbColor()}
              value={this.state.storageState}
              disabled={this.state.downloadingAll}
              data={this.state.data}
            />
          </View>
          <View style={styles.footer}>
            <View
              style={[styles.options, shadowStyle]}>
              <Pressable
                disabled={this.state.errorMessage || this.state.downloadingAll}
                onPress={_ => this.toggleGeolocation()}>
                <View style={styles.switch}>
                  <Text style={styles.switchLabel}>Tracking</Text>
                  <Switch
                    onValueChange={_ => this.toggleGeolocation()}
                    disabled={true}
                    thumbColor={this.state.backgroundGeolocationRunning ? '#4582F4' : '#ccc'}
                    value={this.state.backgroundGeolocationRunning}/>
                </View>
              </Pressable>
            </View>
            <View
              style={[styles.info, shadowStyle]}
              >
            <ScrollView
              style={{maxHeight: computeInfoHeight(), flex:1}}>
              <Pressable
                onPress={_ => this.setState({showAppInfo: true})}>
                { this.state.errorMessage && (
                  <ErrorMessage
                    title={this.state.errorMessage.title}
                    body={this.state.errorMessage.body}/>
                )}
                { !this.state.errorMessage &&
                    !this.state.backgroundGeolocationRunning && 
                    !this.state.downloadingAll && (
                  <AppInfo
                    collapse={!this.state.showAppInfo}
                    data={[
                    {content: 'Music for sculptures in Geneva', type: 'title'},
                    {content: 'Belvédère Sonore allows you to access a hidden musical reality.', type: 'text'},
                    {content: 'This geolocalization app makes you able to listen to the musical aura of a sculpture.', type: 'text'},
                    {content: 'Activate the offline mode to temporarily download the audio files to your device if you don\'t have a constant internet connection on your mobile phone.', type: 'text'},
                    {content: '(To delete the files, deactivate the offline mode.)', type: 'text'},
                    {content: 'To activate the offline mode you need an internet connection.', type: 'text'},
                    {content: 'To start your musical journey, activate the tracking mode and your device will play audio while you are in a target zone of a sculpture.', type: 'text'},
                    {content: 'Green circle: music is loaded', type: 'text'},
                    {content: 'Orange circle: music download in progress', type: 'text'},
                    {content: 'Red circle: music is playing', type: 'text'},
                    {content: 'No user or tracking information is sent to our server.', type: 'text'},
                    {content: 'Privacy Policy', url: 'https://dispatchwork.info/peso/policy.html', type: 'link'}
                  ]}/>
                )}
                { !this.state.errorMessage && this.state.backgroundGeolocationRunning && (
                <Text style={[styles.infoItem, styles.infoTrackTitle]}>
                  {info.trackTitle}
                </Text>
                )}
                { this.state.activeGeofenceIdentifier && (
                  <>
                <Text style={[styles.infoItem, styles.infoMusicianName]}>
                  {info.musicianName}
                </Text>
                <Text style={[styles.infoItem, styles.infoAddress]}>
                  {info.address}
                </Text>
                <Text style={[styles.infoItem, styles.infoSculpture]}>
                  {info.sculptureTitle}, {info.artistName}, {info.year}
                </Text>
                {this.state.downloading && (
                  <ActivityIndicator
                  style={{position: 'absolute', right: 15, top: 15}}
                  size="large" color="#FFB72D"/>
                )}
                  </>
                )
                }
              </Pressable>
            </ScrollView>
            { this.state.downloadingAll && !this.state.errorMessage && (
              <>
                <Text style={{fontWeight: 'bold'}}>Downloading...</Text>
                <ActivityIndicator
                style={{position: 'absolute', right: 15, top: 15}}
                size="large" color="#FFB72D"/>
              </>
            ) }
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }
}
