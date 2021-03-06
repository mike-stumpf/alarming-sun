import React from 'react'
import { Component } from 'react';
import { Alert, Animated, Modal, StyleSheet, Text, TouchableHighlight, TouchableNativeFeedback, View } from 'react-native';
import Moment from 'moment';
import SystemSetting from 'react-native-system-setting'
import Value = Animated.Value;

enum backgroundColours {
    // order is important for transitioning between enum values
    RED,
    ORANGE,
    YELLOW
}

interface State {
    currentTime: string;
    isBrightnessOn: boolean;
    isModalVisible: boolean;
    alarm: {
        brightnessActivated: boolean
    };
    animations: {
        opacity: Value;
        backgroundColor: Value;
    }
}

const buttonHeightWidth: number = 75;
const textColour: string = 'lightgrey';
const styles: any = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'black',
    },
    underlay: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        opacity: 0
    },
    currentTime: {
        fontFamily: "Eczar",
        fontSize: 100,
        color: textColour,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: {width: -1, height: 1},
        textShadowRadius: 10,
        padding: 25,
        width: 420
    },
    // buttons
    containerButtonGeneric: {
        position: 'absolute',
        width: buttonHeightWidth,
        height: buttonHeightWidth,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonGeneric: {
        color: textColour,
        fontFamily: "fontawesome",
        fontSize: 30,
        padding: 10,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: {width: -1, height: 1},
        textShadowRadius: 10,
    },
    // colors
    yellow: {
        backgroundColor: '#fee25e'
    },
    orange: {
        backgroundColor: '#fc723d'
    },
    red: {
        backgroundColor: '#e73a2e'
    }
});

export default class App extends Component<{}, State> {

    private interval: any;
    private transitionPeriod: number = 5000; // todo, replace with 10 minutes
    private sunriseAnimation: any;

    constructor(props: any) {
        super(props);
        this.state = {
            isBrightnessOn: true,
            isModalVisible: false,
            currentTime: Moment().format('HH:mm:ss'),
            alarm: {
                brightnessActivated: false
            },
            animations: {
                opacity: new Animated.Value(0),
                backgroundColor: new Animated.Value(backgroundColours.RED)
            }
        };
        this._onPressSleep = this._onPressSleep.bind(this);
        this._onPressBrightness = this._onPressBrightness.bind(this);
        this._onPressSetAlarm = this._onPressSetAlarm.bind(this);
    }

    componentDidMount() {
        this.interval = setInterval(
            () => {
                let timeToWakeUp: boolean = true; // todo, replace with timer setting
                if (timeToWakeUp && !this.state.alarm.brightnessActivated) {
                    // only activate brightness once
                    this._activateScreenBrightness();
                    // start sunrise animations
                    this.sunriseAnimation = Animated.sequence([
                        Animated.timing(
                            this.state.animations.opacity,
                            {
                                toValue: 1,
                                duration: 5000, // todo, update to 30 seconds
                                delay: 5000 // todo, remove after ability to add time
                            }
                        ),
                        Animated.timing(
                            this.state.animations.backgroundColor,
                            {
                                toValue: backgroundColours.YELLOW,
                                duration: this.transitionPeriod * (Object.keys(backgroundColours).length - 1),
                                // delay: this.transitionPeriod
                            }
                        )
                    ]).start();
                    this.setState({
                        currentTime: Moment().format('HH:mm:ss'),
                        alarm: {
                            ...this.state.alarm,
                            brightnessActivated: true
                        }
                    });
                } else {
                    this.setState({
                        currentTime: Moment().format('HH:mm:ss'),
                    });
                }
            },
            1000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    render() {
        return (
            <View style={styles.container}>
                {/*sunrise*/}
                <Animated.View
                    style={{
                        ...styles.underlay,
                        opacity: this.state.animations.opacity,
                        backgroundColor: this.state.animations.backgroundColor.interpolate({
                            inputRange: [backgroundColours.RED, backgroundColours.ORANGE, backgroundColours.YELLOW],
                            outputRange: ['rgb(231,58,46)', 'rgb(252,114,61)', 'rgb(254,226,94)']
                        })
                    }}/>
                {/*clock face*/}
                <Text style={styles.currentTime}
                      adjustsFontSizeToFit
                      numberOfLines={1}>{this.state.currentTime}</Text>
                {/* brightness button */}
                <TouchableNativeFeedback
                    onPress={this._onPressBrightness}
                    background={TouchableNativeFeedback.SelectableBackground()}>
                    <View style={{
                        ...styles.containerButtonGeneric,
                        top: 0,
                        left: 0
                    }}>
                        <Text style={styles.buttonGeneric}>&#xf0eb;</Text>
                    </View>
                </TouchableNativeFeedback>
                {/* sleep button */}
                <TouchableNativeFeedback
                    onPress={this._onPressSleep}
                    background={TouchableNativeFeedback.SelectableBackground()}>
                    <View style={{
                        ...styles.containerButtonGeneric,
                        top: 0,
                        right: 0
                    }}>
                        <Text style={styles.buttonGeneric}>&#xf1f6;</Text>
                    </View>
                </TouchableNativeFeedback>
                {/* sleep button */}
                <TouchableNativeFeedback
                    onPress={this._onPressSetAlarm}
                    background={TouchableNativeFeedback.SelectableBackground()}>
                    <View style={{
                        ...styles.containerButtonGeneric,
                        bottom: 0,
                        right: 0
                    }}>
                        <Text style={styles.buttonGeneric}>&#xf017;</Text>
                    </View>
                </TouchableNativeFeedback>
                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={this.state.isModalVisible}
                    onRequestClose={() => {
                        alert('Modal has been closed.');
                    }}>
                    <View style={styles.container}>
                        <View>
                            <Text style={{color: 'white'}}>Hello World!</Text>
                            <TouchableHighlight
                                onPress={() => {
                                    this.setState({
                                        isModalVisible: false
                                    });
                                }}>
                                <Text style={{color: 'white'}}>Close</Text>
                            </TouchableHighlight>
                        </View>
                    </View>
                </Modal>
            </View>
        );
    }

    private _activateScreenBrightness(): void {
        //get the current brightness
        SystemSetting.getBrightness().then((brightness: any)=> {
            console.log('Current brightness is ' + brightness);
        });
        //change the brightness & check permission
        // todo, animate over 30 seconds
        SystemSetting.setBrightnessForce(1.0)
            .then((success: boolean) => {
                !success && Alert.alert('Permission Denied', 'Please grant the app permission to change settings otherwise it will not work correctly',[
                    {'text': 'Cancel', style: 'cancel'},
                    {'text': 'Open Settings', onPress:()=>SystemSetting.grantWriteSettingPremission()}
                ]);
                // save the value of brightness and screen mode.
                return SystemSetting.saveBrightness();
            })
            .then(() => {
                // log new brightness
                SystemSetting.getBrightness().then((brightness: any)=>{
                    console.log('new brightness is ' + brightness);
                });
            });
    }

    private _onPressSleep(): void {
        if (this.state.alarm.brightnessActivated) {
            // stop animations
            this.state.animations.backgroundColor.stopAnimation();
            this.state.animations.opacity.stopAnimation();
            // reset initial colour
            this.setState({
                animations: {
                    opacity: new Animated.Value(0),
                    backgroundColor: new Animated.Value(backgroundColours.RED)
                }
            })
        }
    }

    private _onPressBrightness(): void {
        SystemSetting.setBrightnessForce(this.state.isBrightnessOn ? 1.0 : 0.0)
            .then((success: boolean) => {
                !success && Alert.alert('Permission Deny', 'You have no permission changing settings',[
                    {'text': 'Ok', style: 'cancel'},
                    {'text': 'Open Setting', onPress:()=>SystemSetting.grantWriteSettingPremission()}
                ]);
                console.log('brightness on?', this.state.isBrightnessOn);
                // save the value of brightness and screen mode.
                return SystemSetting.saveBrightness();
            })
            .then(() => {
                this.setState({
                    isBrightnessOn: !this.state.isBrightnessOn
                })
            });
    }

    private _onPressSetAlarm(): void {
        this.setState({
            isModalVisible: true
        });
    }
}
