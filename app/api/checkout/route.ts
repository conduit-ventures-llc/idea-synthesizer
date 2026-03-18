import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { price, email } = await request.json();

  const subject =
    price === "launch"
      ? "Launch Client — Build My Platform"
      : "Blueprint Purchase";
  const body = `Email: ${email || "not provided"}\nProduct: ${price}`;

  return NextResponse.json({
    url: `mailto:joe@conduitventures.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
    note: "Stripe integration pending — using email for now",
  });
}
