import React from 'react';

// Tap-to-rank: simpler and more accessible than drag-and-drop for
// non-technical users. Tapping an item adds it to the order (numbered);
// tapping a numbered item again removes it and renumbers the rest.
export default function RankingPicker({ items, value, onChange }) {
  const order = value || [];

  function toggle(id) {
    if (order.includes(id)) {
      onChange(order.filter((x) => x !== id));
    } else {
      onChange([...order, id]);
    }
  }

  return (
    <div className="rank-list">
      {items.map((item) => {
        const position = order.indexOf(item.id);
        const picked = position !== -1;
        return (
          <button
            type="button"
            key={item.id}
            className={`rank-item${picked ? ' picked' : ''}`}
            onClick={() => toggle(item.id)}
          >
            <span className="num">{picked ? position + 1 : ''}</span>
            <span>
              <div className="label">{item.label}</div>
              {item.blurb ? <div className="blurb">{item.blurb}</div> : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}
