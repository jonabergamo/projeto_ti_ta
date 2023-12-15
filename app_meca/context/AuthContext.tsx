import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useStorageState } from "../lib/hooks/useStorageState";
import { useMutation } from "@tanstack/react-query";
import { authenticateUser } from "../graphql/mutations/tokenAuth";
import { Keyboard, ToastAndroid } from "react-native";
import Toast from "react-native-root-toast";
import { toastSettings } from "../components/ToastSettings";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { Session } from "../types";
import { getUser } from "../graphql/queries/getUser";
import { Sign } from "crypto";

const AuthContext = React.createContext<{
  signIn: (email: string, password: string) => void;
  signOut: () => void;
  session?: Session | null;
  setSession: Dispatch<SetStateAction<Session | null>>;
  fetchUser: () => void;
  isLoading: boolean;
} | null>(null);

// This hook can be used to access the user info.
export function useSession() {
  const value = React.useContext(AuthContext);
  if (process.env.NODE_ENV !== "production") {
    if (!value) {
      throw new Error("useSession must be wrapped in a <SessionProvider />");
    }
  }

  return value;
}

export function SessionProvider(props: React.PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async () => {
    if (!session?.user.id) return;
    try {
      const savedSession = await AsyncStorage.getItem("userSession");
      if (savedSession) {
        const parsedSession = JSON.parse(savedSession) as Session;
        const response = await getUser(parseInt(session.user.id));
        if (response) {
          const newSession = { token: parsedSession.token, user: response };
          await AsyncStorage.setItem("userSession", JSON.stringify(newSession));
          setSession(newSession);
        }
      }
    } catch (err) {
      ToastAndroid.show("Um erro ocorreu", ToastAndroid.SHORT);
    }
  };

  useEffect(() => {
    const loadSession = async () => {
      try {
        const savedSession = await AsyncStorage.getItem("userSession");
        if (savedSession !== null) {
          setSession(JSON.parse(savedSession));
        }
      } catch (error) {
        console.error("Erro ao carregar a sessão", error);
      }
      setIsLoading(false);
    };

    loadSession();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const response = await authenticateUser({ email, password });
      if (response) {
        await AsyncStorage.setItem("userSession", JSON.stringify(response));
        setSession(response);
        Keyboard.dismiss();
        Toast.show("Login bem sucedido", toastSettings);
      }
    } catch (err) {
      ToastAndroid.show("Um erro ocorreu", ToastAndroid.SHORT);
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem("userSession");
      setSession(null);
      router.push("/(auth-routes)/login");
    } catch (error) {
      console.error("Erro ao sair", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ signIn, signOut, session, isLoading, setSession, fetchUser }}>
      {props.children}
    </AuthContext.Provider>
  );
}
