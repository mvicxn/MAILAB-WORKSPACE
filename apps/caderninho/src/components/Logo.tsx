export function Logo({ size = 44, marca = false }: { size?: number; marca?: boolean }) {
  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/mai-logo.png"
      alt="MAI LAB"
      height={size}
      className="object-contain object-left"
      style={{ height: size, width: "auto" }}
    />
  );
  if (!marca) {
    return img;
  }
  return <span className="logo-marca w-fit">{img}</span>;
}
