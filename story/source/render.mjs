import {
  drawCoverImage,
  drawEmptyPhoto,
  drawPhotoFallback,
  roundedRectPath,
} from './drawing.mjs';
import { fitCandidateName } from './text.mjs';
import { COLORS, STORY, getSlotDefinitions } from './tokens.mjs';
import { validateStoryData } from './validation.mjs';

export class StoryValidationError extends Error {
  constructor(issues) {
    super('Os dados do story são inválidos.');
    this.name = 'StoryValidationError';
    this.issues = issues;
  }
}

function fillRoundedRect(ctx, box, radius, color) {
  ctx.save();
  ctx.fillStyle = color;
  roundedRectPath(ctx, box, radius);
  ctx.fill();
  ctx.restore();
}

function strokeRoundedRect(ctx, box, radius, color, alpha, lineWidth) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.globalAlpha = alpha;
  ctx.lineWidth = lineWidth;
  roundedRectPath(ctx, box, radius);
  ctx.stroke();
  ctx.restore();
}

function drawTrackedText(ctx, text, x, y, tracking) {
  let cursorX = x;
  for (const character of [...text]) {
    ctx.fillText(character, cursorX, y);
    cursorX += ctx.measureText(character).width + tracking;
  }
}

function imageDimensions(image) {
  return {
    width: image?.naturalWidth ?? image?.width,
    height: image?.naturalHeight ?? image?.height,
  };
}

function isDrawableImage(image) {
  const { width, height } = imageDimensions(image);
  return Number.isFinite(width) && width > 0 && Number.isFinite(height) && height > 0;
}

function drawContainedImage(ctx, image, box) {
  const { width, height } = imageDimensions(image);
  if (!Number.isFinite(width) || width <= 0 || !Number.isFinite(height) || height <= 0) {
    throw new TypeError('A logomarca precisa ter dimensões positivas.');
  }

  const scale = Math.min(box.width / width, box.height / height);
  const drawWidth = width * scale;
  const drawHeight = height * scale;
  ctx.drawImage(
    image,
    box.x + (box.width - drawWidth) / 2,
    box.y + (box.height - drawHeight) / 2,
    drawWidth,
    drawHeight,
  );
}

function drawDecorations(ctx) {
  ctx.save();
  ctx.fillStyle = COLORS.yellow;
  ctx.beginPath();
  ctx.arc(1022, 48, 164, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = COLORS.green;
  ctx.beginPath();
  ctx.arc(0, 1712, 54, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawHeader(ctx, logo) {
  const { header } = STORY;
  drawContainedImage(ctx, logo, {
    x: header.logoX,
    y: header.logoY,
    width: header.logoWidth,
    height: header.logoHeight,
  });

  fillRoundedRect(ctx, {
    x: header.yearX,
    y: header.yearY,
    width: header.yearWidth,
    height: header.yearHeight,
  }, 22, COLORS.yellow);

  ctx.save();
  ctx.fillStyle = COLORS.deep;
  ctx.font = '900 42px "Nunito"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('2026', header.yearX + header.yearWidth / 2, header.yearY + header.yearHeight / 2 + 1);
  ctx.restore();
}

async function resolvePhoto(candidate, assets) {
  if (isDrawableImage(candidate.photo)) return candidate.photo;
  if (candidate.photo === null || candidate.photo === undefined) {
    throw new TypeError('O candidato selecionado não possui fotografia.');
  }
  if (typeof assets.resolvePhoto !== 'function') {
    throw new TypeError('A fotografia precisa ser carregada antes da renderização.');
  }
  return assets.resolvePhoto(candidate.photo, candidate);
}

function drawCandidateText(ctx, candidate, cardY) {
  const fitted = fitCandidateName(ctx, candidate.name, {
    maxWidth: STORY.card.textWidth,
    maxLines: 2,
    preferredSize: 42,
    minSize: 30,
    weight: 800,
    family: 'Nunito',
  });

  ctx.save();
  ctx.fillStyle = COLORS.deep;
  ctx.font = `800 ${fitted.fontSize}px "Nunito"`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  const lineHeight = fitted.fontSize * 1.08;
  fitted.lines.forEach((line, index) => {
    ctx.fillText(line, STORY.card.textX, cardY + 102 + index * lineHeight);
  });

  ctx.fillStyle = COLORS.blue;
  ctx.font = '700 23px "Nunito"';
  ctx.fillText(candidate.party, STORY.card.textX, cardY + 184);
  ctx.restore();

  ctx.save();
  ctx.fillStyle = COLORS.deep;
  ctx.font = '900 58px "Nunito"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(
    candidate.number,
    STORY.card.numberX + STORY.card.numberWidth / 2,
    cardY + STORY.card.numberY + STORY.card.numberHeight / 2 + 2,
  );
  ctx.restore();
}

async function drawCandidateCard(ctx, slot, candidate, index, assets) {
  const cardY = STORY.card.firstY + index * (STORY.card.height + STORY.card.gap);
  const cardBox = {
    x: STORY.card.x,
    y: cardY,
    width: STORY.card.width,
    height: STORY.card.height,
  };
  const photoBox = {
    x: STORY.card.x + STORY.card.padding,
    y: cardY + STORY.card.padding,
    width: STORY.card.photoSize,
    height: STORY.card.photoSize,
  };
  const numberBox = {
    x: STORY.card.numberX,
    y: cardY + STORY.card.numberY,
    width: STORY.card.numberWidth,
    height: STORY.card.numberHeight,
  };

  fillRoundedRect(ctx, cardBox, STORY.card.radius, COLORS.white);
  strokeRoundedRect(ctx, cardBox, STORY.card.radius, COLORS.deep, 0.12, 2);

  if (!candidate) {
    drawEmptyPhoto(ctx, photoBox, STORY.card.photoRadius);
  } else {
    try {
      const photo = await resolvePhoto(candidate, assets);
      drawCoverImage(ctx, photo, photoBox, STORY.card.photoRadius);
    } catch {
      drawPhotoFallback(ctx, photoBox, STORY.card.photoRadius);
    }
  }

  ctx.save();
  ctx.fillStyle = COLORS.green;
  ctx.font = '800 22px "Nunito"';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  drawTrackedText(ctx, slot.label, STORY.card.textX, cardY + 47, 1.4);
  ctx.restore();

  fillRoundedRect(ctx, numberBox, STORY.card.numberRadius, COLORS.yellow);
  if (candidate) drawCandidateText(ctx, candidate, cardY);
}

function drawFooter(ctx) {
  const { footer } = STORY;
  ctx.save();
  ctx.fillStyle = COLORS.blue;
  ctx.fillRect(footer.x, footer.y, footer.width, footer.height);
  ctx.fillStyle = COLORS.white;
  ctx.font = '900 25px "Nunito"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('MEUSANTINHO.COM.BR', STORY.width / 2, footer.y + footer.height / 2 + 1);
  ctx.restore();
}

export async function renderStory(ctx, input, assets = {}) {
  const validation = validateStoryData(input);
  if (!validation.ok) throw new StoryValidationError(validation.issues);
  if (!isDrawableImage(assets.logo)) {
    throw new TypeError('Forneça a logomarca horizontal carregada em assets.logo.');
  }

  ctx.fillStyle = COLORS.mist;
  ctx.fillRect(0, 0, STORY.width, STORY.height);
  drawDecorations(ctx);
  drawHeader(ctx, assets.logo);

  const slots = getSlotDefinitions(validation.value.uf);
  for (const [index, slot] of slots.entries()) {
    await drawCandidateCard(ctx, slot, validation.value[slot.key], index, assets);
  }

  drawFooter(ctx);
  return { width: STORY.width, height: STORY.height };
}
