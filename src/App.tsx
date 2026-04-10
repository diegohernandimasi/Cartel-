/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { User, Lock, LogOut, MessageSquare, CheckCircle2, AlertCircle } from "lucide-react";
import { db } from "./firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

type AuthMode = "login" | "register";

interface UserData {
  username: string;
  pin: string;
}

export default function App() {
  const [mode, setMode] = useState<AuthMode>("register");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  
  // Form states
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Feature states
  const [showHello, setShowHello] = useState(false);

  // Check for session in localStorage (just for convenience, real data is in Firestore)
  useEffect(() => {
    const savedUser = localStorage.getItem("current_session_user");
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
    }
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    const cleanUsername = username.trim().toLowerCase();

    if (cleanUsername.length < 3) {
      setError("El usuario debe tener al menos 3 caracteres.");
      setIsLoading(false);
      return;
    }

    if (!/^\d{4}$/.test(pin)) {
      setError("La clave debe ser de exactamente 4 números.");
      setIsLoading(false);
      return;
    }

    try {
      const userRef = doc(db, "users", cleanUsername);
      const userSnap = await getDoc(userRef);

      if (mode === "register") {
        if (userSnap.exists()) {
          setError("Este nombre de usuario ya está registrado.");
        } else {
          const newUser = { 
            username: cleanUsername, 
            pin,
            createdAt: serverTimestamp()
          };
          await setDoc(userRef, newUser);
          setSuccess("¡Registro exitoso! Ahora puedes iniciar sesión.");
          setMode("login");
          setPin("");
        }
      } else {
        if (userSnap.exists() && userSnap.data().pin === pin) {
          const userData = { username: userSnap.data().username, pin: userSnap.data().pin };
          setCurrentUser(userData);
          setIsLoggedIn(true);
          localStorage.setItem("current_session_user", JSON.stringify(userData));
        } else {
          setError("Usuario o clave incorrectos.");
        }
      }
    } catch (err) {
      console.error("Auth Error:", err);
      setError("Ocurrió un error al conectar con la base de datos.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setPin("");
    setShowHello(false);
    localStorage.removeItem("current_session_user");
  };

  const triggerHello = () => {
    setShowHello(true);
    setTimeout(() => {
      setShowHello(false);
    }, 5000);
  };

  if (!isLoggedIn) {
    return (
      <div 
        className="min-h-screen bg-cover bg-center flex items-center justify-center p-4 font-sans relative"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=1920')" }}
      >
        {/* Overlay for better contrast */}
        <div className="absolute inset-0 bg-black/20" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-xl p-8 rounded-[32px] shadow-2xl w-full max-w-md border border-white/30 relative z-10"
        >
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white border border-white/30">
              <User size={24} />
            </div>
          </div>
          
          <h1 className="text-2xl font-semibold text-center mb-2 text-white drop-shadow-md">
            {mode === "register" ? "Crear Cuenta" : "Bienvenido"}
          </h1>
          <p className="text-sm text-white/70 text-center mb-8">
            {mode === "register" 
              ? "Regístrate para acceder a la aplicación" 
              : "Ingresa tus credenciales para continuar"}
          </p>

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-white/60 uppercase tracking-wider mb-1 ml-1">
                Usuario
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={18} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-white focus:border-transparent transition-all outline-none text-white placeholder:text-white/30"
                  placeholder="Tu nombre de usuario"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-white/60 uppercase tracking-wider mb-1 ml-1">
                Clave (4 números)
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={18} />
                <input
                  type="password"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-white focus:border-transparent transition-all outline-none text-white placeholder:text-white/30"
                  placeholder="••••"
                  required
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 text-red-200 text-sm bg-red-500/20 backdrop-blur-sm p-3 rounded-lg border border-red-500/30"
                >
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </motion.div>
              )}
              {success && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 text-green-200 text-sm bg-green-500/20 backdrop-blur-sm p-3 rounded-lg border border-green-500/30"
                >
                  <CheckCircle2 size={16} />
                  <span>{success}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-white text-black py-3 rounded-xl font-semibold transition-all active:scale-[0.98] transform flex items-center justify-center gap-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-gray-100 hover:shadow-lg'}`}
            >
              {isLoading && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-black border-t-transparent rounded-full"
                />
              )}
              {mode === "register" ? "Registrarse" : "Iniciar Sesión"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setMode(mode === "register" ? "login" : "register");
                setError("");
                setSuccess("");
              }}
              className="text-sm text-white/60 hover:text-white transition-colors"
            >
              {mode === "register" 
                ? "¿Ya tienes cuenta? Inicia sesión" 
                : "¿No tienes cuenta? Regístrate"}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-cover bg-center flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=1920')" }}
    >
      {/* Overlay for better contrast */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center max-w-7xl mx-auto w-full z-20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-black">
            <MessageSquare size={16} />
          </div>
          <span className="font-semibold text-white drop-shadow-md">Hola Mundo App</span>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20"
        >
          <LogOut size={16} />
          <span>Salir</span>
        </button>
      </div>

      {/* Main Content */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center relative z-10"
      >
        <h2 className="text-3xl font-light text-white/70 mb-8 drop-shadow-lg">
          Hola, <span className="font-semibold text-white">{currentUser?.username}</span>
        </h2>
        
        <button
          onClick={triggerHello}
          disabled={showHello}
          className={`
            group relative px-12 py-6 rounded-full font-semibold text-xl transition-all duration-300
            ${showHello 
              ? "bg-white/20 text-white/40 cursor-not-allowed backdrop-blur-sm" 
              : "bg-white text-black hover:bg-gray-100 hover:shadow-2xl active:scale-95 shadow-xl"}
          `}
        >
          <span className="relative z-10">Presionar para el saludo</span>
          {!showHello && (
            <motion.div 
              className="absolute inset-0 bg-black/5 rounded-full"
              initial={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </button>
      </motion.div>

      {/* Hello Message Overlay */}
      <AnimatePresence>
        {showHello && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.8 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <div className="bg-white px-12 py-8 rounded-[32px] shadow-2xl border border-gray-100 flex flex-col items-center gap-4">
              <motion.div 
                animate={{ 
                  rotate: [0, 10, -10, 10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-6xl"
              >
                👋
              </motion.div>
              <h1 className="text-5xl font-bold tracking-tighter text-black">
                HOLA MUNDO
              </h1>
              <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden mt-4">
                <motion.div 
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 5, ease: "linear" }}
                  className="h-full bg-black"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Decoration */}
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-gray-200/50 rounded-full blur-3xl -z-10" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-gray-200/50 rounded-full blur-3xl -z-10" />
    </div>
  );
}
