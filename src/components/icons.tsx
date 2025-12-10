import type { SVGProps } from "react";

export const Icons = {
  logo: (props: SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M14.5 17.5L12 20l-2.5-2.5" />
      <path d="M12 14v6" />
      <path d="M18.5 12.5L21 15l-2.5 2.5" />
      <path d="M15 15h6" />
      <path d="M5.5 12.5L3 15l2.5 2.5" />
      <path d="M3 15h6" />
      <path d="M12 4a8 8 0 0 0-8 8" />
      <path d="M12 4a8 8 0 0 1 8 8" />
    </svg>
  ),
};
