import React, { Component } from 'react'
import {
  Platform,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Image,
  AsyncStorage,
  ActivityIndicator
} from 'react-native'
import styles from '../../../styles'
import pageStyle from './styles'
import { Button } from '../../../components'
import Icon from "react-native-vector-icons/MaterialIcons";
import { postFormData, getFormData } from '../../../config/formHandler';
import { onSignIn } from '../../../routes/auth'
import StateManager from '../../StateManager';

export default class MyPlans extends Component {
  constructor(props){
    super(props)
    this.state = {
      activeTab: 1,
      user: false,
      extraData: false,
      plans: false,
      loading: true,
      upgraded: false,
      buttonLoading: false,
      nobalance: false
    }
  }

  static navigationOptions = { tabBarVisible: false }

  static navigationOptions = ({ navigation }) => {
    const { params } = navigation.state;
    return {
      tabBarVisible: false,
      headerLeft: <TouchableOpacity onPress={params ? params.backAction : {}}><View style={{paddingLeft: 15}}><Icon name="arrow-back" size={25} color="#fff" /></View></TouchableOpacity>
    }
  }

  backAction(){
    StateManager.getInstance().receiveData();
    this.props.navigation.goBack();
  }

  componentWillMount(){
    AsyncStorage.getItem('user', (err, result) => {
      result = JSON.parse(result)
      this.setState({
        user: result
      })
    })
  }

  moveToWallet(){
    this.props.navigation.goBack()
    this.props.navigation.navigate('Wallet')
    this.setState({
      nobalance: false
    })
  }

  componentDidMount(){
    this.props.navigation.setParams({ 
      backAction: this.backAction.bind(this) 
    });
    getFormData('professnalPlan', (response) => {
      console.log(response)
      this.setState({
        loading: false,
        plans: response.data,
        extraData: response
      })
    })
  }

  changeTab(index){
    this.setState({
      activeTab: index
    })
  }

  upgradePlan(id, price){
    let exp_date = new Date(this.state.user.exp_date).getTime()
    let today = new Date().getTime()
    if(exp_date < today){
      price = parseFloat(price);
      let data = {
        user_id: this.state.user.id,
        price: price,
        plan_id: id
      }
      console.log({
        user_id: this.state.user.id,
        price: price,
        plan_id: id
      })
      //return;
      if(this.state.user.my_avl_balance < price){
        this.setState({
          nobalance: true
        })
      }else {
        this.setState({
          buttonLoading: true
        })
        console.log('abcd', data)
        postFormData(data, 'upgradePlan', (response) => {
          console.log(response)
          onSignIn(response)
          this.setState({
            buttonLoading: false,
            upgraded: true
          })
        })
      }
    }else {
      alert('Your plan is active currently')
    }
  }

  render() {
    const { activeTab, plans, extraData, user, upgraded, nobalance } = this.state
    let exp_date = new Date(user.exp_date).getTime()
    let today = new Date().getTime()
    if(this.state.loading){
      return <View style={styles.loadingView}>
        <ActivityIndicator size="large" />
      </View>
    }
    const basicPlansView = plans.map((item, index) => {
      return <View style={pageStyle.planListingItem}>
        <Icon name={item.basic == 1 ? "add" : "remove"} size={20} color={item.basic == 1 ? "#00c020" : "red"} />
        <Text style={pageStyle.planListingItemText}>{item.feature}</Text>
      </View>
    })
    const monthlyPlansView = plans.map((item, index) => {
      return <View style={pageStyle.planListingItem}>
        <Icon name={item.monthly == 1 ? "add" : "remove"} size={20} color={item.monthly == 1 ? "#00c020" : "red"} />
        <Text style={pageStyle.planListingItemText}>{item.feature}</Text>
      </View>
    })
    const yearlyPlansView = plans.map((item, index) => {
      return <View style={pageStyle.planListingItem}>
        <Icon name={item.yearly == 1 ? "add" : "remove"} size={20} color={item.yearly == 1 ? "#00c020" : "red"} />
        <Text style={pageStyle.planListingItemText}>{item.feature}</Text>
      </View>
    })
    if(nobalance){
      return (
        <View style={[styles.scrollViewContainer, pageStyle.confirmationView]}>
          <Image style={pageStyle.moneybag} source={require('../../../assets/images/moneybag.png')} />
          <View style={pageStyle.confirmationApplyView}>
            <Text style={pageStyle.subtextJobPrice}>You don't have sufficient Money for Upgrade Plan. Please Click on add Money.</Text>
            <Button onPress={() => this.moveToWallet()} style={{backgroundColor: '#cf2525', paddingVertical: 10, width: '70%'}} text="ADD MONEY" />
            <View style={pageStyle.seperationView}>
              <View style={pageStyle.seperationLine} />
              <Text style={pageStyle.seperationText}>or</Text>
            </View>
            <Button onPress={() => this.setState({nobalance: false})} style={{backgroundColor: '#adadad', paddingVertical: 10, width: '70%'}} text="CANCEL" />
          </View>
        </View>
      )
    }
    return (
      <View style={styles.scrollViewContainer}>
       {!upgraded && <View style={styles.scrollViewContainer}>
        <View style={pageStyle.tabView}>
          <TouchableOpacity style={pageStyle.tab} onPress={() => this.changeTab(1)}>
            <View style={[pageStyle.tab, this.state.activeTab == 1 ? pageStyle.activeTab : {}]}>
              <Text style={pageStyle.tabText}>BASIC</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={pageStyle.tab} onPress={() => this.changeTab(2)}>
            <View style={[pageStyle.tab, this.state.activeTab == 2 ? pageStyle.activeTab : {}]}>
              <Text style={pageStyle.tabText}>MONTHLY</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={pageStyle.tab} onPress={() => this.changeTab(3)}>
            <View style={[pageStyle.tab, this.state.activeTab == 3 ? pageStyle.activeTab : {}]}>
              <Text style={pageStyle.tabText}>YEARLY</Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={pageStyle.tabContent}>
          {activeTab == 1 && <ScrollView keyboardShouldPersistTaps="always" showsVerticalScrollIndicator={false}>
            <View style={pageStyle.balanceView}>
              <Text style={pageStyle.balanceText}>YOUR BALANCE</Text>
              <Text style={pageStyle.balance}>AUD {user.my_avl_balance}</Text>
            </View>
            <View style={pageStyle.planTypeView}>
              <View style={pageStyle.planTypeCircle}>
                <Text style={pageStyle.planTypeCircleText}>BASIC</Text>
                <Text style={pageStyle.planTypeCirclePriceText}>( FREE )</Text>
              </View>
            </View>
            <View style={pageStyle.planListing}>
              {basicPlansView}
            </View>
          </ScrollView>}

          {activeTab == 2 && <ScrollView keyboardShouldPersistTaps="always" showsVerticalScrollIndicator={false}>
            <View style={pageStyle.balanceView}>
              <Text style={pageStyle.balanceText}>YOUR BALANCE</Text>
              <Text style={pageStyle.balance}>AUD {user.my_avl_balance}</Text>
            </View>
            <View style={pageStyle.planTypeView}>
              <View style={pageStyle.planTypeCircle}>
                <Text style={pageStyle.planTypeCircleText}>MONTHLY</Text>
                <Text style={pageStyle.planTypeCirclePriceText}>${extraData.Month_price_info.slice(0, -3)}</Text>
              </View>
            </View>
            <View style={pageStyle.planListing}>
              {monthlyPlansView}
            </View>
          </ScrollView>}

          {activeTab == 3 && <ScrollView keyboardShouldPersistTaps="always" showsVerticalScrollIndicator={false}>
            <View style={pageStyle.balanceView}>
              <Text style={pageStyle.balanceText}>YOUR BALANCE</Text>
              <Text style={pageStyle.balance}>AUD {user.my_avl_balance}</Text>
            </View>
            <View style={pageStyle.planTypeView}>
              <View style={pageStyle.planTypeCircle}>
                <Text style={pageStyle.planTypeCircleText}>YEARLY</Text>
                <Text style={pageStyle.planTypeCirclePriceText}>${extraData.Year_price_info.slice(0, -3)}</Text>
              </View>
            </View>
            <View style={pageStyle.planListing}>
              {yearlyPlansView}
            </View>
          </ScrollView>}
        </View>

        {((activeTab == 1 && user.professional_plan_id == 1) || (activeTab == 1 && exp_date < today)) && <Button containerStyle={pageStyle.submitButton} style={{backgroundColor: '#00c020', paddingVertical: 10}} loading={this.state.buttonLoading} text="CURRENT" />}

        {activeTab == 2 && (user.professional_plan_id < 2 || exp_date < today || user.professional_plan_id == 2) && <Button containerStyle={pageStyle.submitButton} style={{backgroundColor: '#00c020', paddingVertical: 10}} loading={this.state.buttonLoading} onPress={() => (user.professional_plan_id == 2 && exp_date < today) ? this.upgradePlan(2, extraData.Month_price_info.slice(0, -3)) : ''} text={exp_date < today ? "UPGRADE" : user.professional_plan_id == 2 ? "CURRENT" : "UPGRADE"} />}
        
        {activeTab == 3 && (user.membership_status != 'Active' || exp_date < today || user.professional_plan_id == 3) && <Button containerStyle={pageStyle.submitButton} style={{backgroundColor: '#00c020', paddingVertical: 10}} loading={this.state.buttonLoading} onPress={() => user.membership_status != 'Active' || exp_date < today ? this.upgradePlan(3, extraData.Year_price_info.slice(0, -3)) : ''} text={user.professional_plan_id == 3 ? "CURRENT" : "UPGRADE"} />}
       </View>}
       {upgraded && <View style={styles.scrollViewContainer}>
        <View style={pageStyle.upgradedView}>
          <Image style={pageStyle.congratsIcon} source={(require('../../../assets/images/congratulation.png'))} />
          <Text style={pageStyle.congratsTextFirst}>Congratulations!</Text>
          <Text style={pageStyle.congratsTextSecond}>You have successfully upgraded your plan!</Text>
        </View>
       </View>}
      </View>
    );
  }
}