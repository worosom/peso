import React from 'react'
import {
  View,
  Text
} from 'react-native';
import Svg, {
  Path
} from 'react-native-svg'

export default function Error(props) {
  const iconColor = props.splash ? '#FFB72D' : '#CC0000'
  const textColor = props.splash ? '#FFFFFF' : '#000000'
  return (
    <View>
      <Text style={{fontWeight: 'bold', marginBottom: 10, color: textColor}}>{props.title}</Text>
      <Text style={{color: textColor}}>{props.body}</Text>
      {props.title && props.body && (
      <Svg
        style={{position: 'absolute', top: 0, right: 0}}
        width="20"
        height="20"
        viewBox="0 0 20 20">
        <Path d="M1.90625 0.28125L0.5 1.71875L2.34375 3.5625C0.884756 5.29909 0 7.55875 0 10C0 13.162 1.48125 15.9785 3.78125 17.8125L5.03125 16.25C3.19125 14.783 2 12.53 2 10C2 8.11139 2.68134 6.36901 3.78125 5L5.1875 6.40625C4.44465 7.40388 4 8.66301 4 10C4 11.898 4.90125 13.5875 6.28125 14.6875L7.53125 13.0938C6.61225 12.3597 6 11.265 6 10C6 9.21401 6.2598 8.49006 6.65625 7.875L8.53125 9.75C8.51741 9.83179 8.5 9.91425 8.5 10C8.5 10.828 9.172 11.5 10 11.5C10.0857 11.5 10.1682 11.4826 10.25 11.4688L18.5 19.7188L19.9062 18.2812L1.90625 0.28125ZM16.25 2.1875L15 3.75C16.83 5.217 18 7.477 18 10C18 11.194 17.722 12.2945 17.25 13.3125L18.7188 14.8125C19.5148 13.3805 20 11.751 20 10C20 6.846 18.538 4.0215 16.25 2.1875ZM13.75 5.3125L12.5 6.875C13.416 7.609 14 8.738 14 10C14 10.027 14.001 10.0355 14 10.0625L15.7188 11.7812C15.8997 11.2122 16 10.628 16 10C16 8.108 15.123 6.4135 13.75 5.3125Z" fill={iconColor}/>
      </Svg>
      )}
    </View>
  )
}
