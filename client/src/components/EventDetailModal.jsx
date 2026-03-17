import React, { useEffect, useState, useMemo } from 'react';
import config from '../config';
import api from '../utils/api';
import { logEvent } from '../utils/analytics';
import {
  X,
  Calendar,
  MapPin,
  Clock,
  Users,
  Tag,
  Globe,
  Phone,
  Mail,
  CreditCard,
  Bookmark,
  BookmarkCheck,
  Building2,
  MessageSquare,
  Trophy,
  CheckCircle,
  ExternalLink,
  Lock,
  Share2,
  Navigation,
  FileText,
  Sparkles,
  Camera,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import FriendSelectorModal from './FriendSelectorModal';
import { getImageUrl } from '../utils/imageUtils';
import MemoriesHub from './events/MemoriesHub';

const EventDetailModal = ({
  event,
  isOpen,
  onClose,
  user,
  onRegister,
  onBookmark,
  onSubscribe,
  onNavigateToReview,
  onDownloadCertificate,
  isRegistered,
  isWaitlisted,
  isBookmarked,
  isSubscribed,
  onOpenHost,
  onJoinWaitingList,
  onCancel,
  certificateId,
  isAttended,
  disabledActions = false,
  hideRegister = false,
  hideHostCard = false,
  hideSecondaryActions = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [friendSelectorOpen, setFriendSelectorOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'memories'
  const navigate = useNavigate();

  const isToday = useMemo(() => {
    if (!event?.date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const evDate = new Date(event.date);
    evDate.setHours(0, 0, 0, 0);
    return today.getTime() === evDate.getTime();
  }, [event?.date]);

  const showMemoriesTab = event?.isCompleted || isToday;

  const [mySquads, setMySquads] = useState([]);
  const [loadingSquads, setLoadingSquads] = useState(false);
  const [selectedSquad, setSelectedSquad] = useState('');

  useEffect(() => {
    if (isOpen && event?.isTeamEvent && user) {
      fetchMySquads();
    }
  }, [isOpen, event, user]);

  // Track impression whenever the modal opens
  useEffect(() => {
    if (isOpen && event?._id) {
      logEvent({ eventId: event._id, type: 'impression', source: 'modal' });
    }
  }, [isOpen, event?._id]);

  const fetchMySquads = async () => {
    try {
      setLoadingSquads(true);
      const res = await api.get('/api/squads/mine', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setMySquads(res.data || []);

      // Auto-select if they only lead one valid squad
      const currentUserId = user?._id || user?.id;
      const leaderSquads = (res.data || []).filter(s => {
        const leaderId = s.leaderId?._id || s.leaderId;
        return String(leaderId) === String(currentUserId);
      });
      if (leaderSquads.length === 1) {
        const sq = leaderSquads[0];
        const memberCount = sq.members?.length || 0; // leader is already in members array
        if (memberCount >= event.minTeamSize && memberCount <= event.maxTeamSize) {
          setSelectedSquad(sq._id);
        }
      }
    } catch (err) {
      console.error('Failed to load squads', err);
    } finally {
      setLoadingSquads(false);
    }
  };

  const handleChatShare = (friend) => {
    const dt = event.date ? new Date(event.date) : null;
    const dateStr = dt
      ? dt.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })
      : 'Date TBA';
    const timeStr = dt
      ? dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      : '';
    const loc = event.isOnline ? event.platform || 'Online' : event.location || 'Location TBA';
    const price = event.price > 0 ? `₹${event.price}` : 'Free';

    const msg = `📅 *${event.title}*
🗓 ${dateStr} • ${timeStr}
📍 ${loc}
💰 ${price}

Check it out here: ${window.location.href}`;

    window.dispatchEvent(
      new CustomEvent('open-chat', {
        detail: {
          friendId: friend._id,
          friendName: friend.fullname || friend.username,
          friendPic: friend.profilePic,
          initialMessage: msg,
        },
      })
    );
    setFriendSelectorOpen(false);
  };

  if (!isOpen || !event) return null;

  // Normalize helpers
  const registered = typeof isRegistered === 'function' ? isRegistered(event._id) : !!isRegistered;
  const waitlisted = typeof isWaitlisted === 'function' ? isWaitlisted(event._id) : !!isWaitlisted;
  const bookmarked = typeof isBookmarked === 'function' ? isBookmarked(event._id) : !!isBookmarked;
  const attended = typeof isAttended === 'function' ? isAttended(event._id) : !!isAttended;

  const handleRegister = async (squadId) => {
    setLoading(true);
    try {
      await onRegister(event, squadId instanceof Event ? null : squadId);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinWaitingList = async () => {
    setLoading(true);
    try {
      await onJoinWaitingList(event);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!window.confirm('Are you sure you want to cancel?')) return;
    setLoading(true);
    try {
      await onCancel(event);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const formatCurrency = (amount, currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(amount);
  };

  const deadline = event?.registrationDeadline ? new Date(event.registrationDeadline) : null;
  const now = new Date();
  const deadlinePassed = deadline && !isNaN(deadline.getTime()) && now > deadline;

  // Animation Variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', duration: 0.5 } },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          key="main-event-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          onClick={onClose}
        >
          {/* Backdrop */}
          <motion.div
            key="modal-backdrop"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={overlayVariants}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            key="modal-container"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white w-full max-w-4xl max-h-[90vh] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-2 border-black overflow-hidden flex flex-col"
          >
            {/* --- HERO SECTION (Brutalist) --- */}
            <div className="relative h-48 sm:h-56 shrink-0 border-b-2 border-black">
              {/* Background Image */}
              <div className="absolute inset-0 bg-neutral-900">
                {event.imageUrl ? (
                  <img
                    src={getImageUrl(event.imageUrl)}
                    alt={event.title}
                    className="w-full h-full object-cover grayscale opacity-80"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-neutral-100 pattern-grid-lg">
                    <Calendar className="w-16 h-16 text-black" />
                  </div>
                )}
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-white text-black border-2 border-black hover:bg-black hover:text-white transition-colors z-10"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Title Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <div className="flex flex-wrap gap-2 mb-3">
                  <span
                    className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest border border-white text-white ${event.isOnline ? 'bg-blue-600' : 'bg-emerald-600'}`}
                  >
                    {event.isOnline ? event.platform || 'Online' : 'In-Person'}
                  </span>
                  {event.category && (
                    <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest bg-white text-black border border-white">
                      {event.category}
                    </span>
                  )}
                  {event.isCompleted && (
                    <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest bg-neutral-700 text-white border border-neutral-500">
                      Completed
                    </span>
                  )}
                  {attended && (
                    <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest bg-emerald-100 text-emerald-900 border border-emerald-900 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Verified Attendee
                    </span>
                  )}
                </div>

                <h1 className="text-3xl md:text-5xl font-black text-white mb-2 uppercase tracking-tighter leading-none shadow-black drop-shadow-md">
                  {event.title}
                </h1>

                <div className="flex items-center gap-6 text-white text-xs md:text-sm font-bold uppercase tracking-wider">
                  <div
                    className="flex items-center gap-2 group cursor-pointer"
                    onClick={() => onOpenHost && onOpenHost(event.hostId?._id || event.hostId)}
                  >
                    {event.hostId?.profilePic ? (
                      <img
                        src={getImageUrl(event.hostId.profilePic)}
                        className="w-6 h-6 rounded-none border border-white object-cover grayscale group-hover:grayscale-0 transition-all"
                        alt="Host"
                      />
                    ) : (
                      <div className="w-6 h-6 bg-white border border-white flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-black" />
                      </div>
                    )}
                    <span className="hover:underline decoration-2 underline-offset-4">
                      {event.hostId?.fullname || event.hostId?.username || 'Host'}
                    </span>
                  </div>
                  {event.date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(event.date)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* --- TAB NAVIGATION (Only for Completed and Active Events) --- */}
            {showMemoriesTab && (
              <div className="flex border-b-2 border-black bg-neutral-100">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`flex-1 py-3 text-xs font-black uppercase tracking-widest border-r-2 border-black transition-colors ${activeTab === 'details' ? 'bg-black text-white' : 'bg-transparent text-black hover:bg-neutral-200'}`}
                >
                  Details
                </button>
                <button
                  onClick={() => setActiveTab('memories')}
                  className={`flex-1 py-3 text-xs font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2 ${activeTab === 'memories' ? 'bg-black text-white' : 'bg-transparent text-black hover:bg-neutral-200'}`}
                >
                  <Camera className="w-4 h-4" /> {event.isCompleted ? 'Memories Hub' : 'Live Feed'}
                </button>
              </div>
            )}

            {/* --- CONTENT LAYOUT --- */}
            <div className="flex-1 overflow-y-auto bg-white">
              <div className="grid grid-cols-1 lg:grid-cols-3">
                {/* LEFT COLUMN: Main Info or Memories */}
                <div className="lg:col-span-2 space-y-0 border-b-2 lg:border-b-0 lg:border-r-2 border-black bg-white">

                  {activeTab === 'memories' ? (
                    <MemoriesHub event={event} user={user} />
                  ) : (
                    <div className="p-6 md:p-8 space-y-8">
                      {/* Quick Stats Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 border-2 border-black divide-x-2 divide-black bg-white">
                        <div className="p-4 flex flex-col items-center text-center hover:bg-neutral-50 transition-colors">
                          <Clock className="w-5 h-5 text-black mb-2" />
                          <div className="text-[10px] uppercase font-bold text-neutral-500 tracking-widest">
                            Time
                          </div>
                          <div className="text-xs font-bold text-black uppercase">
                            {formatTime(event.date)}
                          </div>
                        </div>
                        <div className="p-4 flex flex-col items-center text-center hover:bg-neutral-50 transition-colors">
                          <MapPin className="w-5 h-5 text-black mb-2" />
                          <div className="text-[10px] uppercase font-bold text-neutral-500 tracking-widest">
                            Location
                          </div>
                          <div
                            className="text-xs font-bold text-black uppercase truncate w-full"
                            title={event.location}
                          >
                            {event.isOnline ? event.platform || 'Online' : event.location || 'TBA'}
                          </div>
                        </div>
                        <div className="p-4 flex flex-col items-center text-center hover:bg-neutral-50 transition-colors">
                          <Users className="w-5 h-5 text-black mb-2" />
                          <div className="text-[10px] uppercase font-bold text-neutral-500 tracking-widest">
                            Capacity
                          </div>
                          <div className="text-xs font-bold text-black uppercase">
                            {event.capacity ? event.capacity : 'Unlimited'}
                          </div>
                        </div>
                        <div className="p-4 flex flex-col items-center text-center hover:bg-neutral-50 transition-colors">
                          <Tag className="w-5 h-5 text-black mb-2" />
                          <div className="text-[10px] uppercase font-bold text-neutral-500 tracking-widest">
                            Price
                          </div>
                          <div className="text-xs font-bold text-black uppercase">
                            {event.price > 0 ? formatCurrency(event.price) : 'Free'}
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="space-y-4">
                        <h3 className="text-xl font-black text-black uppercase tracking-tight flex items-center gap-2 border-l-4 border-black pl-3">
                          About Event
                        </h3>
                        <div className="prose prose-sm max-w-none text-neutral-800 leading-relaxed font-medium">
                          {event.description || event.shortDescription || 'No description provided.'}
                        </div>
                      </div>

                      {/* Agenda/Requirements Row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {event.agenda && (
                          <div className="border-2 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white">
                            <h3 className="text-sm font-black text-black mb-3 uppercase tracking-widest border-b-2 border-black pb-2">
                              Agenda
                            </h3>
                            <p className="text-neutral-700 text-sm whitespace-pre-line leading-relaxed font-mono">
                              {event.agenda}
                            </p>
                          </div>
                        )}
                        {event.requirements && (
                          <div className="border-2 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white">
                            <h3 className="text-sm font-black text-black mb-3 uppercase tracking-widest border-b-2 border-black pb-2">
                              Requirements
                            </h3>
                            <ul className="list-square pl-5 text-neutral-700 text-sm space-y-1 font-medium marker:text-black">
                              {event.requirements.split('\n').map((req, i) => (
                                <li key={i}>{req}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* GenLoop AI Generated Content */}
                      {event.ai?.generatedDescription && (
                        <div className="space-y-4 border-2 border-blue-200 bg-blue-50 p-5 shadow-[4px_4px_0px_0px_rgba(0,0,120,0.15)]">
                          <div className="flex items-center justify-between border-b-2 border-blue-200 pb-3">
                            <h3 className="text-sm font-black text-blue-900 uppercase tracking-widest flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" /> GenLoop AI Promotional Copy
                            </h3>
                            {event.ai?.engagementScore > 0 && (
                              <div className="flex items-center gap-2 bg-black text-white px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                                <span>{event.ai.engagementScore}</span>
                                <span className="text-blue-300">VIRAL SCORE</span>
                              </div>
                            )}
                          </div>

                          {/* AI Poster */}
                          {event.ai?.posterUrl && (
                            <div className="w-full max-w-xs mx-auto">
                              <img
                                src={event.ai.posterUrl}
                                alt="AI generated poster"
                                className="w-full border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] object-cover"
                              />
                            </div>
                          )}

                          {/* AI Description */}
                          <div
                            className="prose prose-sm max-w-none text-blue-900 leading-relaxed [&_h2]:font-black [&_h2]:uppercase [&_h2]:tracking-tight [&_strong]:font-black"
                            dangerouslySetInnerHTML={{ __html: event.ai.generatedDescription }}
                          />

                          {/* Gamification Rewards */}
                          {event.gamificationRewards?.length > 0 && (
                            <div>
                              <div className="text-[10px] font-black text-blue-700 uppercase tracking-widest mb-2">Attend & Earn</div>
                              <div className="flex flex-wrap gap-2">
                                {event.gamificationRewards.map((r, i) => (
                                  <span key={i} className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider bg-white text-black border-2 border-black px-2 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                    <Trophy className="w-3 h-3 text-yellow-600" /> {r}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Tags */}
                      {event.tags && event.tags.length > 0 && (
                        <div className="pt-4 border-t-2 border-dashed border-neutral-300">
                          <div className="flex flex-wrap gap-2">
                            {event.tags.map((t) => (
                              <span
                                key={t}
                                className="px-3 py-1 bg-black text-white text-[10px] font-bold uppercase tracking-wider border border-black"
                              >
                                #{t}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* RIGHT COLUMN: Action Sticky Sidebar */}
                <div className="lg:col-span-1 bg-neutral-50 p-6 md:p-8">
                  <div className="sticky top-6 space-y-6">
                    {/* Registration Card */}
                    <div className="bg-white border-2 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative">
                      <div className="text-center mb-6 border-b-2 border-black pb-4 border-dashed">
                        <div className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest mb-1">
                          Total Price
                        </div>
                        <div className="text-4xl font-black text-black tracking-tighter">
                          {event.price > 0 ? formatCurrency(event.price) : 'Free'}
                        </div>
                      </div>

                      {/* Action Button */}
                      {!hideRegister && <div className="space-y-4">
                        {registered ? (
                          <div className="bg-emerald-50 border-2 border-emerald-600 p-4 text-center">
                            <div className="flex justify-center mb-2">
                              <CheckCircle className="w-8 h-8 text-emerald-600" />
                            </div>
                            <div className="font-black text-emerald-800 uppercase tracking-wide text-sm">
                              Registered
                            </div>
                            <div className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mt-1">
                              You're going!
                            </div>

                            <div className="mt-4 space-y-2">
                              {event.isCompleted && attended && (
                                <button
                                  onClick={() => onDownloadCertificate(event)}
                                  className="w-full py-2 bg-yellow-400 text-black border-2 border-black hover:bg-yellow-300 font-bold text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none"
                                >
                                  <Trophy className="w-4 h-4" /> Certificate
                                </button>
                              )}
                              {!event.isCompleted && (
                                <button
                                  onClick={() => navigate(`/event/${event._id}/live`)}
                                  className="w-full py-2 bg-red-100 text-red-700 border-2 border-red-700 hover:bg-red-200 font-black text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_rgba(185,28,28,0.2)] active:translate-y-[2px] active:shadow-none"
                                >
                                  <MessageSquare className="w-4 h-4" /> Join Live Session
                                </button>
                              )}
                              {event.isCompleted && attended && (
                                <button
                                  onClick={() => onNavigateToReview(event._id)}
                                  className="w-full py-2 bg-white text-black border-2 border-black hover:bg-neutral-100 font-bold text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none"
                                >
                                  <MessageSquare className="w-4 h-4" /> Review
                                </button>
                              )}
                              {!event.isCompleted && (
                                <button
                                  onClick={handleCancelRegistration}
                                  disabled={loading}
                                  className="w-full py-2 bg-red-50 text-red-600 border-2 border-red-600 hover:bg-red-100 font-bold text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_rgba(220,38,38,0.2)] active:translate-y-[2px] active:shadow-none"
                                >
                                  {loading ? 'Processing...' : 'Cancel Registration'}
                                </button>
                              )}
                            </div>
                          </div>
                        ) : waitlisted ? (
                          <div className="bg-amber-50 border-2 border-amber-600 p-4 text-center">
                            <div className="flex justify-center mb-2">
                              <Clock className="w-8 h-8 text-amber-600" />
                            </div>
                            <div className="font-black text-amber-800 uppercase tracking-wide text-sm">
                              On Waiting List
                            </div>
                            <div className="text-[10px] text-amber-600 font-bold uppercase tracking-widest mt-1">
                              We'll notify if a spot opens up
                            </div>
                            <button
                              onClick={handleCancelRegistration}
                              disabled={loading}
                              className="w-full mt-4 py-2 bg-red-50 text-red-600 border-2 border-red-600 hover:bg-red-100 font-bold text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                            >
                              {loading ? 'Processing...' : 'Leave Waiting List'}
                            </button>
                          </div>
                        ) : (
                          <>
                            {event.isTeamEvent && !registered && !waitlisted && (
                              <div className="mb-4 text-left">
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2">
                                  Select Your Squad
                                </label>
                                {loadingSquads ? (
                                  <div className="text-xs font-bold text-slate-500">Loading squads...</div>
                                ) : mySquads.length > 0 ? (
                                  <select
                                    value={selectedSquad}
                                    onChange={(e) => setSelectedSquad(e.target.value)}
                                    className="w-full p-2 border-2 border-black font-bold text-xs uppercase bg-white outline-none focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                  >
                                    <option value="">-- Choose a Squad --</option>
                                    {mySquads.filter(s => { const lid = s.leaderId?._id || s.leaderId; const uid = user?._id || user?.id; return String(lid) === String(uid); }).map((sq) => {
                                      const memberCount = sq.members?.length || 0; // leader already counted in members[]
                                      const isValidSize = memberCount >= event.minTeamSize && memberCount <= event.maxTeamSize;
                                      return (
                                        <option key={sq._id} value={sq._id} disabled={!isValidSize}>
                                          {sq.name} ({memberCount} member{memberCount !== 1 ? 's' : ''}) {isValidSize ? '' : `- Need ${event.minTeamSize}-${event.maxTeamSize} members`}
                                        </option>
                                      );
                                    })}
                                  </select>
                                ) : (
                                  <p className="text-red-500 text-sm font-bold uppercase mt-2">
                                    You don't lead any squads yet. Create one in the "Squads" tab on your Dashboard to register.
                                  </p>
                                )}
                                <div className="text-[9px] text-neutral-400 mt-1 uppercase font-bold tracking-widest">
                                  Only the squad leader can register the team. ({event.minTeamSize}-{event.maxTeamSize} members required)
                                </div>
                              </div>
                            )}

                            {event.capacity &&
                              event.capacity > 0 &&
                              (event.activeRegistrationCount !== undefined
                                ? event.activeRegistrationCount
                                : (event.registrations || []).filter((r) => r.status === 'registered').length) >=
                              event.capacity ? (
                              <button
                                onClick={handleJoinWaitingList}
                                disabled={loading || disabledActions || deadlinePassed}
                                className={`w-full py-4 border-2 border-black font-black text-sm uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center gap-2 ${deadlinePassed
                                  ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed border-neutral-400 shadow-none'
                                  : 'bg-amber-400 text-black hover:bg-amber-300'
                                  }`}
                              >
                                {loading
                                  ? 'Processing...'
                                  : deadlinePassed
                                    ? 'Registration Closed'
                                    : 'Join Waiting List'}
                                {!loading && !deadlinePassed && <Clock className="w-4 h-4" />}
                              </button>
                            ) : (
                              <button
                                onClick={() => handleRegister(selectedSquad)}
                                disabled={loading || disabledActions || deadlinePassed || (event.isTeamEvent && !selectedSquad)}
                                className={`w-full py-4 border-2 border-black font-black text-sm uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center gap-2 ${deadlinePassed || (event.isTeamEvent && !selectedSquad)
                                  ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed border-neutral-400 shadow-none hover:shadow-none hover:translate-y-0'
                                  : 'bg-black text-white hover:bg-neutral-800'
                                  }`}
                              >
                                {loading
                                  ? 'Processing...'
                                  : deadlinePassed
                                    ? 'Registration Closed'
                                    : 'Register Now'}
                                {!loading && !deadlinePassed && <ExternalLink className="w-4 h-4" />}
                              </button>
                            )}
                          </>
                        )}
                      </div>}

                      {(event.meetingLink || event.location) && registered && (
                        <div className="mt-4 pt-4 border-t-2 border-black">
                          <h4 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-3">
                            Access Event
                          </h4>
                          {event.isOnline && event.meetingLink ? (
                            <a
                              href={event.meetingLink}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-2 text-white bg-blue-600 hover:bg-blue-700 font-bold text-xs uppercase tracking-wider p-3 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                            >
                              <Globe className="w-4 h-4" /> Join {event.platform || 'Link'}
                            </a>
                          ) : (
                            <div className="flex items-start gap-2 text-black text-xs font-bold bg-neutral-100 p-3 border-2 border-black">
                              <Navigation className="w-4 h-4 shrink-0 mt-0.5" />
                              <span className="uppercase">{event.address || event.location}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Host Card */}
                    {!hideHostCard && <div className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      <div className="flex items-center gap-3 mb-4">
                        {event.hostId?.profilePic ? (
                          <img
                            src={getImageUrl(event.hostId.profilePic)}
                            alt={event.hostId.fullname || 'Host'}
                            className="w-12 h-12 rounded-none object-cover border-2 border-black grayscale"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-neutral-200 border-2 border-black flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-black" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">
                            Organizer
                          </div>
                          <div className="font-bold text-black uppercase truncate text-sm">
                            {event.hostId?.fullname || event.hostId?.username || 'Unknown Host'}
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => onSubscribe(event)}
                          disabled={disabledActions}
                          className={`py-2 px-3 text-[10px] font-bold uppercase tracking-widest border-2 border-black flex items-center justify-center gap-1.5 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none ${isSubscribed ? 'bg-neutral-200 text-neutral-600' : 'bg-white text-black hover:bg-neutral-50'}`}
                        >
                          {isSubscribed ? 'Following' : 'Follow'}
                        </button>
                        <button
                          onClick={() =>
                            onOpenHost && onOpenHost(event.hostId?._id || event.hostId)
                          }
                          className="py-2 px-3 text-[10px] font-bold uppercase tracking-widest border-2 border-black bg-white text-black hover:bg-neutral-50 flex items-center justify-center gap-1.5 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none"
                        >
                          Profile
                        </button>
                      </div>
                    </div>}

                    {/* Secondary Actions (Share & Bookmark) */}
                    {!hideSecondaryActions && <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => onBookmark(event)}
                        disabled={disabledActions}
                        className={`flex flex-col items-center justify-center gap-1 p-3 border-2 border-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${bookmarked ? 'bg-black text-white' : 'bg-white text-black hover:bg-neutral-50'}`}
                      >
                        {bookmarked ? (
                          <BookmarkCheck className="w-5 h-5" />
                        ) : (
                          <Bookmark className="w-5 h-5" />
                        )}
                        <span className="text-[10px] font-bold uppercase tracking-widest">
                          {bookmarked ? 'Saved' : 'Save'}
                        </span>
                      </button>

                      {/* Share Dropdown/Group */}
                      <div className="relative group">
                        <button className="w-full h-full flex flex-col items-center justify-center gap-1 p-3 border-2 border-black bg-white text-black hover:bg-neutral-50 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                          <Share2 className="w-5 h-5" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">
                            Share
                          </span>
                        </button>

                        {/* Hover Menu for Share Options */}
                        <div className="absolute bottom-full right-0 mb-2 w-48 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-0 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all transform origin-bottom-right scale-95 group-hover:scale-100 z-50">
                          <div className="text-[10px] font-black text-black uppercase px-3 py-2 bg-neutral-100 border-b-2 border-black tracking-widest">
                            Share via
                          </div>
                          <button
                            onClick={handleShare}
                            className="w-full flex items-center gap-3 p-3 hover:bg-neutral-50 text-black text-xs font-bold uppercase tracking-wide border-b border-neutral-200 transition-colors"
                          >
                            {copySuccess ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <span className="w-4 h-4 text-center">🔗</span>
                            )}
                            {copySuccess ? 'Copied!' : 'Copy Link'}
                          </button>
                          <button
                            onClick={() => setFriendSelectorOpen(true)}
                            className="w-full flex items-center gap-3 p-3 hover:bg-neutral-50 text-black text-xs font-bold uppercase tracking-wide border-b border-neutral-200 transition-colors"
                          >
                            <MessageSquare className="w-4 h-4" /> Share via Chat
                          </button>
                          <a
                            href={`https://wa.me/?text=${encodeURIComponent(`Check out this event: ${event.title} on ${window.location.href}`)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="w-full flex items-center gap-3 p-3 hover:bg-neutral-50 text-black text-xs font-bold uppercase tracking-wide border-b border-neutral-200 transition-colors"
                          >
                            <span className="w-4 h-4 text-center">📱</span> WhatsApp
                          </a>
                          <a
                            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out ${event.title}!`)}&url=${encodeURIComponent(window.location.href)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="w-full flex items-center gap-3 p-3 hover:bg-neutral-50 text-black text-xs font-bold uppercase tracking-wide border-b border-neutral-200 transition-colors"
                          >
                            <span className="w-4 h-4 text-center">🐦</span> X / Twitter
                          </a>
                          <a
                            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="w-full flex items-center gap-3 p-3 hover:bg-neutral-50 text-black text-xs font-bold uppercase tracking-wide transition-colors"
                          >
                            <span className="w-4 h-4 text-center">💼</span> LinkedIn
                          </a>
                        </div>
                      </div>
                    </div>}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      {friendSelectorOpen && (
        <FriendSelectorModal
          key="friend-selector-modal"
          isOpen={friendSelectorOpen}
          onClose={() => setFriendSelectorOpen(false)}
          onSelect={handleChatShare}
        />
      )}
    </AnimatePresence>
  );
};

export default EventDetailModal;
