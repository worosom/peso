import React from 'react'
import {
  View,
  Pressable,
  Text,
  Switch
} from 'react-native';
import styles from '../styles.js'

export default function OfflineMode(props) {
  return (
    <View style={styles.options}>
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
      <View style={styles.downloadGroup}>
        {Object.values(props.data).map((geofence, i) => (
          <Text
            key={i}
            style={geofence.identifier && styles.download(props.data[geofence.identifier])}/>
        ))}
      </View>
    </View>
  )
}
