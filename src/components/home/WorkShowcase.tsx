"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { HOME_SHOWCASE, type HomeShowcaseProject } from "@/content/home-showcase";
import styles from "./WorkShowcase.module.css";
import CinematicWorkflow from "@/components/work/CinematicWorkflow";

const asset = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/images/work`;
const base = `${asset}/reference`;
const skinFiles = ["gmail-skin.png", "slack-skin.png", "outlook-skin.png"];

function useVisibility<T extends Element>(threshold: number) {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold });
    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);
  return [ref, visible] as const;
}

function useMotionPreference() {
  const [reduced, setReduced] = useState(false);
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    const visibility = () => setHidden(document.hidden);
    update();
    visibility();
    media.addEventListener("change", update);
    document.addEventListener("visibilitychange", visibility);
    return () => { media.removeEventListener("change", update); document.removeEventListener("visibilitychange", visibility); };
  }, []);
  return { reduced, hidden };
}

function artifactKeyframes(index: number) {
  const frames: Keyframe[] = [];
  for (let step = 0; step < 3; step += 1) {
    const front = (index - step + 3) % 3;
    const next = (index - step + 2) % 3;
    const stacked = (depth: number) => `translate(-50%, ${24 - depth * 9}cqw) scale(${1 - depth * .06})`;
    const frontTransform = "translate(-50%, 7cqw) scale(1)";
    const push = (offset: number, transform: string, opacity: number, zIndex: number) => frames.push({ offset: (step * 5 + offset) / 15, transform, opacity, zIndex, easing: "cubic-bezier(.77, 0, .175, 1)" });
    push(0, stacked(front), 1, 3 - front); push(.9, stacked(front), 1, 3 - front);
    push(1.5, front === 0 ? frontTransform : stacked(front), Number(front === 0), 3 - front);
    push(3.8, front === 0 ? frontTransform : stacked(front), Number(front === 0), 3 - front);
    push(4.4, stacked(front), 1, 3 - front); push(5, stacked(next), 1, 3 - next);
  }
  return frames;
}

function Reveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    node.dataset.revealReady = "true";
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { node.classList.add(styles.isVisible); return; }
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { node.classList.add(styles.isVisible); observer.unobserve(node); } }, { rootMargin: "0px 0px -12% 0px", threshold: .08 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref} className={styles.reveal}>{children}</div>;
}

function ArtifactMedia({ running }: { running: boolean }) {
  const [ref, visible] = useVisibility<HTMLDivElement>(0.15);
  const skinsRef = ref;
  const animations = useRef<Animation[]>([]);
  const { reduced, hidden } = useMotionPreference();
  const active = running && visible && !reduced && !hidden;
  useEffect(() => {
    const skins = skinsRef.current;
    if (!skins) return;
    animations.current = Array.from(skins.querySelectorAll("img")).map((image, index) => {
      const animation = image.animate(artifactKeyframes(index), { duration: 15000, iterations: Infinity, fill: "both" });
      animation.pause();
      return animation;
    });
    return () => animations.current.forEach((animation) => animation.cancel());
  }, [skinsRef]);
  useEffect(() => {
    animations.current.forEach((animation) => {
      if (reduced) { animation.pause(); animation.currentTime = 0; }
      else if (active) animation.play();
      else animation.pause();
    });
  }, [active, reduced]);
  return <div className={`${styles.media} ${styles.artifactMedia}`} role="group" aria-label="Product experience media">
    <div className={`${styles.panel} ${styles.document}`}><img src={`${base}/artifacts/document.png`} alt="Document experience" /></div>
    <div className={`${styles.panel} ${styles.edit}`}><img src={`${base}/artifacts/edit-with-ai.png`} alt="Editing tools" /></div>
    <div ref={skinsRef} className={styles.skins} aria-label="Gmail, Slack, and Outlook skins">{skinFiles.map((file, index) => <img key={file} className={styles.skin} src={`${base}/artifacts/${file}`} alt={`${["Gmail", "Slack", "Outlook"][index]} skin`} style={{ transform: `translate(-50%, ${24 - index * 9}cqw) scale(${1 - index * .06})`, zIndex: 3 - index }} />)}</div>
  </div>;
}

// ponytail: Representative field sets; replace with approved production schemas when available.
const modelExamples = [
  { name: "Qwen Image 3.0", type: "Text to Image", fields: [["Aspect ratio", "16:9"], ["Output images", "1"]] },
  { name: "FLUX Pro", type: "Image to Image", fields: [["Reference image", "Scene reference.jpg"], ["Strength", "0.65"]] },
  { name: "Happyhorse 1.0", type: "Image to Video", fields: [["Reference image", "Scene reference.jpg"], ["Duration", "6 seconds"], ["Resolution", "1080p"]] },
];

function DynamicModelsMedia({ running }: { running: boolean }) {
  const [ref, visible] = useVisibility<HTMLElement>(0.15);
  const { reduced, hidden } = useMotionPreference();
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);
  const active = running && visible && !reduced && !hidden && !paused;
  const frame = reduced ? Math.floor(step / 3) * 3 + 2 : step;
  const selected = Math.floor(frame / 3);
  const phase = frame % 3;
  const model = modelExamples[selected];
  useEffect(() => {
    if (!active) return;
    const timer = window.setTimeout(() => setStep((value) => (value + 1) % 9), phase === 2 ? 3400 : 1900);
    return () => window.clearTimeout(timer);
  }, [active, phase, step]);
  return <section ref={ref} className={styles.schemaDemo} aria-label="Schema-driven model configuration" data-model-stage={frame} data-running={active}>
    <header className={styles.schemaHeader}><span><b>D·M</b> Model configuration</span><button type="button" aria-pressed={paused} disabled={reduced} onClick={() => setPaused((value) => !value)}>{reduced ? "Overview" : paused ? "Resume model demo" : "Pause model demo"}</button></header>
    <div className={styles.schemaBody}>
      <div className={styles.modelCatalogue}><span className={styles.schemaEyebrow}>MODEL LIBRARY</span><h4>1,000+ models.<br />One adaptive interface.</h4><p>Choose a model.<br />Its properties follow.</p><div className={styles.modelChoices}>{modelExamples.map((item, index) => <button key={item.name} type="button" aria-pressed={selected === index} onClick={() => { setStep(index * 3); setPaused(true); }}><span>{index === 2 ? "▷" : "▧"}</span><span>{item.name}<small>{item.type}</small></span><span>{selected === index ? "✓" : "+"}</span></button>)}</div><small className={styles.schemaExample}>Illustrative configuration</small></div>
      <div className={styles.modelProperties}>
        <div className={styles.schemaFormHeading}><span className={styles.schemaEyebrow}>PROPERTIES</span><span>{String(selected + 1).padStart(2, "0")} / 03</span></div>
        <div key={model.name} className={styles.schemaFields}><h4>{model.name}<small>{model.type}</small></h4>
          <dl><div className={styles.schemaField} data-invalid={phase === 1}><dt>Prompt <span>Required</span></dt><dd className={styles.schemaPrompt}>{phase === 2 ? "A quiet cafe after the rain, warm light, 35mm." : <span>Describe your scene…</span>}</dd>{phase === 1 && <p className={styles.schemaError}>Prompt is required.</p>}</div>
          {model.fields.map(([label, value]) => <div key={label} className={styles.schemaField}><dt>{label}</dt><dd>{value}<span aria-hidden="true">{label === "Reference image" ? "▧" : "⌄"}</span></dd></div>)}</dl>
          <div className={styles.schemaValidation} data-valid={phase === 2}>{phase === 2 ? "✓ Required inputs validated · Ready to run" : phase === 1 ? "Complete the required input to continue." : "Controls adapt to the selected model."}</div>
        </div>
      </div>
    </div>
    <footer className={styles.schemaFooter}><span>{phase === 0 ? "01 · Select a model — its fields appear automatically." : phase === 1 ? "02 · Validate — required inputs are checked." : "03 · Ready — the configuration is complete."}</span><span aria-hidden="true">{[0, 1, 2].map((index) => <i key={index} data-active={phase === index} />)}</span></footer>
  </section>;
}

function useWalkthrough(running: boolean, lastFrame: number) {
  const [ref, visible] = useVisibility<HTMLElement>(0.15);
  const { reduced, hidden } = useMotionPreference();
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);
  const active = running && visible && !reduced && !hidden && !paused;
  const frame = reduced && !paused ? lastFrame : step;
  useEffect(() => {
    if (!active) return;
    const timer = window.setTimeout(() => setStep((value) => (value + 1) % (lastFrame + 1)), frame === lastFrame ? 4800 : 2300);
    return () => window.clearTimeout(timer);
  }, [active, frame, lastFrame]);
  const choose = (index: number) => { setStep(index); setPaused(true); };
  return { ref, frame, paused, setPaused, reduced, active, choose };
}

// ponytail: Local visual demonstrations; replace examples with approved production captures when available.
const creativeTools = [
  { name: "Source", icon: "▧", caption: "Start with one scene. Each tool changes the same image.", fields: [["File", "Scene reference.jpg"], ["Size", "1280 × 720"]] },
  { name: "Color", icon: "◐", caption: "Compare the original with a warmer color correction.", fields: [["Exposure", "+0.3"], ["Contrast", "+12"], ["Warmth", "+8"]] },
  { name: "Mask", icon: "◌", caption: "Use a mask to limit the adjustment to one part of the scene.", fields: [["Shape", "Ellipse"], ["Scope", "Local adjustment"]] },
  { name: "Transform", icon: "⤢", caption: "Rotate and flip the scene within the same frame.", fields: [["Rotation", "−6°"], ["Flip", "Horizontal"], ["Fit", "Fill"]] },
  { name: "Composite", icon: "▤", caption: "Combine the corrected scene and a title as separate layers.", fields: [["Layer 01", "Corrected scene"], ["Layer 02", "Title overlay"], ["Blend", "Normal"]] },
];

function CreativeToolsMedia({ running }: { running: boolean }) {
  const { ref, frame, paused, setPaused, reduced, active, choose } = useWalkthrough(running, creativeTools.length - 1);
  const tool = creativeTools[frame];
  const sceneImage = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/projects/cj/video-2.jpg`;
  return <section ref={ref} className={styles.schemaDemo} aria-label="Creative media tools demonstration" data-tool-stage={frame} data-running={active}>
    <header className={styles.schemaHeader}><span><b>D·M</b> Creative tools</span><button type="button" aria-pressed={paused} disabled={reduced} onClick={() => setPaused((value) => !value)}>{reduced ? "Overview" : paused ? "Resume tools demo" : "Pause tools demo"}</button></header>
    <div className={styles.toolsBody}>
      <div className={styles.editWorkspace}><div className={styles.toolChoices} aria-label="Creative tools">{creativeTools.map((item, index) => <button key={item.name} type="button" aria-pressed={frame === index} onClick={() => choose(index)}><span aria-hidden="true">{item.icon}</span>{item.name}</button>)}</div>
        <div className={styles.editPreview} data-edit={frame}><img src={sceneImage} alt="A cafe scene used to demonstrate image adjustments" /><img className={styles.editedImage} src={sceneImage} alt="" aria-hidden="true" /><span className={styles.maskOutline} aria-hidden="true" /><div className={styles.compositeTitle} aria-hidden="true"><small>A SCENE STUDY</small>AFTER THE RAIN</div><span className={styles.editLabel}>{["Source image", "Original / Color corrected", "Local mask preview", "Rotated & flipped", "Scene + title layers"][frame]}</span></div>
        <span className={styles.schemaExample}>Illustrative tool preview · supplied scene</span>
      </div>
      <div className={styles.toolProperties}><span className={styles.schemaEyebrow}>TOOL PROPERTIES</span><h4>{tool.name}</h4><dl>{tool.fields.map(([label, value]) => <div key={label} className={styles.schemaField}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><p>One scene.<br />Changes you can see.</p></div>
    </div>
    <footer className={styles.schemaFooter}><span>{tool.caption}</span><span aria-hidden="true">{creativeTools.map((item, index) => <i key={item.name} data-active={frame === index} />)}</span></footer>
  </section>;
}

const executionStages = [
  { title: "Validation blocked", detail: "Prompt is required. Execution has not started." },
  { title: "Input corrected", detail: "The missing prompt is added to the model configuration." },
  { title: "Workflow validated", detail: "Required inputs and node connections pass validation." },
  { title: "Payload prepared", detail: "Node configuration and connections are included in the execution payload." },
  { title: "Execution queued", detail: "The workflow is accepted and waiting to start." },
  { title: "Model running", detail: "Real-time updates keep node status in sync with execution." },
  { title: "Outputs ready", detail: "The completed output is attached to its node." },
];

function WorkflowExecutionMedia({ running }: { running: boolean }) {
  const { ref, frame, paused, setPaused, reduced, active, choose } = useWalkthrough(running, executionStages.length - 1);
  const stage = executionStages[frame];
  const states = [frame === 0 ? "blocked" : "complete", frame === 6 ? "complete" : frame === 5 ? "running" : "pending", frame === 6 ? "complete" : "pending"];
  return <section ref={ref} className={styles.schemaDemo} aria-label="Workflow execution demonstration" data-execution-stage={frame} data-running={active}>
    <header className={styles.schemaHeader}><span><b>D·M</b> Workflow execution</span><button type="button" aria-pressed={paused} disabled={reduced} onClick={() => setPaused((value) => !value)}>{reduced ? "Overview" : paused ? "Resume execution demo" : "Pause execution demo"}</button></header>
    <div className={styles.executionBody}>
      <div className={styles.runOverview}><span className={styles.schemaEyebrow}>RUN OVERVIEW</span><h4>{stage.title}</h4><p className={styles.runDetail}>{stage.detail}</p><progress aria-label="Workflow execution progress" max={6} value={frame} />
        <div className={styles.runNodes}>{["Scene input", "AI model", "Output"].map((name, index) => <div key={name} className={styles.runNode} data-state={states[index]}><span className={styles.runNodeIcon} aria-hidden="true">{states[index] === "complete" ? "✓" : states[index] === "blocked" ? "!" : states[index] === "running" ? "◌" : "·"}</span><span>{name}<small>{states[index]}</small></span><span>0{index + 1}</span></div>)}</div><small className={styles.schemaExample}>Illustrative run · no live execution</small>
      </div>
      <div className={styles.runFeed}><span className={styles.schemaEyebrow}>EXECUTION UPDATES</span><ol>{executionStages.map((item, index) => <li key={item.title} data-reached={frame >= index} data-current={frame === index}><button type="button" aria-pressed={frame === index} onClick={() => choose(index)}><span>{String(index + 1).padStart(2, "0")}</span><span>{item.title}<small>{index === frame ? item.detail : frame > index ? "Recorded" : "Pending"}</small></span></button></li>)}</ol></div>
    </div>
    <footer className={styles.schemaFooter}><span>{frame === 0 ? "Fix invalid inputs before starting a run." : frame < 4 ? "Validated configuration becomes an execution payload." : frame < 6 ? "Follow the run through real-time status updates." : "The run is complete. Results stay with the workflow."}</span><span aria-hidden="true">{[0, 1, 2, 3].map((index) => <i key={index} data-active={index === (frame < 2 ? 0 : frame < 4 ? 1 : frame < 6 ? 2 : 3)} />)}</span></footer>
  </section>;
}

function ProjectMedia({ project, running }: { project: HomeShowcaseProject; running: boolean }) {
  const media = project.media === "models" ? <DynamicModelsMedia running={running} /> : project.media === "canvas" ? <CinematicWorkflow compact running={running} /> : project.media === "tools" ? <CreativeToolsMedia running={running} /> : project.media === "execution" ? <WorkflowExecutionMedia running={running} /> : project.media === "medichims" ? <MedicHimsMedia /> : project.media === "cafemaps" ? <CafeMapsMedia project={project} running={running} /> : <ArtifactMedia running={running} />;
  return <div className={styles.mediaFrame}>{media}{project.referenceMedia && <span className={styles.reference} data-work-reference>Temporary reference preview; not portfolio work</span>}</div>;
}

const medicServiceScreens = [
  { file: "services", height: 987, label: "Purchases", alt: "MedicHIMS service purchases with usage, status, purchase date and expiry date", caption: "Usage, purchase history and service status in one view." },
  { file: "add-service", height: 422, label: "Select a package", alt: "MedicHIMS add service form with service, package and pricing fields", caption: "Service and package selection, with pricing kept together." },
  { file: "service-details", height: 422, label: "Price breakdown", alt: "MedicHIMS service details with package, unit price, discount, VAT and total", caption: "A detailed view of the selected package and its price breakdown." },
];
const medicTemplateScreens = [
  { file: "template-fields", height: 2874, label: "Field configuration", alt: "MedicHIMS document subsection configuration with field codes, data types and display controls", caption: "Field codes, data types and display rules define a document subsection." },
  { file: "template-settings", height: 985, label: "Template settings", alt: "MedicHIMS document template settings including document type, category and paper size", caption: "Document type, category, visibility and paper size, kept in one place." },
  { file: "add-template", height: 986, label: "New template", alt: "MedicHIMS add document template dialog", caption: "A focused form for defining a new document template." },
  { file: "add-subsection", height: 986, label: "New subsection", alt: "MedicHIMS empty subsection editor with configuration controls", caption: "Subsections bring individual fields into a structured document." },
];

function MedicHimsGallery({ title, description, screens, selected }: { title: string; description: string; screens: typeof medicServiceScreens; selected: boolean }) {
  const [index, setIndex] = useState(0);
  const screen = screens[index];
  return <section className={styles.medicGallery} aria-label={title} data-selected={selected}>
    <header className={styles.medicHeading}><h4>{title}</h4><p>{description}</p></header>
    <div className={styles.medicScreens} role="group" aria-label={`${title} screens`}>{screens.map((item, position) => <button key={item.file} type="button" aria-pressed={position === index} onClick={() => setIndex(position)}>{item.label}</button>)}</div>
    <figure className={styles.medicFigure}>
      <div key={screen.file} className={styles.medicViewport} data-compact={screen.height < 600} tabIndex={0} role="region" aria-label={`${screen.label} screenshot. Scroll to explore.`}><img src={`${asset}/medichims/${screen.file}.webp`} alt={screen.alt} width={1800} height={screen.height} loading="lazy" /></div>
      <figcaption><span>{screen.caption}</span><a href={`${asset}/medichims/${screen.file}.webp`} target="_blank" rel="noreferrer" aria-label={`Open ${screen.label} full size (opens in a new tab)`}>View full size ↗</a></figcaption>
    </figure>
  </section>;
}

function MedicHimsMedia() {
  const [topic, setTopic] = useState(0);
  return <div className={styles.medicShowcase} role="group" aria-label="MedicHIMS product showcase">
    <div className={styles.medicTopics} role="group" aria-label="MedicHIMS topics">{["Services & billing", "Document templates"].map((label, index) => <button key={label} type="button" aria-pressed={topic === index} onClick={() => setTopic(index)}>{label}</button>)}</div>
    <MedicHimsGallery title="Services & billing" description="From choosing a package to keeping track of its use." screens={medicServiceScreens} selected={topic === 0} />
    <MedicHimsGallery title="A structure for every form." description="Configurable templates, down to the individual field." screens={medicTemplateScreens} selected={topic === 1} />
    <p className={styles.medicSource}>Actual product screens · Scroll within each screen to explore.</p>
  </div>;
}

function CafeScreenTour({ label, screens, running }: { label: string; screens: { file: string; title: string; alt: string }[]; running: boolean }) {
  const [ref, visible] = useVisibility<HTMLDivElement>(0.15);
  const { reduced, hidden } = useMotionPreference();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const active = running && visible && !reduced && !hidden && !paused && !interacting;
  useEffect(() => {
    if (!active) return;
    const timer = window.setTimeout(() => setIndex((value) => (value + 1) % screens.length), 3500);
    return () => window.clearTimeout(timer);
  }, [active, index, screens.length]);
  return <div ref={ref} className={styles.cafeTour} role="region" aria-label={label} data-running={active} data-screen={index}>
    <div className={styles.cafeTourWindow} onMouseEnter={() => setInteracting(true)} onMouseLeave={() => setInteracting(false)} onFocusCapture={() => setInteracting(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setInteracting(false); }}><div className={styles.cafeTourTrack} style={{ transform: `translateY(-${index * 100}%)` }}>{screens.map((screen, position) => <a key={screen.file} className={styles.cafeTourSlide} href={`${asset}/cafemaps/${screen.file}.webp`} target="_blank" rel="noreferrer" aria-label={`${screen.alt} (opens in a new tab)`} aria-hidden={position !== index} inert={position !== index}><img src={`${asset}/cafemaps/${screen.file}.webp`} alt={screen.alt} width={1440} height={1000} loading={visible ? "eager" : "lazy"} /></a>)}</div></div>
    <div className={styles.cafeTourControls}><div role="group" aria-label={`${label} screens`}>{screens.map((screen, position) => <button key={screen.file} type="button" aria-pressed={position === index} onClick={() => { setIndex(position); setPaused(true); }}>{screen.title}</button>)}</div><button type="button" aria-label={`${paused ? "Resume" : "Pause"} ${label}`} aria-pressed={paused} onClick={() => setPaused((value) => !value)}>{paused ? "Play" : "Pause"}</button></div>
  </div>;
}

function CafeMapsMedia({ project, running }: { project: HomeShowcaseProject; running: boolean }) {
  const [managementOpen, setManagementOpen] = useState(false);
  return <div className={styles.cafeEditorial} role="group" aria-label="Cafe Maps product showcase">
    <div className={styles.cafePublic}>
      <div className={styles.cafeDiscover}>
        <CafeScreenTour label="Cafe Maps discovery" running={running} screens={[
          { file: "en-discovery", title: "Explore", alt: "Cafe Maps English discovery: search, filters and cafe cards" },
          { file: "en-detail", title: "Cafe details", alt: "Cafe Maps English cafe details: photo gallery, opening hours and atmosphere" },
          { file: "en-saved", title: "Saved", alt: "Cafe Maps English saved collection with folders, filters and saved cafe cards" },
          { file: "en-quiz", title: "Quiz", alt: "Cafe Maps English personality quiz: questions and coffee mood choices" },
          { file: "en-contribute", title: "Contribute", alt: "Cafe Maps English contribution choices for visitors and cafe owners" },
        ]} />
        <div className={styles.cafeEditorialFoot}><span data-cafemaps-stats>{project.stats?.join(" · ")}</span></div>
      </div>
      <a className={styles.cafeDetail} href={`${asset}/cafemaps/editorial-gallery.webp`} target="_blank" rel="noreferrer" aria-label="View Cafe Maps cafe gallery (opens in a new tab)"><img src={`${asset}/cafemaps/editorial-gallery.webp`} alt="The photo gallery of Em có café — Nguyễn Trãi" width={1000} height={598} loading="lazy" /><span>Get a feel for the place.</span></a>
      <a className={styles.cafePersonality} href={`${asset}/cafemaps/en-quiz-result.webp`} target="_blank" rel="noreferrer" aria-label="View Cafe Maps English quiz result (opens in a new tab)"><img src={`${asset}/cafemaps/en-quiz-result.webp`} alt="Cafe Maps quiz result: Cozy Plant Corner persona, cafe traits and matching preferences" width={1570} height={920} loading="lazy" /></a>
    </div>
    <div className={styles.cafeManagement}>
      <button className={styles.cafeManagementToggle} type="button" aria-expanded={managementOpen} aria-controls="cafe-management-content" onClick={() => setManagementOpen((value) => !value)}>Behind the scenes<span aria-hidden="true">{managementOpen ? "−" : "+"}</span></button>
      <div id="cafe-management-content" className={styles.cafeManagementBody} data-expanded={managementOpen}>
      <header className={styles.cafeManagementCopy}><div><span>BEHIND THE PLACES</span><h4>From submission to discovery.</h4></div><p>Review contributions, curate the catalogue,<br />and look after every detail.</p></header>
      <div className={styles.cafeAdminScreens}>
        <CafeScreenTour label="Cafe Maps CMS" running={running} screens={[
          { file: "en-cms-cafes", title: "Catalogue", alt: "Cafe Maps English CMS cafe catalogue with filters and publication statuses" },
          { file: "en-cms-editing", title: "Editing", alt: "Cafe Maps English media editor with cover image and thumbnail positioning controls" },
          { file: "en-cms-submissions", title: "Submissions", alt: "Cafe Maps English CMS community submissions queue; contributor details redacted" },
          { file: "en-cms-review", title: "Moderation", alt: "Cafe Maps English CMS contribution review and response panel; contributor details redacted" },
        ]} />
        <a className={styles.cafeAdminMedia} href={`${asset}/cafemaps/en-cms-media.webp`} target="_blank" rel="noreferrer" aria-label="View Cafe Maps English media editor (opens in a new tab)"><img src={`${asset}/cafemaps/en-cms-media.webp`} alt="Cafe Maps English media editor: cover image, thumbnail positioning, menu and gallery" width={540} height={1000} loading="lazy" /><span>Images, menus & the finishing touches.</span></a>
      </div>
      </div>
    </div>
  </div>;
}

function ease(progress: number) {
  const cubic = (time: number, p1: number, p2: number) => 3 * (1 - time) ** 2 * time * p1 + 3 * (1 - time) * time ** 2 * p2 + time ** 3;
  let low = 0;
  let high = 1;
  for (let index = 0; index < 14; index += 1) { const mid = (low + high) / 2; if (cubic(mid, .77, .175) < progress) low = mid; else high = mid; }
  return cubic((low + high) / 2, 0, 1);
}

export default function WorkShowcase() {
  const navRef = useRef<HTMLElement>(null);
  const stopScrollRef = useRef<() => void>(() => undefined);
  const [active, setActive] = useState<string>(HOME_SHOWCASE[0].slug);
  const [navRevealed, setNavRevealed] = useState(false);
  const [motionPaused, setMotionPaused] = useState(false);

  useLayoutEffect(() => {
    const nav = navRef.current;
    const link = nav?.querySelector<HTMLAnchorElement>(`a[aria-current="location"]`);
    const dot = nav?.querySelector<HTMLElement>(`[data-work-dot]`);
    if (!nav || !link || !dot) return;
    const position = () => { dot.style.transform = `translate3d(${link.offsetLeft}px, ${link.offsetTop + parseFloat(getComputedStyle(link).fontSize) * .55}px, 0)`; dot.dataset.positioned = "true"; };
    position();
    const observer = new ResizeObserver(position);
    observer.observe(nav);
    nav.querySelectorAll("a").forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, [active]);

  useEffect(() => {
    const targets = HOME_SHOWCASE.map(({ slug }) => document.getElementById(`work-${slug}`)).filter((item): item is HTMLElement => Boolean(item));
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) setActive(entry.target.id.replace("work-", "")); }), { rootMargin: "-20% 0px -65% 0px", threshold: 0 });
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const nav = navRef.current;
    const media = document.querySelector(`.${styles.mediaFrame}`);
    if (!nav || !media) return;
    nav.dataset.ready = "true";
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setNavRevealed(true); observer.disconnect(); } }, { rootMargin: "0px 0px -45% 0px", threshold: 0 });
    observer.observe(media);
    return () => observer.disconnect();
  }, []);

  const moveTo = (target: HTMLElement, animated: boolean, duration = 560, ignoreWheel = false, onStop?: () => void) => {
    stopScrollRef.current();
    const destination = window.scrollY + target.getBoundingClientRect().top - Math.max(32, (window.innerHeight - target.getBoundingClientRect().height) / 2);
    if (!animated || window.matchMedia("(prefers-reduced-motion: reduce)").matches) { window.scrollTo({ top: destination, behavior: "instant" }); return; }
    const initial = window.scrollY;
    const started = performance.now();
    let frame = 0;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const stop = (event?: Event) => { if (ignoreWheel && event?.type === "wheel") return; cancelAnimationFrame(frame); window.removeEventListener("wheel", stop); window.removeEventListener("touchstart", stop); window.removeEventListener("pointerdown", stop); window.removeEventListener("keydown", stop); window.removeEventListener("resize", stop); reducedMotion.removeEventListener("change", stop); onStop?.(); };
    const tick = (now: number) => { const progress = Math.min(1, (now - started) / duration); window.scrollTo({ top: initial + (destination - initial) * ease(progress), behavior: "instant" }); if (progress < 1) frame = requestAnimationFrame(tick); else stop(); };
    ["wheel", "touchstart", "pointerdown", "keydown", "resize"].forEach((event) => window.addEventListener(event, stop, { once: true, passive: true }));
    reducedMotion.addEventListener("change", stop, { once: true });
    stopScrollRef.current = stop;
    frame = requestAnimationFrame(tick);
  };

  useEffect(() => {
    const scrollHash = () => { const hash = window.location.hash; const target = hash === "#work" ? document.getElementById(`work-${HOME_SHOWCASE[0].slug}`) : document.getElementById(hash.slice(1)); if (target) requestAnimationFrame(() => moveTo(target, false)); };
    scrollHash();
    window.addEventListener("hashchange", scrollHash);
    return () => { stopScrollRef.current(); window.removeEventListener("hashchange", scrollHash); };
  }, []);

  useEffect(() => {
    const firstProject = document.getElementById(`work-${HOME_SHOWCASE[0].slug}`);
    if (!firstProject) return;
    const desktop = window.matchMedia("(min-width: 1080px) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let burst = 0;
    let handoff = false;
    let scrolling = false;
    const cancel = () => { window.clearTimeout(burst); handoff = false; scrolling = false; stopScrollRef.current(); };
    const destination = () => {
      const rect = firstProject.getBoundingClientRect();
      return window.scrollY + rect.top - Math.max(32, (window.innerHeight - rect.height) / 2);
    };
    const bypassesWheelHandoff = (target: EventTarget | null) => {
      if (!(target instanceof Element) || target.closest("dialog, [role='dialog'], button, input, textarea, select, [contenteditable='true'], .meadow-settings__panel")) return true;
      for (let element: Element | null = target; element && element !== document.body; element = element.parentElement) {
        if (/(auto|scroll)/.test(getComputedStyle(element).overflowY) && element.scrollHeight > element.clientHeight + 1) return true;
      }
      return false;
    };
    const onWheel = (event: WheelEvent) => {
      const vertical = Math.abs(event.deltaY) > Math.abs(event.deltaX);
      const eligible = desktop.matches && !reducedMotion.matches && !event.ctrlKey && !event.metaKey && vertical && !bypassesWheelHandoff(event.target);
      const initial = window.scrollY <= 8 && destination() > window.innerHeight * .5;
      if (eligible && event.deltaY > 0 && (handoff || scrolling || initial)) {
        if (event.cancelable) event.preventDefault();
        if (!handoff && !scrolling) {
          if (!event.cancelable) return;
          cancel();
          moveTo(firstProject, true, 900, true, () => { scrolling = false; });
          handoff = true;
          scrolling = true;
        }
        window.clearTimeout(burst);
        burst = window.setTimeout(() => { handoff = false; }, 140);
        return;
      }
      cancel();
    };
    const onMediaChange = () => cancel();
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", cancel);
    window.addEventListener("pointerdown", cancel);
    window.addEventListener("resize", cancel);
    desktop.addEventListener("change", onMediaChange);
    reducedMotion.addEventListener("change", onMediaChange);
    return () => {
      window.clearTimeout(burst);
      cancel();
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", cancel);
      window.removeEventListener("pointerdown", cancel);
      window.removeEventListener("resize", cancel);
      desktop.removeEventListener("change", onMediaChange);
      reducedMotion.removeEventListener("change", onMediaChange);
    };
  }, []);

  const running = !motionPaused;
  return <section id="work" className={`portfolio-home-work ${styles.showcase}`} aria-labelledby="work-title">
    <div className={styles.editorial}>
      <aside className={styles.rail}><nav ref={navRef} className={styles.nav} data-revealed={navRevealed} aria-label="Selected work">{HOME_SHOWCASE.map((project) => <a key={project.slug} href={`#work-${project.slug}`} aria-current={active === project.slug ? "location" : undefined} onClick={(event) => { if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); history.pushState(null, "", `#work-${project.slug}`); const target = document.getElementById(`work-${project.slug}`); if (target) { moveTo(target, true); target.focus({ preventScroll: true }); } }}>{project.title}</a>)}<span className={styles.dot} data-work-dot aria-hidden="true" /></nav></aside>
      <div className={styles.content}><h2 id="work-title" className={styles.label}><span className={styles.srOnly}>Work</span></h2>{HOME_SHOWCASE.map((project) => <section key={project.slug} id={`work-${project.slug}`} className={styles.project} tabIndex={-1} aria-labelledby={`work-${project.slug}-title`}><Reveal><header className={styles.header}><h3 id={`work-${project.slug}-title`} className={styles.title}>{project.title}</h3><div className={styles.meta}><span>{project.company}</span>{project.role && <span>{project.role}</span>}{project.period && <span>{project.period}</span>}</div></header><ProjectMedia project={project} running={running} /><p className={styles.summary}>{project.summary}</p>{project.url && <a className={styles.projectLink} href={project.url} target="_blank" rel="noreferrer">Visit cafemaps.net</a>}</Reveal></section>)}<button className={styles.motionControl} type="button" aria-pressed={motionPaused} onClick={() => setMotionPaused((value) => !value)}>{motionPaused ? "Resume motion" : "Pause motion"}</button></div>
    </div>
  </section>;
}
