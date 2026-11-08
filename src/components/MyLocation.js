import React from 'react'
import Svg, {
  Path
} from 'react-native-svg'

export default function MyLocation(props) {
  return (
    <Svg width={props.width} height={props.height} viewBox="0 0 24 24">
      <Path style={{fill: 'none'}} d="M0,0h24v24H0V0z"/>
      <Path style={{fill: '#333'}} d="M12,7c-2.8,0-5,2.2-5,5s2.2,5,5,5s5-2.2,5-5S14.8,7,12,7z M20.9,11c-0.5-4.2-3.8-7.5-7.9-7.9V1h-2v2.1
        C6.8,3.5,3.5,6.8,3.1,11H1v2h2.1c0.5,4.2,3.8,7.5,7.9,7.9V23h2v-2.1c4.2-0.5,7.5-3.8,7.9-7.9H23v-2C23,11,20.9,11,20.9,11z M12,19
        c-3.9,0-7-3.1-7-7s3.1-7,7-7s7,3.1,7,7S15.9,19,12,19z"/>
    </Svg>
  )
}