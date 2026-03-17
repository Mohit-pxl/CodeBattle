import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Code2,
  Eye,
  EyeOff,
  Tag,
  FileText,
  Zap,
  CheckCircle,
  AlertCircle,
  X,
  Edit3,
  ListFilter,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axiosClient from "../utils/axiosClient";

// ─── Constants ────────────────────────────────────────────────────────────────
const DIFFICULTIES = ["easy", "medium", "hard"];
const AVAILABLE_TAGS = ["array", "linkedList", "graph", "dp"];
const SUPPORTED_LANGUAGES = ["C++", "Java", "JavaScript"];

// Keep frontend labels human-friendly while matching backend language ids.
const UI_TO_API_LANGUAGE_MAP = {
  "C++": "c++",
  JavaScript: "javascript",
  Java: "java",
};

const API_TO_UI_LANGUAGE_MAP = {
  "c++": "C++",
  cpp: "C++",
  javascript: "JavaScript",
  java: "Java",
};

const normalizeLanguageForApi = (language) => {
  const normalized = String(language || "").trim();
  return (
    UI_TO_API_LANGUAGE_MAP[normalized] ||
    UI_TO_API_LANGUAGE_MAP[normalized.replace(/\s+/g, "")] ||
    normalized.toLowerCase()
  );
};

const mapFormToApiPayload = (data) => ({
  ...data,
  title: String(data.title || "").trim(),
  description: String(data.description || "").trim(),
  tags: (Array.isArray(data.tags) ? data.tags : [data.tags]).filter(Boolean),
  visibleTestCases: (data.visibleTestCases || []).map((item) => ({
    input: String(item.input || "").trim(),
    output: String(item.output || "").trim(),
    explanation: String(item.explanation || "").trim(),
  })),
  hiddenTestCases: (data.hiddenTestCases || []).map((item) => ({
    input: String(item.input || "").trim(),
    output: String(item.output || "").trim(),
  })),
  startCode: (data.startCode || []).map((item) => ({
    ...item,
    language: normalizeLanguageForApi(item.language),
    initialCode: String(item.initialCode || "").replace(/\r\n/g, "\n"),
  })),
  referenceSolution: (data.referenceSolution || []).map((item) => ({
    ...item,
    language: normalizeLanguageForApi(item.language),
    completeCode: String(item.completeCode || "").replace(/\r\n/g, "\n"),
  })),
});

const parseTwoIntegers = (text) => {
  const values = String(text || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (values.length !== 2) return null;
  const [a, b] = values.map(Number);
  if (!Number.isInteger(a) || !Number.isInteger(b)) return null;
  return [a, b];
};

const parseSingleInteger = (text) => {
  const value = String(text || "").trim();
  if (!/^-?\d+$/.test(value)) return null;
  return Number(value);
};

// Guard a common admin input mistake for simple add-two-integers style problems.
const validateAddTwoNumbersCases = (payload) => {
  const contextText = `${payload.title} ${payload.description}`.toLowerCase();
  if (!/(add\s+two|sum\s+of\s+two|two\s+integers)/.test(contextText)) {
    return null;
  }

  const allCases = [
    ...(payload.visibleTestCases || []).map((testCase, index) => ({
      ...testCase,
      type: "Visible",
      index,
    })),
    ...(payload.hiddenTestCases || []).map((testCase, index) => ({
      ...testCase,
      type: "Hidden",
      index,
    })),
  ];

  for (const testCase of allCases) {
    const parsedInput = parseTwoIntegers(testCase.input);
    const parsedOutput = parseSingleInteger(testCase.output);
    if (!parsedInput || parsedOutput === null) continue;

    const expected = parsedInput[0] + parsedInput[1];
    if (expected !== parsedOutput) {
      return `${testCase.type} test case #${testCase.index + 1} looks incorrect. For input "${testCase.input}", expected output is "${expected}".`;
    }
  }

  return null;
};

const getProblemMutationErrorMessage = (error, action) => {
  const serverMessage =
    typeof error?.response?.data === "string" ? error.response.data : "";

  if (error?.response?.status === 400) {
    return `${action} failed: reference solution did not pass validation. Ensure your solution code prints exact output for all visible test cases.`;
  }

  if (error?.response?.status === 401) {
    return serverMessage || `${action} failed: admin authentication is required.`;
  }

  return `${action} error: ${serverMessage || error.message}`;
};

const mapProblemFromApi = (problem) => ({
  ...problem,
  tags: Array.isArray(problem?.tags) ? (problem.tags[0] || "") : (problem?.tags || ""),
  startCode: (problem?.startCode || []).map((item) => ({
    ...item,
    language: API_TO_UI_LANGUAGE_MAP[item.language] || item.language,
  })),
  referenceSolution: (problem?.referenceSolution || []).map((item) => ({
    ...item,
    language: API_TO_UI_LANGUAGE_MAP[item.language] || item.language,
  })),
});

const CODE_TEMPLATES = {
  JavaScript: `function solve(input) {

}`,

  Python: `def solve(input):
    pass`,

  "C++": `#include <bits/stdc++.h>
using namespace std;

int main() {

}`,

  Java: `class Solution {
    public static void solve() {

    }
}`,

  Go: `package main

import "fmt"

func main() {

}`,

  Rust: `fn main() {

}`,
};

// ─── Validation Schema ────────────────────────────────────────────────────────
const problemSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    difficulty: z.enum(["easy", "medium", "hard"]),
    tags: z.enum(["array", "linkedList", "graph", "dp"], {
      errorMap: () => ({ message: "Tag is required" }),
    }),
    visibleTestCases: z
      .array(
        z.object({
          input: z.string().min(1, "Input is required"),
          output: z.string().min(1, "Output is required"),
          explanation: z.string().min(1, "Explanation is required"),
        }),
      )
      .min(1, "At least one visible test case required"),
    hiddenTestCases: z
      .array(
        z.object({
          input: z.string().min(1, "Input is required"),
          output: z.string().min(1, "Output is required"),
        }),
      )
      .min(1, "At least one hidden test case required"),
    startCode: z
      .array(
        z.object({
          language: z.string().min(1, "Language is required"),
          initialCode: z.string().min(1, "Initial code is required"),
        }),
      )
      .min(1, "At least one start code template required"),
    referenceSolution: z
      .array(
        z.object({
          language: z.string().min(1, "Language is required"),
          completeCode: z.string().min(1, "Complete code is required"),
        }),
      )
      .min(1, "At least one reference solution required"),
  })
  .refine(
    (data) => {
      // Ensure every language in startCode has a corresponding referenceSolution
      const startLanguages = data.startCode.map((sc) => sc.language);
      const solutionLanguages = data.referenceSolution.map((rs) => rs.language);
      return (
        startLanguages.every((lang) => solutionLanguages.includes(lang)) &&
        solutionLanguages.every((lang) => startLanguages.includes(lang))
      );
    },
    {
      message:
        "Each language must have both a start code template and a reference solution.",
      path: ["referenceSolution"],
    },
  );

// ─── Shared Sub-components ───────────────────────────────────────────────────
function SectionCard({ icon: Icon, title, children, accentColor = "#E63946" }) {
  return (
    <motion.div
      className="admin-section-card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="admin-section-header">
        <Icon size={18} color={accentColor} />
        <h3 style={{ color: "#fff", fontSize: "1rem", fontWeight: 600 }}>
          {title}
        </h3>
      </div>
      {children}
    </motion.div>
  );
}

function TestCaseRow({ index, type, register, onRemove, errors }) {
  const [expanded, setExpanded] = useState(false);
  const fieldPrefix =
    type === "hidden"
      ? `hiddenTestCases.${index}`
      : `visibleTestCases.${index}`;
  const fieldErrors =
    type === "hidden"
      ? errors.hiddenTestCases?.[index]
      : errors.visibleTestCases?.[index];

  return (
    <div className="testcase-row">
      <div
        className="testcase-row-header"
        onClick={() => setExpanded((v) => !v)}
      >
        <span
          style={{ color: "#E63946", fontWeight: 600, fontSize: "0.85rem" }}
        >
          #{index + 1} — {type === "hidden" ? "🔒 Hidden" : "👁️ Visible"}
        </span>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            type="button"
            className="icon-btn danger"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(index);
            }}
            title="Remove"
          >
            <Trash2 size={14} />
          </button>
          {expanded ? (
            <ChevronUp size={16} color="#888" />
          ) : (
            <ChevronDown size={16} color="#888" />
          )}
        </div>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: "hidden" }}
          >
            <div
              style={{
                padding: "12px 0",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <label className="field-label">Input</label>
              <textarea
                {...register(`${fieldPrefix}.input`)}
                className={`input-field code-textarea ${
                  fieldErrors?.input ? "border-red-500" : ""
                }`}
                placeholder="e.g. [1, 2, 3]\n3"
                rows={3}
              />
              {fieldErrors?.input && (
                <span className="text-red-500 text-xs">
                  {fieldErrors.input.message}
                </span>
              )}

              <label className="field-label">Expected Output</label>
              <textarea
                {...register(`${fieldPrefix}.output`)}
                className={`input-field code-textarea ${
                  fieldErrors?.output ? "border-red-500" : ""
                }`}
                placeholder="e.g. 6"
                rows={2}
              />
              {fieldErrors?.output && (
                <span className="text-red-500 text-xs">
                  {fieldErrors.output.message}
                </span>
              )}

              {type === "visible" && (
                <>
                  <label className="field-label">Explanation (optional)</label>
                  <textarea
                    {...register(`${fieldPrefix}.explanation`)}
                    className="input-field"
                    placeholder="Explain the test case..."
                    rows={2}
                  />
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CodeTemplateBlock({ lang, index, register, onRemove, errors }) {
  const [tab, setTab] = useState("template");
  const startCodeError = errors.startCode?.[index]?.initialCode;
  const solutionError = errors.referenceSolution?.[index]?.completeCode;

  return (
    <div className="code-block-card">
      <div className="code-block-header">
        <span className="lang-badge">{lang}</span>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            className={`tab-btn ${tab === "template" ? "active" : ""}`}
            onClick={() => setTab("template")}
          >
            Template
          </button>
          <button
            type="button"
            className={`tab-btn ${tab === "solution" ? "active" : ""}`}
            onClick={() => setTab("solution")}
          >
            Solution
          </button>
          <button
            type="button"
            className="icon-btn danger"
            onClick={onRemove}
            title="Remove language"
          >
            <X size={14} />
          </button>
        </div>
      </div>
      {tab === "template" ? (
        <div className="flex flex-col gap-1">
          <input
            type="hidden"
            {...register(`startCode.${index}.language`)}
            value={lang}
          />

          <input
            type="hidden"
            {...register(`referenceSolution.${index}.language`)}
            value={lang}
          />
          <textarea
            {...register(`startCode.${index}.initialCode`)}
            className={`input-field code-textarea ${
              startCodeError ? "border-red-500" : ""
            }`}
            placeholder={`// Starter template for ${lang}`}
            rows={8}
            spellCheck={false}
          />
          {startCodeError && (
            <span className="text-red-500 text-xs">
              {startCodeError.message}
            </span>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          <textarea
            {...register(`referenceSolution.${index}.completeCode`)}
            className={`input-field code-textarea ${
              solutionError ? "border-red-500" : ""
            }`}
            placeholder={`// Reference solution in ${lang}`}
            rows={8}
            spellCheck={false}
          />
          {solutionError && (
            <span className="text-red-500 text-xs">
              {solutionError.message}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Shared Form Component ───────────────────────────────────────────────────
function ProblemForm({ initialValues, onSubmit, submitLabel, isSubmitting }) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(problemSchema),
    defaultValues: initialValues || {
      title: "",
      description: "",
      difficulty: "medium",
      tags: "",
      visibleTestCases: [{ input: "", output: "", explanation: "" }],
      hiddenTestCases: [{ input: "", output: "" }],
      startCode: [],
      referenceSolution: [],
    },
  });

  const {
    fields: visibleFields,
    append: appendVisible,
    remove: removeVisible,
  } = useFieldArray({
    control,
    name: "visibleTestCases",
  });

  const {
    fields: hiddenFields,
    append: appendHidden,
    remove: removeHidden,
  } = useFieldArray({
    control,
    name: "hiddenTestCases",
  });

  const {
    fields: startCodeFields,
    append: appendStartCode,
    remove: removeStartCode,
  } = useFieldArray({
    control,
    name: "startCode",
  });
  const {
    fields: solutionFields,
    append: appendSolution,
    remove: removeSolution,
  } = useFieldArray({
    control,
    name: "referenceSolution",
  });

  const selectedTag = watch("tags");
  const selectedDifficulty = watch("difficulty");
  const startCodeValues = watch("startCode") || [];

  const selectTag = (tag) => {
    setValue("tags", tag, { shouldValidate: true });
  };

  const addLanguage = (lang) => {
    if (!lang || startCodeValues.some((sc) => sc.language === lang)) return;
    appendStartCode({
      language: lang,
      initialCode: CODE_TEMPLATES[lang] || "",
    });

    appendSolution({
      language: lang,
      completeCode: "",
    });
  };

  const removeLanguageAt = (index) => {
    removeStartCode(index);
    removeSolution(index);
  };

  const difficultyColors = {
    easy: "#22c55e",
    medium: "#f59e0b",
    hard: "#E63946",
  };

  return (
    <form
      className="admin-form"
      onSubmit={handleSubmit(onSubmit)}
      autoComplete="off"
    >
      <SectionCard icon={FileText} title="Basic Info">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: 16,
            alignItems: "start",
          }}
        >
          <div className="flex flex-col gap-1">
            <label className="field-label">Problem Title *</label>
            <input
              type="text"
              className={`input-field ${errors.title ? "border-red-500" : ""}`}
              placeholder="e.g. Two Sum"
              {...register("title")}
            />
            {errors.title && (
              <span className="text-red-500 text-xs">
                {errors.title.message}
              </span>
            )}
          </div>
          <div>
            <label className="field-label">Difficulty *</label>
            <div style={{ display: "flex", gap: 8, marginTop: 2 }}>
              {DIFFICULTIES.map((d) => (
                <button
                  key={d}
                  type="button"
                  className={`difficulty-btn ${
                    selectedDifficulty === d ? "selected" : ""
                  }`}
                  style={{
                    "--diff-color": difficultyColors[d],
                    textTransform: "capitalize",
                  }}
                  onClick={() =>
                    setValue("difficulty", d, { shouldValidate: true })
                  }
                >
                  {d}
                </button>
              ))}
            </div>
            {errors.difficulty && (
              <span className="text-red-500 text-xs mt-1 block">
                {errors.difficulty.message}
              </span>
            )}
          </div>
        </div>
        <div style={{ marginTop: 16 }} className="flex flex-col gap-1">
          <label className="field-label">Description *</label>
          <textarea
            className={`input-field ${
              errors.description ? "border-red-500" : ""
            }`}
            placeholder="Describe the problem in detail. You can use markdown."
            rows={6}
            style={{ resize: "vertical" }}
            {...register("description")}
          />
          {errors.description && (
            <span className="text-red-500 text-xs">
              {errors.description.message}
            </span>
          )}
        </div>
      </SectionCard>

      <SectionCard icon={Tag} title="Tags">
        <div className="tags-grid">
          {AVAILABLE_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              className={`tag-chip ${selectedTag === tag ? "selected" : ""}`}
              style={{ textTransform: "capitalize" }}
              onClick={() => selectTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
        {errors.tags && (
          <span className="text-red-500 text-xs mt-2 block">
            {errors.tags.message}
          </span>
        )}
      </SectionCard>

      <SectionCard icon={Eye} title="Visible Test Cases" accentColor="#22c55e">
        {visibleFields.map((field, i) => (
          <TestCaseRow
            key={field.id}
            index={i}
            type="visible"
            register={register}
            onRemove={removeVisible}
            errors={errors}
          />
        ))}
        <button
          type="button"
          className="add-btn"
          onClick={() =>
            appendVisible({ input: "", output: "", explanation: "" })
          }
        >
          <Plus size={15} /> Add Visible Test Case
        </button>
        {errors.visibleTestCases && !Array.isArray(errors.visibleTestCases) && (
          <span className="text-red-500 text-xs mt-2 block">
            {errors.visibleTestCases.message}
          </span>
        )}
      </SectionCard>

      <SectionCard
        icon={EyeOff}
        title="Hidden Test Cases"
        accentColor="#f59e0b"
      >
        {hiddenFields.map((field, i) => (
          <TestCaseRow
            key={field.id}
            index={i}
            type="hidden"
            register={register}
            onRemove={removeHidden}
            errors={errors}
          />
        ))}
        <button
          type="button"
          className="add-btn"
          onClick={() => appendHidden({ input: "", output: "" })}
        >
          <Plus size={15} /> Add Hidden Test Case
        </button>
        {errors.hiddenTestCases && !Array.isArray(errors.hiddenTestCases) && (
          <span className="text-red-500 text-xs mt-2 block">
            {errors.hiddenTestCases.message}
          </span>
        )}
      </SectionCard>

      <SectionCard icon={Code2} title="Code Templates & Reference Solutions">
        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            marginBottom: 16,
          }}
        >
          {SUPPORTED_LANGUAGES.filter(
            (l) => !startCodeValues.some((sc) => sc.language === l),
          ).map((lang) => (
            <button
              key={lang}
              type="button"
              className="lang-add-btn"
              onClick={() => addLanguage(lang)}
            >
              <Plus size={13} /> {lang}
            </button>
          ))}
        </div>
        {startCodeFields.map((field, i) => (
          <CodeTemplateBlock
            key={field.id}
            index={i}
            lang={field.language}
            register={register}
            onRemove={() => removeLanguageAt(i)}
            errors={errors}
          />
        ))}
        {errors.startCode && !Array.isArray(errors.startCode) && (
          <span className="text-red-500 text-xs block mb-2">
            {errors.startCode.message}
          </span>
        )}
        {errors.referenceSolution &&
          !Array.isArray(errors.referenceSolution) && (
            <span className="text-red-500 text-xs block mb-2">
              {errors.referenceSolution.message}
            </span>
          )}
      </SectionCard>

      <motion.div
        style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}
      >
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary"
          style={{
            padding: "12px 36px",
            fontSize: "1rem",
            opacity: isSubmitting ? 0.7 : 1,
          }}
        >
          {isSubmitting ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <Zap size={16} />
          )}
          {submitLabel}
        </button>
      </motion.div>
    </form>
  );
}

// ─── Component: Create Problem ────────────────────────────────────────────────
function CreateProblem({ showToast }) {
  const [loading, setLoading] = useState(false);
const onSubmit = async (data) => {
  setLoading(true);

  try {
    const payload = mapFormToApiPayload(data);

    const addTwoNumbersValidationError = validateAddTwoNumbersCases(payload);
    if (addTwoNumbersValidationError) {
      showToast("error", addTwoNumbersValidationError);
      return;
    }

    await axiosClient.post("/problem/create", payload);

    showToast("success", `Problem "${data.title}" created successfully!`);
  } catch (error) {
    showToast("error", getProblemMutationErrorMessage(error, "Create"));
  } finally {
    setLoading(false);
  }
};

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-6"
      >
        <h2 className="text-xl font-bold text-white">Create New Problem</h2>
        <p className="text-[var(--color-slate)] text-sm">
          Fill in the details to publish a new algorithmic challenge.
        </p>
      </motion.div>
      <ProblemForm
        onSubmit={onSubmit}
        submitLabel="Publish Problem"
        isSubmitting={loading}
      />
    </>
  );
}

// ─── Component: Update Problem ────────────────────────────────────────────────
function UpdateProblem({ showToast }) {
  const [searchId, setSearchId] = useState("");
  const [fetching, setFetching] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [problem, setProblem] = useState(null);

  const handleSearch = async () => {
    if (!searchId.trim())
      return showToast("error", "Please enter a problem ID.");
    setFetching(true);
    setProblem(null);
    try {
      const resp = await axiosClient.get(`/problem/problemById/${searchId}`);
      setProblem(mapProblemFromApi(resp.data));
      showToast("success", "Problem loaded successfully.");
    } catch (error) {
      showToast(
        "error",
        `Error: ${error.response?.data || "Problem not found."}`,
      );
    } finally {
      setFetching(false);
    }
  };

  const handleUpdate = async (data) => {
  setUpdating(true);

  try {
const payload = mapFormToApiPayload(data);

const addTwoNumbersValidationError = validateAddTwoNumbersCases(payload);
if (addTwoNumbersValidationError) {
  showToast("error", addTwoNumbersValidationError);
  return;
}

await axiosClient.patch(`/problem/update/${searchId}`, payload);

    showToast("success", `Problem "${data.title}" updated successfully!`);
  } catch (error) {
    showToast("error", getProblemMutationErrorMessage(error, "Update"));
  } finally {
    setUpdating(false);
  }
};

  return (
    <div className="admin-form">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-6"
      >
        <h2 className="text-xl font-bold text-white">
          Update Existing Problem
        </h2>
        <p className="text-[var(--color-slate)] text-sm">
          Search for a problem by ID to edit its details.
        </p>
      </motion.div>

      <SectionCard icon={Edit3} title="Find Problem">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            className="input-field flex-1"
            placeholder="Enter ID..."
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
          />
          <button
            type="button"
            className="btn-primary w-full sm:w-auto"
            onClick={handleSearch}
            disabled={fetching}
          >
            {fetching ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              "Search"
            )}
          </button>
        </div>
      </SectionCard>

      {problem ? (
        <div style={{ marginTop: 32 }}>
          <ProblemForm
            initialValues={problem}
            onSubmit={handleUpdate}
            submitLabel="Save Changes"
            isSubmitting={updating}
          />
        </div>
      ) : (
        <div className="text-center py-12 text-[var(--color-slate)] border border-dashed border-white/10 rounded-xl bg-white/[0.02] mt-8">
          <ListFilter size={48} className="mx-auto mb-4 opacity-50" />
          <p>Search for a problem ID to load the editor.</p>
        </div>
      )}
    </div>
  );
}

// ─── Component: Delete Problem ────────────────────────────────────────────────
function DeleteProblem({ showToast }) {
  const [searchId, setSearchId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!searchId.trim())
      return showToast("error", "Please enter a problem ID");

    if (
      !window.confirm(
        "Are you sure you want to permanently delete this problem? This action cannot be undone.",
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      await axiosClient.delete(`/problem/delete/${searchId}`);
      showToast("success", `Problem ${searchId} deleted successfully.`);
      setSearchId("");
    } catch (error) {
      showToast(
        "error",
        `Delete Error: ${error.response?.data || error.message}`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-form">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-6"
      >
        <h2 className="text-xl font-bold text-white">Delete Problem</h2>
        <p className="text-[var(--color-slate)] text-sm">
          Permanently remove a problem from the platform. This cannot be undone.
        </p>
      </motion.div>

      <SectionCard
        icon={Trash2}
        title="Find & Delete Problem"
        accentColor="#E63946"
      >
        <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
          <div className="flex-1">
            <label className="field-label text-sm mb-2 block">
              Problem ID *
            </label>
            <input
              type="text"
              className="input-field w-full"
              placeholder="Enter Problem ID to delete..."
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
            />
          </div>
          <button
            type="button"
            disabled={loading}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 px-6 rounded-md transition-colors h-[42px] flex items-center justify-center gap-2 w-full sm:w-auto"
            onClick={handleDelete}
          >
            {loading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Trash2 size={16} />
            )}{" "}
            Delete
          </button>
        </div>
      </SectionCard>

      <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex gap-3">
        <AlertTriangle size={20} className="text-red-500 shrink-0" />
        <p className="text-sm text-red-200">
          Deleting a problem will also remove all associated submissions and
          leaderboard entries. Be absolutely certain before proceeding.
        </p>
      </div>
    </div>
  );
}

// ─── Main Admin Page Component ────────────────────────────────────────────────
export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("create"); // 'create', 'update', 'delete'
  const [toast, setToast] = useState(null);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <div className="admin-page min-h-screen pt-24 px-8 pb-12 flex justify-center">
      <AnimatePresence>
        {toast && (
          <motion.div
            className={`admin-toast ${toast.type}`}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 60 }}
            style={{ position: "fixed", top: 100, right: 30, zIndex: 1000 }}
          >
            {toast.type === "success" ? (
              <CheckCircle size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-6xl flex flex-col md:flex-row gap-6 md:gap-8">
        {/* Tabs / Sidebar Navigation */}
        <div className="w-full md:w-64 shrink-0 flex flex-row md:flex-col gap-2 overflow-x-auto pb-4 md:pb-0 custom-scrollbar">
          <div className="hidden md:flex items-center gap-3 mb-6 px-4 shrink-0">
            <Shield size={28} color="#E63946" />
            <h1 className="text-2xl font-bold text-white m-0">Admin</h1>
          </div>

          {[
            { id: "create", icon: Plus, label: "Create" },
            { id: "update", icon: Edit3, label: "Update" },
            { id: "delete", icon: Trash2, label: "Delete" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 sm:gap-3 px-4 py-2 sm:py-3 shrink-0 rounded-xl font-medium transition-all text-left ${
                activeTab === tab.id
                  ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20"
                  : "text-[var(--color-slate)] hover:bg-white/5 hover:text-white border border-transparent"
              }`}
            >
              <tab.icon size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span className="text-sm sm:text-base">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-[#111216] border border-white/5 rounded-2xl p-4 sm:p-8 min-h-[500px] shadow-2xl overflow-hidden w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "create" && (
                <CreateProblem showToast={showToast} />
              )}
              {activeTab === "update" && (
                <UpdateProblem showToast={showToast} />
              )}
              {activeTab === "delete" && (
                <DeleteProblem showToast={showToast} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
