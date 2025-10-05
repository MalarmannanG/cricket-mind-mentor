import { getUserByEmail } from '@/api/users';
import { toast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Loader } from 'lucide-react';
import { userInfo } from 'os';
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
interface authInput {
  username: string;
  password: string;
};
export interface userInfo {
  email: string;
  name: string;
  phone: string;
  role: 'coach' | 'player';
  teamId: string;
  id: string;
};
interface AuthContextType {
  user: userInfo | null;
  setLoading: (loading: boolean) => void;
  loginAction: (authInput) => void;
  logOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState<userInfo>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  useEffect(() => {
    if (user == null)
      navigate("/login");
  }
    , []);
  const loginAction = async (data) => {
    await getUserByEmail(data.username).then((user: any) => {
      if (user && user.password === data.password) {
        setUser(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem("site", JSON.stringify(user))
        toast({
          title: "Login successful",
          description: "Welcome back to Cricket Coach!",
        });
        if (user.role === 'coach') {
          navigate("/coach-dashboard");
        }
        else if (user.role === 'player') {
          navigate("/player-dashboard");
        }
      }
    }).catch((err) => {
      console.error(err);
    });



  };

  const logOut = () => {
    setUser(null);
    localStorage.removeItem("site");
    navigate("/login");
  };

  return (
    <>
     { loading && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Loader className="animate-spin text-white" size={48} />
      </div>}
      <AuthContext.Provider value={{ user, setLoading, loginAction, logOut }}>
        {children}
      </AuthContext.Provider>
    </>
  );

};

export default AuthProvider;

export const useAuth = () => {
  return useContext(AuthContext);
};