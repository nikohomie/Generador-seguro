import { useState, useEffect, useCallback } from 'react';
import { Copy, RefreshCw, Check, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({
    upper: true,
    lower: true,
    numbers: true,
    symbols: true,
  });
  const [copied, setCopied] = useState(false);

  const generatePassword = useCallback(() => {
    let charset = '';
    if (options.upper) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (options.lower) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (options.numbers) charset += '0123456789';
    if (options.symbols) charset += '!@#$%^&*()_+~`|}{[]:;?><,./-=';

    if (charset === '') {
      setPassword('');
      return;
    }

    let newPassword = '';
    const array = new Uint32Array(length);
    window.crypto.getRandomValues(array);
    
    for (let i = 0; i < length; i++) {
      newPassword += charset[array[i] % charset.length];
    }
    setPassword(newPassword);
  }, [length, options]);

  useEffect(() => {
    generatePassword();
  }, [generatePassword]);

  const copyToClipboard = async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy password', err);
    }
  };

  const handleOptionChange = (key: keyof typeof options) => {
    setOptions(prev => {
      const next = { ...prev, [key]: !prev[key] };
      // Evitar que se desmarquen todas las opciones
      if (!Object.values(next).some(Boolean)) {
        return prev;
      }
      return next;
    });
  };

  // Calcula la fuerza de la contraseña (básico)
  const calculateStrength = () => {
    let score = 0;
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;
    if (options.upper) score += 1;
    if (options.lower) score += 1;
    if (options.numbers) score += 1;
    if (options.symbols) score += 1;
    
    if (score <= 2) return { label: 'Débil', color: 'bg-red-500', text: 'text-red-500' };
    if (score <= 4) return { label: 'Media', color: 'bg-yellow-500', text: 'text-yellow-500' };
    return { label: 'Fuerte', color: 'bg-emerald-500', text: 'text-emerald-500' };
  };

  const strength = calculateStrength();

  return (
    <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center p-4 md:p-10 font-sans text-zinc-300 selection:bg-emerald-500/30 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl flex flex-col gap-8 my-auto"
      >
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-white tracking-tight">Generador Seguro <span className="text-emerald-500 text-sm font-mono ml-2 opacity-80">v2.0</span></h1>
            <p className="text-zinc-500 text-sm mt-1">Generación criptográfica de claves</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <ShieldCheck className="w-6 h-6 text-emerald-500" />
          </div>
        </header>

        <div className="bg-[#16161a] border border-zinc-800 rounded-[2.5rem] p-8 md:p-12 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-30"></div>
          
          <div className="text-zinc-600 text-xs uppercase tracking-[0.2em] mb-6 font-semibold">Contraseña Generada</div>
          
          <div className="w-full relative flex items-center justify-center group min-h-[4rem]">
            <div className="text-3xl md:text-5xl font-mono text-white tracking-wider text-center break-all px-12">
              {password}
            </div>
            
            <button
              onClick={copyToClipboard}
              className="absolute right-0 w-10 h-10 md:w-12 md:h-12 rounded-xl bg-zinc-800 flex items-center justify-center cursor-pointer hover:bg-zinc-700 transition-colors border border-zinc-700/50"
              title="Copiar contraseña"
            >
              <AnimatePresence mode="wait" initial={false}>
                {copied ? (
                  <motion.div
                    key="check"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                  >
                    <Check className="w-5 h-5 text-emerald-500" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="copy"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                  >
                    <Copy className="w-5 h-5 text-zinc-400 group-hover:text-white" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>

          <div className="mt-10 flex flex-col items-center gap-3">
            <div className="flex items-center gap-2 md:gap-3">
              <div className={`h-1.5 w-12 md:w-16 rounded-full ${strength.label !== 'Débil' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]'} transition-colors duration-500`}></div>
              <div className={`h-1.5 w-12 md:w-16 rounded-full ${strength.label === 'Débil' ? 'bg-zinc-800' : (strength.label === 'Fuerte' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.3)]')} transition-colors duration-500`}></div>
              <div className={`h-1.5 w-12 md:w-16 rounded-full ${strength.label === 'Fuerte' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-zinc-800'} transition-colors duration-500`}></div>
              <div className={`h-1.5 w-12 md:w-16 rounded-full ${strength.label === 'Fuerte' && length >= 16 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-zinc-800'} transition-colors duration-500`}></div>
            </div>
            <span className={`text-xs font-bold uppercase tracking-widest ${strength.text}`}>{strength.label}</span>
          </div>
        </div>

        <div className="bg-[#16161a] border border-zinc-800 rounded-[2.5rem] p-8 md:p-10 flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <label htmlFor="length-slider" className="text-sm text-zinc-400 font-medium uppercase tracking-widest">Longitud de contraseña</label>
              <span className="text-white font-mono text-xl">{length}</span>
            </div>
            <div className="relative w-full h-6 flex items-center">
              <input
                id="length-slider"
                type="range"
                min="8"
                max="64"
                value={length}
                onChange={(e) => setLength(Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <label className="flex items-center justify-between p-5 bg-[#0d0d0f] rounded-2xl border border-zinc-800/50 cursor-pointer group">
              <span className={`text-sm font-medium ${options.upper ? 'text-white' : 'text-zinc-500'}`}>Mayúsculas (A-Z)</span>
              <div className={`w-10 h-6 rounded-full flex items-center px-1 transition-colors ${options.upper ? 'bg-emerald-600' : 'bg-zinc-800'}`}>
                <div className={`w-4 h-4 rounded-full transition-all ${options.upper ? 'bg-white ml-auto' : 'bg-zinc-600'}`}></div>
              </div>
              <input type="checkbox" className="hidden" checked={options.upper} onChange={() => handleOptionChange('upper')} />
            </label>

            <label className="flex items-center justify-between p-5 bg-[#0d0d0f] rounded-2xl border border-zinc-800/50 cursor-pointer group">
              <span className={`text-sm font-medium ${options.lower ? 'text-white' : 'text-zinc-500'}`}>Minúsculas (a-z)</span>
              <div className={`w-10 h-6 rounded-full flex items-center px-1 transition-colors ${options.lower ? 'bg-emerald-600' : 'bg-zinc-800'}`}>
                <div className={`w-4 h-4 rounded-full transition-all ${options.lower ? 'bg-white ml-auto' : 'bg-zinc-600'}`}></div>
              </div>
              <input type="checkbox" className="hidden" checked={options.lower} onChange={() => handleOptionChange('lower')} />
            </label>

            <label className="flex items-center justify-between p-5 bg-[#0d0d0f] rounded-2xl border border-zinc-800/50 cursor-pointer group">
              <span className={`text-sm font-medium ${options.numbers ? 'text-white' : 'text-zinc-500'}`}>Números (0-9)</span>
              <div className={`w-10 h-6 rounded-full flex items-center px-1 transition-colors ${options.numbers ? 'bg-emerald-600' : 'bg-zinc-800'}`}>
                <div className={`w-4 h-4 rounded-full transition-all ${options.numbers ? 'bg-white ml-auto' : 'bg-zinc-600'}`}></div>
              </div>
              <input type="checkbox" className="hidden" checked={options.numbers} onChange={() => handleOptionChange('numbers')} />
            </label>

            <label className="flex items-center justify-between p-5 bg-[#0d0d0f] rounded-2xl border border-zinc-800/50 cursor-pointer group">
              <span className={`text-sm font-medium ${options.symbols ? 'text-white' : 'text-zinc-500'}`}>Símbolos Especiales</span>
              <div className={`w-10 h-6 rounded-full flex items-center px-1 transition-colors ${options.symbols ? 'bg-emerald-600' : 'bg-zinc-800'}`}>
                <div className={`w-4 h-4 rounded-full transition-all ${options.symbols ? 'bg-white ml-auto' : 'bg-zinc-600'}`}></div>
              </div>
              <input type="checkbox" className="hidden" checked={options.symbols} onChange={() => handleOptionChange('symbols')} />
            </label>
          </div>
          
          <button
            onClick={generatePassword}
            className="w-full py-5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 mt-2"
          >
            <RefreshCw className="w-4 h-4" />
            Regenerar Contraseña
          </button>
        </div>
      </motion.div>
    </div>
  );
}
