import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Home, Users, Clock, CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// File: src/pages/Index.tsx

const API_BASE_URL = "https://ample-magic-production.up.railway.app/api";
const EMPLOYEE_ID = 1;
const ROOM_ID = 1;

type View = 'dashboard' | 'leave' | 'meeting' | 'admin';

interface Leave {
  leaveId: number;
  employee: { employeeId: number };
  startDate: string;
  endDate: string;
  leaveType: string;
  reason: string;
  status: string;
}

interface Meeting {
  meetingId: number;
  title: string;
  agenda: string;
  startTime: string;
  endTime: string;
  room: { roomId: number } | null | undefined;
  organizerId: number;
}

const Index = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Leave form state
  const [leaveForm, setLeaveForm] = useState({
    startDate: '',
    endDate: '',
    leaveType: '',
    reason: ''
  });
  const [leaves, setLeaves] = useState<Leave[]>([]);

  // Meeting form state
  const [meetingForm, setMeetingForm] = useState({
    title: '',
    agenda: '',
    startTime: '',
    endTime: ''
  });
  const [meetings, setMeetings] = useState<Meeting[]>([]);

  // Admin state
  const [pendingLeaves, setPendingLeaves] = useState<Leave[]>([]);

  // Fetch data when view changes
  useEffect(() => {
    if (currentView === 'leave') {
      fetchLeaveHistory();
    } else if (currentView === 'meeting') {
      fetchMeetings();
    } else if (currentView === 'admin') {
      fetchPendingLeaves();
    }
  }, [currentView]);

  const fetchLeaveHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/leaves/employee/${EMPLOYEE_ID}`);
      if (response.ok) {
        const data = await response.json();
        setLeaves(data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch leave history",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMeetings = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/meetings/room/${ROOM_ID}`);
      if (response.ok) {
        const data = await response.json();
        setMeetings(data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch meeting schedule",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingLeaves = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/leaves/pending`);
      if (response.ok) {
        const data = await response.json();
        setPendingLeaves(data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch pending leaves",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const submitLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const payload = {
        employee: { employeeId: EMPLOYEE_ID },
        startDate: new Date(leaveForm.startDate).toISOString(),
        endDate: new Date(leaveForm.endDate).toISOString(),
        leaveType: leaveForm.leaveType,
        reason: leaveForm.reason
      };

      const response = await fetch(`${API_BASE_URL}/leaves`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Leave request submitted successfully",
        });
        setLeaveForm({ startDate: '', endDate: '', leaveType: '', reason: '' });
        fetchLeaveHistory();
      } else {
        throw new Error('Failed to submit leave request');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit leave request",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const submitMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        title: meetingForm.title,
        agenda: meetingForm.agenda,
        startTime: new Date(meetingForm.startTime).toISOString(),
        endTime: new Date(meetingForm.endTime).toISOString(),
        room: { roomId: ROOM_ID },
        organizerId: EMPLOYEE_ID
      };

      const response = await fetch(`${API_BASE_URL}/meetings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Meeting scheduled successfully",
        });
        setMeetingForm({ title: '', agenda: '', startTime: '', endTime: '' });
        fetchMeetings();
      } else {
        const errorData = await response.json();
        toast({
          title: "Booking Failed",
          description: errorData.message || "Room is already booked for this time slot",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to schedule meeting",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateLeaveStatus = async (leaveId: number, status: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/leaves/${leaveId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Leave request ${status.toLowerCase()}`,
        });
        fetchPendingLeaves();
      } else {
        throw new Error('Failed to update leave status');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update leave status",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'Approved': { variant: 'default' as const, className: 'bg-success text-success-foreground' },
      'Pending': { variant: 'default' as const, className: 'bg-warning text-warning-foreground' },
      'Rejected': { variant: 'destructive' as const, className: '' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.Pending;
    return <Badge variant={config.variant} className={config.className}>{status}</Badge>;
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-card border-b shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold">IO</span>
              </div>
              <span className="font-semibold text-lg">Office Management</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant={currentView === 'dashboard' ? 'default' : 'ghost'}
                onClick={() => setCurrentView('dashboard')}
                className="gap-2"
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Button>
              <Button
                variant={currentView === 'leave' ? 'default' : 'ghost'}
                onClick={() => setCurrentView('leave')}
                className="gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span className="hidden sm:inline">Leave</span>
              </Button>
              <Button
                variant={currentView === 'meeting' ? 'default' : 'ghost'}
                onClick={() => setCurrentView('meeting')}
                className="gap-2"
              >
                <Clock className="w-4 h-4" />
                <span className="hidden sm:inline">Meetings</span>
              </Button>
              <Button
                variant={currentView === 'admin' ? 'default' : 'ghost'}
                onClick={() => setCurrentView('admin')}
                className="gap-2"
              >
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Admin</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {loading && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Dashboard View */}
        {currentView === 'dashboard' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome to Office Management</h1>
              <p className="text-muted-foreground">Manage your leaves, meetings, and approvals all in one place</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setCurrentView('leave')}>
                <CardHeader>
                  <Calendar className="w-12 h-12 text-primary mb-4" />
                  <CardTitle>Leave Management</CardTitle>
                  <CardDescription>Submit and track your leave requests</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">Go to Leave</Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setCurrentView('meeting')}>
                <CardHeader>
                  <Clock className="w-12 h-12 text-primary mb-4" />
                  <CardTitle>Room Booking</CardTitle>
                  <CardDescription>Schedule meetings and check room availability</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">Go to Meetings</Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setCurrentView('admin')}>
                <CardHeader>
                  <Users className="w-12 h-12 text-primary mb-4" />
                  <CardTitle>Admin Panel</CardTitle>
                  <CardDescription>Review and approve leave requests</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">Go to Admin</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Leave Management View */}
        {currentView === 'leave' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">Leave Management</h1>
            
            <Card>
              <CardHeader>
                <CardTitle>Submit Leave Request</CardTitle>
                <CardDescription>Fill out the form below to request time off</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={submitLeave} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="datetime-local"
                        value={leaveForm.startDate}
                        onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="datetime-local"
                        value={leaveForm.endDate}
                        onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="leaveType">Leave Type</Label>
                    <Select value={leaveForm.leaveType} onValueChange={(value) => setLeaveForm({ ...leaveForm, leaveType: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select leave type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sick">Sick Leave</SelectItem>
                        <SelectItem value="Vacation">Vacation</SelectItem>
                        <SelectItem value="Casual">Casual Leave</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason</Label>
                    <Textarea
                      id="reason"
                      value={leaveForm.reason}
                      onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                      placeholder="Please provide a reason for your leave request"
                      rows={4}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Submit Leave Request
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Leave History</CardTitle>
                <CardDescription>View all your past and current leave requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Start Date</TableHead>
                        <TableHead>End Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leaves.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground">
                            No leave requests found
                          </TableCell>
                        </TableRow>
                      ) : (
                        leaves.map((leave) => (
                          <TableRow key={leave.leaveId}>
                            <TableCell>{new Date(leave.startDate).toLocaleDateString()}</TableCell>
                            <TableCell>{new Date(leave.endDate).toLocaleDateString()}</TableCell>
                            <TableCell>{leave.leaveType}</TableCell>
                            <TableCell>{getStatusBadge(leave.status)}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Meeting/Room Booking View */}
        {currentView === 'meeting' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">Room Booking</h1>
            
            <Card>
              <CardHeader>
                <CardTitle>Schedule Meeting</CardTitle>
                <CardDescription>Book Room 1 for your meeting</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={submitMeeting} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Meeting Title</Label>
                    <Input
                      id="title"
                      value={meetingForm.title}
                      onChange={(e) => setMeetingForm({ ...meetingForm, title: e.target.value })}
                      placeholder="Enter meeting title"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="agenda">Agenda</Label>
                    <Textarea
                      id="agenda"
                      value={meetingForm.agenda}
                      onChange={(e) => setMeetingForm({ ...meetingForm, agenda: e.target.value })}
                      placeholder="Meeting agenda"
                      rows={3}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startTime">Start Time</Label>
                      <Input
                        id="startTime"
                        type="datetime-local"
                        value={meetingForm.startTime}
                        onChange={(e) => setMeetingForm({ ...meetingForm, startTime: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endTime">End Time</Label>
                      <Input
                        id="endTime"
                        type="datetime-local"
                        value={meetingForm.endTime}
                        onChange={(e) => setMeetingForm({ ...meetingForm, endTime: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Schedule Meeting
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Room Schedule</CardTitle>
                <CardDescription>Current bookings for Room 1</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Start Time</TableHead>
                        <TableHead>End Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {meetings.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center text-muted-foreground">
                            No meetings scheduled
                          </TableCell>
                        </TableRow>
                      ) : (
                        meetings.map((meeting) => (
                          <TableRow key={meeting.meetingId}>
                            <TableCell className="font-medium">{meeting.title}</TableCell>
                            <TableCell>{formatDateTime(meeting.startTime)}</TableCell>
                            <TableCell>{formatDateTime(meeting.endTime)}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Admin Panel View */}
        {currentView === 'admin' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            
            <Card>
              <CardHeader>
                <CardTitle>Pending Leave Approvals</CardTitle>
                <CardDescription>Review and approve or reject leave requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Leave ID</TableHead>
                        <TableHead>Employee ID</TableHead>
                        <TableHead>Dates</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingLeaves.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground">
                            No pending leave requests
                          </TableCell>
                        </TableRow>
                      ) : (
                        pendingLeaves.map((leave) => (
                          <TableRow key={leave.leaveId}>
                            <TableCell className="font-medium">{leave.leaveId}</TableCell>
                            <TableCell>{leave.employee?.employeeId || 'N/A'}</TableCell>
                            <TableCell>
                              {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                            </TableCell>
                            <TableCell>{leave.leaveType}</TableCell>
                            <TableCell className="max-w-xs truncate">{leave.reason}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex gap-2 justify-end">
                                <Button
                                  size="sm"
                                  onClick={() => updateLeaveStatus(leave.leaveId, 'Approved')}
                                  className="bg-success hover:bg-success/90 text-success-foreground"
                                  disabled={loading}
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => updateLeaveStatus(leave.leaveId, 'Rejected')}
                                  disabled={loading}
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
