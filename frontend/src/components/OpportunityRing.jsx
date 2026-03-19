import React, { useEffect, useState } from 'react';

const OpportunityRing = ({ score = 0, size = 80, strokeWidth = 6, label, showLabel = true }) => {
  const [animated, setAnimated] = useState(0);
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (animated / 100) * circumference;

  const color = score >= 80 ? '#10B981' : score >= 65 ? '#F59E0B' : '#EF4444';
  const trackColor = score >= 80 ? 'rgba(16,185,129,0.1)' : score >= 65 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)';

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} stroke={trackColor} strokeWidth={strokeWidth} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={color} strokeWidth={strokeWidth} fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </svg>
      {showLabel && (
        <div style={{ textAlign: 'center', zIndex: 1 }}>
          <div className="mono" style={{ fontSize: size * 0.22, fontWeight: 700, color, lineHeight: 1 }}>{score}</div>
          {label && <div style={{ fontSize: size * 0.13, color: 'var(--text-medium)', marginTop: 1, lineHeight: 1 }}>{label}</div>}
        </div>
      )}
    </div>
  );
};

export default OpportunityRing;
