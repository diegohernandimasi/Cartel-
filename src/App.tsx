/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { User, Lock, LogOut, MessageSquare, CheckCircle2, AlertCircle } from "lucide-react";

type AuthMode = "login" | "register";

interface UserData {
  username: string;
  pin: string;
}

export default function App() {
  const [mode, setMode] = useState<AuthMode>("register");
  const [allUsers, setAllUsers] = useState<UserData[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  
  // Form states
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Feature states
  const [showHello, setShowHello] = useState(false);

  // Load users from localStorage on mount
  useEffect(() => {
    const savedUsers = localStorage.getItem("app_users");
    if (savedUsers) {
      const parsedUsers = JSON.parse(savedUsers);
      setAllUsers(parsedUsers);
      if (parsedUsers.length > 0) {
        setMode("login");
      }
    }
  }, []);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (username.trim().length < 3) {
      setError("El usuario debe tener al menos 3 caracteres.");
      return;
    }

    if (!/^\d{4}$/.test(pin)) {
      setError("La clave debe ser de exactamente 4 números.");
      return;
    }

    if (mode === "register") {
      const userExists = allUsers.some(
        (u) => u.username.toLowerCase() === username.toLowerCase()
      );

      if (userExists) {
        setError("Este nombre de usuario ya está registrado.");
        return;
      }

      const newUser = { username, pin };
      const updatedUsers = [...allUsers, newUser];
      setAllUsers(updatedUsers);
      localStorage.setItem("app_users", JSON.stringify(updatedUsers));
      
      setSuccess("¡Registro exitoso! Ahora puedes iniciar sesión.");
      setMode("login");
      setPin("");
    } else {
      const foundUser = allUsers.find(
        (u) => u.username.toLowerCase() === username.toLowerCase()
      );

      if (foundUser && foundUser.pin === pin) {
        setCurrentUser(foundUser);
        setIsLoggedIn(true);
      } else {
        setError("Usuario o clave incorrectos.");
      }
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setPin("");
    setShowHello(false);
  };

  const triggerHello = () => {
    setShowHello(true);
    setTimeout(() => {
      setShowHello(false);
    }, 5000);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-4 font-sans">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-[24px] shadow-sm w-full max-w-md border border-gray-100"
        >
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white">
              <User size={24} />
            </div>
          </div>
          
          <h1 className="text-2xl font-semibold text-center mb-2 text-gray-900">
            {mode === "register" ? "Crear Cuenta" : "Bienvenido"}
          </h1>
          <p className="text-sm text-gray-500 text-center mb-8">
            {mode === "register" 
              ? "Regístrate para acceder a la aplicación" 
              : "Ingresa tus credenciales para continuar"}
          </p>

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1 ml-1">
                Usuario
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all outline-none"
                  placeholder="Tu nombre de usuario"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1 ml-1">
                Clave (4 números)
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all outline-none"
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
                  className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-lg"
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
                  className="flex items-center gap-2 text-green-600 text-sm bg-green-50 p-3 rounded-lg"
                >
                  <CheckCircle2 size={16} />
                  <span>{success}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              className="w-full bg-black text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors active:scale-[0.98] transform"
            >
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
              className="text-sm text-gray-500 hover:text-black transition-colors"
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
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white">
            <MessageSquare size={16} />
          </div>
          <span className="font-semibold text-gray-900">Hola Mundo App</span>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors px-4 py-2 rounded-full hover:bg-red-50"
        >
          <LogOut size={16} />
          <span>Salir</span>
        </button>
      </div>

      {/* Main Content */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <h2 className="text-3xl font-light text-gray-400 mb-8">
          Hola, <span className="font-semibold text-gray-900">{currentUser?.username}</span>
        </h2>
        
        <button
          onClick={triggerHello}
          disabled={showHello}
          className={`
            group relative px-12 py-6 rounded-full font-semibold text-xl transition-all duration-300
            ${showHello 
              ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
              : "bg-black text-white hover:bg-gray-800 hover:shadow-xl active:scale-95 shadow-lg"}
          `}
        >
          <span className="relative z-10">Presionar para el saludo</span>
          {!showHello && (
            <motion.div 
              className="absolute inset-0 bg-white/10 rounded-full"
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
