import {
  StyleSheet,
  Platform
} from 'react-native';

export default styles = StyleSheet.create({
  appTitleContainer: {
    position: 'absolute',
    top: 15,
    left: 15
  },
  appTitle: {
    paddingTop: 3,
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor: 'white',
    elevation: 4
  },
  container: {
    height: '100%'
  },
  map: {
    ...StyleSheet.absoluteFill
  },
  header: {
    position: 'absolute',
    top: 0,
    flexDirection: 'row',
  },
  footer: {
    position: 'absolute',
    width: '100%',
    left: 0,
    right: 0,
    bottom: 0,
  },
  info: {
    flex: 1,
    backgroundColor: 'white',
    elevation: 8,
    width: 250,
    minHeight: 66.5,
    position: 'absolute',
    right: 0,
    bottom: 0
  },
  infoItem: {
  },
  infoTrackTitle: {
    fontWeight: 'bold'
  },
  infoMusicianName: {
    marginBottom: 10
  },
  infoAddress: {
    marginBottom: 10
  },
  infoSculpture: {
  },
  options: {
    backgroundColor: 'white',
    elevation: 4,
    padding: 10,
    width: 80
  },
  switch: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  switchLabel: {
    textAlign: 'center'
  },
  locateButton: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
    bottom: 80,
    left: 16,
    borderRadius: 25,
    backgroundColor: 'white',
    elevation: 1,
    overflow: 'hidden'
  },
  locateButtonLabel: {
    color: '#FFF',
    fontWeight: 'bold'
  },
  splashscreen: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'space-around',
    flexDirection: 'column',
    backgroundColor: '#e4022e'
  },
  splashTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 10,
    width: '100%',
    color: '#d0ccad'
  },
  downloadGroup: {
    position: 'absolute',
    width: 80,
    height: 3,
    bottom: 0,
    flexDirection: 'row'
  },
  download({download}) {
    const style = {
      backgroundColor: '#0000CC',
      height: 3,
      elevation: 2,
      flex: 1
    }
    if (download == 0) {
      style.backgroundColor = '#FFB72DFF'
    }
    else if (download == 1) {
      style.backgroundColor = '#00AA00'
    }
    return style
  }
});
