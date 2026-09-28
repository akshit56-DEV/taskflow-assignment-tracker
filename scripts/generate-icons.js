import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Simple CRC32 implementation for PNG chunks
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) {
      c = 0xedb88320 ^ (c >>> 1);
    } else {
      c = c >>> 1;
    }
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createPngChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  const toCrc = Buffer.concat([typeBuf, data]);
  crcBuf.writeUInt32BE(crc32(toCrc), 0);

  return Buffer.concat([length, typeBuf, data, crcBuf]);
}

function createPng(width, height, getPixelRGBA) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // 8 bit depth
  ihdrData.writeUInt8(6, 9); // RGBA color type
  ihdrData.writeUInt8(0, 10); // compression
  ihdrData.writeUInt8(0, 11); // filter
  ihdrData.writeUInt8(0, 12); // interlace

  const ihdrChunk = createPngChunk('IHDR', ihdrData);

  // Scanlines
  const scanlines = [];
  for (let y = 0; y < height; y++) {
    const row = Buffer.alloc(1 + width * 4);
    row.writeUInt8(0, 0); // filter: None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixelRGBA(x, y, width, height);
      const offset = 1 + x * 4;
      row.writeUInt8(r, offset);
      row.writeUInt8(g, offset + 1);
      row.writeUInt8(b, offset + 2);
      row.writeUInt8(a, offset + 3);
    }
    scanlines.push(row);
  }

  const rawData = Buffer.concat(scanlines);
  const compressed = zlib.deflateSync(rawData);
  const idatChunk = createPngChunk('IDAT', compressed);
  const iendChunk = createPngChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Check distance to line segment
function distToSegment(px, py, x1, y1, x2, y2) {
  const l2 = (x2 - x1) ** 2 + (y2 - y1) ** 2;
  if (l2 === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
}

// Generate icon pixel renderer
function renderTaskFlowIcon(isMaskable = false) {
  return (x, y, width, height) => {
    // normalized coordinates [0, 1]
    const u = x / width;
    const v = y / height;

    // Background shape
    const cornerRadius = isMaskable ? 0 : 0.22; // maskables should fill entire canvas
    let inCard = true;

    if (!isMaskable) {
      const r = cornerRadius;
      const nx = Math.abs(u - 0.5) * 2;
      const ny = Math.abs(v - 0.5) * 2;
      const limit = 1 - r * 2;
      if (nx > limit && ny > limit) {
        const cx = (nx - limit) / (r * 2);
        const cy = (ny - limit) / (r * 2);
        if (cx * cx + cy * cy > 1) {
          inCard = false;
        }
      }
    }

    if (!inCard) {
      return [0, 0, 0, 0]; // Transparent
    }

    // Gradient background: #2563EB (37, 99, 235) to #4338CA (67, 56, 202)
    const t = (u + v) * 0.5;
    let bgR = Math.round(37 + (67 - 37) * t);
    let bgG = Math.round(99 + (56 - 99) * t);
    let bgB = Math.round(235 + (202 - 235) * t);

    // Subtle ambient glow in upper-left
    const glowDist = Math.hypot(u - 0.25, v - 0.25);
    if (glowDist < 0.6) {
      const glowFactor = (1 - glowDist / 0.6) * 0.25;
      bgR = Math.min(255, bgR + Math.round(96 * glowFactor));
      bgG = Math.min(255, bgG + Math.round(165 * glowFactor));
      bgB = Math.min(255, bgB + Math.round(250 * glowFactor));
    }

    // Checkmark geometry
    // Scale coordinates to [0, 32] space matching the SVG viewBox
    const scale = isMaskable ? 0.7 : 0.85;
    const centerOffsetX = (1 - scale) * 0.5;
    const centerOffsetY = (1 - scale) * 0.5;
    const sx = ((u - centerOffsetX) / scale) * 32;
    const sy = ((v - centerOffsetY) / scale) * 32;

    // Checkmark path: (9, 16.5) -> (14, 21.5) -> (23, 10.5)
    const strokeWidth = 3.0;
    const d1 = distToSegment(sx, sy, 9, 16.5, 14, 21.5);
    const d2 = distToSegment(sx, sy, 14, 21.5, 23, 10.5);
    const minCheckDist = Math.min(d1, d2);

    // Sparkle circle: cx=23, cy=9, r=3
    const sparkleDist = Math.hypot(sx - 23, sy - 9);

    // Render checkmark with anti-aliasing
    const halfStroke = strokeWidth * 0.5;
    if (minCheckDist < halfStroke + 0.6) {
      const edge = Math.max(0, Math.min(1, (halfStroke + 0.6 - minCheckDist) / 0.6));
      // White checkmark
      const r = Math.round(255 * edge + bgR * (1 - edge));
      const g = Math.round(255 * edge + bgG * (1 - edge));
      const b = Math.round(255 * edge + bgB * (1 - edge));
      return [r, g, b, 255];
    }

    // Render sparkle circle (#60A5FA = 96, 165, 250)
    if (sparkleDist < 3.2) {
      const edge = Math.max(0, Math.min(1, (3.2 - sparkleDist) / 0.6));
      const r = Math.round(96 * edge + bgR * (1 - edge));
      const g = Math.round(165 * edge + bgG * (1 - edge));
      const b = Math.round(250 * edge + bgB * (1 - edge));
      return [r, g, b, 255];
    }

    return [bgR, bgG, bgB, 255];
  };
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate PWA 192x192
console.log('Generating 192x192 icon...');
const pwa192 = createPng(192, 192, renderTaskFlowIcon(false));
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), pwa192);

// Generate PWA 512x512
console.log('Generating 512x512 icon...');
const pwa512 = createPng(512, 512, renderTaskFlowIcon(false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), pwa512);

// Generate Maskable 512x512
console.log('Generating maskable 512x512 icon...');
const maskable512 = createPng(512, 512, renderTaskFlowIcon(true));
fs.writeFileSync(path.join(publicDir, 'maskable-icon-512x512.png'), maskable512);

// Generate Apple Touch Icon 180x180
console.log('Generating apple-touch-icon 180x180...');
const appleTouch = createPng(180, 180, renderTaskFlowIcon(false));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleTouch);

// Generate Favicon 64x64
console.log('Generating favicon...');
const favicon64 = createPng(64, 64, renderTaskFlowIcon(false));
fs.writeFileSync(path.join(publicDir, 'favicon-64x64.png'), favicon64);

// Create favicon.ico (wrap PNG 64x64 in ICO header)
const icoHeader = Buffer.alloc(6);
icoHeader.writeUInt16LE(0, 0); // Reserved
icoHeader.writeUInt16LE(1, 2); // Type: 1 = ICO
icoHeader.writeUInt16LE(1, 4); // 1 Image

const icoDirectory = Buffer.alloc(16);
icoDirectory.writeUInt8(64, 0); // Width 64
icoDirectory.writeUInt8(64, 1); // Height 64
icoDirectory.writeUInt8(0, 2);  // Colors in palette
icoDirectory.writeUInt8(0, 3);  // Reserved
icoDirectory.writeUInt16LE(1, 4); // Color planes
icoDirectory.writeUInt16LE(32, 6); // Bits per pixel
icoDirectory.writeUInt32LE(favicon64.length, 8); // Size of image data
icoDirectory.writeUInt32LE(22, 12); // Offset to image data (6 + 16 = 22)

const icoFile = Buffer.concat([icoHeader, icoDirectory, favicon64]);
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoFile);

console.log('All PWA icons generated successfully!');
