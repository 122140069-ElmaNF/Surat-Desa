import db from "@/lib/db";
import puppeteer from "puppeteer";

export async function GET(
  req: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  let browser: Awaited<
    ReturnType<typeof puppeteer.launch>
  > | null = null;

  try {
    // =========================================
    // AMBIL ID
    // =========================================

    const { id } = await context.params;

    if (!id) {
      return Response.json(
        {
          success: false,
          message: "ID surat tidak ditemukan.",
        },
        {
          status: 400,
        }
      );
    }

    // =========================================
    // CEK SURAT
    // =========================================

    const [rows] = await db.query(
      `
      SELECT
        id,
        status,
        kode_tracking
      FROM pengajuan_surat
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    );

    const surat = (rows as any[])[0];

    // =========================================
    // SURAT TIDAK DITEMUKAN
    // =========================================

    if (!surat) {
      return Response.json(
        {
          success: false,
          message: "Surat tidak ditemukan.",
        },
        {
          status: 404,
        }
      );
    }

    // =========================================
    // HANYA SURAT SELESAI YANG BOLEH DOWNLOAD
    // =========================================

    if (surat.status !== "selesai") {
      return Response.json(
        {
          success: false,
          message:
            "Surat belum selesai sehingga belum dapat diunduh.",
        },
        {
          status: 403,
        }
      );
    }

    // =========================================
    // URL HALAMAN PRINT
    // =========================================

    const origin =
      new URL(req.url).origin;

    const printUrl =
      `${origin}/print/${id}`;

    console.log(
      "PDF PRINT URL:",
      printUrl
    );

    // =========================================
    // BUKA PUPPETEER
    // =========================================

    browser = await puppeteer.launch({
      headless: true,

      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
      ],
    });

    // =========================================
    // BUAT PAGE
    // =========================================

    const page =
      await browser.newPage();

    // =========================================
    // VIEWPORT
    // =========================================

    await page.setViewport({
      width: 794,
      height: 1123,
      deviceScaleFactor: 1,
    });

    // =========================================
    // BUKA HALAMAN PRINT
    // =========================================

    await page.goto(printUrl, {
      waitUntil: "networkidle0",
    });

    // =========================================
    // TUNGGU SURAT
    // =========================================

    await page.waitForSelector(
      ".surat-paper",
      {
        timeout: 15000,
      }
    );

    // =========================================
    // TUNGGU DATA SURAT SELESAI
    // =========================================

    await page.waitForFunction(
      () =>
        document.querySelector(
          "[data-pdf-ready='true']"
        ) !== null,
      {
        timeout: 15000,
      }
    );

    // =========================================
    // TUNGGU FONT DAN GAMBAR
    // =========================================

    await page.evaluate(async () => {
      await document.fonts.ready;

      const images =
        Array.from(
          document.images
        );

      await Promise.all(
        images.map((img) => {
          if (img.complete) {
            return Promise.resolve();
          }

          return new Promise<void>(
            (resolve) => {
              img.onload = () =>
                resolve();

              img.onerror = () =>
                resolve();
            }
          );
        })
      );
    });

    // =========================================
    // GENERATE PDF
    // =========================================

    const pdf =
      await page.pdf({
        format: "A4",

        printBackground: true,

        preferCSSPageSize: true,

        margin: {
          top: "0mm",
          right: "0mm",
          bottom: "0mm",
          left: "0mm",
        },
      });

    // =========================================
    // CLOSE BROWSER
    // =========================================

    await browser.close();

    browser = null;

    // =========================================
    // KONVERSI PDF
    // =========================================

    /*
     * Puppeteer mengembalikan Uint8Array.
     *
     * Response() pada TypeScript versi tertentu
     * tidak menerima Uint8Array<ArrayBufferLike>
     * secara langsung.
     *
     * Karena itu kita ubah terlebih dahulu
     * menjadi ArrayBuffer murni.
     */

    const pdfBuffer =
      Buffer.from(pdf);

    const arrayBuffer =
      new ArrayBuffer(
        pdfBuffer.byteLength
      );

    new Uint8Array(
      arrayBuffer
    ).set(pdfBuffer);

    // =========================================
    // RESPONSE PDF
    // =========================================

    return new Response(
      arrayBuffer,
      {
        status: 200,

        headers: {
          "Content-Type":
            "application/pdf",

          "Content-Disposition":
            `attachment; filename="Surat-${id}.pdf"`,

          "Cache-Control":
            "no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "ERROR DOWNLOAD PDF:",
      error
    );

    // =========================================
    // CLOSE BROWSER JIKA ERROR
    // =========================================

    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error(
          "Gagal menutup browser:",
          closeError
        );
      }
    }

    // =========================================
    // RESPONSE ERROR
    // =========================================

    return Response.json(
      {
        success: false,

        message:
          "Gagal membuat file PDF.",

        error:
          error instanceof Error
            ? error.message
            : String(error),
      },
      {
        status: 500,
      }
    );
  }
}