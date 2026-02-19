import { SimpleCard } from "@/components/ui/SimpleCard";
import { Typography } from "@/components/ui/Typography";
import { SafeWalletSelection } from "@/context/SafeWalletContext";
import { HiCog } from "react-icons/hi2";
import { LuCircleCheck, LuCircleHelp, LuCircleX, LuLoader } from "react-icons/lu";

interface WalletModuleStatusCardProps {
  selection: SafeWalletSelection;
}

export function WalletModuleStatusCard({
  selection,
}: WalletModuleStatusCardProps) {
  return (
    <SimpleCard className="p-5">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-xl bg-linear-to-br from-amber-500 to-orange-500 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
          <HiCog className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <Typography
            variant="bodySmall"
            className="font-semibold text-foreground mb-1"
          >
            TriggerX Module
          </Typography>
          <Typography
            variant="caption"
            className="text-muted-foreground"
          >
            Module status for automated transaction execution
          </Typography>
        </div>
      </div>

      {selection.checkingModule ? (
        <div className="flex items-center justify-center gap-2 py-8">
          <LuLoader className="w-5 h-5 animate-spin text-amber-500" />
          <span className="text-sm text-muted-foreground">
            Checking module status...
          </span>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3 py-3 px-4 rounded-xl bg-white/5 border border-white/10">
            <span className="text-sm text-muted-foreground">Status</span>
            <div className="flex items-center gap-2">
              {selection.moduleEnabled === true && (
                <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold bg-green-500/15 text-green-400 border border-green-500/30">
                  <LuCircleCheck className="w-3.5 h-3.5 shrink-0" />
                  Enabled
                </span>
              )}
              {selection.moduleEnabled === false && (
                <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/30">
                  <LuCircleX className="w-3.5 h-3.5 shrink-0" />
                  Disabled
                </span>
              )}
              {selection.moduleEnabled === null && (
                <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium bg-white/10 text-muted-foreground border border-white/15">
                  <LuCircleHelp className="w-3.5 h-3.5 shrink-0" />
                  Unknown
                </span>
              )}
            </div>
          </div>

          {selection.moduleEnabled === false && (
            <div className="flex gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25">
              <LuCircleX className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
              <Typography variant="caption" className="text-amber-200 text-xs leading-relaxed">
                Module is disabled. Use the toolbar to enable it.
              </Typography>
            </div>
          )}

          {selection.moduleEnabled === true && (
            <div className="flex gap-3 p-3 rounded-xl bg-green-500/10 border border-green-500/25">
              <LuCircleCheck className="w-4 h-4 shrink-0 text-green-400 mt-0.5" />
              <Typography variant="caption" className="text-green-200 text-xs leading-relaxed">
                Module is enabled and ready for automated transactions.
              </Typography>
            </div>
          )}
        </div>
      )}
    </SimpleCard>
  );
}
