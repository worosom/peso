import React from 'react'
import {
  SafeAreaView,
  ScrollView,
  Dimensions,
  View,
  Text,
  Pressable,
  Switch,
  AppState,
  ActivityIndicator,
  Alert,
} from 'react-native'
import AsyncStorage from '@react-native-community/async-storage'
import NetInfo from '@react-native-community/netinfo'
import BackgroundService from 'react-native-background-actions'
import Geolocation from 'react-native-geolocation-service'
import kudioRecorderPlayer from 'react-native-audio-recorder-player'
import RNFetchBlob from 'rn-fetch-blob'
import FitImage from 'react-native-fit-image'
import configMap from './src/components/Map.js'
import styles from './src/styles.js'
import {
  pathFromUri,
  download,
  onLocation,
  onMotionChange,
  idleMessage,
  fetchGeofences,
  errors,
} from './src/util.js'
import Map from './src/components/Map.js'
import OfflineMode from './src/components/OfflineMode.js'
import AppInfo from './src/components/Info.js'
import ErrorMessage from './src/components/Error.js'

import './src/Translations'
import i18n from 'i18next'
import { withTranslation } from 'react-i18next'
import * as RNLocalize from 'react-native-localize'


const sleep = (time) => new Promise((resolve) => setTimeout(() => resolve(), time));

const veryIntensiveTask = async that => {
  // Example of an infinite loop task
  await new Promise(async resolve => {
    for (let i = 0; BackgroundService.isRunning(); i++) {
      Geolocation.getCurrentPosition(geolocation => {
        onLocation(geolocation, that)
      })
      await sleep(1000)
    }
  })
}

const options = {
  taskName: 'Example',
  taskTitle: 'ExampleTask title',
  taskDesc: 'ExampleTask description',
  taskIcon: {
    name: 'ic_launcher',
    type: 'mipmap',
  },
  color: '#ff00ff',
  linkingURI: 'yourSchemeHere://chat/jane', // See Deep Linking for more info
  parameters: {
    delay: 1000,
  },
};


const computeInfoHeight = (showAppInfo, isArtwork) => {
  if (!showAppInfo) {
    return 66.5
  }
  const { height, width } = Dimensions.get('window')
  if (isArtwork || height < width) {
    return Math.max(0, height - 125)
  } else {
    return height * 0.4
  }
}

const shadowStyle = {
  shadowColor: '#000',
  shadowOffset: { width: 0.125, height: 0.125 },
  shadowOpacity: 0.25,
  shadowRadius: 0.7,
}

export default withTranslation()(
  class App extends React.Component {
    constructor(props) {
      super(props)
      // this.player = new AudioRecorderPlayer()
      this.appStateChange = state => {
        state === 'active' && this.forceUpdate()
        if (state === 'background') {
          this.cancelDownloads()
        }
      }
      this.playbackOptions = {}
      this.state = {
        geofencesLoaded: false,
        geofencesLoading: false,
        backgroundGeolocationRunning: false,
        downloading: false,
        downloadingAll: false,
        offlineButtonDisabled: false,
        activeGeofenceIdentifier: null,
        activeGeofenceDistance: null,
        visibleGeofenceIdentifier: null,
        data: {},
        errorMessage: null,
        idleMessage: idleMessage(),
        showAppInfo: true,
        isMoving: true
      }
      i18n.changeLanguage(RNLocalize.getLocales()[0].languageCode)
    }
    componentDidMount() {
      Dimensions.addEventListener('change', () => {
        this.forceUpdate()
      })
      // BackgroundGeolocation.onLocation(event => onLocation(event, this))
      // BackgroundGeolocation.onMotionChange(event => onMotionChange(event, this))
      AppState.addEventListener('change', this.appStateChange)
      NetInfo.addEventListener(netState => {
        if (!this.state.geofencesLoaded && !this.state.geofencesLoading) {
          this.fetchData(netState)
        }
        if (this.state.geofencesLoaded) {
          if (!netState.isConnected && !this.state.storageState) {
            this.setState({'errorMessage': errors('networkError')})
            this.stopGeolocation()
          } else if (netState.isConnected) {
            this.setState({'errorMessage': null})
          }
        }
      })
    }
    loadFromStorage() {
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
    fetchData(netState) {
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
            this.loadFromStorage()
          })
        })
      } else {
        this.loadFromStorage()
        this.setState({geofencesLoading: false, errorMessage: errors('networkError')})
      }
    }
    setup(data) {
      data.geofence.map((g, i) => {
        this.state.data[g.identifier] = {
          ...g,
          longitude: Number(g.longitude),
          latitude: Number(g.latitude),
          radius: Number(g.radius),
          notifyOnEntry: true,
          notifyOnExit: true,
          download: -1,
          visited: false
        }
        const path = pathFromUri(g.uri)
        RNFetchBlob.fs.exists(path).then(exists => {
          this.setData(g.identifier, 'download', exists ? 1 : -1)
          let downloaded = Object.values(this.state.data).map(g => g.download === 1)
          downloaded = downloaded.every(_ => _)
          if (downloaded) {
            this.setState({ storageState: true })
            this.setState({ errorMessage: null })
          }
        })
      })
      this.setState({ geofencesLoaded: true })
    }
    componentWillUnmount() {
      AppState.removeEventListener('change', this.appStateChange)
      this.stopGeolocation()
      if (this.player) {
        this.player.stopPlayer()
      }
    }
    play() {
      if (!this.state.activeGeofenceIdentifier) {
        console.log('Active geofence is null')
        return
      }
      const identifier = this.state.activeGeofenceIdentifier
      this.setState({visibleGeofenceIdentifier: identifier})
      const downloadState = this.state.data[identifier].download
      if (downloadState == 0) {
        return
      }
      this.player.stopPlayer().then(_ => {
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
            const fileUri = (Platform.OS === 'ios' ? 'file://' : '') + path
            this.player.setVolume(1)
            this.player.startPlayer(fileUri).then(_ => {
              this.setState({idleMessage: idleMessage()})
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
      this.player.stopPlayer().then(_ => {
        this.setState({ activeGeofenceIdentifier: null })
        cb && cb()
      })
    }
    startGeolocation() {
      const start = _ => {

        BackgroundService.start(async () => veryIntensiveTask(this), options).then(() => {
          this.setState({ backgroundGeolocationRunning: true })
          AsyncStorage.setItem('@geolocationAlertShown', 'true')
        })
      }
      AsyncStorage.getItem('@geolocationAlertShown').then(val => {
        if (val !== null) {
          start()
        } else {
          Alert.alert(
            this.props.t('geolocationAlert.title'),
            this.props.t('geolocationAlert.text'),
            [
              {
                text: this.props.t('geolocationAlert.cancel'),
                style: 'cancel'
              },
              {
                text: this.props.t('geolocationAlert.enable'),
                onPress: start
              }
            ], {cancelable: true})
        }
      })
    }
    stopGeolocation(cb) {
      this.stop(_ => {
        BackgroundService.stop().then(() => {
          console.log('Stopped Geolocation')
          this.setState({ backgroundGeolocationRunning: false })
          cb && cb()
        })
      })
    }
    allDownloaded() {
      let downloaded = Object.values(this.state.data).map(g => g.download === 1)
      return downloaded.every(_ => _)
    }
    allDeleted() {
      let deleted = Object.values(this.state.data).map(g => g.download === -1)
      return deleted.every(_ => _)
    }
    downloadAll(data = this.state.data) {
      let toDownload = Object.keys(data).length
      this.setState({ downloadingAll: true })
      const backgroundGeolocationRunning = this.state
        .backgroundGeolocationRunning
      if (backgroundGeolocationRunning) {
        this.stopGeolocation()
      }

      Object.values(data).map(geofence => {
        if (toDownload > 1 && this.state.activeGeofenceIdentifier === geofence.identifier || !geofence) {
          return
        }
        this.setData(geofence.identifier, 'download', 0)
        download(geofence.uri)
          .then(_ => {
            this.setData(geofence.identifier, 'download', 1)
            if (this.allDownloaded()){
              this.setState({ storageState: true })
            }

            const downloaded = toDownload === 1 ? true : this.allDownloaded()
            if (downloaded) {
              if (backgroundGeolocationRunning) {
                this.startGeolocation()
              }
              this.setState({
                offlineButtonDisabled: false,
                downloadingAll: false,
              })
            }
          })
          .catch(err => {
            this.setState({
              storageState: false,
              offlineButtonDisabled: false,
              downloadingAll: false,
              errorMessage: errors('networkError'),
            })
          })
      })
    }
    downloadAllAlert() {
      Alert.alert(
        this.props.t('downloadAll.title'),
        this.props.t('downloadAll.text'),
        [
          {
            text: this.props.t('downloadAll.cancel'),
            style: 'cancel'
          },
          {
            text: this.props.t('downloadAll.continue'),
            onPress: _ => this.downloadAll()
          }
        ], {cancelable: true})
    }
    cancelDownloads() {
      Object.values(this.state.data).map(geofence => {
        if (geofence.download == 0) {
          const path = pathFromUri(geofence.uri)
          RNFetchBlob.fs.exists(path).then(exists => {
            exists && RNFetchBlob.fs.unlink(path)
              .then(_ => {
                console.log(`Deleted ${path}`)
                this.setData(geofence.identifier, 'download', -1)
              })
          })
        }
      })
    }
    deleteAll(data = this.state.data) {
      let toDelete = Object.keys(data).length
      this.setState({storageState: false})

      Object.values(data).map(geofence => {
        if (toDelete > 1 && this.state.activeGeofenceIdentifier == geofence.identifier) {
          return
        }
        const path = pathFromUri(geofence.uri)
        RNFetchBlob.fs.exists(path).then(exists => {
          exists && RNFetchBlob.fs.unlink(path)
            .then(_ => {
              console.log(`Deleted ${path}`)
              this.setData(geofence.identifier, 'download', -1)
              const allDeleted = toDelete === 1 ? true : this.allDeleted()
              if (allDeleted) {
                this.setState({offlineButtonDisabled: false})
              }
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
        this.props.t('deleteAll.title'),
        this.props.t('deleteAll.text'),
        [
          {
            text: this.props.t('deleteAll.no'),
            onPress: () => this.state.offlineButtonDisabled = false,
            style: 'cancel'
          },
          {
            text: this.props.t('deleteAll.yes'),
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
      this.state.offlineButtonDisabled = true
      NetInfo.fetch().then(netStatus => {
        if (this.state.storageState) {
          this.deleteAllAlert()
        } else {
          this.enableStorage(netStatus)
        }
      })
    }
    toggleGeolocation() {
      this.setState({ idleMessage: idleMessage() })

      if (this.state.backgroundGeolocationRunning) {
        this.stopGeolocation()
      } else {
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
    visibleGeofence() {
      return this.state.data[this.state.visibleGeofenceIdentifier]
    }
    getInfo() {
      let res = {}
      if (this.state.visibleGeofenceIdentifier) {
        res = this.visibleGeofence()
      } else {
        const keys = ['trackTitle', 'imageUri',
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
    onMarkerPress(geofence) {
      this.setState({visibleGeofenceIdentifier: geofence.identifier})
    }
    onMapTouch() {
      this.setState({showAppInfo: false, visibleGeofenceIdentifier: null})
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
            visibleGeofenceIdentifier={this.state.visibleGeofenceIdentifier}
            onTouch={_ => this.onMapTouch()}
            onMarkerPress={geofence => this.onMarkerPress(geofence)}
          />
              <View style={styles.appTitleContainer}>
                <Pressable
                style={[styles.appTitle, shadowStyle]}
                android_ripple={{color: 'B2DAD6'}}
                onPress={_ => this.map.showAllMarkers()}>
                <Text style={{fontWeight: 'bold', fontSize: 20, marginBottom: 5}}>Belvédère Sonore Geneva</Text>
              </Pressable>
            </View>
            <OfflineMode
            onPress={_ => this.toggleStorage()}
            color={this.downloadThumbColor()}
            value={this.state.storageState}
            disabled={this.state.downloadingAll || this.state.offlineButtonDisabled}
            data={this.state.data}
            title={this.props.t('offline')}
          />
              <View
              style={[styles.options, shadowStyle, {position: 'absolute', bottom: 0}]}>
              <Pressable
              disabled={this.state.errorMessage || this.state.downloadingAll || this.state.offlineButtonDisabled}
              onPress={_ => this.toggleGeolocation()}>
              <View style={styles.switch}>
                <Text style={styles.switchLabel}>{this.props.t('tracking')}</Text>
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
            style={{maxHeight: computeInfoHeight(!!this.state.visibleGeofenceIdentifier || this.state.showAppInfo, !!this.state.visibleGeofenceIdentifier), flex:1}}
            scrollEnabled={!!this.state.visibleGeofenceIdentifier || this.state.showAppInfo && !this.state.downloadingAll}
          >
              <Pressable
              onPress={_ => this.setState({showAppInfo: true})}
              style={{
                paddingTop: 10,
                paddingLeft: 10,
                paddingRight: 10,
                paddingBottom: 0,
              }}>
              { this.state.errorMessage && (
                <ErrorMessage
                title={this.state.errorMessage.title}
                body={this.state.errorMessage.body}/>
              )}
                { !this.state.errorMessage &&
                    !this.state.backgroundGeolocationRunning && 
                    !this.state.visibleGeofenceIdentifier &&
                    !this.state.downloadingAll && (
                      <AppInfo
                      collapse={!this.state.showAppInfo}/>
                    )}
                      {!this.state.errorMessage && 
                          (this.state.visibleGeofenceIdentifier ||
                            (!this.state.visibleGeofenceIdentifier && this.state.backgroundGeolocationRunning)) &&
                          !this.state.downloadingAll && (
                            <>
                            <View style={{flex: 1, flexDirection: 'row'}}>
                              {this.state.visibleGeofenceIdentifier && (
                                <View style={{flex: 1 }}>
                                  <FitImage 
                                  style={styles.iconSize}
                                  source={require('./src/assets/music.png')}
                                />
                                  </View>
                              )}
                                  <View style={{flex: 8 }}>
                                    <Text style={[styles.infoItem, styles.musicianName]}>
                                      {info.musicianName}
                                    </Text>
                                    <Text style={[styles.infoItem, styles.infoTrackTitle]}>
                                      {info.trackTitle}
                                    </Text>
                                  </View>
                                </View>
                            {!!info.imageUri && (
                                <FitImage
                              style={{marginTop: 5,  marginBottom: 15}}
                              source={{uri: info.imageUri}}/>
                            )}
                                {!!this.state.visibleGeofenceIdentifier && (
                                  <>
                                  <View style={{flex: 1, flexDirection: 'row'}}>
                                    <View style={{flex: 1}}>
                                      <FitImage 
                                      style={styles.iconSize}
                                      source={require('./src/assets/location.png')}
                                    />
                                      </View>
                                      <View style={{flex: 8 }}>
                                        <Text style={[styles.infoItem, styles.infoAddress]}>
                                          {info.address}
                                        </Text>
                                      </View>
                                    </View>
                                  <View style={{flex: 1, flexDirection: 'row'}}>
                                    <View style={{flex: 1}}>
                                      <FitImage 
                                      style={styles.iconSize}
                                      source={require('./src/assets/view.png')}
                                    />
                                      </View>
                                      <View style={{flex: 8 }}>
                                        <Text style={[styles.infoItem, styles.infoSculpture]}>
                                          {info.artistName}
                                        </Text>
                                        <Text style={[styles.infoItem, styles.infoSculpture, styles.infoTrackTitle]}>
                                          {info.sculptureTitle} {info.year}
                                        </Text>
                                      </View>
                                    </View>
                                  </>
                                )}
                                  {info.download == 1 && (
                                    <>
                                    <Pressable
                                    disabled={this.state.backgroundGeolocationRunning}
                                    onPress={ _ => this.deleteAll({0 : this.state.data[this.state.visibleGeofenceIdentifier]})}
                                    style={{flexDirection: 'row', justifyContent: 'space-around', padding: 10}}
                                  >
                                      <Text style={{ textDecorationLine: 'underline'}}>{this.props.t('remove')}</Text>
                                    </Pressable>
                                    </>
                                  )}
                                    {info.download == -1 && (
                                      <>
                                      <Pressable
                                      disabled={this.state.backgroundGeolocationRunning}
                                      onPress={ _ => this.downloadAll({0 : this.state.data[this.state.visibleGeofenceIdentifier]})} 
                                      style={{flexDirection: 'row', justifyContent: 'space-around', padding: 10}}
                                    >
                                        <Text style={{ textDecorationLine: 'underline'}}>{this.props.t('download')}</Text>
                                      </Pressable>
                                      </>
                                    )}
                                      {this.state.downloading && (
                                        <ActivityIndicator
                                        style={{position: 'absolute', right: 10, top: 10}}
                                        size="small" color="#FFB72D"/>
                                      )}
                                    </>
                                    )
                                    }
                                    { this.state.downloadingAll && !this.state.errorMessage && (
                                      <>
                                      <Text style={{fontWeight: 'bold', height: 50}}>Downloading...</Text>
                                      <ActivityIndicator
                                      style={{position: 'absolute', right: 15, top: 15}}
                                      size="large" color="#FFB72D"/>
                                      </>
                                    )}
                                    </Pressable>
                                  </ScrollView>
                                </View>
                              </View>
                            </SafeAreaView>
      )
    }
  },
)
