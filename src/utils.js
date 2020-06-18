export const isProperty = key =>
  key !== 'children' && key !== 'key' && !isEvent(key);
export const isNew = (prev, next) => key => prev[key] !== next[key];
export const isGone = (_prev, next) => key => !(key in next);
export const isEvent = key => key.startsWith('on');
