import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://easyk-production.up.railway.app';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ consultationId: string }> }
) {
    try {
        const { consultationId } = await params;
        const token = request.headers.get("authorization");

        if (!token) {
            return NextResponse.json(
                { detail: "Authorization required" },
                { status: 401 }
            );
        }

        const response = await fetch(
            `${BACKEND_URL}/api/messages/consultations/${consultationId}`,
            {
                headers: {
                    Authorization: token,
                },
            }
        );

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("Error fetching messages:", error);
        return NextResponse.json(
            { detail: "Failed to fetch messages" },
            { status: 500 }
        );
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ consultationId: string }> }
) {
    try {
        const { consultationId } = await params;
        const token = request.headers.get("authorization");

        if (!token) {
            return NextResponse.json(
                { detail: "Authorization required" },
                { status: 401 }
            );
        }

        const body = await request.json();

        const response = await fetch(
            `${BACKEND_URL}/api/messages/consultations/${consultationId}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                },
                body: JSON.stringify(body),
            }
        );

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("Error sending message:", error);
        return NextResponse.json(
            { detail: "Failed to send message" },
            { status: 500 }
        );
    }
}

