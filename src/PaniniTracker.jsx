import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Check, Plus, Minus, Trophy, Sticker, Users, Repeat, X, Download, Upload, UsersRound, ArrowLeftRight, LogOut, Crown, Package, Share2, BarChart3, Lock, Zap, Calendar, HelpCircle, ArrowUp, MessageCircle } from 'lucide-react';
import { storage } from './storage.js';

// ============================================================================
// FEATURE FLAGS — flip these on/off without changing any other code
// ============================================================================

// Multi-group switcher: when true, users see a "Switch Group" button that lets
// them join multiple groups and toggle the active one. The data model already
// supports this (profile.groups[]) — this just toggles the UI visibility.
const SHOW_GROUP_SWITCHER = false;

// ============================================================================
// ALBUM DATA: 2026 FIFA World Cup — Panini
// 980 stickers total: 9 intro + 11 FIFA Museum + 48 teams × 20 + 12 Coca-Cola special
// Each team: 1 crest + 1 team photo + 18 players = 20 stickers
// ============================================================================

const TEAMS = [
  // Group A
  { code: 'MEX', name: 'Mexico', group: 'A', flag: '🇲🇽', color: '#006847' },
  { code: 'RSA', name: 'South Africa', group: 'A', flag: '🇿🇦', color: '#007749' },
  { code: 'KOR', name: 'South Korea', group: 'A', flag: '🇰🇷', color: '#CD2E3A' },
  { code: 'CZE', name: 'Czechia', group: 'A', flag: '🇨🇿', color: '#11457E' },
  // Group B
  { code: 'CAN', name: 'Canada', group: 'B', flag: '🇨🇦', color: '#FF0000' },
  { code: 'BIH', name: 'Bosnia & Herz.', group: 'B', flag: '🇧🇦', color: '#002F6C' },
  { code: 'QAT', name: 'Qatar', group: 'B', flag: '🇶🇦', color: '#8A1538' },
  { code: 'SUI', name: 'Switzerland', group: 'B', flag: '🇨🇭', color: '#DA291C' },
  // Group C
  { code: 'BRA', name: 'Brazil', group: 'C', flag: '🇧🇷', color: '#FEDF00' },
  { code: 'MAR', name: 'Morocco', group: 'C', flag: '🇲🇦', color: '#C1272D' },
  { code: 'HAI', name: 'Haiti', group: 'C', flag: '🇭🇹', color: '#00209F' },
  { code: 'SCO', name: 'Scotland', group: 'C', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', color: '#005EB8' },
  // Group D
  { code: 'USA', name: 'USA', group: 'D', flag: '🇺🇸', color: '#3C3B6E' },
  { code: 'PAR', name: 'Paraguay', group: 'D', flag: '🇵🇾', color: '#D52B1E' },
  { code: 'AUS', name: 'Australia', group: 'D', flag: '🇦🇺', color: '#FFCD00' },
  { code: 'TUR', name: 'Türkiye', group: 'D', flag: '🇹🇷', color: '#E30A17' },
  // Group E
  { code: 'GER', name: 'Germany', group: 'E', flag: '🇩🇪', color: '#000000' },
  { code: 'CUW', name: 'Curaçao', group: 'E', flag: '🇨🇼', color: '#002B7F' },
  { code: 'CIV', name: "Côte d'Ivoire", group: 'E', flag: '🇨🇮', color: '#FF8200' },
  { code: 'ECU', name: 'Ecuador', group: 'E', flag: '🇪🇨', color: '#FFD700' },
  // Group F
  { code: 'NED', name: 'Netherlands', group: 'F', flag: '🇳🇱', color: '#FF6600' },
  { code: 'JPN', name: 'Japan', group: 'F', flag: '🇯🇵', color: '#BC002D' },
  { code: 'SWE', name: 'Sweden', group: 'F', flag: '🇸🇪', color: '#006AA7' },
  { code: 'TUN', name: 'Tunisia', group: 'F', flag: '🇹🇳', color: '#E70013' },
  // Group G
  { code: 'BEL', name: 'Belgium', group: 'G', flag: '🇧🇪', color: '#000000' },
  { code: 'EGY', name: 'Egypt', group: 'G', flag: '🇪🇬', color: '#CE1126' },
  { code: 'IRN', name: 'Iran', group: 'G', flag: '🇮🇷', color: '#239F40' },
  { code: 'NZL', name: 'New Zealand', group: 'G', flag: '🇳🇿', color: '#000000' },
  // Group H
  { code: 'ESP', name: 'Spain', group: 'H', flag: '🇪🇸', color: '#AA151B' },
  { code: 'CPV', name: 'Cape Verde', group: 'H', flag: '🇨🇻', color: '#003893' },
  { code: 'KSA', name: 'Saudi Arabia', group: 'H', flag: '🇸🇦', color: '#006C35' },
  { code: 'URU', name: 'Uruguay', group: 'H', flag: '🇺🇾', color: '#5CBFE9' },
  // Group I
  { code: 'FRA', name: 'France', group: 'I', flag: '🇫🇷', color: '#0055A4' },
  { code: 'SEN', name: 'Senegal', group: 'I', flag: '🇸🇳', color: '#00853F' },
  { code: 'IRQ', name: 'Iraq', group: 'I', flag: '🇮🇶', color: '#CE1126' },
  { code: 'NOR', name: 'Norway', group: 'I', flag: '🇳🇴', color: '#BA0C2F' },
  // Group J
  { code: 'ARG', name: 'Argentina', group: 'J', flag: '🇦🇷', color: '#75AADB' },
  { code: 'ALG', name: 'Algeria', group: 'J', flag: '🇩🇿', color: '#006233' },
  { code: 'AUT', name: 'Austria', group: 'J', flag: '🇦🇹', color: '#ED2939' },
  { code: 'JOR', name: 'Jordan', group: 'J', flag: '🇯🇴', color: '#000000' },
  // Group K
  { code: 'POR', name: 'Portugal', group: 'K', flag: '🇵🇹', color: '#006600' },
  { code: 'COD', name: 'DR Congo', group: 'K', flag: '🇨🇩', color: '#007FFF' },
  { code: 'UZB', name: 'Uzbekistan', group: 'K', flag: '🇺🇿', color: '#0099B5' },
  { code: 'COL', name: 'Colombia', group: 'K', flag: '🇨🇴', color: '#FCD116' },
  // Group L
  { code: 'ENG', name: 'England', group: 'L', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', color: '#FFFFFF' },
  { code: 'CRO', name: 'Croatia', group: 'L', flag: '🇭🇷', color: '#FF0000' },
  { code: 'PAN', name: 'Panama', group: 'L', flag: '🇵🇦', color: '#005AA7' },
  { code: 'GHA', name: 'Ghana', group: 'L', flag: '🇬🇭', color: '#006B3F' },
];

// Build the full sticker checklist
const buildAlbum = () => {
  const stickers = [];
  // Intro: FWC00 (album cover/intro), then FWC1–FWC8
  stickers.push({ id: 'FWC00', section: 'Intro', team: 'Intro', label: 'Album Cover', special: true });
  for (let i = 1; i <= 8; i++) {
    stickers.push({ id: `FWC${i}`, section: 'Intro', team: 'Intro', label: `Intro ${i}`, special: true });
  }
  // FIFA Museum: FWC9–FWC19 (11 past champions)
  for (let i = 9; i <= 19; i++) {
    stickers.push({ id: `FWC${i}`, section: 'FIFA Museum', team: 'Museum', label: `Past Champion ${i - 8}`, special: true });
  }
  // Team stickers
  TEAMS.forEach(team => {
    // 1 = crest, 2–12 = players, 13 = team photo, 14–20 = players (18 players + crest + team photo = 20)
    stickers.push({ id: `${team.code}1`, section: team.name, team: team.code, label: 'Team Crest', isCrest: true });
    for (let i = 2; i <= 20; i++) {
      const isPhoto = i === 13;
      // Player number: positions 2–12 are players 1–11, positions 14–20 are players 12–18
      const playerNum = i < 13 ? i - 1 : i - 2;
      stickers.push({
        id: `${team.code}${i}`,
        section: team.name,
        team: team.code,
        label: isPhoto ? 'Team Photo' : `Player ${playerNum}`,
        isPhoto,
      });
    }
  });
  // Coca-Cola specials (12 hidden stickers)
  for (let i = 1; i <= 12; i++) {
    stickers.push({ id: `COKE${i}`, section: 'Coca-Cola Special', team: 'Special', label: `Coke ${i}`, special: true });
  }
  return stickers;
};

const ALBUM = buildAlbum();

// ============================================================================
// COMPONENT
// ============================================================================

export default function PaniniTracker() {
  const [collection, setCollection] = useState({}); // { stickerId: count }
  const [search, setSearch] = useState('');
  const [activeTeam, setActiveTeam] = useState('ALL');
  const [filter, setFilter] = useState('all'); // all | got | need | dupes
  const [loading, setLoading] = useState(true);
  const stickerGridRef = useRef(null);

  // Group sharing state
  const [profile, setProfile] = useState(null); // { name, groupCode } or null
  const [view, setView] = useState('album'); // 'album' | 'group' | 'stats'
  const [groupMembers, setGroupMembers] = useState([]); // array of { name, collection, updatedAt, reservations }
  const [refreshingGroup, setRefreshingGroup] = useState(false);

  // Pack opening mode
  const [packMode, setPackMode] = useState(false);

  // Screen lock — prevents accidental taps when showing the album to others
  const [screenLocked, setScreenLocked] = useState(false);

  // Version detection
  const [appVersion, setAppVersion] = useState(null); // hash of the loaded JS bundle
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showSuggest, setShowSuggest] = useState(false);

  // Show "back to top" button after scrolling down
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Sticker to highlight after a search jump
  const [highlightedSticker, setHighlightedSticker] = useState(null);

  // Timeline: array of { stickerId, ts } — appended whenever a sticker first goes from 0 → 1
  const [timeline, setTimeline] = useState([]);

  // Reservations: { stickerId: friendName } — stickers I've promised to someone
  const [reservations, setReservations] = useState({});

  // Wrap setActiveTeam to also scroll to the sticker grid
  const selectTeam = (code) => {
    setActiveTeam(code);
    // Wait a frame so the grid re-renders with new content before scrolling
    requestAnimationFrame(() => {
      stickerGridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  // Load from persistent storage
  useEffect(() => {
    (async () => {
      try {
        const result = await storage.get('panini-wc-2026');
        if (result?.value) setCollection(JSON.parse(result.value));
      } catch (e) {
        // No existing data — fresh start
      }
      try {
        const profileResult = await storage.get('panini-wc-2026-profile');
        if (profileResult?.value) {
          let p = JSON.parse(profileResult.value);
          // Migration: if old shape (no groups[] array), upgrade it in place
          if (p && !Array.isArray(p.groups)) {
            p = { ...p, groups: p.groupCode ? [p.groupCode] : [] };
            await storage.set('panini-wc-2026-profile', JSON.stringify(p)).catch(() => {});
          }
          setProfile(p);
        }
      } catch (e) {
        // No profile yet
      }
      try {
        const tl = await storage.get('panini-wc-2026-timeline');
        if (tl?.value) setTimeline(JSON.parse(tl.value));
      } catch (e) {
        // No timeline yet
      }
      try {
        const res = await storage.get('panini-wc-2026-reservations');
        if (res?.value) setReservations(JSON.parse(res.value));
      } catch (e) {
        // No reservations yet
      }
      try {
        const lk = await storage.get('panini-wc-2026-locked');
        if (lk?.value) setScreenLocked(JSON.parse(lk.value));
      } catch (e) {
        // No lock state yet
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Persist timeline
  useEffect(() => {
    if (loading) return;
    storage.set('panini-wc-2026-timeline', JSON.stringify(timeline)).catch(() => {});
  }, [timeline, loading]);

  // Persist reservations
  useEffect(() => {
    if (loading) return;
    storage.set('panini-wc-2026-reservations', JSON.stringify(reservations)).catch(() => {});
  }, [reservations, loading]);

  // Persist screen lock state
  useEffect(() => {
    if (loading) return;
    storage.set('panini-wc-2026-locked', JSON.stringify(screenLocked)).catch(() => {});
  }, [screenLocked, loading]);

  // Version detection: capture the hash of the currently-loaded JS bundle
  // and periodically compare against /index.html to detect new deployments.
  useEffect(() => {
    if (loading) return;

    // Helper: extract the JS bundle hash from any HTML string
    const extractBundleHash = (html) => {
      const match = html.match(/\/assets\/index-([A-Za-z0-9_-]+)\.js/);
      return match ? match[1] : null;
    };

    // Get the hash of the currently-loaded bundle by reading the script tag from the DOM
    const getCurrentHash = () => {
      const scripts = document.querySelectorAll('script[src*="/assets/index-"]');
      for (const s of scripts) {
        const m = s.src.match(/\/assets\/index-([A-Za-z0-9_-]+)\.js/);
        if (m) return m[1];
      }
      return null;
    };

    const currentHash = getCurrentHash();
    setAppVersion(currentHash);

    // Skip checks when running locally (no hash) or unable to parse
    if (!currentHash) return;

    let cancelled = false;
    const check = async () => {
      try {
        const res = await fetch('/index.html', { cache: 'no-store' });
        if (!res.ok) return;
        const html = await res.text();
        const liveHash = extractBundleHash(html);
        if (cancelled) return;
        if (liveHash && liveHash !== currentHash) {
          setUpdateAvailable(true);
        }
      } catch {
        // Network error, ignore
      }
    };

    // Check immediately on load and every 5 minutes after
    check();
    const interval = setInterval(check, 5 * 60 * 1000);
    // Also check when the tab regains focus
    const onFocus = () => check();
    window.addEventListener('focus', onFocus);

    return () => {
      cancelled = true;
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [loading]);

  // Welcome screen: shown once on first ever open
  useEffect(() => {
    if (loading) return;
    (async () => {
      try {
        const seen = await storage.get('panini-wc-2026-welcomed');
        if (!seen?.value) setShowWelcome(true);
      } catch {
        setShowWelcome(true);
      }
    })();
  }, [loading]);

  const dismissWelcome = async () => {
    setShowWelcome(false);
    await storage.set('panini-wc-2026-welcomed', '1').catch(() => {});
  };

  // Submit a suggestion / feedback to Firebase. The developer reads these from the console.
  const submitSuggestion = async (message) => {
    const trimmed = (message || '').trim().slice(0, 500);
    if (!trimmed) return;
    const ts = Date.now();
    // Random suffix so two people sending at the same millisecond don't collide
    const id = `${ts}-${Math.random().toString(36).slice(2, 8)}`;
    const payload = {
      from: profile?.name || 'Anonymous',
      groupCode: profile?.groupCode || null,
      message: trimmed,
      ts,
    };
    await storage.set(`feedback:${id}`, JSON.stringify(payload), true).catch(() => {});
  };

  // Track scroll position to show/hide "back to top" button
  const scrollingToTop = useRef(false);
  useEffect(() => {
    const onScroll = () => {
      // Don't hide the button while we're animating to top — wait until we arrive
      if (scrollingToTop.current) {
        if (window.scrollY <= 10) {
          scrollingToTop.current = false;
          setShowScrollTop(false);
        }
        return;
      }
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => {
    scrollingToTop.current = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Safety: clear the flag after 2s in case smooth scroll doesn't fire scroll events to <= 10
    setTimeout(() => {
      scrollingToTop.current = false;
      if (window.scrollY <= 400) setShowScrollTop(false);
    }, 2000);
  };

  // Sync collection to shared group storage whenever it changes (debounced)
  useEffect(() => {
    if (loading || !profile) return;
    const t = setTimeout(() => {
      const memberKey = `group:${profile.groupCode}:member:${profile.name}`;
      // Preserve incomingRequests (other members write to this field)
      const me = groupMembers.find(m => m.name === profile.name);
      const payload = {
        name: profile.name,
        collection,
        reservations,
        incomingRequests: me?.incomingRequests || {},
        updatedAt: Date.now(),
      };
      storage.set(memberKey, JSON.stringify(payload), true).catch(() => {});
    }, 800);
    return () => clearTimeout(t);
  }, [collection, reservations, profile, loading, groupMembers]);

  // Subscribe to live group updates whenever profile is set
  useEffect(() => {
    if (!profile) {
      setGroupMembers([]);
      return;
    }
    setRefreshingGroup(true);
    const unsub = storage.subscribeToGroup(profile.groupCode, (members) => {
      setGroupMembers(members);
      setRefreshingGroup(false);
    });
    return () => unsub();
  }, [profile]);

  // Manual refresh kept for the button but it just shows a loading flash since data is live
  const refreshGroup = async () => {
    setRefreshingGroup(true);
    setTimeout(() => setRefreshingGroup(false), 500);
  };

  const saveProfile = async (name, groupCode) => {
    const cleanCode = groupCode.trim().toLowerCase().replace(/\s+/g, '-');
    const cleanName = name.trim();
    // If the user already had a profile (e.g. someone editing their name), keep the groups list.
    // Otherwise initialize with this single group.
    const existingGroups = profile?.groups || [];
    const groups = existingGroups.includes(cleanCode) ? existingGroups : [...existingGroups, cleanCode];
    const newProfile = { name: cleanName, groupCode: cleanCode, groups };
    setProfile(newProfile);
    await storage.set('panini-wc-2026-profile', JSON.stringify(newProfile)).catch(() => {});
    // Immediately publish current collection
    const memberKey = `group:${newProfile.groupCode}:member:${newProfile.name}`;
    await storage.set(memberKey, JSON.stringify({
      name: newProfile.name,
      collection,
      reservations,
      updatedAt: Date.now(),
    }), true).catch(() => {});
  };

  // Switch the active group to one already in the user's groups list.
  const switchActiveGroup = async (groupCode) => {
    if (!profile) return;
    if (!profile.groups?.includes(groupCode)) return;
    const newProfile = { ...profile, groupCode };
    setProfile(newProfile);
    setGroupMembers([]); // clear stale group members so the new subscription doesn't flash old data
    await storage.set('panini-wc-2026-profile', JSON.stringify(newProfile)).catch(() => {});
  };

  // Join an additional group (adds to groups list, sets it active, publishes collection).
  const joinAdditionalGroup = async (groupCode) => {
    if (!profile) return;
    const cleanCode = groupCode.trim().toLowerCase().replace(/\s+/g, '-');
    if (!cleanCode) return;
    const groups = profile.groups?.includes(cleanCode) ? profile.groups : [...(profile.groups || []), cleanCode];
    const newProfile = { ...profile, groupCode: cleanCode, groups };
    setProfile(newProfile);
    setGroupMembers([]);
    await storage.set('panini-wc-2026-profile', JSON.stringify(newProfile)).catch(() => {});
    // Publish current collection to the new group
    const memberKey = `group:${cleanCode}:member:${profile.name}`;
    await storage.set(memberKey, JSON.stringify({
      name: profile.name,
      collection,
      reservations,
      updatedAt: Date.now(),
    }), true).catch(() => {});
  };

  const leaveGroup = async () => {
    if (!profile) return;
    const remaining = (profile.groups || []).filter(g => g !== profile.groupCode);
    const promptMsg = remaining.length > 0
      ? `Leave group "${profile.groupCode}"? You'll switch to "${remaining[0]}". Your collection stays on this device.`
      : `Leave group "${profile.groupCode}"? Your collection stays on this device.`;
    if (!confirm(promptMsg)) return;
    // Remove our entry from this group's shared data
    try {
      const memberKey = `group:${profile.groupCode}:member:${profile.name}`;
      await storage.delete(memberKey, true);
    } catch {}
    if (remaining.length > 0) {
      // Fall back to first remaining group
      const newProfile = { ...profile, groupCode: remaining[0], groups: remaining };
      setProfile(newProfile);
      setGroupMembers([]);
      await storage.set('panini-wc-2026-profile', JSON.stringify(newProfile)).catch(() => {});
    } else {
      // No groups left — clear profile entirely
      await storage.delete('panini-wc-2026-profile').catch(() => {});
      setProfile(null);
      setGroupMembers([]);
      setView('album');
    }
  };

  // Total reset — wipes the local collection, timeline, and reservations.
  // Profile (name + group code) is preserved. If in a group, the cleared collection
  // syncs up to Firebase so groupmates see the reset too.
  const resetCollection = async () => {
    setCollection({});
    setTimeline([]);
    setReservations({});
    // Clear local persisted copies right away (don't wait for the debounce)
    await storage.set('panini-wc-2026', JSON.stringify({})).catch(() => {});
    await storage.set('panini-wc-2026-timeline', JSON.stringify([])).catch(() => {});
    await storage.set('panini-wc-2026-reservations', JSON.stringify({})).catch(() => {});
    // Push the cleared state to the group entry so others see it
    if (profile) {
      const memberKey = `group:${profile.groupCode}:member:${profile.name}`;
      const me = groupMembers.find(m => m.name === profile.name);
      const payload = {
        name: profile.name,
        collection: {},
        reservations: {},
        incomingRequests: me?.incomingRequests || {},
        updatedAt: Date.now(),
      };
      await storage.set(memberKey, JSON.stringify(payload), true).catch(() => {});
    }
  };

  // Save with debounce
  useEffect(() => {
    if (loading) return;
    const t = setTimeout(() => {
      storage.set('panini-wc-2026', JSON.stringify(collection)).catch(() => {});
    }, 400);
    return () => clearTimeout(t);
  }, [collection, loading]);

  const updateCount = (id, delta) => {
    setCollection(prev => {
      const oldVal = prev[id] || 0;
      const next = { ...prev };
      const newVal = Math.max(0, oldVal + delta);
      if (newVal === 0) delete next[id];
      else next[id] = newVal;

      // Record timeline event when sticker is first acquired (0 → 1+)
      if (oldVal === 0 && newVal > 0) {
        setTimeline(t => [...t, { stickerId: id, ts: Date.now() }]);
      }
      return next;
    });
  };

  // Stats
  const stats = useMemo(() => {
    const total = ALBUM.length;
    const got = ALBUM.filter(s => collection[s.id] > 0).length;
    const dupes = Object.entries(collection).reduce((sum, [_, c]) => sum + Math.max(0, c - 1), 0);
    const need = total - got;
    return { total, got, need, dupes, pct: ((got / total) * 100).toFixed(1) };
  }, [collection]);

  // Per-team stats
  const teamStats = useMemo(() => {
    const map = {};
    TEAMS.forEach(t => {
      const teamStickers = ALBUM.filter(s => s.team === t.code);
      const got = teamStickers.filter(s => collection[s.id] > 0).length;
      map[t.code] = { got, total: teamStickers.length };
    });
    return map;
  }, [collection]);

  // Filtered display
  const visibleStickers = useMemo(() => {
    let list = ALBUM;
    if (activeTeam !== 'ALL') list = list.filter(s => s.team === activeTeam);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        s.id.toLowerCase().includes(q) ||
        s.label.toLowerCase().includes(q) ||
        s.section.toLowerCase().includes(q)
      );
    }
    if (filter === 'got') list = list.filter(s => collection[s.id] > 0);
    if (filter === 'need') list = list.filter(s => !collection[s.id]);
    if (filter === 'dupes') list = list.filter(s => (collection[s.id] || 0) > 1);
    return list;
  }, [activeTeam, search, filter, collection]);

  // Jump to the first sticker matching the current search
  const jumpToSearchResult = () => {
    if (!search.trim()) return;
    // If filtered to a specific team, broaden to ALL so the match is visible
    if (activeTeam !== 'ALL') setActiveTeam('ALL');
    // Use the first visible sticker as the target. If filter excludes all matches, fall back to ALL filter.
    let target = visibleStickers[0];
    if (!target) {
      // Search across full album
      const q = search.toLowerCase();
      target = ALBUM.find(s =>
        s.id.toLowerCase().includes(q) ||
        s.label.toLowerCase().includes(q) ||
        s.section.toLowerCase().includes(q)
      );
      if (target) {
        setFilter('all'); // ensure visible
      }
    }
    if (!target) return;
    setHighlightedSticker(target.id);
    // Wait one frame for filter changes / re-render, then scroll
    requestAnimationFrame(() => {
      const el = document.getElementById(`sticker-${target.id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
    // Clear highlight after the pulse animation finishes
    setTimeout(() => setHighlightedSticker(null), 3000);
  };

  // Export / Import
  const exportData = () => {
    const blob = new Blob([JSON.stringify(collection, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `panini-wc-2026-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (typeof data === 'object') setCollection(data);
      } catch {
        alert('Invalid file format');
      }
    };
    reader.readAsText(file);
  };

  // Toggle a reservation: clicking a friend on a trade row promises that sticker to them
  const toggleReservation = (stickerId, friendName) => {
    setReservations(prev => {
      const next = { ...prev };
      if (next[stickerId] === friendName) delete next[stickerId];
      else next[stickerId] = friendName;
      return next;
    });
  };

  // Ask another member for a sticker. Writes to THAT member's incomingRequests on Firebase.
  const requestStickerFromMember = async (memberName, stickerId) => {
    if (!profile) return;
    // Find the member's current data so we don't clobber their other fields
    const target = groupMembers.find(m => m.name === memberName);
    if (!target) return;
    const incoming = { ...(target.incomingRequests || {}) };
    const key = `${profile.name}|${stickerId}`;
    if (incoming[key]) {
      // Already requested — toggle off (cancel the request)
      delete incoming[key];
    } else {
      incoming[key] = { from: profile.name, stickerId, ts: Date.now() };
    }
    const updated = { ...target, incomingRequests: incoming, updatedAt: Date.now() };
    const memberKey = `group:${profile.groupCode}:member:${memberName}`;
    await storage.set(memberKey, JSON.stringify(updated), true).catch(() => {});
  };

  // Promise an incoming request: reserve the sticker for that asker, then clear the request.
  const promiseRequest = async (fromName, stickerId) => {
    setReservations(prev => ({ ...prev, [stickerId]: fromName }));
    await clearIncomingRequest(fromName, stickerId);
  };

  // Decline (or simply clear) an incoming request
  const declineRequest = async (fromName, stickerId) => {
    await clearIncomingRequest(fromName, stickerId);
  };

  // Helper: remove a single incoming request from MY entry
  const clearIncomingRequest = async (fromName, stickerId) => {
    if (!profile) return;
    const me = groupMembers.find(m => m.name === profile.name);
    const incoming = { ...(me?.incomingRequests || {}) };
    delete incoming[`${fromName}|${stickerId}`];
    const memberKey = `group:${profile.groupCode}:member:${profile.name}`;
    const payload = {
      name: profile.name,
      collection,
      reservations,
      incomingRequests: incoming,
      updatedAt: Date.now(),
    };
    await storage.set(memberKey, JSON.stringify(payload), true).catch(() => {});
  };

  // Build a shareable text list of stickers I still need
  const buildNeedsList = () => {
    const needs = ALBUM.filter(s => !collection[s.id]);
    if (needs.length === 0) return 'Album complete! 🏆';

    // Group needs by section for readability
    const bySection = {};
    needs.forEach(s => {
      const key = s.section;
      if (!bySection[key]) bySection[key] = [];
      bySection[key].push(s.id);
    });

    const groupOrder = ['Intro', 'FIFA Museum', ...TEAMS.map(t => t.name), 'Coca-Cola Special'];
    const lines = [`📔 My Panini WC 2026 needs (${needs.length}/${ALBUM.length}):`, ''];
    groupOrder.forEach(section => {
      if (bySection[section]) {
        lines.push(`${section}: ${bySection[section].join(', ')}`);
      }
    });
    return lines.join('\n');
  };

  const shareNeeds = async () => {
    const text = buildNeedsList();
    if (navigator.share) {
      try {
        await navigator.share({ title: 'My sticker needs', text });
        return;
      } catch {
        // User cancelled or share failed — fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      alert('Needs list copied to clipboard!');
    } catch {
      // Fallback: show the text in a prompt
      window.prompt('Copy this list:', text);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <div className="text-stone-600 font-mono text-sm tracking-widest">LOADING ALBUM…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Decorative grain overlay via CSS */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&family=Fraunces:opsz,wght@9..144,400;9..144,700;9..144,900&display=swap');
        .display { font-family: 'Bebas Neue', sans-serif; letter-spacing: 0.02em; }
        .serif { font-family: 'Fraunces', serif; }
        .mono { font-family: 'DM Mono', monospace; }
        .halftone {
          background-image: radial-gradient(circle, rgba(0,0,0,0.15) 1px, transparent 1.5px);
          background-size: 6px 6px;
        }
        .paper {
          background-color: #f5f1e8;
          background-image:
            radial-gradient(circle at 20% 30%, rgba(180, 140, 90, 0.04) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(160, 90, 70, 0.04) 0%, transparent 50%);
        }
        .sticker-shadow {
          box-shadow: 2px 2px 0 rgba(0,0,0,0.08), 4px 4px 12px rgba(0,0,0,0.06);
        }
        .got-sticker {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border-color: #92400e;
        }
        .dupe-sticker {
          background: linear-gradient(135deg, #fed7aa 0%, #fb923c 100%);
          border-color: #9a3412;
        }
        /* Sticker-pack button style: chunky border, layered shadow, playful active state */
        .btn-sticker {
          border: 2px solid #1c1917;
          box-shadow: 3px 3px 0 #1c1917;
          transition: transform 120ms ease, box-shadow 120ms ease;
          font-weight: bold;
        }
        .btn-sticker:hover {
          transform: translate(-1px, -1px) rotate(-1deg);
          box-shadow: 4px 4px 0 #1c1917;
        }
        .btn-sticker:active:not(:disabled) {
          transform: translate(2px, 2px);
          box-shadow: 1px 1px 0 #1c1917;
        }
        .btn-sticker:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          box-shadow: 2px 2px 0 #1c1917;
        }
        /* Argentine flag background — celeste/white/celeste horizontal stripes with sun */
        .btn-arg-flag {
          background:
            radial-gradient(circle at center, rgba(252, 211, 77, 0.85) 0, rgba(252, 211, 77, 0.5) 18px, transparent 22px),
            linear-gradient(
              to bottom,
              #74ACDF 0%,
              #74ACDF 33%,
              #ffffff 33%,
              #ffffff 66%,
              #74ACDF 66%,
              #74ACDF 100%
            );
          color: #1c1917;
          text-shadow: 0 1px 0 rgba(255,255,255,0.6);
        }
        @keyframes stamp {
          0% { transform: scale(1.5) rotate(-12deg); opacity: 0; }
          60% { transform: scale(0.95) rotate(-12deg); opacity: 1; }
          100% { transform: scale(1) rotate(-12deg); opacity: 1; }
        }
        .stamp-anim { animation: stamp 0.4s ease-out; }
        /* Search-jump highlight pulse */
        @keyframes searchPulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(220,38,38, 0.6); }
          50% { transform: scale(1.05); box-shadow: 0 0 0 12px rgba(220,38,38, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(220,38,38, 0); }
        }
        .search-pulse { animation: searchPulse 1.4s ease-out 2; }
      `}</style>

      {/* UNIFIED HEADER — masthead + stats in one band */}
      <header
        className="paper border-b-4 border-stone-900 relative overflow-hidden"
        style={{ paddingTop: 'env(safe-area-inset-top, 0)' }}
      >
        <div className="absolute inset-0 halftone opacity-30 pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 relative">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Icon thumbnail */}
            <img
              src="/app-image-256.png"
              alt=""
              className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0"
            />

            {/* Title block */}
            <div className="flex-1 min-w-0">
              <div className="mono text-[10px] sm:text-[11px] text-stone-600 leading-none tracking-wider">
                VOL. 26 · USA · CAN · MEX
              </div>
              <h1 className="display text-4xl sm:text-5xl text-stone-900 leading-none mt-1">
                LOCURA <span className="text-red-700">MUNDIAL</span>
              </h1>
              {profile && (
                <p className="serif text-stone-700 mt-1.5 text-sm sm:text-base truncate">
                  Hello, <span className="font-bold text-stone-900">{profile.name.split(' ')[0]}</span>
                </p>
              )}
            </div>

            {/* Right side: percentage + mini stats */}
            <div className="text-right flex-shrink-0">
              <div className="display text-5xl sm:text-6xl text-red-700 leading-none">
                {stats.pct}<span className="text-2xl sm:text-3xl">%</span>
              </div>
              <div className="mono text-[10px] sm:text-[11px] text-stone-600 mt-1 tracking-wider">
                {stats.got}/{stats.total}
              </div>
            </div>
          </div>

          {/* Compact stats row */}
          <div className="flex items-center justify-around gap-2 mt-3 pt-3 border-t border-stone-300">
            <MiniStat icon={<Sticker size={12} />} label="GOT" value={stats.got} color="text-amber-700" />
            <div className="w-px h-6 bg-stone-300" />
            <MiniStat icon={<X size={12} />} label="NEED" value={stats.need} color="text-red-700" />
            <div className="w-px h-6 bg-stone-300" />
            <MiniStat icon={<Repeat size={12} />} label="DUPES" value={stats.dupes} color="text-orange-700" />
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-stone-300">
          <div
            className="h-full bg-gradient-to-r from-amber-400 via-red-500 to-emerald-500 transition-all duration-700"
            style={{ width: `${stats.pct}%` }}
          />
        </div>
      </header>

      {/* UPDATE AVAILABLE BANNER */}
      {updateAvailable && (
        <div className="bg-emerald-600 border-b-2 border-stone-900 py-2 px-4 flex items-center justify-center gap-3 mono text-[11px] uppercase tracking-wider text-white font-bold">
          <span>🆕 New version available</span>
          <button
            onClick={() => window.location.reload()}
            className="px-3 py-1 bg-white text-emerald-700 hover:bg-stone-100 transition-colors"
          >
            Reload
          </button>
        </div>
      )}

      {/* LOCKED BANNER */}
      {screenLocked && (
        <div className="bg-amber-400 border-b-2 border-stone-900 py-1.5 px-4 flex items-center justify-center gap-2 mono text-[11px] uppercase tracking-wider text-stone-900 font-bold">
          <Lock size={12} /> Screen locked — taps disabled
          <button
            onClick={() => setScreenLocked(false)}
            className="ml-2 underline hover:no-underline"
          >
            Unlock
          </button>
        </div>
      )}

      {/* VIEW TABS */}
      <div className="paper border-b-2 border-stone-900">
        <div className="max-w-6xl mx-auto flex">
          <button
            onClick={() => setView('album')}
            className={`flex-1 px-2 py-3 mono text-xs sm:text-sm uppercase tracking-wider border-r-2 border-stone-900 transition-colors ${
              view === 'album' ? 'bg-stone-900 text-amber-400' : 'text-stone-700 hover:bg-stone-200'
            }`}
          >
            <span className="flex items-center justify-center gap-2"><Sticker size={14} /> Album</span>
          </button>
          <button
            onClick={() => setView('stats')}
            className={`flex-1 px-2 py-3 mono text-xs sm:text-sm uppercase tracking-wider border-r-2 border-stone-900 transition-colors ${
              view === 'stats' ? 'bg-stone-900 text-amber-400' : 'text-stone-700 hover:bg-stone-200'
            }`}
          >
            <span className="flex items-center justify-center gap-2"><BarChart3 size={14} /> Stats</span>
          </button>
          <button
            onClick={() => setView('group')}
            className={`flex-1 px-2 py-3 mono text-xs sm:text-sm uppercase tracking-wider transition-colors ${
              view === 'group' ? 'bg-stone-900 text-amber-400' : 'text-stone-700 hover:bg-stone-200'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <UsersRound size={14} /> Group {profile && <span className="text-red-700 font-bold hidden md:inline">· {profile.groupCode}</span>}
            </span>
          </button>
        </div>
      </div>

      {/* GROUP VIEW */}
      {view === 'group' && (
        <GroupView
          profile={profile}
          onSaveProfile={saveProfile}
          onLeaveGroup={leaveGroup}
          members={groupMembers}
          myCollection={collection}
          myReservations={reservations}
          onToggleReservation={toggleReservation}
          onRequestSticker={requestStickerFromMember}
          onPromiseRequest={promiseRequest}
          onDeclineRequest={declineRequest}
          onSwitchGroup={switchActiveGroup}
          onJoinAdditionalGroup={joinAdditionalGroup}
          onRefresh={refreshGroup}
          refreshing={refreshingGroup}
          album={ALBUM}
          teams={TEAMS}
        />
      )}

      {/* STATS VIEW */}
      {view === 'stats' && (
        <StatsView
          collection={collection}
          timeline={timeline}
          album={ALBUM}
          teams={TEAMS}
        />
      )}

      {/* PACK OPENING MODAL */}
      {packMode && (
        <PackMode
          album={ALBUM}
          collection={collection}
          onAdd={(id) => updateCount(id, 1)}
          onRemove={(id) => updateCount(id, -1)}
          onClose={() => setPackMode(false)}
        />
      )}

      {/* ALBUM VIEW (everything below) */}
      {view === 'album' && <>

      {/* CONTROLS */}
      <div className="paper border-b-2 border-stone-900 sticky top-0 z-20 shadow-md">
        <div className="max-w-6xl mx-auto px-6 py-3 space-y-2">
          {/* Row 1: search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
            <input
              type="text"
              placeholder="Search stickers, players, teams…"
              value={search}
              onChange={(e) => setSearch(e.target.value.toUpperCase())}
              onKeyDown={(e) => { if (e.key === 'Enter') jumpToSearchResult(); }}
              autoCapitalize="characters"
              autoCorrect="off"
              autoComplete="off"
              spellCheck="false"
              className="w-full pl-9 pr-3 py-2 bg-stone-50 border-2 border-stone-900 mono focus:outline-none focus:border-red-700"
              style={{ fontSize: '16px' }}
            />
          </div>

          {/* Row 2: Open Pack — full width */}
          <button
            onClick={() => setPackMode(true)}
            disabled={screenLocked}
            className="btn-sticker w-full mono text-sm uppercase py-2 bg-amber-400 text-stone-900 flex items-center justify-center gap-2 font-bold tracking-wider"
            title="Quickly log stickers from a new pack"
          >
            <Package size={16} /> Open Pack
          </button>

          {/* Row 3: filter chips, centered */}
          <div className="flex justify-center gap-2">
            {['all', 'got', 'need', 'dupes'].map(f => {
              const colors = {
                all:   filter === 'all'   ? 'bg-stone-900 text-amber-400' : 'bg-stone-50 text-stone-900',
                got:   filter === 'got'   ? 'bg-amber-400 text-stone-900' : 'bg-stone-50 text-stone-900',
                need:  filter === 'need'  ? 'bg-red-400 text-stone-900'   : 'bg-stone-50 text-stone-900',
                dupes: filter === 'dupes' ? 'bg-orange-400 text-stone-900': 'bg-stone-50 text-stone-900',
              };
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`btn-sticker py-1.5 mono text-xs uppercase w-20 text-center ${colors[f]}`}
                >
                  {f}
                </button>
              );
            })}
          </div>

          {/* Row 4: secondary actions, centered */}
          <div className="flex justify-center gap-2 flex-wrap">
            <button
              onClick={shareNeeds}
              className="btn-sticker mono text-xs uppercase px-3 py-1.5 bg-stone-50 text-stone-900 flex items-center gap-1"
              title="Share my needs list"
            >
              <Share2 size={12} /> Share Needs
            </button>
            <button
              onClick={() => setScreenLocked(l => !l)}
              className={`btn-sticker mono text-xs uppercase px-3 py-1.5 flex items-center gap-1 ${
                screenLocked ? 'bg-stone-900 text-amber-400' : 'bg-stone-50 text-stone-900'
              }`}
              title={screenLocked ? 'Tap to unlock taps' : 'Lock taps to prevent accidents'}
            >
              <Lock size={12} /> {screenLocked ? 'Locked' : 'Lock'}
            </button>
            <button
              onClick={() => setShowWelcome(true)}
              className="btn-sticker mono text-xs uppercase px-3 py-1.5 bg-stone-50 text-stone-900 flex items-center gap-1"
              title="How to use this app"
            >
              <HelpCircle size={12} /> Help
            </button>
            <button
              onClick={() => setShowSuggest(true)}
              className="btn-sticker mono text-xs uppercase px-3 py-1.5 bg-stone-50 text-stone-900 flex items-center gap-1"
              title="Send a suggestion or feedback to the developer"
            >
              <MessageCircle size={12} /> Suggest
            </button>
          </div>
        </div>
      </div>

      {/* TEAM SELECTOR */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="mb-4 flex items-baseline gap-3">
          <Users size={18} className="text-stone-700" />
          <h2 className="display text-2xl text-stone-900">SELECT TEAM</h2>
          <div className="flex-1 border-b border-stone-300" />
        </div>

        {/* Top-level / specials row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
          <TeamButton code="ALL" name="All Stickers" active={activeTeam === 'ALL'} onClick={() => selectTeam('ALL')} stats={{ got: stats.got, total: stats.total }} />
          <TeamButton code="Intro" name="Intro" active={activeTeam === 'Intro'} onClick={() => selectTeam('Intro')} stats={getSpecialStats(ALBUM, collection, 'Intro')} />
          <TeamButton code="Museum" name="FIFA Museum" active={activeTeam === 'Museum'} onClick={() => selectTeam('Museum')} stats={getSpecialStats(ALBUM, collection, 'Museum')} />
          <TeamButton code="Special" name="Coca-Cola" active={activeTeam === 'Special'} onClick={() => selectTeam('Special')} stats={getSpecialStats(ALBUM, collection, 'Special')} />
        </div>

        {/* Groups A–L */}
        <div className="space-y-5">
          {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'].map(g => {
            const groupTeams = TEAMS.filter(t => t.group === g);
            const groupGot = groupTeams.reduce((acc, t) => acc + teamStats[t.code].got, 0);
            const groupTotal = groupTeams.reduce((acc, t) => acc + teamStats[t.code].total, 0);
            return (
              <div key={g}>
                <div className="flex items-baseline gap-3 mb-2">
                  <div className="display text-3xl text-red-700 leading-none">GROUP {g}</div>
                  <div className="mono text-[10px] text-stone-600">{groupGot}/{groupTotal}</div>
                  <div className="flex-1 border-b border-dashed border-stone-400" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {groupTeams.map(t => (
                    <TeamButton
                      key={t.code}
                      code={t.code}
                      name={t.name}
                      color={t.color}
                      flag={t.flag}
                      active={activeTeam === t.code}
                      onClick={() => selectTeam(t.code)}
                      stats={teamStats[t.code]}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* STICKER GRID */}
      <main ref={stickerGridRef} className="max-w-6xl mx-auto px-6 pb-12" style={{ scrollMarginTop: '60px' }}>
        <div className="mb-4 flex items-baseline gap-3">
          <Sticker size={18} className="text-stone-700" />
          <h2 className="display text-2xl text-stone-900">
            {activeTeam === 'ALL' ? 'ALL STICKERS' : (TEAMS.find(t => t.code === activeTeam)?.name || activeTeam).toUpperCase()}
          </h2>
          <span className="mono text-xs text-stone-600">{visibleStickers.length} shown</span>
          <div className="flex-1 border-b border-stone-300" />
        </div>

        {visibleStickers.length === 0 ? (
          <div className="text-center py-16 mono text-sm text-stone-500">
            No stickers match these filters.
          </div>
        ) : (
          (() => {
            // Group visible stickers by their section
            const groups = [];
            const groupMap = {};
            visibleStickers.forEach(s => {
              if (!groupMap[s.section]) {
                groupMap[s.section] = { section: s.section, team: s.team, items: [] };
                groups.push(groupMap[s.section]);
              }
              groupMap[s.section].items.push(s);
            });

            return (
              <div className="space-y-8">
                {groups.map(g => {
                  // Find team metadata for header (flag, code, color)
                  const teamMeta = TEAMS.find(t => t.code === g.team);
                  const sectionTotalInAlbum = ALBUM.filter(s => s.section === g.section).length;
                  const sectionGotInAlbum = ALBUM.filter(s => s.section === g.section && collection[s.id] > 0).length;
                  return (
                    <div key={g.section}>
                      {/* Sticky section header */}
                      <div
                        className="paper sticky z-10 -mx-6 px-6 py-2 mb-3 border-b border-stone-300"
                        style={{ top: '56px' }}
                      >
                        <div className="flex items-center gap-2">
                          {teamMeta?.color && (
                            <div className="w-1.5 h-7 flex-shrink-0" style={{ backgroundColor: teamMeta.color }} />
                          )}
                          {teamMeta?.flag && <span className="text-xl flex-shrink-0">{teamMeta.flag}</span>}
                          {teamMeta && (
                            <span className="mono text-xs font-bold text-stone-900 tracking-wider">{teamMeta.code}</span>
                          )}
                          <span className="display text-xl text-stone-900 truncate">{g.section.toUpperCase()}</span>
                          <div className="flex-1 border-b border-dashed border-stone-400" />
                          <span className="mono text-[10px] text-stone-600 flex-shrink-0">{sectionGotInAlbum}/{sectionTotalInAlbum}</span>
                        </div>
                      </div>
                      {/* Sticker grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {g.items.map(sticker => (
                          <StickerCard
                            key={sticker.id}
                            sticker={sticker}
                            count={collection[sticker.id] || 0}
                            onAdd={() => updateCount(sticker.id, 1)}
                            onRemove={() => updateCount(sticker.id, -1)}
                            needMode={filter === 'need'}
                            locked={screenLocked}
                            highlighted={highlightedSticker === sticker.id}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()
        )}
      </main>

      </>}

      {/* FOOTER */}
      <footer className="border-t-4 border-stone-900 paper py-6">
        <div className="max-w-6xl mx-auto px-6 text-center mono text-xs text-stone-600 space-y-1">
          <div>
            UNOFFICIAL TRACKER · NOT AFFILIATED WITH PANINI OR FIFA · YOUR COLLECTION IS PRIVATE · GROUP DATA IS SHARED WITH ANYONE USING YOUR GROUP CODE
          </div>
          <div className="text-[10px] text-stone-500">
            Version {appVersion ? appVersion.slice(0, 7) : 'dev'}
          </div>
        </div>
      </footer>

      {/* WELCOME / HELP MODAL */}
      {showWelcome && (
        <WelcomeModal
          onClose={dismissWelcome}
          onReset={resetCollection}
          collectedCount={stats.got}
        />
      )}

      {/* SUGGEST / FEEDBACK MODAL */}
      {showSuggest && (
        <SuggestModal
          authorName={profile?.name || 'Anonymous'}
          onSubmit={submitSuggestion}
          onClose={() => setShowSuggest(false)}
        />
      )}

      {/* BACK TO TOP BUTTON */}
      <button
        onClick={scrollToTop}
        aria-label="Back to top"
        style={{ bottom: 'calc(1.25rem + env(safe-area-inset-bottom, 0))' }}
        className={`fixed right-5 z-40 w-12 h-12 bg-stone-900 text-amber-400 border-2 border-stone-900 sticker-shadow flex items-center justify-center transition-all duration-300 hover:bg-red-700 ${
          showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <ArrowUp size={20} />
      </button>
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function MiniStat({ icon, label, value, color }) {
  return (
    <div className="flex items-center gap-2 flex-1 justify-center">
      <span className={color}>{icon}</span>
      <div className="flex items-baseline gap-1.5">
        <span className={`display text-2xl sm:text-3xl ${color} leading-none`}>{value}</span>
        <span className="mono text-[10px] sm:text-[11px] text-stone-600 tracking-wider">{label}</span>
      </div>
    </div>
  );
}

function TeamButton({ code, name, color, flag, active, onClick, stats }) {
  const pct = stats ? (stats.got / stats.total) * 100 : 0;
  const complete = stats && stats.got === stats.total;
  return (
    <button
      onClick={onClick}
      className={`relative px-3 py-2 border-2 text-left transition-all overflow-hidden group ${
        active ? 'border-stone-900 bg-stone-900 text-amber-400 sticker-shadow' : 'border-stone-400 bg-stone-50 hover:border-stone-900'
      }`}
      title={name}
    >
      {color && (
        <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: color }} />
      )}
      <div className="flex items-baseline gap-2 mt-0.5">
        {flag && <span className="text-base leading-none">{flag}</span>}
        <div className="mono text-[11px] tracking-wider font-bold">{code}</div>
        <div className={`serif text-[11px] truncate ${active ? 'text-stone-300' : 'text-stone-700'}`}>
          {name}
        </div>
      </div>
      <div className={`mono text-[10px] mt-1 ${active ? 'text-stone-400' : 'text-stone-500'}`}>
        {stats ? `${stats.got}/${stats.total}` : ''}
      </div>
      {complete && (
        <div className="absolute top-1 right-1 text-emerald-500">
          <Check size={12} />
        </div>
      )}
      <div className="absolute bottom-0 left-0 h-0.5 bg-emerald-400 transition-all" style={{ width: `${pct}%` }} />
    </button>
  );
}

function StickerCard({ sticker, count, onAdd, onRemove, needMode, locked, highlighted }) {
  const got = count > 0;
  const dupes = count > 1;
  const dupeCount = Math.max(0, count - 1);

  let bgClass = 'bg-stone-50 border-stone-300';
  if (dupes) bgClass = 'dupe-sticker';
  else if (got) bgClass = 'got-sticker';

  return (
    <div
      id={`sticker-${sticker.id}`}
      className={`relative border-2 p-3 sticker-shadow transition-all ${bgClass} ${locked ? 'opacity-90' : ''} ${highlighted ? 'search-pulse' : ''}`}
    >
      {/* Sticker number badge */}
      <div className="absolute -top-2 -left-2 bg-stone-900 text-amber-400 mono text-[10px] px-1.5 py-0.5 border border-stone-900">
        {sticker.id}
      </div>

      {/* "Special" indicator */}
      {sticker.special && (
        <div className="absolute -top-2 -right-2 bg-red-700 text-white mono text-[8px] px-1.5 py-0.5">
          SPECIAL
        </div>
      )}

      {/* Got stamp */}
      {got && !needMode && (
        <div className="absolute top-2 right-2 stamp-anim">
          <div className="border-2 border-emerald-700 text-emerald-700 mono text-[8px] font-bold px-1 py-0.5 rotate-[-12deg] opacity-80">
            ✓ GOT
          </div>
        </div>
      )}

      <div className="mt-3 mb-2">
        <div className="serif font-bold text-sm leading-tight text-stone-900">
          {sticker.label}
        </div>
        <div className="mono text-[10px] text-stone-600 mt-0.5">
          {sticker.section}
        </div>
      </div>

      {/* Action area — single button in needMode, +/- counter otherwise */}
      {needMode ? (
        <button
          onClick={onAdd}
          disabled={locked}
          className="w-full mt-3 px-2 py-2 bg-emerald-700 hover:bg-emerald-600 text-white mono text-[11px] uppercase tracking-wider font-bold transition-colors flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Check size={14} /> I got it!
        </button>
      ) : (
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-stone-400/40">
          <button
            onClick={onRemove}
            disabled={count === 0 || locked}
            className="w-7 h-7 flex items-center justify-center bg-stone-900 text-stone-50 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-red-700 transition-colors"
          >
            <Minus size={14} />
          </button>
          <div className="display text-2xl text-stone-900">
            {count}
            {dupes && <span className="text-orange-700 text-xs ml-1">+{dupeCount}</span>}
          </div>
          <button
            onClick={onAdd}
            disabled={locked}
            className="w-7 h-7 flex items-center justify-center bg-stone-900 text-stone-50 hover:bg-emerald-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Plus size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

function getSpecialStats(album, collection, team) {
  const items = album.filter(s => s.team === team);
  const got = items.filter(s => collection[s.id] > 0).length;
  return { got, total: items.length };
}

// ============================================================================
// GROUP VIEW — leaderboard, trade matching, member management
// ============================================================================

function GroupView({ profile, onSaveProfile, onLeaveGroup, members, myCollection, myReservations, onToggleReservation, onRequestSticker, onPromiseRequest, onDeclineRequest, onSwitchGroup, onJoinAdditionalGroup, onRefresh, refreshing, album, teams }) {
  // Profile setup screen
  if (!profile) {
    return <ProfileSetup onSave={onSaveProfile} />;
  }
  return (
    <GroupViewInner
      profile={profile}
      onLeaveGroup={onLeaveGroup}
      members={members}
      myCollection={myCollection}
      myReservations={myReservations}
      onToggleReservation={onToggleReservation}
      onRequestSticker={onRequestSticker}
      onPromiseRequest={onPromiseRequest}
      onDeclineRequest={onDeclineRequest}
      onSwitchGroup={onSwitchGroup}
      onJoinAdditionalGroup={onJoinAdditionalGroup}
      onRefresh={onRefresh}
      refreshing={refreshing}
      album={album}
      teams={teams}
    />
  );
}

function GroupViewInner({ profile, onLeaveGroup, members, myCollection, myReservations, onToggleReservation, onRequestSticker, onPromiseRequest, onDeclineRequest, onSwitchGroup, onJoinAdditionalGroup, album, teams, onRefresh, refreshing }) {
  const totalStickers = album.length;
  const [showJoinModal, setShowJoinModal] = useState(false);

  // Leaderboard: sort by completion %
  const leaderboard = useMemo(() => {
    return [...members]
      .map(m => {
        const got = album.filter(s => (m.collection?.[s.id] || 0) > 0).length;
        const dupes = Object.values(m.collection || {}).reduce((sum, c) => sum + Math.max(0, c - 1), 0);
        return { ...m, got, dupes, pct: (got / totalStickers) * 100 };
      })
      .sort((a, b) => b.pct - a.pct);
  }, [members, album, totalStickers]);

  // Trade matching
  const trades = useMemo(() => {
    // What I need (count = 0) where someone else has dupes (count >= 2)
    const myNeeds = album.filter(s => !myCollection[s.id]).map(s => s.id);
    // What I have as dupes where someone else needs it
    const myDupes = album.filter(s => (myCollection[s.id] || 0) >= 2).map(s => s.id);

    const offersForMe = []; // people who have what I need
    const wantsFromMe = []; // people who need what I have as dupes

    // Aggregate everyone's reservations so we can hide already-promised stickers
    const allReservedByOthers = {}; // { stickerId: friendName who reserved it for whom }
    members.forEach(m => {
      const reserves = m.reservations || {};
      Object.entries(reserves).forEach(([sid, toName]) => {
        // m has reserved sticker sid for toName
        allReservedByOthers[`${m.name}:${sid}`] = toName;
      });
    });

    members.forEach(m => {
      if (m.name === profile.name) return;
      const memberDupes = album.filter(s => (m.collection?.[s.id] || 0) >= 2).map(s => s.id);
      const memberNeeds = album.filter(s => !(m.collection?.[s.id])).map(s => s.id);

      // Filter: offers for me are stickers m has as dupes, but exclude ones m has reserved for someone other than me
      const matchOffers = myNeeds.filter(id => {
        if (!memberDupes.includes(id)) return false;
        const reservedFor = (m.reservations || {})[id];
        return !reservedFor || reservedFor === profile.name;
      });
      // Wants from me: stickers I'm offering, but exclude ones I've already reserved for someone else
      const matchWants = myDupes.filter(id => {
        if (!memberNeeds.includes(id)) return false;
        const reservedFor = myReservations?.[id];
        return !reservedFor || reservedFor === m.name;
      });

      // Stickers I've already requested from this member (look at THEIR incomingRequests)
      const incomingFromMe = m.incomingRequests || {};
      const requestedIds = Object.values(incomingFromMe)
        .filter(r => r && r.from === profile.name)
        .map(r => r.stickerId);

      if (matchOffers.length) {
        const reservedToMe = matchOffers.filter(id => (m.reservations || {})[id] === profile.name);
        const requested = matchOffers.filter(id => requestedIds.includes(id));
        offersForMe.push({ name: m.name, stickers: matchOffers, reservedToMe, requested });
      }
      if (matchWants.length) {
        const reservedToThem = matchWants.filter(id => myReservations?.[id] === m.name);
        wantsFromMe.push({ name: m.name, stickers: matchWants, reservedToThem });
      }
    });

    return { offersForMe, wantsFromMe };
  }, [members, myCollection, myReservations, profile.name, album]);

  // My incoming requests (from MY entry in members)
  const myIncoming = useMemo(() => {
    const me = members.find(m => m.name === profile.name);
    const incoming = me?.incomingRequests || {};
    // Group by asker
    const byAsker = {};
    Object.values(incoming).forEach(r => {
      if (!r || !r.from || !r.stickerId) return;
      if (!byAsker[r.from]) byAsker[r.from] = [];
      byAsker[r.from].push({ stickerId: r.stickerId, ts: r.ts });
    });
    return Object.entries(byAsker).map(([from, items]) => ({
      from,
      items: items.sort((a, b) => a.stickerId.localeCompare(b.stickerId)),
    }));
  }, [members, profile.name]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-6">
      {/* Group header */}
      <div className="paper border-2 border-stone-900 p-4 mb-6 sticker-shadow flex items-center justify-between flex-wrap gap-3">
        <div className="flex-1 min-w-0">
          <div className="mono text-[10px] text-stone-600 tracking-widest">GROUP CODE</div>
          <div className="display text-stone-900 break-all leading-tight" style={{ fontSize: 'clamp(1.25rem, 5vw, 1.875rem)' }}>{profile.groupCode}</div>
          <div className="mono text-[10px] text-stone-600 mt-1">
            Share this code with friends. Anyone who joins with the same code sees the same trade board.
          </div>
          {/* Multi-group switcher — hidden behind feature flag */}
          {SHOW_GROUP_SWITCHER && profile.groups && profile.groups.length > 0 && (
            <div className="mt-3 pt-3 border-t border-stone-300">
              <div className="mono text-[10px] text-stone-600 tracking-widest mb-2">YOUR GROUPS</div>
              <div className="flex flex-wrap gap-2 items-center">
                {profile.groups.map(g => (
                  <button
                    key={g}
                    onClick={() => onSwitchGroup && onSwitchGroup(g)}
                    className={`mono text-xs px-2 py-1 border-2 transition-colors ${
                      g === profile.groupCode
                        ? 'border-red-700 bg-red-700 text-white'
                        : 'border-stone-900 bg-stone-50 text-stone-900 hover:bg-stone-200'
                    }`}
                  >
                    {g}
                  </button>
                ))}
                <button
                  onClick={() => setShowJoinModal(true)}
                  className="mono text-xs px-2 py-1 border-2 border-dashed border-stone-700 bg-stone-50 text-stone-700 hover:bg-stone-100"
                  title="Join another group"
                >
                  + Join another
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="mono text-xs uppercase px-3 py-2 border-2 border-stone-900 bg-stone-50 hover:bg-stone-200 disabled:opacity-50"
          >
            {refreshing ? 'Refreshing…' : '↻ Refresh'}
          </button>
          <button
            onClick={onLeaveGroup}
            className="mono text-xs uppercase px-3 py-2 border-2 border-stone-900 bg-stone-900 text-amber-400 hover:bg-red-700 flex items-center gap-1"
          >
            <LogOut size={12} /> Leave
          </button>
        </div>
      </div>

      {/* Join additional group modal — only renders when flag is on AND user opens it */}
      {SHOW_GROUP_SWITCHER && showJoinModal && (
        <JoinAdditionalGroupModal
          existingGroups={profile.groups || []}
          onJoin={async (code) => {
            await onJoinAdditionalGroup(code);
            setShowJoinModal(false);
          }}
          onClose={() => setShowJoinModal(false)}
        />
      )}

      {members.length === 0 ? (
        <div className="paper border-2 border-stone-900 p-8 text-center">
          <div className="display text-3xl text-stone-900 mb-2">JUST YOU SO FAR</div>
          <p className="serif text-stone-700 max-w-md mx-auto">
            Share the group code <span className="mono font-bold">{profile.groupCode}</span> with friends. Once they join with the same code and add their stickers, this page will show trade matches and a leaderboard.
          </p>
        </div>
      ) : (
        <>
          {/* LEADERBOARD */}
          <section className="mb-8">
            <div className="flex items-baseline gap-3 mb-3">
              <Crown size={18} className="text-stone-700" />
              <h2 className="display text-2xl text-stone-900">LEADERBOARD</h2>
              <div className="flex-1 border-b border-stone-300" />
            </div>
            <div className="space-y-2">
              {leaderboard.map((m, i) => (
                <div
                  key={m.name}
                  className={`paper border-2 p-3 flex items-center gap-3 ${
                    m.name === profile.name ? 'border-red-700 sticker-shadow' : 'border-stone-400'
                  }`}
                >
                  <div className="display text-3xl text-stone-900 w-10 text-center">
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="serif font-bold text-stone-900 truncate">
                      {m.name} {m.name === profile.name && <span className="mono text-[10px] text-red-700">YOU</span>}
                    </div>
                    <div className="mono text-[10px] text-stone-600">
                      {m.got}/{totalStickers} · {m.dupes} dupes
                    </div>
                    <div className="h-1.5 bg-stone-300 mt-1 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-amber-400 to-emerald-500 transition-all" style={{ width: `${m.pct}%` }} />
                    </div>
                  </div>
                  <div className="display text-3xl text-red-700">{m.pct.toFixed(0)}<span className="text-base">%</span></div>
                </div>
              ))}
            </div>
          </section>

          {/* INCOMING REQUESTS — shown when other members have asked me for stickers */}
          {myIncoming.length > 0 && (
            <section className="mb-8">
              <div className="flex items-baseline gap-3 mb-3">
                <span className="text-2xl">📥</span>
                <h2 className="display text-2xl text-stone-900">REQUESTS FROM FRIENDS</h2>
                <div className="flex-1 border-b border-stone-300" />
                <span className="mono text-[10px] text-amber-700 font-bold">
                  {myIncoming.reduce((n, r) => n + r.items.length, 0)} pending
                </span>
              </div>
              <div className="paper border-2 border-amber-700 p-4 space-y-4 sticker-shadow">
                {myIncoming.map(req => (
                  <div key={req.from} className="border-b border-stone-300 last:border-b-0 pb-3 last:pb-0">
                    <div className="serif font-bold text-stone-900 mb-2">
                      <span className="text-amber-700">{req.from}</span> is asking for:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {req.items.map(item => (
                        <div key={item.stickerId} className="flex items-center gap-1 border-2 border-amber-700 bg-amber-50 px-2 py-1">
                          <span className="mono text-xs font-bold text-stone-900">{item.stickerId}</span>
                          <button
                            onClick={() => onPromiseRequest(req.from, item.stickerId)}
                            className="mono text-[9px] uppercase px-2 py-0.5 bg-emerald-700 text-white hover:bg-emerald-600 transition-colors"
                            title="Reserve this sticker for them"
                          >
                            ✓ Promise
                          </button>
                          <button
                            onClick={() => onDeclineRequest(req.from, item.stickerId)}
                            className="mono text-[9px] uppercase px-2 py-0.5 bg-stone-200 text-stone-900 hover:bg-red-100 transition-colors"
                            title="Dismiss this request"
                          >
                            ✗ Decline
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="mono text-[9px] text-stone-600 italic pt-1">
                  Promising reserves the sticker so you don't accidentally promise it to two people.
                </div>
              </div>
            </section>
          )}

          {/* TRADE MATCHING */}
          <section className="mb-8">
            <div className="flex items-baseline gap-3 mb-3">
              <ArrowLeftRight size={18} className="text-stone-700" />
              <h2 className="display text-2xl text-stone-900">TRADE BOARD</h2>
              <div className="flex-1 border-b border-stone-300" />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* They have what I need */}
              <div className="paper border-2 border-emerald-700 p-4">
                <div className="mono text-sm font-bold uppercase tracking-wider text-emerald-700 mb-2">▼ THEY HAVE · I NEED</div>
                <div className="mono text-[10px] text-stone-600 mb-3">Tap a sticker to ask that friend for it.</div>
                {trades.offersForMe.length === 0 ? (
                  <div className="serif text-stone-600 text-sm italic">No matches yet — add more stickers as got/dupe.</div>
                ) : (
                  <div className="space-y-3">
                    {trades.offersForMe.map(o => (
                      <TradeRow
                        key={o.name}
                        name={o.name}
                        stickers={o.stickers}
                        accent="emerald"
                        reserved={o.reservedToMe || []}
                        reservedLabel="reserved for you"
                        requested={o.requested || []}
                        onToggleRequest={(id) => onRequestSticker(o.name, id)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* I have what they need */}
              <div className="paper border-2 border-orange-700 p-4">
                <div className="mono text-sm font-bold uppercase tracking-wider text-orange-700 mb-2">▲ I HAVE · THEY NEED</div>
                <div className="mono text-[10px] text-stone-600 mb-3">Tap a sticker to reserve it for that friend.</div>
                {trades.wantsFromMe.length === 0 ? (
                  <div className="serif text-stone-600 text-sm italic">Mark some stickers as duplicates (count ≥ 2) to offer trades.</div>
                ) : (
                  <div className="space-y-3">
                    {trades.wantsFromMe.map(o => (
                      <TradeRow
                        key={o.name}
                        name={o.name}
                        stickers={o.stickers}
                        accent="orange"
                        reserved={o.reservedToThem || []}
                        reservedLabel="reserved for them"
                        onToggleReserve={(id) => onToggleReservation(id, o.name)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function TradeRow({ name, stickers, accent, reserved = [], reservedLabel, onToggleReserve, requested = [], onToggleRequest }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? stickers : stickers.slice(0, 12);
  const accentClass = accent === 'emerald' ? 'bg-emerald-100 border-emerald-700 text-emerald-900' : 'bg-orange-100 border-orange-700 text-orange-900';
  const reservedClass = 'bg-stone-900 border-stone-900 text-amber-400 font-bold';
  const requestedClass = 'bg-amber-300 border-amber-700 text-stone-900 font-bold';
  const reservedSet = new Set(reserved);
  const requestedSet = new Set(requested);
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <div className="serif font-bold text-stone-900">{name}</div>
        <div className="mono text-[10px] text-stone-600">
          {stickers.length} stickers
          {reserved.length > 0 && <span className="ml-1 text-stone-900">· {reserved.length} {reservedLabel}</span>}
          {requested.length > 0 && <span className="ml-1 text-amber-700">· {requested.length} asked</span>}
        </div>
      </div>
      <div className="flex flex-wrap gap-1">
        {visible.map(id => {
          const isReserved = reservedSet.has(id);
          const isRequested = requestedSet.has(id);
          const cls = isReserved ? reservedClass : (isRequested ? requestedClass : accentClass);
          // Pick which click handler is active. Reserve takes priority on the orange (have) side; request on the green (need) side.
          let onClick = undefined;
          let title = '';
          if (onToggleReserve) {
            onClick = () => onToggleReserve(id);
            title = isReserved ? 'Tap to un-reserve' : `Tap to reserve for ${name}`;
          } else if (onToggleRequest) {
            onClick = () => onToggleRequest(id);
            title = isRequested ? `Tap to cancel request for ${id}` : `Tap to ask ${name} for ${id}`;
          }
          const clickable = !!onClick;
          return (
            <button
              key={id}
              onClick={onClick}
              disabled={!clickable}
              className={`mono text-[10px] px-1.5 py-0.5 border ${cls} ${clickable ? 'cursor-pointer hover:scale-105 transition-transform' : 'cursor-default'}`}
              title={title}
            >
              {isReserved && <Lock size={8} className="inline mr-0.5 -mt-0.5" />}
              {isRequested && !isReserved && <span className="mr-0.5">🙋</span>}
              {id}
            </button>
          );
        })}
        {stickers.length > 12 && !expanded && (
          <button onClick={() => setExpanded(true)} className="mono text-[10px] px-1.5 py-0.5 border border-stone-700 bg-stone-100 hover:bg-stone-200">
            +{stickers.length - 12} more
          </button>
        )}
        {expanded && stickers.length > 12 && (
          <button onClick={() => setExpanded(false)} className="mono text-[10px] px-1.5 py-0.5 border border-stone-700 bg-stone-100 hover:bg-stone-200">
            Show less
          </button>
        )}
      </div>
    </div>
  );
}

function ProfileSetup({ onSave }) {
  const [name, setName] = useState('');
  const [groupCode, setGroupCode] = useState('');
  const trimmedName = name.trim();
  // Require at least two words (first + last) so friends can tell each other apart
  const nameWords = trimmedName.split(/\s+/).filter(Boolean);
  const nameValid = nameWords.length >= 2 && trimmedName.length >= 3;
  const valid = nameValid && groupCode.trim().length >= 3;

  return (
    <div className="max-w-xl mx-auto px-6 py-10">
      <div className="paper border-2 border-stone-900 p-6 sticker-shadow">
        <div className="display text-4xl text-stone-900 mb-1">JOIN A GROUP</div>
        <p className="serif text-stone-700 mb-6">
          Trade stickers with friends. Pick a name for yourself and agree on a group code together — anyone who enters the same code will be on the same board.
        </p>

        <label className="block mb-4">
          <div className="mono text-[10px] uppercase tracking-widest text-stone-600 mb-1">YOUR NAME</div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Daniel Argento"
            maxLength={32}
            className="w-full px-3 py-2 bg-stone-50 border-2 border-stone-900 serif text-lg focus:outline-none focus:border-red-700"
          />
          <div className={`mono text-[10px] mt-1 ${trimmedName && !nameValid ? 'text-red-700' : 'text-stone-500'}`}>
            {trimmedName && !nameValid
              ? 'Please include first and last name so friends know who you are.'
              : 'Use first + last name (or last initial) — makes trading easier.'}
          </div>
        </label>

        <label className="block mb-6">
          <div className="mono text-[10px] uppercase tracking-widest text-stone-600 mb-1">GROUP CODE</div>
          <input
            type="text"
            value={groupCode}
            onChange={(e) => setGroupCode(e.target.value)}
            placeholder="e.g. lopez-family-2026"
            maxLength={40}
            className="w-full px-3 py-2 bg-stone-50 border-2 border-stone-900 mono text-base focus:outline-none focus:border-red-700"
          />
          <div className="mono text-[10px] text-stone-500 mt-1">
            Pick something only your group would guess. Spaces will become dashes.
          </div>
        </label>

        <button
          onClick={() => onSave(name, groupCode)}
          disabled={!valid}
          className="w-full px-4 py-3 bg-stone-900 text-amber-400 mono text-sm uppercase tracking-widest hover:bg-red-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Join Group
        </button>

        <div className="mono text-[10px] text-stone-500 mt-4 leading-relaxed">
          ⚠ Privacy note: this is a friendly trade board, not a secure system. Anyone who knows your group code can see the names and collection summaries of members. Don't put anything sensitive in your name.
        </div>
      </div>
    </div>
  );
}


// ============================================================================
// STATS VIEW — completion timeline and per-team breakdowns
// ============================================================================

function StatsView({ collection, timeline, album, teams }) {
  const totalStickers = album.length;
  const got = album.filter(s => collection[s.id] > 0).length;
  const dupes = Object.values(collection).reduce((sum, c) => sum + Math.max(0, c - 1), 0);
  const totalCopiesOwned = Object.values(collection).reduce((sum, c) => sum + c, 0);
  const pct = (got / totalStickers) * 100;

  const sortedTimeline = useMemo(() => [...timeline].sort((a, b) => a.ts - b.ts), [timeline]);
  const firstSticker = sortedTimeline[0];
  const lastSticker = sortedTimeline[sortedTimeline.length - 1];

  // Per-team progress
  const teamProgress = useMemo(() => {
    return teams.map(t => {
      const teamStickers = album.filter(s => s.team === t.code);
      const teamGot = teamStickers.filter(s => collection[s.id] > 0).length;
      return { ...t, got: teamGot, total: teamStickers.length, pct: (teamGot / teamStickers.length) * 100 };
    }).sort((a, b) => b.pct - a.pct);
  }, [collection, album, teams]);

  // Per-group (A–L) progress
  const groupProgress = useMemo(() => {
    const groups = ['A','B','C','D','E','F','G','H','I','J','K','L'];
    return groups.map(g => {
      const groupTeams = teams.filter(t => t.group === g);
      const teamCodes = groupTeams.map(t => t.code);
      const groupStickers = album.filter(s => teamCodes.includes(s.team));
      const groupGot = groupStickers.filter(s => collection[s.id] > 0).length;
      return {
        letter: g,
        got: groupGot,
        total: groupStickers.length,
        pct: (groupGot / groupStickers.length) * 100,
        teams: groupTeams,
      };
    });
  }, [collection, album, teams]);

  // Specials progress
  const specialsProgress = useMemo(() => {
    const sections = ['Intro', 'FIFA Museum', 'Coca-Cola Special'];
    return sections.map(name => {
      const items = album.filter(s => s.section === name);
      const items_got = items.filter(s => collection[s.id] > 0).length;
      return { name, got: items_got, total: items.length, pct: items.length ? (items_got / items.length) * 100 : 0 };
    });
  }, [collection, album]);

  // Days collecting + pace + forecast
  const daysCollecting = firstSticker
    ? Math.max(1, Math.ceil((Date.now() - firstSticker.ts) / (1000 * 60 * 60 * 24)))
    : 0;
  const stickersPerDay = daysCollecting > 0 ? got / daysCollecting : 0;
  const remainingStickers = totalStickers - got;
  const forecastDays = stickersPerDay > 0 ? Math.ceil(remainingStickers / stickersPerDay) : null;
  const forecastDate = forecastDays !== null
    ? new Date(Date.now() + forecastDays * 24 * 60 * 60 * 1000)
    : null;

  // Best day (most stickers added in a single calendar day)
  const bestDay = useMemo(() => {
    if (sortedTimeline.length === 0) return null;
    const counts = {};
    sortedTimeline.forEach(e => {
      const day = new Date(e.ts).toDateString();
      counts[day] = (counts[day] || 0) + 1;
    });
    let best = { day: null, count: 0 };
    Object.entries(counts).forEach(([day, count]) => {
      if (count > best.count) best = { day, count };
    });
    return best;
  }, [sortedTimeline]);

  // Days since last sticker
  const daysSinceLast = lastSticker
    ? Math.floor((Date.now() - lastSticker.ts) / (1000 * 60 * 60 * 24))
    : null;

  // Recent additions (last 5)
  const recentAdditions = useMemo(() => {
    return [...sortedTimeline].reverse().slice(0, 5).map(e => {
      const sticker = album.find(s => s.id === e.stickerId);
      return { ...e, sticker };
    }).filter(x => x.sticker);
  }, [sortedTimeline, album]);

  // Team distribution buckets
  const distribution = useMemo(() => {
    const buckets = { '0%': 0, '1-25%': 0, '26-50%': 0, '51-75%': 0, '76-99%': 0, '100%': 0 };
    teamProgress.forEach(t => {
      if (t.pct === 0) buckets['0%']++;
      else if (t.pct === 100) buckets['100%']++;
      else if (t.pct <= 25) buckets['1-25%']++;
      else if (t.pct <= 50) buckets['26-50%']++;
      else if (t.pct <= 75) buckets['51-75%']++;
      else buckets['76-99%']++;
    });
    return buckets;
  }, [teamProgress]);

  const completedTeams = teamProgress.filter(t => t.pct === 100);

  // Milestones reached
  const milestones = [
    { label: 'First sticker', threshold: 1, icon: '🎉' },
    { label: '10% complete', threshold: totalStickers * 0.1, icon: '🌱' },
    { label: '25% complete', threshold: totalStickers * 0.25, icon: '⚡' },
    { label: 'Halfway there!', threshold: totalStickers * 0.5, icon: '🔥' },
    { label: '75% complete', threshold: totalStickers * 0.75, icon: '🚀' },
    { label: 'First team complete', threshold: 0, icon: '⭐', custom: completedTeams.length >= 1 },
    { label: '5 teams complete', threshold: 0, icon: '🏆', custom: completedTeams.length >= 5 },
    { label: 'Full album!', threshold: totalStickers, icon: '👑' },
  ].map(m => ({
    ...m,
    reached: m.custom !== undefined ? m.custom : got >= m.threshold,
  }));

  // SVG chart dimensions
  const chartW = 600, chartH = 180, pad = 30;
  const chartPoints = useMemo(() => {
    if (sortedTimeline.length === 0) return [];
    return sortedTimeline.map((entry, i) => ({ ts: entry.ts, count: i + 1 }));
  }, [sortedTimeline]);
  const xScale = (ts) => {
    if (chartPoints.length < 2) return pad;
    const minTs = chartPoints[0].ts;
    const maxTs = Math.max(chartPoints[chartPoints.length - 1].ts, Date.now());
    return pad + ((ts - minTs) / (maxTs - minTs)) * (chartW - 2 * pad);
  };
  const yScale = (count) => chartH - pad - (count / totalStickers) * (chartH - 2 * pad);
  const fmtDate = (ts) => new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const fmtFullDate = (ts) => new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
      {/* HERO STATS */}
      <div className="paper border-2 border-stone-900 p-6 sticker-shadow">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="mono text-[10px] text-stone-600 tracking-widest">COLLECTED</div>
            <div className="display text-5xl text-red-700">{got}</div>
            <div className="mono text-[10px] text-stone-500">of {totalStickers}</div>
          </div>
          <div>
            <div className="mono text-[10px] text-stone-600 tracking-widest">COMPLETION</div>
            <div className="display text-5xl text-emerald-700">{pct.toFixed(1)}%</div>
            <div className="mono text-[10px] text-stone-500">{remainingStickers} to go</div>
          </div>
          <div>
            <div className="mono text-[10px] text-stone-600 tracking-widest">DUPLICATES</div>
            <div className="display text-5xl text-orange-700">{dupes}</div>
            <div className="mono text-[10px] text-stone-500">tradeable</div>
          </div>
          <div>
            <div className="mono text-[10px] text-stone-600 tracking-widest">PACE</div>
            <div className="display text-5xl text-stone-900">{stickersPerDay.toFixed(1)}</div>
            <div className="mono text-[10px] text-stone-500">stickers/day · {daysCollecting}d</div>
          </div>
        </div>
      </div>

      {/* MILESTONES */}
      <section>
        <div className="flex items-baseline gap-3 mb-3">
          <Trophy size={18} className="text-stone-700" />
          <h2 className="display text-2xl text-stone-900">MILESTONES</h2>
          <div className="flex-1 border-b border-stone-300" />
          <span className="mono text-[10px] text-stone-600">{milestones.filter(m => m.reached).length}/{milestones.length}</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {milestones.map((m, i) => (
            <div
              key={i}
              className={`paper border-2 p-3 flex items-center gap-2 transition-opacity ${
                m.reached ? 'border-amber-700' : 'border-stone-300 opacity-40'
              }`}
            >
              <div className="text-2xl flex-shrink-0">{m.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="mono text-[10px] uppercase tracking-wider truncate">{m.label}</div>
                <div className={`mono text-[9px] ${m.reached ? 'text-emerald-700 font-bold' : 'text-stone-500'}`}>
                  {m.reached ? '✓ Unlocked' : 'Locked'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PROGRESS CHART + FORECAST */}
      <section>
        <div className="flex items-baseline gap-3 mb-3">
          <Zap size={18} className="text-stone-700" />
          <h2 className="display text-2xl text-stone-900">PROGRESS OVER TIME</h2>
          <div className="flex-1 border-b border-stone-300" />
        </div>
        <div className="paper border-2 border-stone-900 p-4">
          {chartPoints.length === 0 ? (
            <div className="serif text-stone-600 text-center py-8 italic">
              Add your first sticker to start tracking your progress.
            </div>
          ) : (
            <>
              <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-auto" preserveAspectRatio="none">
                {[0.25, 0.5, 0.75, 1].map(p => (
                  <line key={p} x1={pad} x2={chartW - pad} y1={yScale(p * totalStickers)} y2={yScale(p * totalStickers)} stroke="#d6d3d1" strokeDasharray="2 2" />
                ))}
                <path
                  d={`M ${pad} ${yScale(0)} ${chartPoints.map(p => `L ${xScale(p.ts)} ${yScale(p.count)}`).join(' ')}`}
                  fill="none" stroke="#b91c1c" strokeWidth="2.5"
                />
                <path
                  d={`M ${pad} ${chartH - pad} L ${pad} ${yScale(0)} ${chartPoints.map(p => `L ${xScale(p.ts)} ${yScale(p.count)}`).join(' ')} L ${xScale(chartPoints[chartPoints.length - 1].ts)} ${chartH - pad} Z`}
                  fill="url(#progressFill)"
                />
                <defs>
                  <linearGradient id="progressFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.05" />
                  </linearGradient>
                </defs>
                <circle cx={xScale(chartPoints[chartPoints.length - 1].ts)} cy={yScale(chartPoints[chartPoints.length - 1].count)} r="4" fill="#b91c1c" />
                <text x="4" y={yScale(totalStickers) + 4} fontSize="10" fill="#78716c" fontFamily="DM Mono, monospace">{totalStickers}</text>
                <text x="4" y={yScale(0) + 4} fontSize="10" fill="#78716c" fontFamily="DM Mono, monospace">0</text>
              </svg>
              <div className="flex justify-between mono text-[10px] text-stone-600 mt-2">
                <span>{firstSticker && <>Started · {fmtDate(firstSticker.ts)}</>}</span>
                <span>{lastSticker && <>Last · {fmtDate(lastSticker.ts)}</>}</span>
              </div>
              {/* Forecast */}
              {forecastDate && got < totalStickers && (
                <div className="mt-3 pt-3 border-t border-stone-300 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-stone-700" />
                    <span className="serif text-sm text-stone-800">
                      At this pace, you'll complete the album around{' '}
                      <span className="font-bold text-red-700">{fmtFullDate(forecastDate.getTime())}</span>
                    </span>
                  </div>
                  <span className="mono text-[10px] text-stone-600">~{forecastDays} days</span>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* QUICK FACTS */}
      <section>
        <div className="flex items-baseline gap-3 mb-3">
          <BarChart3 size={18} className="text-stone-700" />
          <h2 className="display text-2xl text-stone-900">QUICK FACTS</h2>
          <div className="flex-1 border-b border-stone-300" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <FactCard
            label="Best day"
            value={bestDay && bestDay.count > 0 ? `${bestDay.count}` : '—'}
            sub={bestDay && bestDay.day ? `stickers on ${new Date(bestDay.day).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}` : 'Add some stickers!'}
          />
          <FactCard
            label="Last added"
            value={daysSinceLast === null ? '—' : daysSinceLast === 0 ? 'Today' : daysSinceLast === 1 ? 'Yesterday' : `${daysSinceLast}d ago`}
            sub={lastSticker ? lastSticker.stickerId : ''}
          />
          <FactCard
            label="Total copies owned"
            value={totalCopiesOwned}
            sub={`${got} unique + ${dupes} dupes`}
          />
          <FactCard
            label="Teams complete"
            value={completedTeams.length}
            sub={`of ${teams.length} teams`}
          />
          <FactCard
            label="Days collecting"
            value={daysCollecting || '—'}
            sub={firstSticker ? `since ${fmtDate(firstSticker.ts)}` : ''}
          />
          <FactCard
            label="Most-needed group"
            value={[...groupProgress].sort((a, b) => a.pct - b.pct)[0]?.letter || '—'}
            sub={`only ${[...groupProgress].sort((a, b) => a.pct - b.pct)[0]?.got || 0}/80 stickers`}
          />
        </div>
      </section>

      {/* GROUPS BREAKDOWN */}
      <section>
        <div className="flex items-baseline gap-3 mb-3">
          <Users size={18} className="text-stone-700" />
          <h2 className="display text-2xl text-stone-900">BY GROUP</h2>
          <div className="flex-1 border-b border-stone-300" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {groupProgress.map(g => (
            <div key={g.letter} className="paper border-2 border-stone-300 p-3 text-center">
              <div className="display text-3xl text-red-700 leading-none">{g.letter}</div>
              <div className="mono text-[10px] text-stone-600 mt-1">{g.got}/{g.total}</div>
              <div className="h-1.5 bg-stone-200 mt-2 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-400 to-emerald-500" style={{ width: `${g.pct}%` }} />
              </div>
              <div className="mono text-[9px] text-stone-700 mt-1 font-bold">{g.pct.toFixed(0)}%</div>
            </div>
          ))}
        </div>
      </section>

      {/* DISTRIBUTION */}
      <section>
        <div className="flex items-baseline gap-3 mb-3">
          <BarChart3 size={18} className="text-stone-700" />
          <h2 className="display text-2xl text-stone-900">TEAM PROGRESS DISTRIBUTION</h2>
          <div className="flex-1 border-b border-stone-300" />
        </div>
        <div className="paper border-2 border-stone-900 p-4 space-y-2">
          {Object.entries(distribution).map(([range, count]) => {
            const max = Math.max(...Object.values(distribution), 1);
            const widthPct = (count / max) * 100;
            const colors = {
              '0%': 'bg-stone-400',
              '1-25%': 'bg-red-400',
              '26-50%': 'bg-orange-400',
              '51-75%': 'bg-amber-400',
              '76-99%': 'bg-lime-500',
              '100%': 'bg-emerald-600',
            };
            return (
              <div key={range} className="flex items-center gap-3">
                <span className="mono text-[10px] text-stone-700 w-16 text-right">{range}</span>
                <div className="flex-1 h-6 bg-stone-100 relative overflow-hidden">
                  <div className={`h-full ${colors[range]} transition-all duration-500`} style={{ width: `${widthPct}%` }} />
                </div>
                <span className="mono text-[11px] font-bold text-stone-900 w-10">{count}</span>
              </div>
            );
          })}
          <div className="mono text-[9px] text-stone-500 italic mt-2">
            Number of teams (out of {teams.length}) at each completion level.
          </div>
        </div>
      </section>

      {/* SPECIALS */}
      <section>
        <div className="flex items-baseline gap-3 mb-3">
          <Sticker size={18} className="text-stone-700" />
          <h2 className="display text-2xl text-stone-900">SPECIAL SECTIONS</h2>
          <div className="flex-1 border-b border-stone-300" />
        </div>
        <div className="grid sm:grid-cols-3 gap-2">
          {specialsProgress.map(sp => (
            <div key={sp.name} className="paper border-2 border-stone-300 p-3">
              <div className="serif font-bold text-stone-900">{sp.name}</div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="mono text-[10px] text-stone-600">{sp.got}/{sp.total}</span>
                <span className="display text-xl text-red-700">{sp.pct.toFixed(0)}%</span>
              </div>
              <div className="h-1.5 bg-stone-200 mt-1 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-400 to-emerald-500" style={{ width: `${sp.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* RECENT ADDITIONS */}
      {recentAdditions.length > 0 && (
        <section>
          <div className="flex items-baseline gap-3 mb-3">
            <Calendar size={18} className="text-stone-700" />
            <h2 className="display text-2xl text-stone-900">RECENT ADDITIONS</h2>
            <div className="flex-1 border-b border-stone-300" />
          </div>
          <div className="paper border-2 border-stone-900 divide-y divide-stone-200">
            {recentAdditions.map((entry, i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <span className="mono text-xs font-bold w-16 text-stone-900">{entry.stickerId}</span>
                <span className="serif text-sm flex-1 truncate">
                  <span className="text-stone-600">{entry.sticker.section}</span>
                  <span className="text-stone-400 mx-1">·</span>
                  <span className="text-stone-900">{entry.sticker.label}</span>
                </span>
                <span className="mono text-[10px] text-stone-600 flex-shrink-0">{fmtDate(entry.ts)}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* TEAM RANKINGS */}
      <section>
        <div className="flex items-baseline gap-3 mb-3">
          <Crown size={18} className="text-stone-700" />
          <h2 className="display text-2xl text-stone-900">ALL TEAMS BY COMPLETION</h2>
          <div className="flex-1 border-b border-stone-300" />
        </div>
        <div className="grid sm:grid-cols-2 gap-2">
          {teamProgress.map(t => (
            <div key={t.code} className="paper border-2 border-stone-300 p-2 flex items-center gap-3">
              <div className="w-2 h-10 flex-shrink-0" style={{ backgroundColor: t.color }} />
              <span className="text-2xl flex-shrink-0">{t.flag}</span>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <span className="serif font-bold text-stone-900 truncate">{t.name}</span>
                  <span className="mono text-[10px] text-stone-600">{t.got}/{t.total}</span>
                </div>
                <div className="h-1.5 bg-stone-200 mt-1 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-400 to-emerald-500" style={{ width: `${t.pct}%` }} />
                </div>
              </div>
              <div className="display text-xl text-stone-900 w-12 text-right">{t.pct.toFixed(0)}%</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function FactCard({ label, value, sub }) {
  return (
    <div className="paper border-2 border-stone-300 p-3">
      <div className="mono text-[10px] uppercase tracking-widest text-stone-600">{label}</div>
      <div className="display text-3xl text-stone-900 leading-none mt-1">{value}</div>
      {sub && <div className="mono text-[10px] text-stone-500 mt-1 truncate">{sub}</div>}
    </div>
  );
}

// ============================================================================
// PACK MODE — quick batch entry of stickers from a freshly opened pack
// ============================================================================

function PackMode({ album, collection, onAdd, onRemove, onClose }) {
  const [input, setInput] = useState('');
  const [batch, setBatch] = useState([]); // [{ id, label, status: 'new' | 'dupe' | 'invalid' }]
  const inputRef = useRef(null);

  // Build a quick lookup
  const stickerMap = useMemo(() => {
    const m = {};
    album.forEach(s => { m[s.id.toUpperCase()] = s; });
    return m;
  }, [album]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const submit = () => {
    // Strip anything that isn't alphanumeric, then uppercase
    const id = input.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    if (!id) {
      setInput('');
      return;
    }

    const sticker = stickerMap[id];
    if (!sticker) {
      setBatch(b => [{ id, label: 'Unknown sticker', status: 'invalid', ts: Date.now() }, ...b]);
      setInput('');
      return;
    }

    const currentCount = collection[sticker.id] || 0;
    const status = currentCount === 0 ? 'new' : 'dupe';
    onAdd(sticker.id);
    setBatch(b => [{ id: sticker.id, label: `${sticker.section} · ${sticker.label}`, status, ts: Date.now() }, ...b]);
    setInput('');
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') submit();
  };

  const undo = (index) => {
    const entry = batch[index];
    if (!entry || entry.undone || entry.status === 'invalid') return;
    onRemove(entry.id);
    setBatch(b => b.map((e, i) => i === index ? { ...e, undone: true } : e));
  };

  const newCount = batch.filter(b => b.status === 'new' && !b.undone).length;
  const dupeCount = batch.filter(b => b.status === 'dupe' && !b.undone).length;
  const invalidCount = batch.filter(b => b.status === 'invalid').length;

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/80 flex items-center justify-center p-4" onClick={onClose}>
      <div className="paper border-4 border-stone-900 sticker-shadow w-full max-w-lg max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-stone-900 text-amber-400 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package size={20} />
            <div>
              <div className="display text-2xl leading-none">PACK MODE</div>
              <div className="mono text-[10px] text-stone-400 mt-0.5">Type a sticker code, hit enter</div>
            </div>
          </div>
          <button onClick={onClose} className="text-amber-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Input */}
        <div className="p-5 border-b-2 border-stone-900">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase())}
            onKeyDown={handleKey}
            placeholder="e.g. BRA5"
            autoCapitalize="characters"
            autoCorrect="off"
            autoComplete="off"
            spellCheck="false"
            inputMode="text"
            name="sticker-code"
            enterKeyHint="enter"
            className="w-full px-4 py-4 bg-stone-50 border-2 border-stone-900 mono text-3xl font-bold text-center focus:outline-none focus:border-red-700 tracking-widest"
          />
          <button
            onClick={submit}
            disabled={!input.trim()}
            className="w-full mt-3 px-4 py-3 bg-stone-900 text-amber-400 mono text-sm uppercase tracking-widest hover:bg-red-700 disabled:opacity-30 transition-colors"
          >
            Add Sticker
          </button>
        </div>

        {/* Batch summary + log */}
        <div className="flex-1 overflow-y-auto p-5">
          {batch.length === 0 ? (
            <div className="text-center py-8 mono text-xs text-stone-500">
              Stickers you add will show up here.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="paper border-2 border-emerald-700 p-2 text-center">
                  <div className="display text-3xl text-emerald-700">{newCount}</div>
                  <div className="mono text-[9px] text-stone-600">NEW</div>
                </div>
                <div className="paper border-2 border-orange-700 p-2 text-center">
                  <div className="display text-3xl text-orange-700">{dupeCount}</div>
                  <div className="mono text-[9px] text-stone-600">DUPES</div>
                </div>
                <div className="paper border-2 border-stone-400 p-2 text-center">
                  <div className="display text-3xl text-stone-500">{invalidCount}</div>
                  <div className="mono text-[9px] text-stone-600">UNKNOWN</div>
                </div>
              </div>

              <div className="space-y-1.5">
                {batch.map((b, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-2 px-2 py-1.5 border-2 transition-opacity ${
                      b.undone ? 'bg-stone-100 border-stone-400 opacity-50' :
                      b.status === 'new' ? 'bg-emerald-50 border-emerald-700' :
                      b.status === 'dupe' ? 'bg-orange-50 border-orange-700' :
                      'bg-stone-100 border-stone-400'
                    }`}
                  >
                    <span className={`mono text-xs font-bold w-16 ${b.undone ? 'line-through' : ''}`}>{b.id}</span>
                    <span className={`serif text-sm flex-1 truncate ${b.undone ? 'line-through' : ''}`}>{b.label}</span>
                    <span className={`mono text-[9px] uppercase ${
                      b.undone ? 'text-stone-500' :
                      b.status === 'new' ? 'text-emerald-700' :
                      b.status === 'dupe' ? 'text-orange-700' :
                      'text-stone-500'
                    }`}>
                      {b.undone ? '↶ Undone' :
                        b.status === 'new' ? '✓ Added' : b.status === 'dupe' ? '+1 Dupe' : '✗ Unknown'}
                    </span>
                    {b.status !== 'invalid' && !b.undone && (
                      <button
                        onClick={() => undo(i)}
                        className="mono text-[9px] uppercase px-2 py-0.5 border border-stone-700 bg-stone-50 hover:bg-red-100 hover:border-red-700 hover:text-red-700 transition-colors"
                        title="Undo this entry"
                      >
                        Undo
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t-2 border-stone-900 paper p-3 flex justify-between items-center">
          <div className="mono text-[10px] text-stone-600">
            {batch.length} {batch.length === 1 ? 'sticker' : 'stickers'} this session
          </div>
          <button
            onClick={onClose}
            className="mono text-xs uppercase px-4 py-2 border-2 border-stone-900 bg-stone-50 hover:bg-stone-200"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// WELCOME / HELP MODAL — shown once on first open, accessible via footer link
// ============================================================================

function WelcomeModal({ onClose, onReset, collectedCount = 0 }) {
  const [resetMode, setResetMode] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const canReset = confirmText.trim().toUpperCase() === 'RESET';

  const handleReset = async () => {
    if (!canReset || !onReset) return;
    await onReset();
    setResetMode(false);
    setConfirmText('');
    onClose();
  };
  return (
    <div className="fixed inset-0 z-50 bg-stone-900/80 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="paper border-4 border-stone-900 sticker-shadow w-full max-w-2xl flex flex-col"
        style={{ maxHeight: '90vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header — fixed at top of modal */}
        <div className="bg-stone-900 text-amber-400 px-5 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <div className="display text-2xl leading-none">HOW TO USE</div>
            <div className="mono text-[10px] text-stone-400 mt-0.5">Quick guide to Locura Mundial</div>
          </div>
          <button onClick={onClose} className="text-amber-400 hover:text-white" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Body — only this scrolls */}
        <div className="p-6 space-y-5 serif text-stone-800 text-sm leading-relaxed overflow-y-auto flex-1">

          <section>
            <h3 className="display text-lg text-red-700 mb-1">The basics</h3>
            <p>
              This app tracks your Panini WC 2026 album so you can see what you have, what you need, and trade duplicates with friends in your group.
            </p>
          </section>

          <section>
            <h3 className="display text-lg text-red-700 mb-1">Logging stickers</h3>
            <p className="mb-2"><strong>Adding and removing:</strong></p>
            <ul className="space-y-1.5 ml-4 list-disc">
              <li><strong>Tap +</strong> next to any sticker you have. Tap again if you got a duplicate.</li>
              <li><strong>Tap −</strong> to remove one — handy if you tapped + by mistake.</li>
            </ul>
          </section>

          <section>
            <h3 className="display text-lg text-red-700 mb-1">Open Pack — the fastest way to log</h3>
            <p className="mb-2">
              When you tear open a fresh pack of stickers, tap the amber <strong>Open Pack</strong> button at the top. A focused screen appears with one big input field.
            </p>
            <p className="mb-2">
              Type each sticker code from your pack (like <span className="mono bg-stone-200 px-1">BRA5</span>, <span className="mono bg-stone-200 px-1">ARG12</span>, <span className="mono bg-stone-200 px-1">FWC3</span>) and hit enter or the Add button. Each one logs instantly, and the screen shows you a running tally:
            </p>
            <ul className="space-y-1 ml-4 list-disc">
              <li><strong>NEW</strong> — stickers you didn't have yet (green)</li>
              <li><strong>DUPES</strong> — ones you already had (orange)</li>
              <li><strong>UNKNOWN</strong> — codes that don't match any sticker (in case you typo)</li>
            </ul>
            <p className="mt-2 text-stone-700 italic">
              Way faster than scrolling through the album to find each sticker. A 5-sticker pack takes about 20 seconds.
            </p>
          </section>

          <section>
            <h3 className="display text-lg text-red-700 mb-1">Filters</h3>
            <p>The chips below the search bar let you focus the view:</p>
            <ul className="space-y-1 ml-4 list-disc mt-1">
              <li><strong>All</strong> — the entire 980-sticker album</li>
              <li><strong>Got</strong> — only the ones you already have</li>
              <li><strong>Need</strong> — what's still missing (with a big "I got it!" button per sticker)</li>
              <li><strong>Dupes</strong> — your tradeable extras (count ≥ 2)</li>
            </ul>
          </section>

          <section>
            <h3 className="display text-lg text-red-700 mb-1">The Group tab — where the magic is</h3>
            <p className="mb-2">
              Enter your name + the shared group code your friends sent you. Once you're in:
            </p>
            <ul className="space-y-1.5 ml-4 list-disc">
              <li><strong>Leaderboard</strong> — who's closest to completing the album.</li>
              <li><strong>Trade Board (left, green)</strong> — friends who have duplicates of stickers you need. <strong>Tap any sticker to ask</strong> that friend for it — they'll see the request next time they open the app.</li>
              <li><strong>Trade Board (right, orange)</strong> — stickers you have as duplicates that friends need. Tap one to <strong>reserve it</strong> for a specific friend, so you don't promise the same dupe to two people.</li>
              <li><strong>Requests from friends</strong> — when someone asks you for a sticker, you'll see it at the top of the Group tab. Tap <strong>Promise</strong> to reserve it for them, or <strong>Decline</strong> to dismiss.</li>
            </ul>
            <p className="mt-2 text-stone-700 italic">
              Everything syncs in real time. When a friend logs a new sticker or asks for one, you see it within a second.
            </p>
          </section>

          <section>
            <h3 className="display text-lg text-red-700 mb-1">Stats tab</h3>
            <p>
              Your progress over time, completion percentage by team, and pace stats — useful to see which teams you're closest to finishing.
            </p>
          </section>

          <section>
            <h3 className="display text-lg text-red-700 mb-1">Other useful buttons</h3>
            <ul className="space-y-1.5 ml-4 list-disc">
              <li><strong>Share Needs</strong> — texts yourself or shares a clean list of missing stickers, perfect for trading with people outside your group.</li>
              <li><strong>Lock</strong> — disables all taps. Use this when you hand your phone to someone to look at the album without them accidentally changing things.</li>
              <li><strong>💡 Suggest</strong> — got an idea or found a bug? Tap this to send a quick note straight to the developer. Be nice — or don't, your call.</li>
              <li><strong>Back to top arrow</strong> (floating bottom-right) — appears when you've scrolled down. Tap it to jump back to the masthead.</li>
            </ul>
          </section>

          <section>
            <h3 className="display text-lg text-red-700 mb-1">When new versions come out</h3>
            <p>
              If the developer ships an update, you'll see a green <strong>"🆕 New version available"</strong> banner at the top. Tap <strong>Reload</strong> and you're on the latest version.
            </p>
          </section>

          <section className="border-t-2 border-stone-300 pt-4">
            <p className="text-stone-600 text-xs">
              💡 You can revisit this guide anytime by tapping the <strong>Help</strong> button at the top.
            </p>
          </section>

          {/* DANGER ZONE — total reset */}
          {onReset && (
            <section className="border-t-2 border-red-300 pt-4 mt-2">
              <h3 className="display text-lg text-red-700 mb-2">⚠ DANGER ZONE</h3>
              {!resetMode ? (
                <div className="space-y-2">
                  <p className="text-stone-700 text-xs">
                    Wipe all your sticker counts, timeline, and reservations on this device. Your name and group code stay. <strong>This can't be undone.</strong>
                  </p>
                  <button
                    onClick={() => setResetMode(true)}
                    className="mono text-xs uppercase px-3 py-1.5 border-2 border-red-700 bg-stone-50 text-red-700 hover:bg-red-50 transition-colors"
                  >
                    Reset everything
                  </button>
                </div>
              ) : (
                <div className="border-2 border-red-700 bg-red-50 p-3 space-y-2">
                  <p className="text-stone-900 text-sm font-bold">
                    This will erase {collectedCount > 0 ? <span className="text-red-700">{collectedCount}</span> : 'all'} sticker{collectedCount === 1 ? '' : 's'} you've logged.
                  </p>
                  <p className="text-stone-700 text-xs">
                    Type <strong className="mono">RESET</strong> below to confirm.
                  </p>
                  <input
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    autoCapitalize="characters"
                    autoCorrect="off"
                    autoComplete="off"
                    placeholder="RESET"
                    className="w-full px-3 py-2 bg-stone-50 border-2 border-red-700 mono text-sm text-center focus:outline-none focus:border-red-900"
                    style={{ fontSize: '16px' }}
                  />
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => { setResetMode(false); setConfirmText(''); }}
                      className="mono text-xs uppercase px-3 py-1.5 border-2 border-stone-900 bg-stone-50 hover:bg-stone-200 flex-1"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReset}
                      disabled={!canReset}
                      className="mono text-xs uppercase px-3 py-1.5 border-2 border-red-900 bg-red-700 text-white hover:bg-red-800 disabled:opacity-30 disabled:cursor-not-allowed flex-1"
                    >
                      Reset everything
                    </button>
                  </div>
                </div>
              )}
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="border-t-2 border-stone-900 paper p-4 flex justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="mono text-sm uppercase px-6 py-2 bg-stone-900 text-amber-400 hover:bg-red-700 transition-colors"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SUGGEST MODAL — sends feedback/suggestions directly to Firebase for the dev
// ============================================================================

function SuggestModal({ authorName, onSubmit, onClose }) {
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const max = 500;
  const remaining = max - message.length;
  const trimmed = message.trim();
  const canSubmit = trimmed.length >= 3 && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await onSubmit(message);
      setSubmitted(true);
    } catch {
      // Even if it fails, show the thank-you so the user feels heard.
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/80 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div
        className="paper border-4 border-stone-900 sticker-shadow w-full max-w-lg my-8"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-stone-900 text-amber-400 px-5 py-4 flex items-center justify-between">
          <div>
            <div className="display text-2xl leading-none">SUGGEST</div>
            <div className="mono text-[10px] text-stone-400 mt-0.5">Send a note to the developer</div>
          </div>
          <button onClick={onClose} className="text-amber-400 hover:text-white" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {!submitted ? (
            <>
              <p className="serif text-stone-700 text-sm mb-4">
                Found a bug? Have an idea? Want a feature? Drop it here — your suggestion goes straight to the developer's inbox.
              </p>

              <div className="mb-4">
                <div className="mono text-[10px] uppercase tracking-widest text-stone-600 mb-1">FROM</div>
                <div className="paper border-2 border-stone-300 px-3 py-2 mono text-sm text-stone-900">
                  {authorName}
                </div>
              </div>

              <label className="block mb-4">
                <div className="flex items-baseline justify-between mb-1">
                  <div className="mono text-[10px] uppercase tracking-widest text-stone-600">YOUR MESSAGE</div>
                  <div className={`mono text-[10px] ${remaining < 50 ? 'text-red-700' : 'text-stone-500'}`}>
                    {remaining}
                  </div>
                </div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value.slice(0, max))}
                  placeholder="Type your suggestion or feedback…"
                  rows={5}
                  className="w-full px-3 py-2 bg-stone-50 border-2 border-stone-900 serif focus:outline-none focus:border-red-700 resize-none"
                  style={{ fontSize: '16px' }}
                />
              </label>

              <div className="flex gap-2 justify-end">
                <button
                  onClick={onClose}
                  className="mono text-xs uppercase px-4 py-2 border-2 border-stone-900 bg-stone-50 hover:bg-stone-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className="mono text-xs uppercase px-4 py-2 border-2 border-stone-900 bg-stone-900 text-amber-400 hover:bg-red-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Sending…' : 'Send'}
                </button>
              </div>
            </>
          ) : (
            // Thank-you state
            <div className="text-center py-6">
              <div className="text-5xl mb-3">💌</div>
              <div className="display text-2xl text-stone-900 mb-2">Thanks!</div>
              <p className="serif text-stone-700 text-sm mb-5">
                Your suggestion was sent. The developer will read it soon.
              </p>
              <button
                onClick={onClose}
                className="mono text-xs uppercase px-6 py-2 bg-stone-900 text-amber-400 hover:bg-red-700 transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// JOIN ADDITIONAL GROUP MODAL — used when SHOW_GROUP_SWITCHER is enabled
// ============================================================================

function JoinAdditionalGroupModal({ existingGroups, onJoin, onClose }) {
  const [code, setCode] = useState('');
  const trimmed = code.trim().toLowerCase().replace(/\s+/g, '-');
  const isDuplicate = existingGroups.includes(trimmed);
  const valid = trimmed.length >= 3 && !isDuplicate;

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/80 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="paper border-4 border-stone-900 sticker-shadow w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-stone-900 text-amber-400 px-5 py-4 flex items-center justify-between">
          <div>
            <div className="display text-2xl leading-none">JOIN ANOTHER GROUP</div>
            <div className="mono text-[10px] text-stone-400 mt-0.5">Add yourself to a second group</div>
          </div>
          <button onClick={onClose} className="text-amber-400 hover:text-white" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="serif text-stone-700 text-sm">
            Enter the code of a different group you'd like to join. Your sticker collection is shared across all your groups.
          </p>

          <label className="block">
            <div className="mono text-[10px] uppercase tracking-widest text-stone-600 mb-1">GROUP CODE</div>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. cousins-2026"
              maxLength={40}
              autoCapitalize="none"
              autoCorrect="off"
              className="w-full px-3 py-2 bg-stone-50 border-2 border-stone-900 mono focus:outline-none focus:border-red-700"
              style={{ fontSize: '16px' }}
            />
            <div className={`mono text-[10px] mt-1 ${isDuplicate ? 'text-red-700' : 'text-stone-500'}`}>
              {isDuplicate
                ? "You're already in this group."
                : 'Spaces will become dashes. Same as your other groups.'}
            </div>
          </label>

          <div className="flex gap-2 pt-1">
            <button
              onClick={onClose}
              className="mono text-xs uppercase px-3 py-2 border-2 border-stone-900 bg-stone-50 hover:bg-stone-200 flex-1"
            >
              Cancel
            </button>
            <button
              onClick={() => valid && onJoin(trimmed)}
              disabled={!valid}
              className="mono text-xs uppercase px-3 py-2 border-2 border-stone-900 bg-stone-900 text-amber-400 hover:bg-red-700 disabled:opacity-30 disabled:cursor-not-allowed flex-1"
            >
              Join group
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
