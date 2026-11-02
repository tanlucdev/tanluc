"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import styles from "./CinematicWorkflow.module.css";

const tools = ["Sticky Note", "Backdrop", "Levels", "Painter", "Blur", "Crop", "Resize", "Invert"];
const models = ["Qwen Image 3.0", "FLUX Pro", "Happyhorse 1.0"];
const prompt = "Two cinematic takes: an energetic chase and a quiet cafe moment. Natural light, 35mm film.";
const asset = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/projects/cj`;
const scenes = [
  { target: "tools", caption: "01 · Direction — start with a note on the canvas.", duration: 1500 },
  { target: "tools", caption: "Open the toolbox.", duration: 1400, library: "tools" },
  { target: "sticky", caption: "Add a note to capture the direction.", duration: 1600, library: "tools" },
  { target: "note", caption: "Select a node to see its properties.", duration: 2400 },
  { target: "models", caption: "02 · Model — add a video model beside the direction note.", duration: 1400 },
  { target: "models", caption: "Browse models by what you want to create.", duration: 1700, library: "models" },
  { target: "horse", caption: "Choose an image-to-video model.", duration: 1700, library: "models" },
  { target: "model", caption: "Configure the model before generating any video.", duration: 2000 },
  { target: "prompt", caption: "Describe the scene in the properties panel.", duration: 2900 },
  { target: "resolution", caption: "Adjust the model’s output settings.", duration: 1400 },
  { target: "option", caption: "Set the resolution to 1080p.", duration: 1500 },
  { target: "generate", caption: "03 · Generate — run the model with these settings.", duration: 1700 },
  { target: "model", caption: "Generating two takes. Results will appear inside the nodes.", duration: 2400 },
  { target: "result", caption: "04 · Results — two takes, ready to compare on the canvas.", duration: 10000 },
];

function VideoPreview({ name, playing }: { name: string; playing: boolean }) {
  const video = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const element = video.current;
    if (!element) return;
    if (playing) element.play().catch(() => undefined);
    else element.pause();
    return () => element.pause();
  }, [playing]);
  return <div className={styles.videoReveal}>
    <video ref={video} loop muted playsInline preload="metadata" poster={`${asset}/${name}.jpg`} src={`${asset}/${name}.mp4`} onError={() => setFailed(true)} />
    <span className={styles.videoBadge}>{failed ? "Preview unavailable" : "6 SEC · VIDEO"}</span>
  </div>;
}

export default function CinematicWorkflow({ compact = false, running = true }: { compact?: boolean; running?: boolean }) {
  const root = useRef<HTMLElement>(null);
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [paused, setPaused] = useState(false);
  const active = running && visible && !hidden && !reduced && !paused;
  const frame = reduced ? scenes.length - 1 : step;
  const scene = scenes[frame];
  const noteVisible = frame >= 3;
  const modelVisible = frame >= 7;
  const propertiesVisible = frame === 3 || (frame >= 7 && frame <= 11);
  const library = "library" in scene ? scene.library : null;

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const preference = () => setReduced(media.matches);
    const visibility = () => setHidden(document.hidden);
    preference(); visibility();
    media.addEventListener("change", preference);
    document.addEventListener("visibilitychange", visibility);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: .15 });
    if (root.current) observer.observe(root.current);
    return () => { observer.disconnect(); media.removeEventListener("change", preference); document.removeEventListener("visibilitychange", visibility); };
  }, []);

  useEffect(() => {
    if (!active) return;
    const timer = window.setTimeout(() => setStep((current) => (current + 1) % scenes.length), scene.duration);
    return () => window.clearTimeout(timer);
  }, [active, step, scene.duration]);

  useLayoutEffect(() => {
    const stage = root.current;
    if (!stage) return;
    const position = () => {
      const target = stage.querySelector<HTMLElement>(`[data-anchor="${scene.target}"]`);
      if (!target) return;
      const bounds = stage.getBoundingClientRect();
      const rect = target.getBoundingClientRect();
      stage.style.setProperty("--cursor-x", `${rect.left - bounds.left + rect.width * .65}px`);
      stage.style.setProperty("--cursor-y", `${rect.top - bounds.top + rect.height * .6}px`);
    };
    position();
    const observer = new ResizeObserver(position);
    observer.observe(stage);
    return () => observer.disconnect();
  }, [scene.target, frame]);

  return <section ref={root} className={`${styles.demo} ${compact ? styles.compact : ""}`} aria-label="Visual Workflow Editor animated walkthrough" data-step={frame} data-running={active} data-properties={propertiesVisible} data-output={frame >= 12}>
    <header className={styles.header}><div><span className={styles.brand}>D<span>·</span>M</span><span className={styles.breadcrumb}>Workspace / <b>Scene exploration</b></span></div><button type="button" aria-label={paused ? "Resume canvas animation" : "Pause canvas animation"} aria-pressed={paused} disabled={reduced} onClick={() => setPaused((value) => !value)}>{reduced ? "Overview" : paused ? "Resume" : "Pause"}</button></header>
    <div className={styles.body} aria-hidden="true">
      <div className={styles.workspace}>
        <div className={styles.rail}>
          <span data-anchor="models" data-active={frame >= 4 && frame <= 6}><i>✳</i><small>Models</small></span>
          <span data-anchor="tools" data-active={frame <= 2}><i>▤</i><small>Tools</small></span>
          <span className={styles.railDivider} /><span><i>↖</i><small>Select</small></span>
        </div>
        <div className={styles.graph}>
          <div className={styles.canvasLabel}><span className={styles.liveDot} /> YOUR CREATIVE WORKSPACE</div>
          <div className={styles.nodes}>
            {modelVisible && <svg className={styles.wires} viewBox="0 0 1000 400" preserveAspectRatio="none"><path d="M 120 200 C 270 200 240 200 440 200 S 690 220 850 220" /></svg>}
            {noteVisible && <div className={`${styles.node} ${styles.note}`} data-anchor="note" data-selected={!modelVisible}>
              <div className={styles.nodeHeading}><span>▤</span>Scene direction<small>01</small></div>
              <p>Two cinematic takes.<br />An energetic chase. A quiet cafe.</p><span className={styles.port} />
            </div>}
            {modelVisible && <div className={styles.nodeShell} data-anchor="model">
              <div className={styles.nodeToolbar}><span>Image to Video⌄</span><span>◇</span><span>⤢</span><span>♡</span></div>
              <div className={styles.node} data-selected="true"><div className={styles.nodeHeading}><span>▷</span>Happyhorse 1.0<small>02</small></div><div className={styles.modelPreview}>{frame >= 13 ? <VideoPreview name="video-workflow" playing={active} /> : <div className={styles.modelIcon}><span>{frame === 12 ? "Generating…" : frame === 11 ? "Ready to generate" : "Awaiting configuration"}</span></div>}</div><div className={styles.nodeSummary}>{frame >= 13 ? "Take 01 · Chase" : frame === 12 ? "1080p · 6 seconds · 2 takes" : "Configure the model, then generate two takes."}</div><span className={styles.port} /></div>
            </div>}
            {frame >= 12 && <div className={`${styles.nodeShell} ${styles.result}`} data-anchor="result"><div className={styles.node} data-selected="true"><div className={styles.nodeHeading}><span>▷</span>Take 02 · Cafe<small>03</small></div><div className={styles.modelPreview}>{frame >= 13 ? <VideoPreview name="video-2" playing={active} /> : <div className={styles.modelIcon}><span>Generating…</span></div>}</div><div className={styles.nodeSummary}>{frame >= 13 ? "A quiet moment outside a cafe." : "Waiting for the second take."}</div><span className={styles.port} /></div></div>}
            {!noteVisible && <div className={styles.emptyCanvas}><span>+</span><p>Add a note to begin your scene.</p></div>}
          </div>
          <div className={styles.hint}>SCENE 01 <span>·</span> {frame >= 12 ? "3 nodes" : modelVisible ? "2 nodes" : noteVisible ? "1 node" : "Empty canvas"}</div>
        </div>
        {library && <div key={library} className={styles.library} data-library={library}>
          <div className={styles.panelHeading}><h3>{library === "tools" ? "Toolbox" : "AI Models"}</h3><span>×</span></div><div className={styles.search}>⌕ <span>Search…</span></div>
          <div className={styles.libraryItems}>{(library === "tools" ? tools : models).map((name, index) => <div key={name} data-anchor={name === "Sticky Note" ? "sticky" : name === "Happyhorse 1.0" ? "horse" : undefined} data-highlight={(frame === 2 && index === 0) || (frame === 6 && name === "Happyhorse 1.0")}><span>{library === "tools" ? ["▤", "▧", "☷", "╱", "◌", "⌗", "⤢", "◐"][index] : index === 2 ? "▷" : "▧"}</span><span>{name}<small>{library === "tools" ? "Canvas tool" : index === 2 ? "Video · Image to Video" : "Image"}</small></span><b>+</b></div>)}</div>
        </div>}
      </div>
      {propertiesVisible && <div className={styles.properties} data-panel="properties">
        <div className={styles.panelHeading}><h3>Properties</h3><span>{modelVisible ? "02" : noteVisible ? "01" : "—"}</span></div>
        {noteVisible ? <div className={styles.propertyContent} key={modelVisible ? "model" : "note"}>
          <div className={styles.selectedTitle}><span>{modelVisible ? "▷" : "▤"}</span><div><h4>{modelVisible ? "Happyhorse 1.0" : "Scene direction"}</h4><small>{modelVisible ? "Image to Video" : "Sticky Note"}</small></div></div>
          <div className={styles.field}><span>{modelVisible ? "Prompt" : "Note"}</span><div className={styles.textarea} data-anchor="prompt" data-highlight={frame === 8}>{modelVisible ? frame >= 8 ? <span className={styles.typing} data-running={active} key={frame === 8 ? "typing" : "complete"} data-complete={frame !== 8}>{prompt}</span> : <span className={styles.placeholder}>Describe your scene…</span> : "Two cinematic takes. An energetic chase. A quiet cafe."}</div></div>
          {modelVisible && <><div className={styles.saved}>▧ Scene reference image</div><div className={styles.field}><span>Resolution</span><div className={styles.select} data-anchor="resolution" data-highlight={frame === 9 || frame === 10}><span>{frame >= 10 ? "1080p" : "720p"}</span><span>⌄</span>{frame === 10 && <div className={styles.options}><span>720p</span><span data-anchor="option">1080p <b>✓</b></span></div>}</div></div><div className={styles.field}><span>Duration</span><div className={styles.select}><span>6 seconds · 2 takes</span><span>⌄</span></div></div></>}
          {modelVisible && <div className={styles.generate} data-anchor="generate" data-highlight={frame === 11}>▷ Generate 2 takes</div>}
          <div className={styles.saved}><span className={styles.liveDot} />{modelVisible && frame >= 11 ? "Configuration ready" : "Changes saved"}</div>
        </div> : <p className={styles.emptyProperties}>Select a node on the canvas to reveal its configuration.</p>}
      </div>}
    </div>
    <div className={styles.cursor} aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 2 20 12l-7 1.5L10 20Z" /></svg><i key={frame} /></div>
    <footer className={styles.status}><span>{scene.caption}</span><span className={styles.steps} aria-hidden="true">{[0, 1, 2, 3].map((index) => <i key={index} data-active={index === (frame < 4 ? 0 : frame < 11 ? 1 : frame < 13 ? 2 : 3)} />)}</span></footer>
    <p className={styles.srOnly}>Automatic demonstration: open the toolbox, add a sticky note, choose an AI model, configure its prompt and resolution, then reveal two video results on the canvas.</p>
  </section>;
}
