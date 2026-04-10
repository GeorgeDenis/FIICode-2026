import { useRouter } from "expo-router";
import { useUser } from "../../hooks/useUser";
import { useEffect } from "react";
import ThemedLoader from "../ThemedLoader";

const AdminOnly = ({ children }) => {
  const { user, authChecked } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (authChecked) {
      if (user == null) {
        router.replace('/login');
      } else if (user.role !== 1) {
        router.replace('/');
      }
    }
  }, [user, authChecked]);

  if (!authChecked || !user || user.role !== 1) {
    return (
      <ThemedLoader />
    )
  }

  return children;
}

export default AdminOnly;
