class PCMWorklet extends AudioWorkletProcessor {
  constructor() {
    super();
    this.frameSize = Math.round(sampleRate * 0.02); // 20 ms
    this.buf = new Float32Array(0);
  }
  process(inputs) {
    const ch0 = inputs?.[0]?.[0];
    if (!ch0) return true;

    const merged = new Float32Array(this.buf.length + ch0.length);
    merged.set(this.buf, 0);
    merged.set(ch0, this.buf.length);
    let offset = 0;

    while (merged.length - offset >= this.frameSize) {
      const slice = merged.subarray(offset, offset + this.frameSize);
      this.port.postMessage(slice, [slice.buffer]);
      offset += this.frameSize;
    }
    this.buf = merged.subarray(offset);
    return true;
  }
}
registerProcessor('pcm-worklet', PCMWorklet);