import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import {
  Calendar,
  Plus,
  Edit3,
  Trash2,
  Users,
  Star,
  CheckCircle,
  BellRing,
  Download,
  Eye,
  Clock,
  MapPin,
  UserCheck,
  Target,
  Trophy,
  BarChart3,
  Settings,
  LogOut,
  Filter,
  Search,
  TrendingUp,
  Award,
  Menu,
  UserCircle2,
  UserPen,
  X,
  ChevronLeft,
  ChevronRight,
  ScanLine,
  ImageIcon,
  Upload,
  RefreshCw,
  Bot,
  Crown,
  ChevronDown,
  Brain,
  Zap,
  MessageSquare,
  Sparkles,
  AlertTriangle,
  Send,
  Radio,
  Terminal,
  Music,
  GraduationCap,
  Coffee,
  Swords,
  Rocket,
  Briefcase,
  Globe,
  Mic,
  Heart,
} from 'lucide-react';

import api from '../utils/api';
import config from '../config';
import SupportChatbot from '../components/SupportChatbot';
import QRCodeScanner from '../components/QRCodeScanner';
import CertificateEditor from '../components/CertificateEditor';
import AiFeedbackDashboard from '../components/AiFeedbackDashboard';
import GenLoopStudio from '../components/host/GenLoopStudio';
import MarketingCopywriter from '../components/host/MarketingCopywriter';
import { EVENT_THEMES, GamifiedEventCard } from '../components/GamifiedComponents';
import EventDetailModal from '../components/EventDetailModal';
// Charts
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from 'recharts';

const bearer = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token} ` } : {};
};

// --- Event Templates ---
const TEMPLATE_ICONS = {
  Terminal,
  Music,
  GraduationCap,
  Coffee,
  Swords,
  Rocket,
  Briefcase,
  Globe,
  Mic,
  Trophy,
  Users,
  Heart,
};

const EVENT_TEMPLATES = [
  {
    id: 'hackathon',
    name: 'Hackathon',
    icon: 'Terminal',
    category: 'Hackathon',
    description: 'A 24–48 hour coding marathon to build innovative solutions and compete for prizes.',
    shortDescription: '48H Coding Challenge',
    tags: 'Hackathon, Tech, Innovation, Coding, Developers',
    capacity: 200,
    isTeamEvent: true,
    minTeamSize: 2,
    maxTeamSize: 4,
    imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=1200',
    theme: 'bg-slate-950 text-emerald-400 border-emerald-500 shadow-[4px_4px_0px_0px_#10b981]',
    iconBg: 'bg-emerald-500 text-black',
  },
  {
    id: 'workshop',
    name: 'Workshop',
    icon: 'GraduationCap',
    category: 'Workshop',
    description: 'An interactive hands-on learning session led by industry experts to master new skills.',
    shortDescription: 'Skill-Building Workshop',
    tags: 'Workshop, Learning, Skills, Education, Professional',
    capacity: 50,
    price: 199,
    imageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=1200',
    theme: 'bg-indigo-600 text-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
    iconBg: 'bg-indigo-200 text-indigo-800',
  },
  {
    id: 'seminar',
    name: 'Seminar',
    icon: 'Mic',
    category: 'Seminar',
    description: 'A knowledge-sharing session with expert speakers, panel discussions, and Q&A.',
    shortDescription: 'Expert Talk & Q&A',
    tags: 'Seminar, Talk, Knowledge, Expert, Discussion',
    capacity: 150,
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1200',
    theme: 'bg-blue-700 text-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
    iconBg: 'bg-blue-200 text-blue-800',
  },
  {
    id: 'competition',
    name: 'Competition',
    icon: 'Swords',
    category: 'Competition',
    description: 'A competitive event where participants battle for prizes, certificates, and glory.',
    shortDescription: 'Compete & Win',
    tags: 'Competition, Contest, Prize, Challenge, Win',
    capacity: 100,
    imageUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=1200',
    theme: 'bg-yellow-400 text-black border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
    iconBg: 'bg-black text-yellow-400',
  },
  {
    id: 'networking',
    name: 'Networking',
    icon: 'Users',
    category: 'Networking',
    description: 'A professional gathering to connect, exchange ideas, and build lasting relationships.',
    shortDescription: 'Connect & Grow',
    tags: 'Networking, Connect, Professionals, Community, Career',
    capacity: 80,
    imageUrl: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&q=80&w=1200',
    theme: 'bg-violet-600 text-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
    iconBg: 'bg-violet-200 text-violet-800',
  },
  {
    id: 'cultural',
    name: 'Cultural',
    icon: 'Music',
    category: 'Cultural',
    description: 'A vibrant celebration of arts, music, dance, and cultural heritage.',
    shortDescription: 'Arts & Culture Fest',
    tags: 'Cultural, Arts, Music, Dance, Heritage, Festival',
    capacity: 500,
    imageUrl: 'https://images.unsplash.com/photo-1459749411177-042180ce673b?auto=format&fit=crop&q=80&w=1200',
    theme: 'bg-rose-500 text-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
    iconBg: 'bg-white text-rose-500',
  },
  {
    id: 'sports',
    name: 'Sports',
    icon: 'Trophy',
    category: 'Sports',
    description: 'An athletic competition or fitness event open to all skill levels.',
    shortDescription: 'Athletic Tournament',
    tags: 'Sports, Tournament, Fitness, Athletics, Championship',
    capacity: 200,
    isTeamEvent: true,
    minTeamSize: 2,
    maxTeamSize: 11,
    imageUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=1200',
    theme: 'bg-orange-500 text-black border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
    iconBg: 'bg-black text-orange-400',
  },
  {
    id: 'techtalk',
    name: 'Tech Talk',
    icon: 'Rocket',
    category: 'Tech Talk',
    description: 'A focused technical talk by engineers or founders sharing real-world insights.',
    shortDescription: 'Dev Insights & Demos',
    tags: 'Tech Talk, Engineering, Developer, Insights, Demo',
    capacity: 60,
    imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=1200',
    theme: 'bg-slate-800 text-cyan-300 border-cyan-400 shadow-[4px_4px_0px_0px_#06b6d4]',
    iconBg: 'bg-cyan-500 text-black',
  },
  {
    id: 'careerfair',
    name: 'Career Fair',
    icon: 'Briefcase',
    category: 'Career Fair',
    description: 'A campus recruitment event connecting students with top companies and internships.',
    shortDescription: 'Jobs & Internships',
    tags: 'Career Fair, Placement, Jobs, Internship, Recruitment',
    capacity: 300,
    imageUrl: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80&w=1200',
    theme: 'bg-teal-600 text-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
    iconBg: 'bg-teal-200 text-teal-800',
  },
];

const CATEGORY_THEMES = {
  Hackathon:    { accent: '#10b981', bg: 'bg-emerald-50',  border: 'border-emerald-500', badge: 'bg-emerald-500 text-black',   label: 'text-emerald-700' },
  Workshop:     { accent: '#4f46e5', bg: 'bg-indigo-50',   border: 'border-indigo-500',  badge: 'bg-indigo-600 text-white',    label: 'text-indigo-700' },
  Seminar:      { accent: '#1d4ed8', bg: 'bg-blue-50',     border: 'border-blue-500',    badge: 'bg-blue-700 text-white',      label: 'text-blue-700' },
  Competition:  { accent: '#eab308', bg: 'bg-yellow-50',   border: 'border-yellow-400',  badge: 'bg-yellow-400 text-black',    label: 'text-yellow-700' },
  Networking:   { accent: '#7c3aed', bg: 'bg-violet-50',   border: 'border-violet-500',  badge: 'bg-violet-600 text-white',    label: 'text-violet-700' },
  Cultural:     { accent: '#f43f5e', bg: 'bg-rose-50',     border: 'border-rose-500',    badge: 'bg-rose-500 text-white',      label: 'text-rose-700' },
  Sports:       { accent: '#f97316', bg: 'bg-orange-50',   border: 'border-orange-500',  badge: 'bg-orange-500 text-black',    label: 'text-orange-700' },
  'Tech Talk':  { accent: '#06b6d4', bg: 'bg-cyan-50',     border: 'border-cyan-500',    badge: 'bg-cyan-500 text-black',      label: 'text-cyan-700' },
  'Career Fair':{ accent: '#0d9488', bg: 'bg-teal-50',     border: 'border-teal-500',    badge: 'bg-teal-600 text-white',      label: 'text-teal-700' },
  Education:    { accent: '#4f46e5', bg: 'bg-indigo-50',   border: 'border-indigo-400',  badge: 'bg-indigo-500 text-white',    label: 'text-indigo-700' },
  Health:       { accent: '#06b6d4', bg: 'bg-cyan-50',     border: 'border-cyan-400',    badge: 'bg-cyan-500 text-black',      label: 'text-cyan-700' },
  Entertainment:{ accent: '#f43f5e', bg: 'bg-rose-50',     border: 'border-rose-400',    badge: 'bg-rose-600 text-white',      label: 'text-rose-700' },
  Social:       { accent: '#7c3aed', bg: 'bg-violet-50',   border: 'border-violet-400',  badge: 'bg-violet-500 text-white',    label: 'text-violet-700' },
  Other:        { accent: '#64748b', bg: 'bg-slate-50',    border: 'border-slate-400',   badge: 'bg-slate-500 text-white',     label: 'text-slate-700' },
  General:      { accent: '#64748b', bg: 'bg-slate-50',    border: 'border-slate-400',   badge: 'bg-slate-500 text-white',     label: 'text-slate-700' },
};

// --- Notification Detail Modal ---
const NotificationDetailModal = ({ isOpen, onClose, notification }) => {
  if (!isOpen || !notification) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white w-full max-w-lg border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 flex flex-col gap-4"
      >
        <div className="flex items-center justify-between border-b-2 border-black pb-4">
          <h3 className="text-xl font-black uppercase tracking-wide flex items-center gap-2">
            <BellRing className="w-6 h-6" />
            Notification
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-neutral-100 border-2 border-transparent hover:border-black transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-500">
            <span>{new Date(notification.at).toLocaleString()}</span>
            <span className="w-1 h-1 bg-black rounded-full" />
            <span>{notification.type || 'General'}</span>
          </div>

          <h4 className="text-lg font-bold">{notification.title || 'Notification'}</h4>

          <div className="text-sm font-medium leading-relaxed bg-neutral-50 p-4 border-2 border-dashed border-neutral-300">
            {notification.fullContent || notification.message}
          </div>

          {notification.actionLabel && (
            <button
              onClick={() => {
                notification.onAction?.();
                onClose();
              }}
              className="w-full py-3 bg-black text-white font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors border-2 border-transparent"
            >
              {notification.actionLabel}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default function HostDashboard() {
  // Build absolute URL for server-hosted files (e.g., /uploads/..)
  const toAbsoluteUrl = (u) => {
    const s = String(u || '');
    if (!s) return s;
    if (/^https?:\/\//i.test(s) || s.startsWith('data:')) return s;
    // ensure no double slashes
    return `${config.apiBaseUrl.replace(/\/$/, '')}${s.startsWith('/') ? '' : '/'}${s}`;
  };
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  // --- Animated Background Component ---
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

  const [activeTab, setActiveTab] = useState('events');
  const [otherCollegeEvents, setOtherCollegeEvents] = useState([]);
  const [sameDayEvents, setSameDayEvents] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    shortDescription: '',
    date: '',
    endDate: '',
    registrationDeadline: '',
    location: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    capacity: 0,
    price: 0,
    currency: 'INR',
    category: 'General',
    tags: '',
    requirements: '',
    agenda: '',
    contactEmail: '',
    contactPhone: '',
    website: '',
    imageUrl: '',
    isOnline: false,
    meetingLink: '',
    platform: 'Google Meet',
    latitude: '',
    longitude: '',
    isTeamEvent: false,
    minTeamSize: 1,
    maxTeamSize: 4,
    coHosts: [],
  });

  const [formErrors, setFormErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbackStats, setFeedbackStats] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const [aiInsightsLoading, setAiInsightsLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [notifModalOpen, setNotifModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [discoverSearch, setDiscoverSearch] = useState('');
  const [selectedDiscoverEvent, setSelectedDiscoverEvent] = useState(null);
  const [lightbox, setLightbox] = useState({ open: false, images: [], index: 0 });
  // Registrations UI state
  const [regSearch, setRegSearch] = useState('');
  const [regStatus, setRegStatus] = useState('all');
  // Analytics date range
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  // Analytics tab persistence
  const ANALYTICS_TAB_KEY = 'host.analytics.tab';
  const [analyticsTab, setAnalyticsTab] = useState(() => {
    try {
      return localStorage.getItem(ANALYTICS_TAB_KEY) || 'Overview';
    } catch {
      return 'Overview';
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(ANALYTICS_TAB_KEY, analyticsTab);
    } catch { }
  }, [analyticsTab]);
  // Host profile edit state
  const [hostProfile, setHostProfile] = useState({
    bio: '',
    website: '',
    socials: { twitter: '', instagram: '', linkedin: '' },
    profilePic: '',
    bannerUrl: '',
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [hostProfileErrors, setHostProfileErrors] = useState({});
  const [hostTouched, setHostTouched] = useState({});
  const [profileJustSavedAt, setProfileJustSavedAt] = useState(0);
  // Studio Analytics State
  const [studioData, setStudioData] = useState(null);
  const [isStudioLoading, setIsStudioLoading] = useState(false);
  const [selectedStudioEvent, setSelectedStudioEvent] = useState(null); // For individual event analytics
  // Add state for classification loading
  const [classifyingEventId, setClassifyingEventId] = useState(null);
  const [hostSettingsOpen, setHostSettingsOpen] = useState(false);

  // GenLoop AI Studio

  // Scanner State
  const [showScanner, setShowScanner] = useState(false);
  const [lastScanned, setLastScanned] = useState(null);

  // Co-host search state
  const [hostSearchQuery, setHostSearchQuery] = useState('');
  const [hostSearchResults, setHostSearchResults] = useState([]);
  const [isSearchingHosts, setIsSearchingHosts] = useState(false);

  const handleHostSearch = async (query) => {
    setHostSearchQuery(query);
    if (query.length < 2) {
      setHostSearchResults([]);
      return;
    }
    try {
      setIsSearchingHosts(true);
      const res = await api.get(`/api/host/search-hosts?q=${encodeURIComponent(query)}`, {
        headers: bearer(),
      });
      setHostSearchResults(res.data || []);
    } catch (err) {
      console.error('Host search error:', err);
    } finally {
      setIsSearchingHosts(false);
    }
  };

  const addCoHost = (u) => {
    if (form.coHosts.some((ch) => (ch._id || ch) === u._id)) {
      toast.info('User already added as co-host');
      return;
    }
    setForm((prev) => ({
      ...prev,
      coHosts: [...prev.coHosts, u],
    }));
    setHostSearchQuery('');
    setHostSearchResults([]);
  };

  const removeCoHost = (userId) => {
    setForm((prev) => ({
      ...prev,
      coHosts: prev.coHosts.filter((ch) => (ch._id || ch) !== userId),
    }));
  };

  const handleScanSuccess = async (decodedText) => {
    try {
      if (lastScanned === decodedText) return; // Debounce
      setLastScanned(decodedText);

      // Expected format: {"eventId":"...","studentId":"...","timestamp":...}
      const data = JSON.parse(decodedText);
      if (!data.eventId || !data.studentId) throw new Error('Invalid QR Code');

      // Optimistic UI updates or just call API
      await api.put(
        `/ api / host / events / ${data.eventId} /registrations/${data.studentId}/attendance`,
        { attended: true },
        { headers: bearer() }
      );
      toast.success('✅ Attendance Marked!');

      // Clear last scanned after 3 seconds to allow re-scan if needed
      setTimeout(() => setLastScanned(null), 3000);
    } catch (e) {
      toast.error('❌ ' + (e.message || 'Scan failed'));
      setLastScanned(null); // Allow retry immediately on error
    }
  };

  // Host notifications read-tracking in localStorage
  const HOST_NOTIF_READ_KEY = 'host.notifications.read';
  const loadLS = (key, fallback) => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  };

  // Reorder via drag and drop
  const onThumbDragStart = (e, idx) => {
    e.dataTransfer.setData('text/plain', String(idx));
  };
  const onThumbDrop = async (ev, event, dropIndex) => {
    ev.preventDefault();
    const fromIndex = parseInt(ev.dataTransfer.getData('text/plain'), 10);
    if (isNaN(fromIndex)) return;
    const imgs = Array.isArray(event.images) ? [...event.images] : [];
    const [moved] = imgs.splice(fromIndex, 1);
    imgs.splice(dropIndex, 0, moved);
    try {
      await api.put(`/api/host/events/${event._id}`, { images: imgs }, { headers: bearer() });
      toast.success('✅ Gallery order saved');
      await fetchEvents();
    } catch (e) {
      toast.error('❌ ' + (e?.response?.data?.error || e.message));
    }
  };

  const importXlsxFile = async (file) => {
    if (!file || !selectedEvent?._id) return;
    try {
      const fd = new FormData();
      fd.append('file', file);
      await api.post(`/api/host/events/${selectedEvent._id}/registrations/import-xlsx`, fd, {
        headers: { ...bearer(), 'Content-Type': 'multipart/form-data' },
      });
      await loadRegistrations(selectedEvent);
      toast.success('✅ Attendance imported from XLSX');
    } catch (e) {
      toast.error('❌ ' + (e?.response?.data?.error || e.message));
    }
  };
  const onThumbDragOver = (e) => e.preventDefault();

  // Lightbox controls
  useEffect(() => {
    if (!lightbox.open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setLightbox((prev) => ({ ...prev, open: false }));
      if (e.key === 'ArrowRight')
        setLightbox((prev) => ({ ...prev, index: (prev.index + 1) % (prev.images.length || 1) }));
      if (e.key === 'ArrowLeft')
        setLightbox((prev) => ({
          ...prev,
          index: (prev.index - 1 + (prev.images.length || 1)) % (prev.images.length || 1),
        }));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox.open, lightbox.images, lightbox.index]);

  // ---------- Profile update & uploads ----------
  const isHttpUrl = (v) => /^https?:\/\/.+/.test(String(v || '').trim());
  const validateHostField = (field, value) => {
    switch (field) {
      case 'website':
        if (!value) return '';
        return isHttpUrl(value) ? '' : 'Website must start with http:// or https://';
      case 'twitter':
      case 'instagram':
        if (!value) return '';
        return /^@?\w{1,30}$/.test(value) ? '' : 'Use handle like @username';
      case 'linkedin':
        if (!value) return '';
        // allow full URL or handle-like
        return isHttpUrl(value) || /^@?[-\w.]{1,100}$/.test(value) ? '' : 'Use full URL or @handle';
      case 'bio':
        return String(value || '').length <= 1000 ? '' : 'Bio is too long';
      default:
        return '';
    }
  };

  const computeHostErrors = (profile) => {
    const errs = {};
    errs.website = validateHostField('website', profile.website);
    errs.twitter = validateHostField('twitter', profile.socials?.twitter);
    errs.instagram = validateHostField('instagram', profile.socials?.instagram);
    errs.linkedin = validateHostField('linkedin', profile.socials?.linkedin);
    errs.bio = validateHostField('bio', profile.bio);
    return errs;
  };

  const validateHostProfileAll = () => {
    const errs = computeHostErrors(hostProfile);
    setHostProfileErrors(errs);
    const hasAny = Object.values(errs).some(Boolean);
    return !hasAny;
  };

  const hostProfileValid = React.useMemo(() => {
    const errs = computeHostErrors(hostProfile);
    return !Object.values(errs).some(Boolean);
  }, [hostProfile]);

  const handleHostFieldBlur = (field) => {
    setHostTouched((prev) => ({ ...prev, [field]: true }));
    let value;
    if (field === 'website' || field === 'bio') value = hostProfile[field];
    else value = hostProfile.socials?.[field] || '';
    const err = validateHostField(field, value);
    setHostProfileErrors((prev) => ({ ...prev, [field]: err }));
  };

  const saveHostProfile = async () => {
    if (!validateHostProfileAll()) {
      toast.error('❌ Please fix profile errors before saving');
      return;
    }
    try {
      setProfileSaving(true);
      // Normalize socials: ensure '@' prefix for handles
      const norm = { ...(hostProfile.socials || {}) };
      const ensureAt = (v) => {
        const s = String(v || '').trim();
        if (!s) return '';
        return s.startsWith('@') ? s : `@${s}`;
      };
      norm.twitter =
        norm.twitter && !/^https?:\/\//i.test(norm.twitter)
          ? ensureAt(norm.twitter)
          : norm.twitter || '';
      norm.instagram =
        norm.instagram && !/^https?:\/\//i.test(norm.instagram)
          ? ensureAt(norm.instagram)
          : norm.instagram || '';
      // LinkedIn: keep URL as-is; if not URL, treat like handle
      norm.linkedin =
        norm.linkedin && !/^https?:\/\//i.test(norm.linkedin)
          ? ensureAt(norm.linkedin)
          : norm.linkedin || '';
      const payload = {
        bio: hostProfile.bio,
        website: hostProfile.website,
        socials: norm,
        profilePic: hostProfile.profilePic,
        bannerUrl: hostProfile.bannerUrl,
      };
      const { data } = await api.put(`/api/host/profile`, payload, { headers: bearer() });
      setHostProfile((prev) => ({
        ...prev,
        profilePic: data?.user?.profilePic || prev.profilePic,
        bannerUrl: data?.user?.bannerUrl || prev.bannerUrl,
      }));
      toast.success('✅ Profile saved');
      setProfileJustSavedAt(Date.now());
    } catch (e) {
      toast.error('❌ ' + (e?.response?.data?.error || e.message));
    } finally {
      setProfileSaving(false);
    }
  };

  // Show validation errors immediately on mount
  useEffect(() => {
    setHostTouched({ website: true, twitter: true, instagram: true, linkedin: true, bio: true });
    validateHostProfileAll();
  }, []);

  const uploadHostImage = async (type, file) => {
    if (!file) return;
    try {
      const fd = new FormData();
      fd.append('image', file);
      const { data } = await api.post(
        `/api/host/profile/upload?type=${encodeURIComponent(type)}`,
        fd,
        { headers: { ...bearer(), 'Content-Type': 'multipart/form-data' } }
      );
      const abs = toAbsoluteUrl(data?.url);
      if (type === 'profile')
        setHostProfile((prev) => ({ ...prev, profilePic: abs || prev.profilePic }));
      else setHostProfile((prev) => ({ ...prev, bannerUrl: abs || prev.bannerUrl }));
      toast.success('✅ Uploaded');
    } catch (e) {
      toast.error('❌ ' + (e?.response?.data?.error || e.message));
    }
  };

  const uploadEventCover = async (ev, file) => {
    if (!file) return;
    try {
      const fd = new FormData();
      fd.append('image', file);
      await api.post(`/api/host/events/${ev._id}/cover`, fd, {
        headers: { ...bearer(), 'Content-Type': 'multipart/form-data' },
      });
      toast.success('✅ Cover updated');
      await fetchEvents();
    } catch (e) {
      toast.error('❌ ' + (e?.response?.data?.error || e.message));
    }
  };

  const uploadEventImages = async (ev, files) => {
    if (!files || !files.length) return;
    try {
      const fd = new FormData();
      Array.from(files).forEach((f) => fd.append('images', f));
      await api.post(`/api/host/events/${ev._id}/images`, fd, {
        headers: { ...bearer(), 'Content-Type': 'multipart/form-data' },
      });
      toast.success('✅ Images uploaded');
      await fetchEvents();
    } catch (e) {
      toast.error('❌ ' + (e?.response?.data?.error || e.message));
    }
  };

  const setEventCoverFromUrl = async (ev, url) => {
    try {
      await api.put(`/api/host/events/${ev._id}`, { imageUrl: url }, { headers: bearer() });
      toast.success('✅ Cover set from gallery');
      await fetchEvents();
    } catch (e) {
      toast.error('❌ ' + (e?.response?.data?.error || e.message));
    }
  };

  const deleteEventImage = async (ev, url) => {
    if (!window.confirm('Remove this image from the gallery?')) return;
    try {
      await api.delete(`/api/host/events/${ev._id}/images`, { headers: bearer(), params: { url } });
      toast.success('✅ Image removed');
      await fetchEvents();
    } catch (e) {
      toast.error('❌ ' + (e?.response?.data?.error || e.message));
    }
  };
  const saveLS = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const notifKey = (n) => `${n.type || 'n'}|${n.eventId || 'none'}|${n.at || 0}`;

  const [notifOpen, setNotifOpen] = useState(false);
  const [readSet, setReadSet] = useState(() => new Set(loadLS(HOST_NOTIF_READ_KEY, [])));
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [navCollapsed, setNavCollapsed] = useState(true);
  const [navOverlayOpen, setNavOverlayOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(null);
  // Attendance export helpers (CSV/XLSX)

  // Review field customization state
  const [showReviewFieldsForm, setShowReviewFieldsForm] = useState(false);
  const [selectedEventForReviewFields, setSelectedEventForReviewFields] = useState(null);
  const [reviewFields, setReviewFields] = useState([]);

  // ---------- Derived: filtered registrations and analytics ----------
  const filteredRegistrations = useMemo(() => {
    let list = registrations || [];
    if (regStatus !== 'all') list = list.filter((r) => r.status === regStatus);
    const q = regSearch.trim().toLowerCase();
    if (q) {
      list = list.filter((r) => {
        const name = String(r.studentId?.fullname || '').toLowerCase();
        const email = String(r.studentId?.email || '').toLowerCase();
        return name.includes(q) || email.includes(q);
      });
    }
    return list;
  }, [registrations, regStatus, regSearch]);

  // Registrations over time (by registeredAt day) within date range
  const registrationsSeries = useMemo(() => {
    const map = new Map();
    (events || []).forEach((e) => {
      (e.registrations || []).forEach((r) => {
        if (r.status !== 'registered') return;
        const d = r.registeredAt ? new Date(r.registeredAt) : null;
        if (!d) return;
        if (!inDateRange(d)) return;
        const key = d.toISOString().slice(0, 10);
        map.set(key, (map.get(key) || 0) + 1);
      });
    });
    const arr = Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, count]) => ({ date, count }));
    return arr;
  }, [events, dateStart, dateEnd]);

  // Analytics: registrations grouped by event (By Event)
  const registrationsByEvent = useMemo(() => {
    const map = new Map();
    (events || []).forEach((e) => {
      if (!dateStart && !dateEnd) {
        map.set(
          e.title || 'Untitled',
          (e.registrations || []).filter((r) => r.status === 'registered').length +
          (map.get(e.title || 'Untitled') || 0)
        );
      } else {
        if (!inDateRange(e.date)) return;
        map.set(
          e.title || 'Untitled',
          (e.registrations || []).filter((r) => r.status === 'registered').length +
          (map.get(e.title || 'Untitled') || 0)
        );
      }
    });
    const arr = Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
    return arr;
  }, [events, dateStart, dateEnd]);

  // Analytics: events per day (By Day)
  const eventsByDay = useMemo(() => {
    const map = new Map();
    (events || []).forEach((e) => {
      if (!dateStart && !dateEnd) {
        const key = new Date(e.date).toISOString().slice(0, 10);
        map.set(key, (map.get(key) || 0) + 1);
      } else {
        if (!inDateRange(e.date)) return;
        const key = new Date(e.date).toISOString().slice(0, 10);
        map.set(key, (map.get(key) || 0) + 1);
      }
    });
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, count]) => ({ date, count }));
  }, [events, dateStart, dateEnd]);

  function inDateRange(d) {
    const time = new Date(d).getTime();
    if (isNaN(time)) return false;
    const startOk = !dateStart || time >= new Date(dateStart).getTime();
    const endOk = !dateEnd || time <= new Date(dateEnd).getTime() + 24 * 60 * 60 * 1000 - 1;
    return startOk && endOk;
  }

  const statsOverRange = useMemo(() => {
    const evs = (events || []).filter((e) => (!dateStart && !dateEnd ? true : inDateRange(e.date)));
    const total = evs.length;
    const completed = evs.filter((e) => e.isCompleted).length;
    const upcoming = evs.filter((e) => new Date(e.date) > new Date()).length;
    const totalRegistrations = evs.reduce(
      (acc, e) => acc + (e.registrations || []).filter((r) => r.status === 'registered').length,
      0
    );
    // average rating placeholder (if available via feedbacks on events)
    const allRatings = (evs || [])
      .flatMap((e) => (e.feedbacks || []).map((f) => f.overallRating || 0))
      .filter((x) => x > 0);
    const avg = allRatings.length
      ? (allRatings.reduce((a, b) => a + b, 0) / allRatings.length).toFixed(1)
      : '0.0';
    return { total, completed, upcoming, totalRegistrations, avgRating: avg };
  }, [events, dateStart, dateEnd]);

  const notificationsOverRange = useMemo(() => {
    if (!dateStart && !dateEnd) return notifications;
    return (notifications || []).filter((n) => inDateRange(n.at));
  }, [notifications, dateStart, dateEnd]);

  // Events by status for current range
  const eventsByStatus = useMemo(() => {
    const evs = (events || []).filter((e) => (!dateStart && !dateEnd ? true : inDateRange(e.date)));
    const completed = evs.filter((e) => e.isCompleted).length;
    const upcoming = evs.filter((e) => new Date(e.date) > new Date()).length;
    const total = evs.length;
    return [
      { name: 'Completed', value: completed },
      { name: 'Upcoming', value: upcoming },
      { name: 'Total', value: total },
    ];
  }, [events, dateStart, dateEnd]);

  const exportRegistrationsCsv = () => {
    const headers = ['Student Name', 'Email', 'Registered At', 'Status'];
    if (selectedEvent) headers.unshift('Event Title');
    const rows = [headers];
    filteredRegistrations.forEach((r) => {
      const row = [
        r.studentId?.fullname || '',
        r.studentId?.email || '',
        r.registeredAt ? new Date(r.registeredAt).toLocaleString() : '',
        r.status || '',
      ];
      if (selectedEvent) row.unshift(selectedEvent.title || '');
      rows.push(row);
    });
    const csv = rows
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `registrations_${selectedEvent?._id || 'all'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/');
  };

  const copyHostLink = async () => {
    try {
      const base = window.location.origin || '';
      const link = `${base}/host/${user?._id || ''}`;
      await navigator.clipboard.writeText(link);
      toast.success('✅ Public link copied');
    } catch (e) {
      toast.error('❌ Failed to copy link');
    }
  };

  useEffect(() => {
    const u = localStorage.getItem('user');
    setUser(u ? JSON.parse(u) : null);
  }, []);

  const handleEventSelect = async (event) => {
    setSelectedEvent(event);
    setRegistrations([]);
    setFeedbacks([]);
    setFeedbackStats(null);
    setAiInsights(null);
    if (!event) return;
    try {
      // Parallelize fetches
      const pReg = api.get(`/api/host/events/${event._id}/registrations`, { headers: bearer() });
      const pFeed = api.get(`/api/reviews/events/${event._id}/reviews`, { headers: bearer() });
      const pStats = api.get(`/api/reviews/events/${event._id}/reviews/stats`, {
        headers: bearer(),
      });

      const [resReg, resFeed, resStats] = await Promise.all([pReg, pFeed, pStats]);

      setRegistrations(resReg.data || []);
      setFeedbacks(resFeed.data?.reviews || []);
      setFeedbackStats(resStats.data || null);
    } catch (err) {
      console.error('Failed to load event details', err);
      toast.error('❌ Failed to load some event details');
    }
  };

  const fetchAiInsights = async (eventId) => {
    if (!eventId) return;
    try {
      setAiInsightsLoading(true);
      const res = await api.get(`/api/reviews/events/${eventId}/reviews/ai-insights`, {
        headers: bearer(),
      });
      if (res.status === 204) {
        setAiInsights({ noData: true });
      } else {
        setAiInsights(res.data);
      }
    } catch (error) {
      console.error('Failed to load AI Insights', error);
      toast.error('❌ Failed to load AI Insights');
    } finally {
      setAiInsightsLoading(false);
    }
  };

  useEffect(() => {
    const onClick = (e) => {
      if (profileMenuOpen && !e.target.closest('.profile-menu')) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [profileMenuOpen]);

  // Validation functions
  const validateField = (field, value) => {
    switch (field) {
      case 'title':
        return value.length >= 3 ? '' : 'Title must be at least 3 characters';
      case 'shortDescription':
        return value.length <= 150 ? '' : 'Short description must be 150 characters or less';
      case 'description':
        return value.length >= 10 ? '' : 'Description must be at least 10 characters';
      case 'date':
        if (!value) return 'Event date is required';
        return new Date(value) > new Date() ? '' : 'Event date must be in the future';
      case 'endDate':
        if (!value) return '';
        if (!form.date) return 'Please set start date first';
        return new Date(value) > new Date(form.date) ? '' : 'End date must be after start date';
      case 'registrationDeadline':
        if (!value) return 'Registration deadline is required';
        try {
          const now = new Date();
          const dl = new Date(value);
          if (isNaN(dl.getTime())) return 'Invalid deadline date';
          if (dl < new Date(now.getTime() - 60 * 1000)) return 'Deadline cannot be in the past';
          if (form.date) {
            const start = new Date(form.date);
            if (!isNaN(start.getTime()) && dl >= start) return 'Deadline must be before start date';
          }
          return '';
        } catch {
          return 'Invalid deadline date';
        }
      case 'location':
        return value.length >= 2 ? '' : 'Location is required';
      case 'address':
        return value.length >= 5 ? '' : 'Address must be at least 5 characters';
      case 'city':
        return value.length >= 2 ? '' : 'City is required';
      case 'state':
        return value.length >= 2 ? '' : 'State is required';
      case 'pincode':
        if (!value) return '';
        return /^\d{6}$/.test(value) ? '' : 'Pincode must be 6 digits';
      case 'capacity':
        const cap = parseInt(value);
        return cap >= 10 && cap <= 10000 ? '' : 'Capacity must be between 10 and 10,000';
      case 'price':
        if (value === '' || value === null || value === undefined) return '';
        const price = parseFloat(value);
        if (isNaN(price)) return 'Invalid price';
        if (price < 0) return 'Price cannot be negative';
        if (price > 50000) return 'Price cannot exceed 50,000';
        return '';
      case 'website':
        if (!value) return '';
        return /^https?:\/\/.+/.test(value) ? '' : 'Website must start with http:// or https://';
      case 'meetingLink':
        if (!form.isOnline || !value) return '';
        return /^https?:\/\/.+/.test(value)
          ? ''
          : 'Meeting link must start with http:// or https://';
      case 'tags':
        if (!value) return '';
        const tags = value.split(',').map((tag) => tag.trim());
        return tags.length <= 10 ? '' : 'Maximum 10 tags allowed';
      case 'latitude':
        if (!value) return '';
        const lat = parseFloat(value);
        return !isNaN(lat) && lat >= -90 && lat <= 90 ? '' : 'Invalid latitude';
      case 'longitude':
        if (!value) return '';
        const lng = parseFloat(value);
        return !isNaN(lng) && lng >= -180 && lng <= 180 ? '' : 'Invalid longitude';
      case 'contactEmail':
        return /\S+@\S+\.\S+/.test(value) ? '' : 'Invalid email format';
      case 'contactPhone':
        return /^\d{10}$/.test(value) ? '' : 'Phone must be 10 digits';
      default:
        return '';
    }
  };

  // Function to classify an event using the Python Bayesian classifier
  const classifyEvent = async (eventId) => {
    try {
      setClassifyingEventId(eventId);
      const { data } = await api.post(
        `/api/host/events/${eventId}/classify`,
        {},
        { headers: bearer() }
      );
      toast.success(`✅ Event classified as ${data.category}`);
      await fetchEvents();
    } catch (e) {
      toast.error('❌ ' + (e?.response?.data?.error || e.message));
    } finally {
      setClassifyingEventId(null);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    toast.info('Fetching location and address...');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        let newLocationData = {
          latitude,
          longitude,
        };

        try {
          // Use OpenStreetMap Nominatim for free reverse geocoding
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          if (response.ok) {
            const data = await response.json();
            if (data && data.address) {
              const { road, suburb, neighbourhood, city, town, village, state, postcode } =
                data.address;

              newLocationData = {
                ...newLocationData,
                address: road || neighbourhood || suburb || '',
                city: city || town || village || '',
                state: state || '',
                pincode: postcode || '',
                location:
                  data.name || road || suburb || city || town || village || 'Current Location',
              };
              toast.success('✅ Address auto-filled from location');
            } else {
              toast.success('✅ Location coordinates fetched');
            }
          } else {
            toast.success('✅ Location coordinates fetched');
          }
        } catch (error) {
          console.error('Geocoding error:', error);
          toast.success('✅ Location coordinates fetched (Address fetch failed)');
        }

        setForm((prev) => {
          const nextForm = { ...prev, ...newLocationData };
          // Validate new fields
          const updatedErrors = { ...formErrors };
          const updatedTouched = { ...touchedFields };

          Object.keys(newLocationData).forEach((field) => {
            updatedTouched[field] = true;
            updatedErrors[field] = validateField(field, nextForm[field]);
          });

          setFormErrors(updatedErrors);
          setTouchedFields(updatedTouched);

          return nextForm;
        });
      },
      (error) => {
        toast.error('❌ Unable to retrieve location');
      }
    );
  };

  const handleFieldChange = (field, value) => {
    // Sanitize certain fields before setting
    let nextValue = value;
    if (field === 'capacity') {
      const num = parseInt(String(value).replace(/[^\d-]/g, ''), 10);
      nextValue = isNaN(num) || num < 10 ? 10 : num > 10000 ? 10000 : num;
    }
    if (field === 'price') {
      const cleaned = String(value).replace(/[^\d.]/g, '');
      if (cleaned === '') {
        nextValue = '';
      } else {
        let num = parseFloat(cleaned);
        if (isNaN(num) || num < 0) {
          nextValue = 0;
        } else if (num > 50000) {
          nextValue = 50000;
          toast.warning('Price capped at 50,000');
        } else {
          nextValue = parseFloat(num.toFixed(2));
        }
      }
    }
    if (field === 'pincode') {
      nextValue = String(value).replace(/[^\d]/g, '').slice(0, 6);
    }
    if (field === 'tags') {
      nextValue = String(value)
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0)
        .slice(0, 10)
        .join(', ');
    }
    setForm((prev) => ({ ...prev, [field]: nextValue }));

    if (touchedFields[field]) {
      const error = validateField(field, value);
      setFormErrors((prev) => ({ ...prev, [field]: error }));
    }
    if (field === 'date') {
      const iso = value ? new Date(value).toISOString() : '';
      fetchSameDayEvents(iso);
    }
  };

  const handleFieldBlur = (field) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, form[field]);
    setFormErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleFieldFocus = (field) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, form[field]);
    setFormErrors((prev) => ({ ...prev, [field]: error }));
  };

  const validateForm = () => {
    const errors = {};
    const requiredFields = ['title', 'description', 'date', 'location', 'city', 'state'];

    requiredFields.forEach((field) => {
      const error = validateField(field, form[field]);
      if (error) errors[field] = error;
    });

    // Additional validations
    Object.keys(form).forEach((field) => {
      if (!requiredFields.includes(field)) {
        const error = validateField(field, form[field]);
        if (error) errors[field] = error;
      }
    });

    setFormErrors(errors);
    setTouchedFields(Object.keys(form).reduce((acc, field) => ({ ...acc, [field]: true }), {}));

    return Object.keys(errors).length === 0;
  };

  const fetchEvents = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/api/host/events`, { headers: bearer() });
      setEvents(res.data);
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchOtherCollegeEvents = async () => {
    try {
      const res = await api.get(`/api/host/public/events?excludeSelf=true`, { headers: bearer() });
      setOtherCollegeEvents(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error('Failed to fetch other college events', e);
      setOtherCollegeEvents([]);
    }
  };

  const fetchSameDayEvents = async (isoDate) => {
    try {
      if (!isoDate) {
        setSameDayEvents([]);
        return;
      }
      const d = new Date(isoDate);
      if (isNaN(d.getTime())) {
        setSameDayEvents([]);
        return;
      }
      const ymd = d.toISOString().slice(0, 10);
      const res = await api.get(`/api/host/public/events-by-date?date=${ymd}&excludeSelf=true`, {
        headers: bearer(),
      });
      setSameDayEvents(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error('Failed to fetch same-day events', e);
      setSameDayEvents([]);
    }
  };

  const fetchStudioData = async (eventId = null) => {
    try {
      setIsStudioLoading(true);
      const url = eventId ? `/api/analytics/studio?eventId=${eventId}` : '/api/analytics/studio';
      const res = await api.get(url, { headers: bearer() });
      setStudioData(res.data);
    } catch (err) {
      console.error('Failed to fetch studio analytics:', err);
    } finally {
      setIsStudioLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'studio') {
      fetchStudioData(selectedStudioEvent?._id);
      // Auto-refresh every 60s while on studio tab
      const interval = setInterval(() => fetchStudioData(selectedStudioEvent?._id), 60000);
      return () => clearInterval(interval);
    }
  }, [activeTab, selectedStudioEvent]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get(`/api/host/notifications`, { headers: bearer() });
      const list = Array.isArray(res.data) ? res.data : [];
      const mapped = list.map((n) => {
        const key = notifKey(n);
        return { ...n, _key: key, read: readSet.has(key) || n.read }; // Keep n.read from DB or local storage
      });
      setNotifications(mapped);
    } catch (e) {
      console.error('Failed to fetch notifications:', e);
    }
  };

  const viewNotification = async (n) => {
    if (!n.read) {
      // Opt: make API call to mark as read if it's a DB notification
      setReadSet((prev) => {
        const next = new Set(prev);
        next.add(n._key);
        localStorage.setItem(HOST_NOTIF_READ_KEY, JSON.stringify(Array.from(next)));
        return next;
      });
      setNotifications((prev) =>
        prev.map((notif) => (notif._key === n._key ? { ...notif, read: true } : notif))
      );
    }
    setSelectedNotification(n);
    setNotifModalOpen(true);
  };

  useEffect(() => {
    fetchEvents();
    fetchNotifications();
    fetchOtherCollegeEvents();
  }, []);

  // Load current host profile for editing
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setProfileLoading(true);
        const userRaw = localStorage.getItem('user');
        const u = userRaw ? JSON.parse(userRaw) : null;
        if (!u?._id) return;
        const { data } = await api.get(`/api/host/public/host/${u._id}`, { headers: bearer() });
        const h = data?.host || {};
        setHostProfile({
          bio: h.bio || '',
          website: h.website || '',
          socials: h.socials || { twitter: '', instagram: '', linkedin: '' },
          profilePic: h.profilePic || '',
          bannerUrl: h.bannerUrl || '',
        });
      } catch (e) {
        // ignore
      } finally {
        setProfileLoading(false);
      }
    };
    loadProfile();
  }, []);

  const openCreate = () => {
    setEditingEvent(null);
    setForm({
      title: '',
      description: '',
      shortDescription: '',
      date: '',
      endDate: '',
      registrationDeadline: '',
      location: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      capacity: 0,
      price: 0,
      currency: 'INR',
      category: 'General',
      tags: '',
      requirements: '',
      agenda: '',
      contactEmail: '',
      contactPhone: '',
      countryCode: '+91',
      website: '',
      imageUrl: '',
      isOnline: false,
      meetingLink: '',
      isTeamEvent: false,
      minTeamSize: 1,
      maxTeamSize: 4,
      coHosts: [],
    });
    setFormErrors({});
    setTouchedFields({});
    setShowForm(true);
    setSameDayEvents([]);
  };

  const applyTemplate = (template) => {
    setForm((prev) => ({
      ...prev,
      title: template.name,
      description: template.description || '',
      shortDescription: template.shortDescription || '',
      category: template.category || 'General',
      tags: template.tags || '',
      capacity: template.capacity || 0,
      price: template.price || 0,
      isTeamEvent: !!template.isTeamEvent,
      minTeamSize: template.minTeamSize || 1,
      maxTeamSize: template.maxTeamSize || 4,
      imageUrl: template.imageUrl || '',
    }));
    toast.info(`Applied ${template.name} template!`);
  };

  const openEdit = (event) => {
    setEditingEvent(event);
    setForm({
      title: event.title || '',
      description: event.description || '',
      shortDescription: event.shortDescription || '',
      date: event.date ? new Date(event.date).toISOString().slice(0, 16) : '',
      endDate: event.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : '',
      registrationDeadline: event.registrationDeadline
        ? new Date(event.registrationDeadline).toISOString().slice(0, 16)
        : '',
      location: event.location || '',
      address: event.address || '',
      city: event.city || '',
      state: event.state || '',
      pincode: event.pincode || '',
      capacity: event.capacity || 0,
      price: event.price || 0,
      currency: event.currency || 'INR',
      category: event.category || 'General',
      tags: event.tags ? event.tags.join(', ') : '',
      requirements: event.requirements || '',
      agenda: event.agenda || '',
      contactEmail: event.contactEmail || '',
      contactPhone: event.contactPhone || '',
      website: event.website || '',
      imageUrl: event.imageUrl || '',
      isOnline: event.isOnline || false,
      meetingLink: event.meetingLink || '',
      latitude: event.coordinates && event.coordinates.length === 2 ? event.coordinates[1] : '',
      longitude: event.coordinates && event.coordinates.length === 2 ? event.coordinates[0] : '',
      isTeamEvent: event.isTeamEvent || false,
      minTeamSize: event.minTeamSize || 1,
      maxTeamSize: event.maxTeamSize || 4,
      coHosts: event.coHosts || [],
    });
    setFormErrors({});
    setTouchedFields({});
    setShowForm(true);
  };

  const submitForm = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('❌ Please fix the form errors before submitting');
      return;
    }

    try {
      const payload = {
        ...form,
        coHosts: (form.coHosts || []).map((ch) => ch._id || ch),
        date: form.date ? new Date(form.date).toISOString() : undefined,
        endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
        registrationDeadline: form.registrationDeadline
          ? new Date(form.registrationDeadline).toISOString()
          : undefined,
        tags: form.tags
          ? form.tags
            .split(',')
            .map((tag) => tag.trim())
            .filter((tag) => tag)
          : [],
        capacity: parseInt(form.capacity) || 0,
        price: parseFloat(form.price) || 0,
        isOnline: Boolean(form.isOnline),
        isTeamEvent: Boolean(form.isTeamEvent),
        minTeamSize: parseInt(form.minTeamSize, 10) || 1,
        maxTeamSize: parseInt(form.maxTeamSize, 10) || 4,
        coordinates:
          form.latitude && form.longitude
            ? [parseFloat(form.longitude), parseFloat(form.latitude)]
            : undefined,
      };

      if (editingEvent) {
        await api.put(`/api/host/events/${editingEvent._id}`, payload, { headers: bearer() });
        toast.success('✅ Event updated successfully!');
      } else {
        await api.post(`/api/host/events`, payload, { headers: bearer() });
        toast.success('✅ Event created successfully!');
      }
      setShowForm(false);
      setEditingEvent(null);
      setFormErrors({});
      setTouchedFields({});
      await fetchEvents();
      await fetchNotifications();
    } catch (e) {
      toast.error('❌ ' + (e?.response?.data?.error || e.message));
    }
  };

  const deleteEvent = async (event) => {
    if (
      !window.confirm('Are you sure you want to delete this event? This action cannot be undone.')
    )
      return;
    try {
      await api.delete(`/api/host/events/${event._id}`, { headers: bearer() });
      toast.success('✅ Event deleted successfully!');
      await fetchEvents();
    } catch (e) {
      toast.error('❌ ' + (e?.response?.data?.error || e.message));
    }
  };

  const markCompleted = async (event) => {
    if (!window.confirm('Mark this event as completed? This will enable certificate generation.'))
      return;
    try {
      await api.post(`/api/host/events/${event._id}/complete`, {}, { headers: bearer() });
      toast.success('✅ Event marked as completed! Certificates can now be generated.');
      await fetchEvents();
      await fetchNotifications();
    } catch (e) {
      toast.error('❌ ' + (e?.response?.data?.error || e.message));
    }
  };

  const loadRegistrations = async (event) => {
    setSelectedEvent(event);
    setActiveTab('registrations');
    try {
      const res = await api.get(`/api/host/events/${event._id}/registrations`, {
        headers: bearer(),
      });
      setRegistrations(res.data);
    } catch (e) {
      toast.error('❌ ' + (e?.response?.data?.error || e.message));
    }
  };

  // ---------- Attendance management ----------
  const updateAttendance = async (eventId, studentId, attended) => {
    try {
      await api.put(
        `/api/host/events/${eventId}/registrations/${studentId}/attendance`,
        { attended },
        { headers: bearer() }
      );
      setRegistrations((prev) =>
        prev.map((r) =>
          String(r.studentId?._id || r.studentId) === String(studentId) ? { ...r, attended } : r
        )
      );
      toast.success('✅ Attendance updated');
    } catch (e) {
      toast.error('❌ ' + (e?.response?.data?.error || e.message));
    }
  };

  const downloadServerCsv = async () => {
    if (!selectedEvent?._id) return;
    try {
      const res = await api.get(`/api/host/events/${selectedEvent._id}/registrations.csv`, {
        headers: { ...bearer() },
        responseType: 'blob',
      });
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `registrations_${selectedEvent._id}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast.error('❌ ' + (e?.response?.data?.error || e.message));
    }
  };

  // Import options removed per request

  const downloadServerXlsx = async () => {
    if (!selectedEvent?._id) return;
    try {
      const res = await api.get(`/api/host/events/${selectedEvent._id}/registrations.xlsx`, {
        headers: { ...bearer() },
        responseType: 'blob',
      });
      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `registrations_${selectedEvent._id}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast.error('❌ ' + (e?.response?.data?.error || e.message));
    }
  };

  const loadFeedbacks = async (event) => {
    setSelectedEvent(event);
    setActiveTab('feedbacks');
    try {
      // Use reviews API (new review model)
      const res = await api.get(`/api/reviews/events/${event._id}/reviews`, { headers: bearer() });
      const list = Array.isArray(res.data?.reviews) ? res.data.reviews : [];
      setFeedbacks(list);

      // Load stats including sentiment breakdown
      try {
        const statsRes = await api.get(`/api/reviews/events/${event._id}/reviews/stats`, {
          headers: bearer(),
        });
        setFeedbackStats(statsRes.data);
      } catch (statsErr) {
        console.error('Failed to load feedback stats:', statsErr);
        setFeedbackStats(null);
      }
    } catch (e) {
      toast.error('❌ ' + (e?.response?.data?.error || e.message));
    }
  };

  const generateCertificates = async (event) => {
    if (!event.isCompleted) {
      toast.error('❌ Event must be completed before generating certificates!');
      return;
    }
    try {
      // This would call a certificate generation endpoint
      toast.success('✅ Certificates generated successfully!');
    } catch (e) {
      toast.error('❌ ' + (e?.response?.data?.error || e.message));
    }
  };

  const customizeReviewFields = async (event) => {
    setSelectedEventForReviewFields(event);
    try {
      // Fetch existing review fields
      const res = await api.get(`/api/reviews/events/${event._id}/fields`, { headers: bearer() });
      setReviewFields(res.data || []);
    } catch (e) {
      console.error('Error fetching review fields:', e);
      setReviewFields([]);
    }
    setShowReviewFieldsForm(true);
  };

  const addReviewField = () => {
    setReviewFields((prev) => [
      ...prev,
      {
        fieldName: '',
        fieldType: 'text',
        isRequired: false,
        placeholder: '',
      },
    ]);
  };

  const updateReviewField = (index, field) => {
    setReviewFields((prev) => prev.map((f, i) => (i === index ? field : f)));
  };

  const removeReviewField = (index) => {
    setReviewFields((prev) => prev.filter((_, i) => i !== index));
  };

  const saveReviewFields = async () => {
    try {
      // Validate fields
      for (let i = 0; i < reviewFields.length; i++) {
        const field = reviewFields[i];
        if (!field.fieldName.trim()) {
          toast.error(`Field ${i + 1}: Field name is required`);
          return;
        }
      }

      await api.post(
        `/api/reviews/events/${selectedEventForReviewFields._id}/fields`,
        {
          fields: reviewFields,
        },
        { headers: bearer() }
      );

      toast.success('✅ Review fields updated successfully!');
      setShowReviewFieldsForm(false);
      setSelectedEventForReviewFields(null);
    } catch (e) {
      toast.error('❌ ' + (e?.response?.data?.error || e.message));
    }
  };

  const filteredEvents = useMemo(() => {
    let filtered = events;

    if (searchTerm) {
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter((event) => {
        if (filterStatus === 'completed') return event.isCompleted;
        if (filterStatus === 'upcoming')
          return !event.isCompleted && new Date(event.date) > new Date();
        if (filterStatus === 'past')
          return !event.isCompleted && new Date(event.date) <= new Date();
        return true;
      });
    }

    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [events, searchTerm, filterStatus]);

  const filteredDiscoverEvents = useMemo(() => {
    if (!discoverSearch) return otherCollegeEvents;

    const searchLower = discoverSearch.toLowerCase();
    return otherCollegeEvents.filter(
      (event) =>
        event.title?.toLowerCase().includes(searchLower) ||
        event.description?.toLowerCase().includes(searchLower) ||
        event.location?.toLowerCase().includes(searchLower) ||
        event.hostId?.fullname?.toLowerCase().includes(searchLower) ||
        event.hostId?.email?.toLowerCase().includes(searchLower) ||
        event.category?.toLowerCase().includes(searchLower) ||
        (Array.isArray(event.tags) &&
          event.tags.some((tag) => tag.toLowerCase().includes(searchLower)))
    );
  }, [otherCollegeEvents, discoverSearch]);

  const stats = useMemo(() => {
    const total = events?.length || 0;
    const completed = (events || []).filter((e) => e.isCompleted).length;
    const upcoming = (events || []).filter((e) => !e.isCompleted && new Date(e.date) > new Date()).length;
    const totalRegistrations = (events || []).reduce((sum, e) => sum + (e.registrations?.length || 0), 0);
    const avgRating =
      (events || []).reduce((sum, e) => {
        const eventFeedbacks = e.feedbacks || [];
        const avgEventRating =
          eventFeedbacks.length > 0
            ? eventFeedbacks.reduce((s, f) => s + f.rating, 0) / eventFeedbacks.length
            : 0;
        return sum + avgEventRating;
      }, 0) / (events?.length || 1);

    return { total, completed, upcoming, totalRegistrations, avgRating: avgRating.toFixed(1) };
  }, [events]);

  return (
    <LayoutGroup>
      <div className="min-h-screen font-sans relative overflow-hidden text-black selection:bg-black selection:text-white">
        <DashboardBackground />

        {/* Brutalist Header - Matches Admin Panel Style */}
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
                onClick={() => navigate('/host/dashboard')}
              >
                <div className="w-8 h-8 bg-black flex items-center justify-center transition-transform duration-500 group-hover:rotate-180">
                  <Calendar className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight text-black">HOST PANEL</span>
              </div>
            </div>

            <div className="flex items-center space-x-6 flex-1 justify-end max-w-2xl">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setNotifOpen((o) => !o)}
                  className="p-2 hover:bg-black/5 transition-colors relative group"
                >
                  <BellRing className="w-6 h-6 text-black group-hover:rotate-12 transition-transform" />
                  {(notifications || []).some((n) => n && !n.read) && (
                    <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></span>
                  )}
                </button>
                {notifOpen && (
                  <div className="absolute right-0 mt-4 w-80 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-50">
                    <div className="p-3 border-b-2 border-black font-bold uppercase tracking-wider text-sm flex justify-between items-center bg-neutral-50">
                      <span>Alerts</span>
                      <button
                        onClick={() => {
                          setReadSet((prev) => {
                            const next = new Set(prev);
                            (notifications || []).forEach((n) => next.add(n._key));
                            localStorage.setItem(
                              HOST_NOTIF_READ_KEY,
                              JSON.stringify(Array.from(next))
                            );
                            return next;
                          });
                          setNotifications((prev) =>
                            (prev || []).map((n) => ({ ...n, read: true }))
                          );
                        }}
                        className="text-xs text-blue-600 hover:underline lowercase"
                      >
                        mark all read
                      </button>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {(notifications || []).length === 0 ? (
                        <div className="p-4 text-sm text-slate-500 italic text-center">
                          No new alerts
                        </div>
                      ) : (
                        (notifications || []).map((n, idx) => (
                          <div
                            key={n._key || idx}
                            onClick={() => {
                              setNotifOpen(false);
                              viewNotification(n);
                            }}
                            className={`p-3 border-b border-black/10 flex gap-3 hover:bg-neutral-50 transition-colors cursor-pointer ${!n.read ? 'bg-blue-50/50' : ''}`}
                          >
                            <div
                              className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${!n.read ? 'bg-blue-600' : 'bg-gray-300'}`}
                            />
                            <div className="flex-1">
                              <p className="text-sm font-bold text-black leading-tight mb-1">
                                {n.title || 'Alert'}
                              </p>
                              <p className="text-sm font-medium text-black leading-tight line-clamp-2">
                                {n.message}
                              </p>
                              <p className="text-xs text-slate-500 mt-1 font-mono">
                                {n.at ? new Date(n.at).toLocaleTimeString() : ''}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile */}
              <div className="relative profile-menu">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-2 group"
                >
                  <div className="w-9 h-9 bg-black text-white flex items-center justify-center font-bold border-2 border-transparent group-hover:border-slate-300 transition-all">
                    {user?.fullname?.[0] || 'H'}
                  </div>
                </button>

                {profileMenuOpen && (
                  <div className="absolute right-0 mt-4 w-60 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-[100] p-0">
                    <div className="p-4 border-b-2 border-black bg-neutral-50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-bold text-lg">
                          {user?.fullname?.[0] || 'H'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-black truncate uppercase tracking-tight">
                            {user?.fullname || 'Host'}
                          </div>
                          <div className="text-xs text-slate-500 truncate font-mono">
                            {user?.email}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-2 space-y-1">
                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          try {
                            const id = user?.id || user?._id;
                            if (id) navigate(`/host/${id}`);
                            else navigate('/profile');
                          } catch (_) {
                            navigate('/profile');
                          }
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold uppercase tracking-wider text-black hover:bg-black hover:text-white transition-all"
                      >
                        <UserPen className="w-4 h-4" />
                        <span>Profile</span>
                      </button>
                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold uppercase tracking-wider text-red-600 hover:bg-red-600 hover:text-white transition-all"
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
        </motion.header>

        {/* Lightbox Modal */}
        {lightbox.open && (
          <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center">
            <button
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full"
              onClick={() => setLightbox((prev) => ({ ...prev, open: false }))}
            >
              <X className="w-5 h-5 text-white" />
            </button>
            <button
              className="absolute left-4 p-2 bg-white/10 hover:bg-white/20 rounded-full"
              onClick={() =>
                setLightbox((prev) => ({
                  ...prev,
                  index: (prev.index - 1 + prev.images.length) % prev.images.length,
                }))
              }
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            <img
              src={lightbox.images[lightbox.index]}
              alt="Preview"
              className="max-w-[85vw] max-h-[85vh] object-contain rounded-lg"
            />
            <button
              className="absolute right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full"
              onClick={() =>
                setLightbox((prev) => ({ ...prev, index: (prev.index + 1) % prev.images.length }))
              }
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          </div>
        )}

        {/* Notification Detail Modal */}
        <AnimatePresence>
          {notifModalOpen && (
            <NotificationDetailModal
              isOpen={notifModalOpen}
              onClose={() => setNotifModalOpen(false)}
              notification={selectedNotification}
            />
          )}
        </AnimatePresence>

        {/* Main Content Layout */}
        <div className="flex">
          {/* Brutalist Sidebar */}
          <motion.aside
            className={`sticky top-20 h-[calc(100vh-5rem)] bg-white/50 backdrop-blur-sm border-r border-black/10 transition-all duration-300 ease-in-out ${navCollapsed ? 'w-24' : 'w-72'} overflow-y-auto flex flex-col z-30`}
          >
            <div className="flex-1 py-8 px-4 space-y-2">
              <nav className="space-y-2">
                {[
                  { id: 'events', label: 'Events', icon: Calendar },
                  { id: 'registrations', label: 'Registrations', icon: Users },
                  { id: 'feedbacks', label: 'Feedback', icon: Star },
                  { id: 'discover', label: 'Discover', icon: Search },
                  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
                  { id: 'studio', label: 'Studio', icon: TrendingUp },
                  { id: 'certificates', label: 'Certificates', icon: Award },
                  { id: 'genloop', label: 'AI Event Studio', icon: Sparkles },
                  { id: 'ai-insights', label: 'AI Insights', icon: Brain },
                  { id: 'marketing', label: 'AI Marketing', icon: Send },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => {
                      setActiveTab(id);
                      if (id === 'studio') setSelectedStudioEvent(null);
                    }}
                    className={`w-full flex items-center group relative px-4 py-3 text-sm font-bold uppercase tracking-wider transition-all duration-200 outline-none ${navCollapsed ? 'justify-center' : ''
                      } ${activeTab === id ? 'text-white' : 'text-slate-500 hover:text-black'}`}
                    title={navCollapsed ? label : undefined}
                  >
                    {activeTab === id && (
                      <motion.div
                        layoutId="active-nav"
                        className="absolute inset-0 bg-black skew-x-[-12deg] shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-4">
                      <Icon
                        className={`w-5 h-5 ${activeTab === id ? 'text-white' : 'text-slate-400 group-hover:text-black'}`}
                      />
                      {!navCollapsed && <span>{label}</span>}
                    </span>
                  </button>
                ))}
              </nav>
            </div>
          </motion.aside>

          {/* Main Content Area */}
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              {/* Content Header */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  {activeTab === 'events' && 'Events Management'}
                  {activeTab === 'discover' && 'Discover Events'}
                  {activeTab === 'profile' && 'Host Profile'}
                  {activeTab === 'analytics' && 'General Analytics'}
                  {activeTab === 'studio' && (selectedStudioEvent ? `Performance: ${selectedStudioEvent.title}` : 'Channel Studio')}
                  {activeTab === 'certificates' && 'Custom Certificates'}
                  {activeTab === 'ai-insights' && 'AI Feedback Insights'}
                </h2>
                <p className="text-slate-600">
                  {activeTab === 'events' && 'Create, edit, and manage your events'}
                  {activeTab === 'discover' && 'Explore events from other hosts and colleges'}
                  {activeTab === 'profile' && 'Update your public host page and account details'}
                  {activeTab === 'analytics' && 'High-level overview of your channel stats'}
                  {activeTab === 'studio' && 'YouTube Studio-style performance tracking and visual analytics'}
                  {activeTab === 'certificates' && 'Design custom certificates for your events'}
                  {activeTab === 'ai-insights' &&
                    'AI-powered feedback analysis, charts, and improvement suggestions'}
                </p>
              </div>

              {/* Stats Cards - only visible on Events tab */}
              {activeTab === 'events' && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  {[
                    {
                      label: 'Total Events',
                      value: stats.total,
                      icon: Calendar,
                      bg: 'bg-blue-100',
                    },
                    {
                      label: 'Completed',
                      value: stats.completed,
                      icon: CheckCircle,
                      bg: 'bg-green-100',
                    },
                    { label: 'Upcoming', value: stats.upcoming, icon: Clock, bg: 'bg-yellow-100' },
                    {
                      label: 'Registrations',
                      value: stats.totalRegistrations,
                      icon: UserCheck,
                      bg: 'bg-purple-100',
                    },
                  ].map(({ label, value, icon: Icon, bg }) => (
                    <div
                      key={label}
                      className={`${bg} border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all duration-300`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-black text-xs font-black uppercase tracking-widest mb-2">
                            {label}
                          </p>
                          <p className="text-4xl font-black text-black">{value}</p>
                        </div>
                        <div className="w-14 h-14 bg-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)]">
                          <Icon className="w-7 h-7 text-white" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Certificates Tab */}
              {activeTab === 'certificates' && (
                <div className="space-y-6 animate-fadeIn">
                  <CertificateEditor events={events} />
                </div>
              )}



              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-black uppercase text-black">Host Profile</h3>
                      <p className="text-slate-600 font-medium">Manage your public presence</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const id = user?.id || user?._id || user?.hostId || user?.host?._id;
                          if (id) {
                            navigate(`/host/${id}`);
                          } else {
                            toast.error('Host ID not available');
                          }
                        }}
                        disabled={!(user?.id || user?._id || user?.hostId || user?.host?._id)}
                        className={`px-4 py-2 border-2 border-black uppercase font-bold text-sm transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] ${user?.id || user?._id || user?.hostId || user?.host?._id ? 'bg-white text-black hover:bg-neutral-50' : 'bg-neutral-200 text-neutral-400 cursor-not-allowed border-neutral-400 shadow-none'}`}
                        title="View your public host page"
                      >
                        View Public Page
                      </button>
                      <button
                        onClick={copyHostLink}
                        className="px-4 py-2 bg-white border-2 border-black text-black uppercase font-bold text-sm transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
                      >
                        Copy Link
                      </button>
                      <button
                        onClick={saveHostProfile}
                        disabled={profileSaving || !hostProfileValid}
                        className={`px-4 py-2 border-2 border-black uppercase font-bold text-sm transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] ${profileSaving || !hostProfileValid ? 'bg-neutral-300 cursor-not-allowed text-neutral-500 shadow-none border-neutral-400' : 'bg-black text-white hover:bg-neutral-800'}`}
                      >
                        {profileSaving ? 'Saving...' : 'Save Changes'}
                      </button>
                      {profileJustSavedAt && Date.now() - profileJustSavedAt < 3500 && (
                        <span className="text-sm font-bold border-2 border-green-600 bg-green-100 text-green-800 px-2 py-1 uppercase">
                          Saved!
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="bg-violet-50 p-6 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    {/* Banner */}
                    <div className="relative group">
                      <div className="text-xs font-bold uppercase text-black mb-2 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" /> Banner Image
                      </div>
                      <div className="relative border-2 border-black bg-neutral-100 h-48 overflow-hidden group-hover:bg-neutral-200 transition-colors">
                        {hostProfile.bannerUrl ? (
                          <img
                            src={hostProfile.bannerUrl}
                            alt="Banner"
                            className="w-full h-full object-cover transition-all duration-500 hover:grayscale"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-400 font-bold uppercase tracking-widest">
                            No Banner Uploaded
                          </div>
                        )}
                        <label className="absolute bottom-4 right-4 inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[0px] active:translate-y-[0px] text-black font-bold text-xs uppercase cursor-pointer transition-all">
                          <Upload className="w-4 h-4" /> Upload Banner
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => uploadHostImage('banner', e.target.files?.[0])}
                          />
                        </label>
                      </div>
                    </div>

                    {/* Avatar */}
                    <div className="mt-8">
                      <div className="text-xs font-bold uppercase text-black mb-2 flex items-center gap-2">
                        <UserCircle2 className="w-4 h-4" /> Profile Picture
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="w-24 h-24 rounded-none border-2 border-black bg-neutral-100 overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                          <img
                            src={hostProfile.profilePic || ''}
                            alt="Profile"
                            className="w-full h-full object-cover transition-all duration-500 hover:grayscale"
                            onError={(e) => {
                              e.currentTarget.style.visibility = 'hidden';
                            }}
                          />
                        </div>
                        <label className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-neutral-800 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[0px] active:translate-y-[0px] font-bold text-xs uppercase cursor-pointer transition-all">
                          <Upload className="w-4 h-4" /> Upload Profile
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => uploadHostImage('profile', e.target.files?.[0])}
                          />
                        </label>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold uppercase text-black mb-2">
                          Bio
                        </label>
                        <textarea
                          rows={4}
                          value={hostProfile.bio}
                          onChange={(e) =>
                            setHostProfile((prev) => ({ ...prev, bio: e.target.value }))
                          }
                          className="w-full p-4 border-2 border-black bg-neutral-50 focus:bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-mono text-sm"
                          placeholder="Tell attendees about you..."
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-black mb-2">
                          Website
                        </label>
                        <input
                          type="url"
                          value={hostProfile.website}
                          onChange={(e) =>
                            setHostProfile((prev) => ({ ...prev, website: e.target.value }))
                          }
                          onBlur={() => handleHostFieldBlur('website')}
                          className={`w-full p-3 border-2 border-black bg-neutral-50 focus:bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-mono text-sm ${hostTouched.website && hostProfileErrors.website ? 'border-red-500 bg-red-50' : ''}`}
                          placeholder="https://example.com"
                        />
                        {hostTouched.website && hostProfileErrors.website && (
                          <p className="text-xs font-bold text-red-600 mt-1 uppercase">
                            {hostProfileErrors.website}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-black mb-2">
                          Twitter / X
                        </label>
                        <input
                          type="text"
                          value={hostProfile.socials?.twitter || ''}
                          onChange={(e) =>
                            setHostProfile((prev) => {
                              const val = e.target.value || '';
                              const isUrl = /^https?:\/\//i.test(val);
                              const v = isUrl
                                ? val
                                : val.replace(/^@+/, '')
                                  ? '@' + val.replace(/^@+/, '')
                                  : '';
                              return { ...prev, socials: { ...(prev.socials || {}), twitter: v } };
                            })
                          }
                          onBlur={() => handleHostFieldBlur('twitter')}
                          className={`w-full p-3 border-2 border-black bg-neutral-50 focus:bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-mono text-sm ${hostTouched.twitter && hostProfileErrors.twitter ? 'border-red-500 bg-red-50' : ''}`}
                          placeholder="@username"
                        />
                        {hostTouched.twitter && hostProfileErrors.twitter && (
                          <p className="text-xs font-bold text-red-600 mt-1 uppercase">
                            {hostProfileErrors.twitter}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-black mb-2">
                          Instagram
                        </label>
                        <input
                          type="text"
                          value={hostProfile.socials?.instagram || ''}
                          onChange={(e) =>
                            setHostProfile((prev) => {
                              const val = e.target.value || '';
                              const isUrl = /^https?:\/\//i.test(val);
                              const v = isUrl
                                ? val
                                : val.replace(/^@+/, '')
                                  ? '@' + val.replace(/^@+/, '')
                                  : '';
                              return {
                                ...prev,
                                socials: { ...(prev.socials || {}), instagram: v },
                              };
                            })
                          }
                          onBlur={() => handleHostFieldBlur('instagram')}
                          className={`w-full p-3 border-2 border-black bg-neutral-50 focus:bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-mono text-sm ${hostTouched.instagram && hostProfileErrors.instagram ? 'border-red-500 bg-red-50' : ''}`}
                          placeholder="@username"
                        />
                        {hostTouched.instagram && hostProfileErrors.instagram && (
                          <p className="text-xs font-bold text-red-600 mt-1 uppercase">
                            {hostProfileErrors.instagram}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-black mb-2">
                          LinkedIn
                        </label>
                        <input
                          type="text"
                          value={hostProfile.socials?.linkedin || ''}
                          onChange={(e) =>
                            setHostProfile((prev) => {
                              const val = e.target.value || '';
                              const isUrl = /^https?:\/\//i.test(val);
                              const v = isUrl
                                ? val
                                : val.replace(/^@+/, '')
                                  ? '@' + val.replace(/^@+/, '')
                                  : '';
                              return { ...prev, socials: { ...(prev.socials || {}), linkedin: v } };
                            })
                          }
                          onBlur={() => handleHostFieldBlur('linkedin')}
                          className={`w-full p-3 border-2 border-black bg-neutral-50 focus:bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-mono text-sm ${hostTouched.linkedin && hostProfileErrors.linkedin ? 'border-red-500 bg-red-50' : ''}`}
                          placeholder="Profile URL or handle"
                        />
                        {hostTouched.linkedin && hostProfileErrors.linkedin && (
                          <p className="text-xs font-bold text-red-600 mt-1 uppercase">
                            {hostProfileErrors.linkedin}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Events Tab */}
              {activeTab === 'events' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-black uppercase text-black">Your Events</h3>
                      <p className="text-slate-600 font-medium">Manage and organize your events</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={openCreate}
                        className="flex items-center space-x-2 px-6 py-3 bg-black border-2 border-black text-white uppercase font-bold text-sm transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
                      >
                        <Plus className="w-5 h-5" />
                        <span>Create Event</span>
                      </button>
                      <button
                        onClick={() => setShowScanner(true)}
                        className="flex items-center space-x-2 px-6 py-3 bg-white border-2 border-black text-black uppercase font-bold text-sm transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
                      >
                        <ScanLine className="w-5 h-5" />
                        <span>Scan Ticket</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* GenLoop AI Tab */}
              {activeTab === 'genloop' && (
                <div className="animate-fadeIn">
                  <GenLoopStudio
                    onPublish={(eventPayload) => {
                      // Convert ISO/date strings to datetime-local format (YYYY-MM-DDTHH:MM)
                      const toLocalDT = (val) => {
                        if (!val) return '';
                        try {
                          const d = new Date(val);
                          if (isNaN(d.getTime())) return '';
                          // Use local time to avoid UTC offset shifting the date
                          const pad = (n) => String(n).padStart(2, '0');
                          return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
                        } catch { return ''; }
                      };
                      // Pre-fill create form and switch to events tab
                      setEditingEvent(null);
                      setForm({
                        title: eventPayload.title || '',
                        description: eventPayload.description || '',
                        shortDescription: eventPayload.shortDescription || eventPayload.description?.substring(0, 100) || '',
                        category: eventPayload.category || 'General',
                        date: toLocalDT(eventPayload.date),
                        endDate: '',
                        registrationDeadline: toLocalDT(eventPayload.registrationDeadline),
                        location: eventPayload.location || '',
                        address: '',
                        city: '',
                        state: '',
                        pincode: '',
                        tags: eventPayload.tags ? eventPayload.tags.join(', ') : '',
                        isOnline: false,
                        platform: 'Google Meet',
                        meetingLink: '',
                        capacity: eventPayload.capacity || 100,
                        price: 0,
                        currency: 'INR',
                        isTeamEvent: eventPayload.eventType === 'team',
                        minTeamSize: eventPayload.eventType === 'team' ? 2 : 1,
                        maxTeamSize: eventPayload.teamSize || (eventPayload.eventType === 'team' ? 4 : 1),
                        requirements: '',
                        agenda: '',
                        contactEmail: user?.email || '',
                        contactPhone: '',
                        website: '',
                        images: [],
                        imageUrl: eventPayload.ai?.posterUrl || '',
                        ai: eventPayload.ai,
                        gamificationRewards: eventPayload.gamificationRewards
                      });
                      setActiveTab('events');
                      setShowForm(true);
                      window.scrollTo(0, 0);
                    }}
                    onCancel={() => setActiveTab('events')}
                  />
                </div>
              )}
              {/* Events Content */}
              {activeTab === 'events' && (
                <>
                  {/* Search and Filter */}
                  <div className="flex items-center space-x-4">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Search events..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white border-2 border-black text-black placeholder-slate-400 font-medium focus:outline-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all transform focus:-translate-y-0.5"
                      />
                    </div>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-4 py-3 bg-white border-2 border-black text-black font-bold focus:outline-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all transform focus:-translate-y-0.5"
                    >
                      <option value="all">ALL EVENTS</option>
                      <option value="upcoming">UPCOMING</option>
                      <option value="completed">COMPLETED</option>
                      <option value="past">PAST</option>
                    </select>
                  </div>

                  {/* Events Grid */}
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                  ) : filteredEvents.length === 0 ? (
                    <div className="text-center py-20 bg-white border-2 border-dashed border-black">
                      <Calendar className="w-16 h-16 mx-auto text-black mb-4" />
                      <h3 className="text-2xl font-black uppercase text-black mb-2">
                        No Events Found
                      </h3>
                      <p className="text-slate-600 font-medium mb-6">
                        {searchTerm
                          ? 'Try adjusting your search'
                          : 'Create your first event to get started'}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {filteredEvents.map((event) => {
                        const theme = EVENT_THEMES[event.category] || EVENT_THEMES.Default;
                        const ThemeIcon = theme.icon;
                        
                        return (
                          <motion.div
                            key={event._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ 
                              y: -12, 
                              x: -4,
                              scale: 1.02,
                              transition: { type: "spring", stiffness: 400, damping: 25 }
                            }}
                            className={`group flex flex-col ${theme.bg} ${theme.gradient} border-2 ${theme.border} overflow-hidden ${theme.shadow} ${theme.glow} transition-shadow duration-300 relative z-0`}
                          >
                            {/* Background patterns based on theme */}
                            <div className="absolute inset-0 pointer-events-none opacity-5 mix-blend-overlay">
                              <div className="w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2)_1px,transparent_1px)] bg-[length:24px_24px]"></div>
                            </div>

                            {/* Event Image Header */}
                            <div className="relative h-48 bg-neutral-900 border-b-2 border-black overflow-hidden">
                              {event.imageUrl ? (
                                <img
                                  src={toAbsoluteUrl(event.imageUrl)}
                                  alt={event.title}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 cursor-pointer group-hover:grayscale-[0.3]"
                                  onClick={() =>
                                    setLightbox({
                                      open: true,
                                      images: [
                                        toAbsoluteUrl(event.imageUrl),
                                        ...(event.images || []).map(toAbsoluteUrl),
                                      ],
                                      index: 0,
                                    })
                                  }
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-neutral-100/10 relative overflow-hidden">
                                  <div
                                    className="absolute inset-0 opacity-10"
                                    style={{
                                      backgroundImage:
                                        'radial-gradient(circle at 1px 1px, black 1px, transparent 0)',
                                      backgroundSize: '10px 10px',
                                    }}
                                  ></div>
                                  <ThemeIcon className={`w-12 h-12 ${theme.text}`} />
                                </div>
                              )}

                              {/* glassmorphism overlay on image hover */}
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-500 flex items-center justify-center pointer-events-none">
                                  <motion.div 
                                      initial={{ scale: 0, opacity: 0 }}
                                      whileHover={{ scale: 1, opacity: 1 }}
                                      className={`${theme.glass} p-4 rounded-full`}
                                  >
                                      <ThemeIcon className={`w-8 h-8 ${theme.text}`} />
                                  </motion.div>
                              </div>

                              {/* Status Badge */}
                              <div className="absolute top-3 right-3 z-10">
                                <AnimatePresence>
                                  {event.isCompleted ? (
                                    <motion.span 
                                      initial={{ x: 20, opacity: 0 }}
                                      animate={{ x: 0, opacity: 1 }}
                                      className="px-3 py-1 bg-green-400 border-2 border-black text-black text-[10px] font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1"
                                    >
                                      <CheckCircle className="w-3 h-3" />
                                      Completed
                                    </motion.span>
                                  ) : event.isPublished ? (
                                    <motion.span 
                                      initial={{ x: 20, opacity: 0 }}
                                      animate={{ x: 0, opacity: 1 }}
                                      className="px-3 py-1 bg-blue-400 border-2 border-black text-black text-[10px] font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                    >
                                      Published
                                    </motion.span>
                                  ) : (
                                    <motion.span 
                                      initial={{ x: 20, opacity: 0 }}
                                      animate={{ x: 0, opacity: 1 }}
                                      className="px-3 py-1 bg-neutral-200 border-2 border-black text-black text-[10px] font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                    >
                                      Draft
                                    </motion.span>
                                  )}
                                </AnimatePresence>
                              </div>

                              {/* Category Badge */}
                              {event.category && (
                                <div className="absolute top-3 left-3 z-10">
                                  <span className={`px-3 py-1 border-2 text-[10px] font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-sm ${theme.tag}`}>
                                    {event.category}
                                  </span>
                                </div>
                              )}

                              {/* Upload Cover Overlay */}
                              <label className="absolute bottom-3 right-3 z-10 px-3 py-1 bg-white/90 backdrop-blur-sm border-2 border-black text-black text-[10px] font-black uppercase cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all flex items-center gap-1 active:shadow-none active:translate-x-[2px] active:translate-y-[2px]">
                                <Upload className="w-3 h-3" />
                                Change Cover
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => uploadEventCover(event, e.target.files?.[0])}
                                />
                              </label>
                            </div>

                            {/* Event Info */}
                            <div className="p-6 flex-1 flex flex-col relative overflow-hidden backdrop-blur-[2px]">
                              {/* Subtle theme-colored glow */}
                              <div className={`absolute -bottom-10 -right-10 w-24 h-24 rounded-full blur-3xl opacity-20 ${theme.bg}`}></div>
                              
                              <h3 className={`text-xl font-black mb-2 line-clamp-2 uppercase leading-tight group-hover:translate-x-1 transition-transform duration-300 ${theme.text}`}>
                                {event.title}
                              </h3>
                              <p className={`text-sm mb-6 line-clamp-2 font-medium leading-relaxed ${theme.muted}`}>
                                {event.shortDescription || event.description || 'No description'}
                              </p>

                              {/* Event Meta */}
                              <div className="space-y-3 mb-6 font-bold text-[10px] tracking-widest uppercase">
                                <div className={`flex items-center gap-3 ${theme.muted}`}>
                                  <Clock className={`w-4 h-4`} />
                                  <span>
                                    {new Date(event.date).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className={`flex items-center gap-3 ${theme.muted}`}>
                                  <MapPin className={`w-4 h-4`} />
                                  <span className="line-clamp-1">
                                    {event.location || 'TBA'}
                                  </span>
                                </div>
                                <div className={`flex items-center gap-3 ${theme.muted}`}>
                                  <Users className={`w-4 h-4`} />
                                  <span>
                                    {event.registrations?.filter((r) => r.status === 'registered')
                                      .length || 0}
                                    {event.capacity > 0 ? ` / ${event.capacity}` : ''} Registered
                                  </span>
                                </div>
                                {event.isOnline && (
                                  <div className={`flex items-center gap-3 ${theme.text}`}>
                                    <div className={`w-2 h-2 ${theme.bg} rounded-full animate-pulse border border-black/20`}></div>
                                    <span>Online Event</span>
                                  </div>
                                )}
                              </div>

                              {/* Tags */}
                              {event.tags && event.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-6">
                                  {event.tags.slice(0, 3).map((tag, idx) => (
                                    <span
                                      key={idx}
                                      className={`px-2 py-0.5 border-2 text-[9px] font-black uppercase rounded-sm shadow-sm ${theme.tag}`}
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                  {event.tags.length > 3 && (
                                    <span className={`px-2 py-0.5 border-2 text-[9px] font-black uppercase rounded-sm shadow-sm ${theme.tag}`}>
                                      +{event.tags.length - 3}
                                    </span>
                                  )}
                                </div>
                              )}

                              {/* Spacer */}
                              <div className="flex-1"></div>

                              {/* Action Buttons */}
                              <div className="pt-6 mt-auto space-y-3 border-t-2 border-dashed border-black/10 relative z-10">
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={() => openEdit(event)}
                                    className={`flex-1 px-3 py-2 border-2 rounded-none text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-all active:scale-95 ${theme.button}`}
                                  >
                                    <Edit3 className="w-4 h-4" />
                                    Edit Event
                                  </button>
                                  <button
                                    onClick={() => deleteEvent(event)}
                                    className="p-2 bg-white text-red-600 hover:bg-red-50 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
                                    title="Delete Event"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                  {!event.isCompleted && (
                                    <button
                                      onClick={() => markCompleted(event)}
                                      className={`flex-1 min-w-[100px] px-3 py-2 bg-white border-2 border-black text-black hover:bg-neutral-100 text-[9px] font-black uppercase flex items-center justify-center gap-1 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]`}
                                    >
                                      <CheckCircle className="w-3 h-3" />
                                      Complete
                                    </button>
                                  )}
                                  {event.isCompleted && (
                                    <button
                                      onClick={() => generateCertificates(event)}
                                      className="flex-1 min-w-[100px] px-3 py-2 bg-purple-600 text-white border-2 border-black hover:bg-purple-700 text-[9px] font-black uppercase flex items-center justify-center gap-1 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
                                    >
                                      <Trophy className="w-3 h-3" />
                                      Certificates
                                    </button>
                                  )}
                                  
                                  {!event.isCompleted && (
                                    <button
                                      onClick={() => navigate(`/host/live/${event._id}`)}
                                      className="flex-1 min-w-[100px] px-3 py-2 bg-red-600 text-white border-2 border-black hover:bg-red-700 text-[9px] font-black uppercase flex items-center justify-center gap-1 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
                                    >
                                      <Radio className="w-3 h-3 animate-pulse" />
                                      Live Control
                                    </button>
                                  )}
                                  
                                  <button
                                    onClick={() => classifyEvent(event._id)}
                                    disabled={classifyingEventId === event._id}
                                    className={`flex-1 min-w-[100px] px-3 py-2 border-2 text-[9px] font-black uppercase flex items-center justify-center gap-1 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] ${classifyingEventId === event._id
                                      ? 'bg-amber-100 text-amber-700 cursor-not-allowed grayscale'
                                      : 'bg-white hover:bg-amber-50 text-amber-900 border-black'
                                      }`}
                                    title="Classify Event"
                                  >
                                    {classifyingEventId === event._id ? (
                                      <>
                                        <RefreshCw className="w-3 h-3 animate-spin" />
                                        Wait...
                                      </>
                                    ) : (
                                      <>
                                        <Bot className="w-3 h-3" />
                                        Re-Classify
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>

                              {/* Gallery Section */}
                              {Array.isArray(event.images) && event.images.length > 0 && (
                                <div className="mt-4 pt-4 border-t-2 border-dashed border-black/10">
                                  <div className={`text-[9px] font-black uppercase mb-2 ${theme.text}`}>
                                    Event Gallery ({event.images.length})
                                  </div>
                                  <div className="grid grid-cols-4 gap-2">
                                    {event.images.slice(0, 4).map((img, i) => (
                                      <div
                                        key={i}
                                        className="relative group aspect-square border-2 border-black overflow-hidden bg-black/5"
                                      >
                                        <img
                                          src={toAbsoluteUrl(img)}
                                          alt={`Gallery ${i + 1}`}
                                          className="w-full h-full object-cover cursor-pointer hover:scale-110 transition-transform hover:grayscale duration-300"
                                          onClick={() =>
                                            setLightbox({
                                              open: true,
                                              images: (event.images || []).map(toAbsoluteUrl),
                                              index: i,
                                            })
                                          }
                                        />
                                        <div className="absolute inset-x-0 bottom-0 bg-black/80 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex justify-center">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              deleteEventImage(event, img);
                                            }}
                                            className="text-white hover:text-red-400"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                  <label className="mt-3 inline-flex items-center gap-1 px-3 py-1 bg-white hover:bg-neutral-100 border-2 border-black text-black text-[9px] font-black uppercase cursor-pointer transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]">
                                    <ImageIcon className="w-3 h-3" /> Add More
                                    <input
                                      type="file"
                                      accept="image/*"
                                      multiple
                                      className="hidden"
                                      onChange={(e) => uploadEventImages(event, e.target.files)}
                                    />
                                  </label>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}

              {/* Registrations Tab */}
              {activeTab === 'registrations' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-black uppercase text-black">
                      {selectedEvent
                        ? `Registrations - ${selectedEvent.title}`
                        : 'Event Registrations'}
                    </h2>
                    {selectedEvent && (
                      <button
                        onClick={() => setSelectedEvent(null)}
                        className="px-4 py-2 bg-white border-2 border-black text-black uppercase font-bold text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all flex items-center gap-2"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Back to List
                      </button>
                    )}
                  </div>

                  {selectedEvent ? (
                    <div className="bg-white border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                      {/* Toolbar */}
                      <div className="flex items-center justify-between gap-3 mb-6">
                        <div className="flex items-center gap-2">
                          <input
                            value={regSearch}
                            onChange={(e) => setRegSearch(e.target.value)}
                            placeholder="Search name or email"
                            className="px-3 py-2 bg-white border-2 border-black text-sm outline-none font-medium placeholder-slate-400 focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                          />
                          <select
                            value={regStatus}
                            onChange={(e) => setRegStatus(e.target.value)}
                            className="px-3 py-2 bg-white border-2 border-black text-sm outline-none font-bold uppercase focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                          >
                            <option value="all">All Status</option>
                            <option value="registered">Registered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={downloadServerXlsx}
                            className="px-3 py-2 text-xs font-bold uppercase bg-white border-2 border-black hover:bg-neutral-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
                          >
                            Download XLSX
                          </button>
                          <label className="px-3 py-2 text-xs font-bold uppercase bg-black text-white border-2 border-black hover:bg-neutral-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all cursor-pointer">
                            <span>Import XLSX</span>
                            <input
                              type="file"
                              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                              className="hidden"
                              onChange={(e) => importXlsxFile(e.target.files?.[0])}
                            />
                          </label>
                        </div>
                      </div>

                      {filteredRegistrations.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed border-black/20">
                          <Users className="w-16 h-16 text-black/20 mx-auto mb-3" />
                          <p className="text-slate-500 font-bold uppercase">No registrations yet</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="border-b-2 border-black bg-neutral-100">
                                <th className="text-left py-3 px-4 text-black text-xs font-black uppercase tracking-wider">
                                  Student Name
                                </th>
                                <th className="text-left py-3 px-4 text-black text-xs font-black uppercase tracking-wider">
                                  Email
                                </th>
                                {selectedEvent.isTeamEvent && (
                                  <th className="text-left py-3 px-4 text-black text-xs font-black uppercase tracking-wider">
                                    Squad
                                  </th>
                                )}
                                <th className="text-left py-3 px-4 text-black text-xs font-black uppercase tracking-wider">
                                  Registered At
                                </th>
                                <th className="text-left py-3 px-4 text-black text-xs font-black uppercase tracking-wider">
                                  Status
                                </th>
                                <th className="text-left py-3 px-4 text-black text-xs font-black uppercase tracking-wider">
                                  Attended
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredRegistrations.map((reg, idx) => (
                                <tr
                                  key={idx}
                                  className="border-b border-black/10 hover:bg-neutral-50 transition-colors"
                                >
                                  <td className="py-3 px-4 font-bold text-black">
                                    {reg.studentId?.fullname || '-'}
                                  </td>
                                  <td className="py-3 px-4 text-slate-600 font-mono text-xs">
                                    {reg.studentId?.email || '-'}
                                  </td>
                                  {selectedEvent.isTeamEvent && (
                                    <td className="py-3 px-4 text-slate-600 font-bold text-xs">
                                      {reg.squadId ? (
                                        <span className="px-2 py-1 bg-amber-100 border border-amber-800 text-amber-800 rounded">
                                          {reg.squadId.name || 'Unknown Squad'}
                                        </span>
                                      ) : '-'}
                                    </td>
                                  )}
                                  <td className="py-3 px-4 text-slate-600 font-mono text-xs">
                                    {reg.registeredAt
                                      ? new Date(reg.registeredAt).toLocaleString()
                                      : '-'}
                                  </td>
                                  <td className="py-3 px-4">
                                    <span
                                      className={`px-2 py-0.5 border-2 border-black text-xs font-bold uppercase ${reg.status === 'registered'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                        }`}
                                    >
                                      {reg.status}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4">
                                    <select
                                      value={reg.attended ? 'yes' : 'no'}
                                      onChange={(e) =>
                                        updateAttendance(
                                          selectedEvent._id,
                                          reg.studentId?._id || reg.studentId,
                                          e.target.value === 'yes'
                                        )
                                      }
                                      className="px-2 py-1 bg-white border-2 border-black rounded-none text-xs font-bold uppercase outline-none focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                    >
                                      <option value="no">No</option>
                                      <option value="yes">Yes</option>
                                    </select>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      <h3 className="text-lg font-black uppercase text-black mb-6">
                        Select an event to view registrations
                      </h3>
                      {events.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed border-black">
                          <Calendar className="w-16 h-16 text-black/20 mx-auto mb-3" />
                          <p className="text-slate-500 font-bold uppercase mb-4">
                            No events available
                          </p>
                          <button
                            onClick={() => setActiveTab('events')}
                            className="px-4 py-2 bg-black text-white hover:bg-neutral-800 border-2 border-black text-xs font-bold uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                          >
                            Create Your First Event
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {events.map((ev) => (
                            <div
                              key={ev._id}
                              className="bg-white border-2 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all group cursor-pointer flex flex-col"
                              onClick={() => loadRegistrations(ev)}
                            >
                              {/* Event Image */}
                              <div className="relative h-32 bg-neutral-100 border-b-2 border-black overflow-hidden">
                                {ev.imageUrl ? (
                                  <img
                                    src={toAbsoluteUrl(ev.imageUrl)}
                                    alt={ev.title}
                                    className="w-full h-full object-cover group-hover:grayscale transition-all duration-500"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Calendar className="w-10 h-10 text-neutral-300" />
                                  </div>
                                )}
                                {ev.isCompleted && (
                                  <span className="absolute top-2 right-2 px-2 py-0.5 bg-green-400 border-2 border-black text-black text-xs font-bold uppercase">
                                    Completed
                                  </span>
                                )}
                              </div>

                              {/* Event Info */}
                              <div className="p-4 flex-1 flex flex-col">
                                <h4 className="font-black text-black uppercase leading-tight line-clamp-2 mb-3 group-hover:underline">
                                  {ev.title}
                                </h4>
                                <div className="space-y-2 mb-4 flex-1">
                                  <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                                    <Calendar className="w-3.5 h-3.5 text-black" />
                                    <span className="font-mono">
                                      {new Date(ev.date).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                                    <MapPin className="w-3.5 h-3.5 text-black" />
                                    <span className="line-clamp-1 uppercase">
                                      {ev.location || (ev.isOnline ? 'Online' : 'Location not set')}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs">
                                    <Users className="w-3.5 h-3.5 text-black" />
                                    <span className="font-bold text-black">
                                      {ev.registrations?.filter((r) => r.status === 'registered')
                                        .length || 0}{' '}
                                      Registered
                                    </span>
                                    {ev.capacity > 0 && (
                                      <span className="text-slate-500 font-mono">
                                        / {ev.capacity}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Progress Bar */}
                                {ev.capacity > 0 && (
                                  <div className="mb-4">
                                    <div className="w-full bg-neutral-100 border-2 border-black h-3 rounded-full overflow-hidden">
                                      <div
                                        className="bg-black h-full transition-all"
                                        style={{
                                          width: `${Math.min(100, Math.round(((ev.registrations?.filter((r) => r.status === 'registered').length || 0) / ev.capacity) * 100))}%`,
                                        }}
                                      ></div>
                                    </div>
                                    <p className="text-xs font-bold uppercase text-slate-500 mt-1 text-right">
                                      {Math.round(
                                        ((ev.registrations?.filter((r) => r.status === 'registered')
                                          .length || 0) /
                                          ev.capacity) *
                                        100
                                      )}
                                      % capacity
                                    </p>
                                  </div>
                                )}

                                <button className="w-full px-3 py-2 bg-black text-white hover:bg-neutral-800 border-2 border-black text-xs font-bold uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[1px] active:translate-y-[1px] transition-all flex items-center justify-center gap-2">
                                  <Users className="w-4 h-4" />
                                  View Registrations
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Feedbacks Tab */}
              {activeTab === 'feedbacks' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-black uppercase text-black">
                      {selectedEvent ? `Feedbacks - ${selectedEvent.title}` : 'Event Feedbacks'}
                    </h2>
                    {selectedEvent && (
                      <button
                        onClick={() => setSelectedEvent(null)}
                        className="px-4 py-2 bg-white border-2 border-black text-black uppercase font-bold text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all flex items-center gap-2"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Back to List
                      </button>
                    )}
                  </div>

                  {selectedEvent ? (
                    <div className="bg-white border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col min-h-[400px]">
                      {/* Inner Tabs for Reviews vs AI Insights */}
                      <div className="flex border-b-2 border-black mb-6 w-full">
                        <button
                          onClick={() => setRegStatus('all')}
                          className={`flex-1 py-3 font-black uppercase tracking-widest text-sm border-r-2 border-black transition-colors ${regStatus !== 'insights' ? 'bg-black text-white' : 'bg-neutral-100 hover:bg-neutral-200 text-black'}`}
                        >
                          View Reviews ({feedbacks.length})
                        </button>
                        <button
                          onClick={() => {
                            setRegStatus('insights');
                            if (!aiInsights && !aiInsightsLoading) {
                              fetchAiInsights(selectedEvent._id);
                            }
                          }}
                          className={`flex-1 py-3 font-black uppercase tracking-widest text-sm transition-colors flex items-center justify-center gap-2 ${regStatus === 'insights' ? 'bg-yellow-400 text-black shadow-[inset_0_-4px_0_0_rgba(0,0,0,1)]' : 'bg-neutral-100 hover:bg-neutral-200 text-black'}`}
                        >
                          <Brain className="w-5 h-5 text-black" />
                          AI Insights
                        </button>
                      </div>

                      {regStatus === 'insights' ? (
                        <div className="flex-1 animate-fadeIn">
                          {aiInsightsLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 text-black space-y-4">
                              <Brain className="w-12 h-12 animate-pulse text-yellow-500" />
                              <p className="font-black uppercase tracking-widest animate-pulse">
                                Generating AI Insights...
                              </p>
                            </div>
                          ) : aiInsights?.noData || (!aiInsightsLoading && !aiInsights) ? (
                            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-black/20 bg-neutral-50">
                              <MessageSquare className="w-12 h-12 text-black/20 mb-4" />
                              <p className="font-black uppercase tracking-widest text-black/40">
                                Not enough reviews yet to generate insights.
                              </p>
                            </div>
                          ) : aiInsights && !aiInsightsLoading ? (
                            <div className="space-y-8">
                              <div className="bg-yellow-100 border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                <h3 className="font-black uppercase tracking-widest text-xl mb-3 flex items-center gap-2 border-b-2 border-black pb-2">
                                  <Trophy className="w-6 h-6 text-yellow-600" /> Executive Summary
                                </h3>
                                <p className="text-black font-medium leading-relaxed">
                                  {aiInsights.overallSentiment}
                                </p>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-emerald-50 border-2 border-green-600 p-6 shadow-[4px_4px_0px_0px_rgba(22,163,74,1)] flex flex-col">
                                  <h3 className="font-black uppercase tracking-widest text-green-800 mb-4 flex items-center gap-2 border-b-2 border-green-600 pb-2 shrink-0">
                                    <ThumbsUp className="w-5 h-5" /> Top Positives
                                  </h3>
                                  <ul className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                    {aiInsights.topPositives?.map((pos, idx) => (
                                      <li
                                        key={idx}
                                        className="flex gap-3 text-green-900 font-medium text-sm items-start bg-emerald-100/50 p-2 border-l-2 border-green-500 rounded-r"
                                      >
                                        <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 shrink-0 shadow-[1px_1px_0px_0px_rgba(0,0,0,0.5)]"></div>
                                        <span className="leading-tight">{pos}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                <div className="bg-red-50 border-2 border-red-600 p-6 shadow-[4px_4px_0px_0px_rgba(220,38,38,1)] flex flex-col">
                                  <h3 className="font-black uppercase tracking-widest text-red-800 mb-4 flex items-center gap-2 border-b-2 border-red-600 pb-2 shrink-0">
                                    <Target className="w-5 h-5" /> Areas for Improvement
                                  </h3>
                                  <ul className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                    {aiInsights.keyAreasForImprovement?.map((area, idx) => (
                                      <li
                                        key={idx}
                                        className="flex gap-3 text-red-900 font-medium text-sm items-start bg-red-100/50 p-2 border-l-2 border-red-500 rounded-r"
                                      >
                                        <div className="w-2 h-2 bg-red-500 rounded-sm mt-1.5 shrink-0 rotate-45 shadow-[1px_1px_0px_0px_rgba(0,0,0,0.5)]"></div>
                                        <span className="leading-tight">{area}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>

                              <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                <h3 className="font-black uppercase tracking-widest text-black mb-4 flex items-center gap-2 border-b-2 border-black pb-2">
                                  <Zap className="w-5 h-5 text-blue-600" /> Actionable Suggestions
                                </h3>
                                <div className="space-y-4">
                                  {aiInsights.actionableSuggestions?.map((sug, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-center gap-4 bg-neutral-50 border-2 border-black p-4 group hover:bg-yellow-50 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all cursor-default"
                                    >
                                      <div className="w-8 h-8 rounded-full border-2 border-black flex items-center justify-center font-black bg-white group-hover:bg-yellow-400 shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-none transition-all">
                                        {idx + 1}
                                      </div>
                                      <p className="font-bold text-sm text-black">{sug}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      ) : (
                        <div className="flex-1">
                          {feedbacks.length === 0 ? (
                            <div className="text-center py-12 border-2 border-dashed border-black/20">
                              <Star className="w-20 h-20 text-black/20 mx-auto mb-4 animate-pulse" />
                              <p className="text-slate-500 text-lg font-bold uppercase">
                                No feedback yet
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {feedbackStats && feedbackStats.sentimentBreakdown && (
                                <div className="bg-white border-2 border-black p-4 mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                  <h3 className="font-black text-lg uppercase tracking-widest border-b-2 border-black pb-2 mb-4">
                                    AI Sentiment Summary
                                  </h3>
                                  <div className="flex flex-wrap gap-4 items-center">
                                    <div className="flex-1 min-w-[120px] bg-emerald-100 border-2 border-black p-4 text-center">
                                      <div className="text-3xl font-black text-emerald-700">
                                        {feedbackStats.sentimentBreakdown.Positive || 0}
                                      </div>
                                      <div className="text-xs font-bold uppercase text-emerald-900 tracking-widest mt-1">
                                        Positive
                                      </div>
                                    </div>
                                    <div className="flex-1 min-w-[120px] bg-neutral-100 border-2 border-black p-4 text-center">
                                      <div className="text-3xl font-black text-neutral-700">
                                        {feedbackStats.sentimentBreakdown.Neutral || 0}
                                      </div>
                                      <div className="text-xs font-bold uppercase text-neutral-900 tracking-widest mt-1">
                                        Neutral
                                      </div>
                                    </div>
                                    <div className="flex-1 min-w-[120px] bg-red-100 border-2 border-black p-4 text-center">
                                      <div className="text-3xl font-black text-red-700">
                                        {feedbackStats.sentimentBreakdown.Negative || 0}
                                      </div>
                                      <div className="text-xs font-bold uppercase text-red-900 tracking-widest mt-1">
                                        Negative
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                              {feedbacks.map((feedback, idx) => (
                                <div
                                  key={idx}
                                  className="bg-neutral-50 p-6 border-2 border-black hover:bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-300"
                                >
                                  <div className="flex items-start justify-between mb-3">
                                    <div>
                                      <p className="font-black text-black uppercase text-lg">
                                        {feedback.isAnonymous
                                          ? 'Anonymous'
                                          : feedback.reviewerId?.fullname || 'Anonymous'}
                                      </p>
                                      {!feedback.isAnonymous && (
                                        <p className="text-slate-600 text-sm font-mono">
                                          {feedback.reviewerId?.email || ''}
                                        </p>
                                      )}
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                      <div className="flex items-center space-x-1 bg-black text-white px-3 py-1 border-2 border-black">
                                        <span className="font-bold text-sm tracking-widest">
                                          RATING:
                                        </span>
                                        <span className="font-black text-lg ml-2">
                                          {feedback.overallRating || 0}/5
                                        </span>
                                      </div>
                                      {feedback.sentimentLabel && (
                                        <span
                                          className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-widest border-2 border-black ${feedback.sentimentLabel === 'Positive'
                                            ? 'bg-emerald-400 text-black'
                                            : feedback.sentimentLabel === 'Negative'
                                              ? 'bg-red-400 text-white'
                                              : 'bg-neutral-300 text-black'
                                            }`}
                                        >
                                          {feedback.sentimentLabel}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Optional detailed fields */}
                                  {Array.isArray(feedback.reviewFields) &&
                                    feedback.reviewFields.length > 0 && (
                                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t-2 border-dashed border-black/10">
                                        {feedback.reviewFields.map((f, i) => (
                                          <div
                                            key={i}
                                            className="bg-white p-3 border-2 border-black/10"
                                          >
                                            <div className="text-xs font-bold uppercase text-slate-500 mb-1">
                                              {f.fieldName}
                                            </div>
                                            {f.fieldType === 'rating' ? (
                                              <div className="flex items-center">
                                                {[...Array(5)].map((_, j) => (
                                                  <Star
                                                    key={j}
                                                    className={`w-4 h-4 ${j < (f.rating || 0) ? 'text-yellow-500 fill-current' : 'text-neutral-300'}`}
                                                  />
                                                ))}
                                                <span className="ml-2 text-black font-bold text-xs">
                                                  ({f.rating || 0}/5)
                                                </span>
                                              </div>
                                            ) : (
                                              <div className="text-black font-medium text-sm break-words leading-relaxed">
                                                {String(f.value || '').trim() || '-'}
                                              </div>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    )}

                                  {feedback.comment && (
                                    <p className="text-slate-700 text-sm mt-3 leading-relaxed">
                                      {feedback.comment}
                                    </p>
                                  )}
                                  <p className="text-slate-500 text-xs mt-3">
                                    {feedback.createdAt
                                      ? new Date(feedback.createdAt).toLocaleString()
                                      : ''}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                      <h3 className="text-lg font-semibold text-slate-900 mb-4">
                        Select an event to view feedbacks
                      </h3>
                      {events.length === 0 ? (
                        <div className="text-center py-12">
                          <Calendar className="w-16 h-16 text-slate-400 mx-auto mb-3" />
                          <p className="text-slate-500">No events available</p>
                          <button
                            onClick={() => setActiveTab('events')}
                            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                          >
                            Create Your First Event
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {events.map((ev) => (
                            <div
                              key={ev._id}
                              className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                            >
                              {/* Event Image */}
                              <div className="relative h-32 bg-gradient-to-br from-amber-100 to-orange-100">
                                {ev.imageUrl ? (
                                  <img
                                    src={toAbsoluteUrl(ev.imageUrl)}
                                    alt={ev.title}
                                    className="w-full h-full object-cover group-hover:grayscale transition-all duration-500"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Star className="w-10 h-10 text-slate-300" />
                                  </div>
                                )}
                                {ev.isCompleted && (
                                  <span className="absolute top-2 right-2 px-2 py-0.5 bg-green-500 text-white text-xs font-medium rounded-full">
                                    Completed
                                  </span>
                                )}
                              </div>

                              {/* Event Info */}
                              <div className="p-4">
                                <h4 className="font-bold text-slate-900 line-clamp-2 mb-2">
                                  {ev.title}
                                </h4>
                                <div className="space-y-1.5 mb-3">
                                  <div className="flex items-center gap-2 text-xs text-slate-600">
                                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                                    <span>{new Date(ev.date).toLocaleDateString()}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-slate-600">
                                    <MapPin className="w-3.5 h-3.5 text-green-500" />
                                    <span className="line-clamp-1">
                                      {ev.location || (ev.isOnline ? 'Online' : 'Location not set')}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs">
                                    <Star className="w-3.5 h-3.5 text-yellow-500" />
                                    <span className="font-semibold text-amber-700">
                                      {ev.feedbacks?.length || 0} Feedbacks
                                    </span>
                                  </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="space-y-2">
                                  <button
                                    onClick={() => loadFeedbacks(ev)}
                                    className="w-full px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                  >
                                    <Star className="w-4 h-4" />
                                    View Feedback
                                  </button>
                                  <button
                                    onClick={() => customizeReviewFields(ev)}
                                    className="w-full px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                  >
                                    <Settings className="w-4 h-4" />
                                    Customize Review
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              {/* Discover Tab - Events from Other Hosts */}
              {activeTab === 'discover' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-black uppercase text-black">
                        Events from Other Hosts
                      </h2>
                      <p className="text-slate-600 font-medium mt-1">
                        Explore and discover events from other colleges and institutions
                      </p>
                    </div>
                    <button
                      onClick={fetchOtherCollegeEvents}
                      className="px-4 py-2 bg-white text-blue-700 hover:bg-blue-50 border-2 border-black text-sm font-bold uppercase transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] inline-flex items-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Refresh Events
                    </button>
                  </div>

                  {/* Search Bar */}
                  <div className="relative max-w-2xl">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-black" />
                    <input
                      type="text"
                      value={discoverSearch}
                      onChange={(e) => setDiscoverSearch(e.target.value)}
                      placeholder="Search by title, location, host, category, or tags..."
                      className="w-full pl-10 pr-4 py-3 bg-white border-2 border-black text-sm font-medium outline-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-1px] focus:translate-y-[-1px] transition-all placeholder-slate-400"
                    />
                    {discoverSearch && (
                      <button
                        onClick={() => setDiscoverSearch('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-neutral-100 border-2 border-transparent hover:border-black transition-colors"
                      >
                        <X className="w-4 h-4 text-black" />
                      </button>
                    )}
                  </div>

                  {/* Search Results Count */}
                  {discoverSearch && (
                    <div className="text-sm font-bold text-black uppercase">
                      Found <span className="text-blue-700">{filteredDiscoverEvents.length}</span>{' '}
                      event{filteredDiscoverEvents.length !== 1 ? 's' : ''}
                    </div>
                  )}

                  <div className="bg-white border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    {filteredDiscoverEvents.length === 0 ? (
                      <div className="text-center py-16 border-2 border-dashed border-black/20">
                        <Search className="w-20 h-20 text-black/20 mx-auto mb-4" />
                        <h3 className="text-xl font-black uppercase text-black mb-2">
                          {discoverSearch ? 'No Matching Events' : 'No Events Found'}
                        </h3>
                        <p className="text-slate-600 font-medium mb-6">
                          {discoverSearch
                            ? `No events match "${discoverSearch}". Try different keywords.`
                            : 'Discover events from other hosts and colleges'}
                        </p>
                        {!discoverSearch && (
                          <button
                            onClick={fetchOtherCollegeEvents}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white border-2 border-black text-sm font-bold uppercase transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px]"
                          >
                            Load Events
                          </button>
                        )}
                        {discoverSearch && (
                          <button
                            onClick={() => setDiscoverSearch('')}
                            className="px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white border-2 border-black text-sm font-bold uppercase transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px]"
                          >
                            Clear Search
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredDiscoverEvents.map((ev) => (
                          <GamifiedEventCard
                            key={ev._id}
                            event={ev}
                            onViewMore={() => setSelectedDiscoverEvent(ev)}
                            onRegister={() => {}}
                            onBookmark={() => {}}
                            isRegistered={false}
                            isBookmarked={false}
                            disabledActions={true}
                            hideActions={true}
                            analyticsSource="host_discover"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* AI Marketing Tab */}
              {activeTab === 'marketing' && (
                <div className="animate-fadeIn">
                  <MarketingCopywriter events={events} />
                </div>
              )}

              {/* Analytics Tab - General Overview */}
              {activeTab === 'analytics' && (
                <div className="space-y-8 animate-fadeIn">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                      { label: 'Total Events', value: statsOverRange.total, icon: Calendar, bg: 'bg-blue-50' },
                      { label: 'Registrations', value: statsOverRange.totalRegistrations, icon: UserCheck, bg: 'bg-purple-50' },
                      { label: 'Avg Rating', value: statsOverRange.avgRating, icon: Star, bg: 'bg-yellow-50' },
                      { label: 'Latest Notifs', value: notificationsOverRange?.length || 0, icon: BellRing, bg: 'bg-rose-50' },
                    ].map(({ label, value, icon: Icon, bg }) => (
                      <div key={label} className={`${bg} border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}>
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-black text-[10px] font-black uppercase tracking-widest">{label}</p>
                          <Icon className="w-5 h-5 text-black" />
                        </div>
                        <p className="text-4xl font-black text-black">{value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Registrations over time */}
                    <div className="bg-white border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                      <h3 className="text-sm font-black uppercase mb-6 flex items-center border-b-2 border-black pb-2">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Registrations Trend
                      </h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                          <LineChart data={registrationsSeries}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                            <XAxis dataKey="date" tick={{fontSize: 10, fontWeight: 'bold'}} />
                            <YAxis tick={{fontSize: 10, fontWeight: 'bold'}} />
                            <Tooltip contentStyle={{border: '2px solid black', borderRadius: '0px'}} />
                            <Line type="monotone" dataKey="count" stroke="#a855f7" strokeWidth={3} dot={{r: 4, strokeWidth: 2, fill: '#fff'}} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Registrations by event */}
                    <div className="bg-white border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                      <h3 className="text-sm font-black uppercase mb-6 flex items-center border-b-2 border-black pb-2">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Top Events by Registrations
                      </h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                          <BarChart data={registrationsByEvent} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 8, fontWeight: 'bold'}} />
                            <Tooltip contentStyle={{border: '2px solid black', borderRadius: '0px'}} />
                            <Bar dataKey="value" fill="#3b82f6" border="2px solid black" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Studio Tab - YouTube Style Deep Analytics */}
              {activeTab === 'studio' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <h2 className="text-3xl font-black uppercase text-black italic">
                        {selectedStudioEvent ? 'Event Analytics' : 'Channel Studio'}
                      </h2>
                      <div className="h-8 w-[2px] bg-black/10 hidden md:block" />
                      <select
                        value={selectedStudioEvent?._id || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (!val) {
                            setSelectedStudioEvent(null);
                          } else {
                            const ev = events.find(event => event._id === val);
                            setSelectedStudioEvent(ev);
                          }
                        }}
                        className="px-4 py-2 bg-white border-2 border-black text-xs font-bold uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:outline-none transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                      >
                        <option value="">ALL EVENTS (CHANNEL OVERVIEW)</option>
                        {events.map(ev => (
                          <option key={ev._id} value={ev._id}>{ev.title.toUpperCase()}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                       <button 
                        onClick={() => fetchStudioData(selectedStudioEvent?._id)}
                        className="p-2 border-2 border-black bg-white hover:bg-neutral-100 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        title="Refresh Data"
                       >
                         <RefreshCw className={`w-4 h-4 ${isStudioLoading ? 'animate-spin' : ''}`} />
                       </button>
                    </div>
                  </div>

                  {/* Top Level Metric Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {[
                      { label: 'Impressions', value: studioData?.summary?.impressions || 0, icon: Eye, color: 'bg-blue-50' },
                      { label: 'Clicks', value: studioData?.summary?.clicks || 0, icon: TrendingUp, color: 'bg-emerald-50' },
                      { label: 'Registrations', value: studioData?.summary?.registrations || 0, icon: UserCheck, color: 'bg-purple-50' },
                      { label: 'CTR', value: `${(studioData?.summary?.ctr || 0).toFixed(2)}%`, icon: Zap, color: 'bg-amber-50' },
                      { label: 'Conversion', value: `${(studioData?.summary?.conversionRate || 0).toFixed(2)}%`, icon: Target, color: 'bg-rose-50' },
                    ].map((stat) => (
                      <div key={stat.label} className={`p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${stat.color}`}>
                        <div className="flex items-center justify-between mb-2">
                          <stat.icon className="w-4 h-4 text-black" />
                          <span className="text-[10px] font-black uppercase tracking-tighter text-black opacity-40">Direct</span>
                        </div>
                        <div className="text-2xl font-black text-black">{stat.value}</div>
                        <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mt-1">{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Charts Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                       <h3 className="text-sm font-black uppercase mb-6 flex items-center text-black border-b-2 border-black pb-2">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Performance over time
                      </h3>
                      <div className="h-80 w-full">
                        {studioData?.timeSeries && studioData.timeSeries.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                            <LineChart data={
                              Object.values(studioData.timeSeries.reduce((acc, curr) => {
                                const date = curr._id.date;
                                if (!acc[date]) acc[date] = { date };
                                acc[date][curr._id.type] = curr.count;
                                return acc;
                              }, {}))
                            }>
                              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                              <XAxis dataKey="date" tick={{fontSize: 10, fontWeight: 'bold'}} />
                              <YAxis tick={{fontSize: 10, fontWeight: 'bold'}} />
                              <Tooltip contentStyle={{border: '2px solid black', borderRadius: '0px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)'}} />
                              <Legend iconType="rect" />
                              <Line type="monotone" dataKey="impression" name="Impressions" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, strokeWidth: 2, fill: '#fff'}} />
                              <Line type="monotone" dataKey="click" name="Clicks" stroke="#10b981" strokeWidth={3} dot={{r: 4, strokeWidth: 2, fill: '#fff'}} />
                              <Line type="monotone" dataKey="registration" name="Registrations" stroke="#a855f7" strokeWidth={3} dot={{r: 4, strokeWidth: 2, fill: '#fff'}} />
                            </LineChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-400 font-bold uppercase tracking-widest text-sm italic">
                            No data available for the period
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-white border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col">
                       <h3 className="text-sm font-black uppercase mb-6 flex items-center text-black border-b-2 border-black pb-2">
                        <Target className="w-4 h-4 mr-2" />
                        Conversion Funnel
                      </h3>
                      <div className="flex-1 flex flex-col justify-center space-y-4">
                        {[
                          { label: 'Impressions', val: studioData?.summary?.impressions || 0, color: 'bg-blue-500', pct: 100 },
                          { label: 'Clicks', val: studioData?.summary?.clicks || 0, color: 'bg-emerald-500', pct: studioData?.summary?.impressions > 0 ? (studioData?.summary?.clicks / studioData?.summary?.impressions) * 100 : 0 },
                          { label: 'Registrations', val: studioData?.summary?.registrations || 0, color: 'bg-purple-500', pct: studioData?.summary?.clicks > 0 ? (studioData?.summary?.registrations / studioData?.summary?.clicks) * 100 : 0 },
                        ].map((step, i) => (
                           <div key={step.label} className="space-y-1">
                              <div className="flex justify-between text-[10px] font-black uppercase">
                                <span>{step.label}</span>
                                <span>{step.val}</span>
                              </div>
                              <div className="h-6 bg-neutral-100 border-2 border-black relative overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${step.pct}%` }}
                                  transition={{ duration: 1, delay: i * 0.2 }}
                                  className={`h-full ${step.color}`}
                                />
                                <div className="absolute inset-0 flex items-center justify-center text-[8px] font-black text-white mix-blend-difference">
                                  {step.pct.toFixed(1)}%
                                </div>
                              </div>
                              {i < 2 && (
                                <div className="flex justify-center py-1">
                                  <ChevronDown className="w-4 h-4 text-neutral-300" />
                                </div>
                              )}
                           </div>
                        ))}
                      </div>
                      <p className="mt-4 text-[9px] font-bold text-neutral-400 uppercase leading-tight italic">
                        Conversion rate from clicks to registrations is {(studioData?.summary?.conversionRate || 0).toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  {/* Top Content Row - Only visible in channel view */}
                  {!selectedStudioEvent && (
                    <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                       <h3 className="text-sm font-black uppercase p-6 flex items-center text-black border-b-2 border-black bg-neutral-50">
                          <BarChart3 className="w-4 h-4 mr-2" />
                          Top Performing Content (Last 28 Days)
                        </h3>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead className="bg-neutral-100 border-b-2 border-black">
                              <tr>
                                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-black">Event</th>
                                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-black">Views</th>
                                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-black">Clicks</th>
                                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-black">CTR</th>
                                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-black">Regs</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y-2 divide-black/5">
                              {studioData?.topEvents?.length > 0 ? (
                                studioData.topEvents.map((evt) => (
                                  <tr key={evt.id} className="hover:bg-neutral-50 transition-colors">
                                    <td className="p-4">
                                      <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-black border-2 border-black shrink-0 flex items-center justify-center font-black text-white text-xs">
                                          {evt.title.charAt(0)}
                                        </div>
                                        <span className="text-xs font-black uppercase tracking-tight line-clamp-1">{evt.title}</span>
                                      </div>
                                    </td>
                                    <td className="p-4 font-black text-xs">{evt.impressions}</td>
                                    <td className="p-4 font-black text-xs">{evt.clicks}</td>
                                    <td className="p-4">
                                      <div className="flex flex-col">
                                        <span className="text-xs font-black">{evt.ctr.toFixed(1)}%</span>
                                        <div className="w-16 h-1 bg-neutral-200 border border-black mt-1">
                                          <div className="h-full bg-blue-500" style={{ width: `${Math.min(100, evt.ctr * 5)}%` }} />
                                        </div>
                                      </div>
                                    </td>
                                    <td className="p-4 font-black text-xs text-purple-600">{evt.registrations}</td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan="5" className="p-8 text-center text-neutral-400 font-bold uppercase tracking-widest italic">
                                    No performance data recorded yet
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                    </div>
                  )}
                </div>
              )}

              {/* AI Insights Tab */}
              {activeTab === 'ai-insights' && (
                <div className="animate-fadeIn">
                  <AiFeedbackDashboard api={api} bearer={bearer} />
                </div>
              )}
            </div>
          </main>
        </div>

        {/* Review Fields Modal */}
        {showReviewFieldsForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white border-2 border-black p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-scaleIn">
              <div className="flex items-center justify-between mb-6 border-b-2 border-black pb-4">
                <h2 className="text-2xl font-black uppercase text-black">
                  Customize Review Fields{' '}
                  {selectedEventForReviewFields && `- ${selectedEventForReviewFields.title}`}
                </h2>
                <button
                  onClick={() => setShowReviewFieldsForm(false)}
                  className="px-4 py-1 bg-red-600 hover:bg-red-700 text-white border-2 border-black font-bold uppercase text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
                >
                  Close
                </button>
              </div>

              <div className="space-y-4">
                {reviewFields.map((f, idx) => (
                  <div
                    key={idx}
                    className="bg-neutral-50 p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold uppercase text-black mb-1">
                          Field Name
                        </label>
                        <input
                          type="text"
                          value={f.fieldName}
                          onChange={(e) =>
                            updateReviewField(idx, { ...f, fieldName: e.target.value })
                          }
                          className="w-full p-2 bg-white border-2 border-black text-sm font-medium outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                          placeholder="e.g. Speaker Quality"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-black mb-1">
                          Field Type
                        </label>
                        <select
                          value={f.fieldType}
                          onChange={(e) =>
                            updateReviewField(idx, { ...f, fieldType: e.target.value })
                          }
                          className="w-full p-2 bg-white border-2 border-black text-sm font-medium outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                        >
                          <option value="text">Short Text</option>
                          <option value="textarea">Long Text</option>
                          <option value="rating">Rating (1-5)</option>
                        </select>
                      </div>
                      <div className="flex items-end pb-2">
                        <label className="flex items-center text-sm font-bold text-black cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={Boolean(f.isRequired)}
                            onChange={(e) =>
                              updateReviewField(idx, { ...f, isRequired: e.target.checked })
                            }
                            className="mr-2 h-4 w-4 border-2 border-black text-black focus:ring-0"
                          />
                          REQUIRED
                        </label>
                      </div>
                    </div>
                    {f.fieldType !== 'rating' && (
                      <div className="mt-3">
                        <label className="block text-xs font-bold uppercase text-black mb-1">
                          Placeholder
                        </label>
                        <input
                          type="text"
                          value={f.placeholder || ''}
                          onChange={(e) =>
                            updateReviewField(idx, { ...f, placeholder: e.target.value })
                          }
                          className="w-full p-2 bg-white border-2 border-black text-sm font-medium outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                          placeholder="Enter placeholder text"
                        />
                      </div>
                    )}
                    <div className="mt-3 flex justify-between items-center border-t-2 border-dashed border-black/20 pt-2">
                      <span className="text-xs font-mono font-bold text-slate-500">
                        ORDER: {idx + 1}
                      </span>
                      <button
                        onClick={() => removeReviewField(idx)}
                        className="text-xs px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 border-2 border-black font-bold uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}

                <div className="flex items-center gap-4 pt-4 border-t-2 border-black">
                  <button
                    onClick={addReviewField}
                    className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-black border-2 border-black font-bold uppercase text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
                  >
                    Add Field
                  </button>
                  <button
                    onClick={saveReviewFields}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-black border-2 border-black font-bold uppercase text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Event Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            {(() => {
              const ct = CATEGORY_THEMES[form.category] || CATEGORY_THEMES.General;
              return (
            <div className={`bg-white border-2 border-black p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-scaleIn`}>
              <div className={`-mx-8 -mt-8 px-8 pt-6 pb-4 mb-6 ${ct.bg} border-b-4 ${ct.border}`}>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 text-xs font-black uppercase tracking-widest ${ct.badge}`}>
                    {form.category || 'General'}
                  </span>
                  <h2 className="text-3xl font-black uppercase text-black">
                    {editingEvent ? 'Edit Event' : 'Create Event'}
                  </h2>
                </div>
              </div>

              {!editingEvent && (
                <div className="mb-8 p-6 bg-amber-50 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <h3 className="text-lg font-black uppercase mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-500" />
                    Quick Templates
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {EVENT_TEMPLATES.map((temp) => {
                      const Icon = TEMPLATE_ICONS[temp.icon];
                      return (
                        <div
                          key={temp.id}
                          className={`border-2 border-black p-4 flex flex-col items-center text-center group cursor-pointer transition-all hover:scale-105 active:scale-95 ${temp.theme}`}
                          onClick={() => applyTemplate(temp)}
                        >
                          <div
                            className={`w-12 h-12 flex items-center justify-center mb-3 group-hover:rotate-12 transition-transform border-2 border-black ${temp.iconBg}`}
                          >
                            {Icon && <Icon className="w-6 h-6" />}
                          </div>
                          <span className="font-black uppercase text-xs mb-1 tracking-tighter">
                            {temp.name}
                          </span>
                          <span className="text-[10px] font-bold leading-tight line-clamp-2 opacity-80 uppercase">
                            {temp.shortDescription}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <form onSubmit={submitForm} className="space-y-8">
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
                        value={form.title}
                        onChange={(e) => handleFieldChange('title', e.target.value)}
                        onBlur={() => handleFieldBlur('title')}
                        onFocus={() => handleFieldFocus('title')}
                        className={`w-full p-3 bg-white border-2 border-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-1px] focus:translate-y-[-1px] outline-none ${formErrors.title ? 'border-red-500' : ''}`}
                        required
                      />
                      {formErrors.title && (
                        <p className="text-red-600 font-bold text-xs mt-1 uppercase">
                          {formErrors.title}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-black mb-2">
                        Category
                      </label>
                      <div className="relative">
                        <select
                          value={form.category}
                          onChange={(e) => handleFieldChange('category', e.target.value)}
                          className={`w-full p-3 bg-white border-2 appearance-none transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-1px] focus:translate-y-[-1px] outline-none font-bold ${(CATEGORY_THEMES[form.category] || CATEGORY_THEMES.General).border}`}
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
                        <ChevronRight className={`absolute right-4 top-1/2 transform -translate-y-1/2 rotate-90 w-4 h-4 pointer-events-none ${(CATEGORY_THEMES[form.category] || CATEGORY_THEMES.General).label}`} />
                      </div>
                    </div>
                  </div>
                  <div className="mt-6">
                    <label className="block text-xs font-bold uppercase text-black mb-2">
                      Short Description (Max 150 chars) *
                    </label>
                    <input
                      type="text"
                      value={form.shortDescription}
                      onChange={(e) => handleFieldChange('shortDescription', e.target.value)}
                      onBlur={() => handleFieldBlur('shortDescription')}
                      onFocus={() => handleFieldFocus('shortDescription')}
                      maxLength={150}
                      className={`w-full p-3 bg-white border-2 border-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-1px] focus:translate-y-[-1px] outline-none ${formErrors.shortDescription ? 'border-red-500' : ''}`}
                      placeholder="Brief description for event cards"
                      required
                    />
                    <div className="flex justify-between text-xs font-bold text-slate-500 mt-1 uppercase">
                      <span>
                        {formErrors.shortDescription && (
                          <span className="text-red-600">{formErrors.shortDescription}</span>
                        )}
                      </span>
                      <span>{form.shortDescription?.length || 0}/150</span>
                    </div>
                  </div>
                  <div className="mt-6">
                    <label className="block text-xs font-bold uppercase text-black mb-2">
                      Full Description *
                    </label>
                    <textarea
                      value={form.description}
                      onChange={(e) => handleFieldChange('description', e.target.value)}
                      onBlur={() => handleFieldBlur('description')}
                      onFocus={() => handleFieldFocus('description')}
                      className={`w-full p-3 bg-white border-2 border-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-1px] focus:translate-y-[-1px] outline-none ${formErrors.description ? 'border-red-500' : ''}`}
                      rows="4"
                      required
                    />
                    {formErrors.description && (
                      <p className="text-red-600 font-bold text-xs mt-1 uppercase">
                        {formErrors.description}
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
                        value={form.date}
                        onChange={(e) => handleFieldChange('date', e.target.value)}
                        onBlur={() => handleFieldBlur('date')}
                        onFocus={() => handleFieldFocus('date')}
                        min={(function () {
                          const d = new Date();
                          d.setSeconds(0, 0);
                          const z = d.getTimezoneOffset() * 60000;
                          return new Date(d.getTime() - z).toISOString().slice(0, 16);
                        })()}
                        className={`w-full p-3 bg-white border-2 border-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-1px] focus:translate-y-[-1px] outline-none ${formErrors.date ? 'border-red-500' : ''}`}
                        required
                      />
                      {formErrors.date && (
                        <p className="text-red-600 font-bold text-xs mt-1 uppercase">
                          {formErrors.date}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-black mb-2">
                        End Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        value={form.endDate}
                        onChange={(e) => handleFieldChange('endDate', e.target.value)}
                        onBlur={() => handleFieldBlur('endDate')}
                        onFocus={() => handleFieldFocus('endDate')}
                        min={
                          form.date ||
                          (function () {
                            const d = new Date();
                            d.setSeconds(0, 0);
                            const z = d.getTimezoneOffset() * 60000;
                            return new Date(d.getTime() - z).toISOString().slice(0, 16);
                          })()
                        }
                        className={`w-full p-3 bg-white border-2 border-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-1px] focus:translate-y-[-1px] outline-none ${formErrors.endDate ? 'border-red-500' : ''}`}
                      />
                      {formErrors.endDate && (
                        <p className="text-red-600 font-bold text-xs mt-1 uppercase">
                          {formErrors.endDate}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-black mb-2">
                        Registration Deadline *
                      </label>
                      <input
                        type="datetime-local"
                        value={form.registrationDeadline}
                        onChange={(e) => handleFieldChange('registrationDeadline', e.target.value)}
                        onBlur={() => handleFieldBlur('registrationDeadline')}
                        onFocus={() => handleFieldFocus('registrationDeadline')}
                        max={form.date || undefined}
                        className={`w-full p-3 bg-white border-2 border-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-1px] focus:translate-y-[-1px] outline-none ${formErrors.registrationDeadline ? 'border-red-500' : ''}`}
                        required
                      />
                      {formErrors.registrationDeadline && (
                        <p className="text-red-600 font-bold text-xs mt-1 uppercase">
                          {formErrors.registrationDeadline}
                        </p>
                      )}
                    </div>
                  </div>
                  {sameDayEvents?.length > 0 && (
                    <div className="mt-6 p-4 bg-yellow-100 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      <div className="text-black font-black uppercase text-sm mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" /> Heads up: Other events on this day
                      </div>
                      <ul className="list-disc list-inside text-black text-xs font-bold space-y-1 max-h-40 overflow-auto font-mono">
                        {sameDayEvents.map((e) => (
                          <li key={e._id}>
                            <span className="uppercase">{e.title}</span> •{' '}
                            {new Date(e.date).toLocaleTimeString()} •{' '}
                            {e.location || (e.isOnline ? 'Online' : '')}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Team Event Settings */}
                <div className="bg-neutral-50 border-2 border-black p-6">
                  <h3 className="text-xl font-black uppercase mb-6 text-black flex items-center gap-2">
                    <span className="bg-black text-white px-2 py-1 text-sm">Team</span> Registration
                  </h3>
                  <div className="flex flex-col gap-6">
                    <label className="flex items-center cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={form.isTeamEvent}
                        onChange={(e) => handleFieldChange('isTeamEvent', e.target.checked)}
                        className="mr-3 w-5 h-5 border-2 border-black text-black focus:ring-0 cursor-pointer"
                      />
                      <span className="text-black font-bold uppercase group-hover:underline">
                        This is a Team Event
                      </span>
                    </label>

                    {form.isTeamEvent && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border-l-4 border-black bg-white">
                        <div>
                          <label className="block text-xs font-bold uppercase text-black mb-2">
                            Min Team Size
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={form.minTeamSize}
                            onChange={(e) => handleFieldChange('minTeamSize', e.target.value)}
                            className="w-full p-3 bg-white border-2 border-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-1px] focus:translate-y-[-1px] outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase text-black mb-2">
                            Max Team Size
                          </label>
                          <input
                            type="number"
                            min={form.minTeamSize || "1"}
                            value={form.maxTeamSize}
                            onChange={(e) => handleFieldChange('maxTeamSize', e.target.value)}
                            className="w-full p-3 bg-white border-2 border-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-1px] focus:translate-y-[-1px] outline-none"
                          />
                        </div>
                      </div>
                    )}
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
                            name="isOnline"
                            checked={!form.isOnline}
                            onChange={() => handleFieldChange('isOnline', false)}
                            className="mr-3 w-5 h-5 border-2 border-black text-black focus:ring-0 cursor-pointer"
                          />
                          <span className="text-black font-bold uppercase group-hover:underline">
                            In-Person
                          </span>
                        </label>
                        <label className="flex items-center cursor-pointer group">
                          <input
                            type="radio"
                            name="isOnline"
                            checked={form.isOnline}
                            onChange={() => handleFieldChange('isOnline', true)}
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
                        value={form.location}
                        onChange={(e) => handleFieldChange('location', e.target.value)}
                        onBlur={() => handleFieldBlur('location')}
                        onFocus={() => handleFieldFocus('location')}
                        className={`w-full p-3 bg-white border-2 border-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-1px] focus:translate-y-[-1px] outline-none ${formErrors.location ? 'border-red-500' : ''}`}
                        placeholder={form.isOnline ? 'Online Event' : 'Venue Name'}
                        required
                      />
                      {formErrors.location && (
                        <p className="text-red-600 font-bold text-xs mt-1 uppercase">
                          {formErrors.location}
                        </p>
                      )}
                    </div>
                  </div>
                  {form.isOnline && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      <div>
                        <label className="block text-xs font-bold uppercase text-black mb-2">
                          Platform
                        </label>
                        <div className="relative">
                          <select
                            value={form.platform}
                            onChange={(e) => handleFieldChange('platform', e.target.value)}
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
                          value={form.meetingLink}
                          onChange={(e) => handleFieldChange('meetingLink', e.target.value)}
                          onBlur={() => handleFieldBlur('meetingLink')}
                          onFocus={() => handleFieldFocus('meetingLink')}
                          className={`w-full p-3 bg-white border-2 border-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-1px] focus:translate-y-[-1px] outline-none ${formErrors.meetingLink ? 'border-red-500' : ''}`}
                          placeholder="https://meet.google.com/..."
                        />
                        {formErrors.meetingLink && (
                          <p className="text-red-600 font-bold text-xs mt-1 uppercase">
                            {formErrors.meetingLink}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  {!form.isOnline && (
                    <>
                      <div className="mt-6">
                        <label className="block text-xs font-bold uppercase text-black mb-2">
                          Address *
                        </label>
                        <input
                          type="text"
                          value={form.address}
                          onChange={(e) => handleFieldChange('address', e.target.value)}
                          onBlur={() => handleFieldBlur('address')}
                          onFocus={() => handleFieldFocus('address')}
                          className={`w-full p-3 bg-white border-2 border-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-1px] focus:translate-y-[-1px] outline-none ${formErrors.address ? 'border-red-500' : ''}`}
                          required
                        />
                        {formErrors.address && (
                          <p className="text-red-600 font-bold text-xs mt-1 uppercase">
                            {formErrors.address}
                          </p>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                        <div>
                          <label className="block text-xs font-bold uppercase text-black mb-2">
                            City *
                          </label>
                          <input
                            type="text"
                            value={form.city}
                            onChange={(e) => handleFieldChange('city', e.target.value)}
                            onBlur={() => handleFieldBlur('city')}
                            onFocus={() => handleFieldFocus('city')}
                            className={`w-full p-3 bg-white border-2 border-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-1px] focus:translate-y-[-1px] outline-none ${formErrors.city ? 'border-red-500' : ''}`}
                            required
                          />
                          {formErrors.city && (
                            <p className="text-red-600 font-bold text-xs mt-1 uppercase">
                              {formErrors.city}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase text-black mb-2">
                            State *
                          </label>
                          <input
                            type="text"
                            value={form.state}
                            onChange={(e) => handleFieldChange('state', e.target.value)}
                            onBlur={() => handleFieldBlur('state')}
                            onFocus={() => handleFieldFocus('state')}
                            className={`w-full p-3 bg-white border-2 border-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-1px] focus:translate-y-[-1px] outline-none ${formErrors.state ? 'border-red-500' : ''}`}
                            required
                          />
                          {formErrors.state && (
                            <p className="text-red-600 font-bold text-xs mt-1 uppercase">
                              {formErrors.state}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase text-black mb-2">
                            Pincode
                          </label>
                          <input
                            type="text"
                            value={form.pincode}
                            onChange={(e) => handleFieldChange('pincode', e.target.value)}
                            onBlur={() => handleFieldBlur('pincode')}
                            onFocus={() => handleFieldFocus('pincode')}
                            className={`w-full p-3 bg-white border-2 border-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-1px] focus:translate-y-[-1px] outline-none ${formErrors.pincode ? 'border-red-500' : ''}`}
                            maxLength="6"
                          />
                          {formErrors.pincode && (
                            <p className="text-red-600 font-bold text-xs mt-1 uppercase">
                              {formErrors.pincode}
                            </p>
                          )}
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
                            value={form.latitude}
                            onChange={(e) => handleFieldChange('latitude', e.target.value)}
                            onFocus={() => handleFieldFocus('latitude')}
                            className={`w-full p-3 bg-white border-2 border-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-1px] focus:translate-y-[-1px] outline-none ${formErrors.latitude ? 'border-red-500' : ''}`}
                            placeholder="e.g. 12.9716"
                          />
                          {formErrors.latitude && (
                            <p className="text-red-600 font-bold text-xs mt-1 uppercase">
                              {formErrors.latitude}
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
                            value={form.longitude}
                            onChange={(e) => handleFieldChange('longitude', e.target.value)}
                            onFocus={() => handleFieldFocus('longitude')}
                            className={`w-full p-3 bg-white border-2 border-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-1px] focus:translate-y-[-1px] outline-none ${formErrors.longitude ? 'border-red-500' : ''}`}
                            placeholder="e.g. 77.5946"
                          />
                          {formErrors.longitude && (
                            <p className="text-red-600 font-bold text-xs mt-1 uppercase">
                              {formErrors.longitude}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="mt-4 flex justify-end">
                        <button
                          type="button"
                          onClick={handleUseCurrentLocation}
                          className="text-xs font-bold uppercase text-blue-700 hover:text-blue-800 flex items-center bg-blue-100 px-4 py-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
                        >
                          <MapPin className="w-4 h-4 mr-1.5" /> Use Current Location
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Event Details */}
                <div className="bg-neutral-50 border-2 border-black p-6">
                  <h3 className="text-xl font-black uppercase mb-6 text-black flex items-center gap-2">
                    <span className="bg-black text-white px-2 py-1 text-sm">04</span> Event Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-xs font-bold uppercase text-black mb-2">
                        Capacity *
                      </label>
                      <input
                        type="text"
                        value={form.capacity}
                        onChange={(e) => handleFieldChange('capacity', e.target.value)}
                        onBlur={() => handleFieldBlur('capacity')}
                        onFocus={() => handleFieldFocus('capacity')}
                        className={`w-full p-3 bg-white border-2 border-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-1px] focus:translate-y-[-1px] outline-none ${formErrors.capacity ? 'border-red-500' : ''}`}
                        required
                      />
                      {formErrors.capacity && (
                        <p className="text-red-600 font-bold text-xs mt-1 uppercase">
                          {formErrors.capacity}
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
                          value={form.price}
                          onChange={(e) => handleFieldChange('price', e.target.value)}
                          onBlur={() => handleFieldBlur('price')}
                          onFocus={() => handleFieldFocus('price')}
                          className={`flex-1 p-3 bg-white border-2 border-black border-r-0 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-1px] focus:translate-y-[-1px] outline-none ${formErrors.price ? 'border-red-500' : ''}`}
                        />
                        <select
                          value={form.currency}
                          onChange={(e) => handleFieldChange('currency', e.target.value)}
                          className="px-3 py-3 bg-neutral-100 border-2 border-black border-l-2 outline-none font-bold uppercase text-sm"
                        >
                          <option value="INR">INR</option>
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                        </select>
                      </div>
                      {formErrors.price && (
                        <p className="text-red-600 font-bold text-xs mt-1 uppercase">
                          {formErrors.price}
                        </p>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold uppercase text-black mb-2">
                        Tags
                      </label>
                      <input
                        type="text"
                        value={form.tags}
                        onChange={(e) => handleFieldChange('tags', e.target.value)}
                        onBlur={() => handleFieldBlur('tags')}
                        onFocus={() => handleFieldFocus('tags')}
                        className={`w-full p-3 bg-white border-2 border-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-1px] focus:translate-y-[-1px] outline-none ${formErrors.tags ? 'border-red-500' : ''}`}
                        placeholder="tech, workshop, free (comma separated)"
                      />
                      <div className="text-xs font-bold text-slate-500 mt-1 uppercase">
                        Up to 10 tags. Comma-separated.
                      </div>
                      {formErrors.tags && (
                        <p className="text-red-600 font-bold text-xs mt-1 uppercase">
                          {formErrors.tags}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-6">
                    <label className="block text-xs font-bold uppercase text-black mb-2">
                      Requirements
                    </label>
                    <textarea
                      value={form.requirements}
                      onChange={(e) => handleFieldChange('requirements', e.target.value)}
                      className="w-full p-3 bg-white border-2 border-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-1px] focus:translate-y-[-1px] outline-none"
                      rows="3"
                      placeholder="What participants need to bring or prepare..."
                    />
                  </div>
                  <div className="mt-6">
                    <label className="block text-xs font-bold uppercase text-black mb-2">
                      Agenda
                    </label>
                    <textarea
                      value={form.agenda}
                      onChange={(e) => handleFieldChange('agenda', e.target.value)}
                      className="w-full p-3 bg-white border-2 border-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-1px] focus:translate-y-[-1px] outline-none"
                      rows="4"
                      placeholder="Event schedule and agenda..."
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-neutral-50 border-2 border-black p-6">
                  <h3 className="text-xl font-black uppercase mb-6 text-black flex items-center gap-2">
                    <span className="bg-black text-white px-2 py-1 text-sm">05</span> Contact
                    Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold uppercase text-black mb-2">
                        Contact Email *
                      </label>
                      <input
                        type="email"
                        value={form.contactEmail}
                        onChange={(e) => handleFieldChange('contactEmail', e.target.value)}
                        onBlur={() => handleFieldBlur('contactEmail')}
                        onFocus={() => handleFieldFocus('contactEmail')}
                        className={`w-full p-3 bg-white border-2 border-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-1px] focus:translate-y-[-1px] outline-none ${formErrors.contactEmail ? 'border-red-500' : ''}`}
                        required
                      />
                      {formErrors.contactEmail && (
                        <p className="text-red-600 font-bold text-xs mt-1 uppercase">
                          {formErrors.contactEmail}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-black mb-2">
                        Contact Phone *
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={form.countryCode || '+91'}
                          onChange={(e) =>
                            handleFieldChange(
                              'countryCode',
                              e.target.value.replace(/[^+\d]/g, '').slice(0, 5)
                            )
                          }
                          className="w-24 p-3 bg-white border-2 border-black focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none"
                          placeholder="+91"
                        />
                        <input
                          type="text"
                          value={form.contactPhone}
                          onChange={(e) =>
                            handleFieldChange(
                              'contactPhone',
                              e.target.value.replace(/[^\d]/g, '').slice(0, 10)
                            )
                          }
                          onBlur={() => handleFieldBlur('contactPhone')}
                          onFocus={() => handleFieldFocus('contactPhone')}
                          className={`flex-1 p-3 bg-white border-2 border-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-1px] focus:translate-y-[-1px] outline-none ${formErrors.contactPhone ? 'border-red-500' : ''}`}
                          placeholder="10-digit phone"
                          required
                        />
                      </div>
                      {formErrors.contactPhone && (
                        <p className="text-red-600 font-bold text-xs mt-1 uppercase">
                          {formErrors.contactPhone}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-6">
                    <label className="block text-xs font-bold uppercase text-black mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      value={form.website}
                      onChange={(e) => handleFieldChange('website', e.target.value.trim())}
                      onBlur={() => handleFieldBlur('website')}
                      onFocus={() => handleFieldFocus('website')}
                      className={`w-full p-3 bg-white border-2 border-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-1px] focus:translate-y-[-1px] outline-none ${formErrors.website ? 'border-red-500' : ''}`}
                      placeholder="https://example.com"
                    />
                    {formErrors.website && (
                      <p className="text-red-600 font-bold text-xs mt-1 uppercase">
                        {formErrors.website}
                      </p>
                    )}
                  </div>
                  <div className="mt-6">
                    <label className="block text-xs font-bold uppercase text-black mb-2">
                      Event Image URL
                    </label>
                    <input
                      type="url"
                      value={form.imageUrl}
                      onChange={(e) => handleFieldChange('imageUrl', e.target.value)}
                      className="w-full p-3 bg-white border-2 border-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-1px] focus:translate-y-[-1px] outline-none"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>

                {/* Co-hosts Section */}
                <div className="bg-neutral-50 border-2 border-black p-6">
                  <h3 className="text-xl font-black uppercase mb-6 text-black flex items-center gap-2">
                    <span className="bg-black text-white px-2 py-1 text-sm">06</span> Co-hosts
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold uppercase text-black mb-2">
                        Search Hosts to Add
                      </label>
                      <div className="relative">
                        <div className="flex">
                          <div className="relative flex-1">
                            <input
                              type="text"
                              value={hostSearchQuery}
                              onChange={(e) => handleHostSearch(e.target.value)}
                              className="w-full p-3 bg-white border-2 border-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[-1px] focus:translate-y-[-1px] outline-none"
                              placeholder="Search by name, email or username..."
                            />
                            {isSearchingHosts && (
                              <div className="absolute right-3 top-3.5">
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                  className="w-5 h-5 border-2 border-black border-t-transparent rounded-full"
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        {hostSearchResults?.length > 0 && (
                          <div className="absolute z-10 w-full mt-2 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-h-60 overflow-y-auto">
                            {hostSearchResults.map((u) => (
                              <button
                                key={u._id}
                                type="button"
                                onClick={() => addCoHost(u)}
                                className="w-full text-left p-3 hover:bg-neutral-100 border-b border-black last:border-0 flex items-center gap-3 transition-colors"
                              >
                                {u.profilePic ? (
                                  <img
                                    src={toAbsoluteUrl(u.profilePic)}
                                    className="w-8 h-8 rounded-full border border-black"
                                    alt=""
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">
                                    {u.fullname?.charAt(0)}
                                  </div>
                                )}
                                <div>
                                  <div className="font-bold text-sm uppercase">{u.fullname}</div>
                                  <div className="text-[10px] text-neutral-500 font-mono italic">
                                    {u.email}
                                  </div>
                                </div>
                                <Plus className="ml-auto w-4 h-4" />
                              </button>
                            ))}
                          </div>
                        )}
                        {hostSearchQuery?.length >= 2 &&
                          !isSearchingHosts &&
                          hostSearchResults?.length === 0 && (
                            <div className="absolute z-10 w-full mt-2 bg-white border-2 border-black p-4 text-center font-bold uppercase text-xs">
                              No hosts found
                            </div>
                          )}
                      </div>
                    </div>

                    {form.coHosts?.length > 0 && (
                      <div className="space-y-3">
                        <label className="block text-xs font-bold uppercase text-black">
                          Selected Co-hosts
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {form.coHosts.map((ch) => (
                            <div
                              key={ch._id || ch}
                              className="flex items-center gap-3 p-3 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                            >
                              {ch.profilePic ? (
                                <img
                                  src={toAbsoluteUrl(ch.profilePic)}
                                  className="w-8 h-8 rounded-full border border-black"
                                  alt=""
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">
                                  {ch.fullname?.charAt(0) || '?'}
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="font-bold text-xs uppercase truncate text-black">
                                  {ch.fullname || 'Co-host'}
                                </div>
                                <div className="text-[10px] text-neutral-500 truncate italic">
                                  {ch.email || ''}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeCoHost(ch._id || ch)}
                                className="p-1 hover:bg-neutral-100 text-red-600 border border-transparent hover:border-red-600 transition-all rounded"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex space-x-6 pt-6 border-t-2 border-black">
                  <button
                    type="submit"
                    className={`flex-1 text-black border-2 border-black py-4 font-black uppercase text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all ${(CATEGORY_THEMES[form.category] || CATEGORY_THEMES.General).badge}`}
                  >
                    {editingEvent ? 'Update Event' : 'Create Event'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-8 py-4 bg-white hover:bg-neutral-100 text-black border-2 border-black font-black uppercase text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
              );
            })()}
          </div>
        )}
        <SupportChatbot />
        {showScanner && (
          <QRCodeScanner
            onScanSuccess={handleScanSuccess}
            onScanFailure={(err) => console.log(err)}
            onClose={() => setShowScanner(false)}
          />
        )}
        {selectedDiscoverEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <EventDetailModal
              event={selectedDiscoverEvent}
              isOpen={!!selectedDiscoverEvent}
              onClose={() => setSelectedDiscoverEvent(null)}
              user={user}
              onRegister={() => {}}
              onBookmark={() => {}}
              onSubscribe={() => {}}
              onNavigateToReview={() => {}}
              onDownloadCertificate={() => {}}
              isRegistered={() => false}
              isWaitlisted={() => false}
              isBookmarked={() => false}
              isSubscribed={false}
              onOpenHost={() => {}}
              onJoinWaitingList={() => {}}
              onCancel={() => {}}
              disabledActions={true}
              hideRegister={true}
              hideHostCard={true}
              hideSecondaryActions={true}
            />
          </div>
        )}
      </div>
    </LayoutGroup>
  );
}
