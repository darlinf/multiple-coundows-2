import React, { Component } from "react";
import {
  Animated,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  Platform,
  UIManager,
  View,
  Button,
} from "react-native";

import * as Animatable from "react-native-animatable";
import BackgroundTimer from "react-native-background-timer";

function fancyTimeFormat(duration) {
  // Hours, minutes and seconds
  var hrs = ~~(duration / 3600);
  var mins = ~~((duration % 3600) / 60);
  var secs = ~~duration % 60;

  // Output like "1:01" or "4:03:59" or "123:03:59"
  var ret = "";

  if (hrs > 0) {
    ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
  }

  ret += "" + mins + ":" + (secs < 10 ? "0" : "");
  ret += "" + secs;
  return ret;
}

const width = Dimensions.get("window").width;

export default class Item extends Component {
  timeP = "";
  constructor(props) {
    super(props);
    this.timeP = props.time;

    this.state = { currentCount: props.time, pausePlay: false };

    this.animatedValue = new Animated.Value(0);

    if (Platform.OS === "android") {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }

  handleViewRef = (ref) => (this.view = ref);
  bounce = () => this.view.bounce(800);

  timer() {
    this.setState({
      currentCount: this.state.currentCount - 1,
    });
    if (this.state.currentCount < 1) {
      BackgroundTimer.clearInterval(this.intervalId);
      this.view.bounce(800);
      this.props.countdownEnd();
    }
  }

  componentDidMount() {
    Animated.timing(this.animatedValue, {
      toValue: 0.5,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      this.props.afterAnimationComplete();
    });
    this.intervalId = BackgroundTimer.setInterval(this.timer.bind(this), 1000);
  }

  pausePlay = () => {
    if (this.state.pausePlay) {
      this.setState({ pausePlay: false });
      this.intervalId = BackgroundTimer.setInterval(
        this.timer.bind(this),
        1000
      );
    } else {
      this.view.pulse(800);
      this.setState({ pausePlay: true });
      BackgroundTimer.clearInterval(this.intervalId);
    }
  };

  removeItem = () => {
    Animated.timing(this.animatedValue, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      this.props.removeItem(this.props.item.id);
    });
  };

  componentWillUnmount() {
    BackgroundTimer.clearInterval(this.intervalId);
  }

  render() {
    const translateAnimation = this.animatedValue.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [-width, 0, width],
    });

    const opacityAnimation = this.animatedValue.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 1, 0],
    });

    return (
      <Animatable.View ref={this.handleViewRef}>
        <Animated.View
          style={[
            styles.viewHolder,
            {
              transform: [{ translateX: translateAnimation }],
              opacity: opacityAnimation,
              backgroundColor: this.state.pausePlay
                ? "#FFD523"
                : this.state.currentCount < 1
                ? "#F8485E"
                : "#2196f3",
            },
          ]}
        >
          <View
            style={{
              height: 50,
              justifyContent: "center",
            }}
          >
            <Text style={[styles.displayText, { fontSize: 30 }]}>
              {/*this.props.item.text*/}Time left:{" "}
              <Text style={{ fontWeight: "bold" }}>
                {fancyTimeFormat(this.state.currentCount)}
              </Text>
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              width: 105,
              justifyContent: "space-between",
            }}
          >
            {this.state.currentCount !== 0 && (
              <TouchableOpacity
                style={[styles.removeBtn]}
                onPress={this.pausePlay}
              >
                <Image
                  source={
                    this.state.pausePlay
                      ? require("../assets/play.png")
                      : require("../assets/pause.png")
                  }
                  style={[
                    this.state.pausePlay ? styles.btnImage2 : styles.btnImage,
                    {
                      tintColor: this.state.pausePlay
                        ? "#FFD523"
                        : this.state.currentCount < 1
                        ? "#F8485E"
                        : "#2196f3",
                    },
                  ]}
                />
              </TouchableOpacity>
            )}
            {this.state.currentCount === 0 && (
              <TouchableOpacity
                style={[styles.removeBtn, { backgroundColor: "#F8485E" }]}
              >
                <Image
                  source={require("../assets/pause.png")}
                  style={[
                    this.state.pausePlay ? styles.btnImage2 : styles.btnImage,
                    {
                      tintColor: "#F8485E",
                    },
                  ]}
                />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={this.removeItem}
            >
              <Image
                source={require("../assets/close.png")}
                style={[
                  styles.btnImage,
                  {
                    tintColor: this.state.pausePlay
                      ? "#FFD523"
                      : this.state.currentCount < 1
                      ? "#F8485E"
                      : "#2196f3",
                  },
                ]}
              />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animatable.View>
    );
  }
}

const styles = StyleSheet.create({
  viewHolder: {
    backgroundColor: "#2196f3",
    justifyContent: "space-between",
    flexDirection: "row",
    margin: 4,
    padding: 10,
    borderRadius: 10,
  },
  displayText: { color: "white", fontSize: 25 },
  removeBtn: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  btnImage: {
    resizeMode: "contain",
    width: "70%",
    height: "70%",
    tintColor: "#2196f3",
  },
  btnImage2: {
    left: 1.5,
    resizeMode: "contain",
    width: "70%",
    height: "70%",
    tintColor: "#2196f3",
  },
});
/* BackgroundTimer.runBackgroundTimer(() => {
      // this.timer.bind(this);
      console.log(5);
      this.setState({
        currentCount: this.state.currentCount - 1,
      });

      if (this.state.currentCount < 1) {
        BackgroundTimer.stopBackgroundTimer();
        this.view.bounce(800);
      }
    }, 1000);*/
