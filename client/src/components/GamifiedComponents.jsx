import React from 'react';
import config from '../config';
import {
  Star,
  Trophy,
  Award,
  Flame,
  Crown,
  Sparkles,
  Zap,
  Target,
  TrendingUp,
  Users,
  Clock,
  Gift,
  Medal,
  Rocket,
  Heart,
  Brain,
  Calendar,
  MapPin,
  Bookmark,
  CheckCircle,
  MessageSquare,
  Shield,
  Swords,
  Ticket,
  ArrowRight,
  MoreHorizontal,
  Briefcase,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TicketModal from './TicketModal';
import { logEvent } from '../utils/analytics';

// Module-level set to prevent duplicate impression logs across React strict mode remounts
const _loggedImpressions = new Set();

export const EVENT_THEMES = {
  Technology: {
    bg: 'bg-slate-950',
    gradient: 'bg-gradient-to-br from-emerald-600/20 via-slate-950 to-slate-950',
    border: 'border-emerald-500/50',
    text: 'text-emerald-400',
    muted: 'text-emerald-600',
    accent: 'emerald',
    tag: 'bg-emerald-900/50 text-emerald-400 border-emerald-500/30',
    icon: Zap,
    shadow: 'shadow-[8px_8px_0px_0px_#10b981]',
    glow: 'group-hover:shadow-[0_0_40px_rgba(16,185,129,0.25)]',
    glass: 'bg-emerald-500/10 backdrop-blur-md border-emerald-500/20',
    button: 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-[4px_4px_0px_0px_#065f46]',
  },
  Entertainment: {
    bg: 'bg-rose-600',
    gradient: 'bg-gradient-to-br from-rose-500 via-rose-600 to-rose-700',
    border: 'border-black',
    text: 'text-white',
    muted: 'text-rose-100',
    accent: 'rose',
    tag: 'bg-white/20 text-white border-white/30',
    icon: Sparkles,
    shadow: 'shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]',
    glow: 'group-hover:shadow-[0_0_40px_rgba(225,29,72,0.35)]',
    glass: 'bg-white/10 backdrop-blur-md border-white/20',
    button: 'bg-black text-white hover:bg-neutral-800 shadow-[4px_4px_0px_0px_#4c0519]',
  },
  Education: {
    bg: 'bg-indigo-600',
    gradient: 'bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-700',
    border: 'border-black',
    text: 'text-white',
    muted: 'text-indigo-100',
    accent: 'indigo',
    tag: 'bg-white/20 text-white border-white/30',
    icon: Brain,
    shadow: 'shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]',
    glow: 'group-hover:shadow-[0_0_40px_rgba(79,70,229,0.35)]',
    glass: 'bg-white/10 backdrop-blur-md border-white/20',
    button: 'bg-black text-white hover:bg-neutral-800 shadow-[4px_4px_0px_0px_#1e1b4b]',
  },
  Business: {
    bg: 'bg-blue-700',
    gradient: 'bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800',
    border: 'border-black',
    text: 'text-white',
    muted: 'text-blue-100',
    accent: 'blue',
    tag: 'bg-white/20 text-white border-white/30',
    icon: Briefcase,
    shadow: 'shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]',
    glow: 'group-hover:shadow-[0_0_40px_rgba(29,78,216,0.35)]',
    glass: 'bg-white/10 backdrop-blur-md border-white/20',
    button: 'bg-black text-white hover:bg-neutral-800 shadow-[4px_4px_0px_0px_#172554]',
  },
  Health: {
    bg: 'bg-cyan-500',
    gradient: 'bg-gradient-to-br from-cyan-400 via-cyan-500 to-cyan-600',
    border: 'border-black',
    text: 'text-black',
    muted: 'text-cyan-900',
    accent: 'cyan',
    tag: 'bg-black/10 text-black border-black/20',
    icon: Heart,
    shadow: 'shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]',
    glow: 'group-hover:shadow-[0_0_40px_rgba(6,182,212,0.35)]',
    glass: 'bg-black/10 backdrop-blur-md border-black/20',
    button: 'bg-black text-white hover:bg-neutral-800 shadow-[4px_4px_0px_0px_#164e63]',
  },
  Sports: {
    bg: 'bg-orange-500',
    gradient: 'bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600',
    border: 'border-black',
    text: 'text-black',
    muted: 'text-orange-900',
    accent: 'orange',
    tag: 'bg-black/10 text-black border-black/20',
    icon: Trophy,
    shadow: 'shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]',
    glow: 'group-hover:shadow-[0_0_40px_rgba(249,115,22,0.35)]',
    glass: 'bg-black/10 backdrop-blur-md border-black/20',
    button: 'bg-black text-white hover:bg-neutral-800 shadow-[4px_4px_0px_0px_#7c2d12]',
  },
  Hackathon: {
    bg: 'bg-slate-950',
    gradient: 'bg-gradient-to-br from-emerald-600/20 via-slate-950 to-slate-950',
    border: 'border-emerald-500/50',
    text: 'text-emerald-400',
    muted: 'text-emerald-600',
    accent: 'emerald',
    tag: 'bg-emerald-900/50 text-emerald-400 border-emerald-500/30',
    icon: Zap,
    shadow: 'shadow-[8px_8px_0px_0px_#10b981]',
    glow: 'group-hover:shadow-[0_0_40px_rgba(16,185,129,0.25)]',
    glass: 'bg-emerald-500/10 backdrop-blur-md border-emerald-500/20',
    button: 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-[4px_4px_0px_0px_#065f46]',
  },
  Workshop: {
    bg: 'bg-indigo-600',
    gradient: 'bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-700',
    border: 'border-black',
    text: 'text-white',
    muted: 'text-indigo-100',
    accent: 'indigo',
    tag: 'bg-white/20 text-white border-white/30',
    icon: Brain,
    shadow: 'shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]',
    glow: 'group-hover:shadow-[0_0_40px_rgba(79,70,229,0.35)]',
    glass: 'bg-white/10 backdrop-blur-md border-white/20',
    button: 'bg-black text-white hover:bg-neutral-800 shadow-[4px_4px_0px_0px_#1e1b4b]',
  },
  Seminar: {
    bg: 'bg-blue-700',
    gradient: 'bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800',
    border: 'border-black',
    text: 'text-white',
    muted: 'text-blue-100',
    accent: 'blue',
    tag: 'bg-white/20 text-white border-white/30',
    icon: Briefcase,
    shadow: 'shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]',
    glow: 'group-hover:shadow-[0_0_40px_rgba(29,78,216,0.35)]',
    glass: 'bg-white/10 backdrop-blur-md border-white/20',
    button: 'bg-black text-white hover:bg-neutral-800 shadow-[4px_4px_0px_0px_#172554]',
  },
  Competition: {
    bg: 'bg-yellow-400',
    gradient: 'bg-gradient-to-br from-yellow-300 via-yellow-400 to-amber-500',
    border: 'border-black',
    text: 'text-black',
    muted: 'text-yellow-900',
    accent: 'yellow',
    tag: 'bg-black/10 text-black border-black/20',
    icon: Swords,
    shadow: 'shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]',
    glow: 'group-hover:shadow-[0_0_40px_rgba(234,179,8,0.35)]',
    glass: 'bg-black/10 backdrop-blur-md border-black/20',
    button: 'bg-black text-white hover:bg-neutral-800 shadow-[4px_4px_0px_0px_#713f12]',
  },
  Networking: {
    bg: 'bg-violet-600',
    gradient: 'bg-gradient-to-br from-violet-500 via-violet-600 to-purple-700',
    border: 'border-black',
    text: 'text-white',
    muted: 'text-violet-100',
    accent: 'violet',
    tag: 'bg-white/20 text-white border-white/30',
    icon: Users,
    shadow: 'shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]',
    glow: 'group-hover:shadow-[0_0_40px_rgba(124,58,237,0.35)]',
    glass: 'bg-white/10 backdrop-blur-md border-white/20',
    button: 'bg-black text-white hover:bg-neutral-800 shadow-[4px_4px_0px_0px_#2e1065]',
  },
  Cultural: {
    bg: 'bg-rose-500',
    gradient: 'bg-gradient-to-br from-rose-400 via-rose-500 to-pink-600',
    border: 'border-black',
    text: 'text-white',
    muted: 'text-rose-100',
    accent: 'rose',
    tag: 'bg-white/20 text-white border-white/30',
    icon: Sparkles,
    shadow: 'shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]',
    glow: 'group-hover:shadow-[0_0_40px_rgba(244,63,94,0.35)]',
    glass: 'bg-white/10 backdrop-blur-md border-white/20',
    button: 'bg-black text-white hover:bg-neutral-800 shadow-[4px_4px_0px_0px_#4c0519]',
  },
  'Tech Talk': {
    bg: 'bg-slate-800',
    gradient: 'bg-gradient-to-br from-cyan-500/20 via-slate-800 to-slate-900',
    border: 'border-cyan-400/50',
    text: 'text-cyan-300',
    muted: 'text-cyan-500',
    accent: 'cyan',
    tag: 'bg-cyan-900/50 text-cyan-300 border-cyan-500/30',
    icon: Rocket,
    shadow: 'shadow-[8px_8px_0px_0px_#06b6d4]',
    glow: 'group-hover:shadow-[0_0_40px_rgba(6,182,212,0.25)]',
    glass: 'bg-cyan-500/10 backdrop-blur-md border-cyan-500/20',
    button: 'bg-cyan-500 text-black hover:bg-cyan-400 shadow-[4px_4px_0px_0px_#164e63]',
  },
  'Career Fair': {
    bg: 'bg-teal-600',
    gradient: 'bg-gradient-to-br from-teal-500 via-teal-600 to-teal-700',
    border: 'border-black',
    text: 'text-white',
    muted: 'text-teal-100',
    accent: 'teal',
    tag: 'bg-white/20 text-white border-white/30',
    icon: Briefcase,
    shadow: 'shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]',
    glow: 'group-hover:shadow-[0_0_40px_rgba(13,148,136,0.35)]',
    glass: 'bg-white/10 backdrop-blur-md border-white/20',
    button: 'bg-black text-white hover:bg-neutral-800 shadow-[4px_4px_0px_0px_#042f2e]',
  },
  Default: {
    bg: 'bg-white',
    gradient: 'bg-gradient-to-br from-white via-slate-50 to-slate-100',
    border: 'border-black',
    text: 'text-black',
    muted: 'text-slate-600',
    accent: 'slate',
    tag: 'bg-neutral-100 text-black border-black',
    icon: Calendar,
    shadow: 'shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]',
    glow: 'group-hover:shadow-[0_0_40px_rgba(0,0,0,0.1)]',
    glass: 'bg-black/5 backdrop-blur-md border-black/10',
    button: 'bg-black text-white hover:bg-neutral-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]',
  }
};

// Professional Event Card Component
// Professional Event Card Component - Refactored to match Landing Page Design
export const GamifiedEventCard = ({
  event,
  onRegister,
  onViewMore,
  onBookmark,
  isRegistered,
  isBookmarked,
  userStats,
  awardPoints,
  disabledActions = false,
  analyticsSource = 'dashboard',
  hideActions = false,
}) => {
  const cardRef = React.useRef(null);
  const hasLoggedImpressionRef = React.useRef(false);

  React.useEffect(() => {
    if (!event?._id) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoggedImpressionRef.current && !_loggedImpressions.has(event._id)) {
          hasLoggedImpressionRef.current = true;
          _loggedImpressions.add(event._id);
          logEvent({
            eventId: event._id,
            type: 'impression',
            source: analyticsSource,
          });
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [event?._id, analyticsSource]);

  const handleCardClick = () => {
    if (event?._id) {
      logEvent({
        eventId: event._id,
        type: 'click',
        source: analyticsSource,
      });
    }
    onViewMore(event);
  };

  const toAbsoluteUrl = (u) => {
    const s = String(u || '');
    if (!s) return s;
    if (/^https?:\/\//i.test(s)) return s;
    return `${config.apiBaseUrl.replace(/\/$/, '')}${s.startsWith('/') ? '' : '/'}${s}`;
  };

  const [showTicket, setShowTicket] = React.useState(false);
  const isCompleted = event.isCompleted;
  const isOnline = event.isOnline;
  const regDeadline = event?.registrationDeadline ? new Date(event.registrationDeadline) : null;
  const regClosed =
    regDeadline && !isNaN(regDeadline.getTime()) && Date.now() > regDeadline.getTime();

  // Theming Logic
  const theme = EVENT_THEMES[event.category] || EVENT_THEMES.Default;
  const ThemeIcon = theme.icon;

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        y: -12, 
        x: -4,
        scale: 1.02,
        transition: { type: "spring", stiffness: 400, damping: 25 }
      }}
      className={`group h-full w-full flex flex-col ${theme.bg} ${theme.gradient} border-2 ${theme.border} overflow-hidden ${theme.shadow} ${theme.glow} transition-shadow duration-300 cursor-pointer relative z-0`}
      onClick={handleCardClick}
    >
      {/* Background patterns based on theme */}
      <div className="absolute inset-0 pointer-events-none opacity-5 mix-blend-overlay">
        <div className="w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2)_1px,transparent_1px)] bg-[length:24px_24px]"></div>
      </div>

      {/* Image Container - Square */}
      <div className="w-full aspect-square relative overflow-hidden bg-neutral-900">
        <div className="w-full h-full transform transition-transform duration-700 ease-out group-hover:scale-110">
          {event.ai?.posterUrl || event.imageUrl ? (
            <img
              src={event.ai?.posterUrl || toAbsoluteUrl(event.imageUrl)}
              alt={event.title}
              className="object-cover w-full h-full grayscale-0 group-hover:grayscale-[0.3] transition-all duration-700"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23111'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='monospace' font-size='18' font-weight='bold' fill='%23fff'%3EEVENT%3C/text%3E%3C/svg%3E";
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-neutral-100 opacity-20">
              <Calendar className="w-16 h-16 text-black" />
            </div>
          )}
        </div>

        {/* glassmorphism overlay on image hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-500 flex items-center justify-center">
            <motion.div 
                initial={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1, opacity: 1 }}
                className={`${theme.glass} p-4 rounded-full`}
            >
                <ThemeIcon className={`w-8 h-8 ${theme.text}`} />
            </motion.div>
        </div>

        {/* GenLoop AI Badge */}
        {event.ai?.engagementScore > 0 && (
          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-2 py-1 bg-black/80 backdrop-blur-md border-t border-white/10">
            <div className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-blue-400 animate-pulse" />
              <span className="text-[8px] font-black uppercase tracking-widest text-blue-300">
                GenLoop AI
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[9px] font-black text-white">{event.ai.engagementScore}</span>
              <span className="text-[8px] text-blue-300 uppercase font-bold">viral score</span>
            </div>
          </div>
        )}

        {/* Status Tags Overlay */}
        <div className="absolute top-0 left-0 flex flex-col gap-1 p-2 z-10">
          <AnimatePresence>
            {event.isTeamEvent && (
              <motion.span
                key="tag-team"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="bg-purple-600 text-white px-2 py-1 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 shadow-md"
              >
                <Users className="w-3 h-3" /> Team ({event.minTeamSize}-{event.maxTeamSize})
              </motion.span>
            )}
            {isCompleted && (
              <motion.span
                key="tag-completed"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="bg-black text-white px-2 py-1 text-[9px] font-bold uppercase tracking-widest shadow-md"
              >
                Completed
              </motion.span>
            )}
            {isRegistered && !isCompleted && (
              <motion.span
                key="tag-registered"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="bg-blue-600 text-white px-2 py-1 text-[9px] font-bold uppercase tracking-widest shadow-md"
              >
                Registered
              </motion.span>
            )}
            {regClosed && !isCompleted && !isRegistered && (
              <motion.span
                key="tag-closed"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="bg-red-600 text-white px-2 py-1 text-[9px] font-bold uppercase tracking-widest shadow-md"
              >
                Closed
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Price Tag */}
        <div className={`absolute top-0 right-0 ${theme.bg === 'bg-white' ? 'bg-black text-white' : 'bg-white text-black'} px-3 py-1 text-[9px] font-bold uppercase tracking-widest z-10 border-b-2 border-l-2 border-black shadow-sm`}>
          {event.price > 0 ? `₹${event.price}` : 'Free'}
        </div>
      </div>

      {/* Info */}
      <div className={`p-4 flex flex-col gap-3 flex-1 justify-between relative overflow-hidden backdrop-blur-sm`}>
        {/* Subtle theme-colored glow at the bottom */}
        <div className={`absolute -bottom-10 -right-10 w-24 h-24 rounded-full blur-3xl opacity-20 ${theme.bg}`}></div>
        
        <div className="space-y-2 relative z-10">
          <div className="flex items-center justify-between">
            <span className={`px-2 py-0.5 text-[7px] font-black uppercase tracking-[2px] ${theme.tag} rounded-sm`}>
              {event.category || 'Event'}
            </span>
            <span className={`text-[8px] font-bold uppercase tracking-widest ${theme.muted}`}>
              {new Date(event.date).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
          <h3 className={`text-[14px] font-black uppercase tracking-tight ${theme.text} leading-tight group-hover:translate-x-1 transition-transform duration-300 line-clamp-2`}>
            {event.title}
          </h3>
          <div className={`flex items-center gap-1 text-[8px] font-bold uppercase tracking-widest ${theme.muted} truncate block`}>
            <MapPin className="w-2.5 h-2.5" />
            {isOnline ? 'Online' : event.location || 'Campus'}
          </div>
          
          {/* GenLoop rewards tags */}
          {event.gamificationRewards && event.gamificationRewards.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {event.gamificationRewards.slice(0, 2).map((r, i) => (
                <span
                  key={i}
                  className={`text-[7px] font-bold uppercase tracking-widest ${theme.tag} px-1.5 py-0.5 flex items-center gap-1 shadow-sm`}
                >
                  <Trophy className="w-2.5 h-2.5" /> {r}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Actions (Buttons) */}
        {!hideActions && <div className="flex gap-2 relative z-10">
          {isRegistered && !isCompleted && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowTicket(true);
              }}
              className={`flex-1 py-1.5 ${theme.button} text-[8px] font-black uppercase tracking-widest transition-all active:scale-95`}
            >
              Get Ticket
            </button>
          )}
          {!isRegistered && !isCompleted && !regClosed && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (event.isTeamEvent) {
                  onViewMore();
                } else {
                  onRegister();
                }
              }}
              className={`flex-1 py-1.5 ${theme.button} text-[8px] font-black uppercase tracking-widest transition-all active:scale-95 ${
                disabledActions ? 'opacity-50 cursor-not-allowed grayscale' : ''
              }`}
              disabled={disabledActions}
            >
              {event.isTeamEvent ? 'Register Squad' : 'Join Event'}
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBookmark();
            }}
            className={`p-2 border-2 ${
              isBookmarked
                ? `${theme.button} border-black`
                : `border-black ${theme.bg === 'bg-white' ? 'bg-slate-50' : 'bg-white/10'} hover:bg-black hover:text-white`
            } transition-all active:scale-90`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>}
      </div>
      <TicketModal isOpen={showTicket} onClose={() => setShowTicket(false)} eventId={event._id} />
    </motion.div>
  );
};

// Enhanced Badge Card Component
export const BadgeCard = ({ badge, earned = false, progress = {}, onClick }) => {
  const getRarityColor = (rarity) => {
    const r = (rarity || 'common').toLowerCase();
    switch (r) {
      case 'bronze':
        return 'bg-orange-100 text-orange-800';
      case 'silver':
        return 'bg-slate-100 text-slate-800';
      case 'gold':
        return 'bg-yellow-100 text-yellow-800';
      case 'platinum':
        return 'bg-cyan-100 text-cyan-800';
      case 'common':
        return 'bg-slate-50 text-slate-600';
      case 'uncommon':
        return 'bg-green-100 text-green-800';
      case 'rare':
        return 'bg-blue-100 text-blue-800';
      case 'epic':
        return 'bg-purple-100 text-purple-800';
      case 'legendary':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-slate-50 text-slate-600';
    }
  };

  const getRarityBorder = (rarity) => {
    return 'border-black';
  };

  const totalRequired = badge.criteria?.reduce((sum, c) => sum + c.required, 0) || 1;
  const totalCurrent =
    badge.criteria?.reduce((sum, c) => {
      const current = progress[c.id] || c.current || 0;
      return sum + Math.min(current, c.required);
    }, 0) || 0;
  const overallProgress = Math.round((totalCurrent / totalRequired) * 100);

  const rarityClass = getRarityColor(badge.tier || badge.rarity);

  return (
    <div
      onClick={onClick}
      className={`group relative bg-white border-2 border-black p-4 transition-all duration-300 cursor-pointer hover:translate-y-[-4px] hover:translate-x-[-4px] ${earned
        ? `shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]`
        : 'opacity-70 hover:opacity-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
        }`}
    >
      {earned && (
        <div
          className={`absolute top-0 left-0 px-2 py-0.5 border-r-2 border-b-2 border-black text-[9px] font-bold uppercase tracking-widest ${rarityClass}`}
        >
          {badge.tier || badge.rarity || 'Common'}
        </div>
      )}

      <div className="flex flex-col items-center mb-3 mt-2">
        <div
          className={`relative w-16 h-16 flex items-center justify-center text-3xl mb-3 border-2 border-black transition-all duration-300 ${earned
            ? `${rarityClass} shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`
            : 'bg-slate-100 grayscale'
            }`}
        >
          <div className={earned ? 'filter-none' : 'opacity-40'}>{badge.icon}</div>

          {!earned && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Shield className="w-6 h-6 text-black opacity-30" />
            </div>
          )}

          {earned && (
            <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-1 border-2 border-black">
              <CheckCircle className="w-3 h-3" />
            </div>
          )}
        </div>

        <h4
          className={`text-sm font-black uppercase tracking-tight text-center leading-tight ${earned ? 'text-black' : 'text-neutral-500'}`}
        >
          {badge.name}
        </h4>

        <div className="flex items-center gap-1 mt-1 border border-black px-2 py-0.5 bg-neutral-100">
          <Zap className={`w-3 h-3 text-black`} />
          <span className={`text-[10px] font-bold text-black`}>+{badge.points} XP</span>
        </div>
      </div>

      {overallProgress > 0 && (
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-500">
              {earned ? 'Completed' : 'Progress'}
            </span>
            <span className="text-[9px] font-bold text-black">{overallProgress}%</span>
          </div>
          <div className="h-2 bg-neutral-200 border border-black">
            <div
              className={`h-full transition-all duration-500 ${earned ? 'bg-green-500' : 'bg-black'}`}
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Achievement Badge Component (Original - kept for backward compatibility)
export const AchievementBadge = ({ badge, earned = false, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 p-1.5',
    md: 'w-12 h-12 p-2.5',
    lg: 'w-20 h-20 p-4',
  };

  return (
    <div className="flex flex-col items-center group">
      <div
        className={`relative rounded-full flex items-center justify-center transition-all duration-300 ${sizeClasses[size]} ${earned
          ? 'bg-blue-100 text-blue-600 ring-2 ring-blue-500 ring-offset-2'
          : 'bg-slate-100 text-slate-400'
          }`}
      >
        {badge.icon}

        {earned && (
          <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-0.5 border-2 border-white">
            <CheckCircle className="w-3 h-3" />
          </div>
        )}
      </div>
      <div className="mt-2 text-center opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-2 bg-slate-900 text-white text-xs py-1 px-2 rounded-md whitespace-nowrap z-10 pointer-events-none">
        {badge.name}
      </div>
    </div>
  );
};

// Level & Tier Progress Component (PUBG-Style)
export const LevelProgress = ({ currentLevel, nextLevel, progress, points, seasonPoints = 0, tier = "Bronze" }) => {
  const tiers = {
    Bronze: { icon: '🥉', color: 'bg-orange-100 text-orange-800' },
    Silver: { icon: '🥈', color: 'bg-slate-100 text-slate-800' },
    Gold: { icon: '🥇', color: 'bg-yellow-100 text-yellow-800' },
    Platinum: { icon: '💎', color: 'bg-cyan-100 text-cyan-800' },
    Diamond: { icon: '💠', color: 'bg-blue-100 text-blue-800' },
    Crown: { icon: '👑', color: 'bg-purple-100 text-purple-800' },
    Ace: { icon: '🌟', color: 'bg-red-100 text-red-800' },
    Conqueror: { icon: '🏆', color: 'bg-amber-100 text-amber-800' },
  };

  const currentTier = tiers[tier] || tiers.Bronze;

  return (
    <div className="bg-white border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex justify-between items-end mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 flex items-center justify-center border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-3xl ${currentTier.color}`}>
            {currentTier.icon}
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">
              Current Rank
            </div>
            <h3 className="text-2xl font-black text-black uppercase tracking-tighter">
              {tier}
            </h3>
            <div className="space-x-2">
              <p className="text-[10px] font-bold uppercase tracking-wide text-blue-700 bg-blue-100 px-2 py-0.5 inline-block border border-blue-900 border-dashed">
                Level {currentLevel.level}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-green-700 bg-green-100 px-2 py-0.5 inline-block border border-green-900 border-dashed">
                {currentLevel.name}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-4 sm:gap-8 ml-auto">
          <div className="text-right">
            <div className="text-2xl font-black text-black tracking-tighter">
              {seasonPoints.toLocaleString()}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
              Season Pts
            </div>
          </div>
          <div className="text-right border-l-2 border-black pl-4 sm:pl-8">
            <div className="text-2xl font-black text-black tracking-tighter">
              {points.toLocaleString()}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
              Lifetime XP
            </div>
          </div>
        </div>
      </div>

      {nextLevel && (
        <div className="space-y-3">
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-black">
            <span>Next Level: {currentLevel.level + 1}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-4 bg-neutral-100 border-2 border-black w-full relative">
            <div
              className="h-full bg-black transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
            <div className="absolute inset-0 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAIklEQVQIW2NkQAKrVq36zwjjgzhhYWGMYAEYB8RmROaABADeOQ8CXl/xfgAAAABJRU5ErkJggg==')] opacity-20 pointer-events-none mix-blend-overlay"></div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Monthly season resets in 12 days</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
              {nextLevel.minPoints - points} XP needed
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// Skill Leagues Component
export const SkillLeagues = ({ skillXP = {} }) => {
  const categories = [
    { key: 'technical', name: 'Technical', icon: Brain, color: 'blue' },
    { key: 'creative', name: 'Creative', icon: Sparkles, color: 'purple' },
    { key: 'management', name: 'Management', icon: Target, color: 'orange' },
    { key: 'social', name: 'Social', icon: Users, color: 'green' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {categories.map((cat) => {
        const Icon = cat.icon;
        const xp = skillXP[cat.key] || 0;
        const level = Math.floor(Math.sqrt(xp / 10)) || 1;
        const currentMin = level === 1 ? 0 : Math.pow(level, 2) * 10;
        const nextMin = Math.pow(level + 1, 2) * 10;
        const progress = Math.max(0, Math.min(100, ((xp - currentMin) / (nextMin - currentMin)) * 100));

        const colors = {
          blue: 'bg-blue-50 border-blue-200 text-blue-700',
          purple: 'bg-purple-50 border-purple-200 text-purple-700',
          orange: 'bg-orange-50 border-orange-200 text-orange-700',
          green: 'bg-green-50 border-green-200 text-green-700',
        };

        return (
          <div key={cat.key} className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${colors[cat.color]}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-tight">{cat.name} League</h4>
                <p className="text-[9px] font-bold text-neutral-500 uppercase">Level {level}</p>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[8px] font-bold uppercase">
                <span>XP: {xp}</span>
                <span>Tier 1</span>
              </div>
              <div className="h-1.5 bg-neutral-100 border border-black overflow-hidden">
                <div className="h-full bg-black" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Stats Card Component
export const StatsCard = ({ title, value, icon: Icon, color, trend = null }) => {
  const colors = {
    blue: 'text-blue-900 bg-blue-100 border-blue-900',
    purple: 'text-purple-900 bg-purple-100 border-purple-900',
    pink: 'text-pink-900 bg-pink-100 border-pink-900',
    green: 'text-emerald-900 bg-emerald-100 border-emerald-900',
    orange: 'text-orange-900 bg-orange-100 border-orange-900',
  };

  const theme = colors[color] || colors.blue;

  return (
    <div
      className={`bg-white border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all duration-300 ${color === 'blue' ? 'bg-blue-50' : color === 'purple' ? 'bg-purple-50' : color === 'pink' ? 'bg-pink-50' : color === 'green' ? 'bg-emerald-50' : 'bg-orange-50'}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 border-2 ${theme} shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend !== null && (
          <div
            className={`flex items-center text-xs font-bold uppercase border-2 px-1.5 py-0.5 ${trend > 0 ? 'bg-green-100 text-green-900 border-green-900' : 'bg-red-100 text-red-900 border-red-900'}`}
          >
            <TrendingUp className={`w-3 h-3 mr-1 ${trend < 0 ? 'rotate-180' : ''}`} />
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div>
        <h4 className="text-3xl font-black text-black tracking-tighter mb-1">{value}</h4>
        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">{title}</p>
      </div>
    </div>
  );
};

// Leaderboard Component
// Leaderboard Component
export const Leaderboard = ({ users = [], currentUserId = null, category = 'global', skill = null, onCategoryChange, onSkillChange }) => {
  const tiers = {
    Bronze: { icon: '🥉', color: 'bg-orange-100 text-orange-800' },
    Silver: { icon: '🥈', color: 'bg-slate-100 text-slate-800' },
    Gold: { icon: '🥇', color: 'bg-yellow-100 text-yellow-800' },
    Platinum: { icon: '💎', color: 'bg-cyan-100 text-cyan-800' },
    Diamond: { icon: '💠', color: 'bg-blue-100 text-blue-800' },
    Crown: { icon: '👑', color: 'bg-purple-100 text-purple-800' },
    Ace: { icon: '🌟', color: 'bg-red-100 text-red-800' },
    Conqueror: { icon: '🏆', color: 'bg-amber-100 text-amber-800' },
  };

  const categories = [
    { id: 'global', label: 'Global', icon: Trophy },
    { id: 'friends', label: 'Friends', icon: Users },
    { id: 'seasonal', label: 'Season', icon: Flame },
  ];

  const skillCategories = [
    { id: null, label: 'All', icon: Target },
    { id: 'technical', label: 'Techie', icon: Brain },
    { id: 'creative', label: 'Creative', icon: Sparkles },
    { id: 'management', label: 'Manager', icon: Target },
    { id: 'social', label: 'Social', icon: Users },
  ];

  return (
    <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
      {/* Leaderboard Header & Filters */}
      <div className="p-6 border-b-2 border-black bg-neutral-50 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black text-black flex items-center gap-3 uppercase tracking-wide">
            <Trophy className="w-8 h-8 text-black" />
            Hall of Fame
          </h3>
          <div className="flex bg-neutral-200 p-1 border-2 border-black">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => onCategoryChange?.(cat.id)}
                  className={`px-4 py-1.5 flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-all ${category === cat.id ? 'bg-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]' : 'text-neutral-500 hover:text-black'}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Skill Category Filters */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-black/10">
          {skillCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id || 'all'}
                onClick={() => onSkillChange?.(cat.id)}
                className={`flex-1 min-w-[80px] px-3 py-2 flex items-center justify-center gap-2 border-2 border-black text-[10px] font-black uppercase tracking-tight transition-all hover:bg-neutral-100 ${skill === cat.id ? 'bg-emerald-100 text-emerald-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'bg-white text-neutral-500'}`}
              >
                <Icon className="w-3 h-3" />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="divide-y-2 divide-black">
        {users.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-neutral-400 font-bold uppercase tracking-widest italic">No legends found in this bracket...</p>
          </div>
        ) : (
          users.slice(0, 20).map((user, index) => {
            const isMe = user.isMe || (currentUserId && String(currentUserId) === String(user._id || user.id || user.sid));
            const rank = index + 1;
            const tierData = tiers[user.tier || 'Bronze'] || tiers.Bronze;

            // Determine what XP to show
            let xpValue = user.points || 0;
            let xpLabel = 'Total XP';

            if (skill && ['technical', 'creative', 'management', 'social'].includes(skill)) {
              xpValue = (user.skillXP && user.skillXP[skill]) || 0;
              xpLabel = `${skill.charAt(0).toUpperCase() + skill.slice(1)} XP`;
            } else if (category === 'seasonal') {
              xpValue = user.seasonPoints || 0;
              xpLabel = 'Season XP';
            } else if (!skill && ['technical', 'creative', 'management', 'social'].includes(category)) {
              // Backward compatibility / shortcut
              xpValue = (user.skillXP && user.skillXP[category]) || 0;
              xpLabel = `${category.charAt(0).toUpperCase() + category.slice(1)} XP`;
            }

            return (
              <div
                key={user._id || user.id || user.sid || index}
                className={`flex items-center p-4 hover:bg-neutral-100 transition-colors relative group ${isMe ? 'bg-blue-50' : ''}`}
              >
                {/* Rank Number */}
                <div className="w-12 flex flex-col items-center justify-center">
                  <div className={`text-2xl font-black italic ${rank === 1 ? 'text-yellow-500' : rank === 2 ? 'text-neutral-400' : rank === 3 ? 'text-orange-500' : 'text-neutral-300'}`}>
                    {rank}
                  </div>
                  <div className="text-[8px] font-bold text-neutral-400 uppercase">Rank</div>
                </div>

                {/* User Info */}
                <div className="flex-1 flex items-center gap-4 ml-2">
                  <div className="relative">
                    <div
                      className={`w-14 h-14 border-2 border-black flex items-center justify-center text-lg font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-transform group-hover:scale-105 ${rank === 1 ? 'bg-yellow-400' : 'bg-white'}`}
                    >
                      {user.profilePic ? (
                        <img src={user.profilePic} alt={user.fullname || user.username || 'User'} className="w-full h-full object-cover" />
                      ) : (
                        (user.fullname || user.username || 'U').charAt(0).toUpperCase()
                      )}
                    </div>
                    {/* Small Tier Icon Floating */}
                    <div className={`absolute -bottom-1 -right-1 w-6 h-6 border border-black rounded-sm flex items-center justify-center text-xs shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] ${tierData.color}`}>
                      {tierData.icon}
                    </div>
                  </div>

                  <div className="min-w-0">
                    <div className="text-sm font-black text-black flex items-center gap-2 uppercase tracking-tight truncate">
                      {user.fullname || user.username}
                      {isMe && (
                        <span className="text-[9px] bg-blue-600 text-white border border-black px-1.5 py-0.5 font-bold uppercase tracking-widest">
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-bold text-neutral-500 uppercase">Lv.{user.level || 1}</span>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-black/10 ${tierData.color}`}>
                        {user.tier || 'Bronze'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* XP Stats */}
                <div className="text-right">
                  <div className="text-lg font-black text-black leading-none">
                    {xpValue.toLocaleString()}
                  </div>
                  <div className="text-[8px] font-bold text-neutral-400 uppercase tracking-widest mt-1">{xpLabel}</div>

                  {/* Skill Badges if applicable */}
                  {category === 'global' && user.skillXP && (
                    <div className="flex gap-1 mt-1 justify-end">
                      {Object.entries(user.skillXP)
                        .filter(([_, xp]) => xp > 500)
                        .map(([skill, _]) => {
                          const skillData = skillCategories.find(s => s.id === skill);
                          if (!skillData) return null;
                          const SvgIcon = skillData.icon;
                          return (
                            <div key={skill} className="w-4 h-4 bg-black text-white p-0.5" title={`${skillData.label} Legend`}>
                              <SvgIcon className="w-full h-full" />
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>

                {/* Top Rank Accents */}
                {rank <= 3 && (
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${rank === 1 ? 'bg-yellow-400' : rank === 2 ? 'bg-neutral-300' : 'bg-orange-400'}`} />
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Leaderboard Footer */}
      <div className="p-3 bg-neutral-900 text-white text-[9px] font-bold uppercase tracking-[0.2em] flex justify-between items-center">
        <span>Resets Monthly</span>
        <div className="flex gap-4">
          <span className="text-emerald-400">Next Reset: 22 Days</span>
          <span className="text-neutral-500">Live Updates</span>
        </div>
      </div>
    </div>
  );
};
