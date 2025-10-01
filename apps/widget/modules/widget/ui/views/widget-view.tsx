"use client";

import { useAtomValue } from "jotai";
import { screenAtom } from "../../atoms/widget-atoms";
import { WidgetAuthScreen } from "../screens/widget-auth-screen";
import { error } from "console";

interface Props {
  organizationId: string;
};

export const WidgetView = ({ organizationId }: Props) => {
  const screen = useAtomValue(screenAtom);

  const screenComponents = {
    error: <p>TODO</p>,
    loading: <p>TODO: Loading</p>,
    auth: <WidgetAuthScreen />,
    voice: <p>TODO: Voice</p>,
    inbox: <p>TODO: Inbox</p>,
    selection: <p>TODO: Selection</p>,
    chat: <p>TODO: Chat</p>,
    contact: <p>TODO: Contact</p>,
  };

  return (
    <main className="min-h-screen min-w-screen flex h-full w-full flex-col overflow-hidden rounded-xl border bg-muted">
      {screenComponents[screen]}
    </main>
  );
};
