declare module "next/types.js" {
  export type ResolvingMetadata = unknown;
  export type ResolvingViewport = unknown;
}

declare module "next/server" {
  export interface NextRequest extends Request {
    json(): Promise<unknown>;
  }
  export interface NextResponse {
    status: number;
    headers: Headers;
    json(body: unknown, init?: ResponseInit): Response;
  }
}

declare module "next/server.js" {
  export interface NextRequest extends Request {
    json(): Promise<unknown>;
  }
  export interface NextResponse {
    status: number;
    headers: Headers;
    json(body: unknown, init?: ResponseInit): Response;
  }
}

declare module "next" {
  export interface Metadata {
    metadataBase?: URL;
    title?: string | { default: string; template?: string };
    description?: string;
    robots?: { index?: boolean; follow?: boolean };
    openGraph?: {
      title?: string;
      description?: string;
      url?: string;
      siteName?: string;
      type?: string;
      locale?: string;
      images?: Array<{ url: string; width?: number; height?: number; alt?: string }>;
    };
    twitter?: {
      card?: string;
      title?: string;
      description?: string;
    };
    alternates?: {
      canonical?: string;
    };
  }
}

declare module "next/font/google" {
  export function Geist(options: { variable?: string; subsets?: string[] }): { variable: string };
  export function Geist_Mono(options: { variable?: string; subsets?: string[] }): { variable: string };
  export function Bricolage_Grotesque(options: {
    variable?: string;
    subsets?: string[];
    weight?: string | string[];
  }): { variable: string };
  export function Ubuntu(options: {
    variable?: string;
    subsets?: string[];
    weight?: string | string[];
  }): { variable: string };
}

declare module "next/link" {
  interface LinkProps {
    href: string;
    children: React.ReactNode;
    className?: string;
    prefetch?: boolean;
    onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
    "aria-label"?: string;
  }
  const Link: (props: LinkProps) => JSX.Element;
  export default Link;
}

declare module "next/navigation" {
  export function useRouter(): {
    push: (href: string) => void;
    replace: (href: string) => void;
    back: () => void;
  };
  export function useSearchParams(): {
    get(name: string): string | null;
  };
}
