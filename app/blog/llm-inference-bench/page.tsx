import type { Metadata } from "next"
import Link from "next/link"
import { BackButton } from "@/components/back-button"



export const metadata: Metadata = {
  title: "What I Learned Benchmarking FP16 vs INT4 LLM Inference with vLLM | Bereket Lemma",
  description:
    "A practical learning story on benchmarking Mistral-7B FP16 vs AWQ-Marlin INT4 with vLLM, including setup, results, and the awq_marlin mistake that changed everything.",
}

export default function LlmInferenceBenchPost() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24">

      <BackButton
        section="posts"
        label="back to posts"
        className="mb-10 inline-flex items-center gap-2 rounded border border-border/60 px-3 py-1.5 font-mono text-xs text-muted-foreground hover:border-accent hover:text-accent transition-all"
      />

      <div className="mb-8">
        <div className="mb-3 flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="rounded border border-border/60 px-2 py-0.5 font-mono text-xs text-muted-foreground">AI</span>
          <span className="rounded border border-border/60 px-2 py-0.5 font-mono text-xs text-muted-foreground">Benchmarking</span>
          <span className="rounded border border-border/60 px-2 py-0.5 font-mono text-xs text-muted-foreground">Systems</span>
          <span className="font-mono text-xs text-muted-foreground sm:ml-auto">April 6, 2026 · 12 min read</span>
        </div>
        <h1 className="font-syne text-3xl font-bold text-foreground">
          What I Learned Benchmarking FP16 vs INT4 LLM Inference with vLLM
        </h1>
      </div>

      <div className="mb-10 h-px w-full bg-border/40" />

      <div className="flex flex-col gap-6 text-sm leading-relaxed text-muted-foreground">
        <p>
          Most quantization posts say INT4 is faster and cheaper, but few show exactly how much faster on real hardware.
          I wanted to answer one question for myself:
          <span className="text-foreground"> is INT4 actually faster than FP16 in production, or is that just something everyone repeats?</span>
        </p>

        <p>
          So I built <span className="text-accent">llm-inference-bench</span>, ran Mistral-7B in FP16 and INT4 on an
          NVIDIA L4, and measured throughput, latency, and scaling across batch sizes and sequence lengths.
          The result was useful, but the most important lesson was unexpected.
        </p>

        <p>
          Project: {" "}
          <a
            href="https://github.com/bereketlemma/llm-inference-bench"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent underline underline-offset-4"
          >
            github.com/bereketlemma/llm-inference-bench
          </a>
          <br />
          Dashboard: {" "}
          <a
            href="https://bench.bereketlemma.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent underline underline-offset-4"
          >
            bench.bereketlemma.com
          </a>
        </p>

        <h2 className="mt-2 font-syne text-lg font-bold text-foreground">Why This Question Matters</h2>

        <p>
          This is not just a benchmark vanity metric. The answer affects real production tradeoffs.
        </p>

        <ul className="list-disc list-inside flex flex-col gap-2 pl-2">
          <li>Inference cost: better throughput means fewer GPUs for the same traffic.</li>
          <li>User experience: lower tail latency means fewer slow responses.</li>
          <li>Memory limits: quantization can let larger models fit safely in VRAM.</li>
          <li>Capacity planning: higher requests per second on the same hardware budget.</li>
        </ul>

        <h2 className="mt-2 font-syne text-lg font-bold text-foreground">Concepts, Quickly</h2>

        <p>
          <span className="text-foreground">FP16</span>: 16-bit floating point weights, common baseline for fast GPU inference.
        </p>

        <p>
          <span className="text-foreground">INT4 quantization</span>: compresses weights to 4-bit integers, reducing memory bandwidth and often improving throughput.
        </p>

        <p>
          <span className="text-foreground">AWQ (Activation-aware Weight Quantization)</span>: a method for preserving quality while quantizing.
        </p>

        <p>
          <span className="text-foreground">vLLM</span>: an inference engine optimized for high-throughput serving with strong batching behavior.
        </p>

        <p>
          <span className="text-foreground">Throughput vs latency</span>: throughput tells you system capacity, latency tells you what each user feels.
          You need both.
        </p>

        <p>
          <span className="text-foreground">Why P99 matters</span>: averages hide bad tails; P99 captures slow requests that hurt production experience.
        </p>

        <h2 className="mt-2 font-syne text-lg font-bold text-foreground">How I Ran the Benchmark</h2>

        <p>
          I benchmarked Mistral-7B on an NVIDIA L4 (24GB) across 18 configurations.
        </p>

        <ul className="list-disc list-inside flex flex-col gap-2 pl-2">
          <li>FP16 model: mistralai/Mistral-7B-v0.1</li>
          <li>INT4 model: TheBloke/Mistral-7B-v0.1-AWQ</li>
          <li>Engine: vLLM 0.16.0</li>
          <li>Batch sizes: 1, 4, 8</li>
          <li>Sequence lengths: 128, 256, 512</li>
          <li>Warmup: 3 iterations</li>
          <li>Measurement: 10 runs per configuration</li>
          <li>Decoding: greedy, temperature = 0.0 for reproducibility</li>
          <li>Region/hardware: GCP us-west1-a, NVIDIA L4 24GB</li>
        </ul>

        <h2 className="mt-2 font-syne text-lg font-bold text-foreground">The Graphs That Tell the Story</h2>

        <p>
          <span className="text-foreground">Graph 1: Average throughput, FP16 vs INT4</span><br />
          Caption: INT4 AWQ-Marlin delivered the headline gain quickly and consistently across the sweep.
        </p>

        <p>
          <span className="text-foreground">Graph 2: P50 and P99 latency comparison</span><br />
          Caption: INT4 improves not only average speed, but also tail behavior that users actually notice.
        </p>

        <p>
          <span className="text-foreground">Graph 3: Throughput scaling by batch size</span><br />
          Caption: quantization benefits grow with larger batch sizes where memory pressure rises.
        </p>

        <p>
          <span className="text-foreground">Graph 4: Extreme case (batch=8, tokens=512)</span><br />
          Caption: FP16 shows a clear latency wall while INT4 keeps much higher usable throughput.
        </p>

        <p>
          You can explore these views live on {" "}
          <a
            href="https://bench.bereketlemma.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent underline underline-offset-4"
          >
            bench.bereketlemma.com
          </a>
          .
        </p>

        <h2 className="mt-2 font-syne text-lg font-bold text-foreground">Main Findings</h2>

        <div className="rounded border border-border/40 bg-surface/40 p-4 font-mono text-xs">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div>Throughput speedup (avg)</div>
            <div className="text-foreground">3.35x</div>
            <div>P99 latency reduction (avg)</div>
            <div className="text-foreground">37.5%</div>
            <div>Peak throughput (INT4, BS=8)</div>
            <div className="text-foreground">452.3 tok/s</div>
            <div>Peak throughput (FP16, BS=8)</div>
            <div className="text-foreground">133.9 tok/s</div>
          </div>
        </div>

        <p>
          INT4 AWQ-Marlin was clearly faster on average, but the improvement was not uniform. The gap widened under
          heavier load, where FP16 hit stronger memory and latency pressure.
        </p>

        <p>
          One practical signal from this run: throughput alone can look great while latency tails still hurt.
          If you only optimize tokens/sec, you can still ship a bad user experience.
        </p>

        <h2 className="mt-2 font-syne text-lg font-bold text-foreground">What Surprised Me Most</h2>

        <p>
          Before this project, I assumed quantization speedups were mostly automatic. I thought loading an AWQ model
          into vLLM would naturally take the best path.
        </p>

        <p>
          That was wrong.
        </p>

        <p>
          Standard AWQ was not enough in my tests. The real unlock was explicitly setting
          <span className="font-mono text-foreground"> quantization=&quot;awq_marlin&quot;</span>.
          Without that, performance can fall back to a slower path even if logs suggest Marlin is available.
        </p>

        <p>
          That single configuration detail changed the conclusion from "INT4 is mixed" to "INT4 is clearly better here."
        </p>

        <h2 className="mt-2 font-syne text-lg font-bold text-foreground">Representative Rows</h2>

        <div className="overflow-x-auto rounded border border-border/40">
          <table className="w-full min-w-[640px] border-collapse font-mono text-xs">
            <thead className="bg-surface/50 text-foreground">
              <tr>
                <th className="border-b border-border/40 px-3 py-2 text-left" colSpan={6}>FP16 Baseline</th>
              </tr>
              <tr>
                <th className="border-b border-border/40 px-3 py-2 text-left">Batch</th>
                <th className="border-b border-border/40 px-3 py-2 text-left">Tokens</th>
                <th className="border-b border-border/40 px-3 py-2 text-left">P50 (ms)</th>
                <th className="border-b border-border/40 px-3 py-2 text-left">P99 (ms)</th>
                <th className="border-b border-border/40 px-3 py-2 text-left">Tok/s</th>
                <th className="border-b border-border/40 px-3 py-2 text-left">Req/s</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="px-3 py-2">1</td><td className="px-3 py-2">128</td><td className="px-3 py-2">3,587</td><td className="px-3 py-2">3,590</td><td className="px-3 py-2">17.9</td><td className="px-3 py-2">1.00</td></tr>
              <tr><td className="px-3 py-2">4</td><td className="px-3 py-2">256</td><td className="px-3 py-2">3,740</td><td className="px-3 py-2">3,760</td><td className="px-3 py-2">68.3</td><td className="px-3 py-2">1.07</td></tr>
              <tr><td className="px-3 py-2">8</td><td className="px-3 py-2">512</td><td className="px-3 py-2">30,590</td><td className="px-3 py-2">30,600</td><td className="px-3 py-2">133.9</td><td className="px-3 py-2">0.26</td></tr>
            </tbody>
          </table>
        </div>

        <div className="overflow-x-auto rounded border border-border/40">
          <table className="w-full min-w-[640px] border-collapse font-mono text-xs">
            <thead className="bg-surface/50 text-foreground">
              <tr>
                <th className="border-b border-border/40 px-3 py-2 text-left" colSpan={6}>INT4 AWQ-Marlin</th>
              </tr>
              <tr>
                <th className="border-b border-border/40 px-3 py-2 text-left">Batch</th>
                <th className="border-b border-border/40 px-3 py-2 text-left">Tokens</th>
                <th className="border-b border-border/40 px-3 py-2 text-left">P50 (ms)</th>
                <th className="border-b border-border/40 px-3 py-2 text-left">P99 (ms)</th>
                <th className="border-b border-border/40 px-3 py-2 text-left">Tok/s</th>
                <th className="border-b border-border/40 px-3 py-2 text-left">Req/s</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="px-3 py-2">1</td><td className="px-3 py-2">128</td><td className="px-3 py-2">2,084</td><td className="px-3 py-2">2,087</td><td className="px-3 py-2">61.4</td><td className="px-3 py-2">0.48</td></tr>
              <tr><td className="px-3 py-2">4</td><td className="px-3 py-2">256</td><td className="px-3 py-2">4,394</td><td className="px-3 py-2">4,395</td><td className="px-3 py-2">233.1</td><td className="px-3 py-2">0.91</td></tr>
              <tr><td className="px-3 py-2">8</td><td className="px-3 py-2">512</td><td className="px-3 py-2">9,545</td><td className="px-3 py-2">9,548</td><td className="px-3 py-2">429.1</td><td className="px-3 py-2">0.84</td></tr>
            </tbody>
          </table>
        </div>

        <h2 className="mt-2 font-syne text-lg font-bold text-foreground">What This Taught Me About Inference Optimization</h2>

        <p>
          Quantization choice, kernel path, and benchmark methodology are tightly coupled.
          You cannot trust one without checking the others.
        </p>

        <p>
          My checklist now is simple:
        </p>

        <ul className="list-disc list-inside flex flex-col gap-2 pl-2">
          <li>Always evaluate throughput and P99 together.</li>
          <li>Test the exact kernel path, not just model format labels.</li>
          <li>Sweep batch size and sequence length, not one default config.</li>
          <li>Use warmups and multiple measured runs for stable numbers.</li>
        </ul>

        <h2 className="mt-2 font-syne text-lg font-bold text-foreground">How to Repeat This on Your Hardware</h2>

        <p>
          If you want to reproduce this quickly, start with one GPU and a small matrix, then scale up.
        </p>

        <pre className="overflow-x-auto rounded border border-border/40 bg-surface/40 p-4 font-mono text-xs text-muted-foreground">
{`git clone https://github.com/bereketlemma/llm-inference-bench.git
cd llm-inference-bench
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# quick GPU sanity check (small model)
python main.py`}
        </pre>

        <p>
          For production-style runs, switch to:
        </p>

        <pre className="overflow-x-auto rounded border border-border/40 bg-surface/40 p-4 font-mono text-xs text-muted-foreground">
{`config = BenchmarkConfig.production_config()`}
        </pre>

        <p>
          Then run your sweep and inspect both throughput and P99.
          If AWQ is not faster, check kernel configuration first, then batch/sequence settings.
        </p>

        <p>
          Quantization is usually worth it when you are memory-bound, throughput-constrained, or trying to serve higher
          concurrency on fixed hardware. It may matter less if your workload is lightly loaded and already below latency targets.
        </p>

        <h2 className="mt-2 font-syne text-lg font-bold text-foreground">Closing Thought</h2>

        <p>
          This project taught me that inference optimization is not just about picking a quantized checkpoint.
          It is about verifying the actual execution path. In my case, the difference between
          <span className="font-mono text-foreground"> awq</span> and
          <span className="font-mono text-foreground"> awq_marlin</span> completely changed the result.
        </p>

        <p>
          If you try this on a different GPU or model family, I would love to compare results. Reach out through my {" "}
          <Link href="/contact" className="text-accent underline underline-offset-4">contact page</Link>.
        </p>

        <p className="mt-1 text-base text-foreground/70">𝒷𝑒𝓇𝑒𝓀𝑒𝓉 𝓁𝑒𝓂𝓂𝒶</p>
      </div>
    </main>
  )
}