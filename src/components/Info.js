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
  return (
    <View>
      {props.data.map((item, i) => {
        if (i == 0 || !props.collapse) {
          switch (item.type) {
            case 'link':
              return (
                <Pressable
                  key={`${i}-title`}
                  onPress={ _ => Linking.openURL(item.url) }>
                  <Text style={{color: 'blue', textDecorationLine: 'underline'}}>Privacy Policy</Text>
                </Pressable>
              )
            case 'title':
              return (
                <Text
                  key={`${i}-title`}
                  style={{fontWeight: 'bold', marginBottom: props.collapse ? 0 : 10}}>
                  {item.content}
                </Text>
              )
            default:
              return (
                <Text key={`${i}-body`} style={{marginBottom: i == (props.data.length-1) ? 0 : 10}}>{item.content}</Text>
              )
          }
        }
      }
      )}
    </View>
  )
}
