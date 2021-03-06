import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

export default StyleSheet.create({
  background: {
    width,
    height: 135,
    position: 'relative',
    overflow: 'visible'
  },
  userSection: {
    marginTop: -100,
    borderBottomColor: '#dedede',
    borderBottomWidth: 1,
    paddingBottom: 20
  },
  avatarView: {
    justifyContent: 'center',
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 100,
    padding: 4,
    position: 'relative',
    marginBottom: 10
  },
  avatarImage: {
    borderRadius: Platform.OS == 'android' ? 100 : 75,
    width: 150,
    height: 150
  },
  avatarEdit: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: '#efefef',
    width: 30,
    height: 30,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999
  },
  username: {
    alignSelf: 'center',
    color: '#fb8519',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 3
  },
  userid: {
    alignSelf: 'center',
    fontSize: 16,
    color: '#fb8519'
  },
  listItem: {
      backgroundColor: '#fff',
      borderBottomWidth: 1,
      borderBottomColor: '#dedede',
      paddingVertical: 12,
      paddingHorizontal: 20,
      flexDirection: 'row',
      alignItems: 'center'
  },
  listItemText: {
      flex: 1
  },
  loadingAvatar: {
    position: 'absolute',
    alignSelf: 'center'
  },
  coverImageView: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-end'
  },
  editCoverImageView: {
    flexDirection: 'row',
    backgroundColor: '#efefef',
    borderBottomLeftRadius: 10,
    paddingVertical: 2,
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  editCoverImageText: {
    marginLeft: 5
  },
  goOnlineView: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  goOnlineText: {
    fontSize: 16,
    color: '#fb8519',
    marginRight: 5
  }
})