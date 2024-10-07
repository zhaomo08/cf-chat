export default {
  async fetch(request, env) {
    const tasks = [];

    // prompt - simple completion style input
    let simple = {
      prompt: 'Tell me a joke about Cloudflare'
    };
    let response = await env.AI.run('@cf/meta/llama-3-8b-instruct', simple);
    tasks.push({ inputs: simple, response });

    // messages - chat style input
    let chat = {
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Who won the world series in 2020?' }
      ]
    };
    response = await env.AI.run('@cf/meta/llama-3-8b-instruct', chat);
    tasks.push({ inputs: chat, response });

    return Response.json(tasks);
  }
};