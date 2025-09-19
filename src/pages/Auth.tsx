import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState('customer');

  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Password validation
  const validatePassword = (password: string) => {
    let strength = 0;
    if (password.length >= 12) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    setPasswordStrength(strength);
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (isSignUp) {
      validatePassword(value);
    }
  };

  const isValidPassword = () => {
    if (!isSignUp) return password.length > 0;
    return (
      password.length >= 12 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[^A-Za-z0-9]/.test(password) &&
      password === confirmPassword
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidPassword()) return;

    setLoading(true);
    
    if (isSignUp) {
      const { error } = await signUp(email, password, fullName, userRole);
      if (!error) {
        // Success handled in useAuth with toast
      }
    } else {
      const { error } = await signIn(email, password);
      if (!error) {
        navigate('/');
      }
    }
    
    setLoading(false);
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 3) return 'bg-destructive';
    if (passwordStrength < 4) return 'bg-gold';
    return 'bg-primary';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 3) return 'Weak';
    if (passwordStrength < 4) return 'Good';
    return 'Strong';
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col">
      {/* Header */}
      <div className="p-4">
        <Link to="/" className="inline-flex items-center space-x-2 text-white hover:text-gold transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-elegant border-0">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">Welcome to QUICKLINK</CardTitle>
              <CardDescription>
                {isSignUp ? 'Create your account to get started' : 'Sign in to your account'}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Tabs value={isSignUp ? 'signup' : 'signin'} className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin" onClick={() => setIsSignUp(false)}>
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger value="signup" onClick={() => setIsSignUp(true)}>
                    Sign Up
                  </TabsTrigger>
                </TabsList>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {isSignUp && (
                    <>
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
                        <Label htmlFor="role">I want to</Label>
                        <select
                          id="role"
                          value={userRole}
                          onChange={(e) => setUserRole(e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="customer">Shop & Order (Customer)</option>
                          <option value="driver">Drive & Earn (Driver)</option>
                          <option value="seller">Sell Products (Merchant)</option>
                          <option value="restaurant">Run Restaurant</option>
                          <option value="property_seller">Sell Properties</option>
                        </select>
                      </div>
                    </>
                  )}

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
                        placeholder={isSignUp ? 'Create a strong password' : 'Enter your password'}
                        value={password}
                        onChange={(e) => handlePasswordChange(e.target.value)}
                        required
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

                    {isSignUp && password && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Password strength:</span>
                          <span className={`font-medium ${
                            passwordStrength < 3 ? 'text-destructive' : 
                            passwordStrength < 4 ? 'text-gold' : 'text-primary'
                          }`}>
                            {getPasswordStrengthText()}
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${getPasswordStrengthColor()}`}
                            style={{ width: `${(passwordStrength / 5) * 100}%` }}
                          />
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div>Password must contain:</div>
                          <ul className="space-y-1">
                            <li className={password.length >= 12 ? 'text-primary' : ''}>
                              • At least 12 characters
                            </li>
                            <li className={/[A-Z]/.test(password) ? 'text-primary' : ''}>
                              • One uppercase letter
                            </li>
                            <li className={/[a-z]/.test(password) ? 'text-primary' : ''}>
                              • One lowercase letter
                            </li>
                            <li className={/[0-9]/.test(password) ? 'text-primary' : ''}>
                              • One number
                            </li>
                            <li className={/[^A-Za-z0-9]/.test(password) ? 'text-primary' : ''}>
                              • One special character
                            </li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>

                  {isSignUp && (
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                      {confirmPassword && password !== confirmPassword && (
                        <p className="text-sm text-destructive">Passwords do not match</p>
                      )}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-gradient-primary hover:opacity-90 font-medium"
                    disabled={loading || !isValidPassword()}
                  >
                    {loading ? 'Loading...' : (isSignUp ? 'Create Account' : 'Sign In')}
                  </Button>
                </form>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}