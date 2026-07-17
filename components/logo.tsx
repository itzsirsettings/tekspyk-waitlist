import Image from "next/image";

interface LogoMarkProps {
  imageClassName?: string;
  showAcademy?: boolean;
  priority?: boolean;
}

export function LogoMark({ imageClassName = "h-7 w-auto", showAcademy = true, priority = false }: LogoMarkProps) {
  return (
    <span className="inline-flex items-center gap-2">
      <Image
        src="/logo.png"
        alt="TekSpyk"
        width={1200}
        height={320}
        className={imageClassName}
        priority={priority}
      />
      {showAcademy ? <span className="font-medium text-ink-faint">Academy</span> : null}
    </span>
  );
}
