import { NextResponse } from "next/server";
import approvalSurat from "@/lib/surat/approvalSurat";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(
  request: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const body = await request.json();

    const result = await approvalSurat(
      Number(id),
      body.nomorUrut
    );

    return NextResponse.json(result);

  } catch (error: any) {

    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message:
          error.message ??
          "Terjadi kesalahan server.",
      },
      {
        status: 500,
      }
    );

  }
}