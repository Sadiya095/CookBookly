import React from 'react';

export function Bow({ style = {}, ...props }) {
  return (
    <div
      style={{
        fontSize: 42,
        color: '#c88caf',
        ...style
      }}
      {...props}
    >
      🎀
    </div>
  );
}

export function Face({ style = {}, ...props }) {
  return (
    <div
      style={{
        fontSize: 38,
        textAlign: 'center',
        ...style
      }}
      {...props}
    >
      ♡
    </div>
  );
}

export function Heart({ size = 30, fill = 'none', style = {}, ...props }) {
  return (
    <span
      style={{
        fontSize: size,
        color: fill || '#d99abb',
        display: 'inline-block',
        ...style
      }}
      {...props}
    >
      ♥
    </span>
  );
}

export function Lavender({ style = {}, ...props }) {
  return (
    <div
      style={{
        fontSize: 36,
        ...style
      }}
      {...props}
    >
      💜
    </div>
  );
}

export function Bunny({ style = {}, ...props }) {
  return (
    <div
      style={{
        fontSize: 55,
        ...style
      }}
      {...props}
    >
      🐰
    </div>
  );
}

export function Mug({ style = {}, ...props }) {
  return (
    <div
      style={{
        fontSize: 45,
        ...style
      }}
      {...props}
    >
      ☕
    </div>
  );
}