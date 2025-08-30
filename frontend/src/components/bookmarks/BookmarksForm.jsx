import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Modern friendly palette
const palette = {
  primary: "#4f46e5",
  accent: "#06b6d4",
  border: "#e6eef8",
  inputBg: "#ffffff",
};

const urlSchema = z
  .string()
  .min(1, "URL is required")
  .refine((v) => /^(https?:)\/\//.test(v), {
    message: "URL must start with http:// or https://",
  });

const BookmarkSchema = z.object({
  name: z.string().min(1, "Name is required"),
  url: urlSchema,
});

function ensureProtocol(url) {
  if (!url) return url;
  const trimmed = url.trim();
  return /^(https?:)\/\//.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export default function BookmarksForm({
  defaultValues = { name: "", url: "" },
  onSubmit,
  submitLabel = "Save",
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm({
    resolver: zodResolver(BookmarkSchema),
    defaultValues,
  });

  async function submit(data) {
    const normalized = { ...data, url: ensureProtocol(data.url) };
    await onSubmit(normalized, { reset });
  }

  return (
    <form onSubmit={handleSubmit(submit)} style={{ display: "grid", gap: 10 }}>
      <div>
        <label
          htmlFor="bm-name"
          style={{
            display: "block",
            fontSize: 13,
            marginBottom: 6,
            color: "#0f172a",
          }}
        >
          Name
        </label>
        <input
          id="bm-name"
          {...register("name")}
          aria-invalid={errors.name ? "true" : "false"}
          placeholder="e.g. MDN Web Docs"
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 10,
            border: `1px solid ${palette.border}`,
            background: palette.inputBg,
          }}
        />
        {errors.name && (
          <div role="alert" style={{ color: "#dc2626", fontSize: 13 }}>
            {errors.name.message}
          </div>
        )}
      </div>

      <div>
        <label
          htmlFor="bm-url"
          style={{
            display: "block",
            fontSize: 13,
            marginBottom: 6,
            color: "#0f172a",
          }}
        >
          URL
        </label>
        <input
          id="bm-url"
          {...register("url")}
          aria-invalid={errors.url ? "true" : "false"}
          placeholder="https://example.com or example.com"
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 10,
            border: `1px solid ${palette.border}`,
            background: palette.inputBg,
          }}
        />
        {errors.url && (
          <div role="alert" style={{ color: "#dc2626", fontSize: 13 }}>
            {errors.url.message}
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            background: palette.primary,
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          {submitLabel}
        </button>
        <button
          type="button"
          onClick={() => reset()}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: `1px solid ${palette.border}`,
            background: "white",
            cursor: "pointer",
          }}
        >
          Reset
        </button>
      </div>
    </form>
  );
}
