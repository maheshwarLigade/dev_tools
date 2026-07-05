/**
 * A highly robust, lightweight client-side JSONPath query engine in pure TypeScript.
 * Supports:
 * - Root element: `$`
 * - Property selection: `$.key`, `$['key']`, `$["key"]`
 * - Deep search recursive descent: `$..key`
 * - Array indexing: `$[0]`, `$.key[1]`
 * - Wildcard array selection: `$.*`, `$.key[*]`
 * - Chained selections: `$.items[*].name`
 */

export function evaluateJsonPath(obj: any, path: string): { success: boolean; data: any; error?: string } {
  if (!path || path.trim() === '') {
    return { success: true, data: obj };
  }

  const trimmed = path.trim();
  if (!trimmed.startsWith('$')) {
    return { success: false, data: null, error: 'JSONPath must start with "$"' };
  }

  try {
    const tokens: string[] = [];
    let i = 1; // start after '$'
    
    while (i < trimmed.length) {
      const char = trimmed[i];
      
      if (char === '.') {
        if (trimmed[i + 1] === '.') {
          // Recursive descent ..
          tokens.push('..');
          i += 2;
          
          // Read the following key name if any
          let key = '';
          while (i < trimmed.length && /[a-zA-Z0-9_$]/.test(trimmed[i])) {
            key += trimmed[i];
            i++;
          }
          if (key) {
            tokens.push(key);
          }
        } else {
          // Standard dot separator .
          i++;
          let key = '';
          while (i < trimmed.length && /[a-zA-Z0-9_$]/.test(trimmed[i])) {
            key += trimmed[i];
            i++;
          }
          if (key) {
            tokens.push(key);
          } else if (trimmed[i] === '*') {
            tokens.push('*');
            i++;
          }
        }
      } else if (char === '[') {
        i++; // skip '['
        // Read until ']'
        let content = '';
        let quoteChar: string | null = null;
        while (i < trimmed.length) {
          const c = trimmed[i];
          if (!quoteChar && (c === "'" || c === '"')) {
            quoteChar = c;
            i++;
            continue;
          }
          if (quoteChar && c === quoteChar) {
            quoteChar = null;
            i++;
            continue;
          }
          if (!quoteChar && c === ']') {
            i++; // skip ']'
            break;
          }
          content += c;
          i++;
        }
        
        content = content.trim();
        tokens.push(`[${content}]`);
      } else if (/[a-zA-Z0-9_$]/.test(char)) {
        // Fallback or starting property name without dot
        let key = '';
        while (i < trimmed.length && /[a-zA-Z0-9_$]/.test(trimmed[i])) {
          key += trimmed[i];
          i++;
        }
        tokens.push(key);
      } else {
        i++;
      }
    }

    // Now evaluate tokens sequentially starting with root obj
    let current: any[] = [obj]; // Set of candidate values
    
    let tokenIdx = 0;
    while (tokenIdx < tokens.length) {
      const token = tokens[tokenIdx];
      const nextToken = tokens[tokenIdx + 1];
      
      if (token === '..') {
        const matches: any[] = [];
        const recurse = (val: any) => {
          if (val === null || typeof val !== 'object') return;
          
          if (Array.isArray(val)) {
            val.forEach(item => {
              matches.push(item);
              recurse(item);
            });
          } else {
            Object.keys(val).forEach(k => {
              matches.push(val[k]);
              recurse(val[k]);
            });
          }
        };
        
        current.forEach(item => {
          matches.push(item);
          recurse(item);
        });
        
        if (nextToken && nextToken !== '..') {
          const filtered: any[] = [];
          const keyToFind = nextToken.startsWith('[') && nextToken.endsWith(']')
            ? nextToken.slice(1, -1).replace(/['"]/g, '')
            : nextToken;
            
          matches.forEach(item => {
            if (item && typeof item === 'object') {
              if (keyToFind === '*') {
                if (Array.isArray(item)) {
                  filtered.push(...item);
                } else {
                  filtered.push(...Object.values(item));
                }
              } else if (keyToFind in item) {
                filtered.push(item[keyToFind]);
              }
            }
          });
          current = filtered;
          tokenIdx += 2; // skipped .. and the nextToken
        } else {
          current = matches;
          tokenIdx++;
        }
      } else {
        const nextCandidates: any[] = [];
        
        current.forEach(item => {
          if (item === null || typeof item !== 'object') return;
          
          if (token === '*') {
            if (Array.isArray(item)) {
              nextCandidates.push(...item);
            } else {
              nextCandidates.push(...Object.values(item));
            }
          } else if (token.startsWith('[') && token.endsWith(']')) {
            const inner = token.slice(1, -1).trim();
            if (inner === '*') {
              if (Array.isArray(item)) {
                nextCandidates.push(...item);
              } else {
                nextCandidates.push(...Object.values(item));
              }
            } else if (/^\d+$/.test(inner)) {
              const idx = parseInt(inner, 10);
              if (Array.isArray(item) && idx >= 0 && idx < item.length) {
                nextCandidates.push(item[idx]);
              }
            } else {
              const prop = inner.replace(/['"]/g, '');
              if (prop in item) {
                nextCandidates.push(item[prop]);
              }
            }
          } else {
            if (token in item) {
              nextCandidates.push(item[token]);
            }
          }
        });
        
        current = nextCandidates;
        tokenIdx++;
      }
    }

    let finalResult: any = current;
    if (current.length === 1) {
      finalResult = current[0];
    } else if (current.length === 0) {
      finalResult = [];
    }
    
    return { success: true, data: finalResult };
  } catch (err: any) {
    return { success: false, data: null, error: err.message || 'Error executing JSONPath' };
  }
}
