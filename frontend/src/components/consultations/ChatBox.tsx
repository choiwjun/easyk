"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Button from "@/components/ui/Button";
import { useLanguage } from "@/contexts/LanguageContext";

interface Message {
    id: string;
    sender_id: string;
    content: string;
    file_attachment?: string;
    is_read: boolean;
    created_at: string;
    sender?: {
        id: string;
        email: string;
        name?: string;
    };
}

interface ChatBoxProps {
    consultationId: string;
    currentUserId: string;
    isEnabled?: boolean;
}

export default function ChatBox({ consultationId, currentUserId, isEnabled = true }: ChatBoxProps) {
    const { language } = useLanguage();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const pollingRef = useRef<NodeJS.Timeout | null>(null);
    const isMountedRef = useRef(true);

    // Scroll to bottom when new messages arrive
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    // Fetch messages
    const fetchMessages = useCallback(async () => {
        try {
            const token = localStorage.getItem("access_token");
            if (!token || !isMountedRef.current) return;

            const response = await fetch(`/api/messages/${consultationId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok && isMountedRef.current) {
                const data = await response.json();
                setMessages(data);
                setError("");
            }
        } catch (err) {
            console.error("Failed to fetch messages:", err);
        } finally {
            if (isMountedRef.current) {
                setIsLoading(false);
            }
        }
    }, [consultationId]);

    // Send message
    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || isSending) return;

        setIsSending(true);
        setError("");

        try {
            const token = localStorage.getItem("access_token");
            if (!token) return;

            const response = await fetch(`/api/messages/${consultationId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    content: newMessage.trim(),
                }),
            });

            if (response.ok) {
                setNewMessage("");
                await fetchMessages();
                scrollToBottom();
            } else {
                const data = await response.json();
                setError(data.detail || (language === 'ko' ? '메시지 전송 실패' : 'Failed to send message'));
            }
        } catch (err) {
            setError(language === 'ko' ? '네트워크 오류' : 'Network error');
        } finally {
            setIsSending(false);
        }
    };

    // Format timestamp
    const formatTime = useCallback((dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat(language === 'ko' ? 'ko-KR' : 'en-US', {
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    }, [language]);

    const formatDate = useCallback((dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat(language === 'ko' ? 'ko-KR' : 'en-US', {
            month: 'short',
            day: 'numeric',
        }).format(date);
    }, [language]);

    // Initial fetch and polling
    useEffect(() => {
        isMountedRef.current = true;

        if (isEnabled) {
            fetchMessages();

            // Poll for new messages every 5 seconds
            pollingRef.current = setInterval(fetchMessages, 5000);
        }

        return () => {
            isMountedRef.current = false;
            if (pollingRef.current) {
                clearInterval(pollingRef.current);
            }
        };
    }, [consultationId, isEnabled, fetchMessages]);

    // Scroll to bottom on new messages
    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    if (!isEnabled) {
        return (
            <div className="bg-gray-100 rounded-lg p-8 text-center">
                <span className="text-4xl mb-4 block">💬</span>
                <p className="text-gray-600">
                    {language === 'ko'
                        ? '채팅은 상담이 매칭된 후 사용 가능합니다.'
                        : 'Chat is available after consultation is matched.'}
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[500px] bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Chat Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <div className="flex items-center gap-2">
                    <span className="text-xl">💬</span>
                    <h3 className="font-semibold">
                        {language === 'ko' ? '상담 채팅' : 'Consultation Chat'}
                    </h3>
                </div>
                <p className="text-xs text-blue-100 mt-1">
                    {language === 'ko'
                        ? '전문가와 실시간으로 대화하세요'
                        : 'Chat with your consultant in real-time'}
                </p>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-gray-500">
                            {language === 'ko' ? '메시지 로딩 중...' : 'Loading messages...'}
                        </div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <span className="text-4xl mb-4">💭</span>
                        <p>{language === 'ko' ? '아직 메시지가 없습니다' : 'No messages yet'}</p>
                        <p className="text-sm mt-1">
                            {language === 'ko' ? '첫 메시지를 보내보세요!' : 'Send the first message!'}
                        </p>
                    </div>
                ) : (
                    <>
                        {messages.map((message, index) => {
                            const isOwn = message.sender_id === currentUserId;
                            const showDate = index === 0 ||
                                formatDate(messages[index - 1].created_at) !== formatDate(message.created_at);

                            return (
                                <div key={message.id}>
                                    {showDate && (
                                        <div className="flex justify-center my-4">
                                            <span className="px-3 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                                                {formatDate(message.created_at)}
                                            </span>
                                        </div>
                                    )}
                                    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[75%] ${isOwn ? 'order-2' : 'order-1'}`}>
                                            <div
                                                className={`px-4 py-2 rounded-2xl ${isOwn
                                                    ? 'bg-blue-600 text-white rounded-br-none'
                                                    : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
                                                    }`}
                                            >
                                                <p className="whitespace-pre-wrap break-words">{message.content}</p>
                                                {message.file_attachment && (
                                                    <a
                                                        href={message.file_attachment}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className={`text-sm underline mt-1 block ${isOwn ? 'text-blue-100' : 'text-blue-600'
                                                            }`}
                                                    >
                                                        📎 {language === 'ko' ? '첨부파일' : 'Attachment'}
                                                    </a>
                                                )}
                                            </div>
                                            <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                                <span className="text-xs text-gray-400">{formatTime(message.created_at)}</span>
                                                {isOwn && message.is_read && (
                                                    <span className="text-xs text-blue-500">✓✓</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div className="px-4 py-2 bg-red-50 text-red-600 text-sm">
                    {error}
                </div>
            )}

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-200">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={language === 'ko' ? '메시지를 입력하세요...' : 'Type a message...'}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isSending}
                    />
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={!newMessage.trim() || isSending}
                        className="rounded-full px-6"
                    >
                        {isSending ? (
                            <span className="animate-spin">⏳</span>
                        ) : (
                            <span>➤</span>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
