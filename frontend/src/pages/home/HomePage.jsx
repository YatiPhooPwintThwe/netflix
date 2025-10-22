import { useAuthStore } from "../../store/useAuthStore.js";
import AuthScreen from "./AuthScreen.jsx";
import HomeScreen from "./HomeScreen.jsx";

const HomePage = () => {
  const { user } = useAuthStore();

  return <>{user ? <HomeScreen /> : <AuthScreen />}</>;
};
export default HomePage;
