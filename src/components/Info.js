import React from 'react'
import {
  View,
  Text
} from 'react-native';

export default function Info(props) {
  return (
    <View>
      {props.data.map((item, i) => {
        if (i == 0 || !props.collapse) {
          switch (item.type) {
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
