"use client";

import authApiRequets from "@/apiRequest/auth";
import { Button } from "@/components/ui/button";
import { clientSessionToken } from "@/lib/http";
import { useEffect } from "react";
import { differenceInHours } from "date-fns";
export default function SlideSession() {
  useEffect(() => {
    const interval = setInterval(async () => {
      const now = new Date();
      const expiresAt = new Date(clientSessionToken.expiresAt);
      if (differenceInHours(expiresAt, now) < 1) {
        const res =
          await authApiRequets.slideSessionFromNextClientToNextServer();
        clientSessionToken.expiresAt = res.payload.data.expiresAt;
      }
    }, 1000 * 60 * 60);
    return () => clearInterval(interval);
  }, []);
  const slideSession = async () => {
    const res = await authApiRequets.slideSessionFromNextClientToNextServer();
    clientSessionToken.expiresAt = res.payload.data.expiresAt;
  };
  return (
    <div>
      <Button onClick={slideSession}>Click to slide session</Button>
    </div>
  );
}
