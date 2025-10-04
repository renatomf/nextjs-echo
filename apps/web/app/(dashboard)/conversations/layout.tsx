import { ConversationsLayout } from "@/modules/dashboard/ui/layouts/conversations-layout";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  return <ConversationsLayout>{children}</ConversationsLayout>
};

export default Layout;
