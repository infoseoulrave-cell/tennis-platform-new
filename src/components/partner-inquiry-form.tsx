"use client";

import { useState } from "react";
import { trackEvent } from "@/lib/track-event";
import {
  INQUIRY_TYPES,
  INQUIRY_TYPE_LABELS,
} from "@/lib/partner-inquiry";

type Status = "idle" | "submitting" | "done" | "error";

export function PartnerInquiryForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    setStatus("submitting");
    setErrorMsg("");

    try {
      const res = await fetch("/api/partner-inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inquiryType: data.get("inquiryType"),
          name: data.get("name"),
          contact: data.get("contact"),
          message: data.get("message") || undefined,
          website: data.get("website"),
        }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error ?? "전송에 실패했습니다");
      }
      trackEvent("partner_lead_submit", {
        inquiryType: data.get("inquiryType"),
        source: "partners_page",
      });
      setStatus("done");
      form.reset();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "전송에 실패했습니다");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-5 text-center">
        <p className="text-sm font-semibold text-green-800">
          문의가 접수되었습니다
        </p>
        <p className="mt-1 text-xs text-green-700">
          확인 후 입력해 주신 연락처로 회신드리겠습니다.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-left">
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <div>
        <label htmlFor="inquiryType" className="mb-1 block text-xs font-medium text-gray-700">
          제휴 유형
        </label>
        <select
          id="inquiryType"
          name="inquiryType"
          required
          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm"
        >
          {INQUIRY_TYPES.map((t) => (
            <option key={t} value={t}>
              {INQUIRY_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="name" className="mb-1 block text-xs font-medium text-gray-700">
          이름 / 상호
        </label>
        <input
          id="name"
          name="name"
          required
          maxLength={255}
          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm"
          placeholder="예) 서초 테니스마트"
        />
      </div>
      <div>
        <label htmlFor="contact" className="mb-1 block text-xs font-medium text-gray-700">
          연락처 (이메일 또는 전화)
        </label>
        <input
          id="contact"
          name="contact"
          required
          maxLength={255}
          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm"
          placeholder="예) contact@shop.kr / 010-0000-0000"
        />
      </div>
      <div>
        <label htmlFor="message" className="mb-1 block text-xs font-medium text-gray-700">
          문의 내용 (선택)
        </label>
        <textarea
          id="message"
          name="message"
          rows={3}
          maxLength={2000}
          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm"
          placeholder="취급 브랜드, 매장 위치, 원하시는 제휴 방식 등"
        />
      </div>
      {status === "error" && (
        <p className="text-xs text-red-600">{errorMsg}</p>
      )}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="min-h-11 w-full rounded-xl bg-gray-900 text-sm font-semibold text-white disabled:opacity-50"
      >
        {status === "submitting" ? "전송 중..." : "제휴 문의하기"}
      </button>
    </form>
  );
}
