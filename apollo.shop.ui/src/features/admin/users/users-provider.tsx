"use client";

import React, { useCallback, useState } from "react";
import type { User, UsersDialogType } from "./types";

type UsersContextType = {
  open: UsersDialogType | null;
  setOpen: (str: UsersDialogType | null) => void;
  currentRow: User | null;
  setCurrentRow: React.Dispatch<React.SetStateAction<User | null>>;
};

const UsersContext = React.createContext<UsersContextType | null>(null);

export function UsersProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpenState] = useState<UsersDialogType | null>(null);
  const [currentRow, setCurrentRow] = useState<User | null>(null);

  const setOpen = useCallback((value: UsersDialogType | null) => {
    setOpenState((prev) => (prev === value ? null : value));
  }, []);

  return (
    <UsersContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </UsersContext.Provider>
  );
}

export function useUsers() {
  const usersContext = React.useContext(UsersContext);

  if (!usersContext) {
    throw new Error("useUsers باید داخل UsersProvider استفاده شود");
  }

  return usersContext;
}
