import React, { Component } from 'react'
import {
  Platform,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  AsyncStorage,
  Image,
  KeyboardAvoidingView,
  ActivityIndicator,
  ActionSheetIOS
} from 'react-native'
import styles from '../../../styles'
import pageStyle from './styles'
import { TextField, Button, DropDown, Check, TextFieldAddress, DateField } from '../../../components'
import Icon from "react-native-vector-icons/FontAwesome";
import MapView, { Marker } from 'react-native-maps'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { postFormData } from '../../../config/formHandler'
import ImagePicker from "react-native-image-picker";
var FileUpload = require('NativeModules').FileUpload
import RNFetchBlob from 'react-native-fetch-blob'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default class NewJob extends Component {
  constructor(props){
    super(props)
    this.onRegionChange = this.onRegionChange.bind(this)
    this.state = {
      pageLoading: true,
      loading: false,
      job_id: "J"+Math.floor(Math.random() * 90000)+"",
      mainServices: [
        {
          id: 'locksmith',
          sub_category_name: 'Lock Smith'
        }
      ],
      selectedMainService: '',
      subServices: false,
      selectedSubService: false,
      reqPref: [
        {
          id: 'asap',
          name: 'ASAP'
        },
        {
          id: 'later',
          name: 'Later'
        }
      ],
      selectedReqPref: 'asap',
      mainQuestions: [],
      subQuestions: [],
      later_date: "",
      later_time: "",
      job_type: false,
      category2_id: false,
      category3_id: false,
      job_address: [
        {
          id: 'register',
          name: 'Registered Address'
        },
        {
          id: 'other',
          name: 'Other'
        }
      ],
      selected_job_address: 'register',
      registered_address:  false,
      address1: false,
      lat: false,
      lng: false,
      neighbourhood: false,
      job_title: false,
      job_titleError: false,
      description: false,
      descriptionError: false,
      required_pref: false,
      exact_time: false,
      user_info: false,
      image1: false,
      image1Path: false,
      image2: false,
      image2Path: false,
      image3: false,
      image3Path: false,
      agree: false,
      submitted: false,
      activePainter: 1,
      painterHFirst: '',
      painterHFirstError: '',
      painterDFirst: '',
      painterDFirstError: '',
      painterHSecond: '',
      painterHSecondError: '',
      painterDSecond: '',
      painterDSecondError: '',
    }
  }

  static navigationOptions = { tabBarVisible: false }

  componentWillMount(){
    const { params } = this.props.navigation.state
    AsyncStorage.getItem('user', (err, result) => {
      result = JSON.parse(result)
      console.log(result)
      if(result !== null){
        this.setState({
          user_info: result,
          lat: result.add1_latitude ? result.add1_latitude : false,
          lng: result.add1_longitude ? result.add1_longitude : false,
          selected_job_address: result.address1 == '' ? 'other' : 'register'
        })
      }
    })
    let data = {
      cat_id: 20
    }
    if(params){
      if(params.searched){
        let datatosend = {
          category_name: params.category_id
        }
        postFormData(datatosend, 'checkHomeCategory', (response) => {
          if(response){
            response.all_category2.forEach((response_e, index) => {
              if(response_e.sub_category_name == response.category2.sub_category_name){
                this.setState({
                  selectedMainService: response_e.id,
                  mainServices: response.all_category2
                }, () => {
                  this.selectSubCategory(response_e.id, index, (subResponse) => {
                    if(response.check_category3 == 'yes'){
                      this.state.subServices.forEach((item, index) => {
                        if(item.sub_sub_name == response.category3.sub_sub_name){
                          this.setState({
                            selectedSubService: item.id
                          })
                        }
                      })
                    }
                    let data = {
                      cat_id: response_e.id
                    }
                    postFormData(data, 'getSubCatQuesstions', (response) => {
                      if(response){
                        this.setState({
                          mainQuestions: response,
                          subQuestions: []
                        })
                      }else {
                        this.setState({
                          mainQuestions: [],
                          subQuestions: []
                        })
                      }
                      this.setState({
                        loading: false
                      })
                    })
                  })
                })
              }
            })
          }
        })
        return;
      }
    }
    postFormData(data, 'getSubCategory', (response) => {
      if(response){
        response.forEach((response_e, index) => {
          if(response_e.id == params.category_id){
            this.setState({
              selectedMainService: response_e.id,
              mainServices: response
            }, () => {
              this.selectSubCategory(response_e.id, index)
              let data = {
                cat_id: response_e.id
              }
              postFormData(data, 'getSubCatQuesstions', (response) => {
                if(response){
                  this.setState({
                    mainQuestions: response,
                    subQuestions: []
                  })
                }else {
                  this.setState({
                    mainQuestions: [],
                    subQuestions: []
                  })
                }
              })
            })
          }
        })
      }
    })
  }

  selectSubCategory(value, index, callback){
    const { params } = this.props.navigation.state
    this.setState({
      job_type: this.state.mainServices[index].JobTypes.type_name
    })
    this.setState({
      selectedMainService: value,
      category2_id: value,
      mainQuestions: [],
      subQuestions: []
    }, () => {
      let data = {
        cat_id: value
      }
      postFormData(data, 'getSubSubCategory', (response) => {
        if(response.length > 0){
          this.setState({
            selectedSubService: response[0].id,
            category3_id: response[0].id,
            subServices: response,
            pageLoading: false
          }, () => {
            if(params){
              if(params.searched){
                callback(true)
              }
            }
            let data = {
              cat_id: response[0].id
            }
            postFormData({cat_id: value}, 'getSubCatQuesstions', (response) => {
              if(response.length > 0){
                this.setState({
                  mainQuestions: response,
                  subQuestions: []
                }, () => {
                  postFormData(data, 'getSubSubCatQuesstions', (response) => {
                    if(response.length > 0){
                      this.setState({
                        subQuestions: response
                      })
                    }else {
                      this.setState({
                        subQuestions: []
                      })
                    }
                  })
                })
              }else {
                this.setState({
                  mainQuestions: [],
                  subQuestions: []
                })
              }
            })
          })
        }else {
          this.setState({
            subServices: [],
            pageLoading: false
          })
        }
      })
    })
  }

  changeSection(index){
    this.setState({
      activePainter: index
    })
  }

  selectSubSubCategory(value){
    this.setState({
      selectedSubService: value,
      category3_id: value,
      subQuestions: []
    }, () => {
      let data = {
        cat_id: value
      }
      postFormData(data, 'getSubSubCatQuesstions', (response) => {
        if(response.length > 0){
          this.setState({
            subQuestions: response
          })
        }else {
          this.setState({
            subQuestions: []
          })
        }
      })
    })
  }

  openActionSheet(type, items){
    let newItems = ['Cancel'];
    items.forEach((item) => {
      newItems.push(item.name)
    })
    ActionSheetIOS.showActionSheetWithOptions({
      options: newItems,
      cancelButtonIndex: 0,
    },
    (buttonIndex) => {
      if(buttonIndex != 0){
        this.state[type] = items[buttonIndex-1].id
        this.setState(this.state)
      }
    });
  }

  queInput(type, index, value){
    this.state[type][index].selected = value
    this.setState({
      [type]: this.state[type]
    })
  }

  multipleCheck(type, index, value){
    if(!this.state[type][index].selected){
      this.state[type][index].selected = [value]
    }else {
      if(this.state[type][index].selected.indexOf(value) > -1){
        this.state[type][index].selected.splice(this.state[type][index].selected.indexOf(value), 1)
      }else {
        this.state[type][index].selected.push(value)
      }
    }
    this.setState({
      [type]: this.state[type]
    })
  }

  selectCheck(type, index, value){
    this.state[type][index].selected = [value]
    this.setState({
      [type]: this.state[type]
    })
  }

  selectImage(type, index){
    var options = {
      title: 'Select Image '+index,
      mediaType: 'photo',
      storageOptions: {
        skipBackup: true,
        path: 'images'
      }
    };
    ImagePicker.showImagePicker(options, (response) => {    
      if (response.didCancel) {
        console.log('User cancelled image picker');
      }
      else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      }
      else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      }
      else {
        let source = { uri: response.uri };
        this.setState({
          [type]: source,
          [type+'Path']: Platform.OS == 'android' ? response.path : response.uri
        });
      }
    });
  }

  onRegionChange(details) {
    if(details.geometry){
      this.setState({
        address1: details.formatted_address,
        neighbourhood: details.name,
        lng: details.geometry.location.lng,
        lat: details.geometry.location.lat
      })
    }
  }

  submit(){
    const { goBack } = this.props.navigation;
    if(this.state.agree){
      let error = 0;
      if(!this.state.job_title){
        this.setState({
          job_titleError: true
        })
        error = 1;
      }else {
        this.setState({
          job_titleError: false
        })
      }
      if(!this.state.description){
        this.setState({
          descriptionError: true
        })
        error = 1;
      }else {
        this.setState({
          descriptionError: false
        })
      }
      if(this.state.selected_job_address == 'other'){
        if(!this.state.lat){
          this.setState({
            addressError: true
          })
          error = 1;
        }else {
          this.setState({
            addressError: false
          })
        }
      }else {
        if(!this.state.lat){
          alert('Enter address in My profile or use other Address')
          return
        }
      }
      if(this.state.job_type == 'Coin Based Hour Job'){
        if(this.state.activePainter == 1){
          if(!this.state.painterHFirst){
            this.setState({
              painterHFirstError: true
            })
            error = 1;
          }else {
            this.setState({
              painterHFirstError: false
            })
          }
          if(!this.state.painterHSecond){
            this.setState({
              painterHSecondError: true
            })
            error = 1;
          }else {
            this.setState({
              painterHSecondError: false
            })
          }
        }
        if(this.state.activePainter == 2){
          if(!this.state.painterDFirst){
            this.setState({
              painterDFirstError: true
            })
            error = 1;
          }else {
            this.setState({
              painterDFirstError: false
            })
          }
          if(!this.state.painterDSecond){
            this.setState({
              painterDSecondError: true
            })
            error = 1;
          }else {
            this.setState({
              painterDSecondError: false
            })
          }
        }
      }
      if(error == 1){
        return;
      }
      let data = {
        customer_id: this.state.user_info.id,
        job_id: this.state.job_id,
        job_type: this.state.job_type,
        category2_id: this.state.category2_id,
        category3_id: this.state.category3_id,
        job_address: this.state.selected_job_address,
        registered_address: this.state.selected_job_address == 'other' ? '' : this.state.user_info.address1,
        address1: this.state.selected_job_address == 'other' ? this.state.address1 : '',
        lat: this.state.selected_job_address == 'other' ?this.state.lat : this.state.user_info.add1_latitude,
        lng: this.state.selected_job_address == 'other' ?this.state.lng : this.state.user_info.add1_longitude,
        neighbourhood: this.state.selected_job_address == 'other' ?this.state.neighbourhood : this.state.user_info.neighbourhood,
        job_title: this.state.job_title,
        description: this.state.description,
        required_pref: this.state.selectedReqPref,
        exact_time: this.state.later_time,
        exact_date: this.state.later_date,
        jobQuestions: [],
        image: []
      }
      if(this.state.job_type == 'Coin Based Hour Job'){
        data.hourly_job_type = this.state.activePainter == 1 ? 'Hour Basis' : 'Daily Basis'
        if(this.state.activePainter == 1){
          data.hourly_time = this.state.painterHFirst ? this.state.painterHFirst : 0
          data.hourly_minute = this.state.painterHSecond ? this.state.painterHSecond : 0
        }
        if(this.state.activePainter == 2){
          data.how_many_day = this.state.painterDFirst ? this.state.painterDFirst : 0
          data.per_hrs_day = this.state.painterDSecond ? this.state.painterDSecond : 0
        }
      }
      let required_error = 0
      if(this.state.mainQuestions.length > 0){
        this.state.mainQuestions.forEach(element => {
          if(element.question_type == 'input'){
            if(element.question_status != 'No'){
              if(element.selected == ''){
                required_error = 1
              }else if(element.selected){
                data.jobQuestions.push({
                  quesstion: element.question,
                  type: element.question_type,
                  answer: element.selected
                })
              }else {
                required_error = 1
              }
            }else {
              data.jobQuestions.push({
                quesstion: element.question,
                type: element.question_type,
                answer: element.selected ? element.selected : ''
              })
            }
          }
          if(element.question_type == 'radio'){
            if(element.question_status != 'No'){
              if(element.selected){
                if(element.selected.length > 0){
                  data.jobQuestions.push({
                    quesstion: element.question,
                    type: element.question_type,
                    answer: element.selected ? element.selected[0] : null
                  })
                }else {
                  required_error = 1
                }
              }else {
                required_error = 1
              }
            }else {
              data.jobQuestions.push({
                quesstion: element.question,
                type: element.question_type,
                answer: element.selected ? element.selected[0] : null
              })
            }
          }
          if(element.question_type == 'checkbox'){
            if(element.question_status != 'No'){
              if(element.selected){
                if(element.selected.length > 0){
                  data.jobQuestions.push({
                    quesstion: element.question,
                    type: element.question_type,
                    answer: element.selected ? [
                      element.selected.indexOf(element.first_option) > -1 ? element.first_option : null,
                      element.selected.indexOf(element.second_option) > -1 ? element.second_option : null,
                      element.selected.indexOf(element.third_option) > -1 ? element.third_option : null,
                      element.selected.indexOf(element.fourth_option) > -1 ? element.fourth_option : null,
                    ] : null
                  })
                }else {
                  required_error = 1
                }
              }else {
                required_error = 1
              }
            }else {
              data.jobQuestions.push({
                quesstion: element.question,
                type: element.question_type,
                answer: element.selected ? [
                  element.selected.indexOf(element.first_option) > -1 ? element.first_option : null,
                  element.selected.indexOf(element.second_option) > -1 ? element.second_option : null,
                  element.selected.indexOf(element.third_option) > -1 ? element.third_option : null,
                  element.selected.indexOf(element.fourth_option) > -1 ? element.fourth_option : null,
                ] : null
              })
            }
          }
        });
      }
      if(this.state.subQuestions.length > 0){
        this.state.subQuestions.forEach(element => {
          if(element.question_type == 'input'){
            if(element.question_status != 'No'){
              if(element.selected == ''){
                required_error = 1
              }else if(element.selected){
                data.jobQuestions.push({
                  quesstion: element.question,
                  type: element.question_type,
                  answer: element.selected
                })
              }else {
                required_error = 1
              }
            }else {
              data.jobQuestions.push({
                quesstion: element.question,
                type: element.question_type,
                answer: element.selected ? element.selected : ''
              })
            }
          }
          if(element.question_type == 'radio'){
            if(element.question_status != 'No'){
              if(element.selected){
                if(element.selected.length > 0){
                  data.jobQuestions.push({
                    quesstion: element.question,
                    type: element.question_type,
                    answer: element.selected ? element.selected[0] : null
                  })
                }else {
                  required_error = 1
                }
              }else {
                required_error = 1
              }
            }else {
              data.jobQuestions.push({
                quesstion: element.question,
                type: element.question_type,
                answer: element.selected ? element.selected[0] : null
              })
            }
          }
          if(element.question_type == 'checkbox'){
            if(element.question_status != 'No'){
              if(element.selected){
                if(element.selected.length > 0){
                  data.jobQuestions.push({
                    quesstion: element.question,
                    type: element.question_type,
                    answer: element.selected ? [
                      element.selected.indexOf(element.first_option) > -1 ? element.first_option : null,
                      element.selected.indexOf(element.second_option) > -1 ? element.second_option : null,
                      element.selected.indexOf(element.third_option) > -1 ? element.third_option : null,
                      element.selected.indexOf(element.fourth_option) > -1 ? element.fourth_option : null,
                    ] : null
                  })
                }else {
                  required_error = 1
                }
              }else {
                required_error = 1
              }
            }else {
              data.jobQuestions.push({
                quesstion: element.question,
                type: element.question_type,
                answer: element.selected ? [
                  element.selected.indexOf(element.first_option) > -1 ? element.first_option : null,
                  element.selected.indexOf(element.second_option) > -1 ? element.second_option : null,
                  element.selected.indexOf(element.third_option) > -1 ? element.third_option : null,
                  element.selected.indexOf(element.fourth_option) > -1 ? element.fourth_option : null,
                ] : null
              })
            }
          }
        });
      }
      if(required_error){
        this.setState({
          loading: false
        })
        alert('Please answer all the required questions')
        return false;
      }
      this.setState({
        loading: true
      })
      let form_data = [
        { name : 'customer_id', data : String(this.state.user_info.id)},
        { name : 'job_id', data : String(data.job_id)},
        { name : 'job_type', data : String(data.job_type)},
        { name : 'category2_id', data : String(data.category2_id)},
        { name : 'category3_id', data : String(data.category3_id)},
        { name : 'job_address', data : String(data.job_address)},
        { name : 'registered_address', data : String(data.registered_address)},
        { name : 'address1', data : String(data.address1)},
        { name : 'lat', data : String(data.lat)},
        { name : 'lng', data : String(data.lng)},
        { name : 'neighbourhood', data : String(data.neighbourhood)},
        { name : 'job_title', data : String(data.job_title)},
        { name : 'description', data : String(data.description)},
        { name : 'required_pref', data : String(data.required_pref)},
        { name : 'exact_time', data : String(data.exact_time)},
        { name : 'exact_date', data : String(data.exact_date)},
        { name : 'jobQuestions', data : JSON.stringify(data.jobQuestions)}
      ]
      if(data.hourly_job_type == 'Hour Basis'){
        form_data.push({
          name : 'hourly_job_type',
          data : String(data.hourly_job_type)
        })
        form_data.push({
          name : 'hourly_minute',
          data : String(data.hourly_minute)
        })
        form_data.push({
          name : 'hourly_time',
          data : String(data.hourly_time)
        })
      }
      if(data.hourly_job_type == 'Daily Basis'){
        form_data.push({
          name : 'hourly_job_type',
          data : String(data.hourly_job_type)
        })
        form_data.push({
          name : 'how_many_day',
          data : String(data.how_many_day)
        })
        form_data.push({
          name : 'per_hrs_day',
          data : String(data.per_hrs_day)
        })
      }
      if(this.state.image1Path){
        form_data.push({
          name : 'image1',
          filename : 'imagefile.png',
          type:'image/jpeg',
          data: RNFetchBlob.wrap(this.state.image1Path)
        })
      }
      if(this.state.image2Path){
        form_data.push({
          name : 'image2',
          filename : 'imagefile2.png',
          type:'image/jpeg',
          data: RNFetchBlob.wrap(this.state.image2Path)
        })
      }
      if(this.state.image3Path){
        form_data.push({
          name : 'image3',
          filename : 'imagefile3.png',
          type:'image/jpeg',
          data: RNFetchBlob.wrap(this.state.image3Path)
        })
      }
      console.log(JSON.stringify(form_data));
      //return;
      RNFetchBlob.fetch('POST', 'https://quickjobs4u.com.au/api/home/createJob', {
        'Content-Type' : 'multipart/form-data',
      }, form_data).then((resp) => {
        this.setState({
          loading: false,
          submitted: true
        })
      }).catch((err) => {
        this.setState({
          loading: false
        })
      })
    }else {
      alert('Please agree to terms of use')
    }
  }

  render() {
    const { goBack } = this.props.navigation;
    if(this.state.pageLoading){
      return <View style={styles.loadingView}>
        <ActivityIndicator size="large" />
      </View>
    }
    let question_count = 1
    return (
      <View style={styles.container}>
        <KeyboardAwareScrollView style={styles.scrollViewContainer} keyboardShouldPersistTaps="always" showsVerticalScrollIndicator={false}>
          {!this.state.submitted && <View style={styles.formView}>
            <TextField editable={false} value={this.state.job_id} label="YOUR JOB ID" />
            
            <DropDown onPress={() => this.openActionSheet('selectedMainService', this.state.mainServices)} selectType="sub_category_name" pickers={this.state.mainServices} value={this.state.selectedMainService} label="SERVICE REQUIRED" onValueChange={(value, index) => this.selectSubCategory(value, index)} />

            {this.state.subServices && <DropDown onPress={() => this.openActionSheet('selectedSubService', this.state.subServices)} selectType="sub_sub_name" pickers={this.state.subServices} value={this.state.selectedSubService} label="TYPE" onValueChange={(value) => this.selectSubSubCategory(value)} />}

            {this.state.job_type == 'Coin Based Hour Job' && <Text style={{alignSelf: 'flex-start', color: '#afafaf', fontSize: 12}}>FOR HOW LONG?</Text>}

            {this.state.job_type == 'Coin Based Hour Job' && <View style={pageStyle.sectionView}>
              <View style={pageStyle.sectionBlock}>
                <View style={pageStyle.headingView}>
                  <Check checked={this.state.activePainter == 1 ? true : false} onPress={() => this.changeSection(1)} checkedColor="#cf2525" style={pageStyle.radio} round />
                  <Text style={pageStyle.heading}>Hour Basis (Enter Min 30 min)</Text>
                </View>
                {this.state.activePainter == 1 && <View style={pageStyle.contentView}>
                  <View style={pageStyle.textFieldBlock}>
                    <View style={[styles.multipleColumnView, {justifyContent: 'space-between'}]}>
                      <View style={[pageStyle.textFieldView, {width: '48%', borderColor: this.state.painterHFirstError ? '#fa0000' : '#cecece'}]}>
                        <TextField placeholder="2" value={this.state.painterHFirst} keyboardType="numeric" inputStyle={{borderBottomWidth: 0}} style={pageStyle.textfield} onChangeText={(value) => this.setState({painterHFirst: value})} />
                        <View style={pageStyle.textFieldContentView}>
                          <Text style={pageStyle.textFieldContentText}>Hrs</Text>
                        </View>
                      </View>
                      <View style={[pageStyle.textFieldView, {width: '48%', borderColor: this.state.painterHSecondError ? '#fa0000' : '#cecece'}]}>
                        <TextField value={this.state.painterHSecond} keyboardType="numeric" placeholder="30" inputStyle={{borderBottomWidth: 0}} onChangeText={(value) => this.setState({painterHSecond: value})} style={pageStyle.textfield} />
                        <View style={pageStyle.textFieldContentView}>
                          <Text style={pageStyle.textFieldContentText}>Min</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>}
              </View>
              <View style={pageStyle.sectionBlock}>
                <View style={pageStyle.headingView}>
                  <Check checked={this.state.activePainter == 2 ? true : false} onPress={() => this.changeSection(2)} checkedColor="#cf2525" style={pageStyle.radio} round />
                  <Text style={pageStyle.heading}>Daily Basis</Text>
                </View>
                {this.state.activePainter == 2 && <View style={pageStyle.contentView}>
                  <View style={pageStyle.textFieldBlock}>
                    <View style={[styles.multipleColumnView, {justifyContent: 'space-between'}]}>
                      <View style={[pageStyle.textFieldView, {width: '48%', borderColor: this.state.painterDFirstError ? '#fa0000' : '#cecece'}]}>
                        <TextField value={this.state.painterDFirst} keyboardType="numeric" inputStyle={{borderBottomWidth: 0}} onChangeText={(value) => this.setState({painterDFirst: value})} style={pageStyle.textfield} />
                        <View style={pageStyle.textFieldContentView}>
                          <Text style={pageStyle.textFieldContentText}>Days</Text>
                        </View>
                      </View>
                      <View style={[pageStyle.textFieldView, {width: '48%', borderColor: this.state.painterDSecondError ? '#fa0000' : '#cecece'}]}>
                        <TextField value={this.state.painterDSecond} keyboardType="numeric" inputStyle={{borderBottomWidth: 0}} style={pageStyle.textfield} onChangeText={(value) => this.setState({painterDSecond: value})} />
                        <View style={pageStyle.textFieldContentView}>
                          <Text style={pageStyle.textFieldContentText}>Hrs/Day</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>}
              </View>
            </View>}
            
            {this.state.mainQuestions.map((item,index) => {
              if(item.question_type == 'input'){
                return <TextField required={item.question_status != 'No' ? true : false} onChangeText={(value) => this.queInput('mainQuestions', index, value)} label={'Q'+(question_count++)+' '+item.question} />
              }
              if(item.question_type == 'radio'){
                return (
                  <View style={pageStyle.radioView}>
                    <Check style={pageStyle.checkboxBlock} onPress={() => this.selectCheck('mainQuestions', index, item.first_option)} round text={item.first_option} label={'Q'+(question_count++)+' '+item.question+(item.question_status == 'yes' ? '*' : '')} checked={item.selected ? item.selected == item.first_option ? true : false : false} />
                    <Check style={pageStyle.checkboxBlock} onPress={() => this.selectCheck('mainQuestions', index, item.second_option)} round text={item.second_option} checked={item.selected ? item.selected == item.second_option ? true : false : false} label=" " />
                    <Check style={pageStyle.checkboxBlock} onPress={() => this.selectCheck('mainQuestions', index, item.third_option)} round text={item.third_option} checked={item.selected ? item.selected == item.third_option ? true : false : false} />
                    <Check style={pageStyle.checkboxBlock} onPress={() => this.selectCheck('mainQuestions', index, item.fourth_option)} round text={item.fourth_option} checked={item.selected ? item.selected == item.fourth_option ? true : false : false} />
                  </View>
                )
              }
              if(item.question_type == 'checkbox'){
                return (
                  <View style={pageStyle.radioView}>
                    <Check style={pageStyle.checkboxBlock} onPress={() => this.multipleCheck('mainQuestions', index, item.first_option)} text={item.first_option} label={'Q'+(question_count++)+' '+item.question+(item.question_status == 'yes' ? '*' : '')} checked={item.selected ? item.selected.indexOf(item.first_option) > -1 ? true : false : false} />
                    <Check style={pageStyle.checkboxBlock} onPress={() => this.multipleCheck('mainQuestions', index, item.second_option)} text={item.second_option} checked={item.selected ? item.selected.indexOf(item.second_option) > -1 ? true : false : false} label=" " />
                    <Check style={pageStyle.checkboxBlock} onPress={() => this.multipleCheck('mainQuestions', index, item.third_option)} text={item.third_option} checked={item.selected ? item.selected.indexOf(item.third_option) > -1 ? true : false : false} />
                    <Check style={pageStyle.checkboxBlock} onPress={() => this.multipleCheck('mainQuestions', index, item.fourth_option)} text={item.fourth_option} checked={item.selected ? item.selected.indexOf(item.fourth_option) > -1 ? true : false : false} />
                  </View>
                )
              }
            })}
            {this.state.subQuestions.map((item,index) => {
              if(item.question_type == 'input'){
                return <TextField required={item.question_status != 'No' ? true : false} onChangeText={(value) => this.queInput('subQuestions', index, value)} label={'Q'+(question_count++)+' '+item.question+(item.question_status == 'yes' ? '*' : '')} />
              }
              if(item.question_type == 'radio'){
                return (
                  <View style={pageStyle.radioView}>
                    <Check style={pageStyle.checkboxBlock} onPress={() => this.selectCheck('subQuestions', index, item.first_option)} round text={item.first_option} label={'Q'+(question_count++)+' '+item.question+(item.question_status == 'yes' ? '*' : '')} checked={item.selected ? item.selected == item.first_option ? true : false : false} />
                    <Check style={pageStyle.checkboxBlock} onPress={() => this.selectCheck('subQuestions', index, item.second_option)} round text={item.second_option} checked={item.selected ? item.selected == item.second_option ? true : false : false} label=" " />
                    <Check style={pageStyle.checkboxBlock} onPress={() => this.selectCheck('subQuestions', index, item.third_option)} round text={item.third_option} checked={item.selected ? item.selected == item.third_option ? true : false : false} />
                    <Check style={pageStyle.checkboxBlock} onPress={() => this.selectCheck('subQuestions', index, item.fourth_option)} round text={item.fourth_option} checked={item.selected ? item.selected == item.fourth_option ? true : false : false} />
                  </View>
                )
              }
              if(item.question_type == 'checkbox'){
                return (
                  <View style={pageStyle.radioView}>
                    <Check style={pageStyle.checkboxBlock} onPress={() => this.multipleCheck('subQuestions', index, item.first_option)} text={item.first_option} label={'Q'+(question_count++)+' '+item.question+(item.question_status == 'yes' ? '*' : '')} checked={item.selected ? item.selected.indexOf(item.first_option) > -1 ? true : false : false} />
                    <Check style={pageStyle.checkboxBlock} onPress={() => this.multipleCheck('subQuestions', index, item.second_option)} text={item.second_option} checked={item.selected ? item.selected.indexOf(item.second_option) > -1 ? true : false : false} label=" " />
                    <Check style={pageStyle.checkboxBlock} onPress={() => this.multipleCheck('subQuestions', index, item.third_option)} text={item.third_option} checked={item.selected ? item.selected.indexOf(item.third_option) > -1 ? true : false : false} />
                    <Check style={pageStyle.checkboxBlock} onPress={() => this.multipleCheck('subQuestions', index, item.fourth_option)} text={item.fourth_option} checked={item.selected ? item.selected.indexOf(item.fourth_option) > -1 ? true : false : false} />
                  </View>
                )
              }
            })}
            {this.state.user_info.address1 != '' && <DropDown onPress={() => this.openActionSheet('selected_job_address', this.state.job_address)} selectType="name" pickers={this.state.job_address} value={this.state.selected_job_address} label="WHERE IS THE JOB?" onValueChange={(value) => this.setState({
              selected_job_address: value
            })} />}
            {this.state.selected_job_address == 'other' && <TextFieldAddress style={{borderBottomColor: this.state.addressError ? '#fa0000' : '#dedede'}} onPress={(data, details = null) => {
              this.onRegionChange(details)
            }} label="ADDRESS" value="" />}
            {this.state.lat && <MapView style={pageStyle.map}
            region={{
              latitude: parseFloat(this.state.lat),
              longitude: parseFloat(this.state.lng),
              latitudeDelta: 0.2,
              longitudeDelta: 0.2,
            }}
            onRegionChange={this.onRegionChange}>
              <Marker coordinate={{latitude: parseFloat(this.state.lat),longitude: parseFloat(this.state.lng)}} />
            </MapView>}
            <TextField required inputStyle={{borderBottomColor: this.state.job_titleError ? '#fa0000' : '#dedede'}} onChangeText={(job_title) => this.setState({job_title})} label="JOB TITLE/NAME OF JOB" />
            <TextField required inputStyle={{borderBottomColor: this.state.descriptionError ? '#fa0000' : '#dedede'}} onChangeText={(description) => this.setState({description})} label="DESCRIPTION" />
            <Text style={pageStyle.imagesLabel}>CHOOSE AN OPTION TO UPLOAD RELEVANT IMAGES</Text>
            <View style={[styles.multipleColumnView, {marginTop: 20, marginBottom: 10}]}>
              <View style={[styles.multipleColumnBlock, {flex: 1, width: 80, height: 70}]}>
                <TouchableOpacity style={{width: 80, height: 70}} onPress={() => this.selectImage('image1', 1)}>
                  <View>
                    {!this.state.image1 && <View style={pageStyle.defaultImage}>
                      <Icon name="picture-o" size={30} color="#b7b7b7" />
                    </View>}
                    {this.state.image1 && <Image
                      style={pageStyle.image}
                      source={this.state.image1}
                    />}
                  </View>
                </TouchableOpacity>
              </View>
              <View style={[styles.multipleColumnBlock, {flex: 1, width: 80, height: 70}]}>
                <TouchableOpacity style={{width: 80, height: 70}} onPress={() => this.selectImage('image2', 2)}>
                  <View>
                    {!this.state.image2 && <View style={pageStyle.defaultImage}>
                      <Icon name="picture-o" size={30} color="#b7b7b7" />
                    </View>}
                    {this.state.image2 && <Image
                      style={pageStyle.image}
                      source={this.state.image2}
                    />}
                  </View>
                </TouchableOpacity>
              </View>
              <View style={[styles.multipleColumnBlock, {flex: 1, width: 80, height: 70}]}>
                <TouchableOpacity style={{width: 80, height: 70}} onPress={() => this.selectImage('image3', 3)}>
                  <View>
                    {!this.state.image3 && <View style={pageStyle.defaultImage}>
                      <Icon name="picture-o" size={30} color="#b7b7b7" />
                    </View>}
                    {this.state.image3 && <Image
                      style={pageStyle.image}
                      source={this.state.image3}
                    />}
                  </View>
                </TouchableOpacity>
              </View>
            </View>
            <DropDown onPress={() => this.openActionSheet('selectedReqPref', this.state.reqPref)} selectType="name" pickers={this.state.reqPref} value={this.state.selectedReqPref} label="REQUIRED PREFRENCE" onValueChange={(value) => this.setState({
              selectedReqPref: value
            })} />
            {this.state.selectedReqPref == 'later' && <DateField format="DD/MM/YYYY" mode="date" onDateChange={(later_date) => {this.setState({later_date})}} date={this.state.later_date} label="Select Date" />}
            {this.state.selectedReqPref == 'later' && <DateField mode="time" onDateChange={(later_time) => {this.setState({later_time})}} date={this.state.later_time} label="Select Time" />}
            <Check checked={this.state.agree} onPress={() => this.setState({agree: this.state.agree ? false : true})} text="I agree to the terms of use and privacy statements" />
          </View>}
          {this.state.submitted && <View style={pageStyle.submittedView}>
            <Image
              style={pageStyle.job_submittedImage}
              source={require('../../../assets/images/job_submitted.png')}
            />
            <Text style={[pageStyle.submittedText, {fontWeight: 'bold', color: '#000'}]}>Hurray!</Text>
            <Text style={pageStyle.submittedText}>Your job request has been successfully submitted and nearby service professionals have been notified! You will be notified when they apply.</Text>
            {/* <Text style={pageStyle.submittedText}>Your job request has been submitted and notifications are sent to near by service professionals and you will be contacted by shortly.</Text><Text style={pageStyle.submittedText}>"To view their profile go to your dashboard under my job section click on view jobs"</Text> */}
            <Button onPress={() => goBack()} containerStyle={{width: '40%', marginTop: '15%'}} style={{backgroundColor: '#cf2525', paddingVertical: 10}} text="OK" />
          </View>}
        </KeyboardAwareScrollView>
        {!this.state.submitted && <Button containerStyle={pageStyle.submitButton} loading={this.state.loading} onPress={() => this.submit()} text="SUBMIT" />}
      </View>
    );
  }
}