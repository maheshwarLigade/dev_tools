import { useState } from 'react';
import ToolLayout, { CopyButton } from '../ui/ToolLayout';
import CodeEditor from '../ui/Editor';

export default function CurlToCode() {
  const [input, setInput] = useState('curl -X POST https://api.example.com/v1/users \\\n  -H "Authorization: Bearer YOUR_TOKEN" \\\n  -H "Content-Type: application/json" \\\n  -d \'{"name": "John Doe", "email": "john@example.com"}\'');
  const [output, setOutput] = useState('');
  const [lang, setLang] = useState<'fetch' | 'axios' | 'node-native' | 'python' | 'go' | 'php'>('fetch');

  const convert = () => {
    if (!input.trim()) return;

    // Improved cURL parser
    const parseCurl = (cmd: string) => {
      const result = {
        url: 'https://api.example.com',
        method: 'GET',
        headers: {} as Record<string, string>,
        data: null as string | null
      };

      // Extract URL
      const urlMatches = cmd.match(/(?:https?:\/\/[^\s'"]+)/);
      if (urlMatches) result.url = urlMatches[0];

      // Extract Method
      const methodMatches = cmd.match(/(?:-X|--request)\s+(\w+)/);
      if (methodMatches) result.method = methodMatches[1].toUpperCase();

      // Extract Headers
      const headerMatches = cmd.matchAll(/(?:-H|--header)\s+["']([^"']+)["']/g);
      for (const match of headerMatches) {
        const [key, val] = match[1].split(/:(.+)/);
        if (key && val) result.headers[key.trim()] = val.trim();
      }

      // Extract Data
      const dataMatches = cmd.match(/(?:-d|--data|--data-raw)\s+['"]([\s\S]*?)['"](?=\s+--|\s+-|$)/);
      if (dataMatches) {
        result.data = dataMatches[1];
        if (result.method === 'GET') result.method = 'POST'; // Default for -d
      }

      return result;
    };

    const { url, method, headers, data } = parseCurl(input);

    let code = '';
    if (lang === 'fetch') {
      code = `fetch("${url}", {
  method: "${method}",
  headers: ${JSON.stringify(headers, null, 2)},
  ${data ? `body: JSON.stringify(${data})` : ''}
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error(error));`;
    } else if (lang === 'axios') {
      code = `import axios from 'axios';

axios({
  method: '${method.toLowerCase()}',
  url: '${url}',
  headers: ${JSON.stringify(headers, null, 2)},
  ${data ? `data: ${data}` : ''}
})
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error(error);
  });`;
    } else if (lang === 'node-native') {
      code = `const http = require('${url.startsWith('https') ? 'https' : 'http'}');

const options = {
  method: '${method}',
  headers: ${JSON.stringify(headers, null, 2)}
};

const req = http.request('${url}', options, (res) => {
  let chunks = [];

  res.on('data', (chunk) => {
    chunks.push(chunk);
  });

  res.on('end', () => {
    const body = Buffer.concat(chunks);
    console.log(body.toString());
  });
});

${data ? `req.write(JSON.stringify(${data}));` : ''}
req.end();`;
    } else if (lang === 'python') {
      code = `import requests

url = "${url}"
headers = ${JSON.stringify(headers, null, 4)}
${data ? `json_data = ${data}` : ''}

response = requests.${method.toLowerCase()}(
    url, 
    headers=headers${data ? ',\n    json=json_data' : ''}
)

print(response.json())`;
    } else if (lang === 'go') {
       code = `package main

import (
    "bytes"
    "fmt"
    "io"
    "net/http"
)

func main() {
    url := "${url}"
    ${data ? `payload := []byte(\`${data}\`)` : ''}

    req, _ := http.NewRequest("${method}", url, ${data ? `bytes.NewBuffer(payload)` : 'nil'})
    
    ${Object.entries(headers).map(([k, v]) => `req.Header.Set("${k}", "${v}")`).join('\n    ')}

    client := &http.Client{}
    resp, _ := client.Do(req)
    defer resp.Body.Close()

    body, _ := io.ReadAll(resp.Body)
    fmt.Println("Response Status:", resp.Status)
    fmt.Println("Response Body:", string(body))
}`;
    } else if (lang === 'php') {
      code = `<?php
$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, '${url}');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, '${method}');
${Object.keys(headers).length > 0 ? `
$headers = [
    ${Object.entries(headers).map(([k, v]) => `'${k}: ${v}'`).join(',\n    ')}
];
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);` : ''}
${data ? `
curl_setopt($ch, CURLOPT_POSTFIELDS, '${data}');` : ''}

$response = curl_exec($ch);
curl_close($ch);

echo $response;`;
    }

    setOutput(code);
  };

  return (
    <ToolLayout
      title="cURL to Code"
      description="Convert cURL commands to Fetch, Axios, Python, or Go code."
      onClear={() => { setInput(''); setOutput(''); }}
      actions={
        <div className="flex items-center gap-2">
          <select 
            value={lang}
            onChange={(e) => setLang(e.target.value as any)}
            className="bg-bg-header border border-border-subtle rounded py-1 px-2 text-xs text-text-secondary outline-none mr-2"
          >
            <option value="fetch">JavaScript (Fetch)</option>
            <option value="axios">JavaScript (Axios)</option>
            <option value="node-native">Node.js (Native)</option>
            <option value="python">Python (Requests)</option>
            <option value="go">Go (Native)</option>
            <option value="php">PHP (cURL)</option>
          </select>
          <button 
            onClick={convert}
            className="px-3 py-1.5 rounded-md bg-brand hover:bg-brand/90 text-white text-xs transition-colors shadow-lg shadow-brand/20"
          >
            Generate Code
          </button>
          <CopyButton text={output} />
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
        <div className="flex flex-col gap-2 h-full min-h-0">
          <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">cURL Command</label>
          <CodeEditor
            value={input}
            onChange={setInput}
            language="bash"
            placeholder="curl https://api.example.com..."
          />
        </div>
        <div className="flex flex-col gap-2 h-full min-h-0">
          <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">Generated Code</label>
          <CodeEditor
            value={output}
            onChange={() => {}}
            language={lang === 'python' ? 'python' : lang === 'go' ? 'go' : 'javascript'}
            readOnly
            placeholder="Code will appear here..."
          />
        </div>
      </div>
    </ToolLayout>
  );
}
