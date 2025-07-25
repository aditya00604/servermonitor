import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface OtpFormProps {
  onSuccess: () => void;
}

export function OtpForm({ onSuccess }: OtpFormProps) {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [devOtp, setDevOtp] = useState(''); // For development only
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        body: JSON.stringify({ email }),
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send OTP");
      }

      const data = await response.json();
      
      if (data.otp) {
        setDevOtp(data.otp); // Store dev OTP for convenience
      }
      
      setStep('otp');
      toast({
        title: "OTP Sent",
        description: data.message,
        variant: "default",
      });
    } catch (error: any) {
      console.error('Send OTP error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send OTP",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a 6-digit OTP",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email, otp }),
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to verify OTP");
      }

      const data = await response.json();
      
      // Update the query cache with user data
      if (data.user) {
        queryClient.setQueryData(["/api/user"], data.user);
      }
      
      toast({
        title: "Success",
        description: "OTP verified successfully! Logging you in...",
        variant: "default",
      });
      
      // Redirect to dashboard after successful authentication
      onSuccess();
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 500);
      
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to verify OTP",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseDevOtp = () => {
    setOtp(devOtp);
  };

  if (step === 'email') {
    return (
      <form onSubmit={handleSendOtp} className="space-y-4">
        <div>
          <Input 
            type="email" 
            placeholder="Enter your email address" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          />
        </div>
        <Button 
          type="submit"
          size="lg" 
          variant="outline"
          className="w-full text-lg py-3"
          disabled={isLoading}
        >
          {isLoading ? "Sending..." : "Send OTP Verification"}
        </Button>
      </form>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h4 className="text-lg font-medium text-gray-900 mb-2">
          Verify Your Email
        </h4>
        <p className="text-sm text-gray-600 mb-4">
          We've sent a 6-digit code to <strong>{email}</strong>
        </p>
      </div>
      
      <form onSubmit={handleVerifyOtp} className="space-y-4">
        <div>
          <Input 
            type="text" 
            placeholder="Enter 6-digit OTP" 
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-center text-lg tracking-widest"
            maxLength={6}
            required
          />
        </div>
        
        {process.env.NODE_ENV === 'development' && devOtp && (
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-2">Development Mode:</p>
            <Button 
              type="button"
              variant="outline"
              size="sm"
              onClick={handleUseDevOtp}
              className="text-xs"
            >
              Use Dev OTP: {devOtp}
            </Button>
          </div>
        )}
        
        <Button 
          type="submit"
          size="lg" 
          className="w-full text-lg py-3"
          disabled={isLoading}
        >
          {isLoading ? "Verifying..." : "Verify & Sign In"}
        </Button>
      </form>
      
      <div className="text-center">
        <button 
          type="button"
          onClick={() => setStep('email')}
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Change email address
        </button>
      </div>
    </div>
  );
}