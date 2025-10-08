import { createUser } from '@/api/users';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import React, { useState } from 'react';


const SignUp = () => {

  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const { setLoading } = useAuth();
  const { toast } = useToast();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Mock signup validation
    if (signupEmail && signupPassword && signupName && phoneNumber) {
      const data = {
        email: signupEmail?.toLowerCase(),
        name: signupName,
        password: signupPassword,
        phone: phoneNumber,
        role: "player",
        teamId: "T001"
      }
      createUser(data).then(async (res: any) => {
        if (res) {
          toast({
            title: "Account created",
            description: "Welcome to Cricket Coach!",
          });

          setLoading(false);
        }
        toast({
          title: "Signup failed",
          description: "User already exists",
          variant: "destructive",
        });
      }).catch((err) => {


        console.error(err);

        toast({
          title: "Signup failed",
          description: "Please fill in all fields",
          variant: "destructive",
        });
        setLoading(false);
      });
    }
  };


  return (
    <div style={{ maxWidth: 400, margin: '2rem auto' }}>
      <h2>Sign Up</h2>
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
        <Button type="submit" className="w-full" >
          Create Account
        </Button>
      </form>
    </div>
  );
};

export default SignUp;