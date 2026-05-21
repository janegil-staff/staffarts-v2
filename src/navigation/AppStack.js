// src/navigation/AppStack.js

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import BottomTabBar from "./BottomTabBar";

import HomeScreen from "../screens/home/HomeScreen";
import ExploreScreen from "../screens/explore/ExploreScreen";
import ShowsScreen from "../screens/shows/ShowsScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";
import EditProfileScreen from "../screens/profile/EditProfileScreen";
import PublicProfileScreen from "../screens/profile/PublicProfileScreen";

import NewArtworkScreen from "../screens/newArtwork/NewArtworkScreen";
import SettingsScreen from "../screens/settings/SettingsScreen";
import PersonalSettingsScreen from "../screens/settings/PersonalSettingsScreen";
import LanguageScreen from "../screens/settings/LanguageScreen";
import TermsScreen from "../screens/settings/TermsScreen";
import AboutScreen from "../screens/settings/AboutScreen";
import AboutAppScreen from "../screens/about/AboutAppScreen";
import ChangeEmailScreen from "../screens/settings/ChangeEmailScreen";
import DeleteAccountScreen from "../screens/settings/DeleteAccountScreen";
import ArtworkDetailScreen from "../screens/artwork/ArtworkDetailScreen";
import EventDetailScreen from "../screens/shows/EventDetailScreen";
import ExhibitionDetailScreen from "../screens/shows/ExhibitionDetailScreen";
import NewEventScreen from "../screens/newEvent/NewEventScreen";

// Messaging
import ConversationListScreen from "../screens/messages/ConversationListScreen";
import MessageThreadScreen from "../screens/messages/MessageThreadScreen";

import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import ForgotPinScreen from "../screens/auth/ForgotPinScreen";
import PinSetupScreen from "../screens/auth/PinSetupScreen";
import AuthGateScreen from "../screens/auth/AuthGateScreen";

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
      <Stack.Screen
        name="NewEvent"
        component={NewEventScreen}
        options={{ presentation: "modal" }}
      />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="PublicProfile" component={PublicProfileScreen} />
      <Stack.Screen name="AboutApp" component={AboutAppScreen} />

      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen
        name="PersonalSettings"
        component={PersonalSettingsScreen}
      />
      <Stack.Screen name="Language" component={LanguageScreen} />
      <Stack.Screen name="ChangeEmail" component={ChangeEmailScreen} />
      <Stack.Screen name="DeleteAccount" component={DeleteAccountScreen} />
      <Stack.Screen name="Terms" component={TermsScreen} />
      <Stack.Screen name="About" component={AboutScreen} />

      <Stack.Screen name="ArtworkDetail" component={ArtworkDetailScreen} />
      <Stack.Screen name="EventDetail" component={EventDetailScreen} />
      <Stack.Screen
        name="ExhibitionDetail"
        component={ExhibitionDetailScreen}
      />

      {/* Messaging */}
      <Stack.Screen name="Messages" component={ConversationListScreen} />
      <Stack.Screen name="MessageThread" component={MessageThreadScreen} />

      {/* Auth modals */}
      <Stack.Group screenOptions={{ presentation: "modal" }}>
        <Stack.Screen name="AuthGate" component={AuthGateScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ForgotPin" component={ForgotPinScreen} />
        <Stack.Screen name="PinSetup" component={PinSetupScreen} />
      </Stack.Group>
    </Stack.Navigator>
  );
}