import { COLORS } from './tokens.mjs';

function positiveFinite(value) {
  return Number.isFinite(value) && value > 0;
}

export function roundedRectPath(ctx, { x, y, width, height }, radius) {
  const r = Math.max(0, Math.min(radius, width / 2, height / 2));
  ctx.beginPath();

  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, width, height, r);
    return;
  }

  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export function calculateCoverCrop(sourceWidth, sourceHeight, width, height) {
  if (![sourceWidth, sourceHeight, width, height].every(positiveFinite)) {
    throw new TypeError('A imagem e o destino precisam ter dimensões positivas.');
  }

  const sourceRatio = sourceWidth / sourceHeight;
  const destinationRatio = width / height;

  if (sourceRatio > destinationRatio) {
    const sw = sourceHeight * destinationRatio;
    return { sx: (sourceWidth - sw) / 2, sy: 0, sw, sh: sourceHeight };
  }

  const sh = sourceWidth / destinationRatio;
  return { sx: 0, sy: (sourceHeight - sh) / 2, sw: sourceWidth, sh };
}

export function drawCoverImage(ctx, image, box, radius) {
  const sourceWidth = image?.naturalWidth ?? image?.width;
  const sourceHeight = image?.naturalHeight ?? image?.height;
  const crop = calculateCoverCrop(sourceWidth, sourceHeight, box.width, box.height);

  ctx.save();
  roundedRectPath(ctx, box, radius);
  ctx.clip();
  ctx.drawImage(
    image,
    crop.sx,
    crop.sy,
    crop.sw,
    crop.sh,
    box.x,
    box.y,
    box.width,
    box.height,
  );
  ctx.restore();
}

export function drawEmptyPhoto(ctx, box, radius) {
  ctx.save();
  ctx.fillStyle = COLORS.white;
  roundedRectPath(ctx, box, radius);
  ctx.fill();
  ctx.globalAlpha = 0.14;
  ctx.strokeStyle = COLORS.deep;
  ctx.lineWidth = 2;
  roundedRectPath(ctx, box, radius);
  ctx.stroke();
  ctx.restore();
}

export function drawPhotoFallback(ctx, box, radius) {
  drawEmptyPhoto(ctx, box, radius);

  ctx.save();
  roundedRectPath(ctx, box, radius);
  ctx.clip();
  ctx.fillStyle = COLORS.deep;
  ctx.globalAlpha = 0.16;

  const centerX = box.x + box.width / 2;
  ctx.beginPath();
  ctx.arc(centerX, box.y + box.height * 0.38, box.width * 0.17, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(
    centerX,
    box.y + box.height * 0.88,
    box.width * 0.34,
    box.height * 0.25,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.restore();
}
