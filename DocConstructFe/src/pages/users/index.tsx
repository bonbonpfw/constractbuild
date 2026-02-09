import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import UserManagement from "../../components/users/UserManagement";

const UsersPage = () => {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const storedUserInfo = localStorage.getItem("user_info");
    if (storedUserInfo) {
      try {
        const userInfo = JSON.parse(storedUserInfo);
        if (userInfo.role === "admin") {
          setIsAdmin(true);
          return;
        }
      } catch (e) {
        // ignore parse errors
      }
    }
    router.replace("/projects");
  }, [router]);

  if (!isAdmin) return null;

  return (
    <div>
      <UserManagement />
    </div>
  );
};

export default UsersPage;
