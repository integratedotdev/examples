"use client";

import { client } from "integrate-sdk";
import { useIntegrateAI } from "integrate-sdk/react";

export function Providers({ children }: { children: React.ReactNode }) {
    useIntegrateAI(client);
    return <>{children}</>;
}