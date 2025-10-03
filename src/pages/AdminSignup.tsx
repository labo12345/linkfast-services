import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Shield, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const ADMIN_SECRET_CODE = "QUICKLINK2025"; // Change this to your secret code

export default function AdminSignup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [secretCode, setSecretCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (secretCode !== ADMIN_SECRET_CODE) {
      toast({
        title: "Invalid Secret Code",
        description: "The admin secret code you entered is incorrect.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 12) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 12 characters long.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      // Sign up the user first
      const { error: signUpError } = await signUp(email, password, fullName, 'customer');
      
      if (signUpError) {
        throw signUpError;
      }

      // Get the newly created user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Add admin role to user_roles table
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: user.id,
            role: 'admin'
          });

        if (roleError) {
          console.error('Error adding admin role:', roleError);
          toast({
            title: "Role Assignment Failed",
            description: "Account created but admin role could not be assigned. Contact support.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Admin Account Created!",
            description: "Check your email to verify your account.",
          });
          navigate('/auth');
        }
      }
    } catch (error: any) {
      console.error('Admin signup error:', error);
      toast({
        title: "Signup Failed",
        description: error.message || "Failed to create admin account",
        variant: "destructive",
      });
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col">
      <div className="p-4">
        <Link to="/" className="inline-flex items-center space-x-2 text-white hover:text-gold transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-elegant border-2 border-primary/20">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl font-bold">Admin Registration</CardTitle>
              <CardDescription>
                Create an administrator account for QUICKLINK
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a strong password (min 12 chars)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={12}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secretCode">Admin Secret Code</Label>
                  <Input
                    id="secretCode"
                    type="password"
                    placeholder="Enter admin secret code"
                    value={secretCode}
                    onChange={(e) => setSecretCode(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Contact the system administrator for the secret code
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-primary hover:opacity-90 font-medium"
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : 'Create Admin Account'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
