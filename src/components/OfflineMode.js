import React from 'react'
import {
  View,
  Pressable,
  Text,
  Switch
} from 'react-native';
import styles from '../styles.js'


const shadowStyle = {
  shadowColor: '#000',
  shadowOffset: {width: .125, height: 1},
  shadowOpacity: .25,
  shadowRadius: .7,
}


export default function OfflineMode(props) {
  return (
    <View 
      style={[styles.options, shadowStyle]}>
      <Pressable
        disabled={props.disabled}
        onPress={_ => props.onPress()}>
        <View style={styles.switch}>
          <Text style={styles.switchLabel}>Offline Mode</Text>
          <Switch
            onValueChange={_ => props.onPress()}
            thumbColor={props.color}
            disabled={props.disabled}
            value={props.value}/>
        </View>
      </Pressable>
      <View
        style={[styles.downloadGroup, shadowStyle]}>
        {Object.values(props.data).map((geofence, i) => (
          <Text
            key={i}
            style={geofence.identifier && styles.download(props.data[geofence.identifier])}/>
        ))}
      </View>
    </View>
  )
}
