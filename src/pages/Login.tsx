import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Shield, User, Camera, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

const API_URL = "http://178.128.114.245:5000";

const Login = () => {
  const [adminId, setAdminId] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Start webcam
  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing webcam:", error);
      toast({
        title: "Error",
        description: "Failed to access webcam. Please ensure camera access is allowed.",
        variant: "destructive",
      });
    }
  };

  // Stop webcam
  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  // Capture photo from webcam
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return null;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg");
  };

  // Handle admin login
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/admin/login`, {
        username: adminId,
        password: adminPassword,
      });
      const token = res.data.token;
      if (!token) {
        throw new Error("No token received from server");
      }
      localStorage.setItem("token", token);
      toast({ title: "Success", description: "Logged in successfully" });
      navigate("/admin");
    } catch (error) {
      console.error("Admin login error:", error.response?.data || error.message);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to log in. Please check your credentials.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  const handleFaceRecognition = async () => {
    setIsScanning(true);
    try {
      const dataUrl = capturePhoto();
      if (!dataUrl) {
        throw new Error("Failed to capture photo");
      }
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const formData = new FormData();
      formData.append("photo", blob, "photo.jpg");

      const res = await axios.post(`${API_URL}/employee/login`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const token = res.data.token;
      if (!token) {
        throw new Error("No token received from server");
      }
      localStorage.setItem("token", token);
      toast({
        title: "Face Recognition Successful",
        description: "Welcome back! Redirecting to your dashboard...",
      });
      navigate("/employee");
    } catch (error) {
      console.error("Employee login error:", error.response?.data || error.message);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Face recognition failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
      stopWebcam();
    }
  };

  // Start webcam when employee tab is selected
  useEffect(() => {
    return () => stopWebcam(); // Cleanup on unmount
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-full mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">AutoAttend</h1>
          <p className="text-muted-foreground">Automated Attendance Management System</p>
        </div>

        <Card className="shadow-elevated">
          <CardHeader className="space-y-4">
            <CardTitle className="text-center text-xl">Sign In</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="admin" className="w-full" onValueChange={(value) => {
              if (value === "employee") startWebcam();
              else stopWebcam();
            }}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="admin" className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Admin
                </TabsTrigger>
                <TabsTrigger value="employee" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Employee
                </TabsTrigger>
              </TabsList>

              <TabsContent value="admin" className="space-y-4 mt-6">
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="adminId">Admin ID</Label>
                    <Input
                      id="adminId"
                      type="text"
                      placeholder="Enter your admin ID"
                      value={adminId}
                      onChange={(e) => setAdminId(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adminPassword">Password</Label>
                    <Input
                      id="adminPassword"
                      type="password"
                      placeholder="Enter your password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <Button type="submit" className="w-full bg-gradient-admin" disabled={loading}>
                    {loading ? "Logging in..." : "Sign In as Admin"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="employee" className="space-y-4 mt-6">
                <div className="text-center space-y-6">
                  <div className="mx-auto w-48 h-48 bg-gradient-to-br from-accent/10 to-accent/20 rounded-full flex items-center justify-center border-4 border-dashed border-accent/30 relative overflow-hidden">
                    {!isScanning ? (
                      <div className="text-center">
                        <video ref={videoRef} autoPlay className="w-full h-full object-cover rounded-full" />
                        <canvas ref={canvasRef} className="hidden" />
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mb-2"></div>
                        <p className="text-sm text-accent font-medium">Scanning...</p>
                      </div>
                    )}
                  </div>
                  <Button 
                    onClick={handleFaceRecognition} 
                    disabled={isScanning || loading}
                    className="w-full bg-gradient-employee"
                  >
                    {isScanning ? "Processing..." : "Start Face Recognition"}
                  </Button>
                  <div className="pt-4 border-t">
                    <Link 
                      to="/contact-admin" 
                      className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <AlertCircle className="w-4 h-4" />
                      Having trouble? Contact Admin
                    </Link>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center">
              <Link 
                to="/forgot-password" 
                className="text-sm text-primary hover:text-primary-hover transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Badge variant="outline" className="text-xs">
            Secure • Reliable • Professional
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default Login;