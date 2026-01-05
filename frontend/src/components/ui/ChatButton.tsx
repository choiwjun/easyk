"use client";

export default function ChatButton() {
  return (
    <button className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-lg shadow-primary/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50">
      <span className="material-symbols-outlined text-[28px]">chat_bubble</span>
    </button>
  );
}
