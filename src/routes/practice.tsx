import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useEffect, useRef } from "react";
import {
  Code2,
  Brain,
  Mic,
  Building2,
  Check,
  Search,
  ExternalLink,
  ChevronDown,
  X,
  ArrowRight,
  Sparkles,
  Timer,
  Play,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";
import { PageShell } from "@/components/SiteChrome";
import { AuthGate } from "@/components/AuthGate";
import { useAuth } from "@/lib/auth-context";
import { usePlatformStore } from "@/lib/platform-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { aptitudeApi, AptitudeSession, AptitudeResult } from "@/lib/aptitude-api";
import { AptitudeSetupModal } from "@/components/aptitude/AptitudeSetupModal";
import { AptitudeAssessmentView } from "@/components/aptitude/AptitudeAssessmentView";
import { AptitudeResultView } from "@/components/aptitude/AptitudeResultView";
import { AptitudeHistorySection } from "@/components/aptitude/AptitudeHistorySection";

export const Route = createFileRoute("/practice")({
  head: () => ({
    meta: [
      { title: "Practice & Interview Hub — SkillVerse" },
      {
        name: "description",
        content:
          "Practice smarter. Prepare better. Curated DSA problem sets, placement aptitude speed drills, company question tracks, and AI mock interviews.",
      },
      {
        property: "og:title",
        content: "Practice & Interview Hub — SkillVerse",
      },
      {
        property: "og:description",
        content:
          "Practice smarter. Prepare better. Curated DSA problem sets, placement aptitude speed drills, company question tracks, and AI mock interviews.",
      },
    ],
  }),
  component: () => (
    <AuthGate>
      <PracticeHubPage />
    </AuthGate>
  ),
});

// --- Types ---
type PracticeTab = "dsa" | "interview" | "aptitude" | "companies";

interface DSAProblem {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topic: string;
  companies: string[];
  url: string;
  acceptance: string;
}

interface AptitudeTrack {
  id: "quant" | "logical" | "verbal";
  title: string;
  category: "Quant" | "Logical" | "Verbal";
  topics: string[];
  targetCompanies: string[];
}

interface CompanyTrack {
  id: string;
  name: string;
  tagline: string;
  logo: React.ReactNode;
  corePatterns: string[];
  rounds: string[];
  topProblems: { title: string; difficulty: "Easy" | "Medium" | "Hard"; url: string }[];
}

// --- Official Clean Vector Logos ---
const CompanyLogos = {
  Google: () => (
    <svg className="h-6 w-6" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  ),
  Amazon: () => (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
      <path
        d="M13.9 14.5c-2.4 1.8-5.9 2.7-8.9 2.7-4.2 0-7.9-1.6-10.7-4.3-.2-.2 0-.5.3-.4 3.1 1.7 6.9 2.7 10.8 2.7 2.6 0 5.5-.6 8.2-1.9.4-.2.7.2.3.6v.3z"
        fill="#FF9900"
      />
      <path
        d="M14.6 13.6c-.3-.4-2-.2-2.8-.1-.2 0-.3-.2-.1-.3 1.2-.8 3.2-.6 3.5-.2.3.4-.1 2.4-1.3 3.3-.2.1-.3 0-.3-.2.3-.7.9-2.1.7-2.5z"
        fill="#FF9900"
      />
      <path
        d="M13.2 8.4c0-1.8-.9-2.7-2.3-2.7-1.3 0-2.1.8-2.6 1.7v-1.5H6.5v8.7h1.9v-4.1c0-1.2.6-2 1.6-2 .9 0 1.3.6 1.3 1.7v4.4h1.9V8.4z"
        fill="currentColor"
      />
    </svg>
  ),
  Microsoft: () => (
    <svg className="h-6 w-6" viewBox="0 0 23 23">
      <path fill="#f35325" d="M1 1h10v10H1z" />
      <path fill="#81bc06" d="M12 1h10v10H12z" />
      <path fill="#05a6f0" d="M1 12h10v10H1z" />
      <path fill="#ffba08" d="M12 12h10v10H12z" />
    </svg>
  ),
  Meta: () => (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="#0081FB">
      <path d="M12 7.02c-2.22 0-4.04 1.4-5.32 3.18C5.2 8.26 3.68 7.02 1.83 7.02.82 7.02 0 7.84 0 8.85v6.3c0 1.01.82 1.83 1.83 1.83 2.05 0 3.73-1.39 5.05-3.37 1.32 1.98 3 3.37 5.12 3.37 2.12 0 3.8-1.39 5.12-3.37 1.32 1.98 3 3.37 5.05 3.37 1.01 0 1.83-.82 1.83-1.83v-6.3c0-1.01-.82-1.83-1.83-1.83-1.85 0-3.37 1.24-4.85 3.18C16.04 8.42 14.22 7.02 12 7.02zm0 6.64c-1.44 0-2.61-1.32-3.36-2.66.75-1.34 1.92-2.66 3.36-2.66s2.61 1.32 3.36 2.66c-.75 1.34-1.92 2.66-3.36 2.66z" />
    </svg>
  ),
  Apple: () => (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.88c.67-.82 1.13-1.96.99-3.11-1 .04-2.17.67-2.86 1.48-.61.7-.1.14 1.87-.99 3.03 1.12.09 2.21-.58 2.86-1.4" />
    </svg>
  ),
  TCS: () => (
    <div className="h-6 w-6 rounded-md bg-[#003B77] text-white flex items-center justify-center font-black text-[8px] tracking-tighter">
      TATA
    </div>
  ),
  Infosys: () => (
    <div className="h-6 px-1.5 rounded-md bg-[#007CC3] text-white flex items-center justify-center font-bold text-[9px] tracking-tight">
      Infosys
    </div>
  ),
  Uber: () => (
    <div className="h-6 w-6 rounded-md bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-[9px] tracking-wider">
      Uber
    </div>
  ),
};

// --- Comprehensive 61 High-Frequency Interview Problems ---
const CURATED_DSA_PROBLEMS: DSAProblem[] = [
  // Arrays & Hashing (7)
  { id: "two-sum", title: "Two Sum", difficulty: "Easy", topic: "Arrays & Hashing", companies: ["Google", "Amazon", "Microsoft", "Meta"], url: "https://leetcode.com/problems/two-sum/", acceptance: "52%" },
  { id: "valid-anagram", title: "Valid Anagram", difficulty: "Easy", topic: "Arrays & Hashing", companies: ["Amazon", "Uber", "Microsoft"], url: "https://leetcode.com/problems/valid-anagram/", acceptance: "64%" },
  { id: "contains-duplicate", title: "Contains Duplicate", difficulty: "Easy", topic: "Arrays & Hashing", companies: ["Apple", "Amazon", "Microsoft"], url: "https://leetcode.com/problems/contains-duplicate/", acceptance: "61%" },
  { id: "group-anagrams", title: "Group Anagrams", difficulty: "Medium", topic: "Arrays & Hashing", companies: ["Amazon", "Microsoft", "Meta"], url: "https://leetcode.com/problems/group-anagrams/", acceptance: "68%" },
  { id: "top-k-frequent", title: "Top K Frequent Elements", difficulty: "Medium", topic: "Arrays & Hashing", companies: ["Amazon", "Meta", "Google"], url: "https://leetcode.com/problems/top-k-frequent-elements/", acceptance: "63%" },
  { id: "product-except-self", title: "Product of Array Except Self", difficulty: "Medium", topic: "Arrays & Hashing", companies: ["Amazon", "Microsoft", "Apple", "Uber"], url: "https://leetcode.com/problems/product-of-array-except-self/", acceptance: "65%" },
  { id: "longest-consecutive", title: "Longest Consecutive Sequence", difficulty: "Medium", topic: "Arrays & Hashing", companies: ["Google", "Amazon", "Apple"], url: "https://leetcode.com/problems/longest-consecutive-sequence/", acceptance: "48%" },

  // Two Pointers & Sliding Window (9)
  { id: "valid-palindrome", title: "Valid Palindrome", difficulty: "Easy", topic: "Two Pointers", companies: ["Meta", "Microsoft", "Amazon"], url: "https://leetcode.com/problems/valid-palindrome/", acceptance: "46%" },
  { id: "two-sum-ii", title: "Two Sum II - Input Array Is Sorted", difficulty: "Medium", topic: "Two Pointers", companies: ["Amazon", "Google", "Apple"], url: "https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/", acceptance: "61%" },
  { id: "3sum", title: "3Sum", difficulty: "Medium", topic: "Two Pointers", companies: ["Meta", "Amazon", "Google", "Microsoft"], url: "https://leetcode.com/problems/3sum/", acceptance: "34%" },
  { id: "container-water", title: "Container With Most Water", difficulty: "Medium", topic: "Two Pointers", companies: ["Google", "Amazon", "Apple"], url: "https://leetcode.com/problems/container-with-most-water/", acceptance: "55%" },
  { id: "best-time-stock", title: "Best Time to Buy and Sell Stock", difficulty: "Easy", topic: "Two Pointers", companies: ["Amazon", "Google", "Microsoft", "TCS"], url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/", acceptance: "54%" },
  { id: "longest-substring", title: "Longest Substring Without Repeating Characters", difficulty: "Medium", topic: "Two Pointers", companies: ["Amazon", "Google", "Microsoft", "Uber"], url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/", acceptance: "35%" },
  { id: "longest-repeating-char", title: "Longest Repeating Character Replacement", difficulty: "Medium", topic: "Two Pointers", companies: ["Google", "Amazon", "Uber"], url: "https://leetcode.com/problems/longest-repeating-character-replacement/", acceptance: "53%" },
  { id: "permutation-in-string", title: "Permutation in String", difficulty: "Medium", topic: "Two Pointers", companies: ["Microsoft", "Amazon", "Meta"], url: "https://leetcode.com/problems/permutation-in-string/", acceptance: "44%" },
  { id: "trapping-rain-water", title: "Trapping Rain Water", difficulty: "Hard", topic: "Two Pointers", companies: ["Google", "Amazon", "Microsoft", "Meta"], url: "https://leetcode.com/problems/trapping-rain-water/", acceptance: "61%" },

  // Stack & Queue (6)
  { id: "valid-parentheses", title: "Valid Parentheses", difficulty: "Easy", topic: "Stack & Queue", companies: ["Amazon", "Microsoft", "Google", "TCS"], url: "https://leetcode.com/problems/valid-parentheses/", acceptance: "41%" },
  { id: "min-stack", title: "Min Stack", difficulty: "Medium", topic: "Stack & Queue", companies: ["Amazon", "Microsoft", "Apple"], url: "https://leetcode.com/problems/min-stack/", acceptance: "54%" },
  { id: "eval-rpn", title: "Evaluate Reverse Polish Notation", difficulty: "Medium", topic: "Stack & Queue", companies: ["Amazon", "Google", "LinkedIn"], url: "https://leetcode.com/problems/evaluate-reverse-polish-notation/", acceptance: "50%" },
  { id: "generate-parentheses", title: "Generate Parentheses", difficulty: "Medium", topic: "Stack & Queue", companies: ["Amazon", "Microsoft", "Google"], url: "https://leetcode.com/problems/generate-parentheses/", acceptance: "74%" },
  { id: "daily-temperatures", title: "Daily Temperatures", difficulty: "Medium", topic: "Stack & Queue", companies: ["Amazon", "Meta", "Google"], url: "https://leetcode.com/problems/daily-temperatures/", acceptance: "66%" },
  { id: "largest-rectangle-histogram", title: "Largest Rectangle in Histogram", difficulty: "Hard", topic: "Stack & Queue", companies: ["Google", "Amazon", "Microsoft"], url: "https://leetcode.com/problems/largest-rectangle-in-histogram/", acceptance: "44%" },

  // Binary Search (6)
  { id: "binary-search", title: "Binary Search", difficulty: "Easy", topic: "Binary Search", companies: ["Microsoft", "Apple", "Google"], url: "https://leetcode.com/problems/binary-search/", acceptance: "57%" },
  { id: "search-2d-matrix", title: "Search a 2D Matrix", difficulty: "Medium", topic: "Binary Search", companies: ["Amazon", "Microsoft", "Meta"], url: "https://leetcode.com/problems/search-a-2d-matrix/", acceptance: "50%" },
  { id: "koko-eating-bananas", title: "Koko Eating Bananas", difficulty: "Medium", topic: "Binary Search", companies: ["Google", "Amazon", "Uber"], url: "https://leetcode.com/problems/koko-eating-bananas/", acceptance: "50%" },
  { id: "search-rotated-array", title: "Search in Rotated Sorted Array", difficulty: "Medium", topic: "Binary Search", companies: ["Amazon", "Microsoft", "Google", "Meta"], url: "https://leetcode.com/problems/search-in-rotated-sorted-array/", acceptance: "40%" },
  { id: "find-min-rotated", title: "Find Minimum in Rotated Sorted Array", difficulty: "Medium", topic: "Binary Search", companies: ["Amazon", "Microsoft", "Apple"], url: "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/", acceptance: "50%" },
  { id: "median-two-sorted-arrays", title: "Median of Two Sorted Arrays", difficulty: "Hard", topic: "Binary Search", companies: ["Google", "Amazon", "Microsoft", "Apple"], url: "https://leetcode.com/problems/median-of-two-sorted-arrays/", acceptance: "39%" },

  // Linked Lists (7)
  { id: "reverse-linked-list", title: "Reverse Linked List", difficulty: "Easy", topic: "Linked Lists", companies: ["Microsoft", "Amazon", "Google", "TCS"], url: "https://leetcode.com/problems/reverse-linked-list/", acceptance: "76%" },
  { id: "merge-two-sorted-lists", title: "Merge Two Sorted Lists", difficulty: "Easy", topic: "Linked Lists", companies: ["Amazon", "Microsoft", "Google", "Apple"], url: "https://leetcode.com/problems/merge-two-sorted-lists/", acceptance: "64%" },
  { id: "reorder-list", title: "Reorder List", difficulty: "Medium", topic: "Linked Lists", companies: ["Meta", "Amazon", "Microsoft"], url: "https://leetcode.com/problems/reorder-list/", acceptance: "55%" },
  { id: "remove-nth-node", title: "Remove Nth Node From End of List", difficulty: "Medium", topic: "Linked Lists", companies: ["Amazon", "Meta", "Google"], url: "https://leetcode.com/problems/remove-nth-node-from-end-of-list/", acceptance: "44%" },
  { id: "linked-list-cycle", title: "Linked List Cycle", difficulty: "Easy", topic: "Linked Lists", companies: ["Amazon", "Microsoft", "Apple"], url: "https://leetcode.com/problems/linked-list-cycle/", acceptance: "50%" },
  { id: "lru-cache", title: "LRU Cache (Design)", difficulty: "Medium", topic: "Linked Lists", companies: ["Amazon", "Microsoft", "Google", "Meta"], url: "https://leetcode.com/problems/lru-cache/", acceptance: "43%" },
  { id: "merge-k-sorted-lists", title: "Merge k Sorted Lists", difficulty: "Hard", topic: "Linked Lists", companies: ["Amazon", "Meta", "Google", "Microsoft"], url: "https://leetcode.com/problems/merge-k-sorted-lists/", acceptance: "52%" },

  // Trees & BST (9)
  { id: "invert-binary-tree", title: "Invert Binary Tree", difficulty: "Easy", topic: "Trees & BST", companies: ["Google", "Amazon", "Microsoft"], url: "https://leetcode.com/problems/invert-binary-tree/", acceptance: "77%" },
  { id: "max-depth-tree", title: "Maximum Depth of Binary Tree", difficulty: "Easy", topic: "Trees & BST", companies: ["Amazon", "Google", "Apple"], url: "https://leetcode.com/problems/maximum-depth-of-binary-tree/", acceptance: "75%" },
  { id: "same-tree", title: "Same Tree", difficulty: "Easy", topic: "Trees & BST", companies: ["Amazon", "Google", "Microsoft"], url: "https://leetcode.com/problems/same-tree/", acceptance: "60%" },
  { id: "subtree-another-tree", title: "Subtree of Another Tree", difficulty: "Easy", topic: "Trees & BST", companies: ["Amazon", "Meta", "Google"], url: "https://leetcode.com/problems/subtree-of-another-tree/", acceptance: "48%" },
  { id: "lowest-common-ancestor", title: "Lowest Common Ancestor of a BST", difficulty: "Medium", topic: "Trees & BST", companies: ["Meta", "Amazon", "Microsoft", "Google"], url: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/", acceptance: "64%" },
  { id: "level-order-traversal", title: "Binary Tree Level Order Traversal", difficulty: "Medium", topic: "Trees & BST", companies: ["Amazon", "Microsoft", "Meta"], url: "https://leetcode.com/problems/binary-tree-level-order-traversal/", acceptance: "67%" },
  { id: "validate-bst", title: "Validate Binary Search Tree", difficulty: "Medium", topic: "Trees & BST", companies: ["Amazon", "Microsoft", "Apple"], url: "https://leetcode.com/problems/validate-binary-search-tree/", acceptance: "33%" },
  { id: "kth-smallest-bst", title: "Kth Smallest Element in a BST", difficulty: "Medium", topic: "Trees & BST", companies: ["Amazon", "Google", "Uber"], url: "https://leetcode.com/problems/kth-smallest-element-in-a-bst/", acceptance: "72%" },
  { id: "serialize-deserialize-tree", title: "Serialize and Deserialize Binary Tree", difficulty: "Hard", topic: "Trees & BST", companies: ["Amazon", "Meta", "Google", "Microsoft"], url: "https://leetcode.com/problems/serialize-and-deserialize-binary-tree/", acceptance: "56%" },

  // Graphs (8)
  { id: "number-of-islands", title: "Number of Islands", difficulty: "Medium", topic: "Graphs", companies: ["Amazon", "Google", "Microsoft", "Uber"], url: "https://leetcode.com/problems/number-of-islands/", acceptance: "59%" },
  { id: "clone-graph", title: "Clone Graph", difficulty: "Medium", topic: "Graphs", companies: ["Meta", "Amazon", "Google"], url: "https://leetcode.com/problems/clone-graph/", acceptance: "56%" },
  { id: "max-area-island", title: "Max Area of Island", difficulty: "Medium", topic: "Graphs", companies: ["Amazon", "Google", "Uber"], url: "https://leetcode.com/problems/max-area-of-island/", acceptance: "72%" },
  { id: "pacific-atlantic", title: "Pacific Atlantic Water Flow", difficulty: "Medium", topic: "Graphs", companies: ["Google", "Amazon", "Meta"], url: "https://leetcode.com/problems/pacific-atlantic-water-flow/", acceptance: "55%" },
  { id: "surrounded-regions", title: "Surrounded Regions", difficulty: "Medium", topic: "Graphs", companies: ["Amazon", "Google", "Microsoft"], url: "https://leetcode.com/problems/surrounded-regions/", acceptance: "39%" },
  { id: "course-schedule", title: "Course Schedule", difficulty: "Medium", topic: "Graphs", companies: ["Amazon", "Google", "Microsoft"], url: "https://leetcode.com/problems/course-schedule/", acceptance: "47%" },
  { id: "course-schedule-ii", title: "Course Schedule II", difficulty: "Medium", topic: "Graphs", companies: ["Amazon", "Meta", "Google"], url: "https://leetcode.com/problems/course-schedule-ii/", acceptance: "50%" },
  { id: "word-ladder", title: "Word Ladder", difficulty: "Hard", topic: "Graphs", companies: ["Amazon", "Google", "Microsoft", "Apple"], url: "https://leetcode.com/problems/word-ladder/", acceptance: "39%" },

  // Dynamic Programming (9)
  { id: "climbing-stairs", title: "Climbing Stairs", difficulty: "Easy", topic: "Dynamic Programming", companies: ["Amazon", "Google", "TCS", "Infosys"], url: "https://leetcode.com/problems/climbing-stairs/", acceptance: "53%" },
  { id: "min-cost-climbing", title: "Min Cost Climbing Stairs", difficulty: "Easy", topic: "Dynamic Programming", companies: ["Amazon", "Apple", "TCS"], url: "https://leetcode.com/problems/min-cost-climbing-stairs/", acceptance: "66%" },
  { id: "house-robber", title: "House Robber", difficulty: "Medium", topic: "Dynamic Programming", companies: ["Amazon", "Microsoft", "Google"], url: "https://leetcode.com/problems/house-robber/", acceptance: "50%" },
  { id: "house-robber-ii", title: "House Robber II", difficulty: "Medium", topic: "Dynamic Programming", companies: ["Google", "Amazon", "Microsoft"], url: "https://leetcode.com/problems/house-robber-ii/", acceptance: "42%" },
  { id: "longest-palindromic-substring", title: "Longest Palindromic Substring", difficulty: "Medium", topic: "Dynamic Programming", companies: ["Amazon", "Microsoft", "Google", "Meta"], url: "https://leetcode.com/problems/longest-palindromic-substring/", acceptance: "34%" },
  { id: "coin-change", title: "Coin Change", difficulty: "Medium", topic: "Dynamic Programming", companies: ["Amazon", "Microsoft", "Google", "Apple"], url: "https://leetcode.com/problems/coin-change/", acceptance: "44%" },
  { id: "longest-increasing-subsequence", title: "Longest Increasing Subsequence", difficulty: "Medium", topic: "Dynamic Programming", companies: ["Google", "Amazon", "Microsoft"], url: "https://leetcode.com/problems/longest-increasing-subsequence/", acceptance: "55%" },
  { id: "word-break", title: "Word Break", difficulty: "Medium", topic: "Dynamic Programming", companies: ["Amazon", "Meta", "Google"], url: "https://leetcode.com/problems/word-break/", acceptance: "47%" },
  { id: "unique-paths", title: "Unique Paths", difficulty: "Medium", topic: "Dynamic Programming", companies: ["Amazon", "Google", "Microsoft"], url: "https://leetcode.com/problems/unique-paths/", acceptance: "64%" },
];

// --- Curated Aptitude Tracks ---
const APTITUDE_TRACKS: AptitudeTrack[] = [
  {
    id: "quant",
    title: "Quantitative Aptitude",
    category: "Quant",
    topics: ["Time & Work", "Percentages", "Speed & Distance", "Profit & Loss", "Simple Interest", "Probability"],
    targetCompanies: ["TCS NQT", "Infosys", "Accenture", "Cognizant"],
  },
  {
    id: "logical",
    title: "Logical Reasoning",
    category: "Logical",
    topics: ["Coding-Decoding", "Blood Relations", "Syllogisms", "Data Sufficiency", "Directions", "Series"],
    targetCompanies: ["TCS", "Wipro", "Capgemini", "ServiceNow"],
  },
  {
    id: "verbal",
    title: "Verbal Ability",
    category: "Verbal",
    topics: ["Reading Comprehension", "Error Spotting", "Sentence Completion", "Vocabulary", "Idioms"],
    targetCompanies: ["TCS NQT", "Accenture", "Deloitte", "IBM"],
  },
];

// --- Top Company Tracks with Real Logos ---
const COMPANY_TRACKS: CompanyTrack[] = [
  {
    id: "google",
    name: "Google",
    tagline: "Trees, Graphs, DP, and Scalable Architecture",
    logo: <CompanyLogos.Google />,
    corePatterns: ["DFS & BFS on Graphs", "Dynamic Programming", "Trie & Binary Search", "System Design"],
    rounds: ["Online Assessment", "Technical Round 1 (DSA)", "Technical Round 2 (Algorithms)", "Googliness & Leadership"],
    topProblems: [
      { title: "Two Sum", difficulty: "Easy", url: "https://leetcode.com/problems/two-sum/" },
      { title: "Trapping Rain Water", difficulty: "Hard", url: "https://leetcode.com/problems/trapping-rain-water/" },
      { title: "Number of Islands", difficulty: "Medium", url: "https://leetcode.com/problems/number-of-islands/" },
      { title: "Course Schedule", difficulty: "Medium", url: "https://leetcode.com/problems/course-schedule/" },
    ],
  },
  {
    id: "amazon",
    name: "Amazon",
    tagline: "DSA + 14 Leadership Principles (STAR Method)",
    logo: <CompanyLogos.Amazon />,
    corePatterns: ["HashMap & Two Pointers", "Tree Traversals", "BFS / Priority Queue", "14 Leadership Principles"],
    rounds: ["Online Assessment", "Technical 1 (Coding + LP)", "Technical 2 (Design + LP)", "Bar Raiser Round"],
    topProblems: [
      { title: "LRU Cache", difficulty: "Medium", url: "https://leetcode.com/problems/lru-cache/" },
      { title: "Group Anagrams", difficulty: "Medium", url: "https://leetcode.com/problems/group-anagrams/" },
      { title: "Coin Change", difficulty: "Medium", url: "https://leetcode.com/problems/coin-change/" },
      { title: "Lowest Common Ancestor", difficulty: "Medium", url: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/" },
    ],
  },
  {
    id: "microsoft",
    name: "Microsoft",
    tagline: "Core DSA, Linked Lists, Trees & CS Fundamentals",
    logo: <CompanyLogos.Microsoft />,
    corePatterns: ["Binary Search & Two Pointers", "Linked List Manipulation", "Binary Tree Level Order", "OOP & System Design"],
    rounds: ["Online Coding Assessment", "Technical Round 1 (Data Structures)", "Technical Round 2 (Algorithms + OOP)", "AA / Hiring Manager"],
    topProblems: [
      { title: "Reverse Linked List", difficulty: "Easy", url: "https://leetcode.com/problems/reverse-linked-list/" },
      { title: "Valid Parentheses", difficulty: "Easy", url: "https://leetcode.com/problems/valid-parentheses/" },
      { title: "Longest Substring Without Repeating", difficulty: "Medium", url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/" },
      { title: "Binary Tree Level Order", difficulty: "Medium", url: "https://leetcode.com/problems/binary-tree-level-order-traversal/" },
    ],
  },
  {
    id: "meta",
    name: "Meta (Facebook)",
    tagline: "Speed & high-accuracy coding on standard LeetCode patterns",
    logo: <CompanyLogos.Meta />,
    corePatterns: ["Array & Matrix Manipulations", "Graph Traversals & BFS", "Tree Construction & LCA", "Dynamic Programming"],
    rounds: ["Screening Interview (2 Coding Qs in 45 mins)", "Coding Round 1", "Coding Round 2", "System Design & Behavioral"],
    topProblems: [
      { title: "3Sum", difficulty: "Medium", url: "https://leetcode.com/problems/3sum/" },
      { title: "Clone Graph", difficulty: "Medium", url: "https://leetcode.com/problems/clone-graph/" },
      { title: "Serialize & Deserialize Tree", difficulty: "Hard", url: "https://leetcode.com/problems/serialize-and-deserialize-binary-tree/" },
    ],
  },
  {
    id: "apple",
    name: "Apple",
    tagline: "Memory management, clean code, and foundational DS",
    logo: <CompanyLogos.Apple />,
    corePatterns: ["Two Pointers & Binary Search", "Linked Lists & Trees", "Low-level System Design"],
    rounds: ["Recruiter Screen", "Technical Screen (DSA + CS)", "Virtual Onsite (4-5 Technical Rounds)"],
    topProblems: [
      { title: "Product of Array Except Self", difficulty: "Medium", url: "https://leetcode.com/problems/product-of-array-except-self/" },
      { title: "Median of Two Sorted Arrays", difficulty: "Hard", url: "https://leetcode.com/problems/median-of-two-sorted-arrays/" },
      { title: "Merge Two Sorted Lists", difficulty: "Easy", url: "https://leetcode.com/problems/merge-two-sorted-lists/" },
      { title: "Search in Rotated Sorted Array", difficulty: "Medium", url: "https://leetcode.com/problems/search-in-rotated-sorted-array/" },
    ],
  },
  {
    id: "tcs-infy",
    name: "TCS / Infosys",
    tagline: "Speed Aptitude, Foundational DSA & Core CS",
    logo: <CompanyLogos.TCS />,
    corePatterns: ["Quant & Reasoning Speed", "Basic String & Array Manipulations", "SQL Queries & DBMS", "OOP Fundamentals"],
    rounds: ["National Qualifier Test (NQT)", "Technical Interview (Core CS, DBMS, OOP)", "HR / Behavioral Round"],
    topProblems: [
      { title: "Two Sum", difficulty: "Easy", url: "https://leetcode.com/problems/two-sum/" },
      { title: "Valid Anagram", difficulty: "Easy", url: "https://leetcode.com/problems/valid-anagram/" },
      { title: "Climbing Stairs", difficulty: "Easy", url: "https://leetcode.com/problems/climbing-stairs/" },
      { title: "Best Time to Buy Stock", difficulty: "Easy", url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/" },
    ],
  },
];

const ALL_TOPICS = [
  "All",
  "Arrays & Hashing",
  "Two Pointers",
  "Stack & Queue",
  "Binary Search",
  "Linked Lists",
  "Trees & BST",
  "Graphs",
  "Dynamic Programming",
];

const ALL_COMPANIES = [
  "All",
  "Google",
  "Amazon",
  "Microsoft",
  "Meta",
  "Apple",
  "Uber",
  "TCS",
];

function PracticeHubPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { leetcodeData, leetcode } = usePlatformStore();
  const [activeTab, setActiveTab] = useState<PracticeTab>("dsa");

  // --- Real Aptitude Session State ---
  const [setupModalOpen, setSetupModalOpen] = useState(false);
  const [selectedAptitudeCategory, setSelectedAptitudeCategory] = useState<"quant" | "logical" | "verbal">("quant");
  const [creatingSession, setCreatingSession] = useState(false);
  const [activeSession, setActiveSession] = useState<AptitudeSession | null>(null);
  const [assessmentResult, setAssessmentResult] = useState<AptitudeResult | null>(null);
  const [aptitudeCounts, setAptitudeCounts] = useState<{ total: number; quant: number; logical: number; verbal: number }>({
    total: 100,
    quant: 50,
    logical: 35,
    verbal: 25,
  });

  // Fetch real aptitude counts
  useEffect(() => {
    aptitudeApi.getCounts().then(setAptitudeCounts).catch(() => {});
  }, []);

  // --- Filter State for DSA ---
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<"All" | "Easy" | "Medium" | "Hard">("All");
  const [company, setCompany] = useState("All");
  const [topic, setTopic] = useState("All");
  const [statusFilter, setStatusFilter] = useState<"All" | "Solved" | "Unsolved">("All");
  const [sortBy, setSortBy] = useState<"Recommended" | "Difficulty" | "Name">("Recommended");

  // Dropdown open states
  const [companyOpen, setCompanyOpen] = useState(false);
  const [topicOpen, setTopicOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const companyRef = useRef<HTMLDivElement>(null);
  const topicRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (companyRef.current && !companyRef.current.contains(event.target as Node)) {
        setCompanyOpen(false);
      }
      if (topicRef.current && !topicRef.current.contains(event.target as Node)) {
        setTopicOpen(false);
      }
      if (statusRef.current && !statusRef.current.contains(event.target as Node)) {
        setStatusOpen(false);
      }
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setSortOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Solved IDs from LocalStorage
  const [solvedIds, setSolvedIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem("skillverse_solved_practice_problems");
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const toggleSolved = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSolvedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        toast.info("Marked as unsolved");
      } else {
        next.add(id);
        toast.success("Problem marked as solved! 🎉");
      }
      try {
        localStorage.setItem("skillverse_solved_practice_problems", JSON.stringify(Array.from(next)));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const clearAllFilters = () => {
    setSearch("");
    setDifficulty("All");
    setCompany("All");
    setTopic("All");
    setStatusFilter("All");
    setSortBy("Recommended");
  };

  const hasActiveFilters = Boolean(
    search.trim() !== "" ||
    difficulty !== "All" ||
    company !== "All" ||
    topic !== "All" ||
    statusFilter !== "All"
  );

  // Filtered & Sorted DSA Problems
  const filteredProblems = useMemo(() => {
    const list = CURATED_DSA_PROBLEMS.filter((p) => {
      if (difficulty !== "All" && p.difficulty !== difficulty) return false;
      if (company !== "All" && !p.companies.includes(company)) return false;
      if (topic !== "All" && p.topic !== topic) return false;

      const isSolved = solvedIds.has(p.id);
      if (statusFilter === "Solved" && !isSolved) return false;
      if (statusFilter === "Unsolved" && isSolved) return false;

      if (search.trim() !== "") {
        const q = search.toLowerCase();
        const matchesName = p.title.toLowerCase().includes(q);
        const matchesTopic = p.topic.toLowerCase().includes(q);
        const matchesComp = p.companies.some((c) => c.toLowerCase().includes(q));
        if (!matchesName && !matchesTopic && !matchesComp) return false;
      }

      return true;
    });

    if (sortBy === "Difficulty") {
      const rank: Record<string, number> = { Easy: 1, Medium: 2, Hard: 3 };
      list.sort((a, b) => rank[a.difficulty] - rank[b.difficulty]);
    } else if (sortBy === "Name") {
      list.sort((a, b) => a.title.localeCompare(b.title));
    }

    return list;
  }, [difficulty, company, topic, statusFilter, search, sortBy, solvedIds]);

  const solvedCount = useMemo(() => {
    return CURATED_DSA_PROBLEMS.filter((p) => solvedIds.has(p.id)).length;
  }, [solvedIds]);

  const handleSelectCompanyTrack = (companyName: string) => {
    setCompany(companyName);
    setActiveTab("dsa");
  };

  // Aptitude Speed Drill Launch
  const openAptitudeSetup = (category: "quant" | "logical" | "verbal") => {
    setSelectedAptitudeCategory(category);
    setSetupModalOpen(true);
  };

  const handleStartAptitudeSession = async (params: {
    category: "quant" | "logical" | "verbal";
    difficulty: "Easy" | "Medium" | "Hard" | "Mixed";
    questionCount: number;
    mode: "assessment" | "practice";
    company?: string;
  }) => {
    setCreatingSession(true);
    try {
      const session = await aptitudeApi.createSession({
        uid: user?.id || "guest_user",
        category: params.category,
        difficulty: params.difficulty,
        questionCount: params.questionCount,
        mode: params.mode,
        company: params.company,
      });
      setSetupModalOpen(false);
      setAssessmentResult(null);
      setActiveSession(session);
      toast.success(`Started ${session.questionCount} questions drill!`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to start assessment");
    } finally {
      setCreatingSession(false);
    }
  };

  // If in an active assessment session, render the distraction-free assessment view
  if (activeSession) {
    return (
      <AptitudeAssessmentView
        session={activeSession}
        uid={user?.id || "guest_user"}
        onFinish={(result) => {
          setActiveSession(null);
          setAssessmentResult(result);
        }}
        onExit={() => setActiveSession(null)}
      />
    );
  }

  // If viewing a result, render the rich result view
  if (assessmentResult) {
    return (
      <AptitudeResultView
        result={assessmentResult}
        onRetry={() => {
          setAssessmentResult(null);
          openAptitudeSetup((assessmentResult.category as any) || "quant");
        }}
        onBackToHub={() => setAssessmentResult(null)}
      />
    );
  }

  return (
    <PageShell>
      <div className="min-h-screen bg-background text-foreground pb-20">
        
        {/* 1. CLEAN SINGLE-COLUMN SKILLVERSE HERO */}
        <section className="relative overflow-hidden bg-hero border-b border-border/60">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-20 h-[460px] w-[460px] -translate-x-1/2 rounded-full bg-brand/15 blur-[120px] animate-pulse-glow" />
          </div>
          <div className="mx-auto max-w-6xl px-6 pt-12 pb-6">
            
            {/* Header Content (Single Column matching Dashboard & Resume) */}
            <div className="max-w-3xl space-y-3 animate-fade-up">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/60 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-brand backdrop-blur shadow-2xs">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand" />
                </span>
                PRACTICE
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl text-foreground">
                Practice smarter. <span className="text-gradient">Prepare better.</span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl">
                Sharpen your skills with focused coding and technical practice.
              </p>
            </div>

            {/* 2. 4 HERO SECTIONS CARDS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
              {/* Card 1: DSA Problems */}
              <div
                onClick={() => setActiveTab("dsa")}
                className={cn(
                  "group relative p-5 rounded-2xl border transition-all cursor-pointer overflow-hidden shadow-xs backdrop-blur-md",
                  activeTab === "dsa"
                    ? "bg-card border-brand shadow-md ring-1 ring-brand/30 scale-[1.01]"
                    : "bg-card/70 border-border/70 hover:border-brand/50 hover:bg-card hover:shadow-sm"
                )}
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className={cn(
                    "h-10 w-10 rounded-xl grid place-items-center transition-colors",
                    activeTab === "dsa" ? "bg-brand text-brand-foreground" : "bg-brand/10 text-brand group-hover:bg-brand group-hover:text-brand-foreground"
                  )}>
                    <Code2 className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-mono font-extrabold px-2.5 py-0.5 rounded-full bg-brand/10 text-brand border border-brand/20">
                    {solvedCount} / {CURATED_DSA_PROBLEMS.length}
                  </span>
                </div>
                <h3 className="text-base font-bold text-foreground group-hover:text-brand transition-colors flex items-center gap-1.5">
                  DSA Problems <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-brand" />
                </h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  Curated LeetCode & interview problem sets with company tags.
                </p>
              </div>

              {/* Card 2: AI Mock Interview */}
              <div
                onClick={() => setActiveTab("interview")}
                className={cn(
                  "group relative p-5 rounded-2xl border transition-all cursor-pointer overflow-hidden shadow-xs backdrop-blur-md",
                  activeTab === "interview"
                    ? "bg-card border-indigo-500 shadow-md ring-1 ring-indigo-500/30 scale-[1.01]"
                    : "bg-card/70 border-border/70 hover:border-indigo-500/50 hover:bg-card hover:shadow-sm"
                )}
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className={cn(
                    "h-10 w-10 rounded-xl grid place-items-center transition-colors",
                    activeTab === "interview" ? "bg-indigo-500 text-white" : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white"
                  )}>
                    <Brain className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                    Live AI
                  </span>
                </div>
                <h3 className="text-base font-bold text-foreground group-hover:text-indigo-500 transition-colors flex items-center gap-1.5">
                  AI Mock Interview <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-indigo-500" />
                </h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  Interactive voice & text interviews with instant score & feedback.
                </p>
              </div>

              {/* Card 3: Aptitude */}
              <div
                onClick={() => setActiveTab("aptitude")}
                className={cn(
                  "group relative p-5 rounded-2xl border transition-all cursor-pointer overflow-hidden shadow-xs backdrop-blur-md",
                  activeTab === "aptitude"
                    ? "bg-card border-emerald-500 shadow-md ring-1 ring-emerald-500/30 scale-[1.01]"
                    : "bg-card/70 border-border/70 hover:border-emerald-500/50 hover:bg-card hover:shadow-sm"
                )}
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className={cn(
                    "h-10 w-10 rounded-xl grid place-items-center transition-colors",
                    activeTab === "aptitude" ? "bg-emerald-500 text-white" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white"
                  )}>
                    <Timer className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-mono font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    56 Qs
                  </span>
                </div>
                <h3 className="text-base font-bold text-foreground group-hover:text-emerald-500 transition-colors flex items-center gap-1.5">
                  Aptitude <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-emerald-500" />
                </h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  Speed drills for Quant, Logical Reasoning & Verbal ability.
                </p>
              </div>

              {/* Card 4: Company Questions */}
              <div
                onClick={() => setActiveTab("companies")}
                className={cn(
                  "group relative p-5 rounded-2xl border transition-all cursor-pointer overflow-hidden shadow-xs backdrop-blur-md",
                  activeTab === "companies"
                    ? "bg-card border-amber-500 shadow-md ring-1 ring-amber-500/30 scale-[1.01]"
                    : "bg-card/70 border-border/70 hover:border-amber-500/50 hover:bg-card hover:shadow-sm"
                )}
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className={cn(
                    "h-10 w-10 rounded-xl grid place-items-center transition-colors",
                    activeTab === "companies" ? "bg-amber-500 text-white" : "bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:bg-amber-500 group-hover:text-white"
                  )}>
                    <Building2 className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-mono font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    6 Tracks
                  </span>
                </div>
                <h3 className="text-base font-bold text-foreground group-hover:text-amber-500 transition-colors flex items-center gap-1.5">
                  Company Questions <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-amber-500" />
                </h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  Targeted question sets for Google, Amazon, Meta, TCS & Infosys.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. MAIN WORKSPACE CONTAINER */}
        <main className="max-w-6xl mx-auto px-6 pt-6">

          {/* TAB 1: DSA PROBLEM SPRINT */}
          {activeTab === "dsa" && (
            <div className="space-y-5 animate-fade-up">
              
              {/* Search & Filter Header */}
              <div className="p-4 rounded-2xl border border-border/70 bg-card shadow-xs space-y-3.5">
                
                {/* Search Bar (Height 44-48px with subtle coral focus ring) */}
                <div className="relative w-full">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search problems by name, topic, or company..."
                    className="w-full h-11 pl-10 pr-9 text-xs sm:text-sm bg-background rounded-xl border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-brand/40 focus:border-brand transition-all"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter Controls Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-0.5">
                  
                  {/* Left Filters */}
                  <div className="flex flex-wrap items-center gap-2">
                    
                    {/* Difficulty Segmented Buttons */}
                    <div className="inline-flex items-center rounded-xl border border-border bg-secondary/30 p-0.5 text-xs font-semibold">
                      {(["All", "Easy", "Medium", "Hard"] as const).map((diff) => (
                        <button
                          key={diff}
                          onClick={() => setDifficulty(diff)}
                          className={cn(
                            "px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer",
                            difficulty === diff
                              ? "bg-card text-foreground font-bold shadow-2xs"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {diff}
                        </button>
                      ))}
                    </div>

                    {/* Company Popover Dropdown */}
                    <div className="relative" ref={companyRef}>
                      <button
                        type="button"
                        onClick={() => setCompanyOpen((o) => !o)}
                        className={cn(
                          "h-8 px-3 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer",
                          company !== "All"
                            ? "bg-brand/10 border-brand/40 text-brand font-bold"
                            : "bg-background border-border text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                        )}
                      >
                        <span>{company === "All" ? "Company" : company}</span>
                        <ChevronDown className="h-3 w-3 opacity-60" />
                      </button>

                      {companyOpen && (
                        <div className="absolute left-0 top-full mt-1.5 w-44 rounded-xl border border-border bg-card p-1.5 shadow-lg z-30 space-y-0.5 text-xs">
                          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50 mb-1">
                            Filter Company
                          </div>
                          {ALL_COMPANIES.map((c) => (
                            <button
                              key={c}
                              onClick={() => {
                                setCompany(c);
                                setCompanyOpen(false);
                              }}
                              className={cn(
                                "w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs transition-colors cursor-pointer",
                                company === c
                                  ? "bg-brand/10 text-brand font-bold"
                                  : "hover:bg-secondary text-foreground"
                              )}
                            >
                              <span>{c}</span>
                              {company === c && <Check className="h-3 w-3 text-brand" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Topic Popover Dropdown */}
                    <div className="relative" ref={topicRef}>
                      <button
                        type="button"
                        onClick={() => setTopicOpen((o) => !o)}
                        className={cn(
                          "h-8 px-3 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer",
                          topic !== "All"
                            ? "bg-brand/10 border-brand/40 text-brand font-bold"
                            : "bg-background border-border text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                        )}
                      >
                        <span>{topic === "All" ? "Topic" : topic}</span>
                        <ChevronDown className="h-3 w-3 opacity-60" />
                      </button>

                      {topicOpen && (
                        <div className="absolute left-0 top-full mt-1.5 w-52 rounded-xl border border-border bg-card p-1.5 shadow-lg z-30 space-y-0.5 text-xs max-h-64 overflow-y-auto custom-editor-scrollbar">
                          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50 mb-1">
                            Filter Topic
                          </div>
                          {ALL_TOPICS.map((t) => (
                            <button
                              key={t}
                              onClick={() => {
                                setTopic(t);
                                setTopicOpen(false);
                              }}
                              className={cn(
                                "w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs transition-colors cursor-pointer",
                                topic === t
                                  ? "bg-brand/10 text-brand font-bold"
                                  : "hover:bg-secondary text-foreground"
                              )}
                            >
                              <span>{t}</span>
                              {topic === t && <Check className="h-3 w-3 text-brand" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Status Popover Dropdown */}
                    <div className="relative" ref={statusRef}>
                      <button
                        type="button"
                        onClick={() => setStatusOpen((o) => !o)}
                        className={cn(
                          "h-8 px-3 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer",
                          statusFilter !== "All"
                            ? "bg-brand/10 border-brand/40 text-brand font-bold"
                            : "bg-background border-border text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                        )}
                      >
                        <span>{statusFilter === "All" ? "Status" : statusFilter}</span>
                        <ChevronDown className="h-3 w-3 opacity-60" />
                      </button>

                      {statusOpen && (
                        <div className="absolute left-0 top-full mt-1.5 w-36 rounded-xl border border-border bg-card p-1.5 shadow-lg z-30 space-y-0.5 text-xs">
                          {(["All", "Unsolved", "Solved"] as const).map((s) => (
                            <button
                              key={s}
                              onClick={() => {
                                setStatusFilter(s);
                                setStatusOpen(false);
                              }}
                              className={cn(
                                "w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs transition-colors cursor-pointer",
                                statusFilter === s
                                  ? "bg-brand/10 text-brand font-bold"
                                  : "hover:bg-secondary text-foreground"
                              )}
                            >
                              <span>{s}</span>
                              {statusFilter === s && <Check className="h-3 w-3 text-brand" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Sort Control */}
                  <div className="relative" ref={sortRef}>
                    <button
                      type="button"
                      onClick={() => setSortOpen((o) => !o)}
                      className="h-8 px-3 rounded-xl border border-border bg-background text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span className="text-[10px] uppercase text-muted-foreground">Sort:</span>
                      <span className="font-semibold text-foreground">{sortBy}</span>
                      <ChevronDown className="h-3 w-3 opacity-60" />
                    </button>

                    {sortOpen && (
                      <div className="absolute right-0 top-full mt-1.5 w-40 rounded-xl border border-border bg-card p-1.5 shadow-lg z-30 space-y-0.5 text-xs">
                        {(["Recommended", "Difficulty", "Name"] as const).map((opt) => (
                          <button
                            key={opt}
                            onClick={() => {
                              setSortBy(opt);
                              setSortOpen(false);
                            }}
                            className={cn(
                              "w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs transition-colors cursor-pointer",
                              sortBy === opt
                                ? "bg-brand/10 text-brand font-bold"
                                : "hover:bg-secondary text-foreground"
                            )}
                          >
                            <span>{opt}</span>
                            {sortBy === opt && <Check className="h-3 w-3 text-brand" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Active Filter Chips Row */}
                {hasActiveFilters && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border/50">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase mr-1">Active:</span>

                    {search.trim() && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-secondary px-2 py-0.5 rounded-lg text-foreground">
                        Search: "{search}"
                        <button onClick={() => setSearch("")} className="hover:text-brand">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}

                    {difficulty !== "All" && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-secondary px-2 py-0.5 rounded-lg text-foreground">
                        {difficulty}
                        <button onClick={() => setDifficulty("All")} className="hover:text-brand">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}

                    {company !== "All" && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-secondary px-2 py-0.5 rounded-lg text-foreground">
                        {company}
                        <button onClick={() => setCompany("All")} className="hover:text-brand">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}

                    {topic !== "All" && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-secondary px-2 py-0.5 rounded-lg text-foreground">
                        {topic}
                        <button onClick={() => setTopic("All")} className="hover:text-brand">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}

                    {statusFilter !== "All" && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-secondary px-2 py-0.5 rounded-lg text-foreground">
                        {statusFilter}
                        <button onClick={() => setStatusFilter("All")} className="hover:text-brand">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}

                    <button
                      onClick={clearAllFilters}
                      className="text-[11px] font-bold text-brand hover:underline ml-1 cursor-pointer"
                    >
                      Clear all
                    </button>
                  </div>
                )}
              </div>

              {/* Dynamic Count Header with Contextual LeetCode Indicator */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground px-1">
                <span className="font-semibold text-foreground">
                  Showing {filteredProblems.length} of {CURATED_DSA_PROBLEMS.length} problems
                </span>
                
                <div className="flex items-center gap-3">
                  {leetcode?.connected ? (
                    <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      LeetCode synced · <strong className="text-foreground">{leetcodeData?.totalSolved || 0}</strong> solved
                    </span>
                  ) : (
                    <Link
                      to="/connections"
                      className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-brand transition-colors"
                    >
                      LeetCode not connected · <span className="underline font-semibold text-foreground">Connect</span>
                    </Link>
                  )}
                  <span>·</span>
                  <span className="font-medium text-foreground">{solvedCount} completed</span>
                </div>
              </div>

              {/* Problem List (Clean Professional Rows with Dedicated Scroll Bar) */}
              <div className="rounded-2xl border border-border/70 bg-card overflow-hidden shadow-xs">
                <div className="max-h-[620px] overflow-y-auto pr-1 scrollbar-slim scroll-smooth divide-y divide-border/50">
                  {filteredProblems.length > 0 ? (
                    filteredProblems.map((prob) => {
                      const isSolved = solvedIds.has(prob.id);

                      return (
                        <div
                          key={prob.id}
                          onClick={() => window.open(prob.url, "_blank")}
                          className={cn(
                            "px-4 py-3.5 flex items-center justify-between gap-4 transition-all hover:bg-secondary/30 cursor-pointer group",
                            isSolved && "bg-emerald-500/[0.03]"
                          )}
                        >
                          {/* Left: Circular Status Control + Title + Tags */}
                          <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                            
                            {/* Circular Status Toggle Button */}
                            <button
                              type="button"
                              onClick={(e) => toggleSolved(prob.id, e)}
                              className={cn(
                                "h-5 w-5 rounded-full border grid place-items-center shrink-0 transition-colors cursor-pointer mt-0.5 sm:mt-0",
                                isSolved
                                  ? "bg-emerald-500 border-emerald-500 text-white"
                                  : "border-border hover:border-brand text-transparent hover:text-muted-foreground"
                              )}
                              title={isSolved ? "Mark as unsolved" : "Mark as solved"}
                            >
                              <Check className="h-3 w-3 stroke-[3]" />
                            </button>

                            {/* Problem Info */}
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h3
                                  className={cn(
                                    "text-sm font-semibold transition-colors group-hover:text-brand",
                                    isSolved ? "text-muted-foreground line-through" : "text-foreground"
                                  )}
                                >
                                  {prob.title}
                                </h3>
                                <ExternalLink className="h-3 w-3 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>

                              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground mt-0.5">
                                <span className="font-medium text-foreground/80">{prob.topic}</span>
                                <span>·</span>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {prob.companies.slice(0, 4).map((c, i) => (
                                    <span key={c} className="text-muted-foreground/80">
                                      {c}{i < Math.min(prob.companies.length, 4) - 1 ? " ·" : ""}
                                    </span>
                                  ))}
                                  {prob.companies.length > 4 && (
                                    <span className="text-[10px] text-muted-foreground/60">
                                      +{prob.companies.length - 4}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Right: Difficulty Badge + Action Button */}
                          <div className="flex items-center gap-4 shrink-0">
                            <span
                              className={cn(
                                "text-[10px] font-bold px-2 py-0.5 rounded-md",
                                prob.difficulty === "Easy"
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                  : prob.difficulty === "Medium"
                                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                              )}
                            >
                              {prob.difficulty}
                            </span>

                            <a
                              href={prob.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className={cn(
                                "h-7 px-3 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors",
                                isSolved
                                  ? "bg-secondary text-muted-foreground hover:bg-secondary/80"
                                  : "bg-secondary/80 text-foreground hover:bg-brand hover:text-brand-foreground"
                              )}
                            >
                              {isSolved ? "Solved ✓" : "Solve →"}
                            </a>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-12 px-4 text-center space-y-2">
                      <p className="text-sm font-semibold text-foreground">No problems found.</p>
                      <p className="text-xs text-muted-foreground">
                        Try changing your search terms or clearing active filters.
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={clearAllFilters}
                        className="mt-2 text-xs h-8 rounded-xl font-semibold"
                      >
                        Clear filters
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AI MOCK INTERVIEW */}
          {activeTab === "interview" && (
            <div className="space-y-6 animate-fade-up max-w-3xl mx-auto">
              <div className="p-6 sm:p-8 rounded-3xl border border-border/70 bg-card shadow-xs space-y-6">
                
                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand block">
                    AI MOCK INTERVIEW
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                    Practice realistic interview conversations with AI.
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Get scored on technical correctness, clarity, and communication depth.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Technical Round Card */}
                  <div className="p-5 rounded-2xl border border-border/70 bg-background/50 hover:border-brand/40 transition-colors flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="h-8 w-8 rounded-xl bg-brand/10 text-brand grid place-items-center font-bold text-xs">
                        <Code2 className="h-4 w-4" />
                      </div>
                      <h3 className="text-sm font-bold text-foreground">Technical DSA & Systems</h3>
                      <p className="text-xs text-muted-foreground">
                        Data structures, algorithms, problem decomposition, and complexity analysis.
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => navigate({ to: "/interview" })}
                      className="w-full bg-brand text-brand-foreground hover:opacity-90 font-semibold text-xs rounded-xl h-8 gap-1.5 shadow-sm"
                    >
                      Start Technical Round →
                    </Button>
                  </div>

                  {/* Behavioral / HR Round Card */}
                  <div className="p-5 rounded-2xl border border-border/70 bg-background/50 hover:border-brand/40 transition-colors flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="h-8 w-8 rounded-xl bg-accent-2/10 text-accent-2 grid place-items-center font-bold text-xs">
                        <Mic className="h-4 w-4" />
                      </div>
                      <h3 className="text-sm font-bold text-foreground">Behavioral & Leadership</h3>
                      <p className="text-xs text-muted-foreground">
                        STAR method responses, conflict resolution, past project delivery, and culture fit.
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => navigate({ to: "/interview" })}
                      className="w-full bg-secondary hover:bg-brand hover:text-brand-foreground text-foreground font-semibold text-xs rounded-xl h-8 gap-1.5 transition-colors"
                    >
                      Start Behavioral Round →
                    </Button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: REAL-TIME WORKING APTITUDE DRILLS */}
          {activeTab === "aptitude" && (
            <div className="space-y-6 animate-fade-up">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand block">
                  APTITUDE PRACTICE
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  Sharpen quantitative, logical, and verbal reasoning.
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Dynamic randomized question sets with server-side timed evaluation tuned for campus placements.
                </p>
              </div>

              {/* 3 Major Category Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {APTITUDE_TRACKS.map((track) => {
                  const qCount =
                    track.id === "quant"
                      ? aptitudeCounts.quant
                      : track.id === "logical"
                      ? aptitudeCounts.logical
                      : aptitudeCounts.verbal;

                  return (
                    <div
                      key={track.id}
                      className="p-5 sm:p-6 rounded-3xl border border-border/70 bg-card shadow-xs flex flex-col justify-between space-y-4 hover:border-brand/40 transition-colors"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span
                            className={cn(
                              "text-[10px] font-bold px-2 py-0.5 rounded-md",
                              track.category === "Quant"
                                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                : track.category === "Logical"
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            )}
                          >
                            {track.category}
                          </span>
                          <span className="text-xs text-muted-foreground font-mono font-semibold">
                            {qCount} Questions in Pool
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-foreground">{track.title}</h3>

                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            Key Placement Topics:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {track.topics.map((t) => (
                              <span key={t} className="text-[10px] px-2 py-0.5 rounded-lg bg-secondary text-foreground font-medium">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => openAptitudeSetup(track.id)}
                        className="w-full bg-brand text-brand-foreground hover:opacity-90 font-bold text-xs rounded-xl h-9 shadow-sm gap-1.5 transition-colors cursor-pointer"
                      >
                        Start Speed Drill →
                      </Button>
                    </div>
                  );
                })}
              </div>

              {/* Real History Section */}
              <AptitudeHistorySection
                uid={user?.id || "guest_user"}
                onViewPastResult={(pastResult) => setAssessmentResult(pastResult)}
              />
            </div>
          )}

          {/* TAB 4: COMPANY QUESTION BANKS */}
          {activeTab === "companies" && (
            <div className="space-y-6 animate-fade-up">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand block">
                  COMPANY QUESTION BANKS
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  Targeted question banks by top tech employers.
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Frequently tested patterns, hiring rounds, and must-solve curated problems.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {COMPANY_TRACKS.map((comp) => (
                  <div
                    key={comp.id}
                    className="p-5 rounded-2xl border border-border/70 bg-card shadow-xs space-y-4 hover:border-brand/40 transition-colors"
                  >
                    {/* Header with Logo */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-secondary/80 border border-border/60 grid place-items-center shrink-0">
                          {comp.logo}
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-foreground">{comp.name}</h3>
                          <p className="text-[11px] text-muted-foreground">{comp.tagline}</p>
                        </div>
                      </div>
                    </div>

                    {/* Tested Patterns */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Key Patterns:</span>
                      <div className="flex flex-wrap gap-1">
                        {comp.corePatterns.map((pat) => (
                          <span key={pat} className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-secondary text-foreground">
                            {pat}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Top Must-Solve Questions */}
                    <div className="space-y-1 pt-1 border-t border-border/50">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Must-Solve Questions:</span>
                      <div className="space-y-1">
                        {comp.topProblems.map((p, idx) => (
                          <a
                            key={idx}
                            href={p.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-1.5 rounded-lg bg-secondary/30 hover:bg-secondary transition-colors text-xs"
                          >
                            <span className="font-medium text-foreground truncate">{p.title}</span>
                            <span
                              className={cn(
                                "text-[9px] font-bold px-1.5 py-0.2 rounded shrink-0",
                                p.difficulty === "Easy"
                                  ? "text-emerald-500 bg-emerald-500/10"
                                  : p.difficulty === "Medium"
                                  ? "text-amber-500 bg-amber-500/10"
                                  : "text-rose-500 bg-rose-500/10"
                              )}
                            >
                              {p.difficulty} ↗
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>

                    {/* Bottom CTA to Filter DSA Table */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSelectCompanyTrack(comp.name.split(" ")[0])}
                      className="w-full text-xs font-semibold rounded-xl h-8 border-border hover:bg-secondary text-foreground"
                    >
                      View All {comp.name} Questions →
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Setup Modal */}
      <AptitudeSetupModal
        isOpen={setupModalOpen}
        onClose={() => setSetupModalOpen(false)}
        initialCategory={selectedAptitudeCategory}
        onStart={handleStartAptitudeSession}
        loading={creatingSession}
      />
    </PageShell>
  );
}
