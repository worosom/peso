import React from 'react'
import {
  Dimensions,
  View,
  ScrollView,
  Text,
  Linking,
  Pressable
} from 'react-native';

export default function Info(props) {
  const itemStyle = i => ({marginBottom: i == (props.data.length-1) ? 0 : 10})
  return (
    <View style={{paddingBottom: 10}}>
      {props.data.map((item, i) => {
        switch (item.type) {
          case 'link':
            return (
              <Pressable
                style={itemStyle(i)}
                key={`${i}-title`}
                onPress={ _ => Linking.openURL(item.url) }>
                <Text style={{color: 'blue', textDecorationLine: 'underline'}}>{item.content}</Text>
              </Pressable>
            )
          case 'title':
            return (
              <Text
                key={`${i}-title`}
                style={{fontWeight: 'bold', marginBottom: 10}}>
                {item.content}
              </Text>
            )
          default:
            return (
              <Text key={`${i}-body`} style={itemStyle(i)}>{item.content}</Text>
            )
        }
      }
      )}
    </View>
  )
}
