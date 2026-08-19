const fs = require('fs');
const path = require('path');

const pngPath = path.join(__dirname, '../public/logo-circle.png');
const icoPath = path.join(__dirname, '../public/app.ico');

if (fs.existsSync(pngPath)) {
  const pngBuffer = fs.readFileSync(pngPath);
  const header = Buffer.alloc(22);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // Type 1 = ICO
  header.writeUInt16LE(1, 4); // 1 image count
  header.writeUInt8(0, 6); // Width (0 = 256)
  header.writeUInt8(0, 7); // Height (0 = 256)
  header.writeUInt8(0, 8); // Color count
  header.writeUInt8(0, 9); // Reserved
  header.writeUInt16LE(1, 10); // Color planes
  header.writeUInt16LE(32, 12); // Bits per pixel
  header.writeUInt32LE(pngBuffer.length, 14); // Image data size
  header.writeUInt32LE(22, 18); // Offset to image data

  const icoBuffer = Buffer.concat([header, pngBuffer]);
  fs.writeFileSync(icoPath, icoBuffer);
  console.log(`Successfully generated Windows ICO icon at: ${icoPath}`);
}
