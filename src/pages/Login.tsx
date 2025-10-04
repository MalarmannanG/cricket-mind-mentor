import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
//import { useAuth } from '@/contexts/AuthContext';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Users, Shield } from 'lucide-react';
import { useAuth } from "@/contexts/AuthContext";
import { createUser } from "@/api/users";


const Login = () => {

  const inputRef = useRef(null);
  const { loginAction } = useAuth();
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  //const auth = useAuth();
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    if (loginEmail && loginPassword) {
      setIsLoading(true);
      await loginAction({ username: loginEmail, password: loginPassword });
      setIsLoading(false);
    }
  }


  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Mock signup validation
    if (signupEmail && signupPassword && signupName && phoneNumber) {
      const data = {
        email: signupEmail,
        name: signupName,
        password: signupPassword,
        phone: phoneNumber,
        role: "player",
        teamId: "T001"
      }
      createUser(data).then(async (res:any) => {
        if (res) {
          toast({
            title: "Account created",
            description: "Welcome to Cricket Coach!",
          });
          if (inputRef.current) {
            inputRef.current.value = 'login';
          }
          navigate("/login");
          initialRender();
          setIsLoading(false);
          setIsLoading(false);
        }
        else{
          if (inputRef.current) {
          inputRef.current.value = 'login';
        }
        initialRender();
        toast({
          title: "Signup failed",
          description: "User already exists",
          variant: "destructive",
        });
        setIsLoading(false);
        }
      }).catch((err) => {
        if (inputRef.current) {
          inputRef.current.value = 'login';
        }
        console.error(err);
        initialRender();
        toast({
          title: "Signup failed",
          description: "Please fill in all fields",
          variant: "destructive",
        });
        setIsLoading(false);
      });
    }
  };
  const initialRender = () => {
    setLoginEmail("");
    setLoginPassword("");
    setSignupEmail("");
    setSignupPassword("");
    setSignupName("");
    setPhoneNumber("");
    setIsLoading(false);
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-cricket-primary/5 via-background to-cricket-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-cricket-primary mb-2">🏏</h1>
          <h2 className="text-2xl font-bold text-foreground">Cricket Coach zdczd</h2>
          <p className="text-muted-foreground">Mental Ability Training Platform</p>
        </div>

        <Card className="shadow-xl border-cricket-primary/20">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Welcome</CardTitle>
            <CardDescription className="text-center">
              Sign in to your account or create a new one
            </CardDescription>

          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full" ref={inputRef} >
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="coach@cricket.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="John Coach"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="coach@cricket.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Phone</Label>
                    <Input
                      id="login-phone"
                      type="text"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>


          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;