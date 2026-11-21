import { useState } from 'react';

const AchievementsBar = ({ achievements }) => {
  const [completedIndices, setCompletedIndices] = useState(() => new Set());
  const [tooltip, setTooltip] = useState({
    visible: false,
    name: '',
    description: '',
    left: 0,
    top: 0,
  });

  const handleToggleAchievement = (idx) => {
    setCompletedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  const handleMouseMove = (e, ach) => {
    setTooltip({
      visible: true,
      name: ach.name,
      description: ach.description,
      left: e.pageX + 15,
      top: e.pageY + 15,
    });
  };

  const handleMouseLeave = () => {
    setTooltip((prev) => ({ ...prev, visible: false }));
  };

  return (
    <div id="achievements-section" className="my-4 text-center">
      <h2 className="h4 mb-3 text-light">Osiągnięcia</h2>
      <div id="achievements-bar">
        {achievements.map((ach, idx) => {
          const isCompleted = completedIndices.has(idx);

          return (
            <div
              key={`${ach.name}-${idx}`}
              role="button"
              tabIndex={0}
              aria-pressed={isCompleted}
              className={`achievement-icon ${isCompleted ? 'completed' : ''}`}
              style={isCompleted ? { opacity: 0.45, filter: 'grayscale(70%)' } : undefined}
              onClick={() => handleToggleAchievement(idx)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleToggleAchievement(idx);
                }
              }}
              onMouseMove={(e) => handleMouseMove(e, ach)}
              onMouseLeave={handleMouseLeave}
            >
              <img
                src={ach.image}
                alt={ach.name}
                onError={(e) => {
                  e.currentTarget.src = 'images/2/Grass_Block.png';
                }}
              />
            </div>
          );
        })}
      </div>

      {tooltip.visible && (
        <div
          id="image-tooltip"
          style={{
            display: 'block',
            left: `${tooltip.left}px`,
            top: `${tooltip.top}px`,
          }}
        >
          <strong style={{ color: '#FAA61A', fontSize: '14px' }}>{tooltip.name}</strong>
          <br />
          <span style={{ fontSize: '12px', color: '#DCDDDE' }}>{tooltip.description}</span>
        </div>
      )}
    </div>
  );
};

export default AchievementsBar;