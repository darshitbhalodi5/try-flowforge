import { Button } from "@/components/ui/Button";
import { SimpleCard } from "@/components/ui/SimpleCard";
import { Typography } from "@/components/ui/Typography";
import { ChainInfo } from "@/web3/config/chain-registry";
import { LuCheck, LuLoader } from "react-icons/lu";

interface WalletNetworkSelectionCardProps {
  availableChains: ChainInfo[];
  selectedChainIds: Set<string>;
  isCheckingUser: boolean;
  isSavingChains: boolean;
  hasUnsavedChainSelection: boolean;
  onToggleChain: (chainId: string) => void;
  onSaveSelection: () => void;
}

export function WalletNetworkSelectionCard({
  availableChains,
  selectedChainIds,
  isCheckingUser,
  isSavingChains,
  hasUnsavedChainSelection,
  onToggleChain,
  onSaveSelection,
}: WalletNetworkSelectionCardProps) {
  return (
    <SimpleCard className="p-5">
      <div className="space-y-1 mb-4">
        <Typography variant="h5" className="font-semibold text-foreground">
          Wallet Set-up Networks
        </Typography>
        <Typography variant="bodySmall" className="text-muted-foreground">
          Choose networks and initialize Safe + module setup directly from this block.
        </Typography>
      </div>

      {isCheckingUser ? (
        <div className="flex items-center justify-center py-6">
          <LuLoader className="w-5 h-5 animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted-foreground">
            Loading network preferences...
          </span>
        </div>
      ) : (
        <>
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
            {availableChains.map((chain) => {
              const isSelected = selectedChainIds.has(chain.id);
              return (
                <button
                  type="button"
                  key={chain.id}
                  onClick={() => onToggleChain(chain.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border text-left transition-all duration-200 ${
                    isSelected
                      ? "border-amber-500/70 bg-amber-500/10 shadow-[0_0_0_1px_rgba(245,158,11,0.25)]"
                      : "border-white/15 bg-white/5 hover:bg-white/10 hover:border-amber-500/40"
                  }`}
                >
                  <div className="space-y-0.5">
                    <Typography
                      variant="bodySmall"
                      className="text-foreground font-medium"
                    >
                      {chain.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      className="text-muted-foreground"
                    >
                      {chain.isTestnet ? "Testnet" : "Mainnet"}
                    </Typography>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors duration-200 ${
                      isSelected
                        ? "border-amber-300 bg-amber-300 text-black"
                        : "border-white/25 text-transparent"
                    }`}
                  >
                    <LuCheck className="w-3.5 h-3.5" />
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-3">
            <Typography variant="caption" className="text-muted-foreground">
              {selectedChainIds.size} network
              {selectedChainIds.size !== 1 ? "s" : ""} selected
            </Typography>
            <Button
              onClick={onSaveSelection}
              disabled={
                isSavingChains ||
                selectedChainIds.size === 0 ||
                !hasUnsavedChainSelection
              }
              className="h-9 px-4 text-xs bg-white/10 hover:bg-white/20 border border-white/20 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSavingChains ? "Saving..." : "Save Selection"}
            </Button>
          </div>

          {selectedChainIds.size === 0 && (
            <div className="mt-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/40">
              <Typography variant="caption" className="text-amber-300 text-xs">
                Select at least one network before saving.
              </Typography>
            </div>
          )}
        </>
      )}
    </SimpleCard>
  );
}
