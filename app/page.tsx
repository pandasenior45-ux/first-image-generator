 "use client";

import { useMemo, useState } from "react";
import { Download, Sparkles, WandSparkles, ImagePlus, LoaderCircle, RefreshCw, Image as ImageIcon } from "lucide-react";

type Ratio = "square" | "portrait" | "landscape";
const samples = [
  "A tiny cozy bookstore inside an old tree, warm golden lights glowing through round windows, magical forest at dusk, highly detailed storybook illustration",
  "A cinematic editorial photograph of a red vintage sports car on a coastal road at sunset, dramatic composition, realistic reflections, premium automotive campaign",
  "A majestic white tiger walking through misty bamboo forest after rain, cinematic natural lighting, ultra-detailed wildlife photography",
  "A futuristic glass house on a cliff above turquoise ocean, lush tropical plants, bright summer sunlight, architectural visualization",
  "A dreamy floating island with waterfalls pouring into clouds, pastel sunrise, whimsical fantasy concept art",
  "A delicious close-up food photograph of a stack of fluffy pancakes with strawberries, blueberries and maple syrup, soft studio lighting"
];

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [ratio, setRatio] = useState<Ratio>("square");
  const [image, setImage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const dimensions = useMemo(() => ({
    square: { width: 1024, height: 1024, label: "1:1" },
    portrait: { width: 768, height: 1365, label: "9:16" },
    landscape: { width: 1365, height: 768, label: "16:9" }
  }[ratio]), [ratio]);

  function surprise() {
    const pick = samples[Math.floor(Math.random() * samples.length)];
    setPrompt(pick);
    setError("");
    setNotice("A fresh idea is ready. Make it yours or generate it!");
  }

  async function cropToRatio(dataUrl: string, targetW: number, targetH: number) {
    const img = new window.Image();
    img.src = dataUrl;
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Could not prepare the generated image."));
    });
    const targetRatio = targetW / targetH;
    const sourceRatio = img.width / img.height;
    let sx = 0, sy = 0, sw = img.width, sh = img.height;
    if (sourceRatio > targetRatio) {
      sw = img.height * targetRatio;
      sx = (img.width - sw) / 2;
    } else {
      sh = img.width / targetRatio;
      sy = (img.height - sh) / 2;
    }
    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Your browser could not prepare the image.");
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetW, targetH);
    return canvas.toDataURL("image/png");
  }

  async function generate() {
    if (!prompt.trim()) {
      setError("Please write a prompt first, or try Surprise Me.");
      return;
    }
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Image generation failed. Please try again.");
      const finalImage = await cropToRatio(data.image, dimensions.width, dimensions.height);
      setImage(finalImage);
      setNotice("Your image is ready.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  function download() {
    if (!image) return;
    const link = document.createElement("a");
    link.href = image;
    link.download = `pixelforge-${ratio}-${Date.now()}.png`;
    link.click();
  }

  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="brand" href="#"><span className="brand-mark"><Sparkles size={19}/></span><span>pixel<span className="brand-accent">forge</span></span></a>
        <div className="top-pill"><span className="live-dot"/> POWERED BY CLOUDFLARE AI</div>
      </header>

      <section className="hero">
        <div className="eyebrow"><span className="eyebrow-line"/> YOUR IDEAS, VISUALLY UNLIMITED</div>
        <h1>Imagine it.<br/><span>Bring it to life.</span></h1>
        <p className="hero-copy">Turn your words into stunning visuals. Describe what you imagine, choose your canvas, and let AI do the magic.</p>
      </section>

      <section className="studio">
        <div className="studio-head">
          <div><div className="section-kicker">THE CREATIVE STUDIO</div><h2>Create something amazing</h2></div>
          <div className="model-chip"><span className="model-spark">✦</span> FLUX.1 SCHNELL</div>
        </div>

        <div className="workspace">
          <div className="controls">
            <div className="field-head"><label htmlFor="prompt">YOUR PROMPT</label><span>{prompt.length}/2048</span></div>
            <textarea id="prompt" maxLength={2048} value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="A cinematic photograph of a peaceful Japanese-inspired garden, soft morning sunlight filtering through maple trees, a small stone bridge over a koi pond..." />
            <button className="surprise-btn" onClick={surprise} type="button"><WandSparkles size={16}/> Surprise me <span>↗</span></button>

            <div className="ratio-heading"><label>ASPECT RATIO</label><span>Choose your canvas</span></div>
            <div className="ratio-options">
              <button type="button" className={`ratio-option ${ratio === "square" ? "selected" : ""}`} onClick={() => setRatio("square")}><span className="ratio-icon square-icon"/><span><b>Square</b><small>1:1</small></span></button>
              <button type="button" className={`ratio-option ${ratio === "portrait" ? "selected" : ""}`} onClick={() => setRatio("portrait")}><span className="ratio-icon portrait-icon"/><span><b>Portrait</b><small>9:16 · Shorts</small></span></button>
              <button type="button" className={`ratio-option ${ratio === "landscape" ? "selected" : ""}`} onClick={() => setRatio("landscape")}><span className="ratio-icon landscape-icon"/><span><b>Landscape</b><small>4:3</small></span></button>
            </div>

            <button className="generate-btn" onClick={generate} disabled={busy} type="button">
              {busy ? <><LoaderCircle className="spin" size={19}/> Creating your image...</> : <><Sparkles size={18}/> Generate image <span>→</span></>}
            </button>
            <p className="secure-note"><span>✦</span> Your prompt is sent securely. API credentials stay on the server.</p>
            {error && <div className="message error">{error}</div>}
            {notice && !error && <div className="message success">{notice}</div>}
          </div>

          <div className="preview-panel">
            <div className="preview-top"><span>CANVAS PREVIEW</span><span className="preview-ratio">{dimensions.label}</span></div>
            <div className={`preview-canvas ${ratio}`}>
              {image ? <img src={image} alt="AI generated artwork"/> : <div className="empty-state"><div className="empty-icon"><ImagePlus size={27}/></div><b>Your next masterpiece starts here</b><p>Your generated image will appear in this space.</p><span className="empty-hint"><ImageIcon size={13}/> PNG · HIGH QUALITY</span></div>}
              {busy && <div className="generating-overlay"><div className="loader-orbit"><Sparkles size={24}/></div><b>Dreaming up your image</b><span>This can take a little moment...</span></div>}
            </div>
            <div className="preview-footer">
              <div><b>{image ? "Image generated" : "Ready when you are"}</b><span>{image ? `${dimensions.width} × ${dimensions.height} px · PNG` : "Your canvas is waiting for an idea."}</span></div>
              <button className="download-btn" type="button" onClick={download} disabled={!image}><Download size={16}/> Download</button>
            </div>
          </div>
        </div>
      </section>
      <footer><span>PIXELFORGE STUDIO</span><span>Made for curious minds <b>✦</b></span></footer>
    </main>
  );
}
