import { NextResponse } from "next/server";
import { IMPORT_TEMPLATE_FIELDS, EXAMPLE_IMPORT_ROWS } from "@/modules/catalog/import-template";

export async function GET() {
  return NextResponse.json({
    fields: IMPORT_TEMPLATE_FIELDS,
    examples: EXAMPLE_IMPORT_ROWS,
    instructions: {
      endpoint: "POST /api/admin/catalog/import",
      format: "JSON",
      body: {
        sourceDescription: "string (optional) - describe the data source",
        rows: "array of racket records (see fields and examples)",
      },
      requiredFields: ["brand", "model"],
      notes: [
        "Brands are created automatically if they don't exist",
        "Duplicate models (same brand + name + generation) reuse existing records",
        "Specs with existing data are recorded as additional sources for conflict detection",
        "All records start in 'raw' ingestion state",
      ],
    },
  });
}
