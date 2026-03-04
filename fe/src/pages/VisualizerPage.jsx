import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, BarChart2, Zap, Settings2, Search, Brain, GitBranch, Share2, Grid, Calculator, Swords, Info, Compass, Pause, PlayCircle, ListChecks, Code2, Check, RefreshCw, Layers } from 'lucide-react';

const VisualizerPage = () => {
    // Standard States
    const [array, setArray] = useState([]);
    const [category, setCategory] = useState('sorting');
    const [algorithm, setAlgorithm] = useState('bubble');
    const [speed, setSpeed] = useState(50);
    const [isSorting, setIsSorting] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [compared, setCompared] = useState([]);
    const [sorted, setSorted] = useState([]);
    const [foundIdx, setFoundIdx] = useState(null);
    const [customInput, setCustomInput] = useState('');
    const [searchTarget, setSearchTarget] = useState(200);
    const [raceMode, setRaceMode] = useState(false);

    // Clarity States
    const [logs, setLogs] = useState([]);
    const [currentLine, setCurrentLine] = useState(-1);
    const [searchRange, setSearchRange] = useState([-1, -1]);
    const [pointers, setPointers] = useState({ low: null, mid: null, high: null });

    // Race Mode States
    const [array2, setArray2] = useState([]);
    const [algorithm2, setAlgorithm2] = useState('quick');
    const [compared2, setCompared2] = useState([]);
    const [sorted2, setSorted2] = useState([]);
    const [isSorting2, setIsSorting2] = useState(false);

    // Specialized Logic States
    const [dpStrings, setDpStrings] = useState({ s1: "DSA", s2: "TREK" });
    const [dpTable, setDpTable] = useState([]);
    const [activeNodes, setActiveNodes] = useState([]);
    const [visitedNodes, setVisitedNodes] = useState([]);
    const [chessboard, setChessboard] = useState([]);
    const [mathResults, setMathResults] = useState([]);
    const [greedyIntervals, setGreedyIntervals] = useState([]);

    const isSortingRef = useRef(false);
    const isSorting2Ref = useRef(false);
    const isPausedRef = useRef(false);

    const categories = [
        { id: 'sorting', name: 'Sorting', icon: <BarChart2 size={18} /> },
        { id: 'searching', name: 'Searching', icon: <Search size={18} /> },
        { id: 'dp', name: 'DP', icon: <Brain size={18} /> },
        { id: 'graph', name: 'Graph', icon: <GitBranch size={18} /> },
        { id: 'tree', name: 'Tree', icon: <Share2 size={18} /> },
        { id: 'greedy', name: 'Greedy', icon: <Compass size={18} /> },
        { id: 'backtracking', name: 'Backtracking', icon: <Zap size={18} /> },
        { id: 'math', name: 'Math', icon: <Calculator size={18} /> },
    ];

    const algorithmsDict = {
        sorting: [
            { id: 'bubble', name: 'Bubble Sort', desc: 'O(n²) | Swap adjacent elements', pseudo: ["for i from 0 to n-1:", "  for j from 0 to n-i-1:", "    if arr[j] > arr[j+1]:", "      swap(arr[j], arr[j+1])"] },
            { id: 'selection', name: 'Selection Sort', desc: 'O(n²) | Min element selection', pseudo: ["for i from 0 to n:", "  min_idx = i", "  for j from i+1 to n:", "    if arr[j] < arr[min_idx]: min_idx = j", "  swap(arr[i], arr[min_idx])"] },
            { id: 'insertion', name: 'Insertion Sort', desc: 'O(n²) | Build incrementally', pseudo: ["for i from 1 to n:", "  key = arr[i], j = i-1", "  while j >= 0 and arr[j] > key:", "    arr[j+1] = arr[j], j--", "  arr[j+1] = key"] },
            { id: 'quick', name: 'Quick Sort', desc: 'O(n log n) | Pivot-based partition', pseudo: ["quickSort(arr, low, high):", "  if low < high:", "    pi = partition(arr, low, high)", "    quickSort(arr, low, pi - 1)", "    quickSort(arr, pi + 1, high)"] },
            { id: 'merge', name: 'Merge Sort', desc: 'O(n log n) | Recursive merging', pseudo: ["mergeSort(arr, l, r):", "  if l < r:", "    m = l + (r-l)/2", "    mergeSort(arr, l, m)", "    mergeSort(arr, m+1, r)", "    merge(arr, l, m, r)"] },
            { id: 'heap', name: 'Heap Sort', desc: 'O(n log n) | Max-heap extraction', pseudo: ["for i from n/2-1 to 0: heapify(n, i)", "for i from n-1 to 0:", "  swap(arr[0], arr[i])", "  heapify(i, 0)"] }
        ],
        searching: [
            { id: 'linear', name: 'Linear Search', desc: 'O(n) | Sequential scan', pseudo: ["for i from 0 to n:", "  if arr[i] == target: return i", "return -1"] },
            { id: 'binary', name: 'Binary Search', desc: 'O(log n) | Sorted range split', pseudo: ["while low <= high:", "  mid = (low + high) / 2", "  if arr[mid] == target: return mid", "  if arr[mid] < target: low = mid + 1", "  else: high = mid - 1"] }
        ],
        dp: [
            { id: 'fibonacci', name: 'Fibonacci', desc: 'Tabulation | O(n)', pseudo: ["dp[0]=0, dp[1]=1", "for i from 2 to n:", "  dp[i] = dp[i-1] + dp[i-2]", "return dp[n]"] },
            { id: 'lcs', name: 'LCS', desc: 'Longest Common Subsequence | O(m*n)', pseudo: ["for i from 1 to m:", "  for j from 1 to n:", "    if s1[i-1] == s2[j-1]: dp[i][j] = 1 + dp[i-1][j-1]", "    else: dp[i][j] = max(dp[i-1][j], dp[i][j-1])"] }
        ],
        graph: [
            { id: 'bfs', name: 'BFS', desc: 'Breadth First | Queue-based', pseudo: ["q.push(start), visited[start]=true", "while q not empty:", "  u = q.pop()", "  for v in adj[u]:", "    if not visited[v]: q.push(v), visited[v]=true"] },
            { id: 'dfs', name: 'DFS', desc: 'Depth First | Stack/Recursion', pseudo: ["dfs(u):", "  visited[u] = true", "  for v in adj[u]:", "    if not visited[v]: dfs(v)"] }
        ],
        tree: [
            { id: 'preorder', name: 'Preorder', desc: 'Root -> L -> R', pseudo: ["preorder(node):", "  visit(node)", "  preorder(node.left)", "  preorder(node.right)"] },
            { id: 'inorder', name: 'Inorder', desc: 'L -> Root -> R', pseudo: ["inorder(node):", "  inorder(node.left)", "  visit(node)", "  inorder(node.right)"] },
            { id: 'postorder', name: 'Postorder', desc: 'L -> R -> Root', pseudo: ["postorder(node):", "  postorder(node.left)", "  postorder(node.right)", "  visit(node)"] },
            { id: 'bst_search', name: 'BST Search', desc: 'Search in Binary Search Tree', pseudo: ["if node is null: return -1", "if node.val == target: return node", "if target < node.val: return search(node.left)", "else: return search(node.right)"] },
            { id: 'bst_insert', name: 'BST Insert', desc: 'Insert into Binary Search Tree', pseudo: ["if node is null: return new Node(val)", "if val < node.val: node.left = insert(node.left, val)", "else: node.right = insert(node.right, val)", "return node"] }
        ],
        greedy: [
            { id: 'activity', name: 'Activity Selection', desc: 'Maximize non-overlapping tasks', pseudo: ["sort activities by end time", "for each activity:", "  if start >= last_end:", "    select activity, last_end = end"] }
        ],
        backtracking: [
            { id: 'nqueens', name: 'N-Queens', desc: 'Place queens without attack', pseudo: ["solve(col):", "  for row in 0 to n:", "    if isSafe(row, col):", "      place queen, if solve(col+1) return true", "      remove queen"] },
            { id: 'sudoku', name: 'Sudoku Solver', desc: 'Assign digits to empty spots', pseudo: ["solve():", "  for r, c in board:", "    if empty:", "      for d in 1..9:", "        if safe: board[r][c]=d, if solve() return true", "      return false"] }
        ],
        math: [
            { id: 'sieve', name: 'Sieve of Eratosthenes', desc: 'Eliminate multiples of primes', pseudo: ["primes[] = true", "for p from 2 to sqrt(n):", "  if primes[p]:", "    for i from p*p to n step p: primes[i] = false"] },
            { id: 'gcd', name: 'GCD (Euclidean)', desc: 'Find common divisor by remainder', pseudo: ["while b != 0:", "  a = a % b", "  swap(a, b)", "return a"] }
        ]
    };

    useEffect(() => {
        resetArray();
    }, []);

    useEffect(() => {
        const algos = algorithmsDict[category];
        if (algos) setAlgorithm(algos[0].id);
        resetState();
        if (category === 'sorting' || category === 'searching') setCustomInput(array.join(', '));
        else if (category === 'dp' && algorithm === 'lcs') setCustomInput(`${dpStrings.s1}, ${dpStrings.s2}`);
        else setCustomInput('');
    }, [category]);

    const resetState = () => {
        setCompared([]); setSorted([]); setFoundIdx(null);
        setIsSorting(false); isSortingRef.current = false;
        setIsSorting2(false); isSorting2Ref.current = false;
        setIsPaused(false); isPausedRef.current = false;
        setCompared2([]); setSorted2([]);
        setDpTable([]); setActiveNodes([]); setVisitedNodes([]);
        setChessboard(Array(8).fill(null).map(() => Array(8).fill(0)));
        setMathResults([]); setGreedyIntervals([]);
        setLogs([]); setCurrentLine(-1);
        if (category === 'tree') setBstRoot(null);
        setSearchRange([-1, -1]);
        setPointers({ low: null, mid: null, high: null });
    };

    const [bstRoot, setBstRoot] = useState(null);

    const resetArray = () => {
        resetState();
        const newArray = [];
        for (let i = 0; i < 15; i++) newArray.push(Math.floor(Math.random() * 300) + 50);
        setArray(newArray); setArray2([...newArray]);
        setCustomInput(newArray.join(', '));
    };

    const applyCustomInput = () => {
        resetState();
        if (!customInput) return;

        if (category === 'sorting' || category === 'searching') {
            const newArray = customInput.split(',').map(x => parseInt(x.trim())).filter(x => !isNaN(x));
            if (newArray.length > 0) {
                setArray(newArray); setArray2([...newArray]);
                addLog(`Applied custom array: ${newArray.length} elements`);
            }
        } else if (category === 'dp' && algorithm === 'lcs') {
            const parts = customInput.split(',').map(x => x.trim());
            const s1 = parts[0] || "DSA";
            const s2 = parts[1] || "TREK";
            setDpStrings({ s1, s2 });
            addLog(`Applied strings for LCS: "${s1}", "${s2}"`);
        } else if (category === 'math' && algorithm === 'gcd') {
            const nums = customInput.split(',').map(x => parseInt(x.trim())).filter(x => !isNaN(x));
            if (nums.length >= 2) {
                setMathResults([nums[0], nums[1]]);
                addLog(`Applied numbers for GCD: ${nums[0]}, ${nums[1]}`);
            }
        }
    };

    const setPreset = (type) => {
        resetState();
        let newArray = [];
        if (type === 'reversed') {
            newArray = Array(15).fill(0).map((_, i) => (15 - i) * 20 + 50);
        } else if (type === 'nearly_sorted') {
            newArray = Array(15).fill(0).map((_, i) => (i + 1) * 20 + 50);
            for (let i = 0; i < 3; i++) {
                const idx1 = Math.floor(Math.random() * 15);
                const idx2 = Math.floor(Math.random() * 15);
                [newArray[idx1], newArray[idx2]] = [newArray[idx2], newArray[idx1]];
            }
        } else if (type === 'random') {
            resetArray();
            return;
        }
        setArray(newArray); setArray2([...newArray]);
        setCustomInput(newArray.join(', '));
        addLog(`Applied preset: ${type.replace('_', ' ')}`);
    };

    const addLog = (msg) => setLogs(prev => [msg, ...prev].slice(0, 50));

    const checkPause = async () => {
        while (isPausedRef.current) {
            await sleep(100);
        }
    };

    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const waitAndLog = async (line, logMsg) => {
        await checkPause();
        setCurrentLine(line);
        if (logMsg) addLog(logMsg);
        await sleep(Math.max(10, 101 - speed));
    };

    // --- ALGORITHMS ---

    const runSort = async (algoId, isSecond = false) => {
        let arr = isSecond ? [...array2] : [...array];
        let n = arr.length;
        const setArr = isSecond ? setArray2 : setArray;
        const setComp = isSecond ? setCompared2 : setCompared;
        const setSort = isSecond ? setSorted2 : setSorted;
        const ref = isSecond ? isSorting2Ref : isSortingRef;

        try {
            const heapify = async (sz, i) => {
                let largest = i; let l = 2 * i + 1; let r = 2 * i + 2;
                if (!isSecond) await waitAndLog(0, `Heapifying at index ${i}`);
                if (l < sz && arr[l] > arr[largest]) largest = l;
                if (r < sz && arr[r] > arr[largest]) largest = r;
                if (largest !== i) {
                    if (!ref.current) return;
                    setComp([i, largest]);
                    if (!isSecond) await waitAndLog(1, `Found larger child ${largest}. Swapping.`);
                    [arr[i], arr[largest]] = [arr[largest], arr[i]];
                    setArr([...arr]); await heapify(sz, largest);
                }
            };

            if (algoId === 'bubble') {
                for (let i = 0; i < n - 1; i++) {
                    if (!isSecond) await waitAndLog(0, `Starting pass ${i + 1}`);
                    for (let j = 0; j < n - i - 1; j++) {
                        if (!ref.current) return;
                        setComp([j, j + 1]);
                        if (!isSecond) await waitAndLog(2, `Comparing ${arr[j]} and ${arr[j + 1]}`);
                        if (arr[j] > arr[j + 1]) {
                            if (!isSecond) await waitAndLog(3, `Swapping ${arr[j]} and ${arr[j + 1]}`);
                            [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]; setArr([...arr]);
                        }
                    }
                    setSort(prev => [...prev, n - i - 1]);
                }
            } else if (algoId === 'selection') {
                for (let i = 0; i < n; i++) {
                    let min = i;
                    if (!isSecond) await waitAndLog(0, `Starting pass ${i + 1}, searching for min.`);
                    for (let j = i + 1; j < n; j++) {
                        if (!ref.current) return;
                        setComp([i, j]);
                        if (!isSecond) await waitAndLog(2, `Checking ${arr[j]}`);
                        if (arr[j] < arr[min]) {
                            min = j;
                            if (!isSecond) addLog(`New minimum found at index ${min} (${arr[min]})`);
                        }
                    }
                    if (!isSecond) await waitAndLog(4, `Swapping min value ${arr[min]} to index ${i}`);
                    [arr[i], arr[min]] = [arr[min], arr[i]]; setArr([...arr]);
                    setSort(prev => [...prev, i]);
                }
            } else if (algoId === 'insertion') {
                for (let i = 1; i < n; i++) {
                    let key = arr[i]; let j = i - 1;
                    if (!isSecond) await waitAndLog(0, `Inserting ${key} into sorted portion`);
                    while (j >= 0 && arr[j] > key) {
                        if (!ref.current) return;
                        setComp([i, j]);
                        if (!isSecond) await waitAndLog(2, `Shifting ${arr[j]} forward`);
                        arr[j + 1] = arr[j]; j--; setArr([...arr]);
                    }
                    if (!isSecond) await waitAndLog(4, `Placed ${key} at index ${j + 1}`);
                    arr[j + 1] = key; setArr([...arr]); setSort(prev => [...prev, i]);
                }
            } else if (algoId === 'quick') {
                const partition = async (low, high) => {
                    let pivot = arr[high]; let i = low - 1;
                    if (!isSecond) await waitAndLog(4, `Partitioning with pivot ${pivot}`);
                    for (let j = low; j < high; j++) {
                        if (!ref.current) return;
                        setComp([j, high]);
                        if (arr[j] < pivot) { i++;[arr[i], arr[j]] = [arr[j], arr[i]]; setArr([...arr]); }
                    }
                    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]]; setArr([...arr]);
                    return i + 1;
                };
                const qsort = async (l, h) => {
                    if (l < h) {
                        if (!isSecond) await waitAndLog(1, `Dividing range [${l}, ${h}]`);
                        let pi = await partition(l, h);
                        if (pi !== undefined) { await qsort(l, pi - 1); await qsort(pi + 1, h); }
                    }
                };
                await qsort(0, n - 1);
            } else if (algoId === 'merge') {
                const mrg = async (l, m, r) => {
                    let L = arr.slice(l, m + 1); let R = arr.slice(m + 1, r + 1);
                    if (!isSecond) await waitAndLog(5, `Merging sorted halves`);
                    let i = 0, j = 0, k = l;
                    while (i < L.length && j < R.length) {
                        if (!ref.current) return;
                        setComp([l + i, m + 1 + j]); await sleep(101 - speed);
                        if (L[i] <= R[j]) { arr[k] = L[i]; i++; } else { arr[k] = R[j]; j++; }
                        setArr([...arr]); k++;
                    }
                    while (i < L.length) { arr[k] = L[i]; i++; k++; setArr([...arr]); }
                    while (j < R.length) { arr[k] = R[j]; j++; k++; setArr([...arr]); }
                };
                const msrt = async (l, r) => {
                    if (l < r) {
                        let m = l + Math.floor((r - l) / 2);
                        if (!isSecond) await waitAndLog(1, `Splitting range [${l}, ${r}]`);
                        await msrt(l, m); await msrt(m + 1, r); await mrg(l, m, r);
                    }
                };
                await msrt(0, n - 1);
            } else if (algoId === 'heap') {
                for (let i = Math.floor(n / 2) - 1; i >= 0; i--) await heapify(n, i);
                for (let i = n - 1; i > 0; i--) {
                    if (!isSecond) await waitAndLog(2, `Swapping max element ${arr[0]} to back`);
                    [arr[0], arr[i]] = [arr[i], arr[0]]; setArr([...arr]); await heapify(i, 0); setSort(prev => [...prev, i]);
                }
            }
            setSort([...Array(n).keys()]);
        } finally {
            if (isSecond) { setIsSorting2(false); isSorting2Ref.current = false; }
            else { setIsSorting(false); isSortingRef.current = false; setCurrentLine(-1); addLog("Sorting Complete! 🎉"); }
            setComp([]);
        }
    };

    const runSearch = async (algoId, target = searchTarget) => {
        let arr = [...array];
        try {
            if (algoId === 'binary') {
                addLog("Sorting data for Binary Search...");
                arr.sort((a, b) => a - b); setArray(arr); await sleep(1000);
                let low = 0, high = arr.length - 1;
                setSearchRange([low, high]);
                while (low <= high) {
                    if (!isSortingRef.current) return;
                    let mid = Math.floor((low + high) / 2);
                    setSearchRange([low, high]);
                    setPointers({ low, mid, high });
                    setCompared([low, mid, high]);
                    await waitAndLog(1, `Checking mid index ${mid} (${arr[mid]})`);
                    if (arr[mid] === target) {
                        await waitAndLog(2, `Target ${target} found at index ${mid}!`);
                        setFoundIdx(mid);
                        setPointers({ low: null, mid, high: null });
                        return;
                    }
                    if (arr[mid] < target) {
                        await waitAndLog(3, `Target is larger, moving to right half`);
                        low = mid + 1;
                    } else {
                        await waitAndLog(4, `Target is smaller, moving to left half`);
                        high = mid - 1;
                    }
                }
                setPointers({ low: null, mid: null, high: null });
                setSearchRange([-1, -1]);
                addLog(`Target ${target} not found.`);
            } else {
                for (let i = 0; i < arr.length; i++) {
                    if (!isSortingRef.current) return;
                    setCompared([i]);
                    await waitAndLog(0, `Checking index ${i} (${arr[i]})`);
                    if (arr[i] === target) {
                        await waitAndLog(1, `Target ${target} found at index ${i}!`);
                        setFoundIdx(i); return;
                    }
                }
                addLog(`Target ${target} not found.`);
            }
        } finally {
            setIsSorting(false); isSortingRef.current = false; setCurrentLine(-1);
            setPointers({ low: null, mid: null, high: null });
            setSearchRange([-1, -1]);
        }
    };

    const runDP = async (algoId) => {
        try {
            if (algoId === 'fibonacci') {
                let n = 10; let dp = Array(n + 1).fill(0); setDpTable([dp]);
                await waitAndLog(0, "Base cases: dp[0]=0, dp[1]=1");
                dp[0] = 0; dp[1] = 1; setDpTable([[...dp]]);
                for (let i = 2; i <= n; i++) {
                    if (!isSortingRef.current) return;
                    setCompared([i - 1, i - 2]);
                    await waitAndLog(1, `Calculating dp[${i}] = dp[${i - 1}] + dp[${i - 2}]`);
                    dp[i] = dp[i - 1] + dp[i - 2]; setDpTable([[...dp]]);
                }
            } else { // LCS
                let s1 = dpStrings.s1, s2 = dpStrings.s2;
                let dp = Array(s1.length + 1).fill(null).map(() => Array(s2.length + 1).fill(0));
                setDpTable(dp.map(r => [...r]));
                for (let i = 1; i <= s1.length; i++) {
                    for (let j = 1; j <= s2.length; j++) {
                        if (!isSortingRef.current) return;
                        setCompared([i * (s2.length + 1) + j, (i - 1) * (s2.length + 1) + j, i * (s2.length + 1) + (j - 1)]);
                        if (s1[i - 1] === s2[j - 1]) {
                            await waitAndLog(2, `Match found: '${s1[i - 1]}'. Adding 1 to diagonal.`);
                            dp[i][j] = 1 + dp[i - 1][j - 1];
                        } else {
                            await waitAndLog(3, `No match. Taking max of neighbors.`);
                            dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
                        }
                        setDpTable(dp.map(r => [...r]));
                    }
                }
            }
        } finally {
            setIsSorting(false); isSortingRef.current = false; setCurrentLine(-1); addLog("DP Tabulation Complete!");
        }
    };

    const runGraph = async (algoId) => {
        const adj = [[1, 2], [0, 3, 4], [0, 5, 6], [1], [1], [2], [2]];
        let visited = Array(7).fill(false);
        try {
            if (algoId === 'bfs') {
                let q = [0]; visited[0] = true; setVisitedNodes([0]);
                await waitAndLog(0, "Pushing root Node 0 to Queue");
                while (q.length > 0) {
                    if (!isSortingRef.current) return;
                    let u = q.shift(); setActiveNodes([u]);
                    await waitAndLog(2, `Visiting Node ${u}`);
                    for (let v of adj[u]) {
                        if (!visited[v]) {
                            visited[v] = true; q.push(v);
                            await waitAndLog(4, `Found neighbor Node ${v}, adding to queue`);
                            setVisitedNodes(prev => [...prev, v]);
                        }
                    }
                }
            } else {
                const dfs = async (u) => {
                    if (!isSortingRef.current) return;
                    visited[u] = true; setVisitedNodes(prev => [...prev, u]); setActiveNodes([u]);
                    await waitAndLog(1, `Visiting Node ${u} (Recursive DFS)`);
                    for (let v of adj[u]) {
                        if (!visited[v]) {
                            await waitAndLog(3, `Moving deeper to neighbor Node ${v}`);
                            await dfs(v);
                        }
                    }
                };
                await dfs(0);
            }
        } finally {
            setIsSorting(false); isSortingRef.current = false; setCurrentLine(-1); addLog("Graph Traversal Complete!");
        }
    };

    const runTree = async (algoId) => {
        if (algoId.startsWith('bst')) {
            await runBST(algoId);
            return;
        }
        const left = [1, 3, 5, -1, -1, -1, -1];
        const right = [2, 4, 6, -1, -1, -1, -1];
        try {
            const traverse = async (u, type) => {
                if (u === -1 || !isSortingRef.current) return;
                if (type === 'preorder') {
                    setActiveNodes([u]); setVisitedNodes(prev => [...prev, u]);
                    await waitAndLog(1, `Preorder: Visit Node ${u}`);
                    await traverse(left[u], type); await traverse(right[u], type);
                } else if (type === 'inorder') {
                    await traverse(left[u], type);
                    setActiveNodes([u]); setVisitedNodes(prev => [...prev, u]);
                    await waitAndLog(2, `Inorder: Visit Node ${u}`);
                    await traverse(right[u], type);
                } else {
                    await traverse(left[u], type); await traverse(right[u], type);
                    setActiveNodes([u]); setVisitedNodes(prev => [...prev, u]);
                    await waitAndLog(3, `Postorder: Visit Node ${u}`);
                }
            };
            await traverse(0, algoId);
        } finally {
            setIsSorting(false); isSortingRef.current = false; setCurrentLine(-1); addLog("Tree Traversal Complete!");
        }
    };

    const runBST = async (algoId) => {
        const initialValues = [50, 30, 70, 20, 40, 60, 80];
        let root = bstRoot;

        const insert = async (node, val) => {
            if (!isSortingRef.current) return null;
            if (!node) {
                await waitAndLog(0, `Created new node with value ${val}`);
                return { val, left: null, right: null };
            }
            setActiveNodes([node.val]);
            if (val < node.val) {
                await waitAndLog(1, `${val} < ${node.val}, going left`);
                node.left = await insert(node.left, val);
            } else {
                await waitAndLog(2, `${val} >= ${node.val}, going right`);
                node.right = await insert(node.right, val);
            }
            return node;
        };

        const search = async (node, target) => {
            if (!isSortingRef.current) return false;
            if (!node) {
                await waitAndLog(0, `Target ${target} not found (Null reached)`);
                return false;
            }
            setActiveNodes([node.val]);
            if (node.val === target) {
                await waitAndLog(1, `Target ${target} found at node!`);
                setFoundIdx(node.val);
                return true;
            }
            if (target < node.val) {
                await waitAndLog(2, `${target} < ${node.val}, searching left`);
                return await search(node.left, target);
            } else {
                await waitAndLog(3, `${target} > ${node.val}, searching right`);
                return await search(node.right, target);
            }
        };

        try {
            if (!root) {
                for (let v of initialValues) {
                    root = await insert(root, v);
                    setBstRoot({ ...root });
                    await sleep(200);
                }
            }

            if (algoId === 'bst_search') {
                const target = searchTarget || 40;
                setFoundIdx(null);
                await search(root, target);
            } else if (algoId === 'bst_insert') {
                const val = Math.floor(Math.random() * 100);
                addLog(`Inserting random value: ${val}`);
                root = await insert(root, val);
                setBstRoot({ ...root });
            }
        } finally {
            setIsSorting(false); isSortingRef.current = false; setCurrentLine(-1); setActiveNodes([]);
        }
    };

    const runGreedy = async () => {
        let tasks = [
            { id: 0, start: 50, end: 150 }, { id: 1, start: 100, end: 200 },
            { id: 2, start: 160, end: 250 }, { id: 3, start: 220, end: 320 },
            { id: 4, start: 180, end: 300 }
        ].sort((a, b) => a.end - b.end);
        setGreedyIntervals(tasks);
        addLog("Sorted activities by end time (Greedy choice property)");
        try {
            let lastEnd = 0;
            for (let i = 0; i < tasks.length; i++) {
                if (!isSortingRef.current) return;
                setCompared([i]);
                await waitAndLog(2, `Checking Activity ${tasks[i].id}`);
                if (tasks[i].start >= lastEnd) {
                    await waitAndLog(3, `Accepted Activity ${tasks[i].id}! (Starts after ${lastEnd})`);
                    setSorted(prev => [...prev, i]); lastEnd = tasks[i].end;
                    await sleep(500);
                } else {
                    addLog(`Rejected Activity ${tasks[i].id} due to overlap.`);
                }
            }
        } finally {
            setIsSorting(false); isSortingRef.current = false; setCurrentLine(-1); addLog("Greedy Selection Complete!");
        }
    };

    const runBacktracking = async (algoId) => {
        try {
            if (algoId === 'nqueens') {
                let n = 8; let board = Array(n).fill(0).map(() => Array(n).fill(0));
                setChessboard(board.map(r => [...r]));
                const isSafe = (r, c) => {
                    for (let i = 0; i < c; i++) if (board[r][i]) return false;
                    for (let i = r, j = c; i >= 0 && j >= 0; i--, j--) if (board[i][j]) return false;
                    for (let i = r, j = c; i < n && j >= 0; i++, j--) if (board[i][j]) return false;
                    return true;
                };
                const solve = async (c) => {
                    if (c >= n) return true;
                    for (let i = 0; i < n; i++) {
                        if (!isSortingRef.current) return false;
                        setCompared([i * n + c]);
                        await waitAndLog(2, `Trying Queen at [${i}, ${c}]`);
                        if (isSafe(i, c)) {
                            board[i][c] = 1; setChessboard(board.map(r => [...r]));
                            addLog("Position safe. Moving to next column.");
                            if (await solve(c + 1)) return true;
                            board[i][c] = 0; setChessboard(board.map(r => [...r]));
                            addLog("Conflict detected ahead. Backtracking...");
                        }
                    }
                    return false;
                };
                await solve(0);
            } else { // Sudoku 4x4
                let grid = [[1, 0, 3, 0], [0, 0, 2, 1], [0, 1, 0, 2], [2, 4, 0, 0]];
                setChessboard(grid.map(r => [...r]));
                const solve = async () => {
                    for (let r = 0; r < 4; r++) {
                        for (let c = 0; c < 4; c++) {
                            if (grid[r][c] === 0) {
                                for (let n = 1; n <= 4; n++) {
                                    if (!isSortingRef.current) return false;
                                    setCompared([r * 4 + c]);
                                    await waitAndLog(4, `Trying ${n} at [${r}, ${c}]`);
                                    grid[r][c] = n; setChessboard(grid.map(x => [...x]));
                                    if (await solve()) return true;
                                    grid[r][c] = 0;
                                }
                                return false;
                            }
                        }
                    }
                    return true;
                };
                await solve();
            }
        } finally {
            setIsSorting(false); isSortingRef.current = false; setCurrentLine(-1); addLog("Backtracking Search Complete!");
        }
    };

    const runMath = async (algoId) => {
        try {
            if (algoId === 'sieve') {
                let n = 30; let p = Array(n + 1).fill(true); p[0] = p[1] = false; setMathResults([...p]);
                await waitAndLog(0, "Initializing all numbers as prime potential");
                for (let i = 2; i * i <= n; i++) {
                    if (!isSortingRef.current) return;
                    if (p[i]) {
                        await waitAndLog(2, `Found prime ${i}. Marking its multiples.`);
                        for (let j = i * i; j <= n; j += i) {
                            setCompared([j]);
                            await waitAndLog(3, `Eliminating multiple: ${j}`);
                            p[j] = false; setMathResults([...p]);
                        }
                    }
                }
            } else { // GCD
                let a = mathResults[0] || 48, b = mathResults[1] || 18;
                let currentMath = [a, b]; setMathResults(currentMath);
                while (currentMath[1] !== 0) {
                    if (!isSortingRef.current) return;
                    setCompared([0, 1]);
                    await waitAndLog(1, `Step: ${currentMath[0]} % ${currentMath[1]} = ${currentMath[0] % currentMath[1]}`);
                    currentMath = [currentMath[1], currentMath[0] % currentMath[1]];
                    setMathResults(currentMath);
                }
                addLog(`GCD Result: ${currentMath[0]}`);
            }
        } finally {
            setIsSorting(false); isSortingRef.current = false; setCurrentLine(-1);
        }
    };

    const startAction = () => {
        if (isSorting) return;
        setIsSorting(true); isSortingRef.current = true;
        if (raceMode) {
            setIsSorting2(true); isSorting2Ref.current = true;
            dispatcher(algorithm, false); dispatcher(algorithm2, true);
        } else dispatcher(algorithm, false);
    };

    const togglePause = () => {
        setIsPaused(!isPaused);
        isPausedRef.current = !isPausedRef.current;
        addLog(!isPaused ? "Visualization Paused" : "Visualization Resumed");
    };

    const dispatcher = (id, second) => {
        setLogs([]);
        if (category === 'sorting') runSort(id, second);
        else if (category === 'searching') runSearch(id, searchTarget);
        else if (category === 'dp') runDP(id);
        else if (category === 'graph') runGraph(id);
        else if (category === 'tree') runTree(id);
        else if (category === 'greedy') runGreedy();
        else if (category === 'backtracking') runBacktracking(id);
        else if (category === 'math') runMath(id);
    };

    // --- RENDERERS ---

    const renderBars = (arr, comp, sort, found, title) => (
        <div className="flex-1 flex flex-col items-center">
            {title && <h3 className="text-sm font-bold mb-4 text-[#45A29E] uppercase tracking-widest">{title}</h3>}
            <div className="flex items-end justify-center w-full h-[250px] gap-1 md:gap-2 bg-white/5 p-6 rounded-3xl border border-white/5 relative shadow-inner">
                {arr.map((val, idx) => {
                    const isOutOfRange = (algorithm === 'binary' || algorithm === 'bst_search') && searchRange[0] !== -1 && (idx < searchRange[0] || idx > searchRange[1]);
                    return (
                        <div key={idx} className="relative group transition-all duration-300 rounded-t-xl"
                            style={{
                                height: `${(val / 400) * 100}%`, width: raceMode ? '14px' : '28px',
                                backgroundColor: found === idx ? '#F59E0B' : sort.includes(idx) ? '#10B981' : comp.includes(idx) ? '#EF4444' : '#45A29E',
                                boxShadow: comp.includes(idx) ? '0 0 15px #EF444480' : 'none',
                                opacity: isOutOfRange ? 0.2 : 1
                            }}
                        >
                            <div className={`absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] font-bold transition-opacity bg-black/80 px-1 rounded-sm border border-white/10 ${arr.length < 20 ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                {val}
                            </div>

                            {/* Pointers for Binary Search */}
                            {algorithm === 'binary' && category === 'searching' && (
                                <>
                                    {pointers.low === idx && <div className="absolute -top-14 left-1/2 -translate-x-1/2 text-[10px] font-black text-blue-400 animate-bounce">L</div>}
                                    {pointers.mid === idx && <div className="absolute -top-14 left-1/2 -translate-x-1/2 text-[10px] font-black text-red-400 animate-bounce">M</div>}
                                    {pointers.high === idx && <div className="absolute -top-14 left-1/2 -translate-x-1/2 text-[10px] font-black text-emerald-400 animate-bounce">H</div>}
                                </>
                            )}

                            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] font-black text-gray-500 opacity-60">
                                {idx}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    const renderGrid = () => (
        <div className="w-full flex flex-col items-center overflow-auto gap-4 p-8">
            <h3 className="text-xl font-bold text-[#45A29E] uppercase tracking-widest">{algorithm} Process</h3>
            <div className="flex flex-col gap-1">
                {dpTable.map((row, rIdx) => (
                    <div key={rIdx} className="flex gap-1">
                        {row.map((val, cIdx) => (
                            <div key={cIdx} className={`w-10 h-10 flex items-center justify-center border border-white/10 rounded-lg text-[10px] font-bold transition-all ${compared.includes(rIdx * row.length + cIdx) ? 'bg-[#EF4444] text-white shadow-lg' : 'bg-white/5'}`}>
                                {val}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );

    const renderGreedy = () => (
        <div className="w-full h-full flex flex-col items-center justify-center p-8 gap-10">
            <h3 className="text-xl font-bold text-[#45A29E] uppercase tracking-widest">Activity Timeline</h3>
            <div className="w-full max-w-xl h-[250px] border border-white/5 rounded-2xl p-6 relative bg-black/20 overflow-hidden">
                {greedyIntervals.map((t, i) => (
                    <div key={i} className="flex items-center gap-4 mb-4">
                        <div className="text-[10px] w-8 text-gray-500 font-bold uppercase">Task {t.id}</div>
                        <div className={`h-6 rounded-lg transition-all duration-500 flex items-center justify-center text-[10px] font-black ${sorted.includes(i) ? 'bg-[#10B981] shadow-lg shadow-emerald-500/20' : compared.includes(i) ? 'bg-[#EF4444] shadow-lg shadow-red-500/20' : 'bg-white/10'}`}
                            style={{ marginLeft: `${t.start / 4}%`, width: `${(t.end - t.start) / 4}%` }}
                        >
                            {sorted.includes(i) ? 'OK' : ''}
                        </div>
                    </div>
                ))}
                <div className="absolute bottom-4 left-0 right-0 h-px bg-white/5 mx-10"></div>
            </div>
        </div>
    );

    const renderBoard = () => (
        <div className="w-full h-full flex flex-col items-center justify-center p-8 gap-8">
            <h3 className="text-xl font-bold text-[#45A29E] uppercase tracking-widest">Decision Board</h3>
            <div className={`grid ${chessboard.length === 8 ? 'grid-cols-8' : 'grid-cols-4'} border-4 border-[#1F2833] gap-1 bg-[#1F2833] p-1 rounded-xl shadow-2xl`}>
                {chessboard.flat().map((v, i) => (
                    <div key={i} className={`${chessboard.length === 8 ? 'w-10 h-10 sm:w-12 sm:h-12' : 'w-16 h-16'} flex items-center justify-center text-3xl transition-all duration-300 ${compared.includes(i) ? 'bg-[#EF4444]/40 z-10 scale-105' : (Math.floor(i / chessboard.length) + i % chessboard.length) % 2 === 0 ? 'bg-white/10' : 'bg-white/5'} rounded-sm relative overflow-hidden`}>
                        {v === 1 && algorithm === 'nqueens' ? <span className="drop-shadow-lg">👑</span> : v !== 0 ? <span className="text-xl font-black text-[#10B981]">{v}</span> : ''}
                    </div>
                ))}
            </div>
        </div>
    );

    const renderMathView = () => (
        <div className="w-full h-full flex flex-col items-center justify-center p-8 gap-12">
            {algorithm === 'gcd' ? (
                <div className="flex flex-col items-center gap-12 group">
                    <h3 className="text-xl font-bold text-[#45A29E] uppercase tracking-widest">Euclidean Reduction</h3>
                    <div className="flex gap-16 items-center text-7xl font-black tracking-tighter">
                        <div className={`transition-all duration-300 ${compared.includes(0) ? 'text-[#EF4444] scale-110 drop-shadow-[0_0_20px_#EF444480]' : 'text-white'}`}>{mathResults[0]}</div>
                        <div className="text-[#45A29E] text-2xl lowercase font-normal italic opacity-50">mod</div>
                        <div className={`transition-all duration-300 ${compared.includes(1) ? 'text-[#EF4444] scale-110 drop-shadow-[0_0_20px_#EF444480]' : 'text-white'}`}>{mathResults[1]}</div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-8">
                    <h3 className="text-xl font-bold text-[#45A29E] uppercase tracking-widest">Prime Sieve Filter</h3>
                    <div className="grid grid-cols-6 sm:grid-cols-10 gap-2 border border-white/5 p-6 rounded-3xl bg-black/20">
                        {mathResults.map((isPrime, idx) => (
                            <div key={idx} className={`w-10 h-10 flex items-center justify-center rounded-xl font-black text-xs transition-all duration-300 border ${compared.includes(idx) ? 'bg-[#EF4444] border-red-500 text-white scale-125 z-10 shadow-lg shadow-red-500/40' : isPrime ? 'bg-[#10B981] border-emerald-500/30 text-white' : 'bg-white/5 border-white/10 text-gray-700'}`}>
                                {idx}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    const renderGraphTree = () => {
        if (algorithm.startsWith('bst')) {
            const renderNode = (node, x, y, level) => {
                if (!node) return null;
                const offset = 160 / (level + 1);
                return (
                    <React.Fragment key={node.val}>
                        {/* Lines to children */}
                        {node.left && (
                            <div className="absolute bg-white/10" style={{ left: `${x + 20}px`, top: `${y + 30}px`, width: `${offset}px`, height: '2px', transform: 'rotate(150deg)', transformOrigin: '0 0' }} />
                        )}
                        {node.right && (
                            <div className="absolute bg-white/10" style={{ left: `${x + 20}px`, top: `${y + 30}px`, width: `${offset}px`, height: '2px', transform: 'rotate(30deg)', transformOrigin: '0 0' }} />
                        )}

                        <div className={`absolute w-12 h-12 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all duration-300 z-10 ${activeNodes.includes(node.val) ? 'bg-[#EF4444] border-red-500 scale-125 shadow-[0_0_20px_#EF4444]' : foundIdx === node.val ? 'bg-[#F59E0B] border-amber-500 shadow-lg' : 'bg-[#1F2833] border-white/20 text-gray-400'}`}
                            style={{ left: `${x}px`, top: `${y}px` }}
                        >
                            {node.val}
                        </div>
                        {renderNode(node.left, x - offset, y + 80, level + 1)}
                        {renderNode(node.right, x + offset, y + 80, level + 1)}
                    </React.Fragment>
                );
            };

            return (
                <div className="w-full h-[400px] relative flex items-center justify-center overflow-auto">
                    <div className="relative" style={{ width: '600px', height: '100%' }}>
                        {bstRoot ? renderNode(bstRoot, 280, 40, 0) : <div className="text-gray-600 mt-20 text-center">Initializing BST...</div>}
                    </div>
                </div>
            );
        }

        return (
            <div className="w-full h-full flex flex-col items-center justify-center gap-10 p-8">
                <h3 className="text-xl font-bold text-[#45A29E] uppercase tracking-widest">{algorithm} Flow</h3>
                <div className="flex flex-wrap gap-8 justify-center max-w-lg p-10 bg-white/5 rounded-[3rem] border border-white/10 relative">
                    {[0, 1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className={`w-16 h-16 rounded-full border-4 flex items-center justify-center text-lg font-black transition-all duration-500 relative ${activeNodes.includes(i) ? 'bg-[#EF4444] border-red-500 scale-125 z-20 shadow-[0_0_30px_#EF4444]' : visitedNodes.includes(i) ? 'bg-[#10B981] border-emerald-600 shadow-lg shadow-emerald-500/20' : 'bg-[#1F2833] border-white/10 text-gray-500 opacity-40'}`}>
                            {i}
                        </div>
                    ))}
                </div>
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest bg-[#1F2833] px-6 py-3 rounded-2xl border border-white/5">
                    Order: {visitedNodes.join(' → ')}
                </div>
            </div>
        );
    };

    return (
        <div className="pt-28 pb-20 px-8 min-h-screen bg-transparent text-[#C5C6C7] font-sans selection:bg-red-500/30 overflow-x-hidden relative">
            {/* Dynamic Background */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-5%] left-[-5%] w-[35%] h-[35%] bg-[var(--color-primary)]/3 blur-[150px] rounded-full animate-pulse"></div>
            </div>
            <div className="max-w-[90rem] mx-auto relative z-10">
                {/* Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-8">
                    <div className="flex items-center gap-5">
                    </div>
                    {/* Category Selector */}
                    <div className="flex flex-wrap items-center gap-3 bg-white/5 p-2 rounded-3xl border border-white/10 backdrop-blur-xl shadow-2xl">
                        {categories.map(c => (
                            <button key={c.id} onClick={() => setCategory(c.id)} className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-black transition-all ${category === c.id ? 'bg-[#E63946] text-white shadow-lg scale-105' : 'hover:bg-white/10 text-gray-500'}`}>
                                <span className={category === c.id ? "animate-bounce" : ""}>{c.icon}</span>
                                <span className="hidden sm:inline tracking-widest">{c.name.toUpperCase()}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column (8 Col) */}
                    <div className="lg:col-span-12 xl:col-span-8 space-y-8">
                        {/* Custom Input Card */}
                        <div className="bg-white/5 backdrop-blur-2xl p-10 rounded-[3rem] border border-white/10 shadow-3xl relative overflow-hidden group">
                            <div className="flex flex-col gap-8 relative z-10">
                                <div className="flex flex-col md:flex-row gap-8 items-end">
                                    <div className="flex-1 w-full space-y-4">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 ml-1">
                                            <Settings2 size={12} /> {category === 'dp' && algorithm === 'lcs' ? "Target Strings (s1, s2)" : category === 'math' && algorithm === 'gcd' ? "Numbers (a, b)" : "Custom Array Input"}
                                        </label>
                                        <div className="relative group/input">
                                            <input type="text" value={customInput} onChange={e => setCustomInput(e.target.value)} placeholder={category === 'dp' && algorithm === 'lcs' ? "e.g. DSA, TREK" : category === 'math' && algorithm === 'gcd' ? "e.g. 48, 18" : "e.g. 10, 40, 20, 80"} className="w-full bg-[#1F2833] border border-white/10 rounded-2xl px-6 py-5 pr-32 text-sm font-black text-white focus:ring-4 focus:ring-red-500/20 transition-all outline-none" />
                                            <button onClick={applyCustomInput} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/5 hover:bg-[#E63946] text-gray-400 hover:text-white px-5 py-2.5 rounded-xl text-[9px] font-black transition-all border border-white/5 flex items-center gap-2 uppercase tracking-widest">
                                                <Check size={12} /> Apply
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex-1 w-full space-y-4">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 ml-1">
                                            <Layers size={12} /> Quick Presets
                                        </label>
                                        <div className="flex gap-2">
                                            <button onClick={() => setPreset('random')} className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-xl text-[9px] font-black uppercase text-gray-400 border border-white/5 transition-all">Random</button>
                                            <button onClick={() => setPreset('reversed')} className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-xl text-[9px] font-black uppercase text-gray-400 border border-white/5 transition-all">Reversed</button>
                                            <button onClick={() => setPreset('nearly_sorted')} className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-xl text-[9px] font-black uppercase text-gray-400 border border-white/5 transition-all">Nearly Sorted</button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col md:flex-row gap-10 items-end">
                                    <div className="flex-1 w-full space-y-4">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 ml-1">
                                            <Compass size={12} /> Algorithm Selection
                                        </label>
                                        <select value={algorithm} onChange={e => setAlgorithm(e.target.value)} disabled={isSorting} className="w-full bg-[#1F2833] border border-white/10 rounded-2xl px-6 py-5 text-sm font-black text-white focus:ring-4 focus:ring-red-500/20 appearance-none cursor-pointer outline-none shadow-inner">
                                            {algorithmsDict[category].map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                        </select>
                                    </div>
                                    {category === 'searching' && (
                                        <div className="flex-1 w-full space-y-4">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 ml-1">
                                                <Search size={12} /> Target Element
                                            </label>
                                            <input
                                                type="number"
                                                value={searchTarget}
                                                onChange={e => setSearchTarget(parseInt(e.target.value) || 0)}
                                                className="w-full bg-[#1F2833] border border-white/10 rounded-2xl px-6 py-5 text-sm font-black text-white focus:ring-4 focus:ring-red-500/20 transition-all outline-none"
                                                placeholder="e.g. 200"
                                            />
                                        </div>
                                    )}
                                    <div className="flex-1 w-full space-y-4">
                                        <div className="flex justify-between items-center ml-1">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Speed Control</label>
                                            <span className="text-[10px] font-black text-[#E63946]">{Math.round(101 - speed)}ms Interval</span>
                                        </div>
                                        <input type="range" min="1" max="100" value={speed} onChange={e => setSpeed(parseInt(e.target.value))} className="w-full h-2 bg-white/5 rounded-full appearance-none cursor-pointer accent-[#E63946] border border-white/5" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Visualization Area */}
                        <div className="bg-white/5 backdrop-blur-2xl p-10 rounded-[3rem] border border-white/10 shadow-3xl min-h-[450px] flex items-center justify-center transition-all duration-700 relative">
                            {category === 'sorting' || category === 'searching' ? (
                                <div className={`w-full flex ${raceMode ? 'flex-col md:flex-row gap-16' : 'flex-col'}`}>
                                    {renderBars(array, compared, sorted, foundIdx, raceMode ? algorithm : null)}
                                    {raceMode && renderBars(array2, compared2, sorted2, null, algorithm2)}
                                </div>
                            ) : category === 'dp' ? renderGrid()
                                : category === 'greedy' ? renderGreedy()
                                    : category === 'backtracking' ? renderBoard()
                                        : category === 'math' ? renderMathView()
                                            : category === 'graph' || category === 'tree' ? renderGraphTree()
                                                : <div className="text-gray-600 italic">Select a logic to visualize...</div>}

                            <div className="absolute top-0 right-0 p-10 z-20">
                                <button onClick={() => setRaceMode(!raceMode)} className={`flex items-center gap-3 px-8 py-3.5 rounded-2xl text-[10px] font-black transition-all border ${raceMode ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30 shadow-lg' : 'bg-white/5 text-gray-500 border-white/10 hover:border-white/20'}`}>
                                    <Swords size={12} className={raceMode ? "animate-pulse" : ""} /> {raceMode ? 'EXIT COMPETITION' : 'RACE MODE'}
                                </button>
                            </div>
                        </div>

                        {/* Control Bar */}
                        <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 flex flex-col md:flex-row gap-8 items-center justify-between shadow-2xl">
                            <div className="flex gap-5 w-full md:w-auto">
                                <button onClick={resetArray} className="px-10 py-5 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black flex items-center gap-3 transition-all border border-white/5 text-gray-400 uppercase tracking-widest">
                                    <RefreshCw size={16} /> Shuffle Data
                                </button>
                                <button onClick={startAction} className={`px-12 py-5 rounded-2xl text-[10px] font-black flex items-center gap-3 transition-all active:scale-95 shadow-2xl hover:brightness-110 tracking-widest ${isSorting ? 'bg-[#1F2833] text-gray-600' : 'bg-gradient-to-r from-[#E63946] to-red-600 text-white shadow-red-500/30'}`}>
                                    <PlayCircle size={18} fill={isSorting ? "none" : "currentColor"} /> {isSorting ? 'SIMULATING...' : 'START VISUAL'}
                                </button>
                                {isSorting && !raceMode && (
                                    <button onClick={togglePause} className={`px-10 py-5 rounded-2xl text-[10px] font-black flex items-center justify-center gap-3 transition-all border active:scale-95 ${isPaused ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30 shadow-emerald-500/10' : 'bg-blue-500/10 text-blue-500 border-blue-500/30 shadow-blue-500/10'}`}>
                                        {isPaused ? <PlayCircle size={18} /> : <Pause size={18} />} {isPaused ? 'RESUME' : 'PAUSE'}
                                    </button>
                                )}
                            </div>

                            <div className="flex gap-8 bg-black/20 px-8 py-5 rounded-2xl border border-white/5">
                                <div className="flex items-center gap-3 text-[10px] font-black text-gray-400 uppercase">
                                    <div className="w-3.5 h-3.5 bg-[#EF4444] rounded shadow-[0_0_8px_#EF4444]"></div> Comparison
                                </div>
                                <div className="flex items-center gap-3 text-[10px] font-black text-gray-400 uppercase">
                                    <div className="w-3.5 h-3.5 bg-[#10B981] rounded shadow-[0_0_8px_#10B981]"></div> Sorted
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column (4 Col) */}
                    <div className="lg:col-span-12 xl:col-span-4 space-y-8">
                        {/* Pseudo Code */}
                        {!raceMode && (
                            <div className="bg-white/5 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 overflow-hidden shadow-3xl">
                                <div className="bg-white/5 px-8 py-6 flex items-center gap-4 border-b border-white/5">
                                    <Code2 size={20} className="text-[#E63946]" />
                                    <h3 className="text-xs font-black uppercase tracking-widest text-white">Logic Trace</h3>
                                </div>
                                <div className="p-8 font-mono text-[11px] leading-relaxed space-y-2 bg-black/10">
                                    {algorithmsDict[category].find(a => a.id === algorithm)?.pseudo.map((line, idx) => (
                                        <div key={idx} className={`px-4 py-1.5 rounded-lg transition-all duration-300 flex gap-4 ${currentLine === idx ? 'bg-[#E63946] text-white shadow-lg shadow-red-500/20 translate-x-2' : 'text-gray-500 opacity-60'}`}>
                                            <span className="w-4 opacity-30">{idx + 1}</span>
                                            <span>{line}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Activity Log */}
                        <div className="bg-white/5 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 h-[450px] flex flex-col overflow-hidden shadow-3xl">
                            <div className="bg-white/5 px-8 py-6 flex items-center gap-4 border-b border-white/5">
                                <ListChecks size={20} className="text-[#10B981]" />
                                <h3 className="text-xs font-black uppercase tracking-widest text-white">Execution Stream</h3>
                            </div>
                            <div className="flex-1 overflow-y-auto p-8 space-y-4 custom-scrollbar bg-black/10">
                                {logs.length === 0 && <div className="text-gray-600 text-[10px] italic font-medium">Ready to capture stack traces...</div>}
                                {logs.map((log, idx) => (
                                    <div key={idx} className={`flex gap-4 text-[11px] font-medium leading-relaxed transition-all duration-300 ${idx === 0 ? 'text-white translate-x-1 border-l-2 border-[#10B981] pl-3' : 'text-gray-500 opacity-70'}`}>
                                        <span className="text-gray-800 font-black tabular-nums">{logs.length - idx}.</span>
                                        <span>{log}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
                select { -webkit-appearance: none; }
            `}</style>
        </div>
    );
};

export default VisualizerPage;
