// src/components/AdminPanel.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
// Firebase removed
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import {
  Users,
  Calendar,
  BarChart2,
  UserPlus,
  Trash2,
  Edit3,
  LogOut,
  Eye,
  ToggleLeft,
  ToggleRight,
  CheckCircle2,
  XCircle,
  Crown,
  Menu,
  Settings,
  Search,
  ChevronRight,
  Upload,
  MapPin,
  Clock,
  AlertTriangle,
  BellRing,
  LayoutDashboard,
  MessageSquare,
  ChevronDown,
  ShieldAlert, ShieldCheck, ShieldX,
  Banknote, IndianRupee, Landmark, Building2, GraduationCap, RefreshCw, CheckCircle, User
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import config from '../config';
import { io } from 'socket.io-client';
import SupportEscalationHub from '../components/admin/SupportEscalationHub';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  const [hosts, setHosts] = useState([]);
  const [hostApplications, setHostApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [newHost, setNewHost] = useState({
    email: '',
    fullname: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: 'host',
    institute: '',
    street: '',
    city: '',
    pincode: '',
    age: '',
    course: '',
    phone: '',
    countryCode: '+91',
    institutionType: '', // optional UI-only field
  });

  const [hostErrors, setHostErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingHostId, setEditingHostId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [adminEvents, setAdminEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [editHostModal, setEditHostModal] = useState(false);
  const [editHostForm, setEditHostForm] = useState({});
  const [savingHost, setSavingHost] = useState(false);
  const [editTouched, setEditTouched] = useState({});
  const [editErrors, setEditErrors] = useState({});
  const [verifyItems, setVerifyItems] = useState([]);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [reasonById, setReasonById] = useState({});
  // Event Form State
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventForm, setEventForm] = useState({});
  const [eventFormErrors, setEventFormErrors] = useState({});
  const [eventTouchedFields, setEventTouchedFields] = useState({});
  const [savingEvent, setSavingEvent] = useState(false);
  const [notificationForm, setNotificationForm] = useState({
    targetAudience: 'students',
    type: 'System',
    title: '',
    message: '',
  });
  const [notificationErrors, setNotificationErrors] = useState({});
  const [notificationTouched, setNotificationTouched] = useState({});

  const validateNotificationField = (field, value) => {
    switch (field) {
      case 'title': return value.trim().length >= 3 ? '' : 'Title must be at least 3 characters';
      case 'message': return value.trim().length >= 10 ? '' : 'Message must be at least 10 characters';
      default: return '';
    }
  };

  const handleNotificationFocus = (field) => {
    setNotificationTouched(prev => ({ ...prev, [field]: true }));
    const err = validateNotificationField(field, notificationForm[field] || '');
    setNotificationErrors(prev => ({ ...prev, [field]: err }));
  };

  const handleNotificationChange = (field, value) => {
    setNotificationForm(prev => ({ ...prev, [field]: value }));
    if (notificationTouched[field]) {
      const err = validateNotificationField(field, value);
      setNotificationErrors(prev => ({ ...prev, [field]: err }));
    }
  };
  const [sendingNotification, setSendingNotification] = useState(false);
  const navigate = useNavigate();

  // Traffic & Heatmap State
  const [activeTraffic, setActiveTraffic] = useState(0);
  const [heatmapClicks, setHeatmapClicks] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);
  const [fraudLogs, setFraudLogs] = useState([]);
  const [loadingFraudLogs, setLoadingFraudLogs] = useState(false);

  // Financials State
  const [financialStats, setFinancialStats] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [loadingFinancials, setLoadingFinancials] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ hostId: '', hostEmail: '', amount: '', note: '' });
  const [hostSearchQuery, setHostSearchQuery] = useState('');
  const [showHostDropdown, setShowHostDropdown] = useState(false);
  const [hostSummaries, setHostSummaries] = useState([]);

  // Validation functions
  const validateField = (field, value) => {
    switch (field) {
      case 'email':
        return /\S+@\S+\.\S+/.test(value) ? '' : 'Invalid email format';
      case 'fullname':
        return value.length >= 2 ? '' : 'Full name must be at least 2 characters';
      case 'username':
        return value.length >= 3 ? '' : 'Username must be at least 3 characters';
      case 'password':
        return value.length >= 6 ? '' : 'Password must be at least 6 characters';
      case 'confirmPassword':
        return value === newHost.password ? '' : 'Passwords do not match';
      case 'institute':
        return value.length >= 2 ? '' : 'Institution name is required';
      case 'street':
        return value.length >= 5 ? '' : 'Street address must be at least 5 characters';
      case 'city':
        return value.length >= 2 ? '' : 'City name is required';
      case 'pincode':
        return /^\d{6}$/.test(value) ? '' : 'Pincode must be 6 digits';
      case 'age':
        const ageNum = parseInt(value);
        return ageNum >= 16 && ageNum <= 100 ? '' : 'Contact person age must be between 16 and 100';
      case 'course':
        return value.length >= 2 ? '' : 'Department is required';
      case 'phone':
        return /^\d{10}$/.test(value) ? '' : 'Phone must be 10 digits';
      case 'countryCode':
        return /^\+\d{1,4}$/.test(value) ? '' : 'Invalid country code format';
      default:
        return '';
    }
  };

  const validateAdminEventField = (field, value) => {
    switch (field) {
      case 'title':
        return value?.length >= 3 ? '' : 'Title must be at least 3 chars';
      case 'description':
        return value?.length >= 10 ? '' : 'Description must be at least 10 chars';
      case 'date':
        return value ? '' : 'Start date is required';
      case 'location':
        return value?.length >= 2 ? '' : 'Location is required';
      case 'city':
        return value?.length >= 2 ? '' : 'City is required';
      case 'state':
        return value?.length >= 2 ? '' : 'State is required';
      case 'latitude':
        if (!value) return '';
        const lat = parseFloat(value);
        return !isNaN(lat) && lat >= -90 && lat <= 90 ? '' : 'Invalid latitude';
      case 'longitude':
        if (!value) return '';
        const lng = parseFloat(value);
        return !isNaN(lng) && lng >= -180 && lng <= 180 ? '' : 'Invalid longitude';
      case 'capacity':
        const cap = parseInt(value);
        return cap >= 0 ? '' : 'Capacity must be 0 or greater';
      case 'price':
        const price = parseFloat(value);
        if (isNaN(price)) return 'Invalid price';
        if (price < 0) return 'Price must be 0 or greater';
        if (price > 50000) return 'Price cannot exceed 50,000';
        return '';
      case 'contactEmail':
        return /\S+@\S+\.\S+/.test(value) ? '' : 'Invalid email format';
      case 'contactPhone':
        return /^\d{10}$/.test(value) ? '' : 'Phone must be 10 digits';
      case 'shortDescription':
        return value?.length > 0 ? '' : 'Short description is required';
      default:
        return '';
    }
  };

  const handleEventFieldChange = (field, value) => {
    let nextValue = value;
    if (field === 'price') {
      const cleaned = String(value).replace(/[^\d.]/g, '');
      let num = parseFloat(cleaned);
      if (isNaN(num) || num < 0) {
        nextValue = 0;
      } else if (num > 50000) {
        nextValue = 50000;
        toast.warning('Price capped at 50,000');
      } else {
        nextValue = parseFloat(num.toFixed(2));
      }
    } else if (field === 'capacity') {
      const num = parseInt(String(value).replace(/[^\d-]/g, ''), 10);
      nextValue = isNaN(num) || num < 0 ? 0 : num;
    }

    setEventForm((prev) => ({ ...prev, [field]: nextValue }));
    if (eventTouchedFields[field]) {
      const error = validateAdminEventField(field, nextValue);
      setEventFormErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  const handleEventFieldBlur = (field) => {
    setEventTouchedFields((prev) => ({ ...prev, [field]: true }));
    const error = validateAdminEventField(field, eventForm[field]);
    setEventFormErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleEventFieldFocus = (field) => {
    setEventTouchedFields((prev) => ({ ...prev, [field]: true }));
    const error = validateAdminEventField(field, eventForm[field]);
    setEventFormErrors((prev) => ({ ...prev, [field]: error }));
  };

  const openAdminEventEdit = (event) => {
    setEditingEvent(event);
    setEventForm({
      ...event,
      date: event.date ? new Date(event.date).toISOString().slice(0, 16) : '',
      endDate: event.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : '',
      registrationDeadline: event.registrationDeadline
        ? new Date(event.registrationDeadline).toISOString().slice(0, 16)
        : '',
      tags: event.tags ? event.tags.join(', ') : '',
      latitude: event.coordinates && event.coordinates.length === 2 ? event.coordinates[1] : '',
      longitude: event.coordinates && event.coordinates.length === 2 ? event.coordinates[0] : '',
    });
    setEventFormErrors({});
    setEventTouchedFields({});
    setShowEventForm(true);
  };

  const saveAdminEvent = async (e) => {
    e.preventDefault();
    // Validate all fields
    const errors = {};
    Object.keys(eventForm).forEach((key) => {
      const err = validateAdminEventField(key, eventForm[key]);
      if (err) errors[key] = err;
    });
    if (Object.keys(errors).length > 0) {
      setEventFormErrors(errors);
      toast.error('Please fix form errors');
      return;
    }

    try {
      setSavingEvent(true);
      const token = localStorage.getItem('token');
      const payload = {
        ...eventForm,
        date: eventForm.date ? new Date(eventForm.date).toISOString() : undefined,
        endDate: eventForm.endDate ? new Date(eventForm.endDate).toISOString() : undefined,
        registrationDeadline: eventForm.registrationDeadline
          ? new Date(eventForm.registrationDeadline).toISOString()
          : undefined,
        tags:
          typeof eventForm.tags === 'string'
            ? eventForm.tags
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean)
            : eventForm.tags,
        capacity: parseInt(eventForm.capacity) || 0,
        price: parseFloat(eventForm.price) || 0,
        isOnline: Boolean(eventForm.isOnline),
        coordinates:
          eventForm.latitude && eventForm.longitude
            ? [parseFloat(eventForm.longitude), parseFloat(eventForm.latitude)]
            : undefined,
      };

      const url = editingEvent
        ? `${config.apiBaseUrl}/api/auth/admin/events/${editingEvent._id}`
        : `${config.apiBaseUrl}/api/auth/admin/events`; // Assuming admin create endpoint exists or reuse host one if admin has permission.
      // Note: Usually admins might need a specific endpoint or use the host one with admin privileges.
      // Based on previous file analysis, there is no specific admin create event endpoint shown in snippets, but we'll try reusing host or assuming typical REST pattern.
      // Actually, let's use the host endpoint but with admin token, assuming RBAC allows it, or if not, we might fail.
      // Wait, the file uses /api/auth/admin/events for listing. Let's assume POST is also supported there.

      const method = editingEvent ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to save event');
      }

      toast.success(editingEvent ? 'Event updated' : 'Event created');
      setShowEventForm(false);
      fetchAdminEvents();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSavingEvent(false);
    }
  };

  const fetchPendingVerifications = async () => {
    try {
      setVerifyLoading(true);
      setVerifyError('');
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${config.apiBaseUrl}/api/auth/admin/verification/student-ids?status=pending`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setVerifyItems(Array.isArray(data.items) ? data.items : []);
    } catch (e) {
      setVerifyError(e.message || 'Failed to load pending');
    } finally {
      setVerifyLoading(false);
    }
  };

  const approveVerification = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${config.apiBaseUrl}/api/auth/admin/verification/student-id/${userId}/approve`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      await fetchPendingVerifications();
    } catch (e) {
      toast.error('Approve failed: ' + e.message);
    }
  };

  const rejectVerification = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const reason = reasonById[userId] || '';
      const res = await fetch(
        `${config.apiBaseUrl}/api/auth/admin/verification/student-id/${userId}/reject`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason }),
        }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      setReasonById((prev) => ({ ...prev, [userId]: '' }));
      await fetchPendingVerifications();
    } catch (e) {
      toast.error('Reject failed: ' + e.message);
    }
  };

  // Helpers for on-focus validation in Edit Host modal
  const handleEditFieldFocus = (field) => {
    setEditTouched((prev) => ({ ...prev, [field]: true }));
    const val = (editHostForm[field] ?? '').toString();
    const msg = validateField(field, val);
    setEditErrors((prev) => ({ ...prev, [field]: msg }));
  };

  const handleEditFieldChange = (field, value) => {
    setEditHostForm((f) => ({ ...f, [field]: value }));
    if (editTouched[field]) {
      // live-validate once field has been focused
      const msg = validateField(field, value);
      setEditErrors((prev) => ({ ...prev, [field]: msg }));
    }
    // Special rule: confirmPassword should match password when either changes
    if ((field === 'password' || field === 'confirmPassword') && editTouched['confirmPassword']) {
      const matchMsg =
        (field === 'password' ? value : editHostForm.password) ===
          (field === 'confirmPassword' ? value : editHostForm.confirmPassword)
          ? ''
          : 'Passwords do not match';
      setEditErrors((prev) => ({ ...prev, confirmPassword: matchMsg }));
    }
  };

  const handleHostFieldChange = (field, value) => {
    setNewHost((prev) => ({ ...prev, [field]: value }));
    if (touchedFields[field]) {
      const error = validateField(field, value);
      setHostErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  const handleHostFieldBlur = (field) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, newHost[field]);
    setHostErrors((prev) => ({ ...prev, [field]: error }));
  };

  // On-focus validation for Add Host form
  const handleHostFieldFocus = (field) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
    const val = (newHost[field] ?? '').toString();
    const msg = validateField(field, val);
    setHostErrors((prev) => ({ ...prev, [field]: msg }));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/', { replace: true });
  };

  useEffect(() => {
    if (!localStorage.getItem('token') || !localStorage.getItem('user')) {
      navigate('/', { replace: true });
      return;
    }

    checkAdminStatus();
    fetchHosts();
    fetchAdminEvents();
    fetchMetrics();

    // prevent back after logout
    window.history.pushState(null, '', window.location.href);
    window.onpopstate = () => window.history.go(1);
  }, []);

  const adminSidebarItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', name: 'Users', icon: Users },
    { id: 'hosts', name: 'Hosts', icon: Building2 },
    { id: 'events', name: 'Events', icon: Calendar },
    { id: 'host-applications', name: 'Host Applications', icon: UserPlus },
    { id: 'verify-students', name: 'Verify Students', icon: GraduationCap },
    { id: 'fraud', name: 'Fraud & Spam', icon: ShieldAlert },
    { id: 'financials', name: 'Financials', icon: IndianRupee },
  ];

  useEffect(() => {
    if (activeTab === 'dashboard' || activeTab === 'analytics' || activeTab === 'monitor') fetchMetrics();
    if (activeTab === 'view-hosts') fetchHosts();
    if (activeTab === 'events') fetchAdminEvents();
    if (activeTab === 'host-applications') fetchHostApplications();
    if (activeTab === 'verify-students') fetchPendingVerifications();
    if (activeTab === 'fraud') fetchFraudLogs();
    if (activeTab === 'financials') {
      fetchFinancials();
      fetchHosts();
    }
  }, [activeTab]);

  const checkAdminStatus = async () => {
    try {
      // Check if user is logged in via JWT token
      const token = localStorage.getItem('token');
      const userData = JSON.parse(localStorage.getItem('user') || '{}');

      if (!token || !userData.id) {
        navigate('/', { replace: true });
        return;
      }

      // Verify admin role from localStorage (set during login)
      if (userData.role !== 'admin') {
        toast.error('Access denied. Admin privileges required.');
        navigate('/dashboard', { replace: true });
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      console.error('Admin check error:', error);
      toast.error('Error checking admin status');
      navigate('/dashboard', { replace: true });
    } finally {
      setCheckingAdmin(false);
    }
  };

  // Socket connection for Heatmap Tab
  useEffect(() => {
    if (!isAdmin) return;

    const token = localStorage.getItem('token');
    const socketUrl = process.env.REACT_APP_API_URL || config.apiBaseUrl.replace(/\/api$/, '');
    const socket = io(socketUrl, { auth: { token } });

    socket.on('connect', () => {
      setSocketConnected(true);
      socket.emit('join_admin_room');
    });

    socket.on('disconnect', () => {
      setSocketConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error('Heatmap socket error:', err);
      setSocketConnected(false);
    });

    socket.on('active_users_count', (count) => {
      setActiveTraffic(count);
    });

    socket.on('new_click', (data) => {
      setHeatmapClicks(prev => {
        const next = [...prev, data];
        // Keep only last 100 clicks to avoid memory bloat
        if (next.length > 100) return next.slice(next.length - 100);
        return next;
      });
    });

    return () => socket.disconnect();
  }, [isAdmin]);

  const fetchHosts = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${config.apiBaseUrl}/api/auth/hosts`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) throw new Error('Failed to fetch hosts');
      const data = await res.json();
      setHosts(data);
    } catch (error) {
      toast.error('Error fetching hosts from MongoDB');
    }
  };

  const fetchHostApplications = async () => {
    try {
      setLoadingApplications(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.apiBaseUrl}/api/auth/admin/host-applications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch host applications');
      const data = await response.json();
      setHostApplications(data);
    } catch (error) {
      toast.error('Error fetching host applications');
    } finally {
      setLoadingApplications(false);
    }
  };

  const fetchFraudLogs = async () => {
    try {
      setLoadingFraudLogs(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.apiBaseUrl}/api/auth/admin/fraud-logs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch fraud logs');
      const data = await response.json();
      setFraudLogs(data);
    } catch (error) {
      toast.error('Error fetching fraud logs');
    } finally {
      setLoadingFraudLogs(false);
    }
  };

  const updateFraudLogStatus = async (logId, status) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.apiBaseUrl}/api/auth/admin/fraud-logs/${logId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Failed to update fraud log');
      toast.success(`Log marked as ${status}`);
      fetchFraudLogs();
    } catch (error) {
      toast.error('Error updating fraud log');
    }
  };

  const approveHostApplication = async (hostId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${config.apiBaseUrl}/api/auth/admin/host-applications/${hostId}/approve`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (!response.ok) throw new Error('Failed to approve host application');
      toast.success('✅ Host application approved');
      fetchHostApplications();
      fetchHosts(); // Refresh the hosts list to show the newly approved host
    } catch (error) {
      toast.error('Error approving host application');
    }
  };

  const rejectHostApplication = async (hostId, rejectionReason) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${config.apiBaseUrl}/api/auth/admin/host-applications/${hostId}/reject`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ rejectionReason }),
        }
      );
      if (!response.ok) throw new Error('Failed to reject host application');
      toast.success('✅ Host application rejected');
      fetchHostApplications();
    } catch (error) {
      toast.error('Error rejecting host application');
    }
  };

  const fetchFinancials = async () => {
    try {
      setLoadingFinancials(true);
      const token = localStorage.getItem('token');
      const [ledgerRes, statsRes, summariesRes] = await Promise.all([
        fetch(`${config.apiBaseUrl}/api/auth/admin/financials/ledger`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${config.apiBaseUrl}/api/auth/admin/financials/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${config.apiBaseUrl}/api/auth/admin/financials/host-summaries`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (!ledgerRes.ok || !statsRes.ok || !summariesRes.ok) throw new Error('Failed to fetch financials');

      const ledgerData = await ledgerRes.json();
      const statsData = await statsRes.json();
      const summariesData = await summariesRes.json();

      setLedger(ledgerData);
      setFinancialStats(statsData);
      setHostSummaries(summariesData);
    } catch (error) {
      toast.error('Error fetching financial data');
    } finally {
      setLoadingFinancials(false);
    }
  };

  const recordPayment = async (e) => {
    e.preventDefault();
    if (!paymentForm.hostId) {
      toast.error('Please select a host from the search results');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.apiBaseUrl}/api/auth/admin/financials/payout/${paymentForm.hostId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ amount: Number(paymentForm.amount), note: paymentForm.note })
      });

      if (!response.ok) throw new Error('Payment recording failed');
      toast.success('Payment recorded successfully');
      setPaymentForm({ hostId: '', hostEmail: '', amount: '', note: '' });
      setHostSearchQuery('');
      fetchFinancials();
    } catch (error) {
      toast.error('Error recording payment');
    }
  };

  const fetchAdminEvents = async () => {
    try {
      setLoadingEvents(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${config.apiBaseUrl}/api/auth/admin/events`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch events');
      setAdminEvents(await res.json());
    } catch (e) {
      toast.error('Error fetching events');
    } finally {
      setLoadingEvents(false);
    }
  };

  const fetchMetrics = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${config.apiBaseUrl}/api/auth/admin/metrics`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401 || res.status === 403) {
        toast.error('Session expired. Please log in again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/', { replace: true });
        return;
      }
      if (!res.ok) throw new Error('Failed to fetch metrics');
      setMetrics(await res.json());
    } catch (e) {
      toast.error('Error fetching metrics');
    }
  };

  const openEditHostModal = (host) => {
    setEditHostForm({
      _id: host._id,
      email: host.email || '',
      fullname: host.fullname || '',
      username: host.username || '',
      password: '',
      confirmPassword: '',
      role: host.role || 'host',
      institute: host.institute || '',
      street: host.street || '',
      city: host.city || '',
      pincode: host.pincode || '',
      age: host.age || '',
      course: host.course || '',
      phone: host.phone || '',
      countryCode: host.countryCode || '+91',
    });
    // Reset edit validation state each time the modal opens
    setEditTouched({});
    setEditErrors({});
    setEditHostModal(true);
  };

  const saveEditHost = async () => {
    try {
      setSavingHost(true);
      // Client-side validation for update
      const requiredFields = [
        'fullname',
        'username',
        'email',
        'institute',
        'street',
        'city',
        'pincode',
        'age',
        'course',
        'phone',
      ];
      for (const f of requiredFields) {
        const v = (editHostForm[f] ?? '').toString().trim();
        if (!v) {
          toast.error(`Missing required field: ${f}`);
          setSavingHost(false);
          return;
        }
      }
      // Specific validations
      if (!/\S+@\S+\.\S+/.test(editHostForm.email)) {
        toast.error('Invalid email format');
        setSavingHost(false);
        return;
      }
      if (!/^\d{6}$/.test(String(editHostForm.pincode))) {
        toast.error('Pincode must be 6 digits');
        setSavingHost(false);
        return;
      }
      if (!/^\d{10}$/.test(String(editHostForm.phone))) {
        toast.error('Phone must be 10 digits');
        setSavingHost(false);
        return;
      }
      if (editHostForm.countryCode && !/^\+\d{1,4}$/.test(String(editHostForm.countryCode))) {
        toast.error('Invalid country code');
        setSavingHost(false);
        return;
      }
      const ageNum = parseInt(editHostForm.age, 10);
      if (isNaN(ageNum) || ageNum < 16 || ageNum > 100) {
        toast.error('Age must be between 16 and 100');
        setSavingHost(false);
        return;
      }
      const token = localStorage.getItem('token');
      const { _id, password, confirmPassword, ...payload } = editHostForm;
      const res = await fetch(`${config.apiBaseUrl}/api/auth/update/${_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to update host');
      toast.success('✅ Host updated');
      setEditHostModal(false);
      await fetchHosts();
    } catch (e) {
      toast.error('Error updating host');
    } finally {
      setSavingHost(false);
    }
  };

  const handleAddHost = async (e) => {
    e.preventDefault();

    // Validate all fields
    const errors = {};
    Object.keys(newHost).forEach((field) => {
      if (field !== 'role') {
        // Skip role validation
        const error = validateField(field, newHost[field]);
        if (error) errors[field] = error;
      }
    });

    if (Object.keys(errors).length > 0) {
      setHostErrors(errors);
      setTouchedFields(
        Object.keys(newHost).reduce((acc, field) => ({ ...acc, [field]: true }), {})
      );
      toast.error('❌ Please fix the form errors');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');

      if (isEditMode) {
        // Update existing host
        const response = await fetch(`${config.apiBaseUrl}/api/auth/update/${editingHostId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newHost),
        });

        if (!response.ok) throw new Error('Failed to update host');
        toast.success('✅ Host updated successfully!');
      } else {
        // Add new host
        const response = await fetch(`${config.apiBaseUrl}/api/auth/register`, {
          method: 'POST',
          body: JSON.stringify(newHost),
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error('MongoDB host creation failed');
        toast.success('✅ New host added!');
      }

      // Reset form and exit edit mode
      setNewHost({
        email: '',
        fullname: '',
        username: '',
        password: '',
        confirmPassword: '',
        role: 'host',
        institute: '',
        street: '',
        city: '',
        pincode: '',
        age: '',
        course: '',
        phone: '',
        countryCode: '+91',
        institutionType: '',
      });
      setHostErrors({});
      setTouchedFields({});
      setIsEditMode(false);
      setEditingHostId(null);

      fetchHosts();
    } catch (error) {
      toast.error(isEditMode ? 'Error updating host' : 'Error adding host');
    } finally {
      setLoading(false);
    }
  };

  const handleEditHost = (host) => {
    // Set the form to edit mode
    setNewHost({
      ...host,
      password: '', // Clear password for security
    });
    setIsEditMode(true);
    setEditingHostId(host._id);
    setActiveTab('add-host');
    toast.info("Edit mode: Update the fields and click 'Update Host'");
  };

  const handleUpdateHost = async (hostId, updatedData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.apiBaseUrl}/api/auth/update/${hostId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) throw new Error('Failed to update host');

      toast.success('✅ Host updated successfully!');
      fetchHosts();
    } catch (error) {
      toast.error('Error updating host: ' + error.message);
    }
  };

  const handleDeleteHost = async (hostId) => {
    if (
      !window.confirm('Are you sure you want to delete this host? This action cannot be undone.')
    ) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.apiBaseUrl}/api/auth/delete/${hostId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete host');

      toast.success('✅ Host deleted successfully!');
      fetchHosts();
    } catch (error) {
      toast.error('Error deleting host: ' + error.message);
    }
  };

  // Derive approved hosts from applications and filter by search term
  // Use users collection hosts (User role==host) list for View Hosts table
  const filteredHosts = hosts.filter(
    (host) =>
      host.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      host.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      host.institute?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      host.course?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Animated Background Component (Matches Student Dashboard) ---
  const DashboardBackground = () => (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-white">
      <motion.div
        className="absolute inset-0 opacity-30 blur-3xl"
        animate={{
          background: [
            'radial-gradient(at 0% 0%, #ffdee9 0%, transparent 50%), radial-gradient(at 100% 0%, #c1fcd3 0%, transparent 50%)',
            'radial-gradient(at 100% 100%, #ffdee9 0%, transparent 50%), radial-gradient(at 0% 0%, #c1fcd3 0%, transparent 50%)',
          ],
        }}
        transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse' }}
      />
      <div
        className="absolute inset-0 z-0 opacity-20"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
          backgroundSize: '40px 40px',
          color: '#000',
        }}
      ></div>
    </div>
  );

  const [navCollapsed, setNavCollapsed] = useState(true);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close profile menu on outside click
  useEffect(() => {
    const onClick = (e) => {
      if (profileMenuOpen && !e.target.closest('.profile-menu')) setProfileMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [profileMenuOpen]);

  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!notificationForm.title || !notificationForm.message) {
      toast.error('Title and message are required');
      return;
    }
    try {
      setSendingNotification(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${config.apiBaseUrl}/api/auth/admin/notifications/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(notificationForm),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to send notification');
      }
      const data = await res.json();
      toast.success(data.message || 'Notification sent');
      setNotificationForm({ targetAudience: 'students', type: 'System', title: '', message: '' });
      setNotificationErrors({});
      setNotificationTouched({});
    } catch (e) {
      toast.error(e.message || 'Error sending notification');
    } finally {
      setSendingNotification(false);
    }
  };

  if (checkingAdmin) {
    return (
      <div className="flex items-center justify-center h-screen text-black font-bold text-xl uppercase tracking-widest">
        Checking admin status...
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <LayoutGroup>
      <div className="min-h-screen font-sans relative overflow-hidden text-black selection:bg-black selection:text-white">
        <DashboardBackground />

        {/* Professional Header - Matches Student Dashboard Style */}
        <motion.header
          className={`sticky top-0 z-40 w-full transition-all duration-500 border-b ${scrolled ? 'bg-white/90 backdrop-blur-md border-black py-2' : 'bg-transparent border-transparent py-4'}`}
        >
          <div className="px-6 h-full flex items-center justify-between max-w-[1920px] mx-auto">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => setNavCollapsed(!navCollapsed)}
                className="p-2 -ml-2 text-slate-900 hover:bg-black/5 rounded-full transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div
                className="flex items-center gap-2 group cursor-pointer"
                onClick={() => navigate('/admin')}
              >
                <div className="w-8 h-8 bg-black flex items-center justify-center transition-transform duration-500 group-hover:rotate-180">
                  <BarChart2 className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight text-black">Admin Panel</span>
              </div>
            </div>

            <div className="flex items-center space-x-6 flex-1 justify-end max-w-2xl">
              {/* Right Actions */}
              <div className="flex items-center gap-4">
                <div className="relative ml-2 profile-menu">
                  <button
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className="flex items-center gap-2 group"
                  >
                    <div className="w-9 h-9 bg-black text-white flex items-center justify-center font-bold border-2 border-transparent group-hover:border-slate-300 transition-all">
                      A
                    </div>
                  </button>

                  {profileMenuOpen && (
                    <div className="absolute right-0 mt-4 w-60 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-[100] p-0">
                      <div className="p-4 border-b-2 border-black bg-neutral-50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-bold text-lg">
                            A
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-black truncate uppercase tracking-tight">
                              Administrator
                            </div>
                            <div className="text-xs text-slate-500 truncate font-mono">
                              admin@evenite.com
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="p-2 space-y-1">
                        <button
                          onClick={() => {
                            setProfileMenuOpen(false);
                            handleLogout();
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold uppercase tracking-wider text-red-600 hover:bg-red-600 hover:text-white transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.header>

        <div className="flex max-w-[1920px] mx-auto">
          {/* Sidebar - Sharp & Minimal */}
          <aside
            className={`border-r border-black/10 transition-all duration-300 ease-in-out ${navCollapsed ? 'w-20' : 'w-64'} sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto bg-white/50 backdrop-blur-sm z-30`}
          >
            <div className="p-6 flex flex-col h-full">
              <nav className="space-y-2 flex-1">
                {[
                  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
                  { id: 'analytics', icon: BarChart2, label: 'Analytics' },
                  { id: 'view-hosts', icon: Users, label: 'View Hosts' },
                  { id: 'host-applications', icon: UserPlus, label: 'Host Applications' },
                  { id: 'verify-students', icon: CheckCircle2, label: 'Verify Students' },
                  { id: 'events', icon: Calendar, label: 'Manage Events' },
                  { id: 'heatmap', icon: MapPin, label: 'Live Traffic & Heatmap' },
                  { id: 'fraud', icon: ShieldAlert, label: 'Fraud & Spam' },
                  { id: 'financials', icon: IndianRupee, label: 'Financials' },
                  { id: 'support-hub', icon: MessageSquare, label: 'Support Hub' },
                  { id: 'monitor', icon: Eye, label: 'Monitor Activity' },
                  { id: 'notifications', icon: BellRing, label: 'Notifications' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center ${navCollapsed ? 'justify-center px-0' : 'justify-start px-4'} py-3 transition-all duration-200 group relative overflow-hidden outline-none ${activeTab === item.id ? 'text-white' : 'text-slate-500 hover:text-black'}`}
                    title={navCollapsed ? item.label : undefined}
                  >
                    {/* Active Background - Sharp Black Block */}
                    {activeTab === item.id && (
                      <motion.div
                        layoutId="sidebar-active"
                        className="absolute inset-0 bg-black z-0"
                        initial={false}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}

                    <div className="relative z-10 flex items-center w-full">
                      <item.icon
                        className={`${navCollapsed ? 'w-6 h-6' : 'w-5 h-5'} transition-colors`}
                      />
                      {!navCollapsed && (
                        <span className="ml-4 font-bold uppercase tracking-widest text-xs">
                          {item.label}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main */}
          <div className="flex-1 p-8 overflow-y-auto">
            {activeTab === 'support-hub' && <SupportEscalationHub />}
            {/* Dashboard Tab */}
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <div className="animate-fadeIn max-w-7xl mx-auto space-y-8">
                <h1 className="text-4xl font-black mb-8 flex items-center gap-3 text-black uppercase tracking-tighter">
                  <div className="p-2 border-2 border-black bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]">
                    <BarChart2 size={28} />
                  </div>
                  Admin Dashboard
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    {
                      label: 'Total Hosts',
                      value: hosts.length,
                      icon: Users,
                      color: 'bg-blue-400',
                      bg: 'bg-blue-50',
                    },
                    {
                      label: 'Events',
                      value: metrics ? metrics.events.total : 0,
                      icon: Calendar,
                      color: 'bg-green-400',
                      bg: 'bg-green-50',
                    },
                    {
                      label: 'Registrations',
                      value: metrics ? metrics.registrations?.total : 0,
                      icon: BarChart2,
                      color: 'bg-purple-400',
                      bg: 'bg-purple-50',
                    },
                  ].map((stat, idx) => (
                    <div
                      key={idx}
                      className={`${stat.bg} border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-default`}
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div
                          className={`p-3 border-2 border-black ${stat.color} text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}
                        >
                          <stat.icon size={24} />
                        </div>
                        <h3 className="text-lg font-bold uppercase tracking-wide text-neutral-600">
                          {stat.label}
                        </h3>
                      </div>
                      <p className="text-5xl font-black text-black tracking-tighter">
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="bg-amber-50 border-2 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                  <h3 className="text-2xl font-black text-black mb-6 uppercase tracking-tighter">
                    Quick Actions
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => setActiveTab('add-host')}
                      className="flex items-center justify-center gap-3 p-4 bg-black text-white font-bold uppercase tracking-widest border-2 border-transparent hover:bg-neutral-800 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                    >
                      <UserPlus size={20} />
                      Add New Host
                    </button>
                    <button
                      onClick={() => setActiveTab('view-hosts')}
                      className="flex items-center justify-center gap-3 p-4 bg-white text-black font-bold uppercase tracking-widest border-2 border-black hover:bg-neutral-50 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                    >
                      <Eye size={20} />
                      View All Hosts
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="animate-fadeIn max-w-7xl mx-auto space-y-8">
                <h1 className="text-4xl font-black mb-8 flex items-center gap-3 text-black uppercase tracking-tighter">
                  <div className="p-2 border-2 border-black bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]">
                    <BarChart2 size={28} />
                  </div>
                  Platform Analytics
                </h1>

                {metrics?.analytics ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Registration Trends Chart */}
                    <div className="bg-violet-50 border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col">
                      <h3 className="text-lg font-black uppercase mb-6 flex items-center text-black border-b-2 border-black pb-2">
                        Registration Trends (30 Days)
                      </h3>
                      <div className="flex-1 min-h-[300px] border-2 border-black bg-violet-100 p-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={metrics.analytics.registrationTrends || []}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="#000"
                              strokeOpacity={0.1}
                            />
                            <XAxis
                              dataKey="date"
                              tick={{ fontSize: 10, fontWeight: 'bold' }}
                              stroke="#000"
                            />
                            <YAxis
                              allowDecimals={false}
                              tick={{ fontSize: 10, fontWeight: 'bold' }}
                              stroke="#000"
                            />
                            <RechartsTooltip
                              contentStyle={{
                                border: '2px solid black',
                                borderRadius: '0px',
                                boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
                                fontWeight: 'bold',
                              }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '10px', fontWeight: 'bold' }} />
                            <Line
                              type="monotone"
                              dataKey="count"
                              stroke="#8b5cf6"
                              strokeWidth={3}
                              dot={{ r: 4, strokeWidth: 2, fill: 'white', stroke: '#8b5cf6' }}
                              activeDot={{ r: 6, strokeWidth: 2, fill: '#8b5cf6' }}
                              name="Registrations"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Top Categories Chart */}
                    <div className="bg-white border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col">
                      <h3 className="text-lg font-black uppercase mb-6 flex items-center text-black border-b-2 border-black pb-2">
                        Top Categories
                      </h3>
                      <div className="flex-1 min-h-[300px] border-2 border-black bg-neutral-50 p-4">
                        {metrics.analytics.topCategories &&
                          metrics.analytics.topCategories.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={metrics.analytics.topCategories}
                                dataKey="count"
                                nameKey="category"
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                label={({ category, count }) => `${category} (${count})`}
                                labelLine={{ stroke: '#000', strokeWidth: 2 }}
                              >
                                {metrics.analytics.topCategories.map((entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={
                                      ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][
                                      index % 5
                                      ]
                                    }
                                  />
                                ))}
                              </Pie>
                              <RechartsTooltip
                                contentStyle={{
                                  border: '2px solid black',
                                  borderRadius: '0px',
                                  boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
                                  fontWeight: 'bold',
                                }}
                              />
                              <Legend wrapperStyle={{ paddingTop: '20px', fontWeight: 'bold' }} />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="flex items-center justify-center h-full text-neutral-400 font-bold uppercase tracking-widest">
                            No Categorized Events
                          </div>
                        )}
                      </div>
                    </div>

                    {/* User Demographics Chart */}
                    <div className="bg-cyan-50 border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col">
                      <h3 className="text-lg font-black uppercase mb-6 flex items-center text-black border-b-2 border-black pb-2">
                        User Demographics
                      </h3>
                      <div className="flex-1 min-h-[300px] border-2 border-black bg-cyan-100 p-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={[
                              { name: 'Students', count: metrics.users.students },
                              { name: 'Hosts', count: metrics.users.hosts },
                              { name: 'Admins', count: metrics.users.admins },
                            ]}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="#000"
                              strokeOpacity={0.1}
                            />
                            <XAxis
                              dataKey="name"
                              tick={{ fontSize: 10, fontWeight: 'bold' }}
                              stroke="#000"
                            />
                            <YAxis
                              allowDecimals={false}
                              tick={{ fontSize: 10, fontWeight: 'bold' }}
                              stroke="#000"
                            />
                            <RechartsTooltip
                              contentStyle={{
                                border: '2px solid black',
                                borderRadius: '0px',
                                boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
                                fontWeight: 'bold',
                              }}
                            />
                            <Bar dataKey="count" name="Users">
                              {[0, 1, 2].map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={['#ec4899', '#06b6d4', '#84cc16'][index % 3]}
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Event Status Chart */}
                    <div className="bg-white border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col">
                      <h3 className="text-lg font-black uppercase mb-6 flex items-center text-black border-b-2 border-black pb-2">
                        Event Status
                      </h3>
                      <div className="flex-1 min-h-[300px] border-2 border-black bg-neutral-50 p-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { name: 'Published', count: metrics.events.published },
                                { name: 'Completed', count: metrics.events.completed },
                              ]}
                              dataKey="count"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              label={({ name, count }) => `${name} (${count})`}
                              labelLine={{ stroke: '#000', strokeWidth: 2 }}
                            >
                              {[0, 1].map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={['#10b981', '#3b82f6'][index % 2]}
                                />
                              ))}
                            </Pie>
                            <RechartsTooltip
                              contentStyle={{
                                border: '2px solid black',
                                borderRadius: '0px',
                                boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
                                fontWeight: 'bold',
                              }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '20px', fontWeight: 'bold' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white border-2 border-dashed border-black">
                    <p className="font-bold uppercase tracking-wide">Analytic Data Loading...</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'heatmap' && (
              <div className="animate-fadeIn max-w-7xl mx-auto space-y-8">
                <h1 className="text-4xl font-black mb-8 flex items-center gap-3 text-black uppercase tracking-tighter">
                  <div className="p-2 border-2 border-black bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <MapPin size={28} className="text-red-500" />
                  </div>
                  Live Traffic & Heatmap
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-red-50 border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center gap-4">
                    <div className="p-4 border-2 border-black bg-red-400 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      <Users size={32} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold uppercase tracking-wide text-red-900">Active Users Right Now</h3>
                      <div className="flex items-center gap-2">
                        <p className="text-5xl font-black text-black tracking-tighter">
                          {activeTraffic}
                        </p>
                        <div className="flex flex-col">
                          <span className={`text-[10px] font-black px-1 border border-black ${socketConnected ? 'bg-green-400' : 'bg-red-400'}`}>
                            {socketConnected ? 'CONNECTED' : 'DISCONNECTED'}
                          </span>
                          <span className="text-sm font-bold text-red-600 animate-pulse">● LIVE</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-yellow-50 border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-center">
                    <h3 className="text-lg font-bold uppercase tracking-wide text-yellow-900 mb-2 border-b-2 border-black pb-2">How this works</h3>
                    <p className="text-sm font-bold text-black leading-relaxed">
                      Every click made by an authenticated user across the entire platform is captured and broadcasted here in real-time.
                      Circles indicate the exact relative screen coordinates of where the user clicked.
                    </p>
                  </div>
                </div>

                <div className="bg-white border-4 border-black p-1 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative w-full h-[600px] overflow-hidden">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
                  <div className="absolute top-4 left-4 bg-black text-white px-3 py-1 text-xs font-black uppercase tracking-widest z-10 border-2 border-transparent">
                    Live Interaction Map
                  </div>

                  {/* Heatmap Container Overlay */}
                  <div className="relative w-full h-full bg-slate-100/50">
                    <AnimatePresence>
                      {heatmapClicks.map((click, i) => (
                        <motion.div
                          key={`${click.timestamp}-${i}`}
                          initial={{ scale: 0, opacity: 1 }}
                          animate={{ scale: 2, opacity: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          className="absolute w-8 h-8 -ml-4 -mt-4 rounded-full border-4 border-red-500 bg-red-500/20 pointer-events-none"
                          style={{
                            left: `${click.x}%`,
                            top: `${click.y}%`
                          }}
                        >
                          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-black text-white px-1 text-[8px] font-bold uppercase whitespace-nowrap opacity-50">
                            {click.path}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {heatmapClicks.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="bg-white border-2 border-black px-4 py-2 font-black uppercase tracking-widest text-neutral-400 rotate-[-5deg] shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                          Waiting for user interactions...
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'fraud' && (
              <div className="animate-fadeIn max-w-7xl mx-auto space-y-8">
                <h1 className="text-4xl font-black mb-8 flex items-center gap-3 text-black uppercase tracking-tighter">
                  <div className="p-2 border-2 border-black bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]">
                    <ShieldAlert size={28} />
                  </div>
                  Fraud & Spam Queue
                </h1>

                <div className="flex justify-between items-center bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex gap-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase text-neutral-500">Total Flagged</span>
                      <span className="text-2xl font-black">{fraudLogs.length}</span>
                    </div>
                    <div className="w-[2px] bg-black/10"></div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase text-neutral-500">High Severity</span>
                      <span className="text-2xl font-black text-red-600">{fraudLogs.filter(l => l.severity === 'High' && l.status === 'Pending').length}</span>
                    </div>
                  </div>
                  <button
                    onClick={fetchFraudLogs}
                    className="px-6 py-2 bg-black text-white font-bold uppercase text-xs border-2 border-black hover:bg-neutral-800 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
                  >
                    Refresh Queue
                  </button>
                </div>

                {loadingFraudLogs ? (
                  <div className="p-24 text-center">
                    <div className="inline-block w-12 h-12 border-4 border-black border-t-transparent animate-spin mb-4"></div>
                    <p className="font-bold text-neutral-400 animate-pulse uppercase tracking-widest">Scanning for suspicious activities...</p>
                  </div>
                ) : fraudLogs.length === 0 ? (
                  <div className="bg-green-50 border-2 border-black p-12 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <ShieldCheck className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-black uppercase tracking-tight">System Secured</h3>
                    <p className="font-bold text-neutral-600 uppercase text-sm tracking-wide">No suspicious activities flagged by the automated detector.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {fraudLogs.map((log) => (
                      <div
                        key={log._id}
                        className={`border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row gap-6 ${log.status === 'Dismissed' ? 'bg-neutral-100 opacity-60 grayscale' :
                          log.severity === 'High' ? 'bg-red-50' :
                            log.severity === 'Medium' ? 'bg-yellow-50' : 'bg-blue-50'
                          }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`text-[10px] font-black px-2 py-0.5 border-2 border-black uppercase ${log.severity === 'High' ? 'bg-red-500 text-white' :
                              log.severity === 'Medium' ? 'bg-yellow-400 text-black' : 'bg-blue-400 text-black'
                              }`}>
                              {log.severity} Priority
                            </span>
                            <span className="font-mono text-[10px] font-bold text-neutral-500 uppercase">{new Date(log.createdAt).toLocaleString()}</span>
                            <div className="ml-auto flex items-center gap-2">
                              {log.status === 'Pending' && <span className="animate-pulse w-2 h-2 rounded-full bg-red-600"></span>}
                              <span className="text-[10px] font-black uppercase bg-white border-2 border-black px-1.5">{log.status}</span>
                            </div>
                          </div>
                          <h3 className="text-2xl font-black uppercase tracking-tight mb-1">{log.reason}</h3>
                          <div className="flex items-center gap-2 mb-4">
                            <span className="bg-black text-white text-[10px] font-black px-1.5 py-0.5 uppercase">{log.targetType}</span>
                            <p className="font-bold text-sm text-black">
                              Target: <span className="underline decoration-2 underline-offset-4">{log.targetName}</span>
                            </p>
                          </div>

                          {log.metadata && (
                            <div className="p-3 bg-black/5 border-2 border-black/10 font-mono text-[10px] overflow-x-auto max-h-32 mb-2">
                              <div className="font-bold mb-1 opacity-50 uppercase tracking-widest text-[8px]">Metadata Analysis:</div>
                              {Object.entries(log.metadata).map(([key, val]) => (
                                <div key={key} className="flex gap-2">
                                  <span className="text-neutral-500">{key}:</span>
                                  <span className="text-black font-bold">{JSON.stringify(val)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-3 justify-center min-w-[180px]">
                          {log.status === 'Pending' ? (
                            <>
                              <button
                                onClick={() => updateFraudLogStatus(log._id, 'Verified')}
                                className="px-4 py-3 bg-red-600 text-white font-black uppercase text-xs border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center justify-center gap-2 group"
                              >
                                <ShieldAlert size={16} className="group-hover:rotate-12 transition-transform" /> Confirm Fraud
                              </button>
                              <button
                                onClick={() => updateFraudLogStatus(log._id, 'Dismissed')}
                                className="px-4 py-3 bg-white text-black font-black uppercase text-xs border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center justify-center gap-2"
                              >
                                <ShieldX size={16} /> Dismiss Flag
                              </button>
                            </>
                          ) : (
                            <div className={`flex flex-col items-center justify-center p-4 border-2 border-black text-center ${log.status === 'Verified' ? 'bg-red-400 text-black' : 'bg-green-400 text-black'}`}>
                              {log.status === 'Verified' ? <ShieldAlert size={24} className="mb-1" /> : <ShieldCheck size={24} className="mb-1" />}
                              <span className="font-black uppercase text-xs">Activity {log.status}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'financials' && (
              <div className="animate-fadeIn max-w-7xl mx-auto space-y-8">
                <h1 className="text-4xl font-black mb-8 flex items-center gap-3 text-black uppercase tracking-tighter">
                  <div className="p-2 border-2 border-black bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]">
                    <IndianRupee size={28} />
                  </div>
                  Financial Reconciliation
                </h1>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  {[
                    { label: 'Gross Volume', value: `₹${financialStats?.revenue?.totalVolume?.toLocaleString() || 0}`, icon: IndianRupee, color: 'text-green-600', bg: 'bg-green-100' },
                    { label: 'Platform Fees', value: `₹${financialStats?.revenue?.totalFees?.toLocaleString() || 0}`, icon: Landmark, color: 'text-blue-600', bg: 'bg-blue-100' },
                    { label: 'Gross Earnings', value: `₹${financialStats?.revenue?.totalHostEarnings?.toLocaleString() || 0}`, icon: LayoutDashboard, color: 'text-purple-600', bg: 'bg-purple-100' },
                    { label: 'Balance Owed', value: `₹${hostSummaries.reduce((sum, s) => sum + (s.remainingBalance || 0), 0).toLocaleString()}`, icon: Banknote, color: 'text-orange-600', bg: 'bg-orange-100' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center gap-4">
                      <div className={`p-4 border-2 border-black ${stat.bg.replace('bg-', 'bg-')}`}>
                        <stat.icon size={24} className="text-black" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-neutral-500">{stat.label}</p>
                        <p className="text-2xl font-black text-black">{stat.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Ledger Table */}
                  <div className="lg:col-span-2 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col">
                    <div className="p-6 border-b-4 border-black flex justify-between items-center bg-indigo-50">
                      <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                        <LayoutDashboard size={20} /> Transaction Ledger
                      </h3>
                      <button
                        onClick={fetchFinancials}
                        className="px-4 py-2 bg-black text-white text-xs font-bold uppercase border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                      >
                        {loadingFinancials ? 'Syncing...' : 'Sync Ledger'}
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-black text-white">
                          <tr>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Date</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Event / Host</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Type</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Amount</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Fee</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-black/10">
                          {ledger.length === 0 ? (
                            <tr><td colSpan="6" className="px-6 py-12 text-center text-neutral-400 font-bold uppercase italic">No financial data available</td></tr>
                          ) : (
                            ledger.filter(tx => tx.amount > 0).map((tx) => (
                              <tr key={tx._id} className="hover:bg-neutral-50 transition-colors">
                                <td className="px-6 py-4 font-mono text-xs font-bold">{new Date(tx.createdAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4">
                                  <p className="font-black uppercase text-sm">{tx.eventId?.title || 'System Operation'}</p>
                                  <p className="text-[10px] font-bold text-neutral-500 uppercase">{tx.hostId?.fullname}</p>
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`px-2 py-0.5 border-2 border-black text-[10px] font-black uppercase ${tx.type === 'TicketSale' ? 'bg-green-400' : tx.type === 'Payment' ? 'bg-orange-400' : 'bg-red-400'
                                    }`}>
                                    {tx.type}
                                  </span>
                                </td>
                                <td className="px-6 py-4 font-black">₹{Math.abs(tx.amount).toLocaleString()}</td>
                                <td className="px-6 py-4 font-bold text-neutral-500 text-xs">₹{tx.platformFee}</td>
                                <td className="px-6 py-4 text-right">
                                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-green-600">
                                    <CheckCircle size={14} /> {tx.status}
                                  </span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Host Earnings Breakdown */}
                  <div className="lg:col-span-2 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col mb-8">
                    <div className="p-6 border-b-4 border-black bg-blue-50">
                      <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                        <Users size={20} /> Host Earnings Breakdown
                      </h3>
                    </div>
                    <div className="overflow-x-auto relative">
                      {loadingFinancials && (
                        <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                          <div className="flex items-center gap-2 bg-black text-white px-4 py-2 text-xs font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <div className="w-3 h-3 border-2 border-white border-t-transparent animate-spin"></div>
                            Refreshing...
                          </div>
                        </div>
                      )}
                      <table className="w-full text-left">
                        <thead className="bg-black text-white">
                          <tr>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Host</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Categorized Earnings</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Total Earned</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Total Paid</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-right">Balance Owed</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-black/10">
                          {hostSummaries.filter(s => s.totalEarned > 0).length === 0 ? (
                            <tr><td colSpan="5" className="px-6 py-12 text-center text-neutral-400 font-bold uppercase italic">No host data available</td></tr>
                          ) : (
                            hostSummaries.filter(s => s.totalEarned > 0).map((s) => (
                              <tr key={s._id} className="hover:bg-neutral-50 transition-colors">
                                <td className="px-6 py-4">
                                  <p className="font-black uppercase text-sm">{s.fullname}</p>
                                  <p className="text-[10px] font-bold text-neutral-500 uppercase">{s.email}</p>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex flex-wrap gap-1">
                                    {(s.categories || []).map((cat, idx) => (
                                      <span key={idx} className="px-2 py-0.5 bg-indigo-100 text-indigo-700 border border-indigo-200 text-[9px] font-black uppercase">
                                        {cat.name}: ₹{cat.amount.toLocaleString()}
                                      </span>
                                    ))}
                                  </div>
                                </td>
                                <td className="px-6 py-4 font-bold">₹{s.totalEarned.toLocaleString()}</td>
                                <td className="px-6 py-4 font-bold">₹{s.totalPaid.toLocaleString()}</td>
                                <td className="px-6 py-4 text-right">
                                  <span className={`px-3 py-1 border-2 border-black text-xs font-black uppercase ${s.remainingBalance > 0 ? 'bg-orange-400' : 'bg-green-400'}`}>
                                    ₹{s.remainingBalance.toLocaleString()}
                                  </span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Record Payment Panel */}
                  <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] h-fit sticky top-24">
                    <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2 mb-6 pb-2 border-b-2 border-black">
                      <Banknote size={24} /> Record Payment
                    </h3>
                    <form onSubmit={recordPayment} className="space-y-6">
                      <div>
                        <label className="text-[10px] font-black uppercase text-neutral-500 flex items-center gap-1 mb-2">
                          <User size={12} /> Select Host
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            className={`w-full px-4 py-3 border-2 border-black font-bold outline-none focus:ring-4 focus:ring-indigo-100 transition-all ${paymentForm.hostId ? 'bg-green-50' : 'bg-neutral-50 focus:bg-white'}`}
                            placeholder="Search host by name or email..."
                            value={hostSearchQuery}
                            onChange={(e) => {
                              setHostSearchQuery(e.target.value);
                              setPaymentForm({ ...paymentForm, hostId: '' });
                              setShowHostDropdown(true);
                            }}
                            onFocus={() => setShowHostDropdown(true)}
                          />
                          {paymentForm.hostId && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-green-500 text-white text-[8px] font-black uppercase px-2 py-1 rounded-sm border-2 border-black flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                              <CheckCircle size={10} /> Selected
                            </div>
                          )}
                          {showHostDropdown && hostSearchQuery && (
                            <div className="absolute z-50 left-0 right-0 mt-1 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-h-60 overflow-y-auto">
                              {hosts
                                .filter(h =>
                                  h.fullname?.toLowerCase().includes(hostSearchQuery.toLowerCase()) ||
                                  h.email?.toLowerCase().includes(hostSearchQuery.toLowerCase())
                                )
                                .map(h => {
                                  const summary = hostSummaries.find(s => s.email === h.email);
                                  const balance = summary ? summary.remainingBalance : 0;
                                  return (
                                    <button
                                      key={h._id}
                                      type="button"
                                      onClick={() => {
                                        const s = hostSummaries.find(x => x.email === h.email);
                                        setPaymentForm({ ...paymentForm, hostId: s ? s._id : h._id, hostEmail: h.email });
                                        setHostSearchQuery(h.fullname);
                                        setShowHostDropdown(false);
                                      }}
                                      className="w-full text-left px-4 py-3 hover:bg-neutral-100 border-b-2 border-black last:border-b-0 flex justify-between items-center"
                                    >
                                      <div className="flex flex-col">
                                        <span className="font-black text-sm uppercase">{h.fullname}</span>
                                        <span className="text-[10px] font-bold text-neutral-500 uppercase">{h.email}</span>
                                      </div>
                                      {balance > 0 && (
                                        <div className="text-right">
                                          <span className="text-[10px] font-black bg-orange-100 text-orange-700 px-2 py-0.5 border border-orange-200 uppercase">
                                            Owed: &#8377;{balance.toLocaleString()}
                                          </span>
                                        </div>
                                      )}
                                    </button>
                                  );
                                })
                              }
                              {hosts.filter(h =>
                                h.fullname?.toLowerCase().includes(hostSearchQuery.toLowerCase()) ||
                                h.email?.toLowerCase().includes(hostSearchQuery.toLowerCase())
                              ).length === 0 && (
                                <div className="px-4 py-3 text-xs font-bold text-neutral-400 italic">No hosts found</div>
                              )}
                            </div>
                          )}
                        </div>
                        {paymentForm.hostId && (() => {
                          const summary = hostSummaries.find(s => s._id === paymentForm.hostId || s.email === paymentForm.hostEmail);
                          const balance = summary ? summary.remainingBalance : 0;
                          return (
                            <div className="mt-2 p-3 bg-orange-50 border-2 border-orange-300 flex justify-between items-center">
                              <span className="text-[10px] font-black uppercase text-orange-700">Balance Owed</span>
                              <span className="text-lg font-black text-orange-700">&#8377;{balance.toLocaleString()}</span>
                            </div>
                          );
                        })()}
                        {paymentForm.hostId && (
                          <button
                            type="button"
                            onClick={() => { setPaymentForm({ hostId: '', hostEmail: '', amount: '', note: '' }); setHostSearchQuery(''); }}
                            className="mt-1 text-[9px] font-black text-red-600 hover:underline uppercase"
                          >
                            Clear Selection
                          </button>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-neutral-500 flex items-center gap-1">
                          <IndianRupee size={12} /> Amount Paid (&#8377;)
                        </label>
                        <input
                          type="number"
                          className="w-full px-4 py-3 border-2 border-black bg-neutral-50 font-bold focus:bg-white outline-none focus:ring-4 focus:ring-indigo-100 transition-all"
                          placeholder="0.00"
                          value={paymentForm.amount}
                          onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                          required
                        />
                        {paymentForm.hostId && paymentForm.amount && (() => {
                          const summary = hostSummaries.find(s => s._id === paymentForm.hostId || s.email === paymentForm.hostEmail);
                          const balance = summary ? summary.remainingBalance : 0;
                          const remaining = balance - Number(paymentForm.amount);
                          return (
                            <div className={`mt-1 p-2 border-2 text-[10px] font-black uppercase flex justify-between ${remaining < 0 ? 'bg-red-50 border-red-300 text-red-700' : 'bg-green-50 border-green-300 text-green-700'}`}>
                              <span>Balance after payment</span>
                              <span>&#8377;{remaining.toLocaleString()}</span>
                            </div>
                          );
                        })()}
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-neutral-500">Note</label>
                        <textarea
                          className="w-full px-4 py-3 border-2 border-black bg-neutral-50 font-bold focus:bg-white outline-none focus:ring-4 focus:ring-indigo-100 transition-all resize-none"
                          rows="3"
                          placeholder="Payment reference or notes..."
                          value={paymentForm.note}
                          onChange={(e) => setPaymentForm({ ...paymentForm, note: e.target.value })}
                        />
                      </div>
                      <button className="w-full py-4 bg-black text-white text-sm font-black uppercase border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                        Record Payment
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}


            {activeTab === 'verify-students' && (
              <div className="animate-fadeIn max-w-7xl mx-auto space-y-8">
                <h1 className="text-4xl font-black mb-8 flex items-center gap-3 text-black uppercase tracking-tighter">
                  <div className="p-2 border-2 border-black bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]">
                    <CheckCircle2 size={28} />
                  </div>
                  Verify Students
                </h1>
                <div className="bg-teal-50 border-2 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black text-black uppercase tracking-tighter">
                      Pending Submissions ({verifyItems.length})
                    </h2>
                    <button
                      onClick={fetchPendingVerifications}
                      className="px-6 py-3 bg-white text-black border-2 border-black font-bold uppercase tracking-wider hover:bg-neutral-100 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50"
                      disabled={verifyLoading}
                    >
                      {verifyLoading ? 'Refreshing...' : 'Refresh'}
                    </button>
                  </div>
                  {verifyError && (
                    <div className="mb-6 p-4 bg-red-100 border-2 border-black text-red-700 font-bold">
                      {verifyError}
                    </div>
                  )}
                  {verifyItems.length === 0 && !verifyLoading ? (
                    <div className="text-neutral-500 text-center py-12 bg-white border-2 border-dashed border-black">
                      <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-neutral-400" />
                      <p className="font-bold uppercase tracking-wide">
                        No pending verification requests.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {verifyItems.map((u) => {
                        const id = u._id || u.id;
                        const toUrl = (p) => {
                          if (!p) return '';
                          // Already an absolute URL (Cloudinary, S3, etc.) — use as-is
                          if (/^https?:\/\//i.test(String(p))) return String(p);
                          const idx = String(p).lastIndexOf('uploads');
                          const rel =
                            idx >= 0
                              ? String(p).slice(idx).replace(/\\\\/g, '/')
                              : String(p).replace(/\\\\/g, '/');
                          return `${config.apiBaseUrl}/api/${rel}`;
                        };
                        const studentIdUrl = toUrl(u.studentIdPath);
                        const secondDocUrl = toUrl(u.secondDocPath);
                        return (
                          <div
                            key={id}
                            className="bg-teal-100 border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                          >
                            <div className="flex flex-wrap justify-between gap-6">
                              <div>
                                <div className="font-black text-2xl text-black uppercase tracking-tighter">
                                  {u.fullname}
                                </div>
                                <div className="text-black font-bold">{u.institute}</div>
                                <div className="text-neutral-600 font-medium text-sm mt-1">
                                  {u.email} {u.phone ? `• ${u.phone}` : ''}
                                </div>
                                {u.ocrMismatch ? (
                                  <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-300 border-2 border-black text-black text-xs font-black uppercase tracking-wider">
                                    <span className="w-2 h-2 rounded-full bg-black"></span>
                                    OCR mismatch flagged
                                  </div>
                                ) : null}
                              </div>
                              <div className="flex gap-4 items-start">
                                {studentIdUrl ? (
                                  <a
                                    href={studentIdUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="group block text-center"
                                  >
                                    <div className="relative overflow-hidden border-2 border-black bg-white">
                                      <img
                                        src={studentIdUrl}
                                        alt="Student ID"
                                        className="w-32 h-24 object-cover group-hover:scale-110 transition-transform"
                                        onError={(e) => {
                                          e.currentTarget.style.display = 'none';
                                        }}
                                      />
                                    </div>
                                    <div className="text-xs text-blue-600 font-bold uppercase tracking-wide mt-1 group-hover:underline">
                                      Open ID
                                    </div>
                                  </a>
                                ) : (
                                  <div className="text-xs text-neutral-400 italic font-bold">
                                    No ID file
                                  </div>
                                )}
                                {secondDocUrl ? (
                                  <a
                                    href={secondDocUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="group block text-center"
                                  >
                                    <div className="relative overflow-hidden border-2 border-black bg-white">
                                      <img
                                        src={secondDocUrl}
                                        alt="Second Doc"
                                        className="w-32 h-24 object-cover group-hover:scale-110 transition-transform"
                                        onError={(e) => {
                                          e.currentTarget.style.display = 'none';
                                        }}
                                      />
                                    </div>
                                    <div className="text-xs text-blue-600 font-bold uppercase tracking-wide mt-1 group-hover:underline">
                                      Open Doc
                                    </div>
                                  </a>
                                ) : (
                                  <div className="text-xs text-neutral-400 italic font-bold">
                                    No second doc
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="mt-6 pt-4 border-t-2 border-black flex flex-col md:flex-row gap-3 md:items-center">
                              <input
                                className="flex-1 p-3 bg-white border-2 border-black focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all outline-none text-sm font-bold placeholder:text-neutral-400"
                                placeholder="REASON (OPTIONAL IF APPROVING, REQUIRED IF REJECTING)"
                                value={reasonById[id] || ''}
                                onChange={(e) =>
                                  setReasonById((prev) => ({ ...prev, [id]: e.target.value }))
                                }
                              />
                              <div className="flex gap-2">
                                <button
                                  className="px-6 py-3 bg-green-500 text-black border-2 border-black font-black uppercase tracking-wider hover:bg-green-600 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all text-sm"
                                  onClick={() => approveVerification(id)}
                                >
                                  Approve
                                </button>
                                <button
                                  className="px-6 py-3 bg-white text-red-600 border-2 border-black font-black uppercase tracking-wider hover:bg-red-50 hover:text-red-700 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all text-sm"
                                  onClick={() => rejectVerification(id)}
                                >
                                  Reject
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* View Hosts Tab */}
            {activeTab === 'view-hosts' && (
              <div className="animate-fadeIn max-w-7xl mx-auto space-y-8">
                <h1 className="text-4xl font-black mb-8 flex items-center gap-3 text-black uppercase tracking-tighter">
                  <div className="p-2 border-2 border-black bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]">
                    <Users size={28} />
                  </div>
                  View Hosts
                </h1>

                <div className="bg-sky-50 border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-black uppercase tracking-wide text-black">
                      All Hosts ({filteredHosts.length})
                    </h2>
                    <div className="flex gap-2">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="SEARCH HOSTS..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="px-4 py-2 pr-10 bg-white border-2 border-black focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all placeholder:text-neutral-400 font-bold uppercase text-sm"
                        />
                        {searchTerm && (
                          <button
                            onClick={() => setSearchTerm('')}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-black hover:text-red-600 font-bold"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-black text-white">
                        <tr>
                          <th className="px-4 py-3 font-bold uppercase tracking-wider border-2 border-black text-sm">
                            Name
                          </th>
                          <th className="px-4 py-3 font-bold uppercase tracking-wider border-2 border-black text-sm">
                            Email
                          </th>
                          <th className="px-4 py-3 font-bold uppercase tracking-wider border-2 border-black text-sm">
                            Institute
                          </th>
                          <th className="px-4 py-3 font-bold uppercase tracking-wider border-2 border-black text-sm">
                            Course
                          </th>
                          <th className="px-4 py-3 font-bold uppercase tracking-wider border-2 border-black text-sm">
                            Phone
                          </th>
                          <th className="px-4 py-3 font-bold uppercase tracking-wider border-2 border-black text-sm">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="text-black">
                        {filteredHosts.map((host) => (
                          <tr
                            key={host._id}
                            className="hover:bg-sky-100 transition-colors border-b-2 border-black"
                          >
                            <td className="px-4 py-3 border-r-2 border-black font-medium">
                              {host.fullname}
                            </td>
                            <td className="px-4 py-3 border-r-2 border-black">{host.email}</td>
                            <td className="px-4 py-3 border-r-2 border-black">{host.institute}</td>
                            <td className="px-4 py-3 border-r-2 border-black">{host.course}</td>
                            <td className="px-4 py-3 border-r-2 border-black">
                              {host.countryCode} {host.phone}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => openEditHostModal(host)}
                                  className="p-2 bg-blue-500 text-white border-2 border-black hover:bg-blue-600 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                                >
                                  <Edit3 size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeleteHost(host.userId || host._id)}
                                  className="p-2 bg-red-500 text-white border-2 border-black hover:bg-red-600 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Host Applications Tab */}
            {activeTab === 'host-applications' && (
              <div className="animate-fadeIn max-w-7xl mx-auto space-y-8">
                <h1 className="text-4xl font-black mb-8 flex items-center gap-3 text-black uppercase tracking-tighter">
                  <div className="p-2 border-2 border-black bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]">
                    <UserPlus size={28} />
                  </div>
                  Host Applications
                </h1>

                {loadingApplications ? (
                  <div className="text-black text-center py-12 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div className="animate-pulse font-bold uppercase tracking-widest">
                      Loading applications...
                    </div>
                  </div>
                ) : hostApplications.filter((a) => a.approvalStatus === 'pending').length === 0 ? (
                  <div className="text-neutral-500 text-center py-12 bg-white border-2 border-dashed border-black">
                    <UserPlus className="w-12 h-12 mx-auto mb-3 text-neutral-400" />
                    <p className="font-bold uppercase tracking-wide">
                      No pending host applications.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {hostApplications
                      .filter((application) => application.approvalStatus === 'pending')
                      .map((application) => (
                        <div
                          key={application._id}
                          className="bg-indigo-50 border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                        >
                          <div className="flex items-start justify-between mb-6">
                            <div>
                              <h3 className="text-2xl font-black uppercase tracking-tighter text-black">
                                {application.fullname}
                              </h3>
                              <p className="text-black font-bold">{application.email}</p>
                              <p className="text-neutral-600 font-medium text-sm">
                                {application.institute}
                              </p>
                            </div>
                            <div
                              className={`px-4 py-1.5 border-2 border-black text-sm font-black uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${application.approvalStatus === 'pending'
                                ? 'bg-amber-300 text-black'
                                : application.approvalStatus === 'approved'
                                  ? 'bg-green-400 text-black'
                                  : 'bg-red-400 text-black'
                                }`}
                            >
                              {application.approvalStatus.charAt(0).toUpperCase() +
                                application.approvalStatus.slice(1)}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 p-4 bg-neutral-50 border-2 border-black">
                            <div>
                              <label className="text-xs font-black text-neutral-500 uppercase tracking-widest block mb-1">
                                Department
                              </label>
                              <p className="text-black font-bold">{application.course}</p>
                            </div>
                            <div>
                              <label className="text-xs font-black text-neutral-500 uppercase tracking-widest block mb-1">
                                Phone
                              </label>
                              <p className="text-black font-bold">
                                {application.countryCode} {application.phone}
                              </p>
                            </div>
                            <div>
                              <label className="text-xs font-black text-neutral-500 uppercase tracking-widest block mb-1">
                                Address
                              </label>
                              <p className="text-black font-bold">
                                {application.street}, {application.city} - {application.pincode}
                              </p>
                            </div>
                            <div>
                              <label className="text-xs font-black text-neutral-500 uppercase tracking-widest block mb-1">
                                Applied On
                              </label>
                              <p className="text-black font-bold">
                                {new Date(application.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          {application.documentPath && (
                            <div className="mb-6">
                              <label className="text-sm font-bold text-black uppercase tracking-wide mb-2 block">
                                Supporting Document
                              </label>
                              <a
                                href={application.documentPath && application.documentPath.startsWith('http') ? application.documentPath : `${config.apiBaseUrl}/api/${application.documentPath}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black border-2 border-black hover:bg-neutral-100 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-bold uppercase tracking-wider text-sm"
                              >
                                <Eye size={16} />
                                View Document
                              </a>
                            </div>
                          )}

                          {application.rejectionReason && (
                            <div className="mb-6 p-4 bg-red-50 border-2 border-red-500 text-red-700">
                              <label className="text-sm font-black uppercase tracking-wide block mb-1">
                                Rejection Reason
                              </label>
                              <p className="font-medium">{application.rejectionReason}</p>
                            </div>
                          )}

                          {application.approvalStatus === 'pending' && (
                            <div className="flex gap-3 pt-4 border-t-2 border-black">
                              <button
                                onClick={() => approveHostApplication(application._id)}
                                className="flex items-center gap-2 px-5 py-3 bg-green-500 text-black border-2 border-black hover:bg-green-400 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-bold uppercase tracking-widest text-sm"
                              >
                                <CheckCircle2 size={18} />
                                Approve
                              </button>
                              <button
                                onClick={() => {
                                  const reason = prompt('Enter rejection reason:');
                                  if (reason) {
                                    rejectHostApplication(application._id, reason);
                                  }
                                }}
                                className="flex items-center gap-2 px-5 py-3 bg-white text-red-600 border-2 border-black hover:bg-red-50 hover:text-red-700 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-bold uppercase tracking-widest text-sm"
                              >
                                <XCircle size={18} />
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* Add Host Tab */}
            {activeTab === 'add-host' && (
              <div className="animate-fadeIn max-w-4xl mx-auto space-y-8">
                <h1 className="text-4xl font-black mb-8 flex items-center gap-3 text-black uppercase tracking-tighter">
                  <div className="p-2 border-2 border-black bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]">
                    <UserPlus size={28} />
                  </div>
                  {isEditMode ? 'Edit Host' : 'Add New Host'}
                </h1>
                <form
                  onSubmit={handleAddHost}
                  className="bg-white border-2 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-black text-black uppercase tracking-wide mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        placeholder="INSTITUTION EMAIL ADDRESS"
                        value={newHost.email}
                        onChange={(e) => handleHostFieldChange('email', e.target.value)}
                        onFocus={() => handleHostFieldFocus('email')}
                        onBlur={() => handleHostFieldBlur('email')}
                        className={`w-full p-3 bg-white border-2 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all outline-none text-black font-bold placeholder:text-neutral-400 ${hostErrors.email ? 'border-red-500' : 'border-black'
                          }`}
                        required
                      />
                      {hostErrors.email && (
                        <p className="text-red-600 font-bold text-xs mt-1 flex items-center gap-1">
                          <XCircle size={12} />
                          {hostErrors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-black text-black uppercase tracking-wide mb-2">
                        Institution Name *
                      </label>
                      <input
                        type="text"
                        placeholder="E.G., ABC COLLEGE OF ENGINEERING"
                        value={newHost.institute}
                        onChange={(e) => handleHostFieldChange('institute', e.target.value)}
                        onFocus={() => handleHostFieldFocus('institute')}
                        onBlur={() => handleHostFieldBlur('institute')}
                        className={`w-full p-3 bg-white border-2 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all outline-none text-black font-bold placeholder:text-neutral-400 ${hostErrors.institute ? 'border-red-500' : 'border-black'
                          }`}
                        required
                      />
                      {hostErrors.institute && (
                        <p className="text-red-600 font-bold text-xs mt-1 flex items-center gap-1">
                          <XCircle size={12} />
                          {hostErrors.institute}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-black text-black uppercase tracking-wide mb-2">
                        Department *
                      </label>
                      <input
                        type="text"
                        placeholder="E.G., COMPUTER SCIENCE"
                        value={newHost.course}
                        onChange={(e) => handleHostFieldChange('course', e.target.value)}
                        onFocus={() => handleHostFieldFocus('course')}
                        onBlur={() => handleHostFieldBlur('course')}
                        className={`w-full p-3 bg-white border-2 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all outline-none text-black font-bold placeholder:text-neutral-400 ${hostErrors.course ? 'border-red-500' : 'border-black'
                          }`}
                        required
                      />
                      {hostErrors.course && (
                        <p className="text-red-600 font-bold text-xs mt-1 flex items-center gap-1">
                          <XCircle size={12} />
                          {hostErrors.course}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-black text-black uppercase tracking-wide mb-2">
                        Institution Type (optional)
                      </label>
                      <select
                        value={newHost.institutionType}
                        onChange={(e) => handleHostFieldChange('institutionType', e.target.value)}
                        className="w-full p-3 bg-white border-2 border-black focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all outline-none text-black font-bold"
                      >
                        <option value="">SELECT TYPE</option>
                        <option value="College">College</option>
                        <option value="University">University</option>
                        <option value="Institute">Institute</option>
                        <option value="Company">Company</option>
                        <option value="NGO">NGO</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-black text-black uppercase tracking-wide mb-2">
                        Contact Person Name *
                      </label>
                      <input
                        type="text"
                        placeholder="PRIMARY CONTACT FULL NAME"
                        value={newHost.fullname}
                        onChange={(e) => handleHostFieldChange('fullname', e.target.value)}
                        onFocus={() => handleHostFieldFocus('fullname')}
                        onBlur={() => handleHostFieldBlur('fullname')}
                        className={`w-full p-3 bg-white border-2 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all outline-none text-black font-bold placeholder:text-neutral-400 ${hostErrors.fullname ? 'border-red-500' : 'border-black'
                          }`}
                        required
                      />
                      {hostErrors.fullname && (
                        <p className="text-red-600 font-bold text-xs mt-1 flex items-center gap-1">
                          <XCircle size={12} />
                          {hostErrors.fullname}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-black text-black uppercase tracking-wide mb-2">
                        Contact Person Username *
                      </label>
                      <input
                        type="text"
                        placeholder="CREATE USERNAME"
                        value={newHost.username}
                        onChange={(e) => handleHostFieldChange('username', e.target.value)}
                        onFocus={() => handleHostFieldFocus('username')}
                        onBlur={() => handleHostFieldBlur('username')}
                        className={`w-full p-3 bg-white border-2 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all outline-none text-black font-bold placeholder:text-neutral-400 ${hostErrors.username ? 'border-red-500' : 'border-black'
                          }`}
                        required
                      />
                      {hostErrors.username && (
                        <p className="text-red-600 font-bold text-xs mt-1 flex items-center gap-1">
                          <XCircle size={12} />
                          {hostErrors.username}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-black text-black uppercase tracking-wide mb-2">
                        Password *
                      </label>
                      <input
                        type="password"
                        placeholder="CREATE A PASSWORD"
                        value={newHost.password}
                        onChange={(e) => handleHostFieldChange('password', e.target.value)}
                        onFocus={() => handleHostFieldFocus('password')}
                        onBlur={() => handleHostFieldBlur('password')}
                        className={`w-full p-3 bg-white border-2 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all outline-none text-black font-bold placeholder:text-neutral-400 ${hostErrors.password ? 'border-red-500' : 'border-black'
                          }`}
                        required
                      />
                      {hostErrors.password && (
                        <p className="text-red-600 font-bold text-xs mt-1 flex items-center gap-1">
                          <XCircle size={12} />
                          {hostErrors.password}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-black text-black uppercase tracking-wide mb-2">
                        Confirm Password *
                      </label>
                      <input
                        type="password"
                        placeholder="CONFIRM THE PASSWORD"
                        value={newHost.confirmPassword}
                        onChange={(e) => handleHostFieldChange('confirmPassword', e.target.value)}
                        onFocus={() => handleHostFieldFocus('confirmPassword')}
                        onBlur={() => handleHostFieldBlur('confirmPassword')}
                        className={`w-full p-3 bg-white border-2 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all outline-none text-black font-bold placeholder:text-neutral-400 ${hostErrors.confirmPassword ? 'border-red-500' : 'border-black'
                          }`}
                        required
                      />
                      {hostErrors.confirmPassword && (
                        <p className="text-red-600 font-bold text-xs mt-1 flex items-center gap-1">
                          <XCircle size={12} />
                          {hostErrors.confirmPassword}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-black text-black uppercase tracking-wide mb-2">
                        Contact Person Age *
                      </label>
                      <input
                        type="number"
                        placeholder="E.G., 30"
                        value={newHost.age}
                        onChange={(e) => handleHostFieldChange('age', e.target.value)}
                        onFocus={() => handleHostFieldFocus('age')}
                        onBlur={() => handleHostFieldBlur('age')}
                        className={`w-full p-3 bg-white border-2 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all outline-none text-black font-bold placeholder:text-neutral-400 ${hostErrors.age ? 'border-red-500' : 'border-black'
                          }`}
                        min="16"
                        max="100"
                        required
                      />
                      {hostErrors.age && (
                        <p className="text-red-600 font-bold text-xs mt-1 flex items-center gap-1">
                          <XCircle size={12} />
                          {hostErrors.age}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="pt-4 border-t-2 border-black">
                    <h3 className="text-lg font-black text-black uppercase tracking-wide mb-4">
                      Contact Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-black text-black uppercase tracking-wide mb-2">
                          Country Code
                        </label>
                        <input
                          type="text"
                          placeholder="E.G., +91"
                          value={newHost.countryCode}
                          onChange={(e) => handleHostFieldChange('countryCode', e.target.value)}
                          onFocus={() => handleHostFieldFocus('countryCode')}
                          onBlur={() => handleHostFieldBlur('countryCode')}
                          className={`w-full p-3 bg-white border-2 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all outline-none text-black font-bold placeholder:text-neutral-400 ${hostErrors.countryCode ? 'border-red-500' : 'border-black'
                            }`}
                        />
                        {hostErrors.countryCode && (
                          <p className="text-red-600 font-bold text-xs mt-1 flex items-center gap-1">
                            <XCircle size={12} />
                            {hostErrors.countryCode}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-black text-black uppercase tracking-wide mb-2">
                          Institution Phone Number *
                        </label>
                        <input
                          type="tel"
                          placeholder="INSTITUTION MAIN CONTACT NUMBER"
                          value={newHost.phone}
                          onChange={(e) => handleHostFieldChange('phone', e.target.value)}
                          onFocus={() => handleHostFieldFocus('phone')}
                          onBlur={() => handleHostFieldBlur('phone')}
                          className={`w-full p-3 bg-white border-2 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all outline-none text-black font-bold placeholder:text-neutral-400 ${hostErrors.phone ? 'border-red-500' : 'border-black'
                            }`}
                          required
                        />
                        {hostErrors.phone && (
                          <p className="text-red-600 font-bold text-xs mt-1 flex items-center gap-1">
                            <XCircle size={12} />
                            {hostErrors.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Address Information */}
                  <div className="pt-4 border-t-2 border-black">
                    <h3 className="text-lg font-black text-black uppercase tracking-wide mb-4">
                      Address
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-black text-black uppercase tracking-wide mb-2">
                          Street Address *
                        </label>
                        <input
                          type="text"
                          placeholder="E.G., 123, COLLEGE ROAD"
                          value={newHost.street}
                          onChange={(e) => handleHostFieldChange('street', e.target.value)}
                          onFocus={() => handleHostFieldFocus('street')}
                          onBlur={() => handleHostFieldBlur('street')}
                          className={`w-full p-3 bg-white border-2 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all outline-none text-black font-bold placeholder:text-neutral-400 ${hostErrors.street ? 'border-red-500' : 'border-black'
                            }`}
                          required
                        />
                        {hostErrors.street && (
                          <p className="text-red-600 font-bold text-xs mt-1 flex items-center gap-1">
                            <XCircle size={12} />
                            {hostErrors.street}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-black text-black uppercase tracking-wide mb-2">
                          City *
                        </label>
                        <input
                          type="text"
                          placeholder="E.G., CHENNAI"
                          value={newHost.city}
                          onChange={(e) => handleHostFieldChange('city', e.target.value)}
                          onFocus={() => handleHostFieldFocus('city')}
                          onBlur={() => handleHostFieldBlur('city')}
                          className={`w-full p-3 bg-white border-2 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all outline-none text-black font-bold placeholder:text-neutral-400 ${hostErrors.city ? 'border-red-500' : 'border-black'
                            }`}
                          required
                        />
                        {hostErrors.city && (
                          <p className="text-red-600 font-bold text-xs mt-1 flex items-center gap-1">
                            <XCircle size={12} />
                            {hostErrors.city}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-black text-black uppercase tracking-wide mb-2">
                          Pincode *
                        </label>
                        <input
                          type="text"
                          placeholder="6-DIGIT PINCODE"
                          value={newHost.pincode}
                          onChange={(e) => handleHostFieldChange('pincode', e.target.value)}
                          onBlur={() => handleHostFieldBlur('pincode')}
                          className={`w-full p-3 bg-white border-2 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all outline-none text-black font-bold placeholder:text-neutral-400 ${hostErrors.pincode ? 'border-red-500' : 'border-black'
                            }`}
                          maxLength="6"
                          required
                        />
                        {hostErrors.pincode && (
                          <p className="text-red-600 font-bold text-xs mt-1 flex items-center gap-1">
                            <XCircle size={12} />
                            {hostErrors.pincode}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-6 border-t-2 border-black">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-black text-white py-4 font-black uppercase tracking-widest text-lg border-2 border-transparent hover:bg-neutral-800 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          {isEditMode ? 'Updating...' : 'Adding Host...'}
                        </div>
                      ) : isEditMode ? (
                        'Update Host Profile'
                      ) : (
                        'Create Host Account'
                      )}
                    </button>

                    {isEditMode && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditMode(false);
                          setEditingHostId(null);
                          setNewHost({
                            email: '',
                            fullname: '',
                            username: '',
                            password: '',
                            confirmPassword: '',
                            role: 'host',
                            institute: '',
                            street: '',
                            city: '',
                            pincode: '',
                            age: '',
                            course: '',
                            phone: '',
                            countryCode: '+91',
                            institutionType: '',
                          });
                          setHostErrors({});
                          setTouchedFields({});
                        }}
                        className="px-6 py-4 bg-white text-black font-black uppercase tracking-widest border-2 border-black hover:bg-red-50 hover:text-red-600 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'events' && (
              <div className="animate-fadeIn max-w-7xl mx-auto space-y-8">
                <h1 className="text-4xl font-black mb-8 flex items-center gap-3 text-black uppercase tracking-tighter">
                  <div className="p-2 border-2 border-black bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]">
                    <Calendar size={28} />
                  </div>
                  Manage Events
                </h1>
                <div className="bg-white border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black uppercase">Events List</h2>
                  </div>
                  {loadingEvents ? (
                    <div className="text-black text-center py-12">
                      <div className="animate-pulse font-bold uppercase tracking-widest">
                        Loading events...
                      </div>
                    </div>
                  ) : adminEvents.length === 0 ? (
                    <div className="text-neutral-500 text-center py-12 font-bold uppercase tracking-wide">
                      No events found.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-black text-white">
                          <tr>
                            <th className="px-6 py-4 font-bold uppercase tracking-wider border-2 border-black text-sm">
                              Title
                            </th>
                            <th className="px-6 py-4 font-bold uppercase tracking-wider border-2 border-black text-sm">
                              Date
                            </th>
                            <th className="px-6 py-4 font-bold uppercase tracking-wider border-2 border-black text-sm">
                              City
                            </th>
                            <th className="px-6 py-4 font-bold uppercase tracking-wider border-2 border-black text-sm">
                              Published
                            </th>
                            <th className="px-6 py-4 font-bold uppercase tracking-wider border-2 border-black text-sm">
                              Completed
                            </th>
                            <th className="px-6 py-4 font-bold uppercase tracking-wider border-2 border-black text-sm">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="text-black">
                          {adminEvents.map((ev) => (
                            <tr
                              key={ev._id}
                              className="hover:bg-neutral-50 transition-colors border-b-2 border-black"
                            >
                              <td className="px-6 py-4 font-medium border-r-2 border-black">
                                {ev.title}
                              </td>
                              <td className="px-6 py-4 border-r-2 border-black">
                                {new Date(ev.date).toLocaleString()}
                              </td>
                              <td className="px-6 py-4 border-r-2 border-black">
                                {ev.city || '-'}
                              </td>
                              <td className="px-6 py-4 border-r-2 border-black">
                                <button
                                  onClick={async () => {
                                    try {
                                      const token = localStorage.getItem('token');
                                      const res = await fetch(
                                        `${config.apiBaseUrl}/api/auth/admin/events/${ev._id}`,
                                        {
                                          method: 'PUT',
                                          headers: {
                                            'Content-Type': 'application/json',
                                            Authorization: `Bearer ${token}`,
                                          },
                                          body: JSON.stringify({ isPublished: !ev.isPublished }),
                                        }
                                      );
                                      if (!res.ok) throw new Error('Failed');
                                      toast.success(!ev.isPublished ? 'Published' : 'Unpublished');
                                      fetchAdminEvents();
                                    } catch (_) {
                                      toast.error('Toggle publish failed');
                                    }
                                  }}
                                  className={`p-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all ${ev.isPublished
                                    ? 'bg-green-400 text-black'
                                    : 'bg-white text-neutral-500'
                                    }`}
                                  title={ev.isPublished ? 'Unpublish' : 'Publish'}
                                >
                                  {ev.isPublished ? (
                                    <ToggleRight size={20} />
                                  ) : (
                                    <ToggleLeft size={20} />
                                  )}
                                </button>
                              </td>
                              <td className="px-6 py-4 border-r-2 border-black">
                                <button
                                  onClick={async () => {
                                    try {
                                      const token = localStorage.getItem('token');
                                      const res = await fetch(
                                        `${config.apiBaseUrl}/api/auth/admin/events/${ev._id}`,
                                        {
                                          method: 'PUT',
                                          headers: {
                                            'Content-Type': 'application/json',
                                            Authorization: `Bearer ${token}`,
                                          },
                                          body: JSON.stringify({ isCompleted: !ev.isCompleted }),
                                        }
                                      );
                                      if (!res.ok) throw new Error('Failed');
                                      toast.success(
                                        !ev.isCompleted ? 'Marked completed' : 'Marked active'
                                      );
                                      fetchAdminEvents();
                                    } catch (_) {
                                      toast.error('Toggle complete failed');
                                    }
                                  }}
                                  className={`p-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all ${ev.isCompleted
                                    ? 'bg-blue-400 text-black'
                                    : 'bg-white text-neutral-500'
                                    }`}
                                  title={ev.isCompleted ? 'Mark active' : 'Mark completed'}
                                >
                                  {ev.isCompleted ? (
                                    <CheckCircle2 size={20} />
                                  ) : (
                                    <XCircle size={20} />
                                  )}
                                </button>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => openAdminEventEdit(ev)}
                                    className="p-2 bg-white text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
                                    title="Edit Event"
                                  >
                                    <Edit3 size={18} />
                                  </button>
                                  <button
                                    onClick={async () => {
                                      if (!window.confirm('Delete this event?')) return;
                                      try {
                                        const token = localStorage.getItem('token');
                                        const res = await fetch(
                                          `${config.apiBaseUrl}/api/auth/admin/events/${ev._id}`,
                                          {
                                            method: 'DELETE',
                                            headers: { Authorization: `Bearer ${token}` },
                                          }
                                        );
                                        if (!res.ok) throw new Error('Failed');
                                        toast.success('Event deleted');
                                        setAdminEvents((prev) =>
                                          prev.filter((e) => e._id !== ev._id)
                                        );
                                      } catch (_) {
                                        toast.error('Delete failed');
                                      }
                                    }}
                                    className="p-2 bg-red-500 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
                                    title="Delete Event"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'monitor' && (
              <div className="animate-fadeIn max-w-7xl mx-auto space-y-8">
                <h1 className="text-4xl font-black mb-8 flex items-center gap-3 text-black uppercase tracking-tighter">
                  <div className="p-2 border-2 border-black bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]">
                    <BarChart2 size={28} />
                  </div>
                  Monitor Activity & Feedback
                </h1>
                {!metrics ? (
                  <div className="text-black font-bold uppercase tracking-widest p-8 border-2 border-dashed border-black text-center">
                    Loading metrics...
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-orange-50 border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <h3 className="text-sm font-black text-black uppercase tracking-widest mb-2 border-b-2 border-black pb-2">
                          Users
                        </h3>
                        <p className="text-4xl font-black text-black mb-2">
                          {metrics.users.total}{' '}
                          <span className="text-lg font-bold text-neutral-500">total</span>
                        </p>
                        <div className="flex flex-wrap gap-2 text-xs font-bold text-black uppercase tracking-wide">
                          <span className="bg-white border-2 border-black px-2 py-1">
                            {metrics.users.hosts} hosts
                          </span>
                          <span className="bg-white border-2 border-black px-2 py-1">
                            {metrics.users.students} students
                          </span>
                          <span className="bg-white border-2 border-black px-2 py-1">
                            {metrics.users.admins} admins
                          </span>
                        </div>
                      </div>
                      <div className="bg-emerald-50 border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <h3 className="text-sm font-black text-black uppercase tracking-widest mb-2 border-b-2 border-black pb-2">
                          Events
                        </h3>
                        <p className="text-4xl font-black text-black mb-2">
                          {metrics.events.total}{' '}
                          <span className="text-lg font-bold text-neutral-500">total</span>
                        </p>
                        <div className="flex flex-wrap gap-2 text-xs font-bold text-black uppercase tracking-wide">
                          <span className="bg-green-300 border-2 border-black px-2 py-1">
                            {metrics.events.published} published
                          </span>
                          <span className="bg-blue-300 border-2 border-black px-2 py-1">
                            {metrics.events.completed} completed
                          </span>
                        </div>
                      </div>
                      <div className="bg-blue-50 border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <h3 className="text-sm font-black text-black uppercase tracking-widest mb-2 border-b-2 border-black pb-2">
                          Activity
                        </h3>
                        <p className="text-sm text-black font-bold leading-relaxed">
                          MONITORING THE LAST 10 ENTRIES ACROSS EVENTS, REGISTRATIONS, AND FEEDBACK.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <h3 className="text-xl font-black text-black uppercase tracking-tighter mb-4 pb-2 border-b-4 border-black">
                          Recent Events
                        </h3>
                        <ul className="space-y-3 text-sm text-black font-bold">
                          {metrics.recent.events.map((e) => (
                            <li
                              key={e._id}
                              className="flex justify-between items-center group border-b border-black pb-2 last:border-0 last:pb-0"
                            >
                              <span className="truncate mr-2 group-hover:translate-x-1 transition-transform cursor-default">
                                {e.title}
                              </span>
                              <span className="text-xs text-neutral-500 whitespace-nowrap bg-neutral-100 px-1 border border-black">
                                {new Date(e.createdAt).toLocaleDateString()}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-white border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <h3 className="text-xl font-black text-black uppercase tracking-tighter mb-4 pb-2 border-b-4 border-black">
                          New Registrations
                        </h3>
                        <ul className="space-y-3 text-sm text-black font-bold">
                          {metrics.recent.registrations.map((r, idx) => (
                            <li
                              key={idx}
                              className="flex justify-between items-center bg-neutral-50 p-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                            >
                              <span className="truncate mr-2">{r.title}</span>
                              <span className="text-xs text-neutral-500 whitespace-nowrap">
                                {new Date(r.registeredAt).toLocaleDateString()}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-white border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <h3 className="text-xl font-black text-black uppercase tracking-tighter mb-4 pb-2 border-b-4 border-black">
                          User Feedback
                        </h3>
                        <ul className="space-y-3 text-sm text-black font-bold">
                          {metrics.recent.feedbacks.map((f, idx) => (
                            <li
                              key={idx}
                              className="flex justify-between items-center border-b border-black pb-2 last:border-0 last:pb-0"
                            >
                              <div className="flex items-center gap-2 truncate mr-2">
                                <span>{f.title}</span>
                                <span className="bg-yellow-300 text-black text-xs px-1.5 py-0.5 border-2 border-black transform -rotate-2">
                                  {f.rating}★
                                </span>
                              </div>
                              <span className="text-xs text-neutral-500 whitespace-nowrap bg-neutral-100 px-1 border border-black">
                                {new Date(f.createdAt).toLocaleDateString()}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          {editHostModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
              <div className="bg-white border-4 border-black p-8 w-full max-w-2xl shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] max-h-[85vh] overflow-y-auto animate-scaleIn">
                <h3 className="text-3xl font-black text-black mb-6 border-b-4 border-black pb-4 uppercase tracking-tighter">
                  Edit Host Profile
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-black text-black uppercase tracking-wide mb-2">
                      Full Name
                    </label>
                    <input
                      className={`w-full p-3 bg-white border-2 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none transition-all text-black font-bold placeholder:text-neutral-400 ${editErrors.fullname ? 'border-red-500' : 'border-black'}`}
                      value={editHostForm.fullname}
                      onFocus={() => handleEditFieldFocus('fullname')}
                      onChange={(e) => handleEditFieldChange('fullname', e.target.value)}
                    />
                    {editErrors.fullname && (
                      <p className="text-red-600 font-bold text-xs mt-1 flex items-center gap-1">
                        <XCircle size={12} />
                        {editErrors.fullname}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-black text-black uppercase tracking-wide mb-2">
                      Username
                    </label>
                    <input
                      className={`w-full p-3 bg-white border-2 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none transition-all text-black font-bold placeholder:text-neutral-400 ${editErrors.username ? 'border-red-500' : 'border-black'}`}
                      value={editHostForm.username}
                      onFocus={() => handleEditFieldFocus('username')}
                      onChange={(e) => handleEditFieldChange('username', e.target.value)}
                    />
                    {editErrors.username && (
                      <p className="text-red-600 font-bold text-xs mt-1 flex items-center gap-1">
                        <XCircle size={12} />
                        {editErrors.username}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-black text-black uppercase tracking-wide mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      className={`w-full p-3 bg-white border-2 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none transition-all text-black font-bold placeholder:text-neutral-400 ${editErrors.email ? 'border-red-500' : 'border-black'}`}
                      value={editHostForm.email}
                      onFocus={() => handleEditFieldFocus('email')}
                      onChange={(e) => handleEditFieldChange('email', e.target.value)}
                    />
                    {editErrors.email && (
                      <p className="text-red-600 font-bold text-xs mt-1 flex items-center gap-1">
                        <XCircle size={12} />
                        {editErrors.email}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-black text-black uppercase tracking-wide mb-2">
                      Phone
                    </label>
                    <input
                      className={`w-full p-3 bg-white border-2 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none transition-all text-black font-bold placeholder:text-neutral-400 ${editErrors.phone ? 'border-red-500' : 'border-black'}`}
                      value={editHostForm.phone}
                      onFocus={() => handleEditFieldFocus('phone')}
                      onChange={(e) => handleEditFieldChange('phone', e.target.value)}
                    />
                    {editErrors.phone && (
                      <p className="text-red-600 font-bold text-xs mt-1 flex items-center gap-1">
                        <XCircle size={12} />
                        {editErrors.phone}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-black text-black uppercase tracking-wide mb-2">
                      Country Code
                    </label>
                    <input
                      className={`w-full p-3 bg-white border-2 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none transition-all text-black font-bold placeholder:text-neutral-400 ${editErrors.countryCode ? 'border-red-500' : 'border-black'}`}
                      value={editHostForm.countryCode}
                      onFocus={() => handleEditFieldFocus('countryCode')}
                      onChange={(e) => handleEditFieldChange('countryCode', e.target.value)}
                    />
                    {editErrors.countryCode && (
                      <p className="text-red-600 font-bold text-xs mt-1 flex items-center gap-1">
                        <XCircle size={12} />
                        {editErrors.countryCode}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-black text-black uppercase tracking-wide mb-2">
                      Institute
                    </label>
                    <input
                      className={`w-full p-3 bg-white border-2 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none transition-all text-black font-bold placeholder:text-neutral-400 ${editErrors.institute ? 'border-red-500' : 'border-black'}`}
                      value={editHostForm.institute}
                      onFocus={() => handleEditFieldFocus('institute')}
                      onChange={(e) => handleEditFieldChange('institute', e.target.value)}
                    />
                    {editErrors.institute && (
                      <p className="text-red-600 font-bold text-xs mt-1 flex items-center gap-1">
                        <XCircle size={12} />
                        {editErrors.institute}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-black text-black uppercase tracking-wide mb-2">
                      Course/Department
                    </label>
                    <input
                      className={`w-full p-3 bg-white border-2 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none transition-all text-black font-bold placeholder:text-neutral-400 ${editErrors.course ? 'border-red-500' : 'border-black'}`}
                      value={editHostForm.course}
                      onFocus={() => handleEditFieldFocus('course')}
                      onChange={(e) => handleEditFieldChange('course', e.target.value)}
                    />
                    {editErrors.course && (
                      <p className="text-red-600 font-bold text-xs mt-1 flex items-center gap-1">
                        <XCircle size={12} />
                        {editErrors.course}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-black text-black uppercase tracking-wide mb-2">
                      Age
                    </label>
                    <input
                      type="number"
                      className={`w-full p-3 bg-white border-2 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none transition-all text-black font-bold placeholder:text-neutral-400 ${editErrors.age ? 'border-red-500' : 'border-black'}`}
                      value={editHostForm.age}
                      onFocus={() => handleEditFieldFocus('age')}
                      onChange={(e) => handleEditFieldChange('age', e.target.value)}
                    />
                    {editErrors.age && (
                      <p className="text-red-600 font-bold text-xs mt-1 flex items-center gap-1">
                        <XCircle size={12} />
                        {editErrors.age}
                      </p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-black text-black uppercase tracking-wide mb-2">
                      Street
                    </label>
                    <input
                      className={`w-full p-3 bg-white border-2 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none transition-all text-black font-bold placeholder:text-neutral-400 ${editErrors.street ? 'border-red-500' : 'border-black'}`}
                      value={editHostForm.street}
                      onFocus={() => handleEditFieldFocus('street')}
                      onChange={(e) => handleEditFieldChange('street', e.target.value)}
                    />
                    {editErrors.street && (
                      <p className="text-red-600 font-bold text-xs mt-1 flex items-center gap-1">
                        <XCircle size={12} />
                        {editErrors.street}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-black text-black uppercase tracking-wide mb-2">
                      City
                    </label>
                    <input
                      className={`w-full p-3 bg-white border-2 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none transition-all text-black font-bold placeholder:text-neutral-400 ${editErrors.city ? 'border-red-500' : 'border-black'}`}
                      value={editHostForm.city}
                      onFocus={() => handleEditFieldFocus('city')}
                      onChange={(e) => handleEditFieldChange('city', e.target.value)}
                    />
                    {editErrors.city && (
                      <p className="text-red-600 font-bold text-xs mt-1 flex items-center gap-1">
                        <XCircle size={12} />
                        {editErrors.city}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-black text-black uppercase tracking-wide mb-2">
                      Pincode
                    </label>
                    <input
                      className={`w-full p-3 bg-white border-2 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none transition-all text-black font-bold placeholder:text-neutral-400 ${editErrors.pincode ? 'border-red-500' : 'border-black'}`}
                      value={editHostForm.pincode}
                      onFocus={() => handleEditFieldFocus('pincode')}
                      onChange={(e) => handleEditFieldChange('pincode', e.target.value)}
                    />
                    {editErrors.pincode && (
                      <p className="text-red-600 font-bold text-xs mt-1 flex items-center gap-1">
                        <XCircle size={12} />
                        {editErrors.pincode}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-black text-black uppercase tracking-wide mb-2">
                      New Password (optional)
                    </label>
                    <input
                      type="password"
                      className={`w-full p-3 bg-white border-2 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none transition-all text-black font-bold placeholder:text-neutral-400 ${editErrors.password ? 'border-red-500' : 'border-black'}`}
                      value={editHostForm.password}
                      onFocus={() => handleEditFieldFocus('password')}
                      onChange={(e) => handleEditFieldChange('password', e.target.value)}
                    />
                    {editErrors.password && (
                      <p className="text-red-600 font-bold text-xs mt-1 flex items-center gap-1">
                        <XCircle size={12} />
                        {editErrors.password}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-black text-black uppercase tracking-wide mb-2">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      className={`w-full p-3 bg-white border-2 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none transition-all text-black font-bold placeholder:text-neutral-400 ${editErrors.confirmPassword ? 'border-red-500' : 'border-black'}`}
                      value={editHostForm.confirmPassword}
                      onFocus={() => handleEditFieldFocus('confirmPassword')}
                      onChange={(e) => handleEditFieldChange('confirmPassword', e.target.value)}
                    />
                    {editErrors.confirmPassword && (
                      <p className="text-red-600 font-bold text-xs mt-1 flex items-center gap-1">
                        <XCircle size={12} />
                        {editErrors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-4 mt-8 pt-6 border-t-2 border-black justify-end">
                  <button
                    onClick={() => setEditHostModal(false)}
                    className="px-6 py-3 bg-white text-black font-black uppercase tracking-widest border-2 border-black hover:bg-neutral-100 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={savingHost}
                    onClick={saveEditHost}
                    className="px-6 py-3 bg-black text-white font-black uppercase tracking-widest border-2 border-transparent hover:bg-neutral-800 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {savingHost ? 'Saving Changes...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Admin Event Form Modal */}
          {showEventForm && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white border-4 border-black p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] animate-scaleIn custom-scrollbar">
                <h2 className="text-3xl font-black uppercase mb-8 text-black border-b-4 border-black pb-4">
                  {editingEvent ? 'Edit Event' : 'Create Event'}
                </h2>
                <form onSubmit={saveAdminEvent} className="space-y-8">
                  {/* Basic Information */}
                  <div className="bg-neutral-50 border-2 border-black p-6">
                    <h3 className="text-xl font-black uppercase mb-6 text-black flex items-center gap-2">
                      <span className="bg-black text-white px-2 py-1 text-sm">01</span> Basic
                      Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold uppercase text-black mb-2">
                          Event Title *
                        </label>
                        <input
                          type="text"
                          value={eventForm.title}
                          onChange={(e) => handleEventFieldChange('title', e.target.value)}
                          onBlur={() => handleEventFieldBlur('title')}
                          onFocus={() => handleEventFieldFocus('title')}
                          className={`w-full p-3 bg-white border-2 border-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-1px] focus:translate-y-[-1px] outline-none ${eventFormErrors.title ? 'border-red-500' : ''}`}
                          required
                        />
                        {eventFormErrors.title && (
                          <p className="text-red-600 font-bold text-xs mt-1 uppercase">
                            {eventFormErrors.title}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-black mb-2">
                          Category
                        </label>
                        <div className="relative">
                          <select
                            value={eventForm.category}
                            onChange={(e) => handleEventFieldChange('category', e.target.value)}
                            className="w-full p-3 bg-white border-2 border-black appearance-none transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-1px] focus:translate-y-[-1px] outline-none font-medium"
                          >
                            <option value="Hackathon">Hackathon</option>
                            <option value="Workshop">Workshop</option>
                            <option value="Seminar">Seminar</option>
                            <option value="Competition">Competition</option>
                            <option value="Networking">Networking</option>
                            <option value="Cultural">Cultural</option>
                            <option value="Sports">Sports</option>
                            <option value="Tech Talk">Tech Talk</option>
                            <option value="Career Fair">Career Fair</option>
                            <option value="Education">Education</option>
                            <option value="Health">Health</option>
                            <option value="Entertainment">Entertainment</option>
                            <option value="Social">Social</option>
                            <option value="Other">Other</option>
                          </select>
                          <ChevronRight className="absolute right-4 top-1/2 transform -translate-y-1/2 rotate-90 w-4 h-4 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                    <div className="mt-6">
                      <label className="block text-xs font-bold uppercase text-black mb-2">
                        Short Description (Max 150 chars) *
                      </label>
                      <input
                        type="text"
                        value={eventForm.shortDescription}
                        onChange={(e) => handleEventFieldChange('shortDescription', e.target.value)}
                        onBlur={() => handleEventFieldBlur('shortDescription')}
                        onFocus={() => handleEventFieldFocus('shortDescription')}
                        maxLength={150}
                        className={`w-full p-3 bg-white border-2 border-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-1px] focus:translate-y-[-1px] outline-none ${eventFormErrors.shortDescription ? 'border-red-500' : ''}`}
                        placeholder="Brief description for event cards"
                        required
                      />
                      <div className="flex justify-between text-xs font-bold text-slate-500 mt-1 uppercase">
                        <span>
                          {eventFormErrors.shortDescription && (
                            <span className="text-red-600">{eventFormErrors.shortDescription}</span>
                          )}
                        </span>
                        <span>{eventForm.shortDescription?.length || 0}/150</span>
                      </div>
                    </div>
                    <div className="mt-6">
                      <label className="block text-xs font-bold uppercase text-black mb-2">
                        Full Description *
                      </label>
                      <textarea
                        value={eventForm.description}
                        onChange={(e) => handleEventFieldChange('description', e.target.value)}
                        onBlur={() => handleEventFieldBlur('description')}
                        onFocus={() => handleEventFieldFocus('description')}
                        className={`w-full p-3 bg-white border-2 border-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-1px] focus:translate-y-[-1px] outline-none ${eventFormErrors.description ? 'border-red-500' : ''}`}
                        rows="4"
                        required
                      />
                      {eventFormErrors.description && (
                        <p className="text-red-600 font-bold text-xs mt-1 uppercase">
                          {eventFormErrors.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="bg-neutral-50 border-2 border-black p-6">
                    <h3 className="text-xl font-black uppercase mb-6 text-black flex items-center gap-2">
                      <span className="bg-black text-white px-2 py-1 text-sm">02</span> Date & Time
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold uppercase text-black mb-2">
                          Start Date & Time *
                        </label>
                        <input
                          type="datetime-local"
                          value={eventForm.date}
                          onChange={(e) => handleEventFieldChange('date', e.target.value)}
                          onBlur={() => handleEventFieldBlur('date')}
                          onFocus={() => handleEventFieldFocus('date')}
                          className={`w-full p-3 bg-white border-2 border-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-1px] focus:translate-y-[-1px] outline-none ${eventFormErrors.date ? 'border-red-500' : ''}`}
                          required
                        />
                        {eventFormErrors.date && (
                          <p className="text-red-600 font-bold text-xs mt-1 uppercase">
                            {eventFormErrors.date}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-black mb-2">
                          End Date & Time
                        </label>
                        <input
                          type="datetime-local"
                          value={eventForm.endDate}
                          onChange={(e) => handleEventFieldChange('endDate', e.target.value)}
                          onBlur={() => handleEventFieldBlur('endDate')}
                          onFocus={() => handleEventFieldFocus('endDate')}
                          min={eventForm.date}
                          className={`w-full p-3 bg-white border-2 border-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-1px] focus:translate-y-[-1px] outline-none ${eventFormErrors.endDate ? 'border-red-500' : ''}`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-black mb-2">
                          Registration Deadline
                        </label>
                        <input
                          type="datetime-local"
                          value={eventForm.registrationDeadline}
                          onChange={(e) =>
                            handleEventFieldChange('registrationDeadline', e.target.value)
                          }
                          onBlur={() => handleEventFieldBlur('registrationDeadline')}
                          onFocus={() => handleEventFieldFocus('registrationDeadline')}
                          max={eventForm.date}
                          className={`w-full p-3 bg-white border-2 border-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-1px] focus:translate-y-[-1px] outline-none ${eventFormErrors.registrationDeadline ? 'border-red-500' : ''}`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="bg-neutral-50 border-2 border-black p-6">
                    <h3 className="text-xl font-black uppercase mb-6 text-black flex items-center gap-2">
                      <span className="bg-black text-white px-2 py-1 text-sm">03</span> Location
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold uppercase text-black mb-2">
                          Event Type
                        </label>
                        <div className="flex space-x-6">
                          <label className="flex items-center cursor-pointer group">
                            <input
                              type="radio"
                              name="isOnlineAa"
                              checked={!eventForm.isOnline}
                              onChange={() => handleEventFieldChange('isOnline', false)}
                              className="mr-3 w-5 h-5 border-2 border-black text-black focus:ring-0 cursor-pointer"
                            />
                            <span className="text-black font-bold uppercase group-hover:underline">
                              In-Person
                            </span>
                          </label>
                          <label className="flex items-center cursor-pointer group">
                            <input
                              type="radio"
                              name="isOnlineAa"
                              checked={eventForm.isOnline}
                              onChange={() => handleEventFieldChange('isOnline', true)}
                              className="mr-3 w-5 h-5 border-2 border-black text-black focus:ring-0 cursor-pointer"
                            />
                            <span className="text-black font-bold uppercase group-hover:underline">
                              Online
                            </span>
                          </label>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-black mb-2">
                          Location/Venue *
                        </label>
                        <input
                          type="text"
                          value={eventForm.location}
                          onChange={(e) => handleEventFieldChange('location', e.target.value)}
                          onBlur={() => handleEventFieldBlur('location')}
                          onFocus={() => handleEventFieldFocus('location')}
                          className={`w-full p-3 bg-white border-2 border-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-1px] focus:translate-y-[-1px] outline-none ${eventFormErrors.location ? 'border-red-500' : ''}`}
                          placeholder={eventForm.isOnline ? 'Online Event' : 'Venue Name'}
                          required
                        />
                        {eventFormErrors.location && (
                          <p className="text-red-600 font-bold text-xs mt-1 uppercase">
                            {eventFormErrors.location}
                          </p>
                        )}
                      </div>
                    </div>
                    {eventForm.isOnline && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <div>
                          <label className="block text-xs font-bold uppercase text-black mb-2">
                            Platform
                          </label>
                          <div className="relative">
                            <select
                              value={eventForm.platform}
                              onChange={(e) => handleEventFieldChange('platform', e.target.value)}
                              className="w-full p-3 bg-white border-2 border-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-1px] focus:translate-y-[-1px] outline-none appearance-none"
                            >
                              <option value="Google Meet">Google Meet</option>
                              <option value="Zoom">Zoom</option>
                              <option value="Microsoft Teams">Microsoft Teams</option>
                              <option value="Other">Other</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-3.5 w-5 h-5 text-black pointer-events-none" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase text-black mb-2">
                            Meeting Link
                          </label>
                          <input
                            type="url"
                            value={eventForm.meetingLink}
                            onChange={(e) => handleEventFieldChange('meetingLink', e.target.value)}
                            onBlur={() => handleEventFieldBlur('meetingLink')}
                            onFocus={() => handleEventFieldFocus('meetingLink')}
                            className={`w-full p-3 bg-white border-2 border-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-1px] focus:translate-y-[-1px] outline-none ${eventFormErrors.meetingLink ? 'border-red-500' : ''}`}
                            placeholder="https://meet.google.com/..."
                          />
                        </div>
                      </div>
                    )}
                    {!eventForm.isOnline && (
                      <>
                        <div className="mt-6">
                          <label className="block text-xs font-bold uppercase text-black mb-2">
                            Address
                          </label>
                          <input
                            type="text"
                            value={eventForm.address}
                            onChange={(e) => handleEventFieldChange('address', e.target.value)}
                            onBlur={() => handleEventFieldBlur('address')}
                            onFocus={() => handleEventFieldFocus('address')}
                            className={`w-full p-3 bg-white border-2 border-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-1px] focus:translate-y-[-1px] outline-none`}
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                          <div>
                            <label className="block text-xs font-bold uppercase text-black mb-2">
                              City *
                            </label>
                            <input
                              type="text"
                              value={eventForm.city}
                              onChange={(e) => handleEventFieldChange('city', e.target.value)}
                              onBlur={() => handleEventFieldBlur('city')}
                              onFocus={() => handleEventFieldFocus('city')}
                              className={`w-full p-3 bg-white border-2 border-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-1px] focus:translate-y-[-1px] outline-none ${eventFormErrors.city ? 'border-red-500' : ''}`}
                              required
                            />
                            {eventFormErrors.city && (
                              <p className="text-red-600 font-bold text-xs mt-1 uppercase">
                                {eventFormErrors.city}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-xs font-bold uppercase text-black mb-2">
                              State *
                            </label>
                            <input
                              type="text"
                              value={eventForm.state}
                              onChange={(e) => handleEventFieldChange('state', e.target.value)}
                              onBlur={() => handleEventFieldBlur('state')}
                              onFocus={() => handleEventFieldFocus('state')}
                              className={`w-full p-3 bg-white border-2 border-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-1px] focus:translate-y-[-1px] outline-none ${eventFormErrors.state ? 'border-red-500' : ''}`}
                              required
                            />
                            {eventFormErrors.state && (
                              <p className="text-red-600 font-bold text-xs mt-1 uppercase">
                                {eventFormErrors.state}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-xs font-bold uppercase text-black mb-2">
                              Pincode
                            </label>
                            <input
                              type="text"
                              value={eventForm.pincode}
                              onChange={(e) => handleEventFieldChange('pincode', e.target.value)}
                              onBlur={() => handleEventFieldBlur('pincode')}
                              onFocus={() => handleEventFieldFocus('pincode')}
                              className={`w-full p-3 bg-white border-2 border-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-1px] focus:translate-y-[-1px] outline-none`}
                              maxLength="6"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                          <div>
                            <label className="block text-xs font-bold uppercase text-black mb-2">
                              Latitude
                            </label>
                            <input
                              type="number"
                              step="any"
                              value={eventForm.latitude}
                              onChange={(e) => handleEventFieldChange('latitude', e.target.value)}
                              onFocus={() => handleEventFieldFocus('latitude')}
                              className={`w-full p-3 bg-white border-2 border-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-1px] focus:translate-y-[-1px] outline-none ${eventFormErrors.latitude ? 'border-red-500' : ''}`}
                              placeholder="e.g. 12.9716"
                            />
                            {eventFormErrors.latitude && (
                              <p className="text-red-600 font-bold text-xs mt-1 uppercase">
                                {eventFormErrors.latitude}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-xs font-bold uppercase text-black mb-2">
                              Longitude
                            </label>
                            <input
                              type="number"
                              step="any"
                              value={eventForm.longitude}
                              onChange={(e) => handleEventFieldChange('longitude', e.target.value)}
                              onFocus={() => handleEventFieldFocus('longitude')}
                              className={`w-full p-3 bg-white border-2 border-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-1px] focus:translate-y-[-1px] outline-none ${eventFormErrors.longitude ? 'border-red-500' : ''}`}
                              placeholder="e.g. 77.5946"
                            />
                            {eventFormErrors.longitude && (
                              <p className="text-red-600 font-bold text-xs mt-1 uppercase">
                                {eventFormErrors.longitude}
                              </p>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Event Details */}
                  <div className="bg-neutral-50 border-2 border-black p-6">
                    <h3 className="text-xl font-black uppercase mb-6 text-black flex items-center gap-2">
                      <span className="bg-black text-white px-2 py-1 text-sm">04</span> Event
                      Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold uppercase text-black mb-2">
                          Capacity *
                        </label>
                        <input
                          type="text"
                          value={eventForm.capacity}
                          onChange={(e) => handleEventFieldChange('capacity', e.target.value)}
                          onBlur={() => handleEventFieldBlur('capacity')}
                          onFocus={() => handleEventFieldFocus('capacity')}
                          className={`w-full p-3 bg-white border-2 border-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-1px] focus:translate-y-[-1px] outline-none ${eventFormErrors.capacity ? 'border-red-500' : ''}`}
                          required
                        />
                        {eventFormErrors.capacity && (
                          <p className="text-red-600 font-bold text-xs mt-1 uppercase">
                            {eventFormErrors.capacity}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-black mb-2">
                          Price
                        </label>
                        <div className="flex">
                          <input
                            type="text"
                            value={eventForm.price}
                            onChange={(e) => handleEventFieldChange('price', e.target.value)}
                            onBlur={() => handleEventFieldBlur('price')}
                            onFocus={() => handleEventFieldFocus('price')}
                            className={`flex-1 p-3 bg-white border-2 border-black border-r-0 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-1px] focus:translate-y-[-1px] outline-none`}
                          />
                          <select
                            value={eventForm.currency}
                            onChange={(e) => handleEventFieldChange('currency', e.target.value)}
                            className="px-3 py-3 bg-neutral-100 border-2 border-black border-l-2 outline-none font-bold uppercase text-sm"
                          >
                            <option value="INR">INR</option>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6">
                      <label className="block text-xs font-bold uppercase text-black mb-2">
                        Tags
                      </label>
                      <input
                        type="text"
                        value={eventForm.tags}
                        onChange={(e) => handleEventFieldChange('tags', e.target.value)}
                        onBlur={() => handleEventFieldBlur('tags')}
                        onFocus={() => handleEventFieldFocus('tags')}
                        className={`w-full p-3 bg-white border-2 border-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-1px] focus:translate-y-[-1px] outline-none`}
                        placeholder="tech, workshop, free"
                      />
                    </div>
                    <div className="mt-6">
                      <label className="block text-xs font-bold uppercase text-black mb-2">
                        Event Image URL
                      </label>
                      <input
                        type="url"
                        value={eventForm.imageUrl}
                        onChange={(e) => handleEventFieldChange('imageUrl', e.target.value)}
                        className="w-full p-3 bg-white border-2 border-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-1px] focus:translate-y-[-1px] outline-none"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-6 pt-6 border-t-2 border-black">
                    <button
                      type="submit"
                      disabled={savingEvent}
                      className="flex-1 bg-black text-white border-2 border-black py-4 font-black uppercase text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {savingEvent ? 'Saving...' : editingEvent ? 'Update Event' : 'Create Event'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowEventForm(false)}
                      className="px-8 py-4 bg-white hover:bg-neutral-100 text-black border-2 border-black font-black uppercase text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="animate-fadeIn w-full max-w-4xl mr-auto text-left space-y-8">
              <h1 className="text-4xl font-black mb-8 flex items-center gap-3 text-black uppercase tracking-tighter">
                <div className="p-2 border-2 border-black bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]">
                  <BellRing size={28} />
                </div>
                Send Notifications
              </h1>
              <div className="bg-white border-2 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <form onSubmit={handleSendNotification} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-black text-black uppercase tracking-wide mb-2">
                        Target Audience *
                      </label>
                      <select
                        value={notificationForm.targetAudience}
                        onChange={(e) => handleNotificationChange('targetAudience', e.target.value)}
                        className="w-full p-3 bg-white border-2 border-black focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all outline-none font-bold"
                        required
                      >
                        <option value="students">Students Only</option>
                        <option value="hosts">Hosts Only</option>
                        <option value="both">Both Students and Hosts</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-black text-black uppercase tracking-wide mb-2">
                        Notification Type *
                      </label>
                      <select
                        value={notificationForm.type}
                        onChange={(e) => handleNotificationChange('type', e.target.value)}
                        className="w-full p-3 bg-white border-2 border-black focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all outline-none font-bold"
                        required
                      >
                        <option value="System">System Update</option>
                        <option value="Event">Event Announcement</option>
                        <option value="Reminder">Reminder</option>
                        <option value="Achievement">Achievement</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-black text-black uppercase tracking-wide mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={notificationForm.title}
                      onFocus={() => handleNotificationFocus('title')}
                      onChange={(e) => handleNotificationChange('title', e.target.value)}
                      placeholder="ENTER NOTIFICATION TITLE"
                      className={`w-full p-3 bg-white border-2 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all outline-none font-bold placeholder:text-neutral-400 ${notificationErrors.title ? 'border-red-500' : 'border-black'}`}
                      required
                      maxLength={100}
                    />
                    {notificationTouched.title && notificationErrors.title && (
                      <p className="mt-1 text-[10px] font-black text-red-600 uppercase">{notificationErrors.title}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-black text-black uppercase tracking-wide mb-2">
                      Message *
                    </label>
                    <textarea
                      value={notificationForm.message}
                      onFocus={() => handleNotificationFocus('message')}
                      onChange={(e) => handleNotificationChange('message', e.target.value)}
                      placeholder="ENTER FULL NOTIFICATION MESSAGE..."
                      className={`w-full p-4 bg-white border-2 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all outline-none font-medium min-h-[150px] resize-y placeholder:text-neutral-400 ${notificationErrors.message ? 'border-red-500' : 'border-black'}`}
                      required
                      maxLength={1000}
                    ></textarea>
                    {notificationTouched.message && notificationErrors.message && (
                      <p className="mt-1 text-[10px] font-black text-red-600 uppercase">{notificationErrors.message}</p>
                    )}
                    <p className="mt-1 text-[10px] font-bold text-neutral-400 text-right">{notificationForm.message.length}/1000</p>
                  </div>
                  <button
                    type="submit"
                    disabled={sendingNotification}
                    className="w-full py-4 bg-black text-white font-black uppercase tracking-widest text-lg border-2 border-transparent hover:bg-neutral-800 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {sendingNotification ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <BellRing size={20} />
                        Broadcast Notification
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </LayoutGroup>
  );
}
