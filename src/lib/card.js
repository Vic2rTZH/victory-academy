// Shareable 1080×1080 Take Command card — same design as TC HQ → Cards (ported from vs-hq lib/quote-card.ts).
const GOLD = "#ea9a23";
const CHARCOAL = "#1e1e1e";
const LIGHT = "#eaeaea";
const CRIMSON = "#a03434";
const F = (px, italic = false) => `${italic ? "italic " : ""}${px}px "Bebas Neue", sans-serif`;
function loadImg(src) {
  return new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = src;
  });
}
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function drawCard(cv, text, pillar, logo, cover, heading = "QUOTES", attribution = "") {
  const ctx = cv.getContext("2d");
  const W = 1080, H = 1080;
  cv.width = W;
  cv.height = H;
  const splitX = cover ? 448 : W;
  ctx.fillStyle = CHARCOAL;
  ctx.fillRect(0, 0, splitX, H);
  if (cover) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(splitX, 0, W - splitX, H);
    ctx.clip();
    const pw2 = W - splitX, s = Math.max(pw2 / cover.width, H / cover.height), dw = cover.width * s, dh = cover.height * s;
    ctx.drawImage(cover, splitX + (pw2 - dw) / 2, (H - dh) / 2, dw, dh);
    const g = ctx.createLinearGradient(splitX, 0, splitX + 60, 0);
    g.addColorStop(0, "rgba(30,30,30,0.75)");
    g.addColorStop(1, "rgba(30,30,30,0)");
    ctx.fillStyle = g;
    ctx.fillRect(splitX, 0, 60, H);
    ctx.restore();
  }
  const pad = 36;
  ctx.fillStyle = GOLD;
  ctx.font = F(18);
  ctx.letterSpacing = "5px";
  ctx.fillText("TAKE COMMAND", pad, 68);
  ctx.letterSpacing = "0px";
  const hfs = heading.length > 9 ? 62 : 78;
  ctx.font = F(hfs);
  ctx.letterSpacing = "4px";
  ctx.fillStyle = LIGHT;
  ctx.fillText(heading, pad - 2, 172);
  ctx.strokeStyle = LIGHT;
  ctx.lineWidth = 2.5;
  ctx.lineJoin = "round";
  ctx.strokeText(heading, pad - 2, 172);
  ctx.lineWidth = 1;
  ctx.letterSpacing = "0px";
  ctx.fillStyle = GOLD;
  ctx.fillRect(pad, 186, 280, 5);
  ctx.fillStyle = CRIMSON;
  ctx.fillRect(pad + 284, 186, 60, 5);
  ctx.font = F(14);
  ctx.letterSpacing = "2px";
  const pw = ctx.measureText(pillar.toUpperCase()).width + 22;
  ctx.fillStyle = "rgba(232,151,26,0.18)";
  ctx.fillRect(pad, 204, pw, 26);
  ctx.fillStyle = GOLD;
  ctx.fillText(pillar.toUpperCase(), pad + 11, 222);
  ctx.letterSpacing = "0px";
  const bx = pad, by = 248, bw = splitX - pad * 2, bh = 430;
  ctx.fillStyle = GOLD;
  roundRect(ctx, bx, by, bw, bh, 16);
  ctx.fill();
  ctx.fillStyle = "rgba(0,0,0,0.12)";
  ctx.font = F(140);
  ctx.fillText("\u201D", bx + 10, by + 106);
  const maxTW = bw - 56;
  const fs = text.length < 80 ? 40 : text.length < 140 ? 35 : text.length < 210 ? 30 : 26;
  ctx.fillStyle = CHARCOAL;
  ctx.font = F(fs, true);
  ctx.letterSpacing = "1px";
  const lines = [];
  let line = "";
  for (const w of text.split(" ")) {
    const t = line ? `${line} ${w}` : w;
    if (ctx.measureText(t).width > maxTW && line) {
      lines.push(line);
      line = w;
    } else line = t;
  }
  if (line) lines.push(line);
  const lh = Math.round(fs * 1.38), extra = attribution ? 46 : 0, start = Math.round(by + (bh - lines.length * lh - extra) / 2) + fs;
  lines.forEach((l, i) => ctx.fillText(l, bx + (bw - ctx.measureText(l).width) / 2, start + i * lh));
  if (attribution) {
    ctx.font = F(22);
    ctx.letterSpacing = "2px";
    const a = `\u2014 ${attribution.toUpperCase()}`;
    const aw = ctx.measureText(a).width;
    ctx.fillStyle = "rgba(30,30,30,0.78)";
    ctx.fillText(a, bx + (bw - Math.min(aw, maxTW)) / 2, start + lines.length * lh + 22, maxTW);
  }
  ctx.letterSpacing = "0px";
  const r = 34, lx = pad + r, ly = H - 165;
  if (logo) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(lx, ly, r, 0, Math.PI * 2);
    ctx.clip();
    const s = Math.max(r * 2 / logo.width, r * 2 / logo.height);
    ctx.drawImage(logo, lx - logo.width * s / 2, ly - logo.height * s / 2, logo.width * s, logo.height * s);
    ctx.restore();
  }
  const nx = lx + r + 16;
  ctx.fillStyle = GOLD;
  ctx.font = F(24);
  ctx.letterSpacing = "2px";
  ctx.fillText("VICTOR SIMZ", nx, ly - 4);
  ctx.fillStyle = "rgba(234,234,234,0.5)";
  ctx.font = F(16);
  ctx.letterSpacing = "1px";
  ctx.fillText("HISTORIAN  /  STRATEGIST  /  LEADER", nx, ly + 18);
  ctx.letterSpacing = "0px";
  const iy = H - 90, sz = 40, gap = 12;
  let ix = pad;
  const cx = (x) => x + sz / 2, cy = iy + sz / 2;
  ctx.fillStyle = "#1877F2";
  ctx.beginPath();
  ctx.arc(cx(ix), cy, sz / 2, 0, Math.PI * 2);
  ctx.fill();
  const fS = sz * 0.18, fX = cx(ix) - fS * 0.25, fTop = cy - sz * 0.32;
  ctx.lineWidth = fS;
  ctx.strokeStyle = "#fff";
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(fX, fTop + fS * 0.6);
  ctx.lineTo(fX, cy + sz * 0.28);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(fX + fS * 0.5, fTop + fS * 0.6, fS * 0.5, Math.PI, 0);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(fX - fS * 0.5, cy - sz * 0.04);
  ctx.lineTo(fX + fS * 0.9, cy - sz * 0.04);
  ctx.stroke();
  ix += sz + gap;
  const ig = ctx.createLinearGradient(ix, iy + sz, ix + sz, iy);
  [["0", "#f09433"], ["0.4", "#e6683c"], ["0.65", "#dc2743"], ["0.9", "#cc2366"], ["1", "#bc1888"]].forEach(([o, c]) => ig.addColorStop(Number(o), c));
  ctx.fillStyle = ig;
  roundRect(ctx, ix, iy, sz, sz, sz * 0.22);
  ctx.fill();
  const cb = sz * 0.28, ccx = cx(ix), ccy = iy + sz / 2 + sz * 0.03;
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = sz * 0.075;
  ctx.lineJoin = "round";
  roundRect(ctx, ccx - cb, ccy - cb * 0.75, cb * 2, cb * 1.55, cb * 0.28);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(ccx, ccy + cb * 0.05, cb * 0.42, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(ccx + cb * 0.64, ccy - cb * 0.52, cb * 0.12, 0, Math.PI * 2);
  ctx.fillStyle = "#fff";
  ctx.fill();
  ix += sz + gap;
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.arc(cx(ix), cy, sz / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.save();
  ctx.translate(cx(ix), cy);
  ctx.scale(sz / 24, sz / 24);
  ctx.translate(-12, -12);
  ctx.fillStyle = "#fff";
  ctx.fill(new Path2D("M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"));
  ctx.restore();
  ix += sz + gap;
  ctx.fillStyle = "rgba(234,234,234,0.55)";
  ctx.font = F(17);
  ctx.letterSpacing = "1px";
  ctx.fillText("@VSIMZ1", ix + 4, iy + sz / 2 + 6);
  ctx.letterSpacing = "0px";
}
export {
  drawCard,
  loadImg
};
