"use client";
import React from "react";
require("dotenv").config();

function MainComponent() {
  const [input, setInput] = React.useState("");
  const [result, setResult] = React.useState("");
  const [isListening, setIsListening] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [history, setHistory] = React.useState([]);
  const [error, setError] = React.useState("");

  const recognition = React.useRef(null);

  React.useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      recognition.current.lang = "en-US";

      recognition.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognition.current.onerror = (event) => {
        setError("Voice recognition error: " + event.error);
        setIsListening(false);
      };

      recognition.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const startListening = () => {
    if (recognition.current) {
      setError("");
      setIsListening(true);
      recognition.current.start();
    } else {
      setError("Voice recognition not supported in this browser");
    }
  };

  const stopListening = () => {
    if (recognition.current) {
      recognition.current.stop();
      setIsListening(false);
    }
  };

  const processWithAI = async (question) => {
    setIsProcessing(true);
    setError("");

    try {
      if (/^[\d\s+\-*/().^%]+$/.test(question.replace(/[×÷]/g, ""))) {
        try {
          const mathResult = eval(
            question.replace(/×/g, "*").replace(/÷/g, "/")
          );
          const response = `**Problem:** ${question}\n**Calculation:** ${question} = ${mathResult}\n**Final Answer:** ${mathResult}`;
          setResult(response);
          setHistory((prev) => [
            ...prev,
            { question, answer: response, timestamp: new Date() },
          ]);
          return;
        } catch (mathError) {}
      }

      const messages = [
        { 
          role: "system",
          content: `You are Manav's AI, an advanced AI calculator that can solve mathematical problems, answer questions with reasoning, and provide step-by-step explanations. 

Rules:
1. For mathematical calculations, show your work step by step
2. Always explain your reasoning process
3. Format your response clearly with steps and final answer
4. For complex problems, break them down into smaller parts
5. Talk in the language of the question
6. Use markdown formatting for clarity

Provide your response in this format:
**Problem:** [restate the problem]
**Reasoning:** [explain your approach and steps]
**Calculation/Analysis:** [show work or analysis]
**Final Answer:** [clear, concise answer]`,
        },
        {
          role: "user",
          content: question,
        },
      ];

      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          },
          body: JSON.stringify({
            model: "z-ai/glm-4.5-air:free",
            messages,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`AI processing failed: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse =
        data.choices?.[0]?.message?.content || "No response received";

      setResult(aiResponse);
      setHistory((prev) => [
        ...prev,
        { question, answer: aiResponse, timestamp: new Date() },
      ]);
    } catch (error) {
      console.error("Processing error:", error);
      setError("Failed to process your question. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      processWithAI(input.trim());
    }
  };

  const clearAll = () => {
    setInput("");
    setResult("");
    setError("");
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Manav's AI Voice Calculator
          </h1>
          <p className="text-gray-600">
            Ask any question - math, science, or general knowledge with AI
            reasoning
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything: '2+2', 'What is the square root of 144?', 'Explain photosynthesis', etc."
                className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
                rows="3"
              />
              <div className="absolute right-2 top-2 flex gap-2">
                <button
                  type="button"
                  onClick={isListening ? stopListening : startListening}
                  className={`p-2 rounded-full ${
                    isListening
                      ? "bg-red-500 text-white animate-pulse"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  } transition-colors`}
                  title={isListening ? "Stop listening" : "Start voice input"}
                >
                  <i
                    className={`fas ${
                      isListening ? "fa-stop" : "fa-microphone"
                    }`}
                  ></i>
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <NewComponent
                type="submit"
                disabled={isProcessing || !input.trim()}
                onClick={handleSubmit}
                isProcessing={isProcessing}
              />
              <button
                type="button"
                onClick={clearAll}
                className="bg-gray-500 text-white py-3 px-6 rounded-lg hover:bg-gray-600 transition-colors"
              >
                <i className="fas fa-eraser mr-2"></i>
                Clear
              </button>
            </div>
          </form>

          {isListening && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <div className="flex items-center">
                <i className="fas fa-microphone text-blue-500 mr-2"></i>
                <span className="text-blue-700">
                  Listening... Speak your question now
                </span>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
              <div className="flex items-center">
                <i className="fas fa-exclamation-triangle text-red-500 mr-2"></i>
                <span className="text-red-700">{error}</span>
              </div>
            </div>
          )}
        </div>

        {result && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <i className="fas fa-brain text-blue-500 mr-2"></i>
              Manav's AI Analysis & Result
            </h3>
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {result}
              </div>
            </div>
          </div>
        )}

        {history.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                <i className="fas fa-history text-green-500 mr-2"></i>
                Calculation History
              </h3>
              <button
                onClick={clearHistory}
                className="text-red-500 hover:text-red-700 transition-colors"
              >
                <i className="fas fa-trash mr-1"></i>
                Clear History
              </button>
            </div>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {history
                .slice()
                .reverse()
                .map((item, index) => (
                  <div
                    key={index}
                    className="border-l-4 border-gray-200 pl-4 py-2"
                  >
                    <div className="text-sm text-gray-500 mb-1">
                      {item.timestamp.toLocaleString()}
                    </div>
                    <div className="font-medium text-gray-800 mb-2">
                      Q: {item.question}
                    </div>
                    <div className="text-gray-600 text-sm whitespace-pre-wrap">
                      {item.answer}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Features</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="flex items-start">
              <i className="fas fa-microphone text-blue-500 mr-2 mt-1"></i>
              <div>
                <strong>Voice Input:</strong> Click the microphone to speak your
                questions
              </div>
            </div>
            <div className="flex items-start">
              <i className="fas fa-brain text-purple-500 mr-2 mt-1"></i>
              <div>
                <strong>AI Reasoning:</strong> Get step-by-step explanations for
                complex problems
              </div>
            </div>
            <div className="flex items-start">
              <i className="fas fa-calculator text-orange-500 mr-2 mt-1"></i>
              <div>
                <strong>Multi-Purpose:</strong> Math, science, general
                knowledge, and word problems
              </div>
            </div>
            <div className="flex items-start">
              <i className="fas fa-history text-green-500 mr-2 mt-1"></i>
              <div>
                <strong>History:</strong> Keep track of all your calculations
                and questions
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainComponent;