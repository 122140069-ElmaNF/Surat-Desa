import { NextResponse } from "next/server";
import tolakSurat from "@/lib/surat/tolakSurat";

export async function PATCH(
  req: Request,
  context: any
) {
  try {

    const { id } = await context.params;

    const body = await req.json();

    const result =
      await tolakSurat(
        Number(id),
        body.alasan
      );

    return NextResponse.json(result);

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