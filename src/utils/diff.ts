export interface DiffLine {
  type: 'added' | 'removed' | 'equal' | 'empty';
  content: string;
  lineNumber?: number;
}

export interface SideBySideDiff {
  left: DiffLine[];
  right: DiffLine[];
  hasDiffs: boolean;
}

/**
 * Computes side-by-side differences between two text documents (e.g. JSON payloads).
 * Formats JSON automatically if valid.
 */
export function computeSideBySideDiff(leftStr: string, rightStr: string): SideBySideDiff {
  let leftFormatted = leftStr;
  let rightFormatted = rightStr;

  // Try formatting left JSON
  try {
    if (leftStr.trim()) {
      const parsed = JSON.parse(leftStr);
      leftFormatted = JSON.stringify(parsed, null, 2);
    }
  } catch (e) {
    // Fallback to original string
  }

  // Try formatting right JSON
  try {
    if (rightStr.trim()) {
      const parsed = JSON.parse(rightStr);
      rightFormatted = JSON.stringify(parsed, null, 2);
    }
  } catch (e) {
    // Fallback to original string
  }

  const leftLines = leftFormatted.split('\n');
  const rightLines = rightFormatted.split('\n');

  const n = leftLines.length;
  const m = rightLines.length;

  // Performance guard: if total lines are too large, avoid running quadratic LCS
  if (n > 1000 || m > 1000) {
    // Fallback to a simple line-by-line mismatch or just raw output without fancy alignment
    const maxLen = Math.max(n, m);
    const leftResult: DiffLine[] = [];
    const rightResult: DiffLine[] = [];
    let hasDiffs = false;

    for (let idx = 0; idx < maxLen; idx++) {
      const l = idx < n ? leftLines[idx] : '';
      const r = idx < m ? rightLines[idx] : '';
      const lExists = idx < n;
      const rExists = idx < m;

      if (l === r) {
        leftResult.push({ type: 'equal', content: l, lineNumber: lExists ? idx + 1 : undefined });
        rightResult.push({ type: 'equal', content: r, lineNumber: rExists ? idx + 1 : undefined });
      } else {
        hasDiffs = true;
        if (lExists && rExists) {
          leftResult.push({ type: 'removed', content: l, lineNumber: idx + 1 });
          rightResult.push({ type: 'added', content: r, lineNumber: idx + 1 });
        } else if (lExists) {
          leftResult.push({ type: 'removed', content: l, lineNumber: idx + 1 });
          rightResult.push({ type: 'empty', content: '' });
        } else {
          leftResult.push({ type: 'empty', content: '' });
          rightResult.push({ type: 'added', content: r, lineNumber: idx + 1 });
        }
      }
    }

    return {
      left: leftResult,
      right: rightResult,
      hasDiffs
    };
  }

  // standard LCS Dynamic Programming
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (leftLines[i - 1] === rightLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  let i = n;
  let j = m;
  const temp: { left: DiffLine; right: DiffLine }[] = [];
  let hasDiffs = false;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && leftLines[i - 1] === rightLines[j - 1]) {
      temp.push({
        left: { type: 'equal', content: leftLines[i - 1], lineNumber: i },
        right: { type: 'equal', content: rightLines[j - 1], lineNumber: j }
      });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      hasDiffs = true;
      temp.push({
        left: { type: 'empty', content: '' },
        right: { type: 'added', content: rightLines[j - 1], lineNumber: j }
      });
      j--;
    } else {
      hasDiffs = true;
      temp.push({
        left: { type: 'removed', content: leftLines[i - 1], lineNumber: i },
        right: { type: 'empty', content: '' }
      });
      i--;
    }
  }

  temp.reverse();

  return {
    left: temp.map(t => t.left),
    right: temp.map(t => t.right),
    hasDiffs
  };
}
