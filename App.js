/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  Image,
  StatusBar,
} from 'react-native';

import data from './assets/vars.json'
import colors from './assets/colors.json'

import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

const App = () => {
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic" >
          <View style={{ height: 30, flex: 1, backgroundColor: colors.primary }}>
            <Text> {data.teste} </Text>
          </View>
          <Image source={require("./assets/logo.jpg")} style={{ width: 300, height: 300 }} />
        </ScrollView>
      </SafeAreaView>
    </>
  );
};


export default App;
