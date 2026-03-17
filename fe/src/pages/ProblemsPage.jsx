import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router";
import { CheckCircle2, Circle, ChevronRight } from "lucide-react";
import { ProblemRowSkeleton, FiltersPanelSkeleton } from "../components/Shimmer";
import axiosClient from "../utils/axiosClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const filtersSchema = z.object({
  status: z.enum(["All", "Solved", "Unsolved"]),
  difficulty: z.enum(["All", "Easy", "Medium", "Hard"]),
  tag: z.string(),
});

const DIFFICULTY_LABEL = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

const normalizeTag = (tag) => {
  if (!tag) return "";
  if (tag === "linkedList") return "Linked List";
  if (tag === "dp") return "Dynamic Programming";
  return tag.charAt(0).toUpperCase() + tag.slice(1);
};

const mapProblem = (problem, solvedSet) => ({
  id: problem._id,
  title: problem.title,
  difficulty: DIFFICULTY_LABEL[problem.difficulty] || "Medium",
  tags: Array.isArray(problem.tags) ? problem.tags.map(normalizeTag) : [],
  solved: solvedSet.has(problem._id),
});

export default function ProblemsPage() {
  const [problems, setProblems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const { watch, setValue } = useForm({
    resolver: zodResolver(filtersSchema),
    defaultValues: {
      status: "All",
      difficulty: "All",
      tag: "",
    },
  });

  const statusFilter = watch("status");
  const difficultyFilter = watch("difficulty");
  const selectedTag = watch("tag");

  useEffect(() => {
    let isMounted = true;

    const loadProblems = async () => {
      try {
        setIsLoading(true);
        setFetchError("");

        const [allProblemsRes, solvedProblemsRes] = await Promise.all([
          axiosClient.get("/problem/getAllProblem"),
          axiosClient.get("/problem/problemSolvedByUser"),
        ]);

        const solvedIds = new Set(
          (solvedProblemsRes.data || []).map((item) => item._id),
        );

        const mappedProblems = (allProblemsRes.data || []).map((problem) =>
          mapProblem(problem, solvedIds),
        );

        if (isMounted) {
          setProblems(mappedProblems);
        }
      } catch (error) {
        if (isMounted) {
          setFetchError(
            error.response?.data || "Failed to fetch problems from backend.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProblems();

    return () => {
      isMounted = false;
    };
  }, []);

  const allTags = useMemo(() => {
    const tags = new Set(problems.flatMap((problem) => problem.tags));
    return Array.from(tags).sort((a, b) => a.localeCompare(b));
  }, [problems]);

  const filteredProblems = useMemo(() => {
    return problems.filter((problem) => {
      const matchStatus =
        statusFilter === "All"
          ? true
          : statusFilter === "Solved"
            ? problem.solved
            : !problem.solved;

      const matchDifficulty =
        difficultyFilter === "All" || problem.difficulty === difficultyFilter;

      const matchTag = !selectedTag || problem.tags.includes(selectedTag);

      return matchStatus && matchDifficulty && matchTag;
    });
  }, [problems, statusFilter, difficultyFilter, selectedTag]);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return "text-green-400 bg-green-400/10 border-green-400/20";
      case "Medium":
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
      case "Hard":
        return "text-red-400 bg-red-400/10 border-red-400/20";
      default:
        return "text-gray-400 bg-gray-400/10 border-gray-400/20";
    }
  };

  return (
    <div className="min-h-screen pt-28 px-8 pb-12 w-full max-w-[1600px] mx-auto flex flex-col gap-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-extrabold text-white mb-2">Practice Problems</h1>
        <p className="text-[var(--color-slate)] text-lg">
          Enhance your skills by solving these algorithmic challenges.
        </p>
      </motion.div>

      {isLoading ? (
        <>
          <FiltersPanelSkeleton />
          <div className="flex flex-col gap-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <ProblemRowSkeleton key={idx} />
            ))}
          </div>
        </>
      ) : (
        <>
          <motion.div
            className="glass-panel p-6 flex flex-col gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-6 items-start sm:items-center">
              <div className="flex bg-[#0B0C10] p-1 rounded-lg border border-white/5 w-full sm:w-auto overflow-x-auto">
                {["All", "Solved", "Unsolved"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setValue("status", status, { shouldValidate: true })}
                    className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-medium transition-all text-center ${
                      statusFilter === status
                        ? "bg-[var(--color-primary)] text-white shadow-lg"
                        : "text-[var(--color-slate)] hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              <div className="h-8 w-px bg-white/10 hidden sm:block"></div>

              <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                {["All", "Easy", "Medium", "Hard"].map((difficulty) => (
                  <button
                    key={difficulty}
                    onClick={() =>
                      setValue("difficulty", difficulty, { shouldValidate: true })
                    }
                    className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                      difficultyFilter === difficulty
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-white"
                        : "border-white/10 text-[var(--color-slate)] hover:border-white/30 hover:text-white"
                    }`}
                  >
                    {difficulty}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white mb-3">Tags & Topics</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setValue("tag", "", { shouldValidate: true })}
                  className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                    selectedTag === ""
                      ? "bg-white text-black font-semibold"
                      : "bg-white/5 text-[var(--color-slate)] hover:bg-white/10 hover:text-white"
                  }`}
                >
                  All Tags
                </button>

                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setValue("tag", tag, { shouldValidate: true })}
                    className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                      selectedTag === tag
                        ? "bg-[var(--color-primary)] text-white font-semibold"
                        : "bg-white/5 text-[var(--color-slate)] hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {fetchError && (
            <div className="glass-panel border border-red-500/30 text-red-300 px-4 py-3 rounded-xl text-sm">
              {fetchError}
            </div>
          )}

          <div className="flex flex-col gap-3">
            {filteredProblems.map((problem, idx) => (
              <motion.div
                key={problem.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Link
                  to={`/problems/${problem.id}`}
                  className="group flex items-center p-4 bg-[#111216] border border-white/5 rounded-xl hover:border-[var(--color-primary)]/50 hover:bg-[#15161A] transition-all"
                >
                  <div className="mr-4 p-2 -ml-2 rounded-full">
                    {problem.solved ? (
                      <CheckCircle2 className="text-green-500" size={24} />
                    ) : (
                      <Circle
                        className="text-[var(--color-slate)] group-hover:text-white/50 transition-colors"
                        size={24}
                      />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 pr-4">
                    <h3 className="text-[1rem] sm:text-lg font-semibold text-white group-hover:text-[var(--color-primary)] transition-colors truncate">
                      {problem.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2">
                      <span
                        className={`px-2.5 py-0.5 rounded text-[0.65rem] sm:text-xs font-semibold border ${getDifficultyColor(problem.difficulty)}`}
                      >
                        {problem.difficulty}
                      </span>
                      {problem.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[0.65rem] sm:text-xs text-[var(--color-slate)] bg-white/5 px-2 py-0.5 rounded whitespace-nowrap"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="ml-auto flex-shrink-0 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                    <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-[var(--color-primary)]/20 flex items-center justify-center text-[var(--color-primary)]">
                      <ChevronRight size={16} className="sm:w-[18px] sm:h-[18px]" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}

            {filteredProblems.length === 0 && (
              <div className="py-12 text-center text-[var(--color-slate)] glass-panel border border-dashed border-white/10">
                <p className="text-lg">No problems match your current filters.</p>
                <button
                  onClick={() => {
                    setValue("status", "All", { shouldValidate: true });
                    setValue("difficulty", "All", { shouldValidate: true });
                    setValue("tag", "", { shouldValidate: true });
                  }}
                  className="mt-4 text-[var(--color-primary)] hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
