'use client';

import { useRef, useEffect, useCallback } from 'react';

const inputStyle = {
  width: '100%',
  padding: '8px 10px',
  border: '1.5px solid #E5E7EB',
  borderRadius: '8px',
  fontSize: '12px',
  background: '#FAFAFA',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
  outline: 'none',
};

const barBtn = {
  background: '#ffffff',
  border: '1.5px solid #E5E7EB',
  borderRadius: '6px',
  padding: '2px 6px',
  fontSize: '11px',
  fontWeight: 'bold',
  color: '#4B5563',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '22px',
  height: '22px',
  outline: 'none',
};

const barSelect = {
  background: '#ffffff',
  border: '1.5px solid #E5E7EB',
  borderRadius: '6px',
  padding: '0 4px',
  fontSize: '10px',
  color: '#4B5563',
  cursor: 'pointer',
  height: '24px',
  minWidth: '54px',
};

const FONT_OPTIONS = [
  { group: 'Sans-Serif', items: [
    ['Outfit, sans-serif', 'Outfit'], ['Inter, sans-serif', 'Inter'], ['Roboto, sans-serif', 'Roboto'],
    ['Montserrat, sans-serif', 'Montserrat'], ['Poppins, sans-serif', 'Poppins'], ['Lato, sans-serif', 'Lato'],
    ['Open Sans, sans-serif', 'Open Sans'], ['Raleway, sans-serif', 'Raleway'], ['Nunito, sans-serif', 'Nunito'],
    ['Mukta, sans-serif', 'Mukta'], ['Ubuntu, sans-serif', 'Ubuntu'], ['Heebo, sans-serif', 'Heebo'],
  ]},
  { group: 'Serif', items: [
    ['Playfair Display, serif', 'Playfair Display'], ['Merriweather, serif', 'Merriweather'], ['Lora, serif', 'Lora'],
    ['Cinzel, serif', 'Cinzel'], ['Cormorant Garamond, serif', 'Cormorant Garamond'], ['PT Serif, serif', 'PT Serif'],
    ['Georgia, serif', 'Georgia'], ['EB Garamond, serif', 'EB Garamond'], ['Libre Baskerville, serif', 'Libre Baskerville'],
    ['Domine, serif', 'Domine'],
  ]},
  { group: 'Display', items: [
    ['Oswald, sans-serif', 'Oswald'], ['Bebas Neue, sans-serif', 'Bebas Neue'], ['Anton, sans-serif', 'Anton'],
    ['Archivo Black, sans-serif', 'Archivo Black'], ['Syncopate, sans-serif', 'Syncopate'], ['Syne, sans-serif', 'Syne'],
  ]},
  { group: 'Handwriting / Script', items: [
    ['Caveat, cursive', 'Caveat'], ['Playpen Sans, cursive', 'Playpen Sans'], ['Architects Daughter, cursive', 'Architects Daughter'],
    ['Pacifico, cursive', 'Pacifico'], ['Dancing Script, cursive', 'Dancing Script'], ['Sacramento, cursive', 'Sacramento'],
    ['Shadows Into Light, cursive', 'Shadows Into Light'], ['Great Vibes, cursive', 'Great Vibes'], ['Alex Brush, cursive', 'Alex Brush'],
    ['Pinyon Script, cursive', 'Pinyon Script'], ['Allura, cursive', 'Allura'], ['Parisienne, cursive', 'Parisienne'],
    ['Cookie, cursive', 'Cookie'], ['Yellowtail, cursive', 'Yellowtail'], ['Kaushan Script, cursive', 'Kaushan Script'],
  ]},
  { group: 'Monospace', items: [
    ['Fira Code, monospace', 'Fira Code'], ['JetBrains Mono, monospace', 'JetBrains Mono'],
    ['Source Code Pro, monospace', 'Source Code Pro'], ['Courier Prime, monospace', 'Courier Prime'],
    ['Share Tech Mono, monospace', 'Share Tech Mono'],
  ]},
];

function getTextOffsets(el) {
  const len = el.textContent?.length || 0;
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return { start: 0, end: len };
  const range = sel.getRangeAt(0);
  if (!el.contains(range.commonAncestorContainer)) return { start: 0, end: len };

  const pre = document.createRange();
  pre.selectNodeContents(el);
  pre.setEnd(range.startContainer, range.startOffset);
  const start = pre.toString().length;
  const end = start + range.toString().length;
  return { start, end: end || start };
}

function setRangeFromOffsets(el, start, end) {
  const total = el.textContent?.length || 0;
  start = Math.max(0, Math.min(start, total));
  end = Math.max(start, Math.min(end, total));

  const findPos = (offset) => {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let count = 0;
    let node = walker.nextNode();
    while (node) {
      const len = node.textContent.length;
      if (count + len >= offset) return { node, offset: offset - count };
      count += len;
      node = walker.nextNode();
    }
    return { node: el, offset: 0 };
  };

  const s = findPos(start);
  const e = findPos(end);
  const range = document.createRange();
  try {
    range.setStart(s.node, s.offset);
    range.setEnd(e.node, e.offset);
    return range;
  } catch {
    range.selectNodeContents(el);
    return range;
  }
}

function wrapRangeWithStyle(range, styleProp, styleVal) {
  const span = document.createElement('span');
  span.style[styleProp] = styleVal;
  try {
    range.surroundContents(span);
  } catch {
    const contents = range.extractContents();
    span.appendChild(contents);
    range.insertNode(span);
  }
  return span;
}

function stripTrailingBrs(el) {
  while (el.lastChild?.nodeName === 'BR') {
    el.removeChild(el.lastChild);
  }
}

/** Merge nested span styles into one wrapper (fixes font-size then font-family conflicts). */
function collectNestedSpanStyles(span) {
  const styles = {};
  let cur = span;
  while (cur?.nodeType === Node.ELEMENT_NODE && cur.tagName === 'SPAN') {
    for (let i = 0; i < cur.style.length; i++) {
      const prop = cur.style.item(i);
      styles[prop] = cur.style.getPropertyValue(prop);
    }
    if (
      cur.childNodes.length === 1
      && cur.firstChild.nodeType === Node.ELEMENT_NODE
      && cur.firstChild.tagName === 'SPAN'
    ) {
      cur = cur.firstChild;
    } else {
      break;
    }
  }
  return styles;
}

function normalizeStyleRoot(el) {
  stripTrailingBrs(el);
  const text = el.textContent || '';
  if (!text.trim()) return null;

  const directSpan = [...el.childNodes].find(
    n => n.nodeType === Node.ELEMENT_NODE && n.tagName === 'SPAN'
  );

  if (directSpan && directSpan.textContent === text) {
    const styles = collectNestedSpanStyles(directSpan);
    const span = document.createElement('span');
    Object.entries(styles).forEach(([prop, val]) => span.style.setProperty(prop, val));
    span.textContent = text;
    el.innerHTML = '';
    el.appendChild(span);
    return span;
  }

  if (el.childNodes.length === 1 && el.firstChild?.tagName === 'SPAN') {
    return el.firstChild;
  }

  const span = document.createElement('span');
  span.textContent = text;
  el.innerHTML = '';
  el.appendChild(span);
  return span;
}

/** Apply or update inline style for a character range (updates existing span when possible). */
function applyInlineStyle(el, styleProp, styleVal, start, end) {
  const text = el.textContent || '';
  if (!text.trim()) return;

  if (start === end) {
    start = 0;
    end = text.length;
  }

  const isFull = start === 0 && end === text.length;

  if (isFull) {
    const span = normalizeStyleRoot(el);
    if (span) {
      span.style[styleProp] = styleVal;
      return;
    }
  }

  const range = setRangeFromOffsets(el, start, end);
  let ancestor = range.commonAncestorContainer;
  if (ancestor.nodeType === Node.TEXT_NODE) ancestor = ancestor.parentElement;

  while (ancestor?.tagName === 'SPAN' && el.contains(ancestor)) {
    if (ancestor.textContent === range.toString()) {
      ancestor.style[styleProp] = styleVal;
      return;
    }
    if (ancestor.parentElement?.tagName === 'SPAN' && el.contains(ancestor.parentElement)) {
      ancestor = ancestor.parentElement;
    } else {
      break;
    }
  }

  wrapRangeWithStyle(range, styleProp, styleVal);
}

function applyStyleToHtml(html, styleProp, styleVal, start, end) {
  const container = document.createElement('div');
  container.innerHTML = html || '';
  const text = container.textContent || '';
  if (!text.trim()) return html;

  if (start === end) {
    start = 0;
    end = text.length;
  }

  const range = setRangeFromOffsets(container, start, end);
  wrapRangeWithStyle(range, styleProp, styleVal);
  return container.innerHTML;
}

export default function RichTextEditor({ value = '', onChange, rows = 3, rich = true, placeholder = '' }) {
  const editorRef = useRef(null);
  const bookmarkRef = useRef({ start: 0, end: 0 });
  const localHtmlRef = useRef(value);
  const pendingLocalRef = useRef(false);

  const saveBookmark = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    bookmarkRef.current = getTextOffsets(el);
  }, []);

  const commitHtml = useCallback((html) => {
    localHtmlRef.current = html;
    pendingLocalRef.current = true;
    onChange?.(html);
  }, [onChange]);

  // Sync external value → editor (never overwrite a change we just committed)
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;

    if (pendingLocalRef.current) {
      pendingLocalRef.current = false;
      const local = localHtmlRef.current ?? '';
      if (el.innerHTML !== local) el.innerHTML = local;
      return;
    }

    const val = value ?? '';
    if (el.innerHTML === val) {
      localHtmlRef.current = val;
      return;
    }
    localHtmlRef.current = val;
    el.innerHTML = val;
  }, [value]);

  const applyFormat = useCallback((styleProp, styleVal) => {
    const el = editorRef.current;
    if (!el || !el.textContent?.trim()) return;

    let { start, end } = bookmarkRef.current;
    if (start === end) {
      start = 0;
      end = el.textContent.length;
    }

    el.focus();
    applyInlineStyle(el, styleProp, styleVal, start, end);

    const html = el.innerHTML;
    commitHtml(html);
    bookmarkRef.current = { start: 0, end: el.textContent.length };
  }, [commitHtml]);

  const applyExec = useCallback((cmd, val = null) => {
    const el = editorRef.current;
    if (!el || !el.textContent?.trim()) return;

    el.focus();
    const bm = bookmarkRef.current;
    let { start, end } = bm;
    if (start !== end) {
      const range = setRangeFromOffsets(el, start, end);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    } else {
      const range = document.createRange();
      range.selectNodeContents(el);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }

    document.execCommand('styleWithCSS', false, true);
    document.execCommand(cmd, false, val);
    commitHtml(el.innerHTML);
  }, [commitHtml]);

  const applyBlockTag = useCallback((tagName) => {
    const el = editorRef.current;
    if (!el || !el.textContent?.trim()) return;

    el.focus();
    const bm = bookmarkRef.current;
    let { start, end } = bm;
    if (start === end) {
      start = 0;
      end = el.textContent.length;
    }
    const range = setRangeFromOffsets(el, start, end);
    const tag = document.createElement(tagName);
    try {
      range.surroundContents(tag);
    } catch {
      tag.appendChild(range.extractContents());
      range.insertNode(tag);
    }
    commitHtml(el.innerHTML);
  }, [commitHtml]);

  const handleSelectChange = (styleProp, styleVal) => {
    requestAnimationFrame(() => applyFormat(styleProp, styleVal));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', width: '100%' }}>
      {rich && (
        <div
          onMouseDown={saveBookmark}
          style={{
            display: 'flex', gap: '3px', background: '#F9FAFB', padding: '5px',
            borderRadius: '8px 8px 0 0', border: '1.5px solid #E5E7EB', borderBottom: 'none',
            flexWrap: 'wrap', position: 'relative', zIndex: 2,
          }}
        >
          <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => applyExec('bold')} style={barBtn} title="Bold"><b>B</b></button>
          <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => applyExec('italic')} style={barBtn} title="Italic"><i>I</i></button>
          <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => applyExec('underline')} style={barBtn} title="Underline"><u>U</u></button>
          <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => applyBlockTag('h2')} style={barBtn} title="Heading 2">H2</button>
          <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => applyBlockTag('h3')} style={barBtn} title="Heading 3">H3</button>
          <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => applyBlockTag('p')} style={barBtn} title="Paragraph">P</button>
          <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => {
            const el = editorRef.current;
            if (!el) return;
            el.focus();
            document.execCommand('insertHTML', false, '<br/>');
            commitHtml(el.innerHTML);
          }} style={barBtn} title="Line Break">BR</button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <select
              defaultValue=""
              onChange={e => { const v = e.target.value; if (v) { handleSelectChange('color', v); e.target.value = ''; } }}
              style={barSelect}
            >
              <option value="">Color</option>
              <option value="#FF9F1C">Orange</option>
              <option value="#1A1B4B">Dark Blue</option>
              <option value="#EF4444">Red</option>
              <option value="#10B981">Green</option>
              <option value="#3B82F6">Blue</option>
            </select>
            <label
              style={{
                ...barBtn,
                padding: '0',
                width: '22px',
                height: '22px',
                minWidth: '22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)',
                border: '1.5px solid #E5E7EB',
                borderRadius: '50%',
                overflow: 'hidden',
                boxShadow: 'inset 0 0 2px rgba(0,0,0,0.2)',
                transition: 'transform 0.1s ease',
              }}
              title="Custom Color Wheel"
            >
              <input
                type="color"
                onChange={e => handleSelectChange('color', e.target.value)}
                style={{
                  opacity: 0,
                  width: '100%',
                  height: '100%',
                  cursor: 'pointer',
                  padding: 0,
                  border: 'none'
                }}
              />
            </label>
          </div>
          <select
            defaultValue=""
            onChange={e => { const v = e.target.value; if (v) { handleSelectChange('fontSize', v); e.target.value = ''; } }}
            style={barSelect}
          >
            <option value="">Size</option>
            {['12px', '14px', '16px', '18px', '20px', '24px', '32px'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            defaultValue=""
            onChange={e => { const v = e.target.value; if (v) { handleSelectChange('fontFamily', v); e.target.value = ''; } }}
            style={{ ...barSelect, minWidth: '72px' }}
          >
            <option value="">Font</option>
            {FONT_OPTIONS.map(g => (
              <optgroup key={g.group} label={g.group}>
                {g.items.map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      )}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={e => commitHtml(e.currentTarget.innerHTML)}
        onMouseUp={saveBookmark}
        onKeyUp={saveBookmark}
        onSelect={saveBookmark}
        onFocus={saveBookmark}
        onBlur={saveBookmark}
        style={{
          ...inputStyle,
          resize: 'vertical',
          minHeight: `${rows * 24}px`,
          maxHeight: '400px',
          overflowY: 'auto',
          borderRadius: rich ? '0 0 8px 8px' : '8px',
          background: '#ffffff',
          border: '1.5px solid #E5E7EB',
          padding: '8px 12px',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      />
    </div>
  );
}

export { applyStyleToHtml, getTextOffsets };
