// src/navigation/AppStack.js
//
// Top-level navigator: bottom tabs (Home / Explore / Shows / Profile) with a
// center FAB for "New Artwork". Detail screens are pushed onto the parent
// stack so they cover the tab bar.

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import BottomTabBar from "./BottomTabBar";

import HomeScreen from "../screens/home/HomeScreen";
import ExploreScreen from "../screens/explore/ExploreScreen";
import ShowsScreen from "../screens/shows/ShowsScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";

import NewArtworkScreen from "../screens/newArtwork/NewArtworkScreen";
import SettingsScreen from "../screens/settings/SettingsScreen";
import ArtworkDetailScreen from "../screens/artwork/ArtworkDetailScreen";
import EventDetailScreen from "../screens/shows/EventDetailScreen";
import ExhibitionDetailScreen from "../screens/shows/ExhibitionDetailScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabsNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <BottomTabBar {...props} />}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="Shows" component={ShowsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={TabsNavigator} />
      <Stack.Screen
        name="NewArtwork"
        component={NewArtworkScreen}
        options={{ presentation: "modal" }}
      />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="ArtworkDetail" component={ArtworkDetailScreen} />
      <Stack.Screen name="EventDetail" component={EventDetailScreen} />
      <Stack.Screen name="ExhibitionDetail" component={ExhibitionDetailScreen} />
    </Stack.Navigator>
  );
}
