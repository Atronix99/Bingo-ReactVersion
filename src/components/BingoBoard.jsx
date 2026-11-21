import { useEffect, useState } from 'react';
import { BOARD_SIZE } from '../utils/boardGenerator';

const BingoBoard = ({boardRef, items, completedIndices, winIndices, onToggleCell, boardKey}) => {
  const [animatedIndices, setAnimatedIndices] = useState(new Set());
  const [tooltip, setTooltip] = useState({
    visible: false,
    text: '',
    left: 'auto',
    right: 'auto',
    top: 0,
  });

  useEffect(() => {
    const timers = items.map((_, idx) =>
      setTimeout(() => {
        setAnimatedIndices((prev) => {
          const next = new Set(prev);
          next.add(idx);
          return next;
        });
      }, idx * 25)
    );

    return () => timers.forEach(clearTimeout);
  }, [items, boardKey]);

  const handleMouseMove = (e, item, index) => {
    const columnIndex = index % BOARD_SIZE;
    const isLastColumn = columnIndex === BOARD_SIZE - 1;

    if (isLastColumn && window.innerWidth < 600) {
      setTooltip({
        visible: true,
        text: item.name,
        right: `${window.innerWidth - e.pageX + 15}px`,
        left: 'auto',
        top: `${e.pageY + 10}px`,
      });
    } else {
      setTooltip({
        visible: true,
        text: item.name,
        left: `${e.pageX + 10}px`,
        right: 'auto',
        top: `${e.pageY + 10}px`,
      });
    }
  };

  const handleMouseLeave = () => {
    setTooltip((prev) => ({ ...prev, visible: false }));
  };

  return (
    <div id="bingo-board-wrapper" className="mx-auto mt-2 pb-1">
      <div ref={boardRef} id="bingo-board" key={boardKey}>
        {items.map((item, idx) => {
          const isCompleted = completedIndices.has(idx);
          const isWin = winIndices.has(idx);
          const isAnimated = animatedIndices.has(idx);

          return (
            <div
              key={`${boardKey}-${idx}`}
              data-alt={item.name}
              onClick={() => onToggleCell(idx)}
              onMouseMove={(e) => handleMouseMove(e, item, idx)}
              onMouseLeave={handleMouseLeave}
              className={[
                'item-cell',
                isAnimated ? 'animate-in' : '',
                isCompleted ? 'completed' : '',
                isWin ? 'win-line' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {item.image ? (
                <img src={item.image} alt={item.name} className="item-image" />
              ) : (
                <span className="item-name">{item.name}</span>
              )}
            </div>
          );
        })}
      </div>

      {tooltip.visible && (
        <div
          id="image-tooltip"
          style={{
            display: 'block',
            left: tooltip.left,
            right: tooltip.right,
            top: tooltip.top,
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}

export default BingoBoard;