import { useAuth } from "@app/application/context/AuthContext";
import { LoginForm } from "../components/LoginForm";

export const AuthLayout = ({ children }: any) => {
  const { user } = useAuth();
  return <div>{user ? children : <LoginForm />}</div>;
};
