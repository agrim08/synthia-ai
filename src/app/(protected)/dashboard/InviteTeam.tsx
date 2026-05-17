"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import useProject from "@/hooks/useProject";
import { toast } from "sonner";
import { Copy, Check, Users, Sparkles, Link2 } from "lucide-react";

const InviteTeam = ({ children }: { children?: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);
  const { projectId } = useProject();

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const inviteLink = `${origin}/join/${projectId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    toast.success("Invite link copied to clipboard");
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children ? (
        <div onClick={() => setOpen(true)} className="cursor-pointer">
          {children}
        </div>
      ) : (
        <Button
          onClick={() => setOpen(true)}
          size="sm"
          disabled={!projectId}
          className="group relative bg-black hover:bg-black/80 text-cream rounded-full px-4 h-9"
        >
          <span className="font-medium">Invite Members</span>
        </Button>
      )}

      <DialogContent className="overflow-hidden rounded-3xl border border-ink/10 bg-cream p-0 shadow-pop sm:max-w-md">
        {/* ambient decorations */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-16 -right-16 size-48 rounded-full bg-coral-soft/60 blur-3xl animate-blob"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 -left-16 size-48 rounded-full bg-sky/40 blur-3xl animate-blob"
          style={{ animationDelay: "-4s" }}
        />

        <div className="relative p-7">
          <DialogHeader className="space-y-3 text-left">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-ink/10 bg-white/80 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-ink-soft shadow-soft">
                <Sparkles className="size-3 text-coral" />
                Collaboration
              </span>
            </div>
            <DialogTitle className="font-display text-3xl leading-tight text-ink">
              Invite your{" "}
              <span className="marker-highlight">teammates</span>
            </DialogTitle>
            <p className="text-sm leading-relaxed text-ink-soft">
              Share this private link with anyone you'd like to collaborate with. They'll instantly join this project workspace.
            </p>
          </DialogHeader>

          <div className="mt-6 space-y-3">
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-soft">
              <Link2 className="size-3.5 text-coral" />
              Invite link
            </label>

            <div className="group relative flex items-center gap-2 rounded-2xl border border-ink/10 bg-white p-1.5 pl-3 shadow-soft transition-all duration-300 focus-within:border-coral/60 focus-within:shadow-pop-sm hover:shadow-pop-sm">
              <Input
                readOnly
                onClick={handleCopy}
                value={inviteLink}
                className="h-10 border-0 bg-transparent px-0 text-sm text-ink shadow-none focus-visible:ring-0 truncate"
              />
              <Button
                type="button"
                onClick={handleCopy}
                size="sm"
                className={`relative h-10 shrink-0 rounded-xl px-4 font-medium transition-all duration-300 ${
                  copied
                    ? "bg-sage text-ink"
                    : "bg-ink text-cream hover:bg-coral hover:text-white"
                }`}
              >
                <span className="relative flex items-center gap-1.5">
                  {copied ? (
                    <>
                      <Check className="size-4 animate-fade-up" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="size-4" />
                      Copy
                    </>
                  )}
                </span>
              </Button>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-butter/40 px-3 py-2.5 text-xs text-ink-soft">
              <Sparkles className="size-3.5 shrink-0 text-coral" />
              Anyone with this link can join — only share with people you trust.
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InviteTeam;
