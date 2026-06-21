/** Clamp a numeric value between min and max. */
function clampVal(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

/** Build % position inside an anchor section (responsive — matches on any screen width). */
export function buildAnchorPosition(clientX, clientY, offsetX, offsetY, anchorEl, boxWidth = 280, boxHeight = 120) {
  if (!anchorEl) {
    return { topPercent: 55, leftPercent: 58, positionMode: 'anchor' };
  }
  const rect = anchorEl.getBoundingClientRect();
  const w = Math.max(1, rect.width);
  const h = Math.max(1, rect.height);
  const bw = boxWidth || 280;
  const bh = boxHeight || 120;
  const boxLeft = clientX - offsetX;
  const boxTop = clientY - offsetY;
  const maxLeft = Math.max(0, 100 - (bw / w) * 100);
  const maxTop = Math.max(0, 100 - (bh / h) * 100);
  return {
    topPercent: Math.round(clampVal(((boxTop - rect.top) / h) * 100, 0, maxTop) * 10) / 10,
    leftPercent: Math.round(clampVal(((boxLeft - rect.left) / w) * 100, 0, maxLeft) * 10) / 10,
    positionMode: 'anchor',
  };
}

/** CSS top/left for anchor-mode floating text. */
export function resolveAnchorPosition(p) {
  return {
    top: `${p?.topPercent ?? 55}%`,
    left: `${p?.leftPercent ?? 58}%`,
  };
}

/** Find the DOM node for an anchor block in the builder canvas. */
export function getAnchorElement(anchorBlockId, canvasEl) {
  if (!anchorBlockId) return null;
  const root = canvasEl || document;
  return root.querySelector?.(`[data-block-id="${anchorBlockId}"]`) ?? null;
}

/** Pick the best anchor block id when adding / migrating floating text. */
export function resolveAnchorBlockId(blocks, floatingBlockId) {
  const idx = blocks.findIndex(b => b.id === floatingBlockId);
  if (idx > 0) {
    for (let i = idx - 1; i >= 0; i--) {
      if (blocks[i].type !== 'floating_text') return blocks[i].id;
    }
  }
  const hero = blocks.find(b => b.type === 'hero');
  if (hero) return hero.id;
  const first = blocks.find(b => b.type !== 'floating_text' && b.type !== '__row__');
  return first?.id || null;
}

/** Migrate all floating-text blocks to anchor-based % positioning. */
export function migrateFloatingBlocks(blocks) {
  if (!Array.isArray(blocks)) return [];
  return blocks.map(block => {
    if (block?.type !== 'floating_text') return block;
    const p = block.props || {};
    if (p.positionMode === 'anchor' && p.anchorBlockId && p.topPercent != null) return block;
    const anchorBlockId = p.anchorBlockId || resolveAnchorBlockId(blocks, block.id);
    return {
      ...block,
      props: {
        ...p,
        positionMode: 'anchor',
        anchorBlockId,
        topPercent: p.topPercent ?? 55,
        leftPercent: p.leftPercent ?? 58,
      },
    };
  });
}
