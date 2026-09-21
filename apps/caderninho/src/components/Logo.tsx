export function Logo({ size = 44 }: { size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/mai-logo.png"
      alt="MAI LAB"
      height={size}
      className="object-contain object-left"
      style={{ height: size, width: "auto" }}
    />
  );
}
