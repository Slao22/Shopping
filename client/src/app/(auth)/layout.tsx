import Link from "next/link";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <h1>AuthLayout</h1>
      <Link href={"/"}>Home</Link>
      <div>{children}</div>;
    </div>
  );
}
