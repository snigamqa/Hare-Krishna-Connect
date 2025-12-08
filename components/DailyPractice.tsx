import React, { useState, useEffect } from 'react';
import { DailyPracticeLog, PracticeEntry } from '../types';
import { useLanguage } from './LanguageContext';

const DailyPractice: React.FC = () => {
  const { t } = useLanguage();
  const [log, setLog] = useState<DailyPracticeLog>({
    entries: [],
    totalRounds: 0,
    currentStreak: 0,
    bestStreak: 0,
    lastUpdated: new Date().toISOString().split('T')[0],
  });

  const [todayEntry, setTodayEntry] = useState<PracticeEntry>({
    date: new Date().toISOString().split('T')[0],
    japaRounds: 0,
    gitaMinutes: 0,
    meditationMinutes: 0,
    bhajanMinutes: 0,
    notes: '',
  });

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('hkc_practice_log');
    if (saved) {
      const parsed = JSON.parse(saved);
      setLog(parsed);
      const today = new Date().toISOString().split('T')[0];
      const existingToday = parsed.entries.find((e: PracticeEntry) => e.date === today);
      if (existingToday) {
        setTodayEntry(existingToday);
      }
    }
  }, []);

  // Save to LocalStorage
  const savePractice = () => {
    const today = new Date().toISOString().split('T')[0];
    const updatedEntries = log.entries.filter(e => e.date !== today);
    if (todayEntry.japaRounds > 0 || todayEntry.gitaMinutes > 0 || todayEntry.meditationMinutes > 0 || todayEntry.bhajanMinutes > 0) {
      updatedEntries.unshift({ ...todayEntry, date: today });
    }
    updatedEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const totalRounds = updatedEntries.reduce((sum, e) => sum + e.japaRounds, 0);
    const currentStreak = calculateStreak(updatedEntries);
    
    const updated: DailyPracticeLog = {
      entries: updatedEntries,
      totalRounds,
      currentStreak,
      bestStreak: Math.max(currentStreak, log.bestStreak),
      lastUpdated: today,
    };

    setLog(updated);
    localStorage.setItem('hkc_practice_log', JSON.stringify(updated));
  };

  const calculateStreak = (entries: PracticeEntry[]): number => {
    if (entries.length === 0) return 0;
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < entries.length; i++) {
      const entryDate = new Date(entries[i].date);
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);
      if (entryDate.toISOString().split('T')[0] === expectedDate.toISOString().split('T')[0]) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const handleInputChange = (field: keyof PracticeEntry, value: any) => {
    setTodayEntry(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const getWeeklyStats = () => {
    const week = log.entries.slice(0, 7);
    const totalJapa = week.reduce((sum, e) => sum + e.japaRounds, 0);
    const totalGita = week.reduce((sum, e) => sum + e.gitaMinutes, 0);
    const totalMeditation = week.reduce((sum, e) => sum + e.meditationMinutes, 0);
    const totalBhajan = week.reduce((sum, e) => sum + e.bhajanMinutes, 0);
    return { totalJapa, totalGita, totalMeditation, totalBhajan };
  };

  const weekly = getWeeklyStats();

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <div className="text-center mb-12">
        <h1 className="text-5xl text-slate-800 font-serif font-bold mb-4">Daily Sadhana Tracker</h1>
        <p className="text-slate-500">Track your spiritual practice and build consistent devotion</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Total Japa Rounds', value: log.totalRounds, icon: '📿' },
          { label: 'Current Streak', value: `${log.currentStreak} days`, icon: '🔥' },
          { label: 'Best Streak', value: `${log.bestStreak} days`, icon: '🏆' },
          { label: 'Practice Days', value: log.entries.length, icon: '📅' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 text-center">
            <div className="text-4xl mb-2">{stat.icon}</div>
            <p className="text-slate-500 text-sm font-medium uppercase mb-2">{stat.label}</p>
            <p className="text-3xl font-bold text-slate-800">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Log */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Today's Practice</h2>
          <div className="space-y-4">
            {[
              { label: 'Japa Rounds (mala)', field: 'japaRounds', hint: '1 mala = 108 rounds', icon: '📿' },
              { label: 'Gita Reading (minutes)', field: 'gitaMinutes', hint: '0 min', icon: '📖' },
              { label: 'Meditation (minutes)', field: 'meditationMinutes', hint: 'Quiet reflection', icon: '🧘' },
              { label: 'Bhajan/Kirtan (minutes)', field: 'bhajanMinutes', hint: 'Singing', icon: '🎵' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <span className="text-2xl">{item.icon}</span>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">{item.label}</label>
                  <input
                    type="number"
                    min="0"
                    value={todayEntry[item.field as keyof PracticeEntry] || 0}
                    onChange={(e) => handleInputChange(item.field as keyof PracticeEntry, parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder={item.hint}
                  />
                </div>
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">📝 Notes</label>
              <textarea
                value={todayEntry.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="How was your practice today?"
                rows={3}
              />
            </div>
            <button
              onClick={savePractice}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl transition-colors"
            >
              Save Today's Practice
            </button>
          </div>
        </div>

        {/* Weekly Summary */}
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-8 rounded-3xl border border-orange-100">
          <h2 className="text-2xl font-bold text-orange-900 mb-6">This Week's Progress</h2>
          <div className="space-y-4">
            <div className="bg-white/80 p-4 rounded-2xl">
              <p className="text-sm text-slate-600">Total Japa Rounds</p>
              <p className="text-3xl font-bold text-orange-600">{weekly.totalJapa}</p>
            </div>
            <div className="bg-white/80 p-4 rounded-2xl">
              <p className="text-sm text-slate-600">Gita Reading</p>
              <p className="text-3xl font-bold text-amber-600">{weekly.totalGita} min</p>
            </div>
            <div className="bg-white/80 p-4 rounded-2xl">
              <p className="text-sm text-slate-600">Meditation</p>
              <p className="text-3xl font-bold text-orange-500">{weekly.totalMeditation} min</p>
            </div>
            <div className="bg-white/80 p-4 rounded-2xl">
              <p className="text-sm text-slate-600">Bhajan/Kirtan</p>
              <p className="text-3xl font-bold text-yellow-600">{weekly.totalBhajan} min</p>
            </div>
          </div>

          {log.currentStreak > 0 && (
            <div className="mt-6 bg-gradient-to-r from-orange-500 to-amber-500 text-white p-4 rounded-2xl text-center">
              <p className="text-sm opacity-90">🔥 Current Streak</p>
              <p className="text-2xl font-bold">{log.currentStreak} Days!</p>
              <p className="text-xs opacity-75 mt-2">Keep it going! 🙏</p>
            </div>
          )}
        </div>
      </div>

      {/* History */}
      <div className="mt-12 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Practice History</h2>
        {log.entries.length === 0 ? (
          <p className="text-slate-400 text-center py-8">No practice logged yet. Start your journey today! 🙏</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {log.entries.map((entry, idx) => (
              <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 hover:border-orange-200 transition-colors">
                <p className="font-bold text-slate-800 mb-3">{new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                <div className="space-y-2 text-sm">
                  {entry.japaRounds > 0 && <p>📿 {entry.japaRounds} rounds</p>}
                  {entry.gitaMinutes > 0 && <p>📖 {entry.gitaMinutes} min reading</p>}
                  {entry.meditationMinutes > 0 && <p>🧘 {entry.meditationMinutes} min meditation</p>}
                  {entry.bhajanMinutes > 0 && <p>🎵 {entry.bhajanMinutes} min bhajan</p>}
                  {entry.notes && <p className="text-slate-600 italic mt-2">{entry.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyPractice;
