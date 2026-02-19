import type { Metadata } from "next";
import LogoOnlyHeader from "@/components/layout/LogoOnlyHeader";
import AgentOnboardingPageClient from "@/components/onboarding/AgentOnboardingPageClient";
import { WorkflowProvider } from "@/context/WorkflowContext";

export const metadata: Metadata = {
  title: "Agent Onboarding - FlowForge",
  description:
    "Connect your wallet and Telegram to start interacting with the FlowForge agent.",
};

export default function AgentOnboardingPage() {
  return (
    <div className="bg-background">
      <LogoOnlyHeader />
      <main className="w-[90%] mx-auto mt-40">
        <WorkflowProvider>
          <AgentOnboardingPageClient />
        </WorkflowProvider>
      </main>
    </div>
  );
}

