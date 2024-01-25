import { Button } from "@/components/ui/button";
import { UserButton, auth } from "@clerk/nextjs";
import Link from "next/link";
import { LogIn } from "lucide-react";
import FileUpload from "@/components/FileUpload";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { checkSubscription } from "@/lib/subscription";
import SubscriptionButton from "@/components/SubscriptionButton";
import { getChats } from "@/lib/getChats";

export default async function Home() {
  const { userId }: { userId: string | null } = auth();
  const isPro = await checkSubscription();
  let firstChat;
  let possibleUserChats;
  let userChats;
  if (userId) {
    firstChat = await db.select().from(chats).where(eq(chats.userId, userId));
    possibleUserChats = await getChats(userId);
    if (firstChat) {
      firstChat = firstChat[0];
    }
  }
  if (possibleUserChats) {
    userChats = possibleUserChats;
  }

  const isAuth = !!userId;
  return (
    <div className="w-screen min-h-screen bg-gradient-to-tl from-gray-700 via-gray-900 to-black">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center">
            <h1 className="mr-3 text-5xl font-semibold">
              {" "}
              Converse com seu PDF
            </h1>
            <UserButton afterSignOutUrl="/"></UserButton>
          </div>

          <div className="flex mt-1">
            {isAuth && firstChat && (
              <Link href={`/chat/${firstChat.id}`}>
                <Button>Ir para Chats</Button>
              </Link>
            )}
            <div className="ml-3">
              <SubscriptionButton isPro={isPro}></SubscriptionButton>
            </div>
          </div>
          <p className="max-w-xl mt-1 text-m text-gray-400">
            Junte-se a milhares de estudantes e pesquisadores que utilizam nossa
            ferramenta diariamente para compreender e resumir seus trabalhos com
            AI
          </p>
          <div className="w-full mt-4">
            {isAuth ? (
              <FileUpload numberChatsDay={userChats} isPro={isPro} />
            ) : (
              <Link href="/sign-in">
                <Button>
                  Entrar
                  <LogIn className="w-4 h-4 ml-2"></LogIn>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
