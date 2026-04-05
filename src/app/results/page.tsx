import { redirect } from "next/navigation";

/**
 * Bare /results has no recommendation run ID — redirect to diagnosis.
 * Real results live at /results/[id] after diagnosis submission.
 */
export default function ResultsIndexPage() {
  redirect("/diagnosis");
}
