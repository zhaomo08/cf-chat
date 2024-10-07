import { Ai } from '@cloudflare/ai'
import { Hono } from 'hono'

export interface Env {
  AI: any
}

const app = new Hono<{ Bindings: Env }>()

const htmlPage = `
  <!DOCTYPE html>
  <html lang="zh-CN">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>AI问答</title>
      <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          background-color: #f0f8ff;
          color: #333;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          background-color: #fff;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
        }
        h1 {
          color: #2c3e50;
          text-align: center;
          margin-bottom: 30px;
        }
        form {
          margin-bottom: 30px;
        }
        textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 5px;
          resize: vertical;
        }
        button {
          display: block;
          width: 100%;
          padding: 10px;
          background-color: #3498db;
          color: #fff;
          border: none;
          border-radius: 5px;
          font-size: 16px;
          cursor: pointer;
          transition: background-color 0.3s;
        }
        button:hover {
          background-color: #2980b9;
        }
        .response {
          margin-top: 30px;
          padding: 20px;
          background-color: #f9f9f9;
          border-radius: 5px;
          border-left: 5px solid #3498db;
        }
        #loading {
          display: none;
          text-align: center;
          margin-top: 20px;
          font-style: italic;
          color: #7f8c8d;
        }
        #aiResponse {
          line-height: 1.6;
        }
        #aiResponse h1, #aiResponse h2, #aiResponse h3, #aiResponse h4, #aiResponse h5, #aiResponse h6 {
          margin-top: 20px;
          margin-bottom: 10px;
          color: #2c3e50;
        }
        #aiResponse ul, #aiResponse ol {
          padding-left: 20px;
        }
        #aiResponse code {
          background-color: #f0f0f0;
          padding: 2px 4px;
          border-radius: 4px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>AI 问答助手</h1>
        <form id="queryForm">
          <textarea name="query" rows="4" placeholder="输入你的问题..." required></textarea>
          <button type="submit">提交问题</button>
        </form>
        
        <div id="loading">正在思考中，请稍候...</div>
        <div id="responseContainer" class="response" style="display: none;">
          <h3>AI 回答：</h3>
          <div id="aiResponse"></div>
        </div>
      </div>
      
      <script>
        const form = document.getElementById('queryForm');
        const loadingDiv = document.getElementById('loading');
        const responseContainer = document.getElementById('responseContainer');
        const aiResponseElement = document.getElementById('aiResponse');

        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const query = form.query.value;
          
          loadingDiv.style.display = 'block';
          responseContainer.style.display = 'none';
          
          try {
            const response = await fetch('/?query=' + encodeURIComponent(query));
            const data = await response.json();
            
            loadingDiv.style.display = 'none';
            responseContainer.style.display = 'block';
            aiResponseElement.innerHTML = marked.parse(data.response);
          } catch (error) {
            console.error('Error:', error);
            loadingDiv.style.display = 'none';
            responseContainer.style.display = 'block';
            aiResponseElement.textContent = '抱歉，获取回答时出现错误。请稍后再试。';
          }
        });
      </script>
    </body>
  </html>
`;

app.get("/", async (c) => {
  const query = c.req.query("query");

  if (!query) {
    return c.html(htmlPage);
  }

  const ai = new Ai(c.env.AI);
  const messages = [
    { role: 'system', content: 'You are a friendly assistant. Please provide detailed answers and use Markdown formatting for better readability. Ensure your response is complete and not truncated.' },
    { role: 'user', content: query }
  ];

  const inputs = { messages };
  const res = await ai.run("@cf/meta/llama-2-7b-chat-int8", inputs);

  console.log("AI Response:", res);

  const aiResponse = res?.response || 'AI 暂时无法回答你的问题';

  return c.json({ response: aiResponse });
});

export default app;