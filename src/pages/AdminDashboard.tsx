import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  User, 
  Users, 
  Bell, 
  FileText, 
  UserPlus, 
  LogOut, 
  Shield,
  Mail,
  MapPin,
  Building,
  Clock,
  Filter,
  Send,
  Camera,
  Trash2,
  Phone 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

const API_URL = "http://178.128.114.245:5000";

const AdminDashboard = () => {
  const [activeView, setActiveView] = useState("profile");
  const [sortBy, setSortBy] = useState("name");
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    department: "",
    email: "",
    employeeId: "",
    address: "",
    phone: "",
    photo: null,
  });
  const [adminProfile, setAdminProfile] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationTo, setNotificationTo] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [loading, setLoading] = useState({ profile: false, employees: false, notifications: false, todayAttendance: false });
  const [error, setError] = useState(null);
  const { toast } = useToast();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const startWebcam = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing webcam:", error);
      toast({ title: "Error", description: "Failed to access webcam. Please allow camera permissions.", variant: "destructive" });
    }
  }, [toast]);

  const stopWebcam = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      if (stream) {
        stream.getTracks().forEach(track => {
          track.stop();
        });
        videoRef.current.srcObject = null;
      }
    }
  }, []);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) {
      toast({ title: "Error", description: "Webcam or canvas not initialized", variant: "destructive" });
      return;
    }
    const context = canvasRef.current.getContext("2d");
    context.drawImage(videoRef.current, 0, 0, 320, 240);
    canvasRef.current.toBlob((blob) => {
      if (blob) {
        setNewEmployee({ ...newEmployee, photo: blob });
        toast({ title: "Success", description: "Photo captured successfully" });
      } else {
        toast({ title: "Error", description: "Failed to capture photo", variant: "destructive" });
      }
    }, "image/jpeg");
  };

  const fetchAdminProfile = useCallback(async () => {
    setLoading((prev) => ({ ...prev, profile: true }));
    try {
      const res = await axios.get(`${API_URL}/admin/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAdminProfile(res.data);
    } catch (error) {
      console.error("Error fetching admin profile:", error);
      toast({ title: "Error", description: error.response?.data || "Failed to fetch profile", variant: "destructive" });
      setError("Failed to load profile");
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("token");
        setToken("");
        window.location.href = "/login";
      }
    } finally {
      setLoading((prev) => ({ ...prev, profile: false }));
    }
  }, [token, toast]);

  const fetchEmployees = useCallback(async () => {
    setLoading((prev) => ({ ...prev, employees: true }));
    try {
      const res = await axios.get(`${API_URL}/admin/employees`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployees(res.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast({ title: "Error", description: error.response?.data || "Failed to fetch employees", variant: "destructive" });
      setError("Failed to load employees");
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("token");
        setToken("");
        window.location.href = "/login";
      }
    } finally {
      setLoading((prev) => ({ ...prev, employees: false }));
    }
  }, [token, toast]);

  const fetchNotifications = useCallback(async () => {
    setLoading((prev) => ({ ...prev, notifications: true }));
    try {
      const res = await axios.get(`${API_URL}/admin/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast({ title: "Error", description: error.response?.data || "Failed to fetch notifications", variant: "destructive" });
      setError("Failed to load notifications");
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("token");
        setToken("");
        window.location.href = "/login";
      }
    } finally {
      setLoading((prev) => ({ ...prev, notifications: false }));
    }
  }, [token, toast]);

  const fetchTodayAttendance = useCallback(async () => {
    setLoading((prev) => ({ ...prev, todayAttendance: true }));
    try {
      const res = await axios.get(`${API_URL}/admin/attendance/today`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTodayAttendance(res.data);
    } catch (error) {
      console.error("Error fetching today's attendance:", error);
      toast({ title: "Error", description: error.response?.data || "Failed to fetch today's attendance", variant: "destructive" });
      setError("Failed to load today's attendance");
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("token");
        setToken("");
        window.location.href = "/login";
      }
    } finally {
      setLoading((prev) => ({ ...prev, todayAttendance: false }));
    }
  }, [token, toast]);

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    if (!newEmployee.photo) {
      toast({ title: "Error", description: "Please capture a photo", variant: "destructive" });
      return;
    }
    const formData = new FormData();
    formData.append("fullName", newEmployee.name);
    formData.append("employeeId", newEmployee.employeeId);
    formData.append("department", newEmployee.department);
    formData.append("email", newEmployee.email);
    formData.append("address", newEmployee.address);
    formData.append("phone", newEmployee.phone);
    formData.append("photo", newEmployee.photo, "employee.jpg");
    try {
      await axios.post(`${API_URL}/admin/register-employee`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`, 
          "Content-Type": "multipart/form-data" 
        },
      });
      toast({ title: "Success", description: `${newEmployee.name} has been registered` });
      setNewEmployee({ name: "", department: "", email: "", employeeId: "", address: "", phone: "", photo: null });
      fetchEmployees();
    } catch (error) {
      console.error("Error adding employee:", error);
      const errorMessage = error.response?.data;
      if (errorMessage === "Employee ID or email already exists") {
        toast({ title: "Error", description: "Employee ID or email is already registered", variant: "destructive" });
      } else {
        toast({ title: "Error", description: errorMessage || "Failed to register employee", variant: "destructive" });
      }
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("token");
        setToken("");
        window.location.href = "/login";
      }
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    try {
      await axios.delete(`${API_URL}/admin/employees/${employeeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({ title: "Success", description: `Employee ${employeeId} deleted successfully` });
      fetchEmployees();
    } catch (error) {
      console.error("Error deleting employee:", error);
      const errorMessage = error.response?.data;
      toast({ title: "Error", description: errorMessage || "Failed to delete employee", variant: "destructive" });
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("token");
        setToken("");
        window.location.href = "/login";
      }
    }
  };

  const handleSendNotification = async () => {
    if (!notificationTo || !notificationMessage) {
      toast({ title: "Error", description: "Please select an employee and enter a message", variant: "destructive" });
      return;
    }
    try {
      await axios.post(
        `${API_URL}/admin/notifications`,
        { to: notificationTo, message: notificationMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast({ title: "Success", description: "Notification sent" });
      setNotificationMessage("");
      setNotificationTo("");
      fetchNotifications();
    } catch (error) {
      console.error("Error sending notification:", error);
      toast({ title: "Error", description: error.response?.data || "Failed to send notification", variant: "destructive" });
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("token");
        setToken("");
        window.location.href = "/login";
      }
    }
  };

  const handleLogout = () => {
    stopWebcam();
    localStorage.removeItem("token");
    setToken("");
    toast({ title: "Success", description: "Logged out successfully" });
    window.location.href = "/login";
  };

  useEffect(() => {
    if (token) {
      fetchAdminProfile();
      fetchEmployees();
      fetchNotifications();
      if (activeView === "reports") {
        fetchTodayAttendance();
      }
    } else {
      window.location.href = "/login";
    }
  }, [token, fetchAdminProfile, fetchEmployees, fetchNotifications, activeView, fetchTodayAttendance]);

  useEffect(() => {
    if (activeView === "add-employee") {
      startWebcam();
    } else {
      stopWebcam();
    }
    return () => {
      stopWebcam();
    };
  }, [activeView, startWebcam, stopWebcam]);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow border-b">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">AutoAttend Admin</h1>
              <p className="text-sm text-gray-500">Management Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-medium">{adminProfile?.fullName || "Loading..."}</p>
              <p className="text-sm text-gray-500">{adminProfile?.department || ""}</p>
            </div>
            <Avatar className="w-10 h-10">
              <AvatarImage src="" alt={adminProfile?.fullName} />
              <AvatarFallback className="bg-blue-500 text-white">
                {adminProfile?.fullName?.split(' ').map(n => n[0]).join('') || "A"}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="w-64 bg-white shadow h-[calc(100vh-73px)] p-4">
          <nav className="space-y-2">
            {[
              { id: "profile", label: "Profile", icon: User },
              { id: "employees", label: "Employee Registered", icon: Users },
              { id: "notifications", label: "Notifications", icon: Bell },
              { id: "reports", label: "View Report", icon: FileText },
              { id: "add-employee", label: "Add New Employee", icon: UserPlus },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeView === item.id 
                    ? "bg-blue-500 text-white" 
                    : "hover:bg-gray-100 text-gray-900"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors mt-8"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </nav>
        </aside>

        <main className="flex-1 p-6">
          {error && <div className="text-red-600 mb-4">{error}</div>}
          {loading.profile && activeView === "profile" && <div>Loading profile...</div>}
          {loading.employees && activeView === "employees" && <div>Loading employees...</div>}
          {loading.notifications && activeView === "notifications" && <div>Loading notifications...</div>}
          {loading.todayAttendance && activeView === "reports" && <div>Loading today's attendance...</div>}

          {activeView === "profile" && !loading.profile && adminProfile && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Admin Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src="" alt={adminProfile.fullName} />
                    <AvatarFallback className="bg-blue-500 text-white text-xl">
                      {adminProfile.fullName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-2xl font-bold">{adminProfile.fullName}</h2>
                    <Badge variant="secondary" className="mt-1">{adminProfile.department}</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <span>{adminProfile.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Building className="w-5 h-5 text-gray-500" />
                    <span>{adminProfile.department}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-500" />
                    <span>{adminProfile.address}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-500" />
                    <span>{adminProfile.phone || "Not provided"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeView === "employees" && !loading.employees && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Registered Employees</h2>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Sort by..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Sort by Name</SelectItem>
                    <SelectItem value="department">Sort by Department</SelectItem>
                    <SelectItem value="email">Sort by Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-4">
                {employees.length === 0 && <p>No employees registered</p>}
                {employees.sort((a, b) => {
                  if (sortBy === "name") return a.fullName.localeCompare(b.fullName);
                  if (sortBy === "department") return a.department.localeCompare(b.department);
                  return a.email.localeCompare(b.email);
                }).map((employee) => (
                  <Card key={employee._id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarFallback>{employee.fullName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">{employee.fullName}</h3>
                            <p className="text-sm text-gray-500">{employee.email}</p>
                            <p className="text-sm text-gray-500">ID: {employee.employeeId}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">{employee.department}</Badge>
                          <p className="text-sm text-gray-500 mt-1">
                            <MapPin className="w-4 h-4 inline mr-1" />
                            {employee.address}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            <Phone className="w-4 h-4 inline mr-1" />
                            {employee.phone || "Not provided"}
                          </p>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="mt-2"
                            onClick={() => handleDeleteEmployee(employee.employeeId)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeView === "notifications" && !loading.notifications && (
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
                    <TabsTrigger value="receive">Receive</TabsTrigger>
                    <TabsTrigger value="send">Send</TabsTrigger>
                  </TabsList>
                  <TabsContent value="receive" className="mt-4 space-y-4">
                    {notifications.length === 0 && <p>No notifications available</p>}
                    {notifications.map((notification) => (
                      <div key={notification._id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">{notification.from}</h4>
                            <p className="text-sm text-gray-500 mt-1">{notification.message}</p>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(notification.time).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                  <TabsContent value="send" className="mt-4">
                    <div className="space-y-4">
                      <div>
                        <Label>Select Employees</Label>
                        <Select value={notificationTo} onValueChange={setNotificationTo}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose employees..." />
                          </SelectTrigger>
                          <SelectContent>
                            {employees.map((emp) => (
                              <SelectItem key={emp._id} value={emp.employeeId}>
                                {emp.fullName} - {emp.department}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Message</Label>
                        <Textarea
                          placeholder="Type your message..."
                          rows={4}
                          value={notificationMessage}
                          onChange={(e) => setNotificationMessage(e.target.value)}
                        />
                      </div>
                      <Button onClick={handleSendNotification} className="w-full">
                        <Send className="w-4 h-4 mr-2" />
                        Send Notification
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}

          {activeView === "reports" && !loading.todayAttendance && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Today's Attendance Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {todayAttendance.length === 0 && <p>No present employees today</p>}
                  {todayAttendance.map((record) => (
                    <div key={record._id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {record.fullName?.split(' ').map(n => n[0]).join('') || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium">{record.fullName || "Unknown"}</h4>
                            <p className="text-sm text-gray-500">{record.department || ""}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4" />
                            <span>Last seen: {new Date(record.date).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm mt-1">
                            <MapPin className="w-4 h-4" />
                            <span>
                              Location: {record.location?.city || "Unknown"}, {record.location?.region || "Unknown"}, {record.location?.country || "Unknown"}
                            </span>
                          </div>
                          <Badge variant="outline" className="mt-1">{record.status}</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeView === "add-employee" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Add New Employee
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddEmployee} className="space-y-6">
                  <div className="flex justify-center">
                    <div className="text-center">
                      <video ref={videoRef} autoPlay className="w-64 h-48 rounded-lg border" />
                      <canvas ref={canvasRef} className="hidden" width="320" height="240" />
                      <Button type="button" onClick={capturePhoto} className="mt-2">
                        <Camera className="w-4 h-4 mr-2" />
                        Capture Photo
                      </Button>
                      {newEmployee.photo && (
                        <p className="text-sm text-gray-500 mt-2">Photo captured</p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={newEmployee.name}
                        onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="employeeId">Employee ID</Label>
                      <Input
                        id="employeeId"
                        value={newEmployee.employeeId}
                        onChange={(e) => setNewEmployee({ ...newEmployee, employeeId: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="department">Department</Label>
                      <Select
                        value={newEmployee.department}
                        onValueChange={(value) => setNewEmployee({ ...newEmployee, department: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Engineering">Engineering</SelectItem>
                          <SelectItem value="Marketing">Marketing</SelectItem>
                          <SelectItem value="Sales">Sales</SelectItem>
                          <SelectItem value="Human Resources">Human Resources</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newEmployee.email}
                        onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={newEmployee.phone}
                        onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={newEmployee.address}
                      onChange={(e) => setNewEmployee({ ...newEmployee, address: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Employee
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;