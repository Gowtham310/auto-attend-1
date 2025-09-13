import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setEmailSent(true);
      toast({
        title: "Reset Code Sent",
        description: "Please check your email for the password reset code.",
      });
    }, 2000);
  };

  const handleResendMail = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Code Resent",
        description: "A new reset code has been sent to your email.",
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <Card className="shadow-elevated">
          <CardHeader className="space-y-4">
            <div className="flex items-center gap-3">
              <Link 
                to="/login" 
                className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <CardTitle className="text-xl">Reset Password</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">
              Enter your email address and we'll send you a code to reset your password.
            </p>
          </CardHeader>
          <CardContent>
            {!emailSent ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Send Reset Code
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto">
                  <Mail className="w-8 h-8 text-success" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Check Your Email</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    We've sent a password reset code to <strong>{email}</strong>
                  </p>
                </div>
                <Button 
                  onClick={handleResendMail} 
                  variant="outline" 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Resending...
                    </>
                  ) : (
                    "Resend Mail"
                  )}
                </Button>
              </div>
            )}

            <div className="mt-6 text-center">
              <Link 
                to="/login" 
                className="text-sm text-primary hover:text-primary-hover transition-colors"
              >
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;