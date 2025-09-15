import AppChatInput from "@/components/AppChatInput";
import AppHeader from "@/components/AppHeader";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <AppHeader />
      <div className="bg-gray-100 min-h-screen relative">
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-10">
        <AppChatInput />
      </div>
      </div>
    </>
  );
}
