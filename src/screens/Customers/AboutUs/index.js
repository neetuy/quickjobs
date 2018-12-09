import React, { Component } from 'react'
import {
  Platform,
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  ImageBackground,
  Dimensions
} from 'react-native'
import styles from '../../../styles'
import pageStyle from './styles'
import HTML from 'react-native-render-html'
import { getFormData } from '../../../config/formHandler'
const { width, height } = Dimensions.get('window');

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
      headerTitle: params.mission ? 'Our Mission' : 'About Us'
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
        <ScrollView style={[styles.scrollViewContainer]} showsVerticalScrollIndicator={false}>
          {this.state.loading && <View style={{padding: 20}}><ActivityIndicator size="large" /></View>}
          {!this.state.loading && <ImageBackground source={require('../../../assets/images/about_bg.png')} style={{width, height, padding: 20}}><View style={{backgroundColor: '#f7f7f7', padding: 10}}><HTML html={this.state.content} imagesMaxWidth="100%" /></View></ImageBackground>}
        </ScrollView>
      </View>
    );
  }
}