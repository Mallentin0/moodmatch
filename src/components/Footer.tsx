import { Github, Twitter, ExternalLink, Instagram, Mail } from "lucide-react";
import { Button } from "./ui/button";

export function Footer() {
  return (
    <footer className="w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex flex-col items-center justify-center gap-4 py-8 md:py-4">
        <div className="flex flex-col items-center gap-4 px-4 text-center">
          <p className="text-sm leading-loose text-muted-foreground">
            Built by{" "}
            <a
              href="https://mallentino.com"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              Mallentino
            </a>
            . © 2025 All rights reserved.
          </p>
          <a
            href="mailto:info@mallentino.com"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            info@mallentino.com
          </a>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" size="icon" asChild>
            <a
              href="https://github.com/Mallentin0"
              target="_blank"
              rel="noreferrer"
              className="opacity-75 transition-opacity hover:opacity-100"
            >
              <Github className="h-4 w-4" />
              <span className="sr-only">GitHub</span>
            </a>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <a
              href="https://x.com/_mallentino"
              target="_blank"
              rel="noreferrer"
              className="opacity-75 transition-opacity hover:opacity-100"
            >
              <Twitter className="h-4 w-4" />
              <span className="sr-only">Twitter</span>
            </a>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <a
              href="https://www.instagram.com/mallentino/?hl=en"
              target="_blank"
              rel="noreferrer"
              className="opacity-75 transition-opacity hover:opacity-100"
            >
              <Instagram className="h-4 w-4" />
              <span className="sr-only">Instagram</span>
            </a>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <a
              href="https://www.tiktok.com/@mallentino.ai"
              target="_blank"
              rel="noreferrer"
              className="opacity-75 transition-opacity hover:opacity-100"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="sr-only">TikTok</span>
            </a>
          </Button>
        </div>
      </div>
    </footer>
  );
}