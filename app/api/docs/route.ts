import { NextResponse } from 'next/server';
import { getApiDocs } from '@/lib/swagger';

/**
 * @description Serves the OpenAPI specification in JSON format.
 */
export async function GET() {
  try {
    const spec = await getApiDocs();
    return NextResponse.json(spec);
  } catch (error) {
    console.error("Swagger generation error:", error);
    return NextResponse.json({ error: "Failed to generate API docs" }, { status: 500 });
  }
}
