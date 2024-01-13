// contexts/AuthContext.tsx
import { createContext, useContext, ReactNode, useState } from "react";

// Definir el tipo de usuario
interface User {
  name: string;
}

interface AuthContextProps {
  user: User | null;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Puedes realizar la lógica de autenticación aquí, por ejemplo, comprobar si hay un token en el localStorage.

  const login = () => {
    // Implementa la lógica de inicio de sesión
    setUser({
      name: "Miguel Gaitan",
    });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser utilizado dentro de un AuthProvider");
  }
  return context;
};
