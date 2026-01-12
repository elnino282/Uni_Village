import { Redirect } from 'expo-router';

export default function Index() {
  // Redirect to map tab on app start
  return <Redirect href="/(tabs)/map" />;
}
