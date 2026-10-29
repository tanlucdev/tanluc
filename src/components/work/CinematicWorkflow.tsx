import Image from "next/image";

const asset = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/images/work/cinematic-ai/`;

function Check() {
  return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="m5 12 4 4L19 6" /></svg>;
}

export default function CinematicWorkflow({ compact = false }: { compact?: boolean }) {
  const inputEnd = compact ? 205 : 192;
  const nodeStart = compact ? 276 : 260;
  const nodeEnd = compact ? 494 : 544;
  const outputStart = compact ? 587 : 611;
  return (
    <section aria-label="Cinematic AI workflow preview" className={`cinematic-workflow${compact ? " cinematic-workflow--compact" : ""}`}>
      <svg aria-hidden="true" className="cinematic-workflow__wires" viewBox="0 0 838 409" preserveAspectRatio="none">
        <path d={`M${inputEnd} 98C${(inputEnd + nodeStart) / 2} 98 ${(inputEnd + nodeStart) / 2} 170 ${nodeStart} 170`} />
        <path d={`M${inputEnd} 310C${(inputEnd + nodeStart) / 2} 310 ${(inputEnd + nodeStart) / 2} 239 ${nodeStart} 239`} />
        <path d={`M${nodeEnd} 205C${(nodeEnd + outputStart) / 2} 205 ${(nodeEnd + outputStart) / 2} 207 ${outputStart} 207`} />
      </svg>
      <figure className="cinematic-workflow__input cinematic-workflow__input--character">
        <figcaption>Character image</figcaption>
        <Image alt="" height={480} sizes="13vw" src={`${asset}character.jpg`} width={480} />
      </figure>
      <figure className="cinematic-workflow__input cinematic-workflow__input--product">
        <figcaption>Product image</figcaption>
        <Image alt="" height={480} sizes="13vw" src={`${asset}product.jpg`} width={480} />
      </figure>
      <div className="cinematic-workflow__node">
        <span className="cinematic-workflow__muted">Required inputs</span>
        {[
          ["character.jpg", "Character image"],
          ["product.jpg", "Product image"],
        ].map(([image, label]) => (
          <div className="cinematic-workflow__requirement" key={label}>
            <Image alt="" height={480} sizes="32px" src={`${asset}${image}`} width={480} />
            <strong>{label}</strong>
            <Check />
          </div>
        ))}
        <div className="cinematic-workflow__footer">
          <span><svg aria-hidden="true" viewBox="0 0 24 24"><path d="m12 3-9 4.5 9 4.5 9-4.5L12 3Z" /><path d="m3 12 9 4.5 9-4.5M3 16.5 12 21l9-4.5" /></svg>4 steps</span>
          <span aria-hidden="true" className="cinematic-workflow__run"><svg viewBox="0 0 24 24"><path d="m5 12 7-7 7 7M12 19V5" /></svg></span>
        </div>
      </div>
      <figure className="cinematic-workflow__output">
        <figcaption>Product film · 00:00:06:00</figcaption>
        <video aria-hidden="true" autoPlay loop muted playsInline poster={`${asset}product-film.jpg`} preload="metadata" src={`${asset}product-film.mp4`} />
      </figure>
    </section>
  );
}
