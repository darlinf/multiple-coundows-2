import React, { Component } from "react";
import {
  AppRegistry,
  TouchableOpacity,
  View,
  StyleSheet,
  ScrollView,
  Image,
  LayoutAnimation,
  Dimensions,
  TextInput,
  Text,
  AppState,
} from "react-native";
import Item from "./components/Item";

import PushNotification from "react-native-push-notification";
const createChannels = () => {
  PushNotification.createChannel({
    channelId: "text-channel",
    channelName: "Test channel",
  });
};

const { width, height } = Dimensions.get("window");

export default class App extends Component {
  constructor() {
    super();
    this.state = {
      valueArray: [],
      disabled: false,
      setMinutes: "1",
      setHours: "0",
      appState: AppState.currentState,
      showCountdownState: false,
      countdownFinished: 0,
    };

    this.addNewEle = false;
    this.index = 0;
  }

  componentDidMount() {
    createChannels();
    AppState.addEventListener("change", this._handleAppStateChange);
  }

  componentWillUnmount() {
    AppState.removeEventListener("change", this._handleAppStateChange);
  }

  _handleAppStateChange = (nextAppState) => {
    if (
      !(
        this.state.appState.match(/inactive|background/) &&
        nextAppState === "active"
      ) &&
      this.state.valueArray.length !== 0
    ) {
      if (this.state.countdownFinished !== this.state.valueArray.length)
        this.handleNotification();
      this.state.showCountdownState = true;
    } else {
      this.state.showCountdownState = false;
    }
    this.setState({ appState: nextAppState });
  };

  handleNotification = () => {
    PushNotification.localNotification({
      channelId: "text-channel",
      title: "Multiple coundows",
      message: "Is running in background",
      id: 1,
    });
  };

  afterAnimationComplete = () => {
    this.index += 1;
    this.setState({ disabled: false });
  };

  addMore = () => {
    this.addNewEle = true;
    const newlyAddedValue = { id: "id_" + this.index, text: this.index + 1 };

    this.setState({
      disabled: true,
      valueArray: [...this.state.valueArray, newlyAddedValue],
    });
  };

  remove(id) {
    this.addNewEle = false;
    const newArray = [...this.state.valueArray];
    newArray.splice(
      newArray.findIndex((ele) => ele.id === id),
      1
    );

    this.setState(
      () => {
        return {
          valueArray: newArray,
        };
      },
      () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      }
    );
  }

  render() {
    return (
      <View style={styles.container}>
        <ScrollView
          ref={(scrollView) => (this.scrollView = scrollView)}
          onContentSizeChange={() => {
            this.addNewEle && this.scrollView.scrollToEnd();
          }}
        >
          <View style={{ flex: 1, padding: 4 }}>
            {this.state.valueArray.map((ele) => {
              return (
                <Item
                  key={ele.id}
                  item={ele}
                  time={this.state.setHours * 3600 + 60 * this.state.setMinutes}
                  removeItem={(id) => {
                    this.remove(id);
                    if (this.state.countdownFinished !== 0)
                      this.state.countdownFinished -= 1;
                  }}
                  afterAnimationComplete={this.afterAnimationComplete}
                  countdownEnd={() => {
                    this.state.countdownFinished += 1;
                    if (this.state.showCountdownState)
                      PushNotification.localNotification({
                        channelId: "text-channel",
                        id: 1,
                        title: "Multiple countdowns",
                        message:
                          "Countdown finished " +
                          this.state.countdownFinished +
                          " of " +
                          this.state.valueArray.length,
                      });
                  }}
                />
              );
            })}
          </View>
        </ScrollView>

        <View style={{ flexDirection: "row" }}>
          <View
            style={{
              width: "80%",
              paddingLeft: 10,
              paddingRight: 10,
              flexDirection: "row",
            }}
          >
            <View style={{ width: "49%" }}>
              <TextInput
                style={{
                  borderRadius: 13,
                  backgroundColor: "#f2f2f2",
                  color: "black",
                  fontSize: 20,
                  marginBottom: 20,
                  padding: 10,
                  height: 60,
                  textAlign: "center",
                }}
                keyboardType={"numeric"}
                value={this.state.setHours}
                onChangeText={(value) => {
                  this.setState({
                    setHours: value,
                  });
                }}
              />
              <Text
                style={{
                  fontSize: 14,
                  textAlign: "center",
                  width: "100%",
                  position: "absolute",
                  top: -10,
                }}
              >
                Hours
              </Text>
            </View>

            <View
              style={{
                height: 60,
                width: "2%",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 30, top: -3, left: 1.75 }}>:</Text>
            </View>
            <View style={{ width: "49%" }}>
              <TextInput
                style={{
                  borderRadius: 13,
                  backgroundColor: "#f2f2f2",
                  color: "black",
                  fontSize: 20,
                  marginBottom: 20,
                  padding: 10,
                  height: 60,

                  marginLeft: 5,
                  textAlign: "center",
                }}
                keyboardType={"numeric"}
                value={this.state.setMinutes}
                onChangeText={(value) => {
                  this.setState({
                    setMinutes: value,
                  });
                }}
              />
              <Text
                style={{
                  fontSize: 14,
                  textAlign: "center",
                  width: "100%",
                  position: "absolute",
                  top: -10,
                }}
              >
                Minutes
              </Text>
            </View>
          </View>
          <View style={{ width: "20%" }}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.addBtn}
              disabled={this.state.disabled}
              onPress={() => {
                this.addMore();
              }}
            >
              <Image
                source={require("./assets/add.png")}
                style={styles.btnImage}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 0,
  },
  addBtn: {
    width: 70,
    height: 70,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 70,
    backgroundColor: "#2196f3",
    top: -3,
  },
  btnImage: {
    resizeMode: "contain",
    tintColor: "white",
    height: 30,
    width: 30,
  },
});
