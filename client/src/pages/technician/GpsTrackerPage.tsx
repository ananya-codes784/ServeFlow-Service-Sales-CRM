import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { MapPin, Navigation, Wifi, WifiOff, RefreshCw, ExternalLink, HardHat, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

const GpsTrackerPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [myLocation, setMyLocation] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [locationError, setLocationError] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const { data: locations = [], isLoading, refetch } = useQuery({
    queryKey: ['gps-locations'],
    queryFn: async () => {
      try { const res = await api.get('/gps'); return res.data.data; }
      catch { return []; }
    },
    refetchInterval: 30000,
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => { const res = await api.post('/gps/update', data); return res.data; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['gps-locations'] }); setLocationStatus('success'); },
    onError: () => setLocationStatus('error'),
  });

  const fetchMyLocation = () => {
    if (!navigator.geolocation) { setLocationError('Geolocation not supported by your browser.'); setLocationStatus('error'); return; }
    setLocationStatus('loading');
    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setMyLocation({ lat: latitude, lng: longitude, accuracy });
        updateMutation.mutate({
          technicianId: (user as any)?.id || (user as any)?._id || 'unknown',
          technicianName: user?.name || 'Unknown Technician',
          latitude,
          longitude,
          accuracy,
          address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
          status: 'ACTIVE',
        });
      },
      (err) => {
        setLocationStatus('error');
        setLocationError(err.message || 'Could not get location. Please allow location access.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const filtered = locations.filter((l: any) => filterStatus === 'ALL' || l.status === filterStatus);

  const statusColor: Record<string, string> = {
    ACTIVE: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    IDLE: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    OFF_DUTY: 'text-slate-400 bg-slate-800 border-slate-700',
  };

  const getTimeSince = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m ago`;
  };

  if (isLoading) return <LoadingSpinner size="lg" text="Loading GPS tracker..." />;

  return (
    <div className="space-y-6">
      <PageHeader title="GPS Technician Tracker" subtitle="Real-time field engineer location tracking — check in from the field, view all technician positions" icon={MapPin}
        action={
          <button onClick={() => refetch()} className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white text-xs font-medium transition">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        }
      />

      {/* My Location Check-in Panel */}
      <div className="glass-card p-5 rounded-2xl border border-brand-500/20 bg-brand-500/5">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-brand-500/20 text-brand-400"><Navigation className="w-6 h-6" /></div>
          <div className="flex-1">
            <h3 className="font-bold text-white text-base mb-1">📍 Share Your Location</h3>
            <p className="text-xs text-slate-400 mb-4">As a technician, check in your location so your manager can track your position. Your browser will ask for permission.</p>

            {myLocation && locationStatus === 'success' && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-4 text-xs">
                <p className="text-emerald-400 font-semibold mb-1">✅ Location shared successfully!</p>
                <p className="text-slate-300">Lat: {myLocation.lat.toFixed(6)}, Lng: {myLocation.lng.toFixed(6)}</p>
                <p className="text-slate-500">Accuracy: ±{Math.round(myLocation.accuracy)}m</p>
                <a href={`https://maps.google.com/?q=${myLocation.lat},${myLocation.lng}`} target="_blank" rel="noreferrer" className="text-brand-400 hover:underline flex items-center gap-1 mt-1"><ExternalLink className="w-3 h-3" /> View on Google Maps</a>
              </div>
            )}

            {locationError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 mb-4 text-xs text-red-400">
                <AlertCircle className="w-3.5 h-3.5 inline mr-1" />{locationError}
              </div>
            )}

            <button
              onClick={fetchMyLocation}
              disabled={locationStatus === 'loading'}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-xs transition disabled:opacity-50"
            >
              {locationStatus === 'loading' ? <><RefreshCw className="w-4 h-4 animate-spin" /> Getting Location...</> : <><Navigation className="w-4 h-4" /> Check In My Location</>}
            </button>
          </div>
        </div>
      </div>

      {/* All Technician Locations */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white text-base">All Technician Locations ({locations.length})</h3>
          <div className="flex gap-2">
            {['ALL', 'ACTIVE', 'IDLE', 'OFF_DUTY'].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${filterStatus === s ? 'bg-brand-600/20 text-brand-400 border border-brand-500/30' : 'bg-slate-900 text-slate-400 border border-slate-800'}`}>{s.replace('_', ' ')}</button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <MapPin className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm font-medium">No technician locations tracked yet</p>
            <p className="text-xs text-slate-600 mt-1">Technicians need to check in their location above</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((loc: any) => (
              <div key={loc._id} className="glass-card p-5 rounded-2xl border border-white/5 hover:border-white/10 transition">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400"><HardHat className="w-5 h-5" /></div>
                    <div>
                      <p className="font-bold text-white text-sm">{loc.technicianName}</p>
                      <p className="text-xs text-slate-400">ID: {loc.technicianId}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusColor[loc.status] || statusColor.IDLE}`}>{loc.status?.replace('_', ' ')}</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-400"><MapPin className="w-3.5 h-3.5 text-slate-500" /><span className="font-mono">{loc.latitude?.toFixed(4)}, {loc.longitude?.toFixed(4)}</span></div>
                  {loc.address && <div className="flex items-center gap-2 text-slate-400"><Navigation className="w-3.5 h-3.5 text-slate-500" /><span>{loc.address}</span></div>}
                  <div className="flex items-center gap-2 text-slate-500"><Clock className="w-3.5 h-3.5" /><span>Updated {getTimeSince(loc.lastUpdated)}</span></div>
                </div>

                <a
                  href={`https://maps.google.com/?q=${loc.latitude},${loc.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition border border-white/5"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Open in Google Maps
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5">
        <div className="flex items-start gap-3">
          <Wifi className="w-5 h-5 text-brand-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-slate-400 space-y-1">
            <p className="font-semibold text-slate-300">How GPS Tracking Works:</p>
            <p>1. Each technician logs in and clicks "Check In My Location" — their browser shares coordinates</p>
            <p>2. Admin/Manager sees all technician locations on this screen, auto-refreshes every 30 seconds</p>
            <p>3. Click "Open in Google Maps" to see exact location on map</p>
            <p>4. Technicians set themselves as "Off Duty" when they finish their shift</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GpsTrackerPage;
