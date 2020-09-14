import React from 'react'
import Svg, {
  Path
} from 'react-native-svg'

export default function MarkerIcon(props) {
  return (
    <Svg width={props.width} height={props.height} viewBox="-2 -2 32 42">
      <Path
        stroke="white"
        strokeWidth="2"
        fill={props.fillColor}
        d="M14 0C6.27 0 0 6.27 0 14C0 24.5 14 40 14 40C14 40 28 24.5 28 14C28 6.27 21.73 0 14 0ZM14 19C11.24 19 9 16.76 9 14C9 11.24 11.24 9 14 9C16.76 9 19 11.24 19 14C19 16.76 16.76 19 14 19Z"/>
    </Svg>
  )
}
