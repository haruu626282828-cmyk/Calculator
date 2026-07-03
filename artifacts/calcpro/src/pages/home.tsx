import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCalculator } from "@/lib/use-calculator";
import { useKeyboardShortcuts } from "@/lib/use-keyboard-shortcuts";
import { useTheme } from "@/components/theme-provider";
import { Volume2, VolumeX, Moon, Sun, Clock, History as HistoryIcon, Copy, Trash2, CheckCircle2, ChevronRight, ChevronLeft } from "lucide-react";
import { Input } from "@/components/ui/input";

const GlassButton = ({ 
  onClick, 
  children, 
  className = "", 
  variant = "default" 
}: { 
  onClick?: () => void; 
  children: React.ReactNode; 
  className?: string;
  variant?: "default" | "primary" | "secondary" | "danger" | "ghost"
}) => {
  let btnClass = "glass-button";
  if (variant === "primary") btnClass = "glass-button-primary";
  if (variant === "secondary") btnClass = "glass-button-secondary";
  if (variant === "danger") btnClass = "bg-red-500/20 hover:bg-red-500/30 text-red-600 dark:text-red-400 border border-red-500/20 transition-all duration-200 active:scale-95";
  if (variant === "ghost") btnClass = "hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-200 active:scale-95 text-muted-foreground hover:text-foreground";

  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      className={`rounded-2xl flex items-center justify-center font-medium text-lg select-none ${btnClass} ${className}`}
    >
      {children}
    </motion.button>
  );
};

export default function Home() {
  const calc = useCalculator();
  useKeyboardShortcuts(calc);
  
  const { theme, setTheme } = useTheme();
  const [showHistory, setShowHistory] = useState(false);
  const [showScientific, setShowScientific] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      // ignore
    }
  };

  const handleCopyCurrent = async () => {
    const success = await calc.copyResult();
    if (success) {
      setCopiedId("current");
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full bg-mesh flex items-center justify-center p-4 sm:p-8 font-sans overflow-hidden">
      
      <div className="max-w-6xl w-full mx-auto flex flex-col lg:flex-row gap-6 items-stretch justify-center h-full max-h-[900px]">
        
        {/* Main Calculator Body */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-[2rem] w-full max-w-md flex flex-col flex-1 overflow-hidden shrink-0"
        >
          {/* Header Row */}
          <div className="flex items-center justify-between p-6 pb-2">
            <div className="flex items-center gap-2">
              <button 
                onClick={calc.sound.toggleSound}
                className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground transition-colors"
                aria-label={calc.sound.enabled ? "Mute sound" : "Unmute sound"}
              >
                {calc.sound.enabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              </button>
              <button 
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
            
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`p-2 rounded-full transition-colors flex items-center gap-2 px-4 ${showHistory ? 'bg-primary/20 text-primary' : 'hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground'}`}
            >
              <HistoryIcon size={20} />
              <span className="text-sm font-medium hidden sm:inline">History</span>
            </button>
          </div>

          {/* Display Area */}
          <div className="px-6 py-4 flex flex-col items-end justify-end min-h-[160px] relative group">
            <button 
              onClick={handleCopyCurrent}
              className="absolute top-2 left-6 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground"
              aria-label="Copy result"
            >
              {copiedId === "current" ? <CheckCircle2 size={16} className="text-green-500" /> : <Copy size={16} />}
            </button>

            {calc.error ? (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-destructive font-mono text-xl mb-2 text-right"
              >
                {calc.error}
              </motion.div>
            ) : (
              <AnimatePresence mode="wait">
                {calc.preview && (
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="text-muted-foreground font-mono text-2xl mb-2 text-right opacity-60"
                  >
                    = {calc.preview}
                  </motion.div>
                )}
              </AnimatePresence>
            )}

            <div 
              className={`w-full text-right font-mono tracking-tight break-all overflow-hidden ${calc.expression.length > 15 ? 'text-4xl' : 'text-6xl'} ${calc.error ? 'opacity-50' : 'text-foreground'}`}
            >
              {calc.expression}
            </div>
          </div>

          {/* Memory Row */}
          <div className="grid grid-cols-5 gap-2 px-6 py-2 border-y border-border/50 bg-black/5 dark:bg-white/5">
            <GlassButton variant="ghost" className="h-10 text-sm rounded-lg" onClick={calc.memoryClear}>MC</GlassButton>
            <GlassButton variant="ghost" className={`h-10 text-sm rounded-lg ${calc.hasMemory ? 'text-primary font-bold' : ''}`} onClick={calc.memoryRecall}>MR</GlassButton>
            <GlassButton variant="ghost" className="h-10 text-sm rounded-lg" onClick={calc.memoryAdd}>M+</GlassButton>
            <GlassButton variant="ghost" className="h-10 text-sm rounded-lg" onClick={calc.memorySubtract}>M-</GlassButton>
            <GlassButton variant="ghost" className="h-10 text-sm rounded-lg" onClick={calc.memoryStore}>MS</GlassButton>
          </div>

          {/* Keypad */}
          <div className="p-6 flex-1 flex flex-col gap-3 relative">
            
            {/* Scientific Drawer Toggle (Mobile) */}
            <div className="lg:hidden absolute top-[-40px] left-1/2 -translate-x-1/2 z-10">
              <button 
                onClick={() => setShowScientific(!showScientific)}
                className="bg-background/80 backdrop-blur border border-border/50 px-4 py-1 rounded-full text-xs font-medium text-muted-foreground shadow-sm flex items-center gap-1"
              >
                {showScientific ? 'Hide Scientific' : 'Show Scientific'}
              </button>
            </div>

            {/* Scientific Functions - Visible conditionally on mobile, always on desktop if room or embedded above numpad */}
            <AnimatePresence>
              {(showScientific || window.innerWidth >= 1024) && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="grid grid-cols-5 gap-2 mb-2 lg:mb-0 lg:hidden overflow-hidden"
                >
                  <GlassButton variant="secondary" className="h-12 text-sm rounded-xl" onClick={() => calc.setAngleMode(calc.angleMode === "DEG" ? "RAD" : "DEG")}>
                    {calc.angleMode}
                  </GlassButton>
                  <GlassButton variant="secondary" className="h-12 text-sm rounded-xl" onClick={() => calc.inputFunction("sin")}>sin</GlassButton>
                  <GlassButton variant="secondary" className="h-12 text-sm rounded-xl" onClick={() => calc.inputFunction("cos")}>cos</GlassButton>
                  <GlassButton variant="secondary" className="h-12 text-sm rounded-xl" onClick={() => calc.inputFunction("tan")}>tan</GlassButton>
                  <GlassButton variant="secondary" className="h-12 text-sm rounded-xl" onClick={calc.insertRandom}>rand</GlassButton>

                  <GlassButton variant="secondary" className="h-12 text-sm rounded-xl" onClick={() => calc.inputFunction("asin")}>sin⁻¹</GlassButton>
                  <GlassButton variant="secondary" className="h-12 text-sm rounded-xl" onClick={() => calc.inputFunction("acos")}>cos⁻¹</GlassButton>
                  <GlassButton variant="secondary" className="h-12 text-sm rounded-xl" onClick={() => calc.inputFunction("atan")}>tan⁻¹</GlassButton>
                  <GlassButton variant="secondary" className="h-12 text-sm rounded-xl" onClick={() => calc.input("π")}>π</GlassButton>
                  <GlassButton variant="secondary" className="h-12 text-sm rounded-xl" onClick={() => calc.input("e")}>e</GlassButton>
                  
                  <GlassButton variant="secondary" className="h-12 text-sm rounded-xl" onClick={() => calc.inputFunction("log")}>log</GlassButton>
                  <GlassButton variant="secondary" className="h-12 text-sm rounded-xl" onClick={() => calc.inputFunction("ln")}>ln</GlassButton>
                  <GlassButton variant="secondary" className="h-12 text-sm rounded-xl" onClick={() => calc.inputFunction("sqrt")}>√</GlassButton>
                  <GlassButton variant="secondary" className="h-12 text-sm rounded-xl" onClick={() => calc.inputFunction("cbrt")}>∛</GlassButton>
                  <GlassButton variant="secondary" className="h-12 text-sm rounded-xl" onClick={() => calc.input("⁻¹")}>x⁻¹</GlassButton>
                  
                  <GlassButton variant="secondary" className="h-12 text-sm rounded-xl" onClick={() => calc.input("²")}>x²</GlassButton>
                  <GlassButton variant="secondary" className="h-12 text-sm rounded-xl" onClick={() => calc.input("³")}>x³</GlassButton>
                  <GlassButton variant="secondary" className="h-12 text-sm rounded-xl" onClick={() => calc.input("^")}>xʸ</GlassButton>
                  <GlassButton variant="secondary" className="h-12 text-sm rounded-xl" onClick={() => calc.inputFunction("exp")}>eˣ</GlassButton>
                  <GlassButton variant="secondary" className="h-12 text-sm rounded-xl" onClick={() => calc.input("10^(")}>10ˣ</GlassButton>
                  
                  <GlassButton variant="secondary" className="h-12 text-sm rounded-xl" onClick={() => calc.input("!")}>x!</GlassButton>
                  <GlassButton variant="secondary" className="h-12 text-sm rounded-xl" onClick={() => calc.inputFunction("abs")}>|x|</GlassButton>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Numpad */}
            <div className="grid grid-cols-4 gap-3 flex-1">
              <GlassButton variant="danger" className="col-span-1" onClick={calc.allClear}>AC</GlassButton>
              <GlassButton variant="secondary" className="col-span-1" onClick={calc.clearEntry}>CE</GlassButton>
              <GlassButton variant="secondary" className="col-span-1" onClick={calc.backspace}>⌫</GlassButton>
              <GlassButton variant="secondary" className="col-span-1 text-2xl" onClick={() => calc.input("/")}>÷</GlassButton>

              <GlassButton onClick={() => calc.input("7")} className="text-2xl font-normal">7</GlassButton>
              <GlassButton onClick={() => calc.input("8")} className="text-2xl font-normal">8</GlassButton>
              <GlassButton onClick={() => calc.input("9")} className="text-2xl font-normal">9</GlassButton>
              <GlassButton variant="secondary" className="text-2xl" onClick={() => calc.input("*")}>×</GlassButton>

              <GlassButton onClick={() => calc.input("4")} className="text-2xl font-normal">4</GlassButton>
              <GlassButton onClick={() => calc.input("5")} className="text-2xl font-normal">5</GlassButton>
              <GlassButton onClick={() => calc.input("6")} className="text-2xl font-normal">6</GlassButton>
              <GlassButton variant="secondary" className="text-2xl" onClick={() => calc.input("-")}>−</GlassButton>

              <GlassButton onClick={() => calc.input("1")} className="text-2xl font-normal">1</GlassButton>
              <GlassButton onClick={() => calc.input("2")} className="text-2xl font-normal">2</GlassButton>
              <GlassButton onClick={() => calc.input("3")} className="text-2xl font-normal">3</GlassButton>
              <GlassButton variant="secondary" className="text-2xl" onClick={() => calc.input("+")}>+</GlassButton>

              <GlassButton onClick={() => calc.input("0")} className="col-span-1 text-2xl font-normal">0</GlassButton>
              <GlassButton onClick={() => calc.input(".")} className="text-2xl">.</GlassButton>
              <GlassButton onClick={calc.toggleSign} className="text-xl">±</GlassButton>
              <GlassButton variant="primary" className="text-3xl font-light" onClick={calc.execute}>=</GlassButton>
            </div>
            
            <div className="grid grid-cols-4 gap-3 mt-1">
              <GlassButton variant="ghost" className="h-12" onClick={() => calc.input("(")}>(</GlassButton>
              <GlassButton variant="ghost" className="h-12" onClick={() => calc.input(")")}>)</GlassButton>
              <GlassButton variant="ghost" className="h-12" onClick={() => calc.input("%")}>%</GlassButton>
              <GlassButton variant="ghost" className="h-12" onClick={() => calc.input("mod")}>mod</GlassButton>
            </div>
          </div>

        </motion.div>

        {/* Desktop Scientific Panel (Side-by-side with numpad) */}
        <div className="hidden lg:flex flex-col gap-6 w-full max-w-[320px]">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-panel rounded-[2rem] p-6 flex flex-col flex-1"
          >
            <h3 className="text-lg font-medium mb-4 text-muted-foreground">Scientific</h3>
            <div className="grid grid-cols-4 gap-2 flex-1">
              <GlassButton variant="secondary" className="text-sm rounded-xl" onClick={() => calc.setAngleMode(calc.angleMode === "DEG" ? "RAD" : "DEG")}>
                {calc.angleMode}
              </GlassButton>
              <GlassButton variant="secondary" className="text-sm rounded-xl" onClick={() => calc.input("π")}>π</GlassButton>
              <GlassButton variant="secondary" className="text-sm rounded-xl" onClick={() => calc.input("e")}>e</GlassButton>
              <GlassButton variant="secondary" className="text-sm rounded-xl" onClick={calc.insertRandom}>rand</GlassButton>

              <GlassButton variant="secondary" className="text-sm rounded-xl" onClick={() => calc.inputFunction("sin")}>sin</GlassButton>
              <GlassButton variant="secondary" className="text-sm rounded-xl" onClick={() => calc.inputFunction("cos")}>cos</GlassButton>
              <GlassButton variant="secondary" className="text-sm rounded-xl" onClick={() => calc.inputFunction("tan")}>tan</GlassButton>
              <GlassButton variant="secondary" className="text-sm rounded-xl" onClick={() => calc.inputFunction("log")}>log</GlassButton>

              <GlassButton variant="secondary" className="text-sm rounded-xl" onClick={() => calc.inputFunction("asin")}>sin⁻¹</GlassButton>
              <GlassButton variant="secondary" className="text-sm rounded-xl" onClick={() => calc.inputFunction("acos")}>cos⁻¹</GlassButton>
              <GlassButton variant="secondary" className="text-sm rounded-xl" onClick={() => calc.inputFunction("atan")}>tan⁻¹</GlassButton>
              <GlassButton variant="secondary" className="text-sm rounded-xl" onClick={() => calc.inputFunction("ln")}>ln</GlassButton>

              <GlassButton variant="secondary" className="text-sm rounded-xl" onClick={() => calc.inputFunction("sqrt")}>√</GlassButton>
              <GlassButton variant="secondary" className="text-sm rounded-xl" onClick={() => calc.input("²")}>x²</GlassButton>
              <GlassButton variant="secondary" className="text-sm rounded-xl" onClick={() => calc.input("^")}>xʸ</GlassButton>
              <GlassButton variant="secondary" className="text-sm rounded-xl" onClick={() => calc.inputFunction("exp")}>eˣ</GlassButton>
              
              <GlassButton variant="secondary" className="text-sm rounded-xl" onClick={() => calc.inputFunction("cbrt")}>∛</GlassButton>
              <GlassButton variant="secondary" className="text-sm rounded-xl" onClick={() => calc.input("³")}>x³</GlassButton>
              <GlassButton variant="secondary" className="text-sm rounded-xl" onClick={() => calc.input("⁻¹")}>x⁻¹</GlassButton>
              <GlassButton variant="secondary" className="text-sm rounded-xl" onClick={() => calc.input("10^(")}>10ˣ</GlassButton>
              
              <GlassButton variant="secondary" className="text-sm rounded-xl" onClick={() => calc.input("!")}>x!</GlassButton>
              <GlassButton variant="secondary" className="text-sm rounded-xl" onClick={() => calc.inputFunction("abs")}>|x|</GlassButton>
            </div>
          </motion.div>
        </div>

        {/* History Panel */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ opacity: 0, x: 20, width: 0 }}
              animate={{ opacity: 1, x: 0, width: "100%", maxWidth: "400px" }}
              exit={{ opacity: 0, x: 20, width: 0 }}
              className="glass-panel rounded-[2rem] flex flex-col overflow-hidden hidden lg:flex"
            >
              <div className="p-6 border-b border-border/50 flex items-center justify-between">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Clock size={20} className="text-primary" />
                  History
                </h2>
                {calc.history.history.length > 0 && (
                  <button 
                    onClick={calc.history.clearAll}
                    className="text-sm text-destructive hover:text-destructive/80 font-medium transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>
              
              <div className="p-4 border-b border-border/50">
                <Input 
                  placeholder="Search history..." 
                  value={calc.history.searchQuery}
                  onChange={(e) => calc.history.setSearchQuery(e.target.value)}
                  className="bg-black/5 dark:bg-white/5 border-none focus-visible:ring-primary/50"
                />
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {calc.history.filteredHistory.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                    No history found.
                  </div>
                ) : (
                  calc.history.filteredHistory.map((item) => (
                    <motion.div 
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors group relative"
                    >
                      <div className="pr-8 cursor-pointer" onClick={() => calc.reuseFromHistory(item.expression)}>
                        <div className="text-sm text-muted-foreground font-mono truncate mb-1">
                          {item.expression}
                        </div>
                        <div className="text-2xl font-medium font-mono truncate">
                          = {item.result}
                        </div>
                      </div>
                      
                      <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleCopy(item.result, item.id); }}
                          className="p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 text-muted-foreground"
                          title="Copy result"
                        >
                          {copiedId === item.id ? <CheckCircle2 size={16} className="text-green-500" /> : <Copy size={16} />}
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); calc.history.deleteEntry(item.id); }}
                          className="p-2 rounded-lg hover:bg-destructive/20 text-destructive/70 hover:text-destructive"
                          title="Delete entry"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile History Overlay (visible only on small screens when showHistory is true) */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              className="fixed inset-0 z-50 glass-panel lg:hidden flex flex-col rounded-none"
            >
              <div className="p-6 pt-12 border-b border-border/50 flex items-center justify-between">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  <Clock size={24} className="text-primary" />
                  History
                </h2>
                <button 
                  onClick={() => setShowHistory(false)}
                  className="px-4 py-2 bg-black/10 dark:bg-white/10 rounded-full font-medium"
                >
                  Close
                </button>
              </div>
              
              <div className="p-4 border-b border-border/50">
                <Input 
                  placeholder="Search history..." 
                  value={calc.history.searchQuery}
                  onChange={(e) => calc.history.setSearchQuery(e.target.value)}
                  className="bg-black/5 dark:bg-white/5 border-none focus-visible:ring-primary/50 text-lg py-6 rounded-xl"
                />
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {calc.history.filteredHistory.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    No history found.
                  </div>
                ) : (
                  calc.history.filteredHistory.map((item) => (
                    <div 
                      key={item.id}
                      className="p-5 rounded-2xl bg-black/5 dark:bg-white/5 active:bg-black/10 dark:active:bg-white/10 transition-colors relative"
                    >
                      <div className="pr-12" onClick={() => { calc.reuseFromHistory(item.expression); setShowHistory(false); }}>
                        <div className="text-base text-muted-foreground font-mono truncate mb-2">
                          {item.expression}
                        </div>
                        <div className="text-3xl font-medium font-mono truncate">
                          = {item.result}
                        </div>
                      </div>
                      
                      <div className="absolute top-4 right-4 flex flex-col gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleCopy(item.result, item.id); }}
                          className="p-3 rounded-xl bg-black/5 dark:bg-white/5 text-foreground"
                        >
                          {copiedId === item.id ? <CheckCircle2 size={20} className="text-green-500" /> : <Copy size={20} />}
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); calc.history.deleteEntry(item.id); }}
                          className="p-3 rounded-xl bg-destructive/10 text-destructive"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {calc.history.history.length > 0 && (
                <div className="p-6 border-t border-border/50 pb-safe">
                  <button 
                    onClick={calc.history.clearAll}
                    className="w-full py-4 text-center rounded-xl bg-destructive/10 text-destructive font-semibold text-lg active:scale-95 transition-transform"
                  >
                    Clear All History
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
