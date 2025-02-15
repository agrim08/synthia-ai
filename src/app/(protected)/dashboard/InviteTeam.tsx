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

const InviteTeam = () => {
  const [open, setOpen] = useState(false);
  const [origin, setOrigin] = useState("");
  const { projectId } = useProject();

  // Set the window origin only on the client side
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const inviteLink = `${origin}/join/${projectId}`;

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Members</DialogTitle>
            <p className="text-sm text-gray-200">
              Ask them to copy &amp; paste this link
            </p>
            <Input
              className="mt-4"
              readOnly
              onClick={() => {
                navigator.clipboard.writeText(inviteLink);
                toast.success("Copied to clipboard!");
              }}
              value={inviteLink}
            />
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <Button
        onClick={() => setOpen(true)}
        size="sm"
        className="bg-indigo-700 hover:bg-indigo-800"
      >
        Invite Members
      </Button>
    </>
  );
};

export default InviteTeam;
