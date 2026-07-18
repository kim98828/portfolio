// ============================================
// arch-svg — ASCII tree → inline SVG renderer
// ============================================
// Blog cards store their "Architecture" as ASCII trees (├──/│/└──).
// This turns a tree-shaped arch string into a themed SVG (indented node
// pills + elbow connectors). Box/flow diagrams (┌┐, →, ↓) are left to the
// caller to render as <pre>, since their layout isn't a hierarchy.

const ESC = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** True when `arch` is a hierarchy tree (has branch tees, no box corners). */
export function isTreeArch(arch) {
    return !!arch && arch.includes('├') && !arch.includes('┌');
}

/** Parse an ASCII tree into [{depth, label}] (4-char indent units). */
function parseTree(text) {
    const lines = text.split('\n').filter(l => l.trim().length);
    const nodes = [];
    lines.forEach((line, i) => {
        if (i === 0) { nodes.push({ depth: 0, label: line.trim() }); return; }
        const a = line.indexOf('├'), b = line.indexOf('└');
        const idx = a < 0 ? b : (b < 0 ? a : Math.min(a, b));
        if (idx < 0) {
            const prev = nodes[nodes.length - 1];
            nodes.push({ depth: prev ? prev.depth : 1, label: line.trim() });
            return;
        }
        const depth = Math.floor(idx / 4) + 1;
        const label = line.slice(idx).replace(/^[├└][─\s]*/, '').trim();
        nodes.push({ depth, label });
    });
    return nodes;
}

/**
 * @param {string} arch  ASCII tree
 * @returns {string|null} inline SVG markup, or null if not tree-shaped
 */
export function archToSvg(arch) {
    if (!isTreeArch(arch)) return null;
    const nodes = parseTree(arch);
    if (nodes.length < 2) return null;

    const PAD = 12, INDENT = 22, ROW = 30, NODEH = 22, CHAR = 6.7, MINW = 56, MAXW = 540;

    let maxRight = 0;
    nodes.forEach((n) => {
        n.x = PAD + n.depth * INDENT;
        n.w = Math.max(MINW, Math.min(Math.round(n.label.length * CHAR + 18), MAXW));
        maxRight = Math.max(maxRight, n.x + n.w);
    });
    const W = Math.ceil(maxRight + PAD);
    const H = nodes.length * ROW + PAD;
    nodes.forEach((n, i) => { n.y = PAD + i * ROW; n.cy = n.y + NODEH / 2; });

    const conns = [];
    nodes.forEach((n, i) => {
        if (n.depth === 0) return;
        let parent = null;
        for (let j = i - 1; j >= 0; j--) {
            if (nodes[j].depth === n.depth - 1) { parent = nodes[j]; break; }
        }
        const gutter = n.x - INDENT / 2;
        const top = parent ? parent.cy : n.cy;
        conns.push(`<path d="M${gutter} ${top} V${n.cy} H${n.x}" fill="none" stroke="#3a3a4a" stroke-width="1.3"/>`);
    });

    const rects = nodes.map((n) => {
        const root = n.depth === 0;
        const fill = root ? '#161622' : '#12121a';
        const stroke = root ? '#6366f1' : '#27273a';
        const sw = root ? 1.8 : 1;
        const tFill = root ? '#818cf8' : '#cbd5e1';
        const fw = root ? '600' : '400';
        return `<rect x="${n.x}" y="${n.y}" width="${n.w}" height="${NODEH}" rx="6" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`
            + `<text x="${n.x + 9}" y="${n.y + 15}" font-size="11" font-weight="${fw}" fill="${tFill}">${ESC(n.label)}</text>`;
    }).join('');

    return `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg" `
        + `font-family="ui-monospace, SFMono-Regular, Menlo, monospace" role="img" class="arch-tree-svg">`
        + conns.join('') + rects + `</svg>`;
}
