import React from 'react'
import {
  Dimensions,
  View,
  ScrollView,
  Text,
  Linking,
  Pressable
} from 'react-native';
import i18n from 'i18next'
import { useTranslation } from 'react-i18next'
import Markdown from 'react-native-markdown-display';


export default function Info(props) {
  const { t, i18n } = useTranslation();
  const itemStyle = i => ({
    marginBottom: i == (t('info', { returnObjects: true }).length-1) ? 0 : 10,
    ...t('info', { returnObjects: true })[i].style
  })
  return (
    <View style={{paddingBottom: 10}}>
      {t('info', { returnObjects: true }).map((item, i) => {
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
          case 'markdown':
            return (
              <Markdown
                key={`${i}-markdown`}
                mergeStyle={true}
                style={{paragraph: {marginTop: 0, marginBottom: 3}, ...itemStyle(i)}}
              >
                {item.content}
              </Markdown>
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
