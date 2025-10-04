import { ConversationsIdView } from "@/modules/dashboard/ui/views/conversation-id-view";
import { Id } from "@workspace/backend/_generated/dataModel";

const Page = ({ params }: { params: { conversationId: string } }) => {
  const id = params.conversationId as Id<"conversations">;
  return <ConversationsIdView conversationId={id} />;
};

export default Page;