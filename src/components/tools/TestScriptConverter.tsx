import React, { useState, useEffect } from 'react';
import ToolLayout, { CopyButton } from '../ui/ToolLayout';
import CodeEditor from '../ui/Editor';
import { Settings } from 'lucide-react';

type Framework = 'cypress' | 'playwright';

export default function TestScriptConverter() {
  const [input, setInput] = useState('{\n  "status": 200,\n  "data": {\n    "user": {\n      "id": 123,\n      "name": "Jane Doe",\n      "isActive": true\n    }\n  }\n}');
  const [output, setOutput] = useState('');
  const [framework, setFramework] = useState<Framework>('playwright');
  const [error, setError] = useState<string | null>(null);

  const generateAssertions = (obj: any, prefix: string, fw: Framework): string[] => {
    let assertions: string[] = [];
    if (obj === null) {
      if (fw === 'cypress') assertions.push(`    expect(${prefix}).to.be.null;`);
      else assertions.push(`    expect(${prefix}).toBeNull();`);
    } else if (typeof obj === 'string') {
      if (fw === 'cypress') assertions.push(`    expect(${prefix}).to.eq('${obj}');`);
      else assertions.push(`    expect(${prefix}).toBe('${obj}');`);
    } else if (typeof obj === 'number' || typeof obj === 'boolean') {
      if (fw === 'cypress') assertions.push(`    expect(${prefix}).to.eq(${obj});`);
      else assertions.push(`    expect(${prefix}).toBe(${obj});`);
    } else if (Array.isArray(obj)) {
      if (fw === 'cypress') {
        assertions.push(`    expect(${prefix}).to.be.an('array');`);
        assertions.push(`    expect(${prefix}).to.have.length(${obj.length});`);
      } else {
        assertions.push(`    expect(Array.isArray(${prefix})).toBeTruthy();`);
        assertions.push(`    expect(${prefix}.length).toBe(${obj.length});`);
      }
      if (obj.length > 0) {
        assertions = assertions.concat(generateAssertions(obj[0], `${prefix}[0]`, fw));
      }
    } else if (typeof obj === 'object') {
      for (const [key, value] of Object.entries(obj)) {
        assertions = assertions.concat(generateAssertions(value, `${prefix}.${key}`, fw));
      }
    }
    return assertions;
  };

  const convertToScript = () => {
    if (!input.trim()) {
      setOutput('');
      setError(null);
      return;
    }
    try {
      const parsed = JSON.parse(input);
      setError(null);
      
      const assertions = generateAssertions(parsed, 'responseBody', framework);
      let script = '';
      
      if (framework === 'playwright') {
        script = `import { test, expect } from '@playwright/test';

test('API Response Validation', async ({ request }) => {
  const response = await request.get('https://api.example.com/endpoint');
  expect(response.ok()).toBeTruthy();
  
  const responseBody = await response.json();
  
${assertions.join('\\n')}
});`;
      } else if (framework === 'cypress') {
        script = `describe('API Response Validation', () => {
  it('should validate response structure', () => {
    cy.request('GET', 'https://api.example.com/endpoint').then((response) => {
      expect(response.status).to.eq(200);
      const responseBody = response.body;
      
${assertions.join('\\n')}
    });
  });
});`;
      }
      
      setOutput(script);
    } catch (err) {
      setError((err as Error).message);
      setOutput('');
    }
  };

  useEffect(() => {
    convertToScript();
  }, [input, framework]);

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError(null);
  };

  return (
    <ToolLayout 
      title="Test Script Converter" 
      description="Convert JSON responses into ready-to-use Playwright or Cypress automation assertions."
      onClear={handleClear}
      actions={
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 mr-2 bg-bg-header px-2 py-1 rounded border border-border-subtle">
            <Settings size={12} className="text-text-secondary" />
            <select 
              className="bg-transparent text-[10px] text-text-main outline-none"
              value={framework}
              onChange={(e) => setFramework(e.target.value as Framework)}
            >
              <option value="playwright">Playwright</option>
              <option value="cypress">Cypress</option>
            </select>
          </div>
          <CopyButton text={output} />
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
        <div className="flex flex-col gap-2 h-full min-h-0">
          <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">JSON Response Sample</label>
          <CodeEditor 
            value={input} 
            onChange={setInput} 
            language="json" 
            placeholder="Paste your API JSON response here..."
            error={error}
          />
        </div>

        <div className="flex flex-col gap-2 h-full min-h-0">
          <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">Generated {framework === 'playwright' ? 'Playwright' : 'Cypress'} Script</label>
          <CodeEditor 
            value={output} 
            onChange={() => {}} 
            language={framework === 'playwright' ? 'typescript' : 'javascript'} 
            readOnly 
            placeholder="Generated test script will appear here..."
          />
        </div>
      </div>
    </ToolLayout>
  );
}
