import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Send, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ContactAdmin = () => {
  const [complaint, setComplaint] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint.trim()) return;

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSent(true);
      toast({
        title: "Message Sent",
        description: "Your message has been sent to the administrator.",
      });
    }, 2000);
  };

  const handleBackToLogin = () => {
    navigate("/login");
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
              <CardTitle className="text-xl">Contact Admin</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">
              Having trouble with face recognition or login? Send a message to the administrator for assistance.
            </p>
          </CardHeader>
          <CardContent>
            {!isSent ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="complaint">Your Message</Label>
                  <Textarea
                    id="complaint"
                    placeholder="Describe your issue or concern..."
                    value={complaint}
                    onChange={(e) => setComplaint(e.target.value)}
                    rows={6}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading || !complaint.trim()}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-success" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Message Sent!</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Your message has been sent to the administrator. You should receive a response within 24 hours.
                  </p>
                </div>
                <Button 
                  onClick={handleBackToLogin}
                  className="w-full"
                >
                  Back to Login
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContactAdmin;