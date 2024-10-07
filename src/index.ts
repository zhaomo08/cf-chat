import { Ai } from '@cloudflare/ai'
import { Hono } from 'hono'

export interface Env {
  AI: any
}

const app = new Hono<{ Bindings: Env }>()

// HTML 页面，提供用户输入的问答框
const htmlPage = `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>AI问答</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          // background-color: #f4f4f4;
          background-color: #87CEEB; /* 天蓝色 */

        }
        h1 {
          color: #333;
        }
        form {
          margin-bottom: 20px;
        }
        button {
          padding: 10px 20px;
          font-size: 16px;
        }
        .response {
          margin-top: 20px;
          padding: 10px;
          background-color: #fff;
          border-radius: 5px;
          box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
        }
      </style>
    </head>
    <body>
      <h1>AI 问答助手</h1>
      <form action="/" method="get">
        <div style="display: flex; align-items: center;">
          <textarea name="query" rows="4" cols="60" placeholder="输入你的问题..." required style="flex: 1; margin-right: 10px;"></textarea>
          <button type="submit">提交</button>
        </div>
     </form>
      
      <div class="response">
        <p><strong>回答:</strong> {{response}}</p>
      </div>
    </body>
  </html>
`;

// GET / 显示页面并处理AI响应
app.get("/", async (c) => {
  const query = c.req.query("query") || "Introduce a random global city";

  // 如果用户提交了问题，调用AI接口
  let aiResponse = '';
  if (query) {
    const ai = new Ai(c.env.AI);
    const messages = [
      { role: 'system', content: 'You are a friendly assistant' },
      { role: 'user', content: query }
    ];

    const inputs = { messages };
    const res = await ai.run("@cf/meta/llama-3-8b-instruct", inputs);

    console.log("AI Response:", res);

    // 根据返回结果中的response字段解析AI的回答
    aiResponse = res?.response || 'AI 暂时无法回答你的问题';


  }

  // 用回答填充 HTML 页面
  const responsePage = htmlPage.replace('{{response}}', aiResponse);

  return c.html(responsePage);
});

export default app;