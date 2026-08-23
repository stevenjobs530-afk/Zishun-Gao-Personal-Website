/// <reference types="@webgpu/types" />

import type { OrbParams } from "./brand-orb-preset";
import { writeOrbUniforms } from "./orb-uniforms";
import { orbShaderSource } from "./shader-source";

export type OrbRendererHandle = {
  dispose: () => void;
  setActive: (active: boolean) => void;
};

type OrbRendererOptions = {
  canvas: HTMLCanvasElement;
  getParams: () => OrbParams;
  onError: (error: Error) => void;
  onReady: () => void;
};

export const ORB_MIN_QUALITY_SCALE = 3;
export const ORB_MAX_QUALITY_SCALE = 4;

export function getOrbQualityScale(devicePixelRatio: number): number {
  return Math.min(
    ORB_MAX_QUALITY_SCALE,
    Math.max(ORB_MIN_QUALITY_SCALE, devicePixelRatio * 2),
  );
}

export function createOrbRenderer({
  canvas,
  getParams,
  onError,
  onReady,
}: OrbRendererOptions): OrbRendererHandle {
  let disposed = false;
  let active = true;
  let animationFrame = 0;
  let device: GPUDevice | null = null;
  let readyNotified = false;
  let failed = false;
  let startedAt = performance.now();
  let elapsedBeforePause = 0;

  function fail(reason: unknown = new Error("Orb renderer failed")): void {
    if (disposed || failed) return;
    failed = true;
    cancelAnimationFrame(animationFrame);
    device?.destroy();
    onError(reason instanceof Error ? reason : new Error(String(reason)));
  }

  function schedule(): void {
    if (!disposed && !failed && active && !animationFrame) {
      animationFrame = requestAnimationFrame(frame);
    }
  }

  function resize(): void {
    const qualityScale = getOrbQualityScale(window.devicePixelRatio || 1);
    const width = Math.max(1, Math.floor(canvas.clientWidth * qualityScale));
    const height = Math.max(1, Math.floor(canvas.clientHeight * qualityScale));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
  }

  let renderFrame: ((now: number) => void) | null = null;
  function frame(now: number): void {
    animationFrame = 0;
    renderFrame?.(now);
  }

  async function start(): Promise<void> {
    if (!navigator.gpu) throw new Error("WebGPU unavailable");
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) throw new Error("WebGPU adapter unavailable");
    device = await adapter.requestDevice();
    if (disposed) {
      device.destroy();
      return;
    }

    const context = canvas.getContext("webgpu");
    if (!context) throw new Error("WebGPU canvas unavailable");
    const format = navigator.gpu.getPreferredCanvasFormat();
    context.configure({ device, format, alphaMode: "premultiplied" });

    const shader = device.createShaderModule({
      label: "zishun-brand-siri-orb",
      code: orbShaderSource,
    });
    const compilation = await shader.getCompilationInfo();
    const compilationErrors = compilation.messages.filter((message) => message.type === "error");
    if (compilationErrors.length > 0) {
      throw new Error(compilationErrors.map((message) => message.message).join("\n"));
    }

    const pipeline = device.createRenderPipeline({
      label: "zishun-brand-siri-orb-pipeline",
      layout: "auto",
      vertex: { module: shader, entryPoint: "vs_main" },
      fragment: { module: shader, entryPoint: "fs_main", targets: [{ format }] },
      primitive: { topology: "triangle-list" },
    });
    const values = new Float32Array(128);
    const uniformBuffer = device.createBuffer({
      size: values.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    const bindGroup = device.createBindGroup({
      layout: pipeline.getBindGroupLayout(0),
      entries: [{ binding: 0, resource: { buffer: uniformBuffer } }],
    });

    device.lost.then(fail);
    device.addEventListener("uncapturederror", (event) => {
      event.preventDefault();
      fail();
    });

    renderFrame = (now) => {
      if (disposed || failed || !active || !device) return;
      try {
        resize();
        const time = elapsedBeforePause + (now - startedAt) / 1000;
        writeOrbUniforms(values, canvas.width, canvas.height, time, getParams());
        device.queue.writeBuffer(uniformBuffer, 0, values);
        const encoder = device.createCommandEncoder();
        const pass = encoder.beginRenderPass({
          colorAttachments: [{
            view: context.getCurrentTexture().createView(),
            clearValue: { r: 0, g: 0, b: 0, a: 0 },
            loadOp: "clear",
            storeOp: "store",
          }],
        });
        pass.setPipeline(pipeline);
        pass.setBindGroup(0, bindGroup);
        pass.draw(3, 1, 0, 0);
        pass.end();
        device.queue.submit([encoder.finish()]);
        if (!readyNotified) {
          readyNotified = true;
          onReady();
        }
        schedule();
      } catch {
        fail();
      }
    };
    schedule();
  }

  start().catch(fail);

  return {
    setActive(nextActive) {
      if (active === nextActive || disposed || failed) return;
      active = nextActive;
      if (active) {
        startedAt = performance.now();
        schedule();
      } else {
        elapsedBeforePause += (performance.now() - startedAt) / 1000;
        cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      }
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(animationFrame);
      device?.destroy();
    },
  };
}
