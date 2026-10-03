"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useShopSettings } from "@/lib/shop-settings-api";
import {
  formatPrice,
  normalizeShopCurrency,
  setActiveShopCurrency,
  type ShopCurrency,
} from "@/lib/shop-currency";

const ShopCurrencyContext = createContext<ShopCurrency>("تومان");

export function ShopCurrencyProvider({
  initialCurrency,
  children,
}: {
  initialCurrency?: string | null;
  children: ReactNode;
}) {
  const { data } = useShopSettings();
  const [currency, setCurrency] = useState<ShopCurrency>(() =>
    normalizeShopCurrency(initialCurrency),
  );

  useEffect(() => {
    if (initialCurrency != null) {
      setCurrency(normalizeShopCurrency(initialCurrency));
    }
  }, [initialCurrency]);

  useEffect(() => {
    if (data?.currency) {
      setCurrency(normalizeShopCurrency(data.currency));
    }
  }, [data?.currency]);

  useEffect(() => {
    setActiveShopCurrency(currency);
  }, [currency]);

  // Keep module binding in sync during render for client formatPrice calls.
  setActiveShopCurrency(currency);

  const value = useMemo(() => currency, [currency]);

  return (
    <ShopCurrencyContext.Provider value={value}>
      {children}
    </ShopCurrencyContext.Provider>
  );
}

export function useShopCurrency() {
  return useContext(ShopCurrencyContext);
}

export function useFormatPrice() {
  const currency = useShopCurrency();
  return (valueInToman: number) => formatPrice(valueInToman, currency);
}
