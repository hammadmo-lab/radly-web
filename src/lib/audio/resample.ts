export type ResampleState = { pos: number, last: number | null };

export function createResampleState(): ResampleState {
  return { pos: 0, last: null };
}

export function downsampleTo16k(input: Float32Array, srcRate: number, state: ResampleState): Int16Array {
  if (srcRate === 16000) return floatToInt16(input);

  if (srcRate === 48000) {
    const outLen = Math.floor(input.length / 3);
    const out = new Int16Array(outLen);
    let o = 0;
    for (let i = 0; i + 2 < input.length; i += 3) {
      const averaged = (input[i] + input[i + 1] + input[i + 2]) / 3;
      out[o++] = floatToSample(averaged);
    }
    return out;
  }

  const ratio = srcRate / 16000;
  let pos = state.pos;
  const last = state.last;

  const src = last !== null ? concatFloat32(new Float32Array([last]), input) : input;
  const outLen = Math.floor((src.length - 1 - pos) / ratio) + 1;
  const out = new Int16Array(Math.max(0, outLen));
  let o = 0;

  while (Math.floor(pos) + 1 < src.length && o < out.length) {
    const i = Math.floor(pos);
    const frac = pos - i;
    const sample = src[i] + (src[i + 1] - src[i]) * frac;
    out[o++] = floatToSample(sample);
    pos += ratio;
  }

  state.pos = pos - (src.length - 1);
  state.last = src[src.length - 1];

  return out;
}

function concatFloat32(a: Float32Array, b: Float32Array) {
  const out = new Float32Array(a.length + b.length);
  out.set(a, 0);
  out.set(b, a.length);
  return out;
}

function floatToInt16(f: Float32Array): Int16Array {
  const out = new Int16Array(f.length);
  for (let i = 0; i < f.length; i++) out[i] = floatToSample(f[i]);
  return out;
}

function floatToSample(x: number): number {
  const s = Math.max(-1, Math.min(1, x));
  return s < 0 ? s * 0x8000 : s * 0x7fff;
}