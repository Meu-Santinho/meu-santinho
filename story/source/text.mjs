const DEFAULTS = Object.freeze({
  maxWidth: 500,
  maxLines: 2,
  preferredSize: 42,
  minSize: 30,
  weight: 800,
  family: 'Nunito',
});

function setMeasurementFont(ctx, { weight, fontSize, family }) {
  ctx.font = `${weight} ${fontSize}px "${family}"`;
}

function wrapWords(ctx, text, maxWidth) {
  const lines = [];
  let current = '';

  for (const word of text.split(' ')) {
    const candidate = current ? `${current} ${word}` : word;
    if (current && ctx.measureText(candidate).width > maxWidth) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }

  if (current) lines.push(current);
  return lines;
}

function truncateToWidth(ctx, text, maxWidth) {
  const codePoints = [...text];
  if (ctx.measureText(text).width <= maxWidth) return text;

  while (codePoints.length > 0) {
    const candidate = `${codePoints.join('').trimEnd()}…`;
    if (ctx.measureText(candidate).width <= maxWidth) return candidate;
    codePoints.pop();
  }

  return ctx.measureText('…').width <= maxWidth ? '…' : '';
}

export function fitCandidateName(ctx, name, options = {}) {
  const settings = { ...DEFAULTS, ...options };
  const text = typeof name === 'string' ? name.trim().replace(/\s+/gu, ' ') : '';
  if (!text) {
    return { lines: [], fontSize: settings.preferredSize, truncated: false };
  }

  const previousFont = ctx.font;
  try {
    for (
      let fontSize = settings.preferredSize;
      fontSize >= settings.minSize;
      fontSize -= 1
    ) {
      setMeasurementFont(ctx, { ...settings, fontSize });
      const lines = wrapWords(ctx, text, settings.maxWidth);
      const fits = lines.length <= settings.maxLines
        && lines.every((line) => ctx.measureText(line).width <= settings.maxWidth);

      if (fits) return { lines, fontSize, truncated: false };
    }

    setMeasurementFont(ctx, { ...settings, fontSize: settings.minSize });
    const wrapped = wrapWords(ctx, text, settings.maxWidth);
    const visible = wrapped.slice(0, settings.maxLines);
    const overflow = wrapped.slice(settings.maxLines - 1).join(' ');

    if (visible.length === 0) visible.push('');
    if (wrapped.length >= settings.maxLines) {
      visible[settings.maxLines - 1] = overflow;
    }

    const lines = visible
      .slice(0, settings.maxLines)
      .map((line) => truncateToWidth(ctx, line, settings.maxWidth));

    return { lines, fontSize: settings.minSize, truncated: true };
  } finally {
    ctx.font = previousFont;
  }
}
