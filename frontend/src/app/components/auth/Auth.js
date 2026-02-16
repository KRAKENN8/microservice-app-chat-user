"use client";

import { useState } from "react";
import { Login } from "./Login";
import { Register } from "./Register";

export function Auth() {
  const [isRegister, setIsRegister] = useState(false);

  return isRegister ? (
    <Register onSwitchToLogin={() => setIsRegister(false)} />
  ) : (
    <Login onSwitchToRegister={() => setIsRegister(true)} />
  );
}
