// Import cursor SVG files to ensure they're bundled by webpack
import cursorDefault from '../cursor-default.svg';
import cursorPointer from '../cursor-pointer.svg';
import cursorText from '../cursor-text.svg';
import cursorGrab from '../cursor-grab.svg';

// Apply cursors to CSS custom properties
const applyCursors = () => {
  const root = document.documentElement;
  root.style.setProperty('--cursor-default', `url('${cursorDefault}') 2 2, auto`);
  root.style.setProperty('--cursor-pointer', `url('${cursorPointer}') 14 14, pointer`);
  root.style.setProperty('--cursor-text', `url('${cursorText}') 10 12, text`);
  root.style.setProperty('--cursor-grab', `url('${cursorGrab}') 12 12, grab`);
};

export { applyCursors };
export { cursorDefault, cursorPointer, cursorText, cursorGrab };