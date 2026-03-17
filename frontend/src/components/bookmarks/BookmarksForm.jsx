import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

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
  } = useForm({
    resolver: zodResolver(BookmarkSchema),
    defaultValues,
  });

  async function submit(data) {
    const normalized = { ...data, url: ensureProtocol(data.url) };
    await onSubmit(normalized, { reset });
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="bookmark-form">
      <label htmlFor="bm-name">
        Name
        <input
          id="bm-name"
          {...register("name")}
          aria-invalid={errors.name ? "true" : "false"}
          placeholder="e.g. MDN Web Docs"
        />
      </label>
      {errors.name && <p role="alert">{errors.name.message}</p>}

      <label htmlFor="bm-url">
        URL
        <input
          id="bm-url"
          {...register("url")}
          aria-invalid={errors.url ? "true" : "false"}
          placeholder="https://example.com"
        />
      </label>
      {errors.url && <p role="alert">{errors.url.message}</p>}

      <div className="bookmark-form__actions">
        <button type="submit" disabled={isSubmitting}>
          {submitLabel}
        </button>
        <button type="button" onClick={() => reset()} className="ghost">
          Reset
        </button>
      </div>

      <style>{`
        .bookmark-form {
          display: grid;
          gap: 10px;
        }

        .bookmark-form label {
          display: grid;
          gap: 6px;
          font-size: 12px;
          font-weight: 700;
          color: #334155;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .bookmark-form input {
          min-height: 42px;
          border-radius: 10px;
          border: 2px solid rgba(203, 213, 225, 0.75);
          background: rgba(255, 255, 255, 0.9);
          color: #0f172a;
          padding: 10px 12px;
          font: inherit;
          box-sizing: border-box;
        }

        .bookmark-form input:focus {
          outline: none;
          border-color: #0284c7;
          box-shadow: 0 0 0 4px rgba(2, 132, 199, 0.2);
        }

        .bookmark-form p {
          margin: -2px 0 0;
          color: #dc2626;
          font-size: 12px;
        }

        .bookmark-form__actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .bookmark-form__actions button {
          min-height: 40px;
          border-radius: 10px;
          border: none;
          background: linear-gradient(130deg, #0ea5e9, #2563eb);
          color: #fff;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }

        .bookmark-form__actions .ghost {
          border: 1px solid rgba(148, 163, 184, 0.55);
          background: rgba(255, 255, 255, 0.9);
          color: #334155;
        }

        [data-theme="dark"] .bookmark-form label {
          color: #cbd5e1;
        }

        [data-theme="dark"] .bookmark-form input,
        [data-theme="dark"] .bookmark-form__actions .ghost {
          background: rgba(15, 23, 42, 0.88);
          color: #e2e8f0;
          border-color: rgba(71, 85, 105, 0.75);
        }
      `}</style>
    </form>
  );
}
