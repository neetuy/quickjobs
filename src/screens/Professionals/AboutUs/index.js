import React, { Component } from 'react'
import {
  Platform,
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator
} from 'react-native'
import styles from '../../../styles'
import pageStyle from './styles'
import HTML from 'react-native-render-html'
import { getFormData } from '../../../config/formHandler'

export default class AboutUs extends Component {
  constructor(props){
    super(props)
    this.state = {
      loading: true,
      content: false
    }
  }

  static navigationOptions = ({ navigation }) => {
    const { params } = navigation.state;
    return {
      headerTitle: params.mission ? 'Our Mission' : 'About Us',
      headerStyle: {
        elevation: 0,
        backgroundColor: '#cf2525',
        color: '#fff'
      },
      headerTintColor: "#fff"
    }
  }

  componentWillMount(){
    getFormData('aboutUs', (response) => {
      if(response){
        this.setState({
          content: response[0].description,
          loading: false
        })
      }else {
        this.setState({
          loading: false
        })
      }
    })
  }

  render() {
    return (
      <View style={styles.container}>
        <ScrollView style={[styles.scrollViewContainer, {padding: 20}]} showsVerticalScrollIndicator={false}>
          {this.state.loading && <ActivityIndicator size="large" />}
          {!this.state.loading && <HTML html={this.state.content} imagesMaxWidth="100%" />}
        </ScrollView>
      </View>
    );
  }
}