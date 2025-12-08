import React, { useState, useEffect } from 'react';

const MalaCounter: React.FC = () => {
  const [roundCount, setRoundCount] = useState(0);
  const [sessionBeads, setSessionBeads] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sessionMinutes, setSessionMinutes] = useState(0);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  // Timer for session
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setSessionMinutes(prev => prev + 1);
      }, 60000); // Update every minute
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Create beads array (108 beads per mala + sumeru bead)
  const createBeads = () => {
    const beads: number[] = [];
    for (let i = 0; i < 108; i++) {
      beads.push(i);
    }
    return beads;
  };

  useEffect(() => {
    setSessionBeads(createBeads());
    // Initialize audio
    audioRef.current = new Audio('data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==');
  }, []);

  const handleBeadClick = (index: number) => {
    if (!isPlaying) {
      setIsPlaying(true);
    }
    if (index === roundCount) {
      setRoundCount(prev => (prev + 1) % 109);
      playSound();
    }
  };

  const playSound = () => {
    // Simple beep sound
    if (audioRef.current) {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.1);
      
      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + 0.1);
    }
  };

  const resetSession = () => {
    setRoundCount(0);
    setSessionMinutes(0);
    setIsPlaying(false);
  };

  const getMalaCompletions = () => Math.floor(roundCount / 108);
  const getCurrentRound = () => roundCount % 108;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <div className="text-center mb-12">
        <h1 className="text-5xl text-slate-800 font-serif font-bold mb-4">108 Mala Counter</h1>
        <p className="text-slate-500">Chant the Hare Krishna Mahamantra with the sacred mala beads</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Sidebar - Stats */}
        <div className="space-y-6">
          {/* Malas Completed */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-8 rounded-3xl shadow-xl">
            <p className="text-xs font-bold uppercase opacity-90 mb-2">Mala Completions</p>
            <p className="text-5xl font-bold">{getMalaCompletions()}</p>
            <p className="text-sm opacity-75 mt-2">108 beads each</p>
          </div>

          {/* Session Time */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <p className="text-xs font-bold text-slate-600 uppercase mb-2">Session Time</p>
            <p className="text-4xl font-bold text-slate-800">{sessionMinutes}</p>
            <p className="text-slate-500 text-sm">minutes</p>
          </div>

          {/* Controls */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`w-full font-bold py-3 rounded-xl transition-colors ${
                isPlaying
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-orange-600 hover:bg-orange-700 text-white'
              }`}
            >
              {isPlaying ? '⏸ Pause Session' : '▶ Start Session'}
            </button>
            <button
              onClick={resetSession}
              className="w-full bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 rounded-xl transition-colors text-sm"
            >
              Reset
            </button>
          </div>

          {/* Mantra Guide */}
          <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
            <h3 className="font-bold text-blue-900 mb-3">Hare Krishna Mantra</h3>
            <p className="text-sm text-blue-800 italic leading-relaxed">
              "Hare Krishna, Hare Krishna,
              Krishna Krishna, Hare Hare,
              Hare Rama, Hare Rama,
              Rama Rama, Hare Hare"
            </p>
            <p className="text-xs text-blue-700 mt-3">Chant once per bead</p>
          </div>
        </div>

        {/* Center - Bead Counter */}
        <div className="lg:col-span-2">
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
            <div className="text-center mb-12">
              <p className="text-slate-600 text-sm font-medium mb-2">CURRENT ROUND</p>
              <p className="text-6xl font-bold text-orange-600">{getCurrentRound() + 1}</p>
              <p className="text-slate-500 text-sm mt-2">of 108 beads</p>
              
              {/* Progress bar */}
              <div className="mt-6 w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-orange-500 to-orange-600 h-full transition-all duration-300"
                  style={{ width: `${(getCurrentRound() / 108) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Beads Grid */}
            <div className="mb-8">
              <div className="grid grid-cols-12 gap-2">
                {sessionBeads.map((beadNum) => {
                  const isActive = beadNum < getCurrentRound();
                  const isCurrent = beadNum === getCurrentRound();
                  const isSumeru = beadNum === 107; // Last position is sumeru

                  return (
                    <button
                      key={beadNum}
                      onClick={() => handleBeadClick(beadNum)}
                      className={`aspect-square rounded-full transition-all duration-200 font-bold text-xs flex items-center justify-center shadow-md ${
                        isSumeru
                          ? 'col-span-3 text-white bg-yellow-500 hover:bg-yellow-600'
                          : isCurrent
                          ? 'bg-orange-600 text-white scale-110 ring-4 ring-orange-300'
                          : isActive
                          ? 'bg-slate-400 text-white'
                          : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                      }`}
                      disabled={!isPlaying && beadNum !== 0}
                    >
                      {isSumeru ? '🪬' : beadNum + 1}
                    </button>
                  );
                })}
              </div>
              <p className="text-center text-xs text-slate-500 mt-4">
                Click beads in order while chanting
              </p>
            </div>

            {/* Completion Message */}
            {getCurrentRound() === 0 && roundCount > 0 && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 p-6 rounded-2xl text-center">
                <p className="text-green-900 font-bold text-lg">🙏 Mala Completed! 🙏</p>
                <p className="text-green-700 text-sm mt-2">
                  You have completed {getMalaCompletions()} full mala(s)
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            icon: '🧬',
            title: 'Bead Count',
            desc: '108 beads represent the 108 paths to enlightenment in Hindu philosophy',
          },
          {
            icon: '🎯',
            title: 'One Mala Round',
            desc: 'Chanting once per bead takes approximately 10-15 minutes',
          },
          {
            icon: '🕉️',
            title: 'Daily Practice',
            desc: 'Traditional practice recommends 16 malas daily for spiritual advancement',
          },
        ].map((tip, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 text-center">
            <div className="text-4xl mb-4">{tip.icon}</div>
            <h3 className="font-bold text-slate-800 mb-2">{tip.title}</h3>
            <p className="text-slate-600 text-sm">{tip.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MalaCounter;
