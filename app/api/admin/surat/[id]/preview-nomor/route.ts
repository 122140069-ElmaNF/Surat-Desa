import { NextResponse } from "next/server";
import previewNomorSurat from "@/lib/surat/previewNomorSurat";

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {

  try {

    const { id } = await params;

    const data =
      await previewNomorSurat(
        Number(id)
      );

    return NextResponse.json({
      success: true,
      ...data,
    });

  } catch (err: any) {

    return NextResponse.json(
      {
        success: false,
        message: err.message,
      },
      {
        status: 500,
      }
    );

  }

}