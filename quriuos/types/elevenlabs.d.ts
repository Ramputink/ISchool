import type { DetailedHTMLProps, HTMLAttributes } from "react";

// Permite usar el custom element del widget de ElevenLabs en JSX.
declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "elevenlabs-convai": DetailedHTMLProps<
        HTMLAttributes<HTMLElement> & {
          "agent-id"?: string;
          variant?: string;
          "dynamic-variables"?: string;
        },
        HTMLElement
      >;
    }
  }
}

export {};
