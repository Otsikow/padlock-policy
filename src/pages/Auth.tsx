
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Auth = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate authentication - replace with Supabase auth
    setTimeout(() => {
      setLoading(false);
      toast({
        title: isSignUp ? "Account created!" : "Welcome back!",
        description: "Redirecting to dashboard...",
      });
      navigate('/dashboard');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#183B6B] to-[#2a5490] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6 text-white hover:bg-white/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 mx-auto mb-4 bg-[#183B6B] rounded-full flex items-center justify-center">
              <span className="text-[#E2B319] font-bold text-xl">B</span>
            </div>
            <CardTitle className="text-2xl font-bold text-[#183B6B]">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </CardTitle>
            <CardDescription>
              {isSignUp ? 'Join BOAFO to optimize your insurance' : 'Sign in to your BOAFO account'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-gray-300 focus:border-[#183B6B] focus:ring-[#183B6B]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-gray-300 focus:border-[#183B6B] focus:ring-[#183B6B]"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#183B6B] hover:bg-[#1a3d6f] text-white py-3 rounded-lg font-semibold"
              >
                {loading ? 'Please wait...' : (isSignUp ? 'Sign Up' : 'Sign In')}
              </Button>
            </form>
            
            <div className="text-center pt-4">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-[#183B6B] hover:text-[#E2B319] font-medium text-sm transition-colors"
              >
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
