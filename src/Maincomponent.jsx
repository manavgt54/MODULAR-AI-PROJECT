import { useState } from 'react';

export default function MainComponent() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();

    const result = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-or-v1-' ,
      },
      body: JSON.stringify({
        model: 'z-ai/glm-4.5-air:free',
        messages: [
          { role: 'user', content: input },
        ],
      }),
    });

    const data = await result.json();
    setResponse(data.choices?.[0]?.message?.content || 'No response');
  }

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask something..."
          className="border p-2 rounded"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Ask
        </button>
      </form>
      <div className="mt-4 p-2 border rounded bg-gray-100">
        {response}
      </div>
    </div>
  );
}
