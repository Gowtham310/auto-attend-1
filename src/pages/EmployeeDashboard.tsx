import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { 
  User, 
  Activity, 
  Bell, 
  MessageSquare, 
  LogOut,
  Phone,
  Mail,
  Building,
  Calendar,
  Clock,
  CheckCircle,
  Send,
  Users,
  MapPin
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

const API_URL = "http://178.128.114.245:5000";

const EmployeeDashboard = () => {
  const [activeView, setActiveView] = useState("profile");
  const [profileData, setProfileData] = useState({
    fullName: "",
    phone: "",
    email: "",
    department: "",
    employeeId: "",
    address: "",
    lastSeen: ""
  });
  const [newComplaint, setNewComplaint] = useState("");
  const [newNotification, setNewNotification] = useState("");
  const [employee, setEmployee] = useState(null);
  const [activities, setActivities] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState({ profile: false, activities: false, notifications: false, complaints: false });
  const [error, setError] = useState(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Fetch employee profile
  const fetchProfile = async () => {
    setLoading((prev) => ({ ...prev, profile: true }));
    try {
      const res = await axios.get(`${API_URL}/employee/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployee(res.data);
      setProfileData({
        fullName: res.data.fullName,
        phone: res.data.phone || "",
        email: res.data.email,
        department: res.data.department,
        employeeId: res.data.employeeId,
        address: res.data.address || "",
        lastSeen: res.data.lastSeen ? new Date(res.data.lastSeen).toLocaleString() : ""
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({ title: "Error", description: error.response?.data || "Failed to fetch profile", variant: "destructive" });
      setError("Failed to load profile");
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setLoading((prev) => ({ ...prev, profile: false }));
    }
  };

  // Fetch attendance (activities)
  const fetchActivities = async () => {
    setLoading((prev) => ({ ...prev, activities: true }));
    try {
      const res = await axios.get(`${API_URL}/employee/attendance`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setActivities(res.data.map(activity => ({
        id: activity._id,
        type: activity.status === "Present" ? "login" : "logout",
        time: new Date(activity.date).toLocaleTimeString(),
        date: new Date(activity.date).toLocaleDateString(),
        location: "Office",
        status: activity.status === "Present" ? "success" : "failed"
      })));
    } catch (error) {
      console.error("Error fetching activities:", error);
      toast({ title: "Error", description: error.response?.data || "Failed to fetch activities", variant: "destructive" });
      setError("Failed to load activities");
    } finally {
      setLoading((prev) => ({ ...prev, activities: false }));
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    setLoading((prev) => ({ ...prev, notifications: true }));
    try {
      const res = await axios.get(`${API_URL}/employee/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data.map(notification => ({
        id: notification._id,
        from: notification.from,
        message: notification.message,
        time: new Date(notification.time).toLocaleString(),
        type: "info"
      })));
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast({ title: "Error", description: error.response?.data || "Failed to fetch notifications", variant: "destructive" });
      setError("Failed to load notifications");
    } finally {
      setLoading((prev) => ({ ...prev, notifications: false }));
    }
  };

  // Fetch complaints
  const fetchComplaints = async () => {
    setLoading((prev) => ({ ...prev, complaints: true }));
    try {
      const res = await axios.get(`${API_URL}/employee/complaints`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComplaints(res.data.map(complaint => ({
        id: complaint._id,
        subject: complaint.description.slice(0, 30) + (complaint.description.length > 30 ? "..." : ""),
        content: complaint.description,
        status: complaint.status,
        date: new Date(complaint.time).toLocaleDateString()
      })));
    } catch (error) {
      console.error("Error fetching complaints:", error);
      toast({ title: "Error", description: error.response?.data || "Failed to fetch complaints", variant: "destructive" });
      setError("Failed to load complaints");
    } finally {
      setLoading((prev) => ({ ...prev, complaints: false }));
    }
  };

  // Update profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/employee/profile`, profileData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({
        title: "Profile Updated",
        description: "Your profile information has been successfully updated.",
      });
      fetchProfile();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({ title: "Error", description: error.response?.data || "Failed to update profile", variant: "destructive" });
    }
  };

  // Submit complaint
  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    if (!newComplaint.trim()) {
      toast({ title: "Error", description: "Please enter a complaint description", variant: "destructive" });
      return;
    }
    try {
      await axios.post(`${API_URL}/employee/complaints`, { description: newComplaint }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({
        title: "Complaint Submitted",
        description: "Your complaint has been sent to the administration.",
      });
      setNewComplaint("");
      fetchComplaints();
    } catch (error) {
      console.error("Error submitting complaint:", error);
      toast({ title: "Error", description: error.response?.data || "Failed to submit complaint", variant: "destructive" });
    }
  };

  // Send notification
  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!newNotification.trim()) {
      toast({ title: "Error", description: "Please enter a notification message", variant: "destructive" });
      return;
    }
    try {
      await axios.post(`${API_URL}/employee/notifications`, { to: "admin", message: newNotification }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({
        title: "Notification Sent",
        description: "Your message has been sent to the administrator.",
      });
      setNewNotification("");
      fetchNotifications();
    } catch (error) {
      console.error("Error sending notification:", error);
      toast({ title: "Error", description: error.response?.data || "Failed to send notification", variant: "destructive" });
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    toast({ title: "Success", description: "Logged out successfully" });
    navigate("/login");
  };

  // Fetch data on mount
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchProfile();
  }, [token, navigate]);

  useEffect(() => {
    if (employee?.employeeId) {
      fetchActivities();
      fetchNotifications();
      fetchComplaints();
    }
  }, [employee]);

  return (
    <div className="min-h-screen bg-employee-bg">
      {/* Header */}
      <header className="bg-white shadow-card border-b">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-employee rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">AutoAttend Employee</h1>
              <p className="text-sm text-muted-foreground">Welcome back, {employee?.fullName || "Loading..."}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-medium">{employee?.fullName || "Loading..."}</p>
              <Badge variant="secondary">{employee?.department || ""}</Badge>
            </div>
            <Avatar className="w-10 h-10">
              <AvatarImage src="" alt={employee?.fullName} />
              <AvatarFallback className="bg-gradient-employee text-white">
                {employee?.fullName?.split(' ').map(n => n[0]).join('') || "E"}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-card h-[calc(100vh-73px)] p-4">
          <nav className="space-y-2">
            {[
              { id: "profile", label: "Profile", icon: User },
              { id: "activities", label: "Activities", icon: Activity },
              { id: "notifications", label: "Notifications", icon: Bell },
              { id: "complaints", label: "Complaints", icon: MessageSquare },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeView === item.id 
                    ? "bg-accent text-accent-foreground" 
                    : "hover:bg-secondary text-foreground"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-destructive hover:bg-destructive/10 transition-colors mt-8"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {error && <div className="text-destructive mb-4">{error}</div>}

          {/* Profile View */}
          {activeView === "profile" && (
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  My Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {loading.profile ? (
                  <div>Loading profile...</div>
                ) : (
                  <>
                    <div className="flex items-center gap-6">
                      <Avatar className="w-20 h-20">
                        <AvatarImage src="" alt={employee?.fullName} />
                        <AvatarFallback className="bg-gradient-employee text-white text-xl">
                          {employee?.fullName?.split(' ').map(n => n[0]).join('') || "E"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h2 className="text-2xl font-bold">{employee?.fullName}</h2>
                        <Badge variant="secondary" className="mt-1">{employee?.department}</Badge>
                        <p className="text-sm text-muted-foreground mt-1">Employee ID: {employee?.employeeId}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-muted-foreground" />
                        <span>{employee?.email}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-muted-foreground" />
                        <span>{employee?.phone || "Not provided"}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Building className="w-5 h-5 text-muted-foreground" />
                        <span>{employee?.department}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-muted-foreground" />
                        <span>Last Seen: {employee?.lastSeen ? new Date(employee.lastSeen).toLocaleString() : "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-muted-foreground" />
                        <span>{employee?.address || "Not provided"}</span>
                      </div>
                    </div>
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold mb-4">Update Profile Information</h3>
                      <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                              id="name"
                              value={profileData.fullName}
                              onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                              id="phone"
                              value={profileData.phone}
                              onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              value={profileData.email}
                              onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="address">Address</Label>
                            <Input
                              id="address"
                              value={profileData.address}
                              onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                            />
                          </div>
                        </div>
                        <Button type="submit" className="bg-gradient-employee">
                          Update Profile
                        </Button>
                      </form>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Activities View */}
          {activeView === "activities" && (
            <div className="animate-fade-in space-y-6">
              <h2 className="text-2xl font-bold">Activity History</h2>
              {loading.activities ? (
                <div>Loading activities...</div>
              ) : (
                <div className="grid gap-4">
                  {activities.length === 0 && <p>No activity records available</p>}
                  {activities.map((activity) => (
                    <Card key={activity.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              activity.status === 'success' ? 'bg-success/10' : 'bg-destructive/10'
                            }`}>
                              {activity.status === 'success' ? (
                                <CheckCircle className="w-5 h-5 text-success" />
                              ) : (
                                <Clock className="w-5 h-5 text-destructive" />
                              )}
                            </div>
                            <div>
                              <h3 className="font-semibold capitalize">{activity.type}</h3>
                              <p className="text-sm text-muted-foreground">{activity.location}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{activity.time}</p>
                            <p className="text-sm text-muted-foreground">{activity.date}</p>
                            <Badge variant={activity.status === 'success' ? 'default' : 'destructive'} className="mt-1">
                              {activity.status}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Notifications View */}
          {activeView === "notifications" && (
            <div className="animate-fade-in">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="receive" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="receive">Received</TabsTrigger>
                      <TabsTrigger value="send">Send</TabsTrigger>
                    </TabsList>
                    <TabsContent value="receive" className="mt-4 space-y-4">
                      {loading.notifications ? (
                        <div>Loading notifications...</div>
                      ) : (
                        <>
                          {notifications.length === 0 && <p>No notifications available</p>}
                          {notifications.map((notification) => (
                            <div key={notification.id} className="p-4 border rounded-lg">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-medium">{notification.from}</h4>
                                  <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                                </div>
                                <div className="text-right">
                                  <span className="text-xs text-muted-foreground">{notification.time}</span>
                                  <Badge variant="outline" className="mt-1 block">
                                    {notification.type}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                    </TabsContent>
                    <TabsContent value="send" className="mt-4">
                      <div className="space-y-4">
                        <div>
                          <Label>Send to Admin</Label>
                          <p className="text-sm text-muted-foreground">Send a message to the administrator</p>
                        </div>
                        <div>
                          <Label>Message</Label>
                          <Textarea
                            placeholder="Type your message..."
                            rows={4}
                            value={newNotification}
                            onChange={(e) => setNewNotification(e.target.value)}
                          />
                        </div>
                        <Button onClick={handleSendNotification} className="w-full bg-gradient-employee">
                          <Send className="w-4 h-4 mr-2" />
                          Send Message
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Complaints View */}
          {activeView === "complaints" && (
            <div className="animate-fade-in space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    File New Complaint
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitComplaint} className="space-y-4">
                    <div>
                      <Label htmlFor="complaint">Describe your issue or concern</Label>
                      <Textarea
                        id="complaint"
                        placeholder="Please provide details about your complaint..."
                        value={newComplaint}
                        onChange={(e) => setNewComplaint(e.target.value)}
                        rows={4}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full bg-gradient-employee">
                      <Send className="w-4 h-4 mr-2" />
                      Submit Complaint
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Previous Complaints</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading.complaints ? (
                    <div>Loading complaints...</div>
                  ) : (
                    <div className="space-y-4">
                      {complaints.length === 0 && <p>No complaints available</p>}
                      {complaints.map((complaint) => (
                        <div key={complaint.id} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium">{complaint.subject}</h4>
                            <Badge variant={complaint.status === 'resolved' ? 'default' : 'secondary'}>
                              {complaint.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{complaint.content}</p>
                          <p className="text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3 inline mr-1" />
                            {complaint.date}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default EmployeeDashboard;